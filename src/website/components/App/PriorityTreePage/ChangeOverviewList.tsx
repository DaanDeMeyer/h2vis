import * as React from "react";
import * as _ from "lodash";
import { observer } from "mobx-react";
import { style } from "typestyle";
import { content, horizontal, vertical, width } from "csstips";
import { percent, rem } from "csx";

import { ChangeOverview } from "website/components/Shared/ChangeOverview";
import { borderBlack } from "website/styles";
import { MutablePriorityTreeState } from "website/components/Shared/PriorityTree/MutablePriorityTreeState";

interface Props {
    state: MutablePriorityTreeState;
}

@observer
export class ChangeOverviewList extends React.Component<Props> {
    onClickApply = (event: any) => this.props.state.applyUntilIdWith(Number(event.target.value));
    onClickUndo = (event: any) => this.props.state.applyUntilId(Number(event.target.value));

    render() {
        const { state } = this.props;

        const applied = _.map(state.appliedChanges, change => {
            return (
                <div key={change.id} className={Styles.single}>
                    <button className={Styles.button} value={change.id} onClick={this.onClickUndo}>
                        U
                    </button>
                    <ChangeOverview change={change} isApplied={true} />
                </div>
            );
        });

        const remaining = _.map(state.remainingChanges, change => {
            return (
                <div key={change.id} className={Styles.single}>
                    <button className={Styles.button} value={change.id} onClick={this.onClickApply}>
                        A
                    </button>
                    <ChangeOverview change={change} isApplied={false} />
                </div>
            );
        });

        return (
            <div className={Styles.list}>
                {applied}
                {remaining}
            </div>
        );
    }
}

namespace Styles {
    export const list = style(content, vertical, borderBlack(1), {
        maxHeight: percent(100),
        overflow: "auto"
    });

    export const single = style(content, horizontal);

    export const button = style(content, width(rem(2)));
}
