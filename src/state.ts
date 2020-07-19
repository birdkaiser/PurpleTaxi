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
        this.notifyServiceAvailable({
            realZoneText: this.realZoneText,
            subZoneText: this.subZoneText,
            soulShardsRemaining: 45, // TODO
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
        mainWindowFrame.AddChild(destinationsHeading);
        destinationsHeading.SetFullWidth(true);
        destinationsHeading.SetText(L.DestinationsHeadingText);

        const destinationsGroup = AceGUI.Create("SimpleGroup");
        mainWindowFrame.AddChild(destinationsGroup);
        destinationsGroup.SetFullWidth(true);
        destinationsGroup.SetFullHeight(true);
        destinationsGroup.SetLayout("List");
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
            const inlineGroup = AceGUI.Create("InlineGroup");
            this.destinationsContainer.AddChild(inlineGroup);
            inlineGroup.SetFullWidth(true);
            inlineGroup.SetLayout("List");

            const label = AceGUI.Create("Label");
            inlineGroup.AddChild(label);
            label.SetFullWidth(true);
            label.SetText(destinationName);
        }
        // // Add GUI destinations that the state has added, and update the ones that have changed.
        // for (const destinationName in destinations) {
        //     const dest = destinations[destinationName];
        //     const guiDest = this.destinations[destinationName];
        //     if (guiDest) {                
        //         // Update GUI destination
        //         this.debug(`Updating destination: ${destinationName}`);
        //     } else {
        //         // There was no match, so we have to add a new GUI destination.
        //         this.debug(`Adding destination: ${destinationName}`);

        //         const inlineGroup = AceGUI.Create("InlineGroup");
        //         this.destinationsContainer.AddChild(inlineGroup);
        //         inlineGroup.SetFullWidth(true);
        //         inlineGroup.SetLayout("List");

        //         const label = AceGUI.Create("Label");
        //         inlineGroup.AddChild(label);
        //         label.SetFullWidth(true);
        //         label.SetText(destinationName);

        //         this.destinations[destinationName] = {
        //             group: inlineGroup,
        //         };
        //     }
        // }

        // // Remove GUI destinations that are no longer supported by the state.
        // for (const destinationName in this.destinations) {
        //     const dest = destinations[destinationName];
        //     if (!dest) {
        //         this.debug(`Removing destination: ${destinationName}`);
        //         this.destinations[destinationName].group.Release();
        //         delete this.destinations[destinationName];
        //     }
        // }

        // this.destinationsContainer.DoLayout();
    }
}

export interface StateOptions {
    readonly dispatchMessage: DispatchMessageFn;
    readonly debug: DebugFn;
}

export class State {
    private mainWindowState: MainWindowState | null = null;
    private options: StateOptions;
    private isWarlockWithSummonSpell: boolean;
    private characterName: string;
    private debug: DebugFn;
    private summonersInService: { [k in string]: Summoner; };

    constructor(options: StateOptions) {
        this.options = options;

        // The player's class won't change, so we can discover this once on initialization.
        const [, englishClass] = UnitClass("player");
        this.characterName = GetUnitName("player", false);

        this.isWarlockWithSummonSpell = (englishClass == "WARLOCK" && UnitLevel("player") >= 20);

        this.debug = options.debug;
        this.summonersInService = {};
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
                    this.options.dispatchMessage(["GUILD"], {
                        type: "serviceAvailable",
                        characterName: this.characterName,
                        realZoneText: notice.realZoneText,
                        subZoneText: notice.subZoneText,
                        soulShardsRemaining: notice.soulShardsRemaining,
                    });
                },
                notifyServiceStopped: () => {
                    this.options.dispatchMessage(["GUILD"], {
                        type: "serviceStopped",
                        characterName: this.characterName,
                    });
                },
            });
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
}