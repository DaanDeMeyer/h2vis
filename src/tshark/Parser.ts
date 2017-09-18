import * as _ from "lodash";
import { Dictionary } from "lodash";
import { Source, Segment, Connection } from "data-format";

export interface MessageCommon {
    id: number;
    source: Source;
    arrivalStart: number;
    arrivalEnd: number;
    segmentIds: Array<number>;
}

export interface ConnectionCommon {
    id: number;
    initialRtt?: number;
    tls: boolean;
    client: string;
    serverIp: string;
    serverPort: number;
    serverHostname: string;
}

export abstract class Parser {
    public abstract parse(packets: Array<any>): Connection | undefined;

    private currentId: number;
    private packetLookup: Dictionary<any>;
    private clientIp: string;

    public constructor(packets: Array<any>) {
        this.currentId = 0;
        this.packetLookup = _.keyBy(packets, (packet: any) => packet["frame"]["frame.number"]);
        this.clientIp = parseClientIp(packets);
    }

    protected parseSegment(packet: any): Segment {
        const flags = packet["tcp"]["tcp.flags_tree"];

        return {
            id: Number(packet["frame"]["frame.number"]),
            source: isSourcePacket(packet, this.clientIp),
            streamId: Number(packet["tcp"]["tcp.stream"]),
            time: Number(packet["frame"]["frame.time_epoch"]),
            dataLength: Number(packet["tcp"]["tcp.len"]),
            headerLength: Number(packet["tcp"]["tcp.hdr_len"]),
            sequenceNumber: Number(packet["tcp"]["tcp.seq"]),
            acknowledgementNumber: Number(packet["tcp"]["tcp.ack"]),
            receiveWindow: Number(packet["tcp"]["tcp.window_size"]),
            messageIds: [],

            flags: {
                res: flagIsSet(flags["tcp.flags.res"]),
                ns: flagIsSet(flags["tcp.flags.ns"]),
                cwr: flagIsSet(flags["tcp.flags.cwr"]),
                ece: flagIsSet(flags["tcp.flags.ecn"]),
                urg: flagIsSet(flags["tcp.flags.urg"]),
                ack: flagIsSet(flags["tcp.flags.ack"]),
                psh: flagIsSet(flags["tcp.flags.push"]),
                rst: flagIsSet(flags["tcp.flags.reset"]),
                syn: flagIsSet(flags["tcp.flags.syn"]),
                fin: flagIsSet(flags["tcp.flags.fin"])
            },
        };
    }

    protected parseMessageCommon(packet: any): MessageCommon {
        const segmentIds = this.calculateReassembledSegmentIds(packet);
        const firstSegmentPacket = this.packetLookup[_.first(segmentIds)!];
        const lastSegmentPacket = this.packetLookup[_.last(segmentIds)!];

        return {
            id: this.currentId++,
            source: isSourcePacket(packet, this.clientIp),
            arrivalStart: Number(firstSegmentPacket["frame"]["frame.time_epoch"]),
            arrivalEnd: Number(lastSegmentPacket["frame"]["frame.time_epoch"]),
            segmentIds: []
        };
    }

    private calculateReassembledSegmentIds(packet: any): number[] {
        return _.chain(packet)
            .get<any>(["ssl.segments", "ssl.segment_array"], [packet.frame["frame.number"]])
            .flatMap((segmentKey: any) => {
                const segmentPacket = this.packetLookup[segmentKey];
                return _.get(
                    segmentPacket,
                    ["tcp.segments", "tcp.segment_array"],
                    [segmentPacket["frame"]["frame.number"]]
                );
            })
            .uniq()
            .map((id: any) => Number(id))
            .value();
    }

    protected parseConnectionCommon(packets: Array<any>): ConnectionCommon {
        const { ip, port } = parseServerIpAndPort(packets);
        const initialRttSegment = _.find(packets, packet => {
            return (
                packet["tcp"] !== undefined &&
                packet["tcp"]["tcp.analysis"] !== undefined &&
                packet["tcp"]["tcp.analysis"]["tcp.analysis.initial_rtt"] !== undefined
            );
        });

        const initialRtt: number | undefined = initialRttSegment
            ? Number(initialRttSegment["tcp"]["tcp.analysis"]["tcp.analysis.initial_rtt"])
            : undefined;

        return {
            id: Number(packets[0]["tcp"]["tcp.stream"]),
            initialRtt: initialRtt,
            tls: isTlsConnection(packets),
            client: parseClientIp(packets),
            serverIp: ip,
            serverPort: port,
            serverHostname: parseServerHostname(packets)
        };
    }
}

export function flagIsSet(flag: string | undefined): boolean {
    return flag !== undefined && flag === "1";
}

function isTlsConnection(packets: Array<any>): boolean {
    return _.some(packets, packet => {
        const allProtocols = _.split(packet["frame"]["frame.protocols"], ":");
        return _.some(allProtocols, protocol => protocol === "ssl");
    });
}

function parseClientIp(packets: Array<any>): string {
    const clientPacket = findClientPacket(packets);
    const clientIp = parsePacketSourceIp(clientPacket);
    return clientIp;
}

interface IpAndPort {
    ip: string;
    port: number;
}

function parseServerIpAndPort(packets: Array<any>): IpAndPort {
    const serverPacket = findServerPacket(packets);
    if (!serverPacket) {
        return {
            ip: "",
            port: 0
        };
    }

    return {
        ip: parsePacketSourceIp(serverPacket),
        port: parsePacketSourcePort(serverPacket)
    };
}

function parseServerHostname(packets: Array<any>): string {
    const serverPacket = findServerPacket(packets);
    if (!serverPacket) {
        return "";
    }
    const ip = serverPacket["ip"] ? serverPacket["ip"] : serverPacket["ipv6"]
    const serverHostname = ip["ip.src_host"];
    return serverHostname;
}

function findClientPacket(packets: Array<any>): any {
    let clientPacket = _.find(packets, packet => packet["tcp"]["tcp.flags"] === "0x00000002");
    if (!clientPacket) {
        clientPacket = _.find(packets, packet => {
            return packet["tcp"]["tcp.dstport"] === "80" || packet["tcp"]["tcp.dstport"] === "443";
        });
    }

    return clientPacket;
}

function findServerPacket(packets: Array<any>): any {
    let serverPacket = _.find(packets, packet => {
        return _.get(packet, ["tcp", "tcp.flags"]) === "0x00000012";
    });

    if (!serverPacket) {
        serverPacket = _.find(packets, packet => {
            const httpSrcPort = _.get(packet, ["tcp", "tcp.srcport"]);
            const sslSrcPort = _.get(packet, ["tcp", "tcp.srcport"]);
            return httpSrcPort === "80" || sslSrcPort === "443";
        });
    }

    return serverPacket;
}

function parsePacketSourceIp(packet: any): string {
    let sourceIp;
    if (packet["ip"]) {
        sourceIp = packet["ip"]["ip.src"];
    } else {
        sourceIp = packet["ipv6"]["ipv6.src"];
    }

    return sourceIp;
}

function parsePacketSourcePort(packet: any): number {
    return Number(packet["tcp"]["tcp.srcport"]);
}

function isSourcePacket(packet: any, clientIp: string): Source {
    const packetSourceIp = parsePacketSourceIp(packet);
    if (packetSourceIp === clientIp) {
        return Source.CLIENT;
    } else {
        return Source.SERVER;
    }
}
