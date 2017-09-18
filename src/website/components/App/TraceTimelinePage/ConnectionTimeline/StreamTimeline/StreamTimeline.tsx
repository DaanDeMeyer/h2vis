import * as _ from "lodash";
import * as React from "react";
import { observer } from "mobx-react";
import { classes, style } from "typestyle";
import { px } from "csx";

import { ConnectionProtocol, Message, Source, Stream } from "data-format";
import { calculateMessageBlocksHeight, MessageBlocks } from "website/components/Shared/MessageBlocks";
import { TimelineStyles } from "website/components/Shared/TimelineStyles";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import { http1MessageToColor } from "utils/http1";
import { http2FrameToColor } from "utils/http2";
import { StreamTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/StreamTimeline/state";

interface Props {
    state: StreamTimelineState;
    axis: ZoomAxisState;
    onClick: (stream: Stream, message: Message) => void;
}

@observer
export class StreamTimeline extends React.Component<Props> {
    render() {
        const { state, axis, onClick } = this.props;

        const groupedBySource = _.groupBy<Message, Source>(state.stream.messages, message => message.source);
        const messageToColor = mapStreamToColors(state.stream);

        const height = calculateStreamTimelineHeight(state.stream);
        const heightStyle = style({
            height: px(height)
        });

        return (
            <div className={classes(TimelineStyles.timeline, heightStyle)}>
                <div className={TimelineStyles.client}>
                    <MessageBlocks
                        messages={groupedBySource[Source.CLIENT]}
                        messageToColor={messageToColor}
                        expandWidth={true}
                        axis={axis}
                        onClick={(message: Message) => onClick(state.stream, message)}
                    />
                </div>
                <div className={TimelineStyles.server}>
                    <MessageBlocks
                        messages={groupedBySource[Source.SERVER]}
                        messageToColor={messageToColor}
                        expandWidth={true}
                        axis={axis}
                        onClick={(message: Message) => onClick(state.stream, message)}
                    />
                </div>
            </div>
        );
    }
}

export function calculateStreamTimelineHeight(stream: Stream): number {
    const groupedBySource = _.groupBy<Message, Source>(stream.messages, message => message.source);
    const height =
        calculateMessageBlocksHeight(groupedBySource[Source.CLIENT]) +
        calculateMessageBlocksHeight(groupedBySource[Source.SERVER]);

    return height > TimelineStyles.MIN_HEIGHT_MESSAGES_PX ? height : TimelineStyles.MIN_HEIGHT_MESSAGES_PX;
}

function mapStreamToColors(stream: Stream): (message: Message) => string {
    switch (stream.protocol) {
        case ConnectionProtocol.HTTP1:
            return http1MessageToColor;
        case ConnectionProtocol.HTTP2:
            return http2FrameToColor;
    }
}
