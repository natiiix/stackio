export class State {
    private stack: number[];

    /**
     * Constructs a state with an empty stack.
     */
    public constructor() {
        this.stack = [];
    }

    /**
     * Converts negative index (relative to the top of the stack)
     * to absolute index (relative to the bottom of the stack).
     * @param idx Index relative either to the top (negative) or the bottom (positive) of the stack.
     */
    private toAbsIdx(idx: number): number {
        return idx >= 0 ? idx : this.stack.length + idx;
    }

    /**
     * Returns a stack element at a given index.
     * @param index Index of requested stack element.
     * @returns Returns the value of requested stack element.
     */
    public get(index = -1): number {
        return this.stack[this.toAbsIdx(index)];
    }

    /**
     * Changes the value of a stack element at a given index.
     * @param index Index of the stack element to be changed.
     * @param value New value of the stack element.
     */
    public set(index: number, value: number): void {
        this.stack[this.toAbsIdx(index)] = value;
    }

    /**
     * Pushes a value on top of the stack.
     * @param value Value of the element to be pushed onto the stack.
     */
    public push(value: number): void {
        this.stack.push(value);
    }

    /**
     * Pops an element from the stack and returns its value.
     * @returns Returns the value of the popped stack element.
     */
    public pop(): number {
        return this.stack.pop();
    }
}
