import * as React from "react";
import { classes, style } from "typestyle";
import { px } from "csx";
import { observer } from "mobx-react";

import { ConnectionProtocol, Stream } from "data-format";
import { Http1Stream } from "data-format/protocols/http1";
import { calculateStreamTimelineHeight } from "website/components/App/TraceTimelinePage/ConnectionTimeline/StreamTimeline/StreamTimeline";
import { fileExtToColor, shortenNameTo } from "utils/file";
import { Http2Stream } from "data-format/protocols/http2";
import { StreamTimelineState } from "website/components/App/TraceTimelinePage/ConnectionTimeline/StreamTimeline/state";
import { TimelineStyles } from "website/components/Shared/TimelineStyles";

interface Props {
    state: StreamTimelineState;
}

@observer
export class StreamTimelineInfo extends React.Component<Props> {
    onSelectClick = () => this.props.state.setSelected(!this.props.state.selected);

    render() {
        const { state } = this.props;

        const className = style({
            height: calculateStreamTimelineHeight(state.stream),
            background: fileExtToColor(state.stream.file)
        });

        return (
            <div className={classes(TimelineStyles.infoContainer, className)}>
                <input
                    type="checkbox"
                    checked={state.selected}
                    className={TimelineStyles.checkbox}
                    onClick={this.onSelectClick}
                />
                {mapStreamToInfo(state.stream, className)}
            </div>
        );
    }
}

function mapStreamToInfo(stream: Stream, className: string): JSX.Element {
    switch (stream.protocol) {
        case ConnectionProtocol.HTTP1:
            return http1StreamToInfo(stream, className);
        case ConnectionProtocol.HTTP2:
            return http2StreamToInfo(stream, className);
    }
}

function http1StreamToInfo(stream: Http1Stream, className: string): JSX.Element {
    return (
        <div className={classes(TimelineStyles.info)}>
            {stream.file &&
                <span>
                    {shortenNameTo(stream.file.name, 38)}
                </span>}
        </div>
    );
}

function http2StreamToInfo(stream: Http2Stream, className: string): JSX.Element {
    return (
        <div className={classes(TimelineStyles.info)}>
            <span className={Http2InfoStyles.id}>
                ID: {stream.id}
            </span>
            {stream.file &&
                <span>
                    {shortenNameTo(stream.file.name, 38)}
                </span>}
        </div>
    );
}

namespace Http2InfoStyles {
    export const id = style({
        width: px(40)
    });
}
