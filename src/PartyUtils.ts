export interface RaidLeadership {
    readonly leaderName: string;
    readonly assistantNames: ReadonlyArray<string>;
}

export function getRaidLeadership(): RaidLeadership {
    let leaderName = "";
    const assistantNames = [];
    let i = 0;
    while (i < 40) {
        const [raidMemberName, rank] = GetRaidRosterInfo(i + 1);
        if (!raidMemberName) {
            break;
        }

        if (rank === 1) {
            assistantNames.push(raidMemberName);
        } else if (rank === 2) {
            leaderName = raidMemberName;
        }

        i++;
    }
    return {
        leaderName,
        assistantNames,
    };
}