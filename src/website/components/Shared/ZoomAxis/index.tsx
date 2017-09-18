import * as React from "react";
import * as d3 from "d3";
import { observer } from "mobx-react";
import ResizeObserver from "resize-observer-polyfill";
import { style } from "typestyle";
import { content, flex, vertical } from "csstips";
import { important, px } from "csx";

import { ZoomAxisState } from "website/components/Shared/ZoomAxis/state";

export enum AxisPosition {
    TOP,
    BOTTOM
}

interface Props {
    state: ZoomAxisState;
    position: AxisPosition;
}

@observer
export class ZoomAxis extends React.Component<Props> {
    axis: d3.Axis<number | { valueOf(): number }>;
    axisContainer: d3.AxisContainerElement;

    zoom: HTMLDivElement;
    resizeObserver: ResizeObserver;

    constructor(props: Props) {
        super(props);

        this.axis =
            this.props.position === AxisPosition.TOP
                ? d3.axisTop(this.props.state.scale)
                : d3.axisBottom(this.props.state.scale);

        this.axis
            .tickSizeOuter(0)
            .tickSizeInner(-this.props.state.height)
            .tickFormat(domainValue => `${domainValue} s`);
    }

    componentDidMount() {
        this.resizeObserver = new ResizeObserver(() => {
            const { state } = this.props;

            const newWidth = this.zoom.clientWidth;
            const oldWidth = state.width;
            const transform = d3.zoomTransform(this.zoom);

            // Inspiration: https://stackoverflow.com/questions/25875316/d3-preserve-scale-translate-after-resetting-range
            const prevTranslate = transform.x / transform.k;
            const translatePercentage = oldWidth === 0 ? 0 : prevTranslate / oldWidth;
            const newX = translatePercentage * newWidth;

            this.props.state.setDimensions(this.zoom.clientWidth, this.zoom.clientHeight);
            state.zoom.transform(d3.select(this.zoom), d3.zoomIdentity.scale(transform.k).translate(newX, 0));
        });

        this.resizeObserver.observe(this.zoom);

        d3.select(this.zoom).call(this.props.state.zoom);
        d3.select(this.axisContainer).call(this.axis);
    }

    componentDidUpdate() {
        d3.select(this.zoom).call(this.props.state.zoom);
        d3.select(this.axisContainer).call(this.axis);
    }

    componentWillUnmount() {
        this.resizeObserver.disconnect();
    }

    render() {
        const { state, children, position } = this.props;

        this.axis.tickSizeInner(-state.height);
        this.axis.scale(state.scale);

        const axis = <svg className={Styles.axis} ref={ref => (this.axisContainer = ref!)} />;

        return (
            <div ref={ref => (this.zoom = ref!)} className={Styles.zoom}>
                {state.width !== 0 && position === AxisPosition.TOP && axis}
                {state.width !== 0 && children}
                {state.width !== 0 && position === AxisPosition.BOTTOM && axis}
            </div>
        );
    }
}

namespace Styles {
    export const axis = style(content, {
        height: px(1),
        overflow: important("visible")
    });

    export const zoom = style(flex, vertical);
}
