import * as React from "react";

import { Http2RstStream } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2RstStream;
}

export class Http2RstStreamInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        return (
            <Http2MessageInfoCommon frame={frame}>
                <div>
                    Error Code: {frame.errorCode}
                </div>
            </Http2MessageInfoCommon>
        );
    }
}
