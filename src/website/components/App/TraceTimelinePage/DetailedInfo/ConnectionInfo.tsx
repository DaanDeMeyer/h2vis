import * as React from "react";
import * as _ from "lodash";

import { Connection, ConnectionProtocol } from "data-format";
import { Http1ConnectionInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/connections/Http1ConnectionInfo";
import { Http2ConnectionInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/connections/Http2ConnectionInfo";
import { protocolAsString } from "utils/protocol";
import { DetailedInfoStyles } from "website/components/App/TraceTimelinePage/DetailedInfo/styles";

interface Props {
    connection: Connection;
}

export class ConnectionInfo extends React.Component<Props> {
    render() {
        const { connection } = this.props;

        switch (connection.protocol) {
            case ConnectionProtocol.HTTP1:
                return <Http1ConnectionInfo connection={connection} />;
            case ConnectionProtocol.HTTP2:
                return <Http2ConnectionInfo connection={connection} />;
        }
    }
}

export class ConnectionInfoCommon extends React.Component<Props> {
    render() {
        const { connection, children } = this.props;

        const rtt = connection.initialRtt ? `${_.round(connection.initialRtt * 1000)} ms` : "Unknown";

        return (
            <div className={DetailedInfoStyles.info}>
                <div>
                    ID: {connection.id}
                </div>
                <div>
                    Protocol: {protocolAsString(connection)}
                </div>
                <div>
                    Initial Roundtrip Time: {rtt}
                </div>
                <div>
                    IP: {connection.serverIp}
                </div>
                <div>
                    PORT: {connection.serverPort}
                </div>
                <div>
                    Hostname: {connection.serverHostname}
                </div>
                <div>
                    Segments: {connection.segments.length}
                </div>
                {children}
            </div>
        );
    }
}
