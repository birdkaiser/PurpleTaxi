import { DispatchMessageFn, Message, ServiceAvailableMessage, ServiceStoppedMessage } from "./messages";
import { MainWindow } from "./GUI/MainWindow";
import { DebugFn, Destination, Warlock, PurpleTaxiDb } from "./types";
import { PartyMonitor } from "./PartyMonitor";
import { ListedParty } from "./ListedParty";
import { getRaidLeadership } from "./PartyUtils";

export interface StateOptions {
    readonly DB: AceDb<PurpleTaxiDb>;
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly rangeChecker: RangeCheckerFn;
    readonly dispatchMessage: DispatchMessageFn;
    readonly debug: DebugFn;
}

interface DispatchServiceAvailabilityNotificationArgs {
    readonly realZoneText: string;
    readonly subZoneText: string;
    readonly soulShardsRemaining: number;
}

export class State {
    private readonly DB: AceDb<PurpleTaxiDb>;
    private readonly L: PurpleTaxiTranslationKeys;
    private readonly AceGUI: AceGuiLibStub;
    private readonly characterName: string;
    private readonly dispatchMessage: DispatchMessageFn;
    private readonly debug: DebugFn;
    private readonly partyMonitor: PartyMonitor;
    private mainWindow: MainWindow | null = null;
    private rangeChecker: RangeCheckerFn;
    private isWarlockWithSummonSpell: boolean;
    private warlocksInService: { [k in string]: Warlock; };
    private nearbyClickerNames: ReadonlyArray<string>;
    private isInService: boolean;
    private leaderName: string;
    private partyGuid: string | null;
    private listedParty: ListedParty | null;

    constructor(options: StateOptions) {
        const { debug } = options;

        // The player's class won't change, so we can discover this once on initialization.
        const [, englishClass] = UnitClass("player");
        this.characterName = GetUnitName("player", false);

        this.isWarlockWithSummonSpell = englishClass == "WARLOCK" && UnitLevel("player") >= 20;

        this.DB = options.DB;
        this.AceGUI = options.AceGUI;
        this.L = options.L;
        this.dispatchMessage = options.dispatchMessage;
        this.debug = debug;
        this.rangeChecker = options.rangeChecker;
        this.warlocksInService = {};
        this.nearbyClickerNames = [];
        this.isInService = false;
        this.leaderName = this.characterName;
        this.partyMonitor = new PartyMonitor({ debug });
        this.partyGuid = null;
        this.listedParty = null;

        const f = CreateFrame("Frame");
        f.RegisterEvent("GROUP_JOINED");
        f.SetScript("OnEvent", (_frame, eventName, ...eventArgs: unknown[]) => {
            if (eventName === "GROUP_JOINED") {
                const partyGuid = eventArgs[1] as string;
                this.partyGuid = partyGuid;
                this.debug(`party joined: ${eventArgs[0]}, ${eventArgs[1]}`);
            }
        });

        this.updateLeaderName();

        if (this.isWarlockWithSummonSpell) {
            this.startWarlockTicker();
        }
    }

    public startWarlockTicker(): void {
        C_Timer.NewTicker(10, () => {
            try {
                if (this.isInService) {
                    this.updateNearbyClickers();
                }
            } catch (x) {
                this.debug(x);
            }
        });
    }

    public toggleMainWindow(): void {
        if (this.mainWindow) {
            this.mainWindow.destroy();
        } else {
            this.mainWindow = new MainWindow({
                partyMonitor: this.partyMonitor,
                AceGUI: this.AceGUI,
                L: this.L,
                debug: this.debug,
                didClose: () => {
                    this.mainWindow = null;
                },
                isWarlockWithSummonSpell: this.isWarlockWithSummonSpell,
                startService: () => {
                    this.isInService = true;
                    this.updateNearbyClickers();
                },
                stopService: () => {
                    this.isInService = false;
                    this.dispatchMessage(["GUILD"], {
                        type: "serviceStopped",
                        characterName: this.characterName,
                    });
                },
            });
            this.updateSummonersUi();
        }
    }

