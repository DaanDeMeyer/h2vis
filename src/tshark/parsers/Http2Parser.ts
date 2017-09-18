import * as _ from "lodash";
import {
    Http2Frame,
    Http2PushPromise,
    Http2Headers,
    Http2Data,
    Http2FrameType,
    Http2Priority,
    Http2RstStream,
    Http2Settings,
    Http2Ping,
    Http2GoAway,
    Http2WindowUpdate,
    Http2Continuation,
    Http2Connection,
    Http2Stream,
    Http2Setting,
    Http2SettingType
} from "data-format/protocols/http2";
import { ConnectionProtocol } from "data-format";
import { flagIsSet, MessageCommon, Parser } from "tshark/Parser";
import { contentTypeToFileExtension, FileData } from "utils/file";

export class Http2Parser extends Parser {
    public parse(packets: Array<any>): Http2Connection | undefined {
        const connectionCommon = this.parseConnectionCommon(packets);

        const segments = _.map(packets, packet => this.parseSegment(packet));
        if (segments.length === 0) return undefined;
        const messages = _.flatMap(packets, packet => this.parseHttp2Packet(packet));
        if (messages.length === 0) return undefined;

        const streams = groupHttp2Messages(messages);

        return {
            protocol: ConnectionProtocol.HTTP2,
            ...connectionCommon,
            segments,
            streams
        };
    }

    parseHttp2Packet(packet: any): Array<Http2Frame> {
        return _.chain(packet)
            .get<any>("http2_array", [])
            .flatMap((http2: any) => http2["http2.stream_array"])
            .filter((packet: any) => isHttp2Frame(packet))
            .map((http2FrameJson: any) => parseHttp2Frame(http2FrameJson, this.parseMessageCommon(packet)))
            .value();
    }
}

function isHttp2Frame(http2FrameJson: any) {
    return _.isObject(http2FrameJson) && _.has(http2FrameJson, "http2.type") && _.has(http2FrameJson, "http2.streamid");
}

function parseHttp2Frame(http2FrameJson: any, common: MessageCommon): Http2Frame {
    const http2Common = parseHttp2Common(http2FrameJson, common);
    const type = Number(http2FrameJson["http2.type"]);

    switch (type) {
        case 0:
            return parseHttp2Data(http2FrameJson, http2Common);
        case 1:
            return parseHttp2Headers(http2FrameJson, http2Common);
        case 2:
            return parseHttp2Priority(http2FrameJson, http2Common);
        case 3:
            return parseHttp2RstStream(http2FrameJson, http2Common);
        case 4:
            return parseHttp2Settings(http2FrameJson, http2Common);
        case 5:
            return parseHttp2PushPromise(http2FrameJson, http2Common);
        case 6:
            return parseHttp2Ping(http2FrameJson, http2Common);
        case 7:
            return parseHttp2GoAway(http2FrameJson, http2Common);
        case 8:
            return parseHttp2WindowUpdate(http2FrameJson, http2Common);
        case 9:
            return parseHttp2Continuation(http2FrameJson, http2Common);
        default:
            throw Error("Unknown HTTP2 frame");
    }
}

interface Http2Common extends MessageCommon {
    protocol: ConnectionProtocol.HTTP2;
    streamId: number;
    length: number;
}

function parseHttp2Common(http2FrameJson: any, common: MessageCommon): Http2Common {
    return {
        ...common,
        protocol: ConnectionProtocol.HTTP2,
        streamId: Number(http2FrameJson["http2.streamid"]),
        length: Number(http2FrameJson["http2.length"])
    };
}

function parseHttp2Data(http2FrameJson: any, common: Http2Common): Http2Data {
    return {
        ...common,
        type: Http2FrameType.DATA,
        padLength: http2FrameJson["http2.pad_length"] ? Number(http2FrameJson["http2.pad_length"]) : undefined,
        flags: {
            endStream: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.end_stream"]),
            padded: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.paddded"])
        }
    };
}

function parseHttp2Headers(http2FrameJson: any, common: Http2Common): Http2Headers {
    const packetHeaders = _.keyBy(http2FrameJson["http2.header_array"], (header: any) => header["http2.header.name"]);
    const headers = _.mapValues(packetHeaders, header => header["http2.header.value"]);

    return {
        ...common,
        type: Http2FrameType.HEADERS,
        padLength: http2FrameJson["http2.pad_length"] ? Number(http2FrameJson["http2.pad_length"]) : undefined,
        headers: headers,
        exclusive: flagIsSet(http2FrameJson["http2.exclusive"]),
        dependency: http2FrameJson["http2.stream_dependency"]
            ? Number(http2FrameJson["http2.stream_dependency"])
            : undefined,
        weight: http2FrameJson["http2.headers.weight_real"]
            ? Number(http2FrameJson["http2.headers.weight_real"])
            : undefined,

        flags: {
            endStream: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.end_stream"]),
            endHeaders: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.eh"]),
            priority: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.priority"]),
            padded: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.padded"])
        }
    };
}

function parseHttp2Priority(http2FrameJson: any, common: Http2Common): Http2Priority {
    return {
        ...common,
        type: Http2FrameType.PRIORITY,
        dependency: Number(http2FrameJson["http2.stream_dependency"]),
        exclusive: flagIsSet(http2FrameJson["http2.exclusive"]),
        weight: Number(http2FrameJson["http2.headers.weight_real"])
    };
}

function parseHttp2RstStream(http2FrameJson: any, common: Http2Common): Http2RstStream {
    return {
        ...common,
        type: Http2FrameType.RST_STREAM,
        errorCode: Number(http2FrameJson["http2.rst_stream.error"])
    };
}

