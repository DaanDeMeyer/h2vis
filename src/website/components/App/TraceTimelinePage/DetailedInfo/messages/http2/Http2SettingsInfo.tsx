import * as React from "react";
import * as _ from "lodash";
import TreeView from "react-treeview";

import { Http2Settings, Http2SettingType } from "data-format/protocols/http2";
import { Http2MessageInfoCommon } from "website/components/App/TraceTimelinePage/DetailedInfo/messages/Http2MessageInfo";

interface Props {
    frame: Http2Settings;
}

export class Http2SettingsInfo extends React.Component<Props> {
    render() {
        const { frame } = this.props;

        const settings = _.map(frame.settings, setting => {
            let identifier: string = "";

            switch (setting.type) {
                case Http2SettingType.ENABLE_PUSH:
                    identifier = "Enable Push";
                    break;
                case Http2SettingType.HEADER_TABLE_SIZE:
                    identifier = "Header Table Size";
                    break;
                case Http2SettingType.INITIAL_WINDOW_SIZE:
                    identifier = "Initial Window Size";
                    break;
                case Http2SettingType.MAX_CONCURRENT_STREAMS:
                    identifier = "Max Concurrent Streams";
                    break;
                case Http2SettingType.MAX_FRAME_SIZE:
                    identifier = "Max Frame Size";
                    break;
                case Http2SettingType.MAX_HEADER_LIST_SIZE:
                    identifier = "Max Header List Size";
                    break;
            }

            return (
                <div key={identifier}>
                    {`${identifier}: ${setting.value}`}
                </div>
            );
        });

        return (
            <Http2MessageInfoCommon frame={frame}>
                <TreeView nodeLabel={<span>Settings: </span>}>
                    {settings}
                </TreeView>
            </Http2MessageInfoCommon>
        );
    }
}
