import * as _ from "lodash";
import * as React from "react";
import { observer } from "mobx-react";
import { classes, style } from "typestyle";
import { px } from "csx";

import { Segment, Source } from "data-format";
import { TimelineStyles } from "website/components/Shared/TimelineStyles";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import {
    calculateSegmentBlocksRequiredHeight,
    SegmentBlocks
} from "website/components/App/TraceTimelinePage/ConnectionTimeline/SegmentsTimeline/SegmentBlocks";
import { ConnectionTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/state";

interface Props {
    state: ConnectionTimelineState;
    displayAcks: boolean;
    displayRttGroups: boolean;
    axis: ZoomAxisState;
    onClick: (segment: Segment) => void;
}

@observer
export class SegmentsTimeline extends React.Component<Props> {
    render() {
        const { state, displayAcks, displayRttGroups, axis, onClick } = this.props;

        const groupedBySource = _.groupBy(state.connection.segments, segment => segment.source);

        const height = calculateSegmentsTimelineHeight(state.connection.segments);
        const heightStyle = style({
            height: px(height)
        });

        return (
            <div className={classes(TimelineStyles.timeline, heightStyle)}>
                <div className={TimelineStyles.client}>
                    <SegmentBlocks
                        segments={groupedBySource[Source.CLIENT]}
                        displayAcks={displayAcks}
                        displayRttGroups={displayRttGroups}
                        rtt={state.rtt}
                        height={height / 2}
                        axis={axis}
                        onClick={onClick}
                    />
                </div>
                <div className={TimelineStyles.server}>
                    <SegmentBlocks
                        segments={groupedBySource[Source.SERVER]}
                        displayAcks={displayAcks}
                        displayRttGroups={displayRttGroups}
                        rtt={state.rtt}
                        height={height / 2}
                        axis={axis}
                        onClick={onClick}
                    />
                </div>
            </div>
        );
    }
}

export function calculateSegmentsTimelineHeight(segments: Array<Segment>): number {
    const groupedBySource = _.groupBy(segments, segment => segment.source);
    const height =
        calculateSegmentBlocksRequiredHeight(groupedBySource[Source.CLIENT]) +
        calculateSegmentBlocksRequiredHeight(groupedBySource[Source.SERVER]);

    return height > TimelineStyles.MIN_HEIGHT_SEGMENTS_PX ? height : TimelineStyles.MIN_HEIGHT_SEGMENTS_PX;
}