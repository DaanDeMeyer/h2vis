import * as React from "react";
import * as _ from "lodash";

import { Http2Connection } from "data-format/protocols/http2";
import { ConnectionInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/ConnectionInfo";

interface Props {
    connection: Http2Connection;
}

export class Http2ConnectionInfo extends React.Component<Props> {
    render() {
        const { connection } = this.props;

        return (
            <ConnectionInfoCommon connection={connection}>
                <div>
                    Frames: {_.flatMap(connection.streams, stream => stream.messages).length}
                </div>
            </ConnectionInfoCommon>
        );
    }
}
