import * as React from "react";
import { observer } from "mobx-react";
import { style } from "typestyle";
import {
    content,
    fillParent,
    flex,
    horizontal,
    horizontallyCenterChildren,
    horizontallySpaced,
    padding,
    start,
    vertical,
    verticallySpaced
} from "csstips";
import { percent, px, white } from "csx";

import { PriorityTreePageState } from "website/components/App/PriorityTreePage/state";
import { PriorityTree } from "website/components/Shared/PriorityTree";
import { AppState } from "website/components/App/state";
import { PageSelect } from "website/components/Shared/PageSelect";
import { TraceSelect } from "website/components/Shared/TraceSelect";
import { StreamOverviewList } from "website/components/Shared/StreamOverviewList";
import { ChangeButtons } from "website/components/App/PriorityTreePage/ChangeButtons";
import { ConnectionSelect } from "website/components/Shared/ConnectionSelect";
import { Http2Connection } from "data-format/protocols/http2";
import { ChangeOverviewList } from "website/components/App/PriorityTreePage/ChangeOverviewList";
import { ChangeTimeline } from "website/components/Shared/ChangeTimeline";
import { maxScale } from "utils/canvas";

interface Props {
    state: PriorityTreePageState;
    appState: AppState;
}

@observer
export class PriorityTreePage extends React.Component<Props> {
    priorityTreeSvg: SVGElement;

    onToggleKeepClosedStreams = () => this.props.state.setRemoveClosedStreams(!this.props.state.removeClosedStreams);

    onSaveAsPng = () => {
        const { state } = this.props;

        const scale = maxScale(this.priorityTreeSvg.clientWidth, this.priorityTreeSvg.clientHeight);

        const canvasWidth = this.priorityTreeSvg.clientWidth * scale;
        const canvasHeight = this.priorityTreeSvg.clientHeight * scale;

        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const context = canvas.getContext("2d")!;

        const xml = new XMLSerializer().serializeToString(this.priorityTreeSvg);
        const blob = new Blob([xml], {
            type: "image/svg+xml;charset=utf-8"
        });

        const svgUrl = URL.createObjectURL(blob);
        const image = new Image();

        image.onload = () => {
            context.drawImage(image, 0, 0, canvasWidth, canvasHeight);

            canvas.toBlob(blob => {
                const canvasUrl = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.download = `${state.trace.name}:${state.selectedConnection!.serverHostname}.png`;
                link.href = canvasUrl;
                link.click();

                URL.revokeObjectURL(svgUrl);
                URL.revokeObjectURL(canvasUrl);
            });
        };

        image.src = svgUrl;
    };

    onSaveAsSvg = () => {
        const { state } = this.props;

        const xml = new XMLSerializer().serializeToString(this.priorityTreeSvg);
        const blob = new Blob([xml], {
            type: "image/svg+xml;charset=utf-8"
        });

        const svgUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.download = `${state.trace.name}:${state.selectedConnection!.serverHostname}.svg`;
        link.href = svgUrl;
        link.click();

        URL.revokeObjectURL(svgUrl);
    };

    render() {
        const { state, appState } = this.props;

        return (
            <div className={Styles.PriorityTreePage}>
                <div className={Styles.configuration}>
                    <PageSelect state={appState} />
                    <TraceSelect state={appState} />
                    <ConnectionSelect
                        selected={state.selectedConnection}
                        connections={state.connections}
                        onChange={(connection: Http2Connection) => state.setSelectedConnection(connection)}
                    />
                    <button className={Styles.button} onClick={this.onToggleKeepClosedStreams}>
                        {state.removeClosedStreams ? "Keep closed streams" : "Remove closed streams"}
                    </button>
                    <button className={Styles.button} onClick={this.onSaveAsPng}>
                        Save As PNG
                    </button>
                    <button className={Styles.button} onClick={this.onSaveAsSvg}>
                        Save as SVG
                    </button>
                    <ChangeButtons state={state.priorityTree} />
                    <StreamOverviewList state={state.priorityTree} />
                </div>
                <div className={style(flex, vertical, verticallySpaced(10))}>
                    <ChangeTimeline state={state.priorityTree} axis={state.changesTimelineAxis} />
                    <div className={style(flex, start, horizontal)}>
                        <div className={Styles.priorityTree}>
                            <PriorityTree
                                state={state.priorityTree}
                                refcb={ref => (this.priorityTreeSvg = ref!)}
                                removeClosedStreams={state.removeClosedStreams}
                            />
                        </div>
                        <ChangeOverviewList state={state.priorityTree} />
                    </div>
                </div>
            </div>
        );
    }
}

namespace Styles {
    export const PriorityTreePage = style(fillParent, padding(10), horizontal, horizontallySpaced(10));

    export const configuration = style(content, vertical, start, verticallySpaced(5));

    export const priorityTree = style(flex, horizontallyCenterChildren, padding(5), {
        width: px(0),
        maxHeight: percent(100),
        overflow: "auto"
    });

    export const button = style(content);
}
