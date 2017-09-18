import * as React from "react";
import TreeView from "react-treeview";

import { Http2Ping } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2Ping;
}

export class Http2PingInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        return (
            <Http2MessageInfoCommon frame={frame}>
                <TreeView nodeLabel={<span>Flags: </span>}>
                    <div>
                        Ack: {frame.flags.ack ? "1" : "0"}
                    </div>
                </TreeView>
            </Http2MessageInfoCommon>
        );
    }
}
