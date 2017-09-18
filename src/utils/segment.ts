import * as _ from "lodash";
import { green, lightblue, red } from "csx";

import { Segment } from "data-format";

export function segmentToColor(segment: Segment, previous: Segment | undefined): string {
    let color = lightblue.toString();
    if (isAckOnlySegment(segment, previous)) color = green.toString();
    if (segment.flags.fin) color = red.toString();

    return color;
}

export function groupByRoundtrip(segments: Array<Segment>, rtt: number): Array<Array<Segment>> {
    const result: Array<Array<Segment>> = [];
    let current: Array<Segment> = [];

    _.forEach(segments, (segment, index) => {
        const previousSegment = segments[index - 1];
        const timeSincePrevious = previousSegment ? segment.time - previousSegment.time : 0;

        if (timeSincePrevious < rtt - (rtt / 10)) {
            current.push(segment);
        } else {
            result.push(current);
            current = [segment];
        }
    });

    result.push(current);

    return result;
}

export function isAckOnlySegment(segment: Segment, previous: Segment | undefined): boolean {
    if (previous) {
        return (
            segment.acknowledgementNumber > previous.acknowledgementNumber &&
            segment.sequenceNumber === previous.sequenceNumber
        );
    } else {
        return false;
    }

}
