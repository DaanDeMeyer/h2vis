import { black, blue, crimson, darkgreen, deeppink, gray, green, olive, orange, purple, red, yellow } from "csx";

import { Http2Frame } from "data-format/protocols/http2";
import { PriorityNodeState } from "website/components/Shared/PriorityTree/PriorityTreeState";

export function http2FrameToColor(frame: Http2Frame): string {
    return http2FrameToColorMap[frame.type];
}

const http2FrameToColorMap: { [type: string]: string } = {
    HEADERS: green.toString(),
    CONTINUATION: darkgreen.toString(),
    DATA: blue.toString(),
    PRIORITY: yellow.toString(),
    SETTINGS: orange.toString(),
    RST_STREAM: red.toString(),
    PUSH_PROMISE: purple.toString(),
    GOAWAY: black.toString(),
    PING: olive.toString(),
    WINDOW_UPDATE: gray.toString()
};

export function http2StreamStateToColor(state: PriorityNodeState): string {
    return http2StreamStateToColorMap[state];
}

const http2StreamStateToColorMap: { [state: string]: string } = {
    CLOSED: red.toString(),
    OPEN: green.toString(),
    RESERVED: purple.toString(),
    REFERENCED: black.toString()
};
