import * as _ from "lodash";

import { ConnectionTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/state";
import { DetailedInfoState } from "website/components/App/TraceTimelinePage/DetailedInfo/state";
import { Trace } from "data-format";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import { action, computed, observable } from "mobx";

export class TraceTimelinePageState {
    readonly trace: Trace;

    readonly detailedInfo: DetailedInfoState;
    readonly connectionTimelines: Array<ConnectionTimelineState>;
    readonly axis: ZoomAxisState;

    @observable.shallow connectionFilter: Array<number>;
    @observable groupByIp: boolean;
    @observable displayAcks: boolean;
    @observable displayRttGroups: boolean;

    constructor(trace: Trace) {
        this.trace = trace;
        this.groupByIp = false;
        this.displayAcks = true;
        this.displayRttGroups = false;

        const segmentArrivalTimes = _.chain(trace.connections)
            .flatMap(connection => connection.segments)
            .map(segment => segment.time)
            .value();

        const earliest = _.min(segmentArrivalTimes)!;
        const latest = _.max(segmentArrivalTimes)!;

        const filter = localStorage.getItem(trace.name) ? JSON.parse(localStorage.getItem(trace.name)!) : undefined;

        this.detailedInfo = new DetailedInfoState();
        this.connectionTimelines = trace.connections.map(connection => {
            const streamFilters = filter ? filter[connection.id] : undefined;
            return new ConnectionTimelineState(connection, streamFilters);
        });
        this.axis = new ZoomAxisState(earliest, latest);

        if (filter) {
            this.connectionFilter = _.map(_.keys(filter), it => Number(it));
        } else {
            this.resetConnectionsFilter();
        }
    }

    @action
    setDisplayAcks(value: boolean) {
        this.displayAcks = value;
    }

    @action
    setDisplayRttGroups(value: boolean) {
        this.displayRttGroups = value;
    }

    @computed
    get filteredConnectionTimelines(): Array<ConnectionTimelineState> {
        return _.filter(this.connectionTimelines, it => _.includes(this.connectionFilter, it.connection.id));
    }

    @computed
    get hasConnectionsFilter() {
        return this.trace.connections.length !== this.connectionFilter.length;
    }

    @computed
    get hasSelectedConnections() {
        return _.some(this.connectionTimelines, it => it.selected);
    }

    @action
    filterSelectedConnections() {
        const selectedConnections = _.filter(this.connectionTimelines, it => it.selected);
        this.connectionFilter = _.map(selectedConnections, it => it.connection.id);
        this.saveFiltersToLocalStorage();
        this.unSelectAllConnections();
    }

    @action
    resetConnectionsFilter() {
        this.connectionFilter = _.map(this.trace.connections, it => it.id);
        this.saveFiltersToLocalStorage();
        this.unSelectAllConnections();
    }

    @action
    unSelectAllConnections() {
        _.forEach(this.connectionTimelines, it => {
            it.selected = false;
        });
    }

    @computed
    get hasStreamsFilter() {
        return _.some(this.connectionTimelines, it => it.hasStreamsFilter);
    }

    @computed
    get hasSelectedStreams() {
        return _.some(this.connectionTimelines, it => it.hasSelectedStreams);
    }

    @action
    filterSelectedStreams() {
        _.forEach(this.filteredConnectionTimelines, it => it.filterSelectedStreams());
        this.saveFiltersToLocalStorage();
        this.unSelectAllStreams();
    }

    @action
    resetStreamsFilter() {
        _.forEach(this.connectionTimelines, it => it.resetStreamsFilter());
        this.saveFiltersToLocalStorage();
        this.unSelectAllStreams();
    }

    @action
    unSelectAllStreams() {
        _.forEach(this.connectionTimelines, it => it.unSelectAllStreams());
    }

    saveFiltersToLocalStorage() {
        const byId = _.keyBy(this.filteredConnectionTimelines, it => it.connection.id);
        const filter = _.mapValues(byId, connectionTimeline => {
            return _.map(connectionTimeline.filteredStreamTimelines, streamTimeline => streamTimeline.stream.id);
        });
        localStorage.setItem(this.trace.name, JSON.stringify(filter));
    }
}
