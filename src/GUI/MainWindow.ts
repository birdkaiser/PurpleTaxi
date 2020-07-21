import { renderDestination } from "./Destination";
import { ServiceUi } from "./ServiceUi";
import { DebugFn, Destination } from "../types";

interface MainWindowStateOptions {
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly didClose: () => void;
    readonly startService: () => void;
    readonly stopService: () => void;
    readonly debug: DebugFn;
    readonly isWarlockWithSummonSpell: boolean;
}

export class MainWindow {
    private mainWindowFrame: GuiFrame;
    private destinationsContainer: AceGuiContainerWidgetBase;
    private serviceUi: ServiceUi | null;
    private readonly debug: DebugFn;
    private readonly didClose: () => void;
    private readonly L: PurpleTaxiTranslationKeys;
    private readonly AceGUI: AceGuiLibStub;

    constructor(options: MainWindowStateOptions) {
        const { AceGUI, L } = options;
        this.debug = options.debug;
        this.didClose = options.didClose;
        this.L = options.L;
        this.AceGUI = options.AceGUI;

        const mainWindowFrame = AceGUI.Create("Frame");
        mainWindowFrame.SetTitle("Purple Taxi");
        mainWindowFrame.SetCallback("OnClose", () => { this.releaseMainWindow(); });
        mainWindowFrame.SetLayout("List");
        this.mainWindowFrame = mainWindowFrame;

        if (options.isWarlockWithSummonSpell) {
            this.serviceUi = new ServiceUi({
                AceGUI,
                L,
                startService: options.startService,
                stopService: options.stopService,
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
    }

    public releaseMainWindow(): void {
        this.mainWindowFrame.Release();
        this.didClose();
    }

    public updateDestinations(destinations: { [k in string] : Destination; }): void {
        const { destinationsContainer } = this;
        destinationsContainer.ReleaseChildren();

        const { L, AceGUI } = this;
        for (const destinationName in destinations) {
            const { warlocks, clickers } = destinations[destinationName];
            renderDestination({
                L,
                AceGUI,
                destinationsContainer,
                destinationName,
                warlocks,
                clickers,
            });
        }
    }
}