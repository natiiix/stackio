import { State } from './State';

export class Runner {
    private readonly operations: string[];

    public constructor(code: string) {
        this.operations = code.split('\n');
    }

    public run(printCallback: (message: string) => void): void {
        const state = new State();

        this.operations.forEach((x, i) => {
            switch (x.toLowerCase()) {
                case 'print':
                    printCallback(state.get().toString());
                    break;

                default:
                    const num = Number(x);

                    if (!isNaN(num)) {
                        // If the instruction is a valid numeric value
                        // Push the number onto the stack
                        state.push(num);
                    } else if (x.length > 2 && x[0] === '"' && x[x.length - 1] === '"') {
                        // If the instruction is a string literal
                        // Print the value of string string
                        // Replace "\n" with actual new line characters
                        printCallback(x.substr(1, x.length - 2).replace(/\\n/g, '\n'));
                    } else {
                        // Unrecognized instruction
                        // Throw an error
                        throw Error(`Invalid instruction on line ${i + 1}: ${x}`);
                    }

                    break;
            }
        });
    }
}
