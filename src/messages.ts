export interface ServiceAvailableMessage {
    readonly type: "serviceAvailable"
    readonly characterName: string;
    readonly leaderName: string;
    readonly realZoneText: string;
    readonly subZoneText: string;
    readonly soulShardsRemaining: number;
    readonly clickers: ReadonlyArray<string>;
}

export interface ServiceStoppedMessage {
    readonly type: "serviceStopped"
    readonly characterName: string;
}

export interface PartyListedMessage {
    readonly type: "partyListed";
    readonly partyGuid: string;
    readonly leaderName: string;
    readonly description: string;
    readonly assistantNames: ReadonlyArray<string>;
    readonly summonDestinations: ReadonlyArray<string>;
}

export interface PartyDelistedMessage {
    readonly type: "partyDelisted";
    readonly partyGuid: string;
}

export type Message =
    | ServiceAvailableMessage
    | ServiceStoppedMessage
    | PartyListedMessage
    | PartyDelistedMessage;

export type MessageDistribution =
    | [AddonChannelId]
    | ["WHISPER", string];

export type DispatchMessageFn = (distribution: MessageDistribution, message: Message) => void;