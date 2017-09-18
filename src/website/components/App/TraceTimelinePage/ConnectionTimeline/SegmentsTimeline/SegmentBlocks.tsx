import * as _ from "lodash";
import * as React from "react";
import { observer } from "mobx-react";
import { classes, style } from "typestyle";
import { black, percent, purple } from "csx";
import { block } from "csstips";

import { Segment } from "data-format";
import { translate } from "utils/svg";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";
import { groupByRoundtrip, isAckOnlySegment, segmentToColor } from "utils/segment";

interface Props {
    segments: Array<Segment>;
    rtt?: number;
    height: number;
    axis: ZoomAxisState;
    displayAcks: boolean;
    displayRttGroups: boolean;
    onClick: (segment: Segment) => void;
}

const SEGMENT_WIDTH = 8;
const SEGMENT_HEIGHT = 9;

const MARGIN_TOP = 2;
const MARGIN_BOTTTOM = 2;

const TEXT_WIDTH = 70;
const TEXT_MARGIN = 7;

@observer
export class SegmentBlocks extends React.Component<Props> {
    render() {
        const { segments, rtt, height, axis, displayAcks, displayRttGroups, onClick } = this.props;

        const filtered = displayAcks
            ? segments
            : _.filter(segments, (segment, index) =>
                  !isAckOnlySegment(segment, index > 0 ? segments[index - 1] : undefined)
              );

        const segmentBlocks = _.map(filtered, (segment, index) => {
            const segmentX = axis.convert(segment.time);

            const color = style({
                fill: segmentToColor(segment, index > 0 ? segments[index - 1] : undefined)
            });

            return (
                <rect
                    key={segment.id}
                    transform={translate(segmentX, 0)}
                    width={SEGMENT_WIDTH}
                    height={SEGMENT_HEIGHT}
                    className={classes(Styles.segment, color)}
                    onClick={() => onClick(segment)}
                />
            );
        });

        const groupedByRtt = displayRttGroups && rtt ? groupByRoundtrip(segments, rtt) : undefined;

        const roundtrips = groupedByRtt
            ? _.map(groupedByRtt, roundtrip => {
                  const first = _.first(roundtrip)!;
                  const last = _.last(roundtrip)!;

                  const x = axis.convert(first.time);
                  const width =
                      axis.convert(last.time) > SEGMENT_WIDTH
                          ? axis.convert(last.time) - x + SEGMENT_WIDTH
                          : SEGMENT_WIDTH;

                  return (
                      <rect
                          key={first.id}
                          transform={translate(x, 0)}
                          width={width}
                          height={height}
                          className={Styles.roundtrip}
                      />
                  );
              })
            : undefined;

        const roundtripSizes = groupedByRtt
            ? _.map(groupedByRtt, (roundtrip, index) => {
                  const start = axis.convert(_.last(roundtrip)!.time) + SEGMENT_WIDTH + TEXT_MARGIN;
                  const nextRoundtrip = groupedByRtt[index + 1];
                  const end = nextRoundtrip ? axis.convert(_.first(nextRoundtrip)!.time) : axis.scale.range()[1];
                  const size = _.sumBy(roundtrip, segment => segment.dataLength);

                  if (end - start > TEXT_WIDTH) {
                      return (
                          <text
                              x={start}
                              height={SEGMENT_HEIGHT}
                              key={_.last(roundtrip)!.id}
                              className={Styles.roundtripSize}
                          >
                              {`${size / 1000} kB`}
                          </text>
                      );
                  } else {
                      return undefined;
                  }
              })
            : undefined;

        const segmentY = (height - SEGMENT_HEIGHT) / 2;
        const textY = segmentY - 3;

        return (
            <svg height={height} className={Styles.svg}>
                {roundtrips}
                <g transform={translate(0, textY)}>
                    {roundtripSizes}
                </g>
                <g transform={translate(0, segmentY)}>
                    {segmentBlocks}
                </g>
            </svg>
        );
    }
}

namespace Styles {
    export const svg = style(block, {
        width: percent(100)
    });

    export const segment = style({
        stroke: black.toString()
    });

    export const roundtripSize = style({
        dominantBaseline: "hanging"
    });

    export const roundtrip = style({
        fill: purple.fade(0.4).toString()
    });
}

export function calculateSegmentBlocksRequiredHeight(segments: Array<Segment>): number {
    return SEGMENT_HEIGHT + MARGIN_TOP + MARGIN_BOTTTOM;
}
