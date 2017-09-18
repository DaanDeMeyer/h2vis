import { IConnection, IMessage, ConnectionProtocol, IStream } from "data-format";
import { Dictionary } from "lodash";

export interface Http2Connection extends IConnection {
    protocol: ConnectionProtocol.HTTP2;
    streams: Array<Http2Stream>;
}

export interface Http2Stream extends IStream {
    protocol: ConnectionProtocol.HTTP2;
    pushPromise: Http2PushPromise | undefined;
    messages: Array<Http2Frame>;
}

export type Http2Frame =
    | Http2Data
    | Http2Headers
    | Http2Priority
    | Http2RstStream
    | Http2Settings
    | Http2PushPromise
    | Http2Ping
    | Http2GoAway
    | Http2WindowUpdate
    | Http2Continuation;

export enum Http2FrameType {
    DATA = "DATA",
    HEADERS = "HEADERS",
    PRIORITY = "PRIORITY",
    RST_STREAM = "RST_STREAM",
    SETTINGS = "SETTINGS",
    PUSH_PROMISE = "PUSH_PROMISE",
    PING = "PING",
    GO_AWAY = "GO_AWAY",
    WINDOW_UPDATE = "WINDOW_UPDATE",
    CONTINUATION = "CONTINUATION"
}

export interface IHttp2Frame extends IMessage {
    protocol: ConnectionProtocol.HTTP2;
    type: Http2FrameType;
    length: number;
    streamId: number;
}

export interface Http2Data extends IHttp2Frame {
    type: Http2FrameType.DATA;
    padLength: number | undefined;

    flags: {
        endStream: boolean;
        padded: boolean;
    };
}

export interface Http2Headers extends IHttp2Frame {
    type: Http2FrameType.HEADERS;
    headers: Dictionary<string>;
    padLength: number | undefined;

    dependency: number | undefined;
    exclusive: boolean | undefined;
    weight: number | undefined;

    flags: {
        endStream: boolean;
        endHeaders: boolean;
        padded: boolean;
        priority: boolean;
    };
}

export interface Http2Priority extends IHttp2Frame {
    type: Http2FrameType.PRIORITY;
    dependency: number;
    exclusive: boolean;
    weight: number;
}

export interface Http2RstStream extends IHttp2Frame {
    type: Http2FrameType.RST_STREAM;
    errorCode: number;
}

export interface Http2Settings extends IHttp2Frame {
    type: Http2FrameType.SETTINGS;
    settings: Array<Http2Setting>
}

export interface Http2Setting {
    type: Http2SettingType;
    value: number;
}

export enum Http2SettingType {
    HEADER_TABLE_SIZE = 1,
    ENABLE_PUSH = 2,
    MAX_CONCURRENT_STREAMS = 3,
    INITIAL_WINDOW_SIZE = 4,
    MAX_FRAME_SIZE = 5,
    MAX_HEADER_LIST_SIZE = 6
}

export interface Http2PushPromise extends IHttp2Frame {
    type: Http2FrameType.PUSH_PROMISE;
    headers: Dictionary<string>;
    promisedStreamId: number;
    padLength: number | undefined;

    flags: {
        endHeaders: boolean;
        padded: boolean;
    }
}

export interface Http2Ping extends IHttp2Frame {
    type: Http2FrameType.PING;
    flags: {
        ack: boolean;
    }
}

export interface Http2GoAway extends IHttp2Frame {
    type: Http2FrameType.GO_AWAY;
    lastStreamId: number;
    errorCode: number;
    additionalDebugData: string;
}

export interface Http2WindowUpdate extends IHttp2Frame {
    type: Http2FrameType.WINDOW_UPDATE;
    windowSizeIncrement: number;
}

export interface Http2Continuation extends IHttp2Frame {
    type: Http2FrameType.CONTINUATION;
    headers: Dictionary<string>;
}
