export class Runner {
    private readonly operations: string[];

    constructor(code: string) {
        this.operations = code.split('\n');
    }

    run(printCallback: (message: string) => void): void {
        this.operations.forEach((x, i) => printCallback(`${i + 1}: ${x}\n`));
    }
}