    public handleMessage(msg: Message): boolean {
        if (msg.type === "serviceAvailable") {
            this.handleServiceAvailableMessage(msg);
        } else if (msg.type === "serviceStopped") {
            this.handleServiceStoppedMessage(msg);
        } else if (msg.type === "partyListed") {
            this.partyMonitor.handlePartyListedMessage(msg);
        } else if (msg.type === "partyDelisted") {
            this.partyMonitor.handlePartyDelistedMessage(msg);
        } else {
            return false;
        }
        return true;
    }

    public listParty(): void {
        if (!IsInGroup("LE_PARTY_CATEGORY_HOME")) {
            print("You cannot list your group because you are not currently in one.");
            return;

        }

        const { characterName, partyGuid } = this;
        if (!partyGuid) {
            print("Cannot list this party as the ID is unknown. Try leaving the group and re-joining.");
            return;
        }

        const leadership = getRaidLeadership();
        if (leadership.leaderName !== characterName && !leadership.assistantNames.includes(characterName)) {
            print("Cannot list this party as you are not the party leader or assistant.");
            return;
        }

        const listedParty = new ListedParty({
            partyGuid
        });
        this.listedParty = listedParty;

        this.dispatchMessage(["GUILD"], {
            type: "partyListed",
            partyGuid,
            leaderName: leadership.leaderName,
            description: "",
            assistantNames: leadership.assistantNames,
            summonDestinations: [],
        });
    }

    public delistParty(): void {
        const { characterName, partyGuid } = this;
        if (!partyGuid) {
            print("Cannot list this party as the ID is unknown. Try leaving the group and re-joining.");
            return;
        }

        const leadership = getRaidLeadership();
        if (leadership.leaderName !== characterName && !leadership.assistantNames.includes(characterName)) {
            print("Cannot delist this party as you are not the party leader or assistant.");
            return;
        }

        this.dispatchMessage(["GUILD"], {
            type: "partyDelisted",
            partyGuid,
        });
    }

    private updateLeaderName(): void {
        let i = 0;
        while (i < 40) {
            const [raidMemberName] = GetRaidRosterInfo(i + 1);
            if (!raidMemberName) {
                break;
            }
            if (UnitIsGroupLeader(`raid${i+1}`)) {
                this.leaderName = raidMemberName;
                return;
            }

            i++;
        }

        this.leaderName = this.characterName; // We couldn't find an actual leader, so default it to this character's name.
    }

    private updateNearbyClickers(): void {
        if (!this.isInService) {
            return;
        }

        const { characterName, rangeChecker } = this;
        const clickersInRange: string[] = [];
        let i = 0;
        let clickersHaveChanged = false;
        while (i < 40) {
            const [raidMemberName, /* rank */, /* grp */, /* level */, /* klass */, /* fileName */, /* zone */, isOnline, isDead] = GetRaidRosterInfo(i + 1);
            if (!raidMemberName) {
                break;
            }

            if (raidMemberName !== characterName) {
                // Our own warlock doesn't count as a clicker.
                if (isOnline && !isDead && rangeChecker(`raid${i+1}`)) {
                    if (!clickersInRange.some(c => c === raidMemberName)) {
                        // We didn't know about this clicker before, so we have to send an update.
                        clickersHaveChanged = true;
                    }
                    clickersInRange.push(raidMemberName);
                } else {
                    if (clickersInRange.some(c => c === raidMemberName)) {
                        // One of our previously known clickers is no longer in range, so we have to send an update.
                        clickersHaveChanged = true;
                    }
                }
            }
            i++;
        }

        this.debug(`clickers in range: ${clickersInRange.reduce((p, n) => p === "" ? n : `${p}, ${n}`, "")}`);

        if (clickersHaveChanged) {
            this.nearbyClickerNames = clickersInRange;
        }
        this.sendServiceAvailabilityNotification();
    }

