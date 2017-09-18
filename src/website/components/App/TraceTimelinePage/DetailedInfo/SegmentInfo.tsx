import * as React from "react";

import { Segment } from "data-format";
import { DetailedInfoStyles } from "website/components/App/TraceTimelinePage/DetailedInfo/styles";
import TreeView from "react-treeview";

interface Props {
    segment: Segment;
}

export class SegmentInfo extends React.Component<Props> {
    render() {
        const { segment } = this.props;

        return (
            <div className={DetailedInfoStyles.info}>
                <div>
                    ID: {segment.id}
                </div>
                <div>
                    Source: {segment.source}
                </div>
                {/*<div>*/}
                    {/*Stream ID: {segment.streamId}*/}
                {/*</div>*/}
                <div>
                    Time: {segment.time}
                </div>
                <div>
                    Header Length: {segment.headerLength}
                </div>
                <div>
                    Length: {segment.dataLength}
                </div>
                <div>
                    Sequence Number: {segment.sequenceNumber}
                </div>
                <div>
                    Acknowledgement Number: {segment.acknowledgementNumber}
                </div>
                <div>
                    Receive Window: {segment.receiveWindow}
                </div>

                <TreeView nodeLabel={<span>Flags: </span>} childrenClassName={DetailedInfoStyles.info}>
                    <div>
                        res: {segment.flags.res ? "1" : "0"}
                    </div>
                    <div>
                        ns: {segment.flags.ns ? "1" : "0"}
                    </div>
                    <div>
                        cwr: {segment.flags.cwr ? "1" : "0"}
                    </div>
                    <div>
                        ece: {segment.flags.ece ? "1" : "0"}
                    </div>
                    <div>
                        urg: {segment.flags.urg ? "1" : "0"}
                    </div>
                    <div>
                        ack: {segment.flags.ack ? "1" : "0"}
                    </div>
                    <div>
                        psh: {segment.flags.psh ? "1" : "0"}
                    </div>
                    <div>
                        rst: {segment.flags.rst ? "1" : "0"}
                    </div>
                    <div>
                        syn: {segment.flags.syn ? "1" : "0"}
                    </div>
                    <div>
                        fin: {segment.flags.fin ? "1" : "0"}
                    </div>
                </TreeView>
            </div>
        );
    }
}
