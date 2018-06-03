import { State } from './State';

export class Runner {
    private readonly operations: string[];

    public constructor(code: string) {
        this.operations = code.split('\n');
    }

    public run(printCallback: (message: string) => void): void {
        const state = new State();

        this.operations.forEach((x, i) => {
            // Empty line or a comment
            if (x.length === 0 || x[0] === '#') {
                return;
            }

            // Try to convert the instruction into a number
            const num = Number(x);
            // If the instruction is a valid numeric value
            if (!isNaN(num)) {
                // Push the number onto the stack
                state.push(num);
                return;
            }

            // If the instruction is a string literal
            if (x.length > 2 && x[0] === '"' && x[x.length - 1] === '"') {
                // Print the value of string string
                // Replace "\n" with actual new line characters
                printCallback(x.substr(1, x.length - 2).replace(/\\n/g, '\n'));
                return;
            }

            switch (x.toLowerCase()) {
                // PRINT
                case 'print':
                    printCallback(state.get().toString());
                    break;

                // Unrecognized instruction
                default:
                    // Throw an error
                    throw Error(`Invalid instruction on line ${i + 1}: ${x}`);
            }
        });
    }
}
