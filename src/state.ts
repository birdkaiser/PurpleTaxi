import * as wow from "@wartoshika/wow-classic-declarations";
import { DispatchMessageFn, Message, ServiceAvailableMessage, ServiceStoppedMessage } from "./messages";
const AceGUI = LibStub("AceGUI-3.0");
const L = LibStub("AceLocale-3.0").GetLocale<PurpleTaxiTranslationKeys>("PurpleTaxi", true);

// TODO: These typings are missing from wow-classic-declarations.
declare function GetRealZoneText(): string;
declare function GetSubZoneText(): string;

type DebugFn = (msg: string) => void

interface ServiceUiOptions {
    readonly notifyServiceAvailable: (notice: ServiceAvailabilityNotice) => void;
    readonly notifyServiceStopped: () => void;
    readonly mainWindowFrame: GuiFrame;
}

class ServiceUi {
    private inService: boolean;
    private realZoneText: string;
    private subZoneText: string;
    private serviceLabel: GuiLabel;
    private toggleServiceButton: GuiButton;
    readonly notifyServiceAvailable: (notice: ServiceAvailabilityNotice) => void;
    readonly notifyServiceStopped: () => void;

    constructor(options: ServiceUiOptions) {
        this.notifyServiceAvailable = options.notifyServiceAvailable;
        this.notifyServiceStopped = options.notifyServiceStopped;

        const group = AceGUI.Create("InlineGroup");
        group.SetRelativeWidth(1);
        options.mainWindowFrame.AddChild(group);

        const serviceLabel = AceGUI.Create("Label");
        serviceLabel.SetRelativeWidth(1);
        group.AddChild(serviceLabel);
        this.serviceLabel = serviceLabel;

        const toggleServiceButton = AceGUI.Create("Button");
        group.AddChild(toggleServiceButton);
        toggleServiceButton.SetWidth(200);
        toggleServiceButton.SetCallback("OnClick", () => {
            if (this.inService) {
                this.stopService();
            } else {
                this.startService();
            }
        });
        this.toggleServiceButton = toggleServiceButton;

        this.inService = false;
        this.realZoneText = GetRealZoneText();
        this.subZoneText = GetSubZoneText();
        this.updateGui();
    }

    startService() {
        this.inService = true;
        this.updateGui();

        const soulShardsRemaining = GetItemCount("Soul Shard", false);

        // Determine nearby clickers


        this.notifyServiceAvailable({
            realZoneText: this.realZoneText,
            subZoneText: this.subZoneText,
            soulShardsRemaining,
        });
    }

    stopService() {
        this.inService = false;
        this.updateGui();
        this.notifyServiceStopped();
    }

    updateGui() {
        if (this.inService) {
            this.serviceLabel.SetText(L.CurrentlyServicing(this.realZoneText, this.subZoneText));
            this.toggleServiceButton.SetText(L.StopServiceButtonText);
        } else {
            this.serviceLabel.SetText(L.NotInService);
            this.toggleServiceButton.SetText(L.StartServiceButtonText);
        }
    }
}

interface SummonerBase {
    readonly characterName: string;
    realZoneText: string;
    subZoneText: string;
}

interface Clicker extends SummonerBase {
    readonly type: "clicker";
}

interface Warlock extends SummonerBase {
    readonly type: "warlock";
    soulShardsRemaining: number;
}

type Summoner = Clicker | Warlock;

interface DestinationWarlock {
    readonly characterName: string;
    soulShardsRemaining: number;
}

interface DestinationClicker {
    readonly characterName: string;
}

interface Destination {
    realZoneText: string;
    subZoneText: string;
    warlocks: DestinationWarlock[];
    clickers: DestinationClicker[];
}

interface ServiceAvailabilityNotice {
    readonly realZoneText: string;
    readonly subZoneText: string;
    readonly soulShardsRemaining: number;
}

interface MainWindowDestination {
    readonly group: GuiInlineGroup;
}

interface MainWindowStateOptions {
    readonly didClose: () => void;
    readonly notifyServiceAvailable: (notice: ServiceAvailabilityNotice) => void;
    readonly notifyServiceStopped: () => void;
    readonly debug: DebugFn;
    readonly isWarlockWithSummonSpell: boolean;
}

