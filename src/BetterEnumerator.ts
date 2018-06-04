export class BetterEnumerator<T> {
    private array: T[];
    private index: number;

    public constructor(arr: T[]) {
        if (arr.length === 0) {
            throw Error('Unable to set up an enumerator for a zero-length array');
        }

        this.array = arr;
        this.index = 0;
    }

    public movePrevious(): boolean {
        const canMove = this.index > 0;

        if (canMove) {
            this.index--;
        }

        return canMove;
    }

    public moveNext(): boolean {
        const canMove = this.index + 1 < this.array.length;

        if (canMove) {
            this.index++;
        }

        return canMove;
    }

    public moveFirst(): void {
        this.index = 0;
    }

    public moveLast(): void {
        this.index = this.array.length - 1;
    }

    public get current(): T {
        return this.array[this.index];
    }

    public get previous(): T {
        return this.array[this.index - 1];
    }

    public get next(): T {
        return this.array[this.index + 1];
    }
}
