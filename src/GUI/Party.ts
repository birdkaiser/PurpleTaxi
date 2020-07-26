import { PartyInfo } from "../PartyMonitor";

export interface RenderPartyArgs {
    readonly L: PurpleTaxiTranslationKeys;
    readonly AceGUI: AceGuiLibStub;
    readonly partiesContainer: AceGuiContainerWidgetBase;
    readonly partyInfo: PartyInfo;
}

export function renderParty(args: RenderPartyArgs): void {
    const { L, AceGUI, partiesContainer, partyInfo } = args;
    const { description, leaderName, summonDestinations } = partyInfo;

    const partyContainer = AceGUI.Create("InlineGroup");
    partyContainer.SetFullWidth(true);
    partyContainer.SetLayout("List");
    partiesContainer.AddChild(partyContainer);

    const leaderRowContainer = AceGUI.Create("SimpleGroup");
    leaderRowContainer.SetFullWidth(true);
    leaderRowContainer.SetLayout("Flow");
    partyContainer.AddChild(leaderRowContainer);

    const leaderLabel = AceGUI.Create("Label");
    leaderLabel.SetWidth(100);
    leaderLabel.SetText(L.LeaderText);
    leaderRowContainer.AddChild(leaderLabel);

    const leaderNameLabel = AceGUI.Create("Label");
    leaderNameLabel.SetWidth(400);
    leaderNameLabel.SetText(leaderName);
    leaderRowContainer.AddChild(leaderNameLabel);

    const descriptionRowContainer = AceGUI.Create("SimpleGroup");
    descriptionRowContainer.SetFullWidth(true);
    descriptionRowContainer.SetLayout("Flow");
    partyContainer.AddChild(descriptionRowContainer);

    const descriptionLabel = AceGUI.Create("Label");
    descriptionLabel.SetWidth(100);
    descriptionLabel.SetText(L.DescriptionText);
    descriptionRowContainer.AddChild(descriptionLabel);

    const descriptionValueLabel = AceGUI.Create("Label");
    descriptionValueLabel.SetWidth(400);
    descriptionValueLabel.SetText(description === "" ? "<no description>" : description);
    descriptionRowContainer.AddChild(descriptionValueLabel);

    const destinationButtonsContainer = AceGUI.Create("SimpleGroup");
    destinationButtonsContainer.SetFullWidth(true);
    partyContainer.AddChild(destinationButtonsContainer);

    const summonsLabel = AceGUI.Create("Label");
    summonsLabel.SetWidth(100);
    summonsLabel.SetText(L.SummoningToText);
    destinationButtonsContainer.AddChild(summonsLabel);

    if (summonDestinations.length > 0) {
        for (const dest of summonDestinations) {
            const button = AceGUI.Create("Button");
            button.SetText(dest);
            button.SetWidth(200);
            destinationButtonsContainer.AddChild(button);
        }
    } else {
        const noDestinationsLabel = AceGUI.Create("Label");
        noDestinationsLabel.SetWidth(400);
        noDestinationsLabel.SetText(L.NoDestinationsText);
        destinationButtonsContainer.AddChild(noDestinationsLabel);
    }
}
