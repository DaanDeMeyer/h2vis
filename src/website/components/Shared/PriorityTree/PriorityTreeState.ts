import * as _ from "lodash";
import * as d3 from "d3";
import { HierarchyNode } from "d3-hierarchy";
import { Dictionary } from "lodash";
import { computed, observable } from "mobx";

import { Source } from "data-format";
import {
    Http2Connection,
    Http2Data,
    Http2Frame,
    Http2FrameType,
    Http2Headers,
    Http2Priority,
    Http2PushPromise,
    Http2RstStream,
    Http2Stream
} from "data-format/protocols/http2";
import { FileData } from "utils/file";

const DEFAULT_STREAM_WEIGHT = 16;

export interface PriorityNode {
    id: number;
    file: FileData | undefined;
    state: PriorityNodeState;
    parent: PriorityNode | undefined;
    weight: number;
    // lastUpdatedAt: number;
}

export enum PriorityNodeState {
    IDLE = "IDLE",
    RESERVED = "RESERVED",
    REFERENCED = "REFERENCED",
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}

const ROOT_NODE: PriorityNode = {
    id: 0,
    file: undefined,
    state: PriorityNodeState.REFERENCED,
    parent: undefined,
    weight: 0
    // lastUpdatedAt: 0
};

export type PriorityChange = Http2Headers | Http2PushPromise | Http2Priority | Http2Data | Http2RstStream;

const stratify = d3
    .stratify<PriorityNode>()
    .id(node => node.id.toString())
    .parentId(node => (node.parent ? node.parent.id.toString() : undefined));

export abstract class PriorityTreeState {
    readonly connection: Http2Connection;
    readonly changes: Array<PriorityChange>;

    @observable protected next: number;

    constructor(connection: Http2Connection, next?: number) {
        this.connection = connection;
        this.changes = filterPriorityTreeChanges(connection);
        this.next = next ? next : 0;
    }

    root(removeClosedStreams: boolean, removeIdleStreams: boolean): HierarchyNode<PriorityNode> {
        return computed(() => {
            const streams = this.connection.streams;
            const tree: Array<PriorityNode> = buildInitialTree(streams);

            const byId = _.keyBy(tree, node => node.id);
            _.forEach(this.appliedChanges, change => applyChangeToTree(byId, change, removeClosedStreams));

            if (removeIdleStreams) _.remove(tree, node => node.state === PriorityNodeState.IDLE);
            if (removeClosedStreams) _.remove(tree, node => node.state === PriorityNodeState.CLOSED);

            return stratify(tree);
        }).get();
    }

    @computed
    get appliedChanges(): Array<PriorityChange> {
        return _.slice(this.changes, 0, this.next);
    }

    @computed
    get remainingChanges(): Array<PriorityChange> {
        return _.slice(this.changes, this.next);
    }

    applyIsAvailable(next?: number): boolean {
        return computed(
            () => (next ? next < this.changes.length : this.next < this.changes.length)
        ).get();
    }

    undoIsAvailable(next?: number): boolean {
        return computed(() => (next ? next > 0 : this.next > 0)).get();
    }

    nextChange(next?: number): PriorityChange {
        return next ? this.changes[next] : this.changes[this.next]!;
    }

    lastChange(next?: number): PriorityChange {
        return next ? this.changes[next - 1] : this.changes[this.next - 1]!;
    }
}

export function filterPriorityTreeChanges(connection: Http2Connection): Array<PriorityChange> {
    return _.chain(connection.streams)
        .flatMap(stream => _.filter(stream.messages, message => isPriorityChange(stream, message)))
        .sortBy(frame => frame.arrivalStart)
        .value() as Array<PriorityChange>;
}

function buildInitialTree(streams: Array<Http2Stream>): Array<PriorityNode> {
    // At the start of a HTTP2 connection all streams are in the IDLE state and dependant on the root node.
    const withoutZero = _.filter(streams, stream => stream.id !== 0);
    const nodes: Array<PriorityNode> = _.map(withoutZero, stream => ({
        id: stream.id,
        file: stream.file,
        state: PriorityNodeState.IDLE,
        parent: ROOT_NODE,
        weight: DEFAULT_STREAM_WEIGHT,
        lastUpdatedAt: 0
    }));

    nodes.push(ROOT_NODE);

    return nodes;
}

