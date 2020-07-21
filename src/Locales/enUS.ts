import buildLocale from "../buildLocale";

const translations: PurpleTaxiTranslationKeys = {
    Language: "English",
    AddonEnabled: (x, y) => `PurpleTaxi: Version ${x} by ${y} loaded`,
    AddonDisabled: "PurpleTaxi disabled",
    OptionHelpName: "Help",
    OptionHelpDesc: "Shows a list of supported commands and options.",
    OptionHelpPrint: `
|cff9482c9PurpleTaxi usage:|r
/taxi or /purpletaxi { help }
 - |cff9482c9help|r: Shows a list of supported options.
`,
    StartServiceButtonText: "Start Service",
    StopServiceButtonText: "Stop Service",
    CurrentlyServicing: (x, y) => `You are currently servicing summon requests for ${y} (${x}).`,
    NotInService: "You are not currently servicing summon requests.",
    DestinationsHeadingText: "Destinations",
    WarlocksText: "Warlocks:",
    ClickersText: "Clickers:",
    ShardsRemainingText: (x) => `${x} shards`,
    RequestSummonButtonText: "Request Summon",
};
buildLocale(translations, "enUS", true);