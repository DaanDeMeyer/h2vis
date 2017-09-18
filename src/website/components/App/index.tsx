import * as React from "react";
import { observer } from "mobx-react";

import { PriorityTreePage } from "website/components/App/PriorityTreePage";
import { AppState, Page } from "website/components/App/state";
import { TraceTimelinePage } from "website/components/App/TraceTimelinePage";
import { PriorityTreeSnapshotPage } from "website/components/App/PriorityTreeSnapshotPage";

interface Props {
    state: AppState;
}

@observer
export class App extends React.Component<Props> {
    render() {
        const { state } = this.props;

        let page = null;

        if (state.selectedPage === Page.TRACETIMELINE && state.traceTimelinePage) {
            page = <TraceTimelinePage state={state.traceTimelinePage} appState={state} />;
        } else if (state.selectedPage === Page.PRIORITY_TREE && state.priorityTreePage) {
            page = <PriorityTreePage state={state.priorityTreePage} appState={state} />;
        } else if (state.selectedPage === Page.PRIORITY_TREE_SNAPSHOT && state.priorityTreeSnapshotPage) {
            page = <PriorityTreeSnapshotPage state={state.priorityTreeSnapshotPage} appState={state} />;
        }

        return page
    }
}
