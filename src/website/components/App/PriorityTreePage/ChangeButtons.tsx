import * as React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import { center, content, horizontal, horizontallySpaced, vertical, verticallySpaced } from "csstips";
import { style } from "typestyle";

import { MutablePriorityTreeState } from "website/components/Shared/PriorityTree/MutablePriorityTreeState";
import { MillisToSecondsInput } from "website/components/Shared/MillisToSecondsInput";

interface Props {
    state: MutablePriorityTreeState;
}

@observer
export class ChangeButtons extends React.Component<Props> {
    @observable interval: number;

    constructor(props: Props) {
        super(props);
        this.interval = props.state.connection.initialRtt!;
    }

    setInterval = action((interval: number) => (this.interval = interval));

    onUndoAll = () => this.props.state.undoAll();
    onUndoWithinInterval = () => this.props.state.undoWithinInterval(this.interval);
    onUndo = () => this.props.state.undoChange();
    onApply = () => this.props.state.applyChange();
    onApplyWithinInterval = () => this.props.state.applyWithinInterval(this.interval);
    onApplyRemaining = () => this.props.state.applyAll();

    @action
    componentDidUpdate(prevProps: Props) {
        if (this.props.state.connection !== prevProps.state.connection) {
            this.interval = this.props.state.connection.initialRtt!;
        }
    }

    render() {
        const { state } = this.props;
        return (
            <div className={Styles.changeButtons}>
                <MillisToSecondsInput initial={this.interval} onChange={this.setInterval} />
                <div className={Styles.buttons}>
                    <button disabled={!state.undoIsAvailable()} onClick={this.onUndoAll}>
                        {"<<<"}
                    </button>
                    <button disabled={!state.undoIsAvailable()} onClick={this.onUndoWithinInterval}>
                        {"<<"}
                    </button>
                    <button disabled={!state.undoIsAvailable()} onClick={this.onUndo}>
                        {"<"}
                    </button>
                    <button disabled={!state.applyIsAvailable()} onClick={this.onApply}>
                        {">"}
                    </button>
                    <button disabled={!state.applyIsAvailable()} onClick={this.onApplyWithinInterval}>
                        {">>"}
                    </button>
                    <button disabled={!state.applyIsAvailable()} onClick={this.onApplyRemaining}>
                        {">>>"}
                    </button>
                    <span>
                        {`${state.appliedChanges.length} / ${state.changes.length}`}
                    </span>
                </div>
            </div>
        );
    }
}

namespace Styles {
    export const changeButtons = style(content, vertical, verticallySpaced(5));

    export const buttons = style(horizontal, center, horizontallySpaced(5));
}
