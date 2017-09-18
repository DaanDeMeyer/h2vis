import * as React from "react";
import * as _ from "lodash";
import { observer } from "mobx-react";

import { fileExtToColor, shortenNameTo } from "utils/file";
import { classes, style } from "typestyle";
import { content, flex, horizontal, padding, vertical } from "csstips";
import { borderBlack } from "website/styles";
import { MutablePriorityTreeState } from "website/components/Shared/PriorityTree/MutablePriorityTreeState";
import { rem } from "csx";

interface Props {
    state: MutablePriorityTreeState;
}

@observer
export class StreamOverviewList extends React.Component<Props> {
    render() {
        const { state } = this.props;
        const root = state.root(false, false);

        const nodes = _.sortBy(root.descendants(), node => node.data.id);

        const streamOverviews = _.map(nodes, node => {
            const stream = node.data;

            const color = style({
                background: fileExtToColor(stream.file)
            });

            return (
                <div key={stream.id} className={classes(Styles.streamOverview, color)}>
                    <span className={Styles.id}>
                        ID: {stream.id}
                    </span>
                    {stream.file &&
                        <span className={Styles.file}>
                            {shortenNameTo(stream.file.name, 40)}
                        </span>}
                </div>
            );
        });

        return (
            <div className={Styles.streamOverviewList}>
                {streamOverviews}
            </div>
        );
    }
}

namespace Styles {
    export const streamOverviewList = style(flex, vertical, {
        borderTop: "1px solid black",
        overflow: "auto"
    });

    export const streamOverview = style(content, horizontal, padding(3), borderBlack(1));

    export const id = style(content, {
        width: rem(4)
    });

    export const file = style(flex);
}
