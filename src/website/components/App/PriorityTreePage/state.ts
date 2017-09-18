import * as _ from "lodash";
import { action, computed, observable } from "mobx";
import { ConnectionProtocol, Trace } from "data-format";
import { Http2Connection } from "data-format/protocols/http2";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import { MutablePriorityTreeState } from "website/components/Shared/PriorityTree/MutablePriorityTreeState";
import { filterPriorityTreeChanges } from "website/components/Shared/PriorityTree/PriorityTreeState";

export class PriorityTreePageState {
    readonly trace: Trace;
    @observable.ref selectedConnection: Http2Connection;

    @observable priorityTree: MutablePriorityTreeState;
    @observable changesTimelineAxis: ZoomAxisState;

    @observable removeClosedStreams: boolean;

    constructor(trace: Trace) {
        this.trace = trace;
        this.removeClosedStreams = false;
        this.setSelectedConnection(this.connections[0]!);
    }

    @action
    setSelectedConnection(connection: Http2Connection) {
        this.selectedConnection = connection;
        this.priorityTree = new MutablePriorityTreeState(connection);
        this.priorityTree.applyAll();

        const arrivalTimes = _.map(this.priorityTree.changes, change => change.arrivalEnd);
        const earliest = _.min(arrivalTimes);
        const latest = _.max(arrivalTimes);

        this.changesTimelineAxis = new ZoomAxisState(earliest ? earliest : 0, latest ? latest : 3000);
    }

    @action
    setRemoveClosedStreams(value: boolean) {
        this.removeClosedStreams = value;
    }

    @computed
    get connections(): Http2Connection[] {
        return _.filter(this.trace.connections, connection => {
            return connection.protocol === ConnectionProtocol.HTTP2 && filterPriorityTreeChanges(connection).length > 0;
        }) as Http2Connection[];
    }
}
