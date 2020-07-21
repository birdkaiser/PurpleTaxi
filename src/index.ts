import "./Locales/enUS";
import { State } from "./State";
import { Message, MessageDistribution } from "./messages";

interface ExtendedAddon {
    state: State;
    SendComm(distribution: MessageDistribution, msg: Message): void;
    OnCommReceived(arg1: string, arg2: string, arg3: string, arg4: string, arg5: string): void;
    ProcessSlashCommand(input: string): void;
    Debug(str: string): void;
}

type PurpleTaxiAddon = AceAddon & ExtendedAddon & AceCommLibStub & AceSerializerLibStub & LibRangeCheckLibStub;

const MessagePrefix = "PTAXI";
const debugMode = true; // TODO: store this in config.

let PurpleTaxi: PurpleTaxiAddon | null = null;
try {
    const addon = LibStub("AceAddon-3.0").NewAddon("PurpleTaxi", "AceConsole-3.0", "AceComm-3.0", "AceSerializer-3.0") as PurpleTaxiAddon;
    PurpleTaxi = addon;
    
    const L = LibStub("AceLocale-3.0").GetLocale<PurpleTaxiTranslationKeys>("PurpleTaxi", true);
    const AceGUI = LibStub("AceGUI-3.0");
    const RC = LibStub("LibRangeCheck-2.0");

    PurpleTaxi.Debug = function(str: string) {
        if (debugMode) {
            this.Print(str);
        }
    }

    PurpleTaxi.SendComm = function(distribution: MessageDistribution, msg: Message) {
        try {
            const serialized = this.Serialize(msg);
            this.Debug(`Sending message: ${serialized}`);
            if (serialized === "") {
                // Blizzard will disconnect you if you try to send an empty message.
                return;
            }
            if (distribution[0] === "WHISPER") {
                this.SendCommMessage(MessagePrefix, serialized, distribution[0], distribution[1]);

            } else {
                this.SendCommMessage(MessagePrefix, serialized, distribution[0]);
            }
        } catch (x) {
            this.Debug(x);
        }
    }

    PurpleTaxi.OnCommReceived = function(prefix: string, message: string, channel: string, sender: string) {
        try {
            if (prefix !== MessagePrefix) {
                // Ignore anything that doesn't match our prefix.
                return;
            }

            this.Debug(`Received message from ${sender} over ${channel}: ${message}`);
            const [success, deserialized] = this.Deserialize<Message>(message);
            if (success) {
                const messageObj = deserialized as Message;
                if (!this.state.handleMessage(messageObj)) {
                    this.Debug(`Unhandled message type: ${messageObj.type}`);
                }
            } else {
                this.Debug(`Failed to deserialize message: ${deserialized}`);
            }
        } catch (x) {
            this.Debug(x);
        }
    }

    PurpleTaxi.ProcessSlashCommand = function(input: string) {
        try {
            if (!input || input.trim() === "") {
                this.state.toggleMainWindow();
            } else {
                LibStub("AceConfigCmd-3.0").HandleCommand("taxi", "PurpleTaxi", input)
            }
        } catch (x) {
            this.Debug(x);
        }
    }

    PurpleTaxi.OnInitialize = function() {
        try {
            this.state = new State({
                AceGUI,
                L,
                dispatchMessage: (distribution: MessageDistribution, msg: Message) => {
                    this.SendComm(distribution, msg);
                },
                rangeChecker: RC.GetFriendMaxChecker(30),
                debug: (msg) => this.Debug(msg),
            });
    
            const executeHelp = function() {
                print(L.OptionHelpPrint);
            };
            
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

            LibStub("AceConfigRegistry-3.0").RegisterOptionsTable("PurpleTaxi", options);
            this.RegisterChatCommand("taxi", "ProcessSlashCommand");
            this.RegisterChatCommand("purpletaxi", "ProcessSlashCommand");
            this.RegisterComm(MessagePrefix, "OnCommReceived");
        } catch (x) {
            this.Debug(x);
        }
    };
    
    PurpleTaxi.OnEnable = function() {
        try {
            const version = GetAddOnMetadata("PurpleTaxi", "Version") || "";
            const author = GetAddOnMetadata("PurpleTaxi", "Author") || "";
            this.Print(L.AddonEnabled(version, author));
        } catch (x) {
            this.Debug(x);
        }
    };
    
    PurpleTaxi.OnDisable = function() {
        try {
            this.Print(L.AddonDisabled);
        } catch (x) {
            this.Debug(x);
        }
    };
    
    if (debugMode) {
        print("Loaded PurpleTaxi script.");
    }
} catch (x) {
    if (debugMode) {
        print(x);
    }
}

export default PurpleTaxi;