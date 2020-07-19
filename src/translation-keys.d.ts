interface PurpleTaxiTranslationKeys {
    // General
    Language: string;
    AddonEnabled: (version: string, author: string) => string;
    AddonDisabled: string;

    // Options
    OptionHelpName: string;
    OptionHelpDesc: string;
    OptionHelpPrint: string;

    // GUI
    StartServiceButtonText: string;
    StopServiceButtonText: string;
    CurrentlyServicing: (zone: string, subZone: string) => string;
    NotInService: string;
    DestinationsHeadingText: string;
}