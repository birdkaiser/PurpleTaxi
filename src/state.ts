import * as wow from "@wartoshika/wow-classic-declarations";
import { DispatchMessageFn } from "./messages";
const AceGUI = LibStub("AceGUI-3.0");
const L = LibStub("AceLocale-3.0").GetLocale<PurpleTaxiTranslationKeys>("PurpleTaxi", true);

// TODO: These typings are missing from wow-classic-declarations.
declare function GetRealZoneText(): string;
declare function GetSubZoneText(): string;

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

interface Summoner {
    readonly characterName: string;
}

interface Warlock extends Summoner {
    soulShardsRemaining: number;
}

interface Destination {
    readonly realZoneText: string;
    readonly subZoneText: string;
    readonly summoners: Summoner[];
}

interface ServiceAvailabilityNotice {
    readonly realZoneText: string;
    readonly subZoneText: string;
    readonly soulShardsRemaining: number;
}

interface MainWindowStateOptions {
    readonly didClose: () => void;
    readonly notifyServiceAvailable: (notice: ServiceAvailabilityNotice) => void;
    readonly notifyServiceStopped: () => void;
    readonly isWarlockWithSummonSpell: boolean;
}

class MainWindowState {
    private options: MainWindowStateOptions;
    private mainWindowFrame: GuiFrame;
    private serviceUi: ServiceUi | null;

    constructor(options: MainWindowStateOptions) {
        this.options = options;

        const mainWindowFrame = AceGUI.Create("Frame");
        mainWindowFrame.SetTitle("Purple Taxi");
        mainWindowFrame.SetCallback("OnClose", () => { this.releaseMainWindow(); });
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
    }

    public releaseMainWindow() {
        this.mainWindowFrame.Release();
        this.options.didClose();
    }
}

export interface StateOptions {
    readonly dispatchMessage: DispatchMessageFn;
}

export class State {
    private mainWindowState: MainWindowState | null = null;
    private options: StateOptions;
    private isWarlockWithSummonSpell: boolean;
    private characterName: string;

    constructor(options: StateOptions) {
        this.options = options;

        // The player's class won't change, so we can discover this once on initialization.
        const [, englishClass] = UnitClass("player");
        this.characterName = GetUnitName("player", false);

        this.isWarlockWithSummonSpell = (englishClass == "WARLOCK" && UnitLevel("player") >= 20);
    }

    public toggleMainWindow() {
        if (this.mainWindowState) {
            this.mainWindowState.releaseMainWindow();
        } else {
            this.mainWindowState = new MainWindowState({
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
}