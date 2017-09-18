import * as _ from "lodash";
import * as React from "react";
import { fileExtToColorMap } from "utils/file";
import { style } from "typestyle";
import { centerCenter, content, horizontal, horizontallySpaced, vertical, verticallySpaced } from "csstips";
import { black } from "csx";

interface Props {}

const SVG_WIDTH = 30;
const SVG_HEIGHT = 30;

export class ColorToFileExtLegend extends React.Component<Props> {
    render() {
        const colorList = _.values(fileExtToColorMap).map(color => {
            return (
                <svg key={color} className={Styles.color}>
                    <circle
                        cx={SVG_WIDTH / 2}
                        cy={SVG_WIDTH / 2}
                        r={SVG_WIDTH / 2}
                        fill={color}
                        stroke={black.toString()}
                    />
                </svg>
            );
        });

        const fileExtensionList = _.keys(fileExtToColorMap).map(fileExt => {
            return (
                <div key={fileExt} className={Styles.fileExtension}>
                    {fileExt}
                </div>
            );
        });

        return (
            <div className={Styles.colorToFileExtensionLegend}>
                <div className={Styles.colorList}>
                    {colorList}
                </div>
                <div className={Styles.fileExtensionList}>
                    {fileExtensionList}
                </div>
            </div>
        );
    }
}

namespace Styles {
    export const colorToFileExtensionLegend = style(content, horizontal, horizontallySpaced(5));

    export const colorList = style(content, vertical, verticallySpaced(5));

    export const fileExtensionList = style(content, vertical, verticallySpaced(5));

    export const color = style(content, {
        width: SVG_WIDTH,
        height: SVG_HEIGHT
    });

    export const fileExtension = style(content, vertical, centerCenter, {
        height: SVG_HEIGHT
    });
}
