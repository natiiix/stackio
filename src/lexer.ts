import { BetterEnumerator } from './BetterEnumerator';

export class Token {
    public type: string;
    public value: string;

    public constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
    }
}

const REGEX_IGNORE = /^\s$/;

const REGEX_SYMBOL_FIRST = /^[a-zA-Z_]$/;
const REGEX_SYMBOL_NEXT = /^\w$/;

const REGEX_NUMBER_FIRST = /^[\d\.\-]$/;
const REGEX_NUMBER_NEXT = /^[\d\.]$/;

const REGEX_COMMENT_FIRST = /^#$/;
const REGEX_COMMENT_NEXT = /^[^\n]$/;

const REGEX_LABEL_DEFINITION_FIRST = /^:$/;
const REGEX_LABEL_JUMP_FIRST = /^@$/;
const REGEX_LABEL_NAME = /^\w$/;

export function lex(code: string): Token[] {
    const tokens: Token[] = [];
    const codeEnum = new BetterEnumerator(Array.from(code));

    while (true) {
        const c = codeEnum.current;

        // Ignored character
        if (REGEX_IGNORE.test(c)) { }
        // Line comment
        else if (REGEX_COMMENT_FIRST.test(c)) {
            readToEnd(codeEnum, REGEX_COMMENT_NEXT);
        }
        // Symbol
        else if (REGEX_SYMBOL_FIRST.test(c)) {
            tokens.push(new Token('symbol', readToEnd(codeEnum, REGEX_SYMBOL_NEXT)));
        }
        // Number
        else if (REGEX_NUMBER_FIRST.test(c)) {
            tokens.push(new Token('number', readToEnd(codeEnum, REGEX_NUMBER_NEXT)));
        }
        // Label definition
        else if (REGEX_LABEL_DEFINITION_FIRST.test(c)) {
            tokens.push(new Token('label', readToEnd(codeEnum, REGEX_LABEL_NAME).substr(1)));
        }
        // Jump instruction
        else if (REGEX_LABEL_JUMP_FIRST.test(c)) {
            tokens.push(new Token('jump', readToEnd(codeEnum, REGEX_LABEL_NAME).substr(1)));
        }
        // String literal
        else if (c === '"') {
            tokens.push(new Token('string', readStringLiteral(codeEnum)));
        }
        // Invalid syntax
        else {
            throw Error('Unexpected syntax: ' + c);
        }

        // Move on to the next character
        if (!codeEnum.moveNext()) {
            break;
        }
    }

    return tokens;
}

function readToEnd(codeEnum: BetterEnumerator<string>, regex: RegExp): string {
    let value = codeEnum.current;

    while (regex.test(codeEnum.next) && codeEnum.moveNext()) {
        value += codeEnum.current;
    }

    return value;
}

function readStringLiteral(codeEnum: BetterEnumerator<string>): string {
    let str = '';
    let escaped = false;

    while (codeEnum.moveNext()) {
        const c = codeEnum.current;

        if (escaped) {
            if (c === 'n') {
                str += '\n';
            }
            else if (c === '\\' || c === '"') {
                str += c;
            }
            else {
                throw Error('Unexpected escaped symbol: ' + c);
            }

            escaped = false;
        }
        else {
            if (c === '\\') {
                escaped = true;
            }
            else if (c === '"') {
                break;
            }
            else {
                str += c;
            }
        }
    }

    return str;
}
