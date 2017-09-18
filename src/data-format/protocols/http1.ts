import { Dictionary } from "lodash";
import { IConnection, IMessage, ConnectionProtocol, IStream } from "data-format";

export interface Http1Connection extends IConnection {
    protocol: ConnectionProtocol.HTTP1;
    streams: Array<Http1Stream>;
}

export interface Http1Stream extends IStream {
    protocol: ConnectionProtocol.HTTP1;
    request: Http1Request;
    responses: Array<Http1Response>;
    messages: Array<Http1Message>;
}

export type Http1Message = Http1Request | Http1Response | Http1Continuation;

export enum Http1MessageType {
    REQUEST = "REQUEST",
    RESPONSE = "RESPONSE",
    CONTINUATION = "CONTINUATION"
}

export interface IHttp1Message extends IMessage {
    protocol: ConnectionProtocol.HTTP1;
    type: Http1MessageType;
}

export interface Http1Request extends IHttp1Message {
    type: Http1MessageType.REQUEST;
    method: string;
    uri: string;
    version: string;
    headers: Dictionary<string>;
}

export interface Http1Response extends IHttp1Message {
    type: Http1MessageType.RESPONSE;
    code: number;
    phrase: string;
    headers: Dictionary<string>;
}

export interface Http1Continuation extends IHttp1Message {
    type: Http1MessageType.CONTINUATION;
    dataLength: number;
}


