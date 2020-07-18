import * as wow from "@wartoshika/wow-classic-declarations";
import "./Locales/enUS";
import { State } from "./state";

interface SummonerState {
    isInService: boolean;
    canSummon: boolean;
}

const state = new State({
    mainWindowDidChangeVisibility(visible: boolean) {

    }
});

let PurpleTaxi: AceAddon | null = null;
try {
    PurpleTaxi = LibStub("AceAddon-3.0").NewAddon("PurpleTaxi", "AceConsole-3.0");
    
    const L = LibStub("AceLocale-3.0").GetLocale<PurpleTaxiTranslationKeys>("PurpleTaxi", true);
    
    const options: GroupOption = {
        name: "PurpleTaxi",
        type: "group",
        args: {
            help: {
                type: "execute",
                name: L.OptionHelpName,
                desc: L.OptionHelpDesc,
                func: executeHelp,
                guiHidden: true,
            },
        },
    };

    let summonerState: SummonerState | null = null;

    function executeHelp() {
        print(L.OptionHelpPrint);
    }

    (PurpleTaxi as any).ProcessSlashCommand = function(input: string) {
        try {
            if (!input || input.trim() === "") {
                state.toggleMainWindow();
            } else {
                LibStub("AceConfigCmd-3.0").HandleCommand("taxi", "PurpleTaxi", input)
            }
        } catch (x) {
            print(x);
        }
    }
    
    PurpleTaxi.OnInitialize = function() {
        try {
            LibStub("AceConfigRegistry-3.0").RegisterOptionsTable("PurpleTaxi", options);
            this.RegisterChatCommand("taxi", "ProcessSlashCommand");
            this.RegisterChatCommand("purpletaxi", "ProcessSlashCommand");
        
            // The player's class won't change, so we can discover this once on initialization.
            const [, englishClass] = UnitClass("player");
    
            if (englishClass == "WARLOCK") {
                summonerState = {
                    isInService: false,
                    canSummon: false
                }
            }
        } catch (x) {
            print(x);
        }
    };
    
    PurpleTaxi.OnEnable = function() {
        try {
            const version = GetAddOnMetadata("PurpleTaxi", "Version") || "";
            const author = GetAddOnMetadata("PurpleTaxi", "Author") || "";
            this.Print(L.AddonEnabled(version, author));

            if (summonerState) {
                summonerState.canSummon = UnitLevel("player") >= 20;
            }
        } catch (x) {
            print(x);
        }
    };
    
    PurpleTaxi.OnDisable = function() {
        try {
            print(L.AddonDisabled);
        } catch (x) {
            print(x);
        }
    };
} catch (x) {
    print(x);
}

export default PurpleTaxi;