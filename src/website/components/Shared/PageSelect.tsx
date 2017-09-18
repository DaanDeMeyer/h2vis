import * as React from "react";
import { AppState, Page } from "website/components/App/state";

interface Props {
    state: AppState;
}

export class PageSelect extends React.Component<Props> {
    onChange = (event: any) => this.props.state.setSelectedPage(event.target.value);

    render() {
        const { state } = this.props;

        return (
            <div>
                <span>Page: </span>
                <select onChange={this.onChange} value={state.selectedPage}>
                    {state.traceTimelinePage &&
                        <option key={Page.TRACETIMELINE} value={Page.TRACETIMELINE}>
                            {Page.TRACETIMELINE}
                        </option>}
                    {state.priorityTreePage &&
                        <option key={Page.PRIORITY_TREE} value={Page.PRIORITY_TREE}>
                            {Page.PRIORITY_TREE}
                        </option>}
                    {state.priorityTreeSnapshotPage &&
                        <option key={Page.PRIORITY_TREE_SNAPSHOT} value={Page.PRIORITY_TREE_SNAPSHOT}>
                            {Page.PRIORITY_TREE_SNAPSHOT}
                        </option>}
                </select>
            </div>
        );
    }
}