    private sendServiceAvailabilityNotification(): void {
        // TODO: Watch these values for changes and re-send the notification if they change.
        const realZoneText = GetRealZoneText();
        const subZoneText = GetSubZoneText();
        const soulShardsRemaining = GetItemCount("Soul Shard", false);
        this.dispatchServiceAvailabilityNotification({
            realZoneText,
            subZoneText,
            soulShardsRemaining,
        });
    }

    private dispatchServiceAvailabilityNotification(args: DispatchServiceAvailabilityNotificationArgs): void {
        this.dispatchMessage(["GUILD"], {
            type: "serviceAvailable",
            characterName: this.characterName,
            realZoneText: args.realZoneText,
            subZoneText: args.subZoneText,
            leaderName: this.leaderName,
            soulShardsRemaining: args.soulShardsRemaining,
            clickers: this.nearbyClickerNames,
        });
    }

    private handleServiceAvailableMessage(msg: ServiceAvailableMessage): void {
        this.debug(`${msg.characterName} is summoning to ${msg.subZoneText} (${msg.realZoneText}) with ${msg.soulShardsRemaining} shards remaining.`);

        let warlock = this.warlocksInService[msg.characterName];
        if (!warlock) {
            // This warlock wasn't known about before. Update the UI.
            this.warlocksInService[msg.characterName] = warlock = {
                characterName: msg.characterName,
                realZoneText: msg.realZoneText,
                subZoneText: msg.subZoneText,
                soulShardsRemaining: msg.soulShardsRemaining,
                nearbyClickers: msg.clickers,
            };
            this.updateSummonersUi();
        } else if (
            warlock.realZoneText !== msg.realZoneText ||
            warlock.subZoneText !== msg.subZoneText ||
            warlock.soulShardsRemaining !== msg.soulShardsRemaining ||
            msg.clickers.some(c => !warlock.nearbyClickers.includes(c)) ||
            warlock.nearbyClickers.some(c => !msg.clickers.includes(c))
        ) {
            // The warlocks properties, such as their location or shards, have updated. Update the UI.
            warlock.realZoneText = msg.realZoneText;
            warlock.subZoneText = msg.subZoneText;
            warlock.soulShardsRemaining = msg.soulShardsRemaining;
            warlock.nearbyClickers = msg.clickers;

            this.updateSummonersUi();
        }
    }

    private handleServiceStoppedMessage(msg: ServiceStoppedMessage): void {
        this.debug(`${msg.characterName} is no longer summoning.`);

        const warlock = this.warlocksInService[msg.characterName];
        if (warlock) {
            this.debug(`Removing warlock: ${msg.characterName}`);
            delete this.warlocksInService[msg.characterName];
            this.updateSummonersUi();
        }
    }

    private updateSummonersUi(): void {
        if (this.mainWindow) {
            const destinationsByLocation: { [k in string]: Destination; } = {};

            for (const k in this.warlocksInService) {
                const warlock = this.warlocksInService[k];
                const destinationName = warlock.subZoneText === "" ? warlock.realZoneText : `${warlock.subZoneText} (${warlock.realZoneText})`;

                let destination = destinationsByLocation[destinationName];
                if (!destination) {
                    destination = {
                        realZoneText: warlock.realZoneText,
                        subZoneText: warlock.subZoneText,
                        warlocks: [],
                        clickers: [],
                    }
                    destinationsByLocation[destinationName] = destination;
                }

                destination.warlocks.push({
                    characterName: warlock.characterName,
                    soulShardsRemaining: warlock.soulShardsRemaining,
                });

                for (const clicker of warlock.nearbyClickers) {
                    if (!destination.clickers.some(c => c.characterName === clicker)) {
                        destination.clickers.push({
                            characterName: clicker,
                        });
                    }
                }
            }

            this.mainWindow.updateDestinations(destinationsByLocation);
        }
    }
}
