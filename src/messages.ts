export interface ServiceAvailableMessage {
    readonly type: "serviceAvailable"
    readonly characterName: string;
    readonly realZoneText: string;
    readonly subZoneText: string;
    readonly soulShardsRemaining: number;
}

export interface ServiceStoppedMessage {
    readonly type: "serviceStopped"
    readonly characterName: string;
}

export type Message =
    | ServiceAvailableMessage
    | ServiceStoppedMessage;

export type MessageDistribution =
    | [AddonChannelId]
    | ["WHISPER", string];

export type DispatchMessageFn = (distribution: MessageDistribution, message: Message) => void;
