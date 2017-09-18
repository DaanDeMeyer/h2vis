import * as React from "react";
import { classes, style } from "typestyle";
import { green, red, rem } from "csx";
import { center, content, flex, horizontal, horizontallySpaced, padding, width } from "csstips";

import { Source } from "data-format";
import { borderBlack } from "website/styles";
import { Http2FrameType } from "data-format/protocols/http2";
import { PriorityChange } from "website/components/Shared/PriorityTree/PriorityTreeState";

interface Props {
    change: PriorityChange;
    isApplied: boolean;
}

export class ChangeOverview extends React.Component<Props> {
    render() {
        const { change, isApplied } = this.props;

        const type = change.type === Http2FrameType.PUSH_PROMISE ? "PP" : change.type;
        const id = getId(change);
        const parent = getDependency(change);
        const exclusive = getExclusive(change);
        const weight = getWeight(change);
        const endStream = getEndStream(change);

        const background = isApplied ? Styles.applied : Styles.notApplied;

        return (
            <div key={change.id} className={classes(Styles.changeOverview, background)}>
                <span className={Styles.id}>
                    ID: {id}
                </span>
                <span className={Styles.type}>
                    T: {type}
                </span>
                <span className={Styles.source}>
                    S: {change.source}
                </span>
                {parent !== undefined &&
                    <span className={Styles.parent}>
                        P: {parent}
                    </span>}
                {exclusive !== undefined &&
                    <span className={Styles.exclusive}>
                        E: {exclusive ? "T" : "F"}
                    </span>}
                {weight !== undefined &&
                    <span className={Styles.weight}>
                        W: {weight}
                    </span>}
                {endStream !== undefined &&
                    <span className={Styles.endStream}>
                        ES: {endStream ? "T" : "F"}
                    </span>}
            </div>
        );
    }
}

namespace Styles {
    export const changeOverview = style(
        flex,
        horizontal,
        horizontallySpaced(5),
        padding(3, 5),
        center,
        borderBlack(1)
    );

    export const id = style(content, width(rem(4)));
    export const type = style(content, width(rem(7.5)));
    export const source = style(content, width(rem(5)));
    export const parent = style(content, width(rem(3)));
    export const exclusive = style(content, width(rem(2)));
    export const weight = style(content, width(rem(4)));
    export const endStream = style(content, width(rem(3)));

    export const applied = style({
        background: green.fade(0.2).toString()
    });

    export const notApplied = style({
        background: red.fade(0.2).toString()
    });
}

function getId(change: PriorityChange): number {
    if (change.type === Http2FrameType.PUSH_PROMISE) {
        return change.promisedStreamId;
    }

    return change.streamId;
}

function getDependency(change: PriorityChange): number | undefined {
    if (change.type === Http2FrameType.HEADERS) {
        return change.dependency;
    }

    if (change.type === Http2FrameType.PRIORITY) {
        return change.dependency;
    }

    if (change.type === Http2FrameType.PUSH_PROMISE) {
        return change.streamId;
    }

    return undefined;
}

function getExclusive(change: PriorityChange): boolean | undefined {
    if (change.type === Http2FrameType.HEADERS && change.source === Source.SERVER) {
        return change.exclusive;
    }

    if (change.type === Http2FrameType.PRIORITY) {
        return change.exclusive;
    }

    return undefined;
}

function getWeight(change: PriorityChange): number | undefined {
    if (change.type === Http2FrameType.HEADERS) {
        return change.weight;
    }

    if (change.type === Http2FrameType.PRIORITY) {
        return change.weight;
    }

    return undefined;
}

function getEndStream(change: PriorityChange): boolean | undefined {
    if (
        (change.type === Http2FrameType.HEADERS || change.type === Http2FrameType.DATA) &&
        change.source === Source.SERVER
    ) {
        return change.flags.endStream;
    }

    return undefined;
}
