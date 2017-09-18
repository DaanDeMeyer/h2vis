import * as _ from "lodash";
import { action, computed, observable } from "mobx";

import { ConnectionProtocol, Trace } from "data-format";
import { Http2Connection } from "data-format/protocols/http2";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import { ImmutablePriorityTreeState } from "website/components/Shared/PriorityTree/ImmutablePriorityTreeState";
import { filterPriorityTreeChanges } from "website/components/Shared/PriorityTree/PriorityTreeState";

export class PriorityTreeSnapshotPageState {
    readonly trace: Trace;
    @observable.ref selectedConnection: Http2Connection;

    @observable priorityTree: ImmutablePriorityTreeState;
    @observable changesTimelineAxis: ZoomAxisState;

    @observable removeClosedStreams: boolean;
    @observable interval: number;

    constructor(trace: Trace) {
        this.trace = trace;
        this.removeClosedStreams = true;
        this.setSelectedConnection(this.connections[0]!);
    }

    @action
    setSelectedConnection(connection: Http2Connection) {
        this.selectedConnection = connection;
        this.priorityTree = new ImmutablePriorityTreeState(connection);

        this.interval = connection.initialRtt!;

        const arrivalTimes = _.map(this.priorityTree.changes, change => change.arrivalEnd);
        const earliest = _.min(arrivalTimes);
        const latest = _.max(arrivalTimes);

        this.changesTimelineAxis = new ZoomAxisState(earliest ? earliest : 0, latest ? latest : 3000);
    }

    @computed
    get snapshots(): Array<ImmutablePriorityTreeState> {
        const snapshots: Array<ImmutablePriorityTreeState> = [];
        let current = new ImmutablePriorityTreeState(this.selectedConnection);

        while (current.applyIsAvailable()) {
            current = current.applyWithinInterval(this.interval!);
            snapshots.push(current);
        }

        return snapshots;
    }

    @computed
    get connections(): Http2Connection[] {
        return _.filter(this.trace.connections, connection => {
            return connection.protocol === ConnectionProtocol.HTTP2 && filterPriorityTreeChanges(connection).length > 0;
        }) as Http2Connection[];
    }

    @action
    setRemoveClosedStreams(value: boolean) {
        this.removeClosedStreams = value;
    }

    @action setInterval(value: number) {
        this.interval = value;
    }
}
