import { Http2Connection } from "data-format/protocols/http2";
import { PriorityTreeState } from "website/components/Shared/PriorityTree/PriorityTreeState";

export class ImmutablePriorityTreeState extends PriorityTreeState {
    constructor(connection: Http2Connection, applied?: number) {
        super(connection, applied);
    }

    applyChange(): ImmutablePriorityTreeState {
        return new ImmutablePriorityTreeState(this.connection, this.next + 1);
    }

    undoChange() {
        return new ImmutablePriorityTreeState(this.connection, this.next - 1);
    }

    applyAll(): ImmutablePriorityTreeState {
        return new ImmutablePriorityTreeState(this.connection, this.changes.length);
    }

    undoAll(): ImmutablePriorityTreeState {
        return new ImmutablePriorityTreeState(this.connection, 0);
    }

    applyWithinInterval(interval: number): ImmutablePriorityTreeState {
        let next = this.next + 1;
        const intervalEnd = this.lastChange(next).arrivalStart + interval;

        while (this.applyIsAvailable(next) && this.nextChange(next).arrivalStart < intervalEnd) {
            next += 1;
        }

        return new ImmutablePriorityTreeState(this.connection, next);
    }

    undoWithinInterval(interval: number): ImmutablePriorityTreeState {
        let next = this.next;
        const intervalEnd = this.lastChange(next).arrivalStart - interval;

        while (this.undoIsAvailable(next) && this.lastChange(next).arrivalStart > intervalEnd) {
            next -= 1;
        }

        return new ImmutablePriorityTreeState(this.connection, next - 1);
    }

    applyUntilId(id: number): ImmutablePriorityTreeState {
        let next = 0;
        while (this.applyIsAvailable(next) && this.nextChange(next).id !== id) {
            next += 1;
        }

        return new ImmutablePriorityTreeState(this.connection, next);
    }

    applyUntilIdWith(id: number): ImmutablePriorityTreeState {
        let next = 0;
        while (this.applyIsAvailable(next) && this.lastChange(next).id !== id) {
            next += 1;
        }

        return new ImmutablePriorityTreeState(this.connection, next);
    }
}
