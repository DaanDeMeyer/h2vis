import * as React from "react";

import { Http2Priority } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2Priority;
}

export class Http2PriorityInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        return (
            <Http2MessageInfoCommon frame={frame}>
                <div>
                    Dependency: {frame.dependency}
                </div>
                <div>
                    Weight: {frame.weight}
                </div>
                <div>
                    Exclusive: {frame.exclusive ? "1" : "0"}
                </div>
            </Http2MessageInfoCommon>
        );
    }
}
