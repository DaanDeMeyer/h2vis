import * as React from "react";
import * as _ from "lodash";
import { observer } from "mobx-react";
import TreeView from "react-treeview";
import { cssRaw, style } from "typestyle";
import { rem } from "csx";

import { DetailedInfoState } from "website/components/App/TraceTimelinePage/DetailedInfo/state";
import { ConnectionInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/ConnectionInfo";
import { StreamInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/StreamInfo";
import { SegmentInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/SegmentInfo";
import { Message, Segment } from "data-format";
import { MessageInfo } from "website/components/App/TraceTimelinePage/DetailedInfo/MessageInfo";
import { content, vertical, verticallySpaced } from "csstips";

interface Props {
    state: DetailedInfoState;
}

@observer
export class DetailedInfo extends React.Component<Props> {
    onClose = () => this.props.state.clearAll();

    render() {
        const { state } = this.props;

        return (
            <div className={Styles.detailedInfo}>
                {state.connection &&
                    <TreeView nodeLabel={<span>Connection Info:</span>}>
                        <ConnectionInfo connection={state.connection} />
                    </TreeView>}
                {state.stream &&
                    <TreeView nodeLabel={<span>Stream Info:</span>}>
                        <StreamInfo stream={state.stream} />
                    </TreeView>}
                {state.block &&
                    isSegment(state.block) &&
                    <TreeView nodeLabel={<span>Segment Info:</span>}>
                        <SegmentInfo segment={state.block} />
                    </TreeView>}
                {state.block &&
                    isMessage(state.block) &&
                    <TreeView nodeLabel={<span>Message Info:</span>}>
                        <MessageInfo message={state.block} />
                    </TreeView>}
                <button onClick={this.onClose}>Close</button>
            </div>
        );
    }
}

function isSegment(block: Segment | Message): block is Segment {
    return _.has(block, "time");
}

function isMessage(block: Segment | Message): block is Message {
    return _.has(block, "protocol");
}

export namespace Styles {
    export const detailedInfo = style(content, vertical, verticallySpaced(5), {
        width: rem(25)
    })
}

cssRaw(`
.tree-view_children {
  margin-left: 16px;
}

.tree-view_children-collapsed {
  height: 0px;
}

.tree-view_arrow {
  cursor: pointer;
  margin-right: 6px;
  display: inline-block;
  user-select: none;
}

.tree-view_arrow:after {
  content: '▾';
}

/* rotate the triangle to close it */
.tree-view_arrow-collapsed {
  transform: rotate(-90deg);
}
`)
