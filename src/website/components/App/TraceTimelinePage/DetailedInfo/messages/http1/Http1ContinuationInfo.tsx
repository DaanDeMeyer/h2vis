import * as React from "react";

import { Http1Continuation } from "data-format/protocols/http1";
import { Http1MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http1MessageInfo";

interface Props {
    message: Http1Continuation;
}

export class Http1ContinuationInfo extends React.Component<Props> {
    render() {
        const { message } = this.props;

        return <Http1MessageInfoCommon message={message}>
            <div>
                Data Length: {message.dataLength}
            </div>
        </Http1MessageInfoCommon>
    }
}