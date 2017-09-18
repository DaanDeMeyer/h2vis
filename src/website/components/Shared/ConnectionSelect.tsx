import * as React from "react";
import * as _ from "lodash";

import { Connection } from "data-format";

interface Props {
    selected: Connection;
    connections: Array<Connection>;
    onChange: (connection: Connection) => void;
}

export class ConnectionSelect extends React.Component<Props> {
    onChange = (event: any) => {
        const { connections, onChange } = this.props;
        const newConnection = _.find(connections, connection => connection.id === Number(event.target.value))!;
        onChange(newConnection);
    };

    render() {
        const { selected, connections } = this.props;

        const options = connections.map(connection => {
            return (
                <option key={connection.id} value={connection.id}>
                    {connection.serverHostname ? connection.serverHostname : connection.serverIp}
                </option>
            );
        });

        return <div>
            <span>Connection: </span>
            <select value={selected.id} onChange={this.onChange}>
                {options}
            </select>
        </div>;
    }
}