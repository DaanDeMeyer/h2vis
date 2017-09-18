import * as React from "react";
import * as _ from "lodash";
import TreeView from "react-treeview";

import { Http2Continuation } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2Continuation;
}

export class Http2ContinuationInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        const headers = _.map(frame.headers, (value, key) => {
            return <div key={key}>{`${key}: ${value}`}</div>;
        });

        return (
            <Http2MessageInfoCommon frame={frame}>
                <TreeView nodeLabel={<span>Headers:</span>}>
                    {headers}
                </TreeView>
            </Http2MessageInfoCommon>
        );
    }
}
