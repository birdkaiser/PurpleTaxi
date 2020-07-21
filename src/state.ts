import { DispatchMessageFn, Message, ServiceAvailableMessage, ServiceStoppedMessage } from "./messages";
import { MainWindow } from "./GUI/MainWindow";
import { DebugFn, Destination, Warlock } from "./types";

export interface StateOptions {
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
    private readonly L: PurpleTaxiTranslationKeys;
    private readonly AceGUI: AceGuiLibStub;
    private readonly characterName: string;
    private readonly dispatchMessage: DispatchMessageFn;
    private readonly debug: DebugFn;
    private mainWindow: MainWindow | null = null;
    private rangeChecker: RangeCheckerFn;
    private isWarlockWithSummonSpell: boolean;
    private warlocksInService: { [k in string]: Warlock; };
    private nearbyClickerNames: ReadonlyArray<string>;
    private isInService: boolean;

    constructor(options: StateOptions) {
        // The player's class won't change, so we can discover this once on initialization.
        const [, englishClass] = UnitClass("player");
        this.characterName = GetUnitName("player", false);

        this.isWarlockWithSummonSpell = englishClass == "WARLOCK" && UnitLevel("player") >= 20;

        this.AceGUI = options.AceGUI;
        this.L = options.L;
        this.dispatchMessage = options.dispatchMessage;
        this.debug = options.debug;
        this.rangeChecker = options.rangeChecker;
        this.warlocksInService = {};
        this.nearbyClickerNames = [];
        this.isInService = false;

        if (this.isWarlockWithSummonSpell) {
            this.startWarlockTicker();
        }
    }

    public startWarlockTicker(): void {
        C_Timer.NewTicker(10, () => {
            try {
                if (this.updateNearbyClickers()) {
                    this.sendServiceAvailabilityNotification();
                }
            } catch (x) {
                this.debug(x);
            }
        });
    }

    public toggleMainWindow(): void {
        if (this.mainWindow) {
            this.mainWindow.releaseMainWindow();
        } else {
            this.mainWindow = new MainWindow({
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
                    this.sendServiceAvailabilityNotification();
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
        } else {
            return false;
        }
        return true;
    }

    private updateNearbyClickers(): boolean {
        if (!this.isInService) {
            return false;
        }

        const { characterName, rangeChecker } = this;
        const clickersInRange: string[] = [];
        let i = 0;
        let clickersHaveChanged = false;
        this.debug(`I am ${characterName}.`);
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
            this.debug("updating clickers in range");
            this.nearbyClickerNames = clickersInRange;
        }

        return clickersHaveChanged;
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
        } else if (warlock.realZoneText !== msg.realZoneText || warlock.subZoneText !== msg.subZoneText || warlock.soulShardsRemaining !== msg.soulShardsRemaining) {
            // The warlocks properties, such as their location or shards, have updated. Update the UI.
            warlock.realZoneText = msg.realZoneText;
            warlock.subZoneText = msg.subZoneText;
            warlock.soulShardsRemaining = msg.soulShardsRemaining;

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