function applyChangeToTree(tree: Dictionary<PriorityNode>, change: PriorityChange, removeClosedStreams: boolean) {
    let node = tree[change.streamId];

    if (change.type === Http2FrameType.HEADERS && change.source === Source.CLIENT) {
        node.state = PriorityNodeState.OPEN;
        handlePriority(tree, node, change, removeClosedStreams);
    }

    if (change.type === Http2FrameType.PUSH_PROMISE && change.source === Source.SERVER) {
        node = tree[change.promisedStreamId]; // push promise applies to a different stream than the current stream
        node.state = PriorityNodeState.RESERVED;
        node.parent = tree[change.streamId];
    }

    if (change.type === Http2FrameType.PRIORITY && change.source === Source.CLIENT) {
        // If an IDLE stream is reprioritized we want to show it the tree
        node.state = node.state === PriorityNodeState.IDLE ? PriorityNodeState.REFERENCED : node.state;
        handlePriority(tree, node, change, removeClosedStreams);
    }

    if (change.type === Http2FrameType.HEADERS && change.source === Source.SERVER && !change.flags.endStream) {
        node.state = PriorityNodeState.OPEN;
    }

    if (change.type === Http2FrameType.HEADERS && change.source === Source.SERVER && change.flags.endStream) {
        handleClose(tree, node, change, removeClosedStreams);
    }

    if (change.type === Http2FrameType.DATA && change.source === Source.SERVER && change.flags.endStream) {
        handleClose(tree, node, change, removeClosedStreams);
    }

    if (change.type === Http2FrameType.RST_STREAM) {
        handleClose(tree, node, change, removeClosedStreams);
    }

    // streams in the IDLE state are not represented in the priority tree. However, if other streams are made dependant
    // on an IDLE stream it has to included in the tree. We represent this case by changing the IDLE node's state to the
    // REFERENCED state.
    if (node.parent && node.parent.state === PriorityNodeState.IDLE) {
        node.parent.state = PriorityNodeState.REFERENCED;
    }

    // node.lastUpdatedAt = change.arrivalStart;
}

function handleClose(
    tree: Dictionary<PriorityNode>,
    node: PriorityNode,
    change: PriorityChange,
    removeClosedStreams: boolean
) {
    node.state = PriorityNodeState.CLOSED;

    if (removeClosedStreams) {
        const children = _.filter(tree, treeNode => treeNode.parent !== undefined && treeNode.parent === node);
        const totalWeight = _.sumBy(children, child => child.weight);
        _.forEach(children, child => (child.weight += child.weight / totalWeight * node.weight));
        _.forEach(children, child => (child.parent = node.parent!));
        // _.forEach(children, child => (child.lastUpdatedAt = change.arrivalStart));
    }
}

function handlePriority(
    tree: Dictionary<PriorityNode>,
    node: PriorityNode,
    change: Http2Priority | Http2Headers,
    removeClosedStreams: boolean
) {
    const newParent = change.dependency === undefined ? node.parent! : tree[change.dependency]!;

    if (newParent.state === PriorityNodeState.CLOSED && removeClosedStreams) {
        node.parent = ROOT_NODE;
        node.weight = DEFAULT_STREAM_WEIGHT;
    } else {
        // Check if the new parent is currently a child of the reprioritized node. If so, The new parent becomes
        // dependant on the node's previous parent. If this is confusing, check http://httpwg.org/specs/rfc7540.html#reprioritize
        if (isDependantOn(newParent, node)) {
            newParent.parent = node.parent;
            // newParent.lastUpdatedAt = change.arrivalStart;
        }

        node.parent = newParent;
        node.weight = change.weight ? change.weight : node.weight;

        if (change.exclusive) {
            const siblings = _.filter(tree, treeNode => treeNode.parent === node.parent && treeNode.id !== node.id);
            const nonIdle = _.filter(siblings, sibling => sibling.state !== PriorityNodeState.IDLE);
            _.forEach(nonIdle, sibling => (sibling.parent = node));
            // _.forEach(nonIdle, sibling => (sibling.lastUpdatedAt = change.arrivalStart));
        }
    }
}

/**
 * Checks if a node is dependant on another node
 */
function isDependantOn(child: PriorityNode, parent: PriorityNode): boolean {
    let current = child;

    while (current.parent !== undefined) {
        if (current.id === parent.id) {
            return true;
        }

        current = current.parent!;
    }

    return false;
}

function isPriorityChange(stream: Http2Stream, frame: Http2Frame): frame is PriorityChange {
    // A HEADERS frame from client opens a stream and sets priority information
    if (frame.type === Http2FrameType.HEADERS && frame.source === Source.CLIENT) return true;

    // A PUSH_PROMISE frame from the server reserves a stream and sets priority information
    if (frame.type === Http2FrameType.PUSH_PROMISE && frame.source === Source.SERVER) return true;

    // A PRIORITY frame sets priority information
    if (frame.type === Http2FrameType.PRIORITY && frame.source === Source.CLIENT) return true;

    // A HEADERS frame from the server opens a stream if it has been reserved
    if (frame.type === Http2FrameType.HEADERS && frame.source === Source.SERVER && stream.pushPromise) return true;

    // A HEADERS frame from the server closes a stream if it has the end_stream flag set
    if (frame.type === Http2FrameType.HEADERS && frame.source === Source.SERVER && frame.flags.endStream) return true;

    // A DATA frame from the server closes a stream if it has the end_stream flag set
    if (frame.type === Http2FrameType.DATA && frame.source === Source.SERVER && frame.flags.endStream) return true;

    // A RST_STREAM frame closes a stream
    if (frame.type === Http2FrameType.RST_STREAM) return true;

    return false;
}
