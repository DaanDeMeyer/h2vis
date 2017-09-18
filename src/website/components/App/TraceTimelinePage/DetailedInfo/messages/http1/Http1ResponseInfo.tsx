import * as React from "react";
import * as _ from "lodash";
import TreeView from "react-treeview";

import { Http1Response } from "data-format/protocols/http1";
import { Http1MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http1MessageInfo";

interface Props {
    message: Http1Response;
}

export class Http1ResponseInfo extends React.Component<Props> {
    render() {
        const { message } = this.props;

        const headers = _.map(message.headers, (value, key) => {
            return <div key={key}>{`${key}: ${value}`}</div>;
        });

        return (
            <Http1MessageInfoCommon message={message}>
                <div>
                    {`${message.code} ${message.phrase}`}
                </div>
                <TreeView nodeLabel={<span>Headers: </span>}>
                    {headers}
                </TreeView>
            </Http1MessageInfoCommon>
        );
    }
}
