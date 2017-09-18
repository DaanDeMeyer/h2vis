import * as _ from "lodash";
import { action, computed, observable } from "mobx";

import { Connection, Stream } from "data-format";
import { StreamTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/StreamTimeline/state";

export class ConnectionTimelineState {
    readonly connection: Connection;

    readonly streamTimelines: Array<StreamTimelineState>;

    @observable rtt: number | undefined;
    @observable expanded: boolean;
    @observable selected: boolean;

    @observable.shallow streamFilter: Array<number>;

    constructor(connection: Connection, streamFilter?: Array<number>) {
        this.connection = connection;

        this.streamTimelines = _.map<Stream, StreamTimelineState>(
            connection.streams,
            stream => new StreamTimelineState(stream)
        );

        this.expanded = false;
        this.selected = false;
        this.rtt = connection.initialRtt;

        streamFilter ? (this.streamFilter = streamFilter) : this.resetStreamsFilter();
    }

    @computed
    get filteredStreamTimelines(): Array<StreamTimelineState> {
        return _.filter(this.streamTimelines, it => _.includes(this.streamFilter, it.stream.id));
    }

    @computed
    get hasStreamsFilter() {
        return this.connection.streams.length !== this.streamFilter.length;
    }

    @computed
    get hasSelectedStreams() {
        return _.some(this.streamTimelines, it => it.selected);
    }

    @action
    setExpanded(value: boolean) {
        this.expanded = value;
    }

    @action
    setSelected(value: boolean) {
        this.selected = value;
    }

    @action
    filterSelectedStreams() {
        const selectedStreams = _.filter(this.streamTimelines, it => it.selected);
        this.streamFilter = _.map(selectedStreams, it => it.stream.id);
    }

    @action
    resetStreamsFilter() {
        this.streamFilter = _.map<Stream, number>(this.connection.streams, it => it.id);
    }

    @action
    unSelectAllStreams() {
        _.forEach(this.streamTimelines, it => {
            it.selected = false;
        });
    }
}
