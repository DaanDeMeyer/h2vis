import * as React from "react";
import { observer } from "mobx-react";
import { classes, style } from "typestyle";
import { content, flex, horizontal } from "csstips";
import { lightblue, px, rem } from "csx";

import { ConnectionTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/state";
import { TimelineStyles } from "website/components/Shared/TimelineStyles";
import { calculateSegmentsTimelineHeight } from "website/components/App/TraceTimelinePage/ConnectionTimeline/SegmentsTimeline/SegmentsTimeline";
import { protocolAsString } from "utils/protocol";
import { shortenNameTo } from "utils/file";

interface Props {
    state: ConnectionTimelineState;
}

@observer
export class SegmentsTimelineInfo extends React.Component<Props> {
    onSelectClick = () => (this.props.state.setSelected(!this.props.state.selected));
    onExpandClick = () => (this.props.state.setExpanded(!this.props.state.expanded));

    render() {
        const { state } = this.props;

        const height = style({
            height: px(calculateSegmentsTimelineHeight(state.connection.segments))
        });

        const buttonText = state.expanded ? "M" : "E";

        return (
            <div className={classes(TimelineStyles.infoContainer, Styles.segmentInfo, height)}>
                <input
                    type="checkbox"
                    checked={state.selected}
                    className={TimelineStyles.checkbox}
                    onClick={this.onSelectClick}
                />
                <button className={Styles.expandButton} onClick={this.onExpandClick}>
                    {buttonText}
                </button>
                <div className={TimelineStyles.info}>
                    <div className={style(flex, horizontal)}>
                        <span className={Styles.ip}>
                            IP: {shortenNameTo(state.connection.serverIp, 20)}
                        </span>
                        <span className={Styles.margin}/>
                        <span className={Styles.port}>
                            PORT: {state.connection.serverPort}
                        </span>
                        <span>
                            {protocolAsString(state.connection)}
                        </span>
                    </div>
                    <div className={style(content, horizontal)}>
                        <span>
                            HN: {state.connection.serverHostname}
                        </span>
                    </div>
                    <div>
                        {state.connection.initialRtt && <span>
                            {`iRTT: ${Number(state.connection.initialRtt * 1000).toFixed(0)} ms`}
                        </span>}
                    </div>
                </div>
            </div>
        );
    }
}

namespace Styles {
    export const segmentInfo = style({
        background: lightblue.toString()
    });

    export const expandButton = style(content, {
        width: rem(2)
    });

    export const margin = style(content, {
        width: rem(1),
        flexGrow: 1
    })

    export const ip = style(content, {
        flexGrow: 1
    });

    export const port = style(content, {
        width: rem(6)
    });
}

