import * as React from "react";
import * as _ from "lodash";
import { observer } from "mobx-react";
import { style } from "typestyle";
import { content, vertical } from "csstips";

import { SegmentsTimeline } from "website/components/App/TraceTimelinePage/ConnectionTimeline/SegmentsTimeline/SegmentsTimeline";
import { StreamTimeline } from "website/components/App/TraceTimelinePage/ConnectionTimeline/StreamTimeline/StreamTimeline";
import { ConnectionTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/state";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import { Connection, Message, Segment, Stream } from "data-format";

interface Props {
    state: ConnectionTimelineState;
    displayAcks: boolean;
    displayRttGroups: boolean;
    axis: ZoomAxisState;
    onSegmentClick: (connection: Connection, segment: Segment) => void;
    onMessageClick: (connection: Connection, stream: Stream, message: Message) => void;
}

@observer
export class ConnectionTimeline extends React.Component<Props> {
    render() {
        const { state, displayAcks, displayRttGroups, axis, onSegmentClick, onMessageClick } = this.props;

        const streamTimelineList = _.map(state.filteredStreamTimelines, streamTimeline => {
            return (
                <StreamTimeline
                    key={streamTimeline.stream.id}
                    state={streamTimeline}
                    axis={axis}
                    onClick={(stream, message) => onMessageClick(state.connection, stream, message)}
                />
            );
        });

        return (
            <div className={Styles.connectionTimeline}>
                <SegmentsTimeline
                    state={state}
                    displayAcks={displayAcks}
                    displayRttGroups={displayRttGroups}
                    axis={axis}
                    onClick={segment => onSegmentClick(state.connection, segment)}
                />
                {state.expanded && streamTimelineList}
            </div>
        );
    }
}

namespace Styles {
    export const connectionTimeline = style(content, vertical);
}
