import * as React from "react";

import { ConnectionProtocol, Stream } from "data-format";
import { Http1StreamInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/streams/Http1StreamInfo";
import { Http2StreamInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/streams/Http2StreamInfo";
import { DetailedInfoStyles } from "website/components/App/TraceTimelinePage/DetailedInfo/styles"

interface Props {
    stream: Stream;
}

export class StreamInfo extends React.Component<Props> {
    render() {
        const { stream } = this.props;

        switch (stream.protocol) {
            case ConnectionProtocol.HTTP1:
                return <Http1StreamInfo stream={stream} />;
            case ConnectionProtocol.HTTP2:
                return <Http2StreamInfo stream={stream} />;
        }
    }
}

export class StreamInfoCommon extends React.Component<Props> {
    render() {
        const { stream, children } = this.props;

        return (
            <div className={DetailedInfoStyles.info}>
                {stream.file &&
                    <div>
                        {stream.file.name}
                    </div>}
                {children}
            </div>
        );
    }
}
