import "@wartoshika/wow-classic-declarations";

export type DebugFn = (msg: string) => void

export interface Warlock {
    readonly characterName: string;
    realZoneText: string;
    subZoneText: string;
    soulShardsRemaining: number;
    nearbyClickers: ReadonlyArray<string>;
}

export interface DestinationWarlock {
    readonly characterName: string;
    soulShardsRemaining: number;
}

export interface DestinationClicker {
    readonly characterName: string;
}

export interface Destination {
    realZoneText: string;
    subZoneText: string;
    warlocks: DestinationWarlock[];
    clickers: DestinationClicker[];
}