function parseHttp2Settings(http2FrameJson: any, common: Http2Common): Http2Settings {
    const settings: Array<Http2Setting> = _.map(http2FrameJson["http2.settings_array"], (settingJson: any) => {
        const type: Http2SettingType = Number(settingJson["http2.settings.id"]);
        let value: number = 0;
        switch (type) {
            case Http2SettingType.HEADER_TABLE_SIZE:
                value = Number(settingJson["http2.settings.header_table_size"]);
                break;
            case Http2SettingType.ENABLE_PUSH:
                value = Number(settingJson["http2.settings.enable_push"]);
                break;
            case Http2SettingType.MAX_CONCURRENT_STREAMS:
                value = Number(settingJson["http2.settings.max_concurrent_streams"]);
                break;
            case Http2SettingType.INITIAL_WINDOW_SIZE:
                value = Number(settingJson["http2.settings.initial_window_size"]);
                break;
            case Http2SettingType.MAX_FRAME_SIZE:
                value = Number(settingJson["http2.settings.max_frame_size"]);
                break;
            case Http2SettingType.MAX_HEADER_LIST_SIZE:
                value = Number(settingJson["http2.settings.max_header_list_size"]);
                break;
        }

        const setting: Http2Setting = {
            type: type,
            value: value
        };

        return setting;
    });

    return {
        ...common,
        type: Http2FrameType.SETTINGS,
        settings: settings
    };
}

function parseHttp2PushPromise(http2FrameJson: any, common: Http2Common): Http2PushPromise {
    const packetHeaders = _.keyBy(http2FrameJson["http2.header_array"], (header: any) => header["http2.header.name"]);
    const headers = _.mapValues(packetHeaders, header => header["http2.header.value"]);

    return {
        ...common,
        type: Http2FrameType.PUSH_PROMISE,
        promisedStreamId: Number(http2FrameJson["http2.push_promise.promised_stream_id"]),
        headers: headers,
        padLength: http2FrameJson["http2.pad_length"] ? Number(http2FrameJson["http2.pad_length"]) : undefined,

        flags: {
            endHeaders: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.eh"]),
            padded: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.padded"])
        }
    };
}

function parseHttp2Ping(http2FrameJson: any, common: Http2Common): Http2Ping {
    return {
        ...common,
        type: Http2FrameType.PING,

        flags: {
            ack: flagIsSet(http2FrameJson["http2.flags_tree"]["http2.flags.ack.ping"])
        }
    };
}

function parseHttp2GoAway(http2FrameJson: any, common: Http2Common): Http2GoAway {
    return {
        ...common,
        type: Http2FrameType.GO_AWAY,
        lastStreamId: Number(http2FrameJson["http2.goaway.last_stream_id"]),
        errorCode: Number(http2FrameJson["http2.goaway.error"]),
        additionalDebugData: http2FrameJson["http2.goaway.addata"]
    };
}

function parseHttp2WindowUpdate(http2FrameJson: any, common: Http2Common): Http2WindowUpdate {
    return {
        ...common,
        type: Http2FrameType.WINDOW_UPDATE,
        windowSizeIncrement: Number(http2FrameJson["http2.window_update.window_size_increment"])
    };
}

function parseHttp2Continuation(http2FrameJson: any, common: Http2Common): Http2Continuation {
    const packetHeaders = _.keyBy(http2FrameJson["http2.header_array"], (header: any) => header["http2.header.name"]);
    const headers = _.mapValues(packetHeaders, header => header["http2.header.value"]);

    return {
        ...common,
        type: Http2FrameType.CONTINUATION,
        headers: headers
    };
}

function groupHttp2Messages(messages: Array<Http2Frame>): Array<Http2Stream> {
    const groupedByStreamId = _.groupBy(messages, it => it.streamId);

    const http2Streams = _.map(groupedByStreamId, streamMessages => {
        const streamId = _.first(streamMessages)!.streamId;
        const pushPromise: Http2PushPromise | undefined = _.find(messages, frame => {
            return frame.type === Http2FrameType.PUSH_PROMISE && frame.promisedStreamId === streamId;
        }) as Http2PushPromise | undefined;

        const stream: Http2Stream = {
            id: streamId,
            protocol: ConnectionProtocol.HTTP2,
            pushPromise: pushPromise,
            file: http2MessagesToFile(streamMessages, pushPromise),
            messages: streamMessages
        };

        return stream;
    });

    return http2Streams;
}

function http2MessagesToFile(
    messages: Array<Http2Frame>,
    pushPromise: Http2PushPromise | undefined
): FileData | undefined {
    let requestHeaders: Http2Headers | Http2PushPromise | undefined = _.find(messages, message => {
        return message.type === Http2FrameType.HEADERS && _.has(message.headers, ":path");
    }) as Http2Headers | undefined;

    if (!requestHeaders && pushPromise) {
        requestHeaders = pushPromise;
    }

    const responseHeaders = _.find(messages, message => {
        return message.type === Http2FrameType.HEADERS && _.has(message.headers, "content-type");
    });

    let name: string | undefined;
    let ext: string | undefined = undefined;

    if (requestHeaders) {
        name = requestHeaders.headers[":path"];

        const splitFile = name!.split(".");
        if (splitFile.length > 1) {
            ext = splitFile[splitFile.length - 1];
        } else if (responseHeaders) {
            const contentType: string = (responseHeaders as Http2Headers).headers["content-type"];
            ext = contentTypeToFileExtension[contentType.split(";")[0]];
        }
    }

    if (name) {
        return {
            name: name,
            ext: ext
        };
    } else {
        return undefined;
    }
}
