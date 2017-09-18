import * as _ from "lodash";
import * as React from "react";
import { observer } from "mobx-react";
import { style } from "typestyle";
import { black, percent } from "csx";
import { block } from "csstips";

import { Message } from "data-format";
import { translate } from "utils/svg";
import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";

interface Props {
    messages: Array<Message>;
    messageToColor: (message: Message) => string;
    expandWidth: boolean;
    axis: ZoomAxisState;
    onClick?: (message: Message) => void;
}

const MESSAGE_MIN_WIDTH = 8;
const MESSAGE_HEIGHT = 9;

const MARGIN_TOP = 3;
const MARGIN_BOTTOM = 3;
const MARGIN = 2;

const groupByMemoized = _.memoize(_.groupBy, (input: Array<Message>) => JSON.stringify(input));

@observer
export class MessageBlocks extends React.Component<Props> {
    render() {
        const { messages, messageToColor, expandWidth, axis, onClick } = this.props;

        const groupedByArrivalTime = groupByMemoized(messages, message => message.arrivalStart);
        let height = 0;

        const messageBlocks = _.flatMap(groupedByArrivalTime, messages => {
            const stackHeight = calculateStackHeight(messages);
            height = stackHeight > height ? stackHeight : height;

            const messageX = axis.convert(messages[0].arrivalStart);

            const stack = _.map(messages, (message, index) => {
                const messageWidth = expandWidth
                    ? _.max([MESSAGE_MIN_WIDTH, axis.convert(message.arrivalEnd) - messageX])
                    : MESSAGE_MIN_WIDTH;

                const messageY = index * (MESSAGE_HEIGHT + MARGIN);

                return (
                    <rect
                        key={message.id}
                        transform={translate(messageX, messageY)}
                        width={messageWidth}
                        height={MESSAGE_HEIGHT}
                        onClick={onClick ? () => onClick(message) : undefined}
                        className={Styles.message}
                        fill={messageToColor(message)}
                    />
                );
            });

            return stack;
        });

        return (
            <svg height={height + MARGIN_TOP + MARGIN_BOTTOM} className={Styles.svg}>
                <g transform={translate(0, MARGIN_TOP)}>
                    {messageBlocks}
                </g>
            </svg>
        );
    }
}

namespace Styles {
    export const svg = style(block, {
        width: percent(100)
    });

    export const message = style({
        stroke: black.toString()
    });
}

export function calculateMessageBlocksHeight(messages: Array<Message>): number {
    const groupedByArrivalTime = groupByMemoized(messages, message => message.arrivalStart);

    const maxHeight = _.reduce(
        groupedByArrivalTime,
        (height, messages) => {
            const stackHeight = calculateStackHeight(messages);

            if (stackHeight > height) {
                return stackHeight;
            } else {
                return height;
            }
        },
        0
    );

    return maxHeight + MARGIN_TOP + MARGIN_BOTTOM;
}

function calculateStackHeight(messages: Array<Message>): number {
    const height = messages.length * (MESSAGE_HEIGHT + MARGIN);
    return height === 0 ? 0 : height - MARGIN;
}
