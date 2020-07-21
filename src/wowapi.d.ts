interface CTimer {
    After: (this: void, seconds: number, callback: () => void) => void;
    NewTicker: (this: void, seconds: number, callback: () => void) => void;
}

declare const C_Timer: CTimer;

// https://wow.gamepedia.com/API_GetRaidRosterInfo
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

/** @tupleReturn */
declare function GetRaidRosterInfo(this: void, raidIndex: number): RaidRosterInfo;