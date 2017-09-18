import * as _ from "lodash";
import { action, observable } from "mobx";

import { TraceTimelinePageState } from "website/components/App/TraceTimelinePage/state";
import { PriorityTreePageState } from "website/components/App/PriorityTreePage/state";
import { ConnectionProtocol, Trace } from "data-format";
import { PriorityTreeSnapshotPageState } from "website/components/App/PriorityTreeSnapshotPage/state";

export enum Page {
    TRACETIMELINE = "Trace Timeline",
    PRIORITY_TREE = "Priority Tree",
    PRIORITY_TREE_SNAPSHOT = "Priority Tree Snapshot"
}

export class AppState {
    @observable.shallow traces: Trace[];
    @observable selectedPage: Page = Page.TRACETIMELINE;
    @observable.ref selectedTrace: Trace | undefined;

    @observable.ref traceTimelinePage: TraceTimelinePageState | undefined;
    @observable.ref priorityTreePage: PriorityTreePageState | undefined;
    @observable.ref priorityTreeSnapshotPage: PriorityTreeSnapshotPageState | undefined;

    constructor(traces: Trace[]) {
        this.traces = traces;

        if (traces.length > 0) {
            this.setSelectedTrace(traces[0])
        } else {
            this.selectedTrace = undefined;
            this.traceTimelinePage = undefined;
            this.priorityTreePage = undefined;
        }
    }

    @action
    addTraces(traces: Trace[]) {
        if (this.traces.length === 0 && traces.length > 0) {
            this.setSelectedTrace(traces[0]);
        }

        _.forEach(traces, newTrace => {
            if (_.every(this.traces, trace => trace.name !== newTrace.name)) {
                this.traces.push(newTrace)
            }
        })
    }

    @action
    setSelectedPage(page: Page) {
        this.selectedPage = page;
    }

    @action
    setSelectedTrace(trace: Trace) {
        this.selectedTrace = trace;
        this.traceTimelinePage = new TraceTimelinePageState(trace);

        const http2Connections = _.filter(
            trace.connections,
            connection => connection.protocol === ConnectionProtocol.HTTP2
        );

        if (http2Connections.length > 0) {
            this.priorityTreePage = new PriorityTreePageState(trace);
            this.priorityTreeSnapshotPage = new PriorityTreeSnapshotPageState(trace);
        } else {
            this.priorityTreePage = undefined;
            this.priorityTreeSnapshotPage = undefined;
        }
    }
}
