import * as React from "react";
import * as _ from "lodash";
import TreeView from "react-treeview";

import { Http2Headers } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2Headers;
}

export class Http2HeadersInfo extends React.Component<Props> {
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
                    Pad Length: {frame.padLength}
                </div>
                <div>
                    Dependency: {frame.dependency}
                </div>
                <div>
                    Weight: {frame.weight}
                </div>
                <div>
                    Exclusive: {frame.exclusive ? "1" : "0"}
                </div>
                <TreeView nodeLabel={<span>Flags: </span>}>
                    <div>
                        End Stream: {frame.flags.endStream ? "1" : "0"}
                    </div>
                    <div>
                        End Headers: {frame.flags.endHeaders ? "1" : "0"}
                    </div>
                    <div>
                        Padded: {frame.flags.padded ? "1" : "0"}
                    </div>
                    <div>
                        Priority: {frame.flags.priority ? "1" : "0"}
                    </div>
                </TreeView>
            </Http2MessageInfoCommon>
        );
    }
}
