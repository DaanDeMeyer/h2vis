import * as _ from "lodash";
import { Dictionary } from "lodash";

import { ConnectionProtocol } from "data-format";
import {
    Http1Connection, Http1Message, Http1Request, Http1MessageType,
    Http1Response, Http1Continuation, Http1Stream
} from "data-format/protocols/http1";
import { contentTypeToFileExtension, FileData } from "utils/file";
import { MessageCommon, Parser } from "tshark/Parser";

export class Http1Parser extends Parser {
    public parse(packets: Array<any>): Http1Connection | undefined {
        const connectionCommon = this.parseConnectionCommon(packets);

        const segments = _.map(packets, packet => this.parseSegment(packet));
        if (segments.length === 0) return undefined;
        const messages = _.flatMap(packets, packet => this.parseHttp1Packet(packet));
        if (messages.length === 0) return undefined;

        const streams = groupHttp1Messages(messages);

        return {
            protocol: ConnectionProtocol.HTTP1,
            ...connectionCommon,
            segments,
            streams
        };
    }

    parseHttp1Packet(packet: any): Array<Http1Message> {
        return _.chain(packet)
            .get<any>("http_array", [])
            .map((http1MessageJson: any) => parseHttp1Message(http1MessageJson, this.parseMessageCommon(packet)))
            .value();
    }
}

function parseHttp1Message(http1MessageJson: any, common: MessageCommon): Http1Message {
    const http1Common = parseHttp1Common(http1MessageJson, common);

    if (_.has(http1MessageJson, "http.request")) return parseHttp1Request(http1MessageJson, http1Common);
    if (_.has(http1MessageJson, "http.response")) return parseHttp1Response(http1MessageJson, http1Common);
    if (_.has(http1MessageJson, "data")) return parseHttp1Continuation(http1MessageJson, http1Common);
    throw Error("Unknown http message");
}

interface Http1Common extends MessageCommon {
    protocol: ConnectionProtocol.HTTP1;
}

function parseHttp1Common(http1MessageJson: any, common: MessageCommon): Http1Common {
    return {
        ...common,
        protocol: ConnectionProtocol.HTTP1
    };
}

function isHttp1RequestLine(value: any): boolean {
    return _.isObject(value) && _.has(value, "http.request.method");
}

function parseHttp1Request(http1MessageJson: any, common: Http1Common): Http1Request {
    const requestLine = _.find(http1MessageJson, isHttp1RequestLine);

    const headersArray = http1MessageJson["http.request.line_array"];
    const headers = parseHttp1Headers(headersArray);

    return {
        ...common,
        type: Http1MessageType.REQUEST,
        method: requestLine["http.request.method"],
        uri: requestLine["http.request.uri"],
        version: requestLine["http.request.version"],
        headers: headers
    };
}

function isHttp1StatusLine(value: any): boolean {
    return _.isObject(value) && _.has(value, "http.response.code");
}

function parseHttp1Response(http1MessageJson: any, common: Http1Common): Http1Response {
    const statusLine = _.find(http1MessageJson, isHttp1StatusLine);

    const headersArray: Array<string> = http1MessageJson["http.response.line_array"];
    const headers = parseHttp1Headers(headersArray);

    return {
        ...common,
        type: Http1MessageType.RESPONSE,
        code: Number(statusLine["http.response.code"]),
        phrase: statusLine["http.response.phrase"],
        headers: headers
    };
}

function parseHttp1Continuation(http1MessageJson: any, common: Http1Common): Http1Continuation {
    return {
        ...common,
        type: Http1MessageType.CONTINUATION,
        dataLength: Number(http1MessageJson["data"]["data.len"])
    };
}

function parseHttp1Headers(headersArray: Array<string>): Dictionary<string> {
    const headers = _.reduce<string, Dictionary<string>>(
        headersArray,
        (acc: Dictionary<string>, headerString: string) => {
            const [name, value] = _.split(headerString, ": ");
            acc[name] = value;
            return acc;
        },
        {}
    );

    return headers;
}

function groupHttp1Messages(messages: Array<Http1Message>): Array<Http1Stream> {
    const streams: Array<Http1Stream> = [];
    let currentId = 1;
    let lastRequest: Http1Stream;

    _.forEach(messages, message => {
        switch (message.type) {
            case Http1MessageType.REQUEST:
                const stream: Http1Stream = {
                    id: currentId++,
                    protocol: ConnectionProtocol.HTTP1,
                    file: undefined,
                    request: message,
                    responses: [],
                    messages: [message]
                };

                streams.push(stream);
                lastRequest = stream;
                break;

            case Http1MessageType.RESPONSE:
                if (lastRequest) {
                    lastRequest.responses.push(message);
                    lastRequest.messages.push(message);
                }
        }
    });

    _.forEach(streams, stream => (stream.file = http1MessagesToFile(stream.request, stream.responses[0])));

    return streams;
}

function http1MessagesToFile(request: Http1Request | undefined, response: Http1Response | undefined): FileData {
    let name = "";
    let ext: string | undefined = undefined;

    if (request) {
        name = request.uri;
        const splitFile = name.split(".");
        if (splitFile.length > 1) {
            ext = splitFile[splitFile.length - 1];
        } else if (response) {
            const contentType: string = response.headers["Content-Type"];
            if (contentType) {
                ext = contentTypeToFileExtension[contentType.split(";")[0]];
            }
        }
    }

    return {
        name: name,
        ext: ext
    };
}
