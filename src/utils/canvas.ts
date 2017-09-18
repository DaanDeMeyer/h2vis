import * as _ from "lodash";

export function maxScale(width: number, height: number): number {
    const xScale = 4096 / width;
    const yScale = 4096 / height;
    return _.min([xScale, yScale])!;
}