class MainWindowState {
    private options: MainWindowStateOptions;
    private mainWindowFrame: GuiFrame;
    private destinationsContainer: AceGuiContainerWidgetBase;
    private destinations: { [k in string]: MainWindowDestination; };
    private debug: DebugFn;
    private serviceUi: ServiceUi | null;

    constructor(options: MainWindowStateOptions) {
        this.options = options;
        this.debug = options.debug;

        const mainWindowFrame = AceGUI.Create("Frame");
        mainWindowFrame.SetTitle("Purple Taxi");
        mainWindowFrame.SetCallback("OnClose", () => { this.releaseMainWindow(); });
        mainWindowFrame.SetLayout("List");
        this.mainWindowFrame = mainWindowFrame;

        if (options.isWarlockWithSummonSpell) {
            this.serviceUi = new ServiceUi({
                notifyServiceAvailable: options.notifyServiceAvailable,
                notifyServiceStopped: options.notifyServiceStopped,
                mainWindowFrame,
            });
        } else {
            this.serviceUi = null;
        }

        const destinationsHeading = AceGUI.Create("Heading");
        destinationsHeading.SetFullWidth(true);
        destinationsHeading.SetText(L.DestinationsHeadingText);
        mainWindowFrame.AddChild(destinationsHeading);

        const destinationsGroup = AceGUI.Create("SimpleGroup");
        destinationsGroup.SetFullWidth(true);
        destinationsGroup.SetFullHeight(true);
        destinationsGroup.SetLayout("List");
        mainWindowFrame.AddChild(destinationsGroup);
        this.destinationsContainer = destinationsGroup;

        this.destinations = {};
    }

    public releaseMainWindow() {
        this.mainWindowFrame.Release();
        this.options.didClose();
    }

    public updateDestinations(destinations: { [k in string] : Destination; }) {
        this.destinationsContainer.ReleaseChildren();

        for (const destinationName in destinations) {
            const destinationContainer = AceGUI.Create("InlineGroup");
            destinationContainer.SetFullWidth(true);
            destinationContainer.SetLayout("List");
            this.destinationsContainer.AddChild(destinationContainer);

            const destinationLabel = AceGUI.Create("Label");
            destinationLabel.SetFullWidth(true);
            destinationLabel.SetText(destinationName);
            destinationContainer.AddChild(destinationLabel);

            const detailsContainer = AceGUI.Create("SimpleGroup");
            detailsContainer.SetFullWidth(true);
            detailsContainer.SetLayout("Flow");
            destinationContainer.AddChild(detailsContainer);

            const warlocksLabel = AceGUI.Create("Label");
            warlocksLabel.SetWidth(100);
            warlocksLabel.SetText(L.WarlocksText);
            detailsContainer.AddChild(warlocksLabel);

            const destination = destinations[destinationName];
            const warlockNamesText =
                destination.warlocks
                    .map(w => `${w.characterName} (${L.ShardsRemainingText(w.soulShardsRemaining)})`)
                    .reduce((p, n) => p === "" ? n : `${p}, ${n}`, "");

            const namesLabel = AceGUI.Create("Label");
            namesLabel.SetColor(200, 0, 200);
            namesLabel.SetRelativeWidth(0.5);
            namesLabel.SetText(warlockNamesText);
            detailsContainer.AddChild(namesLabel);
        }
    }
}

export interface StateOptions {
    readonly rangeChecker: RangeCheckerFn;
    readonly dispatchMessage: DispatchMessageFn;
    readonly debug: DebugFn;
}

export class State {
    private readonly characterName: string;
    private readonly dispatchMessage: DispatchMessageFn;
    private readonly debug: DebugFn;
    private mainWindowState: MainWindowState | null = null;
    private rangeChecker: RangeCheckerFn;
    private isWarlockWithSummonSpell: boolean;
    private summonersInService: { [k in string]: Summoner; };

    constructor(options: StateOptions) {
        // The player's class won't change, so we can discover this once on initialization.
        const [, englishClass] = UnitClass("player");
        this.characterName = GetUnitName("player", false);

        this.isWarlockWithSummonSpell = (englishClass == "WARLOCK" && UnitLevel("player") >= 20);

        this.dispatchMessage = options.dispatchMessage;
        this.debug = options.debug;
        this.rangeChecker = options.rangeChecker;
        this.summonersInService = {};

        if (this.isWarlockWithSummonSpell) {
            this.startWarlockTicker();
        }
    }

