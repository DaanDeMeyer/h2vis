import * as React from "react";

import { Http2WindowUpdate } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2WindowUpdate;
}

export class Http2WindowUpdateInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        return (
            <Http2MessageInfoCommon frame={frame}>
                <div>
                    Window Size Increment: {frame.windowSizeIncrement}
                </div>
            </Http2MessageInfoCommon>
        );
    }
}
