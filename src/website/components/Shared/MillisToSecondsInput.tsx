import * as React from "react";
import * as _ from "lodash";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { px } from "csx";
import { style } from "typestyle";

interface Props {
    initial?: number;
    onChange: (interval: number) => void;
}

@observer
export class MillisToSecondsInput extends React.Component<Props> {
    @observable value: number;

    constructor(props: Props) {
        super(props);
        this.value = props.initial ? _.round(props.initial * 1000) : 10; // to millis
    }

    onIntervalChange = action((event: any) => {
        this.value = Number(event.target.value);
        return this.props.onChange(this.value / 1000); // to seconds
    });

    @action
    componentDidUpdate() {
        this.value = this.props.initial ? _.round(this.props.initial * 1000) : 10; // to millis
        console.log(this.value);
    }

    render() {
        return (
            <div>
                <span>Interval: </span>
                <input
                    type="number"
                    className={Styles.intervalInput}
                    value={this.value}
                    onChange={this.onIntervalChange}
                />
                <span> ms</span>
            </div>
        );
    }
}

namespace Styles {
    export const intervalInput = style({
        width: px(100),
        textAlign: "right"
    });
}