    public startWarlockTicker() {
        const { characterName, rangeChecker } = this;
        C_Timer.NewTicker(10, () => {
            try {
                const clickersInRange = [];
                let i = 0;
                while (i < 40) {
                    const [raidMemberName, _rank, _grp, _level, _class, _fileName, _zone, isOnline, isDead] = GetRaidRosterInfo(i + 1);
                    if (!raidMemberName) {
                        break;
                    }

                    if (raidMemberName !== characterName && isOnline && !isDead && rangeChecker(`raid${i+1}`)) {
                        clickersInRange.push(characterName);
                    }
                    i++;
                }
            } catch (x) {
                this.debug(x);
            }
        });
    }

    public toggleMainWindow() {
        if (this.mainWindowState) {
            this.mainWindowState.releaseMainWindow();
        } else {
            this.mainWindowState = new MainWindowState({
                debug: this.debug,
                didClose: () => {
                    this.mainWindowState = null;
                },
                isWarlockWithSummonSpell: this.isWarlockWithSummonSpell,
                notifyServiceAvailable: (notice: ServiceAvailabilityNotice) => {
                    this.dispatchMessage(["GUILD"], {
                        type: "serviceAvailable",
                        characterName: this.characterName,
                        realZoneText: notice.realZoneText,
                        subZoneText: notice.subZoneText,
                        soulShardsRemaining: notice.soulShardsRemaining,
                    });
                },
                notifyServiceStopped: () => {
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

    private handleServiceAvailableMessage(msg: ServiceAvailableMessage) {
        this.debug(`${msg.characterName} is summoning to ${msg.subZoneText} (${msg.realZoneText}) with ${msg.soulShardsRemaining} shards remaining.`);

        let summoner = this.summonersInService[msg.characterName];
        if (!summoner) {
            this.summonersInService[msg.characterName] = summoner = {
                type: "warlock",
                characterName: msg.characterName,
                realZoneText: msg.realZoneText,
                subZoneText: msg.subZoneText,
                soulShardsRemaining: msg.soulShardsRemaining,
            };
            this.updateSummonersUi();
        } else if (summoner.realZoneText !== msg.realZoneText || summoner.subZoneText !== msg.subZoneText || (summoner.type === 'warlock' && summoner.soulShardsRemaining !== msg.soulShardsRemaining)) {
            summoner.realZoneText = msg.realZoneText;
            summoner.subZoneText = msg.subZoneText;

            if (summoner.type === 'warlock') {
                summoner.soulShardsRemaining = msg.soulShardsRemaining;
            }

            this.updateSummonersUi();
        }
    }

    private handleServiceStoppedMessage(msg: ServiceStoppedMessage) {
        this.debug(`${msg.characterName} is no longer summoning.`);

        const summoner = this.summonersInService[msg.characterName];
        if (summoner) {
            this.debug(`Removing summoner: ${msg.characterName}`);
            delete this.summonersInService[msg.characterName];
            this.updateSummonersUi();
        }
    }

    private updateSummonersUi() {
        if (this.mainWindowState) {
            const destinations: { [k in string]: Destination; } = {};
            for (const k in this.summonersInService) {
                const summoner = this.summonersInService[k];
                const destinationName = summoner.subZoneText === "" ? summoner.realZoneText : `${summoner.subZoneText} (${summoner.realZoneText})`;

                let destination = destinations[destinationName];
                if (!destination) {
                    destination = {
                        realZoneText: summoner.realZoneText,
                        subZoneText: summoner.subZoneText,
                        warlocks: [],
                        clickers: [],
                    }
                    destinations[destinationName] = destination;
                }
                
                if (summoner.type === 'warlock') {
                    destination.warlocks.push({
                        characterName: summoner.characterName,
                        soulShardsRemaining: summoner.soulShardsRemaining,
                    });
                } else {
                    destination.clickers.push({
                        characterName: summoner.characterName,
                    });
                }
            }

            this.mainWindowState.updateDestinations(destinations);
        }
    }

    private updateRange() {

    }
}