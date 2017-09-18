import * as React from "react";

import { Http2Stream } from "data-format/protocols/http2";
import { StreamInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/StreamInfo";

interface Props {
    stream: Http2Stream;
}

export class Http2StreamInfo extends React.Component<Props> {
    render() {
        const { stream } = this.props;

        return (
            <StreamInfoCommon stream={stream}>
                <div />
            </StreamInfoCommon>
        );
    }
}
