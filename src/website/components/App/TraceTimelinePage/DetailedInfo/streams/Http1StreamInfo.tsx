import * as React from "react";

import { Http1Stream } from "data-format/protocols/http1";
import { StreamInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/StreamInfo";

interface Props {
    stream: Http1Stream;
}

export class Http1StreamInfo extends React.Component<Props> {
    render() {
        const { stream } = this.props;

        return (
            <StreamInfoCommon stream={stream}>
                <div />
            </StreamInfoCommon>
        );
    }
}
