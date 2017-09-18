import * as React from "react";
import * as _ from "lodash";
import TreeView from "react-treeview";

import { Http2PushPromise } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2PushPromise;
}

export class Http2PushPromiseInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        const headers = _.map(frame.headers, (value, key) => {
            return <div key={key}>{`${key}: ${value}`}</div>;
        });

        return (
            <Http2MessageInfoCommon frame={frame}>
                <TreeView nodeLabel={<span>Headers: </span>}>
                    {headers}
                </TreeView>
                <div>
                    Promised Stream Id: {frame.promisedStreamId}
                </div>
                <div>
                    Pad Length: {frame.padLength}
                </div>
                <TreeView nodeLabel={<span>Flags: </span>}>
                    <div>
                        End Headers: {frame.flags.endHeaders ? "1" : "0"}
                    </div>
                    <div>
                        Padded: {frame.flags.padded ? "1" : "0"}
                    </div>
                </TreeView>
            </Http2MessageInfoCommon>
        );
    }
}
