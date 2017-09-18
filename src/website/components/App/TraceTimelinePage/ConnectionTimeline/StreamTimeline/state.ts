import { action, observable } from "mobx";

import { Stream } from "data-format";

export class StreamTimelineState {
    readonly stream: Stream;

    @observable selected: boolean;

    constructor(stream: Stream) {
        this.stream = stream;
        this.selected = false;
    }

    @action
    setSelected(value: boolean) {
        this.selected = value;
    }
}
