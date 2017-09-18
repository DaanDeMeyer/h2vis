import * as React from "react";

import { Http2Frame, Http2FrameType } from "data-format/protocols/http2";
import { Http2DataInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2DataInfo";
import { Http2HeadersInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2HeadersInfo";
import { Http2ContinuationInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2ContinuationInfo";
import { Http2PushPromiseInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2PushPromiseInfo";
import { Http2PriorityInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2PriorityInfo";
import { Http2GoAwayInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2GoAwayInfo";
import { Http2PingInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2PingInfo";
import { Http2RstStreamInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2RstStreamInfo";
import { Http2SettingsInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2SettingsInfo";
import { Http2WindowUpdateInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/http2/Http2WindowUpdateInfo";
import { MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/MessageInfo";

interface Props {
    frame: Http2Frame;
}

export class Http2MessageInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        switch (frame.type) {
            case Http2FrameType.DATA:
                return <Http2DataInfo frame={frame}/>
            case Http2FrameType.HEADERS:
                return <Http2HeadersInfo frame={frame}/>
            case Http2FrameType.CONTINUATION:
                return <Http2ContinuationInfo frame={frame}/>
            case Http2FrameType.PUSH_PROMISE:
                return <Http2PushPromiseInfo frame={frame}/>
            case Http2FrameType.PRIORITY:
                return <Http2PriorityInfo frame={frame}/>
            case Http2FrameType.GO_AWAY:
                return <Http2GoAwayInfo frame={frame}/>
            case Http2FrameType.PING:
                return <Http2PingInfo frame={frame}/>
            case Http2FrameType.RST_STREAM:
                return <Http2RstStreamInfo frame={frame}/>
            case Http2FrameType.SETTINGS:
                return <Http2SettingsInfo frame={frame}/>
            case Http2FrameType.WINDOW_UPDATE:
                return <Http2WindowUpdateInfo frame={frame}/>
        }
    }
}

export class Http2MessageInfoCommon extends React.Component<Props> {
    render() {
        const { frame, children } = this.props;

        return <MessageInfoCommon message={frame}>
            <div>
                Type: {frame.type}
            </div>
            <div>
                Length: {frame.length}
            </div>
            <div>
                Stream Id: {frame.streamId}
            </div>
            {children}
        </MessageInfoCommon>
    }
}