export interface GuiDestinationClicker {
    readonly characterName: string;
}

export interface GuiDestinationWarlock extends GuiDestinationClicker {
    readonly soulShardsRemaining: number;
}

interface DetailsContainerOptions {
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly destinationContainer: AceGuiContainerWidgetBase;
    readonly warlocks: ReadonlyArray<GuiDestinationWarlock>;
    readonly clickers: ReadonlyArray<GuiDestinationClicker>;
}

function renderDetailsContainer(options: DetailsContainerOptions) {
    const { L, AceGUI, destinationContainer, warlocks, clickers } = options;
    const detailsContainer = AceGUI.Create("SimpleGroup");
    detailsContainer.SetFullWidth(true);
    detailsContainer.SetLayout("List");
    destinationContainer.AddChild(detailsContainer);

    const warlocksRowContainer = AceGUI.Create("SimpleGroup");
    warlocksRowContainer.SetFullWidth(true);
    warlocksRowContainer.SetLayout("Flow");
    detailsContainer.AddChild(warlocksRowContainer);

    const warlocksLabel = AceGUI.Create("Label");
    warlocksLabel.SetWidth(100);
    warlocksLabel.SetText(L.WarlocksText);
    warlocksRowContainer.AddChild(warlocksLabel);

    const warlockNamesText =
        warlocks
            .map(w => `${w.characterName} (${L.ShardsRemainingText(w.soulShardsRemaining)})`)
            .reduce((p, n) => p === "" ? n : `${p}, ${n}`, "");

    const warlockNamesLabel = AceGUI.Create("Label");
    warlockNamesLabel.SetColor(200, 0, 200);
    warlockNamesLabel.SetRelativeWidth(0.5);
    warlockNamesLabel.SetText(warlockNamesText);
    warlocksRowContainer.AddChild(warlockNamesLabel);

    const clickersRowContainer = AceGUI.Create("SimpleGroup");
    clickersRowContainer.SetFullWidth(true);
    clickersRowContainer.SetLayout("Flow");
    detailsContainer.AddChild(clickersRowContainer);

    const clickersLabel = AceGUI.Create("Label");
    clickersLabel.SetWidth(100);
    clickersLabel.SetText(L.ClickersText);
    clickersRowContainer.AddChild(clickersLabel);

    const clickerNamesText =
        clickers
            .filter((c) => !warlocks.some(w => w.characterName === c.characterName))
            .map(w => w.characterName)
            .reduce((p, n) => p === "" ? n : `${p}, ${n}`, "");

    const clickerNamesLabel = AceGUI.Create("Label");
    clickerNamesLabel.SetRelativeWidth(0.5);
    clickerNamesLabel.SetText(clickerNamesText);
    clickersRowContainer.AddChild(clickerNamesLabel);

    if (clickers.length + warlocks.length < 3) {
        // There aren't enough people here to summon, color it red.
        clickerNamesLabel.SetColor(200, 0, 0);
    } else {
        // There are enough people here to summon, color it yellow.
        clickerNamesLabel.SetColor(0, 255, 255);
    }
}

export interface DestinationOptions {
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly destinationsContainer: AceGuiContainerWidgetBase;
    readonly destinationName: string;
    readonly warlocks: ReadonlyArray<GuiDestinationWarlock>;
    readonly clickers: ReadonlyArray<GuiDestinationClicker>;
}

export function renderDestination(opts: DestinationOptions): void {
    const {
        L,
        AceGUI,
        destinationsContainer,
        destinationName,
        warlocks,
        clickers,
    } = opts;

    const destinationContainer = AceGUI.Create("InlineGroup");
    destinationContainer.SetFullWidth(true);
    destinationContainer.SetLayout("List");
    destinationsContainer.AddChild(destinationContainer);

    const destinationNameLabel = AceGUI.Create("Label");
    destinationNameLabel.SetFullWidth(true);
    destinationNameLabel.SetText(destinationName);
    destinationContainer.AddChild(destinationNameLabel);

    renderDetailsContainer({
        L,
        AceGUI,
        destinationContainer,
        warlocks,
        clickers,
    });

    const requestSummonButton = AceGUI.Create("Button");
    requestSummonButton.SetText(L.RequestSummonButtonText);
    requestSummonButton.SetWidth(200);
    destinationContainer.AddChild(requestSummonButton);
}
