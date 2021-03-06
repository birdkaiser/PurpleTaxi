interface CTimer {
    /// https://wow.gamepedia.com/API_C_Timer.After
    After: (this: void, seconds: number, callback: () => void) => void;

    /// https://wow.gamepedia.com/API_C_Timer.NewTicker
    NewTicker: (this: void, seconds: number, callback: () => void) => void;
}

declare const C_Timer: CTimer;

type RaidMemberName = string;
type RaidMemberRank = 0 | 1 | 2;
type RaidMemberLevel = number;
type RaidMemberClass = "DRUID" | "HUNTER" | "MAGE" | "PALADIN" | "PRIEST" | "ROGUE" | "SHAMAN" | "WARLOCK" | "WARRIOR";
type RaidMemberSubGroup = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type RaidMemberFileName = string;
type RaidMemberZone = string;
type RaidMemberOnline = boolean;
type RaidMemberIsDead = boolean;
type RaidMemberRole = "maintank" | "mainassist" | null;
type RaidMemberIsMl = boolean;
type RaidMemberCombatRole = "DAMAGER" | "TANK" | "HEALER" | "NONE";
type RaidRosterInfo = [RaidMemberName, RaidMemberRank, RaidMemberSubGroup, RaidMemberLevel, RaidMemberClass, RaidMemberFileName, RaidMemberZone, RaidMemberOnline, RaidMemberIsDead, RaidMemberRole, RaidMemberRole, RaidMemberCombatRole];

/// https://wow.gamepedia.com/API_GetRaidRosterInfo
/** @tupleReturn */
declare function GetRaidRosterInfo(this: void, raidIndex: number): RaidRosterInfo;

/// https://wow.gamepedia.com/API_GetRealZoneText
declare function GetRealZoneText(this: void): string;

/// https://wow.gamepedia.com/API_GetServerTime
declare function GetServerTime(this: void): number;

/// https://wow.gamepedia.com/API_GetSubZoneText
declare function GetSubZoneText(this: void): string;

/// https://wow.gamepedia.com/API_IsInGroup
type GroupType = "LE_PARTY_CATEGORY_HOME" | "LE_PARTY_CATEGORY_INSTANCE";
declare function IsInGroup(this: void, groupType?: GroupType): boolean;

/// https://wow.gamepedia.com/API_UnitIsGroupLeader
declare function UnitIsGroupLeader(this: void, unitName: string): boolean;