import * as d3 from "d3";
import { action, computed, observable, runInAction } from "mobx";

export class ZoomAxisState {
    width: number;
    height: number;

    @observable start: number;
    @observable end: number;

    zoom: d3.ZoomBehavior<Element, {}>;
    zoomTransform: d3.ZoomTransform;

    refScale: d3.ScaleLinear<number, number>;
    @observable.ref scale: d3.ScaleLinear<number, number>;

    constructor(start: number, end: number) {
        this.width = 0;
        this.height = 0;

        this.start = start;
        this.end = end;

        this.refScale = d3.scaleLinear().domain([start - start, end - start]).range([0, 0]).nice();
        this.scale = this.refScale;

        this.zoomTransform = d3.zoomIdentity;
        this.zoom = d3.zoom().scaleExtent([1, 400]).on("zoom", () => {
            runInAction(() => {
                this.zoomTransform = d3.event.transform;
                this.scale = this.zoomTransform.rescaleX(this.refScale);
            });
        });
    }

    @action
    setDimensions(width: number, height: number) {
        if (width === this.width && height === this.height) return;

        this.width = width;
        this.height = height;

        this.refScale.range([0, width]);
        this.scale = this.zoomTransform.rescaleX(this.refScale);
        this.zoom.extent([[0, 0], [width, height]]).translateExtent([[0, 0], [width, height]]);
    }

    convert(value: number): number {
        return computed(() => {
            return this.scale(value - this.start);
        }).get();
    }
}
