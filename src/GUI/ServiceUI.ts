export interface ServiceUiOptions {
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly startService: () => void;
    readonly stopService: () => void;
    readonly mainWindowFrame: GuiFrame;
}

export class ServiceUi {
    private inService: boolean;
    private realZoneText: string;
    private subZoneText: string;
    private serviceLabel: GuiLabel;
    private toggleServiceButton: GuiButton;
    private readonly startService: () => void;
    private readonly stopService: () => void;
    private readonly L: PurpleTaxiTranslationKeys;

    constructor(options: ServiceUiOptions) {
        const { AceGUI, L, startService, stopService } = options;
        this.startService = startService;
        this.stopService = stopService;
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
                this.doStopService();
            } else {
                this.doStartService();
            }
        });
        this.toggleServiceButton = toggleServiceButton;

        this.inService = false;
        this.realZoneText = GetRealZoneText();
        this.subZoneText = GetSubZoneText();
        this.updateGui();
    }

    public doStartService(): void {
        this.inService = true;
        this.updateGui();
        this.startService();
    }

    public doStopService(): void {
        this.inService = false;
        this.updateGui();
        this.stopService();
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
