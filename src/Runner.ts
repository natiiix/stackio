import { State } from './State';

export class Runner {
    private readonly operations: string[];
    private readonly print: (message: string) => void;

    public constructor(code: string, printCallback: (message: string) => void) {
        // One operation per line
        this.operations = code.split('\n');
        this.print = printCallback;
    }

    public run(): void {
        // Create a new state (empty stack, instruction counter set to 0)
        const state = new State();

        // Execute instruction until the program runs to the end
        while (state.counter < this.operations.length) {
            this.executeInstruction(state);
        }
    }

    private executeInstruction(state: State): void {
        // Get the current instruction
        const instr = this.operations[state.counter];

        // Try to convert the instruction into a number
        const num = Number(instr);

        // Empty line or a comment
        if (instr.length === 0 || instr[0] === '#') {
            return;
        }
        // If the instruction is a valid numeric value
        else if (!isNaN(num)) {
            // Push the number onto the stack
            state.push(num);
            return;
        }
        // If the instruction is a string literal
        if (instr.length > 2 && instr[0] === '"' && instr[instr.length - 1] === '"') {
            // Print the value of string string
            // Replace "\n" with actual new line characters
            this.print(instr.substr(1, instr.length - 2).replace(/\\n/g, '\n'));
            return;
        }
        // Word instructions
        else {
            switch (instr.toLowerCase()) {
                // PRINT
                case 'print':
                    this.print(state.get().toString());
                    break;

                // Unrecognized instruction
                default:
                    // Throw an error
                    throw Error(`Invalid instruction on line ${state.counter + 1}: ${instr}`);
            }
        }

        // Increment the instruction counter
        state.counter++;
    }
}
