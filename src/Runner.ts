import { State } from './State';
import { lex, Token } from './lexer';
import { BetterEnumerator } from './BetterEnumerator';

export class Runner {
    private readonly tokens: Token[];
    private readonly labels: { [label: string]: number };
    private readonly print: (message: string) => void;

    public constructor(code: string, printCallback: (message: string) => void) {
        // Tokenize the code
        this.tokens = lex(code);

        // Extract labels
        this.tokens.forEach((x, i) => {
            if (x.type !== 'label') {
                return;
            }

            if (this.labels.hasOwnProperty(x.value)) {
                throw Error(`Multiple definitions of label \"${x.value}\"`);
            }

            this.labels[x.value] = i;
        });

        // Store the print function callback
        this.print = printCallback;
    }

    public run(): void {
        // Create a new state with an empty stack
        const state = new State();

        // Create an enumerator for the tokens
        const tokenEnum = new BetterEnumerator(this.tokens);

        // Get start time
        const startTime = Date.now();

        // Program execution loop
        do {
            // The maximum allowed program execution time is 1 second
            if (Date.now() - startTime > 1000) {
                throw Error('1 second elapsed, please check for an infinite loop');
            }

            this.executeInstruction(state, tokenEnum);
        } while (tokenEnum.moveNext());
    }

    private executeInstruction(state: State, tokenEnum: BetterEnumerator<Token>): void {
        // Get the current token
        const token = tokenEnum.current;

        switch (token.type) {
            // Label definition
            case 'label':
                break;

            // Label jump
            case 'jump':
                if (this.labels.hasOwnProperty(token.value)) {
                    tokenEnum.index = this.labels[token.value];
                }
                else {
                    throw Error(`Unable to jump to an undefined label \"${token.value}\"`);
                }
                break;

            // Numberic value
            case 'number':
                {
                    const num = Number(token.value);

                    if (isNaN(num)) {
                        throw new UnexpectedTokenError(token);
                    }

                    state.push(num);
                }
                break;

            // String literal
            case 'string':
                this.print(token.value);
                break;

            // Symbol
            case 'symbol':
                switch (token.value.toLowerCase()) {
                    // PRINT
                    case 'print':
                        this.print(state.get().toString());
                        break;

                    // POP
                    case 'pop':
                        state.pop();
                        break;

                    // CLONE
                    case 'clone':
                        state.push(state.get());
                        break;

                    // COUNT
                    case 'count':
                        state.push(state.stackSize);
                        break;

                    // SWAP
                    case 'swap':
                        {
                            const a = state.pop();
                            const b = state.pop();
                            state.push(a);
                            state.push(b);
                        }
                        break;

                    // TAKE
                    case 'take':
                        state.push(state.get(state.pop()));
                        break;

                    // ADD
                    case 'add':
                        performOperation(state, (bottom, top) => bottom + top);
                        break;

                    // SUBTRACT
                    case 'sub':
                        performOperation(state, (bottom, top) => bottom - top);
                        break;

                    // MULTIPLY
                    case 'mul':
                        performOperation(state, (bottom, top) => bottom * top);
                        break;

                    // DIVIDE
                    case 'div':
                        performOperation(state, (bottom, top) => bottom / top);
                        break;

                    // MODULO
                    case 'mod':
                        performOperation(state, (bottom, top) => bottom % top);
                        break;

                    // IF ZERO
                    case 'if_zero':
                        if (state.get() !== 0) {
                            tokenEnum.index++;
                        }
                        break;

                    // IF POSITIVE
                    case 'if_pos':
                        if (state.get() <= 0) {
                            tokenEnum.index++;
                        }
                        break;

                    // IF NEGATIVE
                    case 'if_neg':
                        if (state.get() >= 0) {
                            tokenEnum.index++;
                        }
                        break;

                    // EXIT
                    case 'exit':
                        tokenEnum.moveLast();
                        break;

                    // Unrecognized symbol value
                    default:
                        throw new UnexpectedTokenError(token);
                }
                break;

            // Unrecognized token type
            default:
                throw new UnexpectedTokenError(token);
        }
    }
}

class UnexpectedTokenError extends Error {
    public constructor(token: Token) {
        super(`Unexpected token { type: ${token.type}, value: ${token.value}}`);
    }
}

function performOperation(state: State, operation: (bottom: number, top: number) => number): void {
    const top = state.pop();
    const bottom = state.pop();

    const result = operation(bottom, top);
    state.push(result);
}
