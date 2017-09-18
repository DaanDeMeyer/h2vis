import { Http2Connection } from "data-format/protocols/http2";
import { PriorityTreeState } from "website/components/Shared/PriorityTree/PriorityTreeState";
import { action } from "mobx";

export class MutablePriorityTreeState extends PriorityTreeState {
    constructor(connection: Http2Connection, applied?: number) {
        super(connection, applied);
    }

    @action
    applyChange(): void {
        this.next += 1;
    }

    @action
    undoChange(): void {
        this.next -= 1;
    }

    @action
    applyAll(): void {
        this.next = this.changes.length;
    }

    @action
    undoAll(): void {
        this.next = 0;
    }

    @action
    applyWithinInterval(interval: number): void {
        this.applyChange();
        const intervalEnd = this.lastChange().arrivalStart + interval;

        while (this.applyIsAvailable() && this.nextChange().arrivalStart < intervalEnd) {
            this.applyChange();
        }
    }

    @action
    undoWithinInterval(interval: number): void {
        const intervalEnd = this.lastChange().arrivalStart - interval;

        while (this.undoIsAvailable() && this.lastChange().arrivalStart > intervalEnd) {
            this.undoChange();
        }

        if (this.undoIsAvailable()) {
            this.undoChange();
        }
    }

    @action
    applyUntilId(id: number): void {
        this.undoAll();
        while (this.applyIsAvailable() && this.nextChange().id !== id) {
            this.applyChange();
        }
    }

    @action
    applyUntilIdWith(id: number): void {
        this.undoAll();
        this.applyChange();

        while (this.applyIsAvailable() && this.lastChange().id !== id) {
            this.applyChange()
        }
    }
}

