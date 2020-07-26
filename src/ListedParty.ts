export interface ListedPartyArgs {
    readonly partyGuid: string;
}

export class ListedParty {
    private readonly partyGuid: string;

    constructor(args: ListedPartyArgs) {
        this.partyGuid = args.partyGuid;
    }
}