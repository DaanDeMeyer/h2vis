import * as _ from "lodash";
import * as Path from "path";
import * as ChildProcess from "child_process";
import * as Oboe from "oboe";

import { ConnectionProtocol, Trace } from "data-format";
import { Parser } from "tshark/Parser";
import { Http1Parser } from "tshark/parsers/Http1Parser";
import { Http2Parser } from "tshark/parsers/Http2Parser";
import { ParsedPath } from "path";

export function traceFromPcap(pcap: ParsedPath, tls: ParsedPath): Promise<Trace> {
    return pcapToTsharkJsonOutput(pcap, tls).then(tsharkJsonOutput => {
        const packets = _.map(tsharkJsonOutput, packet => packet["_source"]["layers"]);
        const withoutFalseValues = _.compact(packets);
        const groupedByConnection = _.groupBy(withoutFalseValues, packet => packet["tcp"]["tcp.stream"]);
        const connections = _.map(groupedByConnection, packets => {
            const protocol = findStreamProtocol(packets);

            if (protocol) {
                const parser = parserForType(protocol, packets);
                return parser.parse(packets);
            } else {
                return undefined;
            }
        });

        const trace: Trace = {
            name: pcap.name,
            connections: _.compact(connections)
        };

        return trace;
    });
}

function parserForType(type: ConnectionProtocol, packets: Array<any>): Parser {
    switch (type) {
        case ConnectionProtocol.HTTP1:
            return new Http1Parser(packets);
        case ConnectionProtocol.HTTP2:
            return new Http2Parser(packets);
    }
}

function pcapToTsharkJsonOutput(pcap: ParsedPath, tls: ParsedPath): Promise<any[]> {
    const command = "tshark";
    const args = [
        "-2",
        "-r" + Path.format(pcap),
        "-o" + `ssl.keylog_file:${Path.format(tls)}`,
        "-o" + "nameres.network_name:TRUE",
        "-o" + "nameres.dns_pkt_addr_resolution:TRUE",
        "-o" + "nameres.use_external_name_resolver:TRUE",
        "-T" + "json",
        "-Y" + "http2 || http || tcp"
    ];

    const tsharkProcess = ChildProcess.spawn(command, args);

    return new Promise<any[]>((resolve, reject) => {
        Oboe(tsharkProcess.stdout)
            .node("http2", duplicatesToArray)
            .node('["http2.stream"]', duplicatesToArray)
            .node('["http2.header"]', duplicatesToArray)
            .node('["http2.settings"]', duplicatesToArray)
            .node("http", duplicatesToArray)
            .node('["http.request.line"]', duplicatesToArray)
            .node('["http.response.line"]', duplicatesToArray)
            .node('["ssl.segment"]', duplicatesToArray)
            .node('["tcp.segment"]', duplicatesToArray)
            .done(resolve)
            .fail(reject);
    });
}

/**
 * This function converts duplicate keys in an object into an array. This will break once the duplicate keys bug in
 * Wireshark is fixed.
 */
function duplicatesToArray(node: any, pathOrHeaders: string[], ancestors: any[]) {
    const key = pathOrHeaders[pathOrHeaders.length - 1];
    const arrayKey = key + "_array";
    const parent: any = ancestors[ancestors.length - 2];
    if (typeof parent === "object") {
        if (!parent.hasOwnProperty(arrayKey)) {
            parent[arrayKey] = [];
        }
        parent[arrayKey].push(node);
    }

    return Oboe.drop;
}

export function findStreamProtocol(packets: Array<any>): ConnectionProtocol | undefined {
    const distinctProtocols = _.reduce<any, Array<string>>(
        packets,
        (acc, packet) => {
            const allProtocols = _.split(packet["frame"]["frame.protocols"], ":");
            return _.union(acc, allProtocols);
        },
        []
    );

    if (_.find(distinctProtocols, protocol => protocol === ConnectionProtocol.HTTP2)) return ConnectionProtocol.HTTP2;
    if (_.find(distinctProtocols, protocol => protocol === ConnectionProtocol.HTTP1)) return ConnectionProtocol.HTTP1;
    return undefined;
}
