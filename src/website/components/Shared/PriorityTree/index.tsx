import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import { observer } from "mobx-react";

import { fileExtToColor, shortenNameTo } from "utils/file";
import { http2StreamStateToColor } from "utils/http2";
import { translate } from "utils/svg";
import { PriorityNode, PriorityTreeState } from "website/components/Shared/PriorityTree/PriorityTreeState";
import { white } from "csx";

interface Props {
    state: PriorityTreeState;
    removeClosedStreams: boolean;
    refcb: (ref: SVGElement | null) => void;
}

const NODE_RADIUS = 20;
const NODE_DIAMETER = NODE_RADIUS * 2;
const NODE_DEPTH_MARGIN = 40;

const LEFT_MARGIN = NODE_RADIUS + 5;
const TOP_MARGIN = NODE_RADIUS + 5;
const RIGHT_MARGIN = 16;
const BOTTOM_MARGIN = 20;

const WEIGHT_X_ADJUSTMENT = 3;
const WEIGHT_Y_ADJUSTMENT = -7;
const WEIGHT_HEIGHT = 18;

const NODE_STROKE_WIDTH = 4;

const LINE_STROKE_COLOR = "#555";
const LINE_STROKE_WIDTH = 2;

const FONT_SIZE = 15.36;

@observer
export class PriorityTree extends React.Component<Props> {
    render() {
        const { state, refcb, removeClosedStreams } = this.props;
        const root = state.root(removeClosedStreams, true);

        const treeDepth = _.max(_.map(root.leaves(), node => node.depth + 1))!; // depth starts at 0, we want 1.
        const treeHeight = treeDepth * NODE_DIAMETER + (treeDepth - 1) * NODE_DEPTH_MARGIN;
        const svgHeight = treeHeight + BOTTOM_MARGIN;

        const treeLayout = d3
            .tree<PriorityNode>()
            .nodeSize([NODE_DIAMETER + NODE_DEPTH_MARGIN, NODE_DIAMETER + NODE_DEPTH_MARGIN])
            .separation((a, b) => 1);
        const tree = treeLayout(root);

        const links = _.map(tree.descendants().slice(1), node => {
            const x1 = node.parent!.x;
            const x2 = node.x;
            const y1 = node.parent!.y;
            const y2 = node.y;
            return (
                <line
                    key={node.id}
                    x1={x1}
                    x2={x2}
                    y1={y1}
                    y2={y2}
                    stroke={LINE_STROKE_COLOR}
                    strokeWidth={LINE_STROKE_WIDTH}
                />
            );
        });

        const weights = _.map(tree.descendants().slice(1), node => {
            const x = (node.parent!.x + node.x) / 2 + WEIGHT_X_ADJUSTMENT;
            const y = (node.parent!.y + node.y) / 2 + WEIGHT_Y_ADJUSTMENT;
            const width = 9 * String(node.data.weight).length;
            return (
                <g key={node.id} transform={translate(x, y)}>
                    <rect fill={white.toString()} width={width} height={WEIGHT_HEIGHT} />
                    <text fontSize={FONT_SIZE} dominantBaseline="hanging">
                        {node.data.weight}
                    </text>
                </g>
            );
        });

        const nodes = _.map(tree.descendants(), node => {
            const stream = node.data;
            const x = node.x;
            const y = node.y;
            const fill = fileExtToColor(stream.file);
            const stroke = http2StreamStateToColor(stream.state);
            const title = stream.file ? shortenNameTo(stream.file.name, 30) : stream.id;
            return (
                <circle
                    key={node.id}
                    cx={x}
                    cy={y}
                    r={NODE_RADIUS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={NODE_STROKE_WIDTH}
                >
                    <title>
                        {title}
                    </title>
                </circle>
            );
        });

        const ids = _.map(tree.descendants(), node => {
            let x: number;
            if (node.data.id < 10) {
                x = node.x- 5;
            } else if (node.data.id < 100) {
                x = node.x - 9;
            } else {
                x = node.x - 13;
            }

            const y = node.y + 6;
            return (
                <text fontSize={FONT_SIZE} key={node.id} x={x} y={y}>
                    {node.data.id}
                </text>
            );
        });

        const x = _.map(tree.leaves(), leaf => leaf.x);
        const minX = _.min(x)!;
        const maxX = _.max(x)!;
        const width = maxX - minX + NODE_DIAMETER + RIGHT_MARGIN;

        // If tree layout is made with nodeSize function d3 positions the root node at (0,0). This means every node
        // positioned left of the root node is out of range of the svg. We fix this by calculating the mininmum x value
        // and moving all nodes |minX| to the right.
        return (
            <svg width={width} height={svgHeight} ref={ref => refcb(ref)}>
                <rect width={width} height={svgHeight} fill={white.toString()}/>
                <g transform={translate(-minX + LEFT_MARGIN, TOP_MARGIN)}>
                    {links}
                    {weights}
                    {nodes}
                    {ids}
                </g>
            </svg>
        );
    }
}
