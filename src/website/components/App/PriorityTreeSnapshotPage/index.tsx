import * as React from "react";
import * as _ from "lodash";
import { observer } from "mobx-react";
import { style } from "typestyle";
import {
    center,
    content,
    fillParent,
    flex,
    horizontal,
    horizontallySpaced,
    padding,
    start,
    vertical,
    verticallySpaced
} from "csstips";
import { percent, px } from "csx";

import { PriorityTreeSnapshotPageState } from "website/components/App/PriorityTreeSnapshotPage/state";
import { PriorityTree } from "website/components/Shared/PriorityTree";
import { TraceSelect } from "website/components/Shared/TraceSelect";
import { AppState } from "website/components/App/state";
import { PageSelect } from "website/components/Shared/PageSelect";
import { ConnectionSelect } from "website/components/Shared/ConnectionSelect";
import { Http2Connection } from "data-format/protocols/http2";
import { StreamOverviewList } from "website/components/Shared/StreamOverviewList";
import { ChangeOverview } from "website/components/Shared/ChangeOverview";
import { MillisToSecondsInput } from "website/components/Shared/MillisToSecondsInput";
import { maxScale } from "utils/canvas";

interface Props {
    state: PriorityTreeSnapshotPageState;
    appState: AppState;
}

const MIN_IMAGE_WIDTH = 100;

@observer
export class PriorityTreeSnapshotPage extends React.Component<Props> {
    priorityTreeSvgList: Array<SVGElement> = [];

    onIntervalChange = (interval: number) => this.props.state.setInterval(interval);
    onToggleKeepClosedStreams = () => this.props.state.setRemoveClosedStreams(!this.props.state.removeClosedStreams);

    // source: http://svgopen.org/2010/papers/62-From_SVG_to_Canvas_and_Back/
    // source: https://stackoverflow.com/questions/28226677/save-inline-svg-as-jpeg-png-svg
    onSaveAsPng = () => {
        const { state } = this.props;

        const width = _.sumBy(this.priorityTreeSvgList, svg => _.max([svg.clientWidth, MIN_IMAGE_WIDTH])!);
        const height = _.maxBy(this.priorityTreeSvgList, svg => svg.clientHeight)!.clientHeight;

        const scale = maxScale(width, height);

        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const context = canvas.getContext("2d")!;

        let todo = this.priorityTreeSvgList.length;
        let x = 0;

        _.forEach(this.priorityTreeSvgList, (svg, index) => {
            const xml = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([xml], {
                type: "image/svg+xml;charset=utf-8"
            });

            const svgUrl = URL.createObjectURL(blob);
            const image = new Image();

            image.onload = () => {
                context.drawImage(image, x, 0, svg.clientWidth * scale, svg.clientHeight * scale);

                x += _.max([svg.clientWidth, MIN_IMAGE_WIDTH])! * scale;
                todo -= 1;

                if (todo === 0) {
                    canvas.toBlob(blob => {
                        const canvasUrl = URL.createObjectURL(blob);

                        const link = document.createElement("a");
                        link.download = `${state.trace.name}:${state.selectedConnection!.serverHostname}.png`;
                        link.href = canvasUrl;
                        link.click();

                        URL.revokeObjectURL(svgUrl);
                        URL.revokeObjectURL(canvasUrl);
                    });
                }
            };

            image.src = svgUrl;
        });
    };

    componentWillUpdate() {
        this.priorityTreeSvgList = [];
    }

    render() {
        const { state, appState } = this.props;

        const snapshots = _.map(state.snapshots, (snapshot, index) => {
            const previousSnapshot = state.snapshots[index - 1];
            const previousChanges = previousSnapshot ? previousSnapshot.appliedChanges : [];
            const newChanges = _.differenceBy(snapshot.appliedChanges, previousChanges, change => change.id);

            const changeOverviews = _.map(newChanges, change => {
                return <ChangeOverview key={change.id} change={change} isApplied={true} />;
            });

            return (
                <div key={snapshot.lastChange().id} className={Styles.snapshot}>
                    <div className={Styles.changeList}>
                        {changeOverviews}
                    </div>
                    <PriorityTree
                        state={snapshot}
                        removeClosedStreams={state.removeClosedStreams}
                        refcb={ref => {
                            if (ref !== null) {
                                this.priorityTreeSvgList[index] = ref;
                            }
                        }}
                    />
                </div>
            );
        });

        return (
            <div className={Styles.priorityTreeSnapshotPage}>
                <div className={Styles.configuration}>
                    <PageSelect state={appState} />
                    <TraceSelect state={appState} />
                    <ConnectionSelect
                        selected={state.selectedConnection}
                        connections={state.connections}
                        onChange={(connection: Http2Connection) => state.setSelectedConnection(connection)}
                    />
                    <MillisToSecondsInput
                        initial={state.interval}
                        onChange={this.onIntervalChange}
                    />
                    <button className={Styles.button} onClick={this.onToggleKeepClosedStreams}>
                        {state.removeClosedStreams ? "Keep closed streams" : "Remove closed streams"}
                    </button>
                    <button className={Styles.button} onClick={this.onSaveAsPng}>
                        Save as PNG
                    </button>
                    <StreamOverviewList state={state.priorityTree} />
                </div>
                <div className={Styles.snapshotList}>
                    {snapshots}
                </div>
            </div>
        );
    }
}

namespace Styles {
    export const priorityTreeSnapshotPage = style(fillParent, padding(10), horizontal, horizontallySpaced(10));

    export const configuration = style(content, vertical, start, verticallySpaced(5));

    export const snapshotList = style(flex, horizontal, start, horizontallySpaced(10), {
        height: percent(100),
        maxHeight: percent(100),
        overflow: "auto"
    });

    export const changeList = style({
        borderTop: "1px solid black"
    });

    export const snapshot = style(vertical, center, verticallySpaced(5), {
        width: "auto"
    });

    export const intervalInput = style({
        width: px(100),
        textAlign: "right"
    });

    export const button = style(content);
}
