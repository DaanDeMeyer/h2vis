import * as React from "react";
import TreeView from "react-treeview";

import { Http2Data } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2Data;
}

export class Http2DataInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        return (
            <Http2MessageInfoCommon frame={frame}>
                <div>
                    Pad Length: {frame.padLength}
                </div>
                <TreeView nodeLabel={<span>Flags: </span>}>
                    <div>
                        End Stream: {frame.flags.endStream ? "1" : "0"}
                    </div>
                    <div>
                        Padded: {frame.flags.padded ? "1" : "0"}
                    </div>
                </TreeView>
            </Http2MessageInfoCommon>
        );
    }
}
