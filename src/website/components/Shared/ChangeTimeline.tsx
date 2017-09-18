import * as _ from "lodash";
import * as React from "react";
import { observer } from "mobx-react";
import { content, vertical } from "csstips";
import { style } from "typestyle";
import { black, percent, px, yellow } from "csx";

import { Message, Source } from "data-format";
import { http2FrameToColor } from "utils/http2";
import { MessageBlocks } from "website/components/Shared/MessageBlocks";
import { AxisPosition, ZoomAxis } from "website/components/Shared/ZoomAxis";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import { TimelineStyles } from "website/components/Shared/TimelineStyles";
import { MutablePriorityTreeState } from "website/components/Shared/PriorityTree/MutablePriorityTreeState";

interface Props {
    state: MutablePriorityTreeState;
    axis: ZoomAxisState;
}

@observer
export class ChangeTimeline extends React.Component<Props> {
    onChangeClick = (message: Message) => this.props.state.applyUntilIdWith(message.id);

    render() {
        const { state, axis } = this.props;

        const groupedBySource = _.groupBy(state.changes, change => change.source);

        const latestChangeTime = _.last(state.appliedChanges) ? _.last(state.appliedChanges)!.arrivalEnd : 0;
        const indicatorX = axis.convert(latestChangeTime);

        return (
            <div className={Styles.changesTimeline}>
                <ZoomAxis state={axis} position={AxisPosition.BOTTOM}>
                    <div className={TimelineStyles.client}>
                        <MessageBlocks
                            messages={groupedBySource[Source.CLIENT]}
                            messageToColor={http2FrameToColor}
                            expandWidth={false}
                            axis={axis}
                            onClick={this.onChangeClick}
                        />
                    </div>
                    <div className={TimelineStyles.server}>
                        <MessageBlocks
                            messages={groupedBySource[Source.SERVER]}
                            messageToColor={http2FrameToColor}
                            expandWidth={false}
                            axis={axis}
                            onClick={this.onChangeClick}
                        />
                    </div>
                </ZoomAxis>
                <svg className={Styles.indicatorSvg}>
                    <rect x={indicatorX} y={0} className={Styles.indicator} />;
                </svg>
            </div>
        );
    }
}

namespace Styles {
    export const changesTimeline = style(content, vertical, {
        width: percent(100),
        minHeight: px(20)
    });

    export const indicatorSvg = style(content, {
        height: px(15)
    });

    export const indicator = style({
        width: px(5),
        height: px(15),
        fill: yellow.toString(),
        stroke: black.toString()
    });
}
