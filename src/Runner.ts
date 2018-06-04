import { State } from './State';
import { lex, Token } from './lexer';
import { BetterEnumerator } from './BetterEnumerator';

export class Runner {
    private readonly tokens: Token[];
    private readonly print: (message: string) => void;

    public constructor(code: string, printCallback: (message: string) => void) {
        this.tokens = lex(code);
        this.print = printCallback;
    }

    public run(): void {
        // Create a new state with an empty stack
        const state = new State();

        // Create an enumerator for the tokens
        const tokenEnum = new BetterEnumerator(this.tokens);

        // Program execution loop
        do {
            this.executeInstruction(state, tokenEnum);
        } while (tokenEnum.moveNext());
    }

    private executeInstruction(state: State, tokenEnum: BetterEnumerator<Token>): void {
        // Get the current token
        const token = tokenEnum.current;

        switch (token.type) {
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
                        state.push(state.get(state.get()));
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
