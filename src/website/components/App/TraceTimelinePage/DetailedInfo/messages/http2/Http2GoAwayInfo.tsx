import * as React from "react";

import { Http2GoAway } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2GoAway;
}

export class Http2GoAwayInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        return (
            <Http2MessageInfoCommon frame={frame}>
                <div>
                    Last Stream Id: {frame.lastStreamId}
                </div>
                <div>
                    Error Code: {frame.errorCode}
                </div>
                <div>
                    Error Message: {frame.additionalDebugData}
                </div>
            </Http2MessageInfoCommon>
        );
    }
}
