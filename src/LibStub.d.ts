type LibStubName =
    | "AceAddon-3.0"
    | "AceComm-3.0"
    | "AceLocale-3.0"
    | "AceGUI-3.0"
    | "AceConfigCmd-3.0"
    | "AceConfigRegistry-3.0"
    | "AceSerializer-3.0"
    | "LibRangeCheck-2.0";

declare const LibStub: <T extends LibStubName>(this: void, name: T) =>
    T extends "AceAddon-3.0" ? AceAddonLibStub :
    T extends "AceComm-3.0" ? AceCommLibStub :
    T extends "AceLocale-3.0" ? AceLocaleLibStub :
    T extends "AceGUI-3.0" ? AceGuiLibStub :
    T extends "AceConfigCmd-3.0" ? AceConfigCmdLibStub :
    T extends "AceConfigRegistry-3.0" ? AceConfigRegistryLibStub :
    T extends "AceSerializer-3.0" ? AceSerializerLibStub :
    T extends "LibRangeCheck-2.0" ? LibRangeCheckLibStub :
    never;