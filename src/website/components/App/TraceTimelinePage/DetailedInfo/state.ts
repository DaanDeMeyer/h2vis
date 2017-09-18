import { Connection, Message, Segment, Stream } from "data-format";
import { action, observable } from "mobx";

export class DetailedInfoState {
    @observable connection: Connection | undefined;
    @observable stream: Stream | undefined;
    @observable block: Segment | Message | undefined;

    constructor() {
        this.block = undefined;
        this.connection = undefined;
    }

    @action
    setSegment(connection: Connection, segment: Segment) {
        this.connection = connection;
        this.block = segment;
    }

    @action
    setMessage(connection: Connection, stream: Stream, message: Message) {
        this.connection = connection;
        this.stream = stream;
        this.block = message;
    }

    @action
    clearAll() {
        this.connection = undefined;
        this.stream = undefined;
        this.block = undefined;
    }

    isSet(): boolean {
        return this.block !== undefined;
    }
}
