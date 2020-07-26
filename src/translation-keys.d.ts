interface PurpleTaxiTranslationKeys {
    // General
    Language: string;
    AddonEnabled: (version: string, author: string) => string;
    AddonDisabled: string;

    // Options
    OptionHelpName: string;
    OptionHelpDesc: string;
    OptionHelpPrint: string;
    OptionListName: string;
    OptionListDesc: string;
    OptionDelistName: string;
    OptionDelistDesc: string;

    // GUI
    StartServiceButtonText: string;
    StopServiceButtonText: string;
    CurrentlyServicing: (zone: string, subZone: string) => string;
    NotInService: string;
    PartiesHeadingText: string;
    NoGuildGroupsAvailableText: string;
    DestinationsHeadingText: string;
    WarlocksText: string;
    ClickersText: string;
    ShardsRemainingText: (shards: number) => string;
    RequestSummonButtonText: string;
    LeaderText: string;
    DescriptionText: string;
    SummoningToText: string;
    NoDestinationsText: string;
}
