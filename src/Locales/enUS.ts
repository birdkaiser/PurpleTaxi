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
 - |cff9482c9help|r: Shows a list of supported commands and options.
 - |cff9482c9list|r: Lists your party within your guild. Only available if you are the party leader or assistant.
 - |cff9482c9delist|r: Delists your party from the guild. Only available if you are the party leader or assistant.
`,
    OptionListName: "List",
    OptionListDesc: "Lists your party within your guild.",
    OptionDelistName: "Delist",
    OptionDelistDesc: "Delists your party from the guild.",
    StartServiceButtonText: "Start Service",
    StopServiceButtonText: "Stop Service",
    CurrentlyServicing: (x, y) => `You are currently servicing summon requests for ${y} (${x}).`,
    NotInService: "You are not currently servicing summon requests.",
    PartiesHeadingText: "Available Guild Groups",
    NoGuildGroupsAvailableText: "There are no guild groups at the current time.",
    DestinationsHeadingText: "Destinations",
    WarlocksText: "Warlocks:",
    ClickersText: "Clickers:",
    ShardsRemainingText: (x) => `${x} shards`,
    RequestSummonButtonText: "Request Summon",
    LeaderText: "Leader:",
    DescriptionText: "Description:",
    SummoningToText: "Summoning to:",
    NoDestinationsText: "This group is not currently summoning.",
};
buildLocale(translations, "enUS", true);