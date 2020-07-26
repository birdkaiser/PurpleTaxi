import { PartyListedMessage, PartyDelistedMessage } from "./messages";
import { DebugFn } from "./types";

export interface PartyInfo {
    readonly partyGuid: string;
    readonly description: string;
    readonly leaderName: string;
    readonly assistantNames: ReadonlyArray<string>;
    readonly timestamp: number;
    readonly summonDestinations: ReadonlyArray<string>;
}

export type PartiesUpdatedHandler = (this: void, groups: ReadonlyArray<PartyInfo>) => void;

const PartyPurgeThreshold = 180; // 3 minutes

export interface PartyMonitorArgs {
    readonly debug: DebugFn;
}

export class PartyMonitor {
    private readonly debug: DebugFn;
    private readonly partiesByGuid: { [k in string]: PartyInfo };
    private partiesUpdatedHandlers: ReadonlyArray<PartiesUpdatedHandler>;

    constructor(args: PartyMonitorArgs) {
        this.debug = args.debug;
        this.partiesByGuid = {};
        this.partiesUpdatedHandlers = [];

        // Purge the store of old parties every 3 minutes.
        C_Timer.NewTicker(60, () => {
            this.purgeOldParties();
        });
    }

    public handlePartyListedMessage(msg: PartyListedMessage): void {
        const { partiesByGuid } = this;
        this.debug(`Adding party with ID ${msg.partyGuid}`);
        partiesByGuid[msg.partyGuid] = {
            partyGuid: msg.partyGuid,
            leaderName: msg.leaderName,
            assistantNames: msg.assistantNames,
            description: msg.description,
            summonDestinations: msg.summonDestinations,
            timestamp: GetServerTime(),
        };

        this.handlePartiesUpdated();
    }

    public handlePartyDelistedMessage(msg: PartyDelistedMessage): void {
        const { partiesByGuid } = this;
        const party = partiesByGuid[msg.partyGuid];
        if (party) {
            this.debug(`Removing party with ID ${party.partyGuid}`);
            delete partiesByGuid[msg.partyGuid];
        }

        this.handlePartiesUpdated();
    }

    public addPartiesUpdatedHandler(handler: PartiesUpdatedHandler): void {
        this.partiesUpdatedHandlers = [...this.partiesUpdatedHandlers, handler];
    }

    public removePartiesUpdatedHandler(handler: PartiesUpdatedHandler): void {
        this.partiesUpdatedHandlers =
            this.partiesUpdatedHandlers
                .filter((h) => h !== handler);
    }

    public get parties(): ReadonlyArray<PartyInfo> {
        const { partiesByGuid } = this;
        const allParties = [];
        for (const id of Object.keys(partiesByGuid)) {
            const party = partiesByGuid[id];
            if (party) {
                allParties.push(party);
            }
        }
        return allParties;
    }

    private handlePartiesUpdated(): void {
        const { partiesUpdatedHandlers } = this;
        if (partiesUpdatedHandlers.length > 0) {
            const { parties } = this;
            for (const handler of partiesUpdatedHandlers) {
                handler(parties);
            }
        }
    }

    private purgeOldParties() {
        const serverTimestamp = GetServerTime();
        const { partiesByGuid } = this;
        for (const id of Object.keys(partiesByGuid)) {
            const party = this.partiesByGuid[id];
            if (serverTimestamp - party.timestamp > PartyPurgeThreshold) {
                this.debug(`Purging party with ID ${party.partyGuid}`);
                delete partiesByGuid[id];
            }
        }

        this.handlePartiesUpdated();
    }
}
