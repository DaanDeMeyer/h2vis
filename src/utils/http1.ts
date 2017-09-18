import { blue, green, red } from "csx";

import { Http1Message } from "data-format/protocols/http1";

export function http1MessageToColor(message: Http1Message): string {
    return http1MessageToColorMap[message.type];
}

const http1MessageToColorMap: {[type: string]: string} = {
    REQUEST: green.toString(),
    RESPONSE: blue.toString(),
    CONTINUATION: red.toString()
};
