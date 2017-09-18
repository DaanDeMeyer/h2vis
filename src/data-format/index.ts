import { FileData } from "utils/file";
import { Http2Connection, Http2Frame, Http2Stream } from "data-format/protocols/http2";
import { Http1Connection, Http1Message, Http1Stream } from "data-format/protocols/http1";

export interface Trace {
    name: string;
    connections: Array<Connection>;
}

export type Connection = Http1Connection | Http2Connection;
export type Stream = Http1Stream | Http2Stream;
export type Message = Http1Message | Http2Frame;

// Strings are the protocols as they are named in tshark
export enum ConnectionProtocol {
    HTTP1 = "http",
    HTTP2 = "http2"
}

export interface IConnection {
    id: number;
    protocol: ConnectionProtocol;
    initialRtt?: number;
    tls: boolean;
    client: string;
    serverIp: string;
    serverPort: number;
    serverHostname: string;
    segments: Array<Segment>;
    streams: Array<IStream>;
}

export interface IStream {
    id: number;
    protocol: ConnectionProtocol;
    file: FileData | undefined;
    messages: Array<Message>;
}

export enum Source {
    CLIENT = "CLIENT",
    SERVER = "SERVER"
}

export interface IMessage {
    id: number;
    protocol: ConnectionProtocol;
    source: Source;
    arrivalStart: number;
    arrivalEnd: number;
    segmentIds: Array<number>;
}

export interface Segment {
    id: number;
    source: Source;
    streamId: number;
    time: number;
    dataLength: number;
    headerLength: number;
    sequenceNumber: number;
    acknowledgementNumber: number;
    receiveWindow: number;
    messageIds: Array<number>;

    flags: {
        res: boolean;
        ns: boolean;
        cwr: boolean;
        ece: boolean;
        urg: boolean;
        ack: boolean;
        psh: boolean;
        rst: boolean;
        syn: boolean;
        fin: boolean;
    };
}
