import * as React from "react";

import { ConnectionProtocol, Message } from "data-format";
import { DetailedInfoStyles } from "website/components/App/TraceTimelinePage/DetailedInfo/styles";
import { Http1MessageInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http1MessageInfo";
import { Http2MessageInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    message: Message;
}

export class MessageInfo extends React.Component<Props> {
    render() {
        const { message } = this.props;

        switch (message.protocol) {
            case ConnectionProtocol.HTTP1:
                return <Http1MessageInfo message={message} />;
            case ConnectionProtocol.HTTP2:
                return <Http2MessageInfo frame={message} />;
        }
    }
}

export class MessageInfoCommon extends React.Component<Props> {
    render() {
        const { message, children } = this.props;

        return (
            <div className={DetailedInfoStyles.info}>
                <div>
                    ID: {message.id}
                </div>
                <div>
                    Source: {message.source}
                </div>
                <div>
                    Arrival Start: {message.arrivalStart}
                </div>
                <div>
                    Arrival End: {message.arrivalEnd}
                </div>
                <div>
                    Arrival Diff: {message.arrivalStart - message.arrivalEnd}
                </div>
                {children}
            </div>
        );
    }
}
