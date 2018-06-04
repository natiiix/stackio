export class BetterEnumerator<T> {
    private array: T[];
    private internalIndex: number;

    public constructor(arr: T[]) {
        if (arr.length === 0) {
            throw Error('Unable to set up an enumerator for a zero-length array');
        }

        this.array = arr;
        this.internalIndex = 0;
    }

    public movePrevious(): boolean {
        const canMove = this.internalIndex > 0;

        if (canMove) {
            this.internalIndex--;
        }

        return canMove;
    }

    public moveNext(): boolean {
        const canMove = this.internalIndex + 1 < this.array.length;

        if (canMove) {
            this.internalIndex++;
        }

        return canMove;
    }

    public moveFirst(): void {
        this.internalIndex = 0;
    }

    public moveLast(): void {
        this.internalIndex = this.array.length - 1;
    }

    public get current(): T {
        return this.array[this.internalIndex];
    }

    public get previous(): T {
        return this.array[this.internalIndex - 1];
    }

    public get next(): T {
        return this.array[this.internalIndex + 1];
    }

    public set index(index: number) {
        if (index < 0 || index >= this.array.length) {
            throw Error('Invalid index: ' + index.toString());
        }

        this.internalIndex = index;
    }

    public get index(): number {
        return this.internalIndex;
    }
}
