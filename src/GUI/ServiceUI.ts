import { GetRealZoneText, GetSubZoneText } from "../types";

export interface ServiceUiOptions {
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly notifyServiceAvailable: () => void;
    readonly notifyServiceStopped: () => void;
    readonly mainWindowFrame: GuiFrame;
}

export class ServiceUi {
    private inService: boolean;
    private realZoneText: string;
    private subZoneText: string;
    private serviceLabel: GuiLabel;
    private toggleServiceButton: GuiButton;
    private readonly notifyServiceAvailable: () => void;
    private readonly notifyServiceStopped: () => void;
    private readonly L: PurpleTaxiTranslationKeys;

    constructor(options: ServiceUiOptions) {
        const { AceGUI, L, notifyServiceAvailable, notifyServiceStopped } = options;
        this.notifyServiceAvailable = notifyServiceAvailable;
        this.notifyServiceStopped = notifyServiceStopped;
        this.L = L;

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

    public startService(): void {
        this.inService = true;
        this.updateGui();
        this.notifyServiceAvailable();
    }

    public stopService(): void {
        this.inService = false;
        this.updateGui();
        this.notifyServiceStopped();
    }

    public updateGui(): void {
        const { L, inService, serviceLabel, toggleServiceButton } = this;
        if (inService) {
            serviceLabel.SetText(L.CurrentlyServicing(this.realZoneText, this.subZoneText));
            toggleServiceButton.SetText(L.StopServiceButtonText);
        } else {
            serviceLabel.SetText(L.NotInService);
            toggleServiceButton.SetText(L.StartServiceButtonText);
        }
    }
}
