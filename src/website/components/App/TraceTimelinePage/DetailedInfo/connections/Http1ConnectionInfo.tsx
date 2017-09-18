import * as React from "react";
import * as _ from "lodash";

import { Http1Connection, Http1MessageType } from "data-format/protocols/http1";
import { ConnectionInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/ConnectionInfo";

interface Props {
    connection: Http1Connection;
}

export class Http1ConnectionInfo extends React.Component<Props> {
    render() {
        const { connection } = this.props;

        const requests = _.flatMap(connection.streams, stream => {
            return _.filter(stream.messages, message => message.type === Http1MessageType.REQUEST);
        });

        const responses = _.flatMap(connection.streams, stream => {
            return _.filter(stream.messages, message => message.type === Http1MessageType.RESPONSE);
        });

        return (
            <ConnectionInfoCommon connection={connection}>
                <div>
                    Requests: {requests.length}
                </div>
                <div>
                    Responses: {responses.length}
                </div>
            </ConnectionInfoCommon>
        );
    }
}
