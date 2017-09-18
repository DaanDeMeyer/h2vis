import * as React from "react";
import * as _ from "lodash";
import { observer } from "mobx-react";
import { style } from "typestyle";
import {
    content,
    fillParent,
    horizontal,
    horizontallySpaced,
    padding,
    start,
    vertical,
    verticallySpaced
} from "csstips";
import { percent, px } from "csx";

import { TraceTimelinePageState } from "website/components/App/TraceTimelinePage/state";
import { AppState } from "website/components/App/state";
import { PageSelect } from "website/components/Shared/PageSelect";
import { TraceSelect } from "website/components/Shared/TraceSelect";
import { AxisPosition, ZoomAxis } from "website/components/Shared/ZoomAxis";
import { ConnectionTimelineInfo } from "website/components/App/TraceTimelinePage/ConnectionTimeline/ConnectionTimelineInfo";
import { ConnectionTimeline } from "website/components/App/TraceTimelinePage/ConnectionTimeline/ConnectionTimeline";
import { DetailedInfo } from "website/components/App/TraceTimelinePage/DetailedInfo";

interface Props {
    state: TraceTimelinePageState;
    appState: AppState;
}

@observer
export class TraceTimelinePage extends React.Component<Props> {
    onFilterConnections = () => this.props.state.filterSelectedConnections();
    onResetConnectionsFilter = () => this.props.state.resetConnectionsFilter();
    onFilterStreams = () => this.props.state.filterSelectedStreams();
    onResetStreamsFilter = () => this.props.state.resetStreamsFilter();
    onToggleDisplayAcks = () => this.props.state.setDisplayAcks(!this.props.state.displayAcks);
    onToggleDisplayRttGroups = () => this.props.state.setDisplayRttGroups(!this.props.state.displayRttGroups);

    render() {
        const { state, appState } = this.props;

        const infoList = _.map(state.filteredConnectionTimelines, connectionTimeline => {
            return <ConnectionTimelineInfo key={connectionTimeline.connection.id} state={connectionTimeline} />;
        });

        const timelineList = _.map(state.filteredConnectionTimelines, connectionTimeline => {
            return (
                <ConnectionTimeline
                    key={connectionTimeline.connection.id}
                    state={connectionTimeline}
                    displayAcks={state.displayAcks}
                    displayRttGroups={state.displayRttGroups}
                    axis={state.axis}
                    onSegmentClick={(connection, segment) => state.detailedInfo.setSegment(connection, segment)}
                    onMessageClick={(connection, stream, message) =>
                        state.detailedInfo.setMessage(connection, stream, message)}
                />
            );
        });

        return (
            <div className={Styles.traceTimelinePage}>
                <div className={Styles.configuration}>
                    <div className={Styles.subConfiguration}>
                        <PageSelect state={appState} />
                        <TraceSelect state={appState} />
                    </div>
                    <div className={Styles.subConfiguration}>
                        <button disabled={!state.hasSelectedConnections} onClick={this.onFilterConnections}>
                            Filter selected connections
                        </button>
                        <button disabled={!state.hasConnectionsFilter} onClick={this.onResetConnectionsFilter}>
                            Reset connections filter
                        </button>
                    </div>
                    <div className={Styles.subConfiguration}>
                        <button disabled={!state.hasSelectedStreams} onClick={this.onFilterStreams}>
                            Filter selected streams
                        </button>
                        <button disabled={!state.hasStreamsFilter} onClick={this.onResetStreamsFilter}>
                            Reset streams filter
                        </button>
                    </div>
                    <div className={Styles.subConfiguration}>
                        <button onClick={this.onToggleDisplayAcks}>
                            {state.displayAcks ? "Hide Acks" : "Show Acks"}
                        </button>
                        <button onClick={this.onToggleDisplayRttGroups}>
                            {state.displayRttGroups ? "Hide Rtt Groups" : "Show Rtt Groups"}
                        </button>
                    </div>
                </div>

                <div className={Styles.timeline}>
                    <div className={Styles.info}>
                        {infoList}
                    </div>
                    <ZoomAxis state={state.axis} position={AxisPosition.TOP}>
                        {timelineList}
                    </ZoomAxis>
                    {state.detailedInfo.isSet() && <DetailedInfo state={state.detailedInfo} />}
                </div>
            </div>
        );
    }
}

namespace Styles {
    export const traceTimelinePage = style(fillParent, padding(10), vertical, verticallySpaced(15));

    export const configuration = style(content, horizontal, horizontallySpaced(10));

    export const subConfiguration = style(content, vertical, verticallySpaced(5));

    export const timeline = style(content, horizontal, start, horizontallySpaced(10), padding(15, 5), {
        maxHeight: percent(90),
        overflow: "auto"
    });

    export const info = style(content, vertical, {
        marginTop: px(1)
    });
}
