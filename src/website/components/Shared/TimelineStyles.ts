import { green, percent, red, rem } from "csx";
import {
    center,
    centerJustified,
    content, flex,
    horizontal,
    horizontallySpaced,
    padding, startJustified,
    vertical,
    verticallySpaced
} from "csstips";
import { style } from "typestyle";

import { borderBlack, css } from "website/styles";

export namespace TimelineStyles {
    export const MIN_HEIGHT_SEGMENTS_PX = 55;
    export const MIN_HEIGHT_MESSAGES_PX = 40;

    export const infoContainer = style(horizontal, startJustified, center, horizontallySpaced(5), padding(2, 5), borderBlack(1), {

    });

    export const checkbox = style(content, {

    });

    export const info = style(flex, vertical, verticallySpaced(3), {

    });

    export const timeline = style(content, vertical, borderBlack(1));

    const background = css(content, vertical, centerJustified, {
        flexGrow: 1,
        width: percent(100)
    });

    export const client = style(background, {
        background: green.fade(0.2).toString()
    });

    export const server = style(background, {
        background: red.fade(0.2).toString()
    });
}
