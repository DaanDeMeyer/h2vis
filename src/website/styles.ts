import * as _ from "lodash";
import { black, px } from "csx";
import { CSSProperties } from "typestyle/lib/types";

export function css(...cssProperties: CSSProperties[]): CSSProperties {
    return _.assign({}, ...cssProperties);
}

export function borderBlack(size: number): CSSProperties {
    return {
        border: px(1),
        marginTop: px(-1),
        borderStyle: "solid",
        borderColor: black.toHexString()
    }
}