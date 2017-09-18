import * as React from "react";

import { Http1Message, Http1MessageType } from "data-format/protocols/http1";
import { Http1ContinuationInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http1/Http1ContinuationInfo";
import { Http1ResponseInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http1/Http1ResponseInfo";
import { Http1RequestInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http1/Http1RequestInfo";
import { MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/MessageInfo";

interface Props {
    message: Http1Message;
}

export class Http1MessageInfo extends React.Component<Props> {
    render() {
        const { message } = this.props;

        switch (message.type) {
            case Http1MessageType.REQUEST:
                return <Http1RequestInfo message={message}/>
            case Http1MessageType.RESPONSE:
                return <Http1ResponseInfo message={message}/>
            case Http1MessageType.CONTINUATION:
                return <Http1ContinuationInfo message={message}/>
        }
    }
}

export class Http1MessageInfoCommon extends React.Component<Props> {
    render() {
        const { message, children } = this.props;

        return <MessageInfoCommon message={message}>
            <div>
                Type: {message.type}
            </div>
            {children}
        </MessageInfoCommon>
    }
}