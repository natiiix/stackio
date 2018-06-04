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

        // Get start time
        const startTime = Date.now();

        // Program execution loop
        do {
            // The maximum allowed program execution time is 1 second
            if (Date.now() - startTime > 1000) {
                throw Error('1 second elapsed, check for an infinite loop');
            }

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

                    // MARK <Mark ID>
                    case 'mark':
                        {
                            if (!tokenEnum.moveNext()) {
                                throw new UnexpectedTokenError(token);
                            }

                            const markId = tokenEnum.current.value;
                            state.marks[markId] = tokenEnum.index;
                        }
                        break;

                    // JUMP <Mark ID>
                    case 'jump':
                        {
                            if (!tokenEnum.moveNext()) {
                                throw new UnexpectedTokenError(token);
                            }

                            const markId = tokenEnum.current.value;
                            tokenEnum.index = state.marks[markId];
                        }
                        break;

                    // IF ZERO
                    case 'if_zero':
                        if (state.get() !== 0) {
                            skipNextInstruction(tokenEnum);
                        }
                        break;

                    // IF POSITIVE
                    case 'if_pos':
                        if (state.get() <= 0) {
                            skipNextInstruction(tokenEnum);
                        }
                        break;

                    // IF NEGATIVE
                    case 'if_neg':
                        if (state.get() >= 0) {
                            skipNextInstruction(tokenEnum);
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

function skipNextInstruction(tokenEnum: BetterEnumerator<Token>): void {
    if (!tokenEnum.moveNext()) {
        throw new UnexpectedTokenError(tokenEnum.current);
    }

    if (tokenEnum.current.type === 'symbol' &&
        ['mark', 'jump'].indexOf(tokenEnum.current.value.toLowerCase()) >= 0 &&
        !tokenEnum.moveNext()) {
        throw new UnexpectedTokenError(tokenEnum.current);
    }
}
