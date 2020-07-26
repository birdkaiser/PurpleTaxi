import { renderDestination } from "./Destination";
import { ServiceUi } from "./ServiceUi";
import { DebugFn, Destination } from "../types";
import { PartyMonitor, PartiesUpdatedHandler, PartyInfo } from "../PartyMonitor";
import { renderParty } from "./Party";

interface MainWindowStateOptions {
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly didClose: () => void;
    readonly startService: () => void;
    readonly stopService: () => void;
    readonly partyMonitor: PartyMonitor;
    readonly debug: DebugFn;
    readonly isWarlockWithSummonSpell: boolean;
}

export class MainWindow {
    private mainWindowFrame: GuiFrame;
    private partiesContainer: AceGuiContainerWidgetBase;
    private destinationsContainer: AceGuiContainerWidgetBase;
    private serviceUi: ServiceUi | null;
    private readonly debug: DebugFn;
    private readonly didClose: () => void;
    private readonly L: PurpleTaxiTranslationKeys;
    private readonly AceGUI: AceGuiLibStub;
    private readonly partyMonitor: PartyMonitor;
    private readonly partiesUpdatedHandler: PartiesUpdatedHandler;

    constructor(options: MainWindowStateOptions) {
        const { AceGUI, L, partyMonitor, debug, didClose } = options;
        this.debug = debug;
        this.didClose = didClose;
        this.L = L;
        this.AceGUI = AceGUI;
        this.partyMonitor = partyMonitor;
        this.partiesUpdatedHandler = (parties) => {
            this.updateParties(parties);
        };

        partyMonitor.addPartiesUpdatedHandler(this.partiesUpdatedHandler);

        const mainWindowFrame = AceGUI.Create("Frame");
        mainWindowFrame.SetTitle("Purple Taxi");
        mainWindowFrame.SetCallback("OnClose", () => { this.destroy(); });
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

        const partiesHeading = AceGUI.Create("Heading");
        partiesHeading.SetFullWidth(true);
        partiesHeading.SetText(L.PartiesHeadingText);
        mainWindowFrame.AddChild(partiesHeading);

        const partiesContainer = AceGUI.Create("SimpleGroup");
        partiesContainer.SetFullWidth(true);
        partiesContainer.SetFullHeight(true);
        partiesContainer.SetLayout("List");
        mainWindowFrame.AddChild(partiesContainer);
        this.partiesContainer = partiesContainer;

        const destinationsHeading = AceGUI.Create("Heading");
        destinationsHeading.SetFullWidth(true);
        destinationsHeading.SetText(L.DestinationsHeadingText);
        mainWindowFrame.AddChild(destinationsHeading);

        const destinationsContainer = AceGUI.Create("SimpleGroup");
        destinationsContainer.SetFullWidth(true);
        destinationsContainer.SetFullHeight(true);
        destinationsContainer.SetLayout("List");
        mainWindowFrame.AddChild(destinationsContainer);
        this.destinationsContainer = destinationsContainer;

        this.updateParties(partyMonitor.parties);
    }

    public destroy(): void {
        this.partyMonitor.removePartiesUpdatedHandler(this.partiesUpdatedHandler);
        this.mainWindowFrame.Release();
        this.didClose();
    }

    public updateParties(parties: ReadonlyArray<PartyInfo>): void {
        const { L, AceGUI, partiesContainer } = this;
        partiesContainer.ReleaseChildren();

        if (parties.length > 0) {
            for (const party of parties) {
                renderParty({
                    L,
                    AceGUI,
                    partiesContainer,
                    partyInfo: party,
                });
            }
        } else {
            const noGuildPartiesLabel = AceGUI.Create("Label");
            noGuildPartiesLabel.SetFullWidth(true);
            noGuildPartiesLabel.SetText(L.NoGuildGroupsAvailableText);
            partiesContainer.AddChild(noGuildPartiesLabel);
        }
    }

    public updateDestinations(destinations: { [k in string] : Destination; }): void {
        const { L, AceGUI, destinationsContainer } = this;
        destinationsContainer.ReleaseChildren();

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