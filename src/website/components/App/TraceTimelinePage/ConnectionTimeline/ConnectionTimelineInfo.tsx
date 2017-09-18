import * as React from "react";
import * as _ from "lodash";
import { observer } from "mobx-react";
import { style } from "typestyle";
import { content, vertical } from "csstips";

import { ConnectionTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/state";
import { SegmentsTimelineInfo } from "website/components/App/TraceTimelinePage/ConnectionTimeline/SegmentsTimeline/SegmentsTimelineInfo";
import { StreamTimelineInfo } from "website/components/App/TraceTimelinePage/ConnectionTimeline/StreamTimeline/StreamTimelineInfo";

interface Props {
    state: ConnectionTimelineState;
}

@observer
export class ConnectionTimelineInfo extends React.Component<Props> {
    render() {
        const { state } = this.props;

        const streamTimelineInfoList = _.map(state.filteredStreamTimelines, streamTimeline => {
            return <StreamTimelineInfo key={streamTimeline.stream.id} state={streamTimeline} />;
        });

        return (
            <div className={Styles.connectionTimelineInfo}>
                <SegmentsTimelineInfo state={state} />
                {state.expanded && streamTimelineInfoList}
            </div>
        );
    }
}

namespace Styles {
    export const connectionTimelineInfo = style(content, vertical);
}
