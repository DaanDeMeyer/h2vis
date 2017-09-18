import * as React from "react";
import * as _ from "lodash";

import { AppState } from "website/components/App/state";

interface Props {
    state: AppState;
}

export class TraceSelect extends React.Component<Props> {
    onTraceSelectChange = (event: any) => {
        const { state } = this.props;
        const selectedTrace = _.find(state.traces, trace => trace.name === event.target.value)!;
        state.setSelectedTrace(selectedTrace);
    };

    render() {
        const { state } = this.props;

        const options = state.traces.map(trace => {
            return (
                <option key={trace.name} value={trace.name}>
                    {trace.name}
                </option>
            );
        });

        return (
            <div>
                <span>Trace: </span>
                <select
                    onChange={this.onTraceSelectChange}
                    value={state.selectedTrace ? state.selectedTrace.name : undefined}
                >
                    {options}
                </select>
            </div>
        );
    }
}