import type { Token } from "./token.ts";
import { ErrorWithTip, LocatableError } from "../error.ts";

/**
 * Lexer class
 */
export class Lexer {
  private pos = 0;
  private readonly input: string;

  /**
   * Creates a new lexer instance
   * @param input input to tokenize
   */
  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenizes the input and returns an array of tokens.
   * @throws {LocatableError} If an error occurs during tokenization.
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      try {
        const nextToken = this.nextToken();
        if (nextToken === null) break;
        tokens.push(nextToken);
      } catch (err) {
        const { line } = this.location();
        // Add line number to error
        if (!(err instanceof Error)) throw err;
        if (err instanceof ErrorWithTip) {
          throw new LocatableError(line, err.message, err.tip);
        }
        throw new LocatableError(line, err.message);
      }
    }
    return tokens;
  }

  /**
   * Lexes the next token or null if no more tokens
   */
  private nextToken(): Token | null {
    while (true) {
      const c = this.peek();
      if (c === null) return null;

      // Newline
      if (c === "\n") {
        this.pop();
        return { type: "newline" };
      }

      // Whitespace
      if (/\s/.test(c)) {
        this.pop();
        continue;
      }

      // Comment
      if (c === "#") {
        // Skip until newline or end of input
        while (this.peek() !== "\n" && this.peek() !== null) {
          this.pop();
        }
        continue;
      }

      // Identifier
      if (isAlpha(c)) {
        return this.readIdentifier();
      }

      // Number
      if (isDigit(c)) {
        return this.readNumber();
      }

      // Character Literal
      if (c === "'") {
        return this.readChar();
      }

      // Symbols
      switch (c) {
        case ":":
          this.pop();
          return { type: "colon" };
        case "[":
          this.pop();
          return { type: "lbracket" };
        case "]":
          this.pop();
          return { type: "rbracket" };
      }

      throw new Error(`Unexpected character: ${c}`);
    }
  }

  private readIdentifier(): Token {
    let value = "";
    while (this.peek() != null && isAlphaNumeric(this.peek()!)) {
      value += this.pop();
    }
    return { type: "identifier", value };
  }

  private readNumber(): Token {
    let value = "";
    while (this.peek() != null && isDigit(this.peek()!)) {
      value += this.pop();
    }
    return { type: "number", value: Number(value) };
  }

  private readChar(): Token {
    this.pop(); // '
    const c = this.peek();
    if (c === null || this.peek(1) !== "'") {
      throw new ErrorWithTip(
        // TODO: Check error message
        `Invalid character literal: ${c ?? "none"}`,
        `Character literals must be a single character enclosed in single quotes, e.g. 'a'`,
      );
    }
    this.pop(); // Character
    this.pop(); // Closing '
    return { type: "char", value: c.charCodeAt(0) };
  }

  /**
   * Peeks into the input with a given offset
   * @param offset
   */
  private peek(offset = 0): string | null {
    if (this.pos >= this.input.length) {
      return null;
    }
    return this.input[this.pos + offset];
  }

  /**
   * Pops the next character and advances the input by offset
   * @param offset
   */
  private pop(offset = 1): string | null {
    const c = this.peek();
    this.pos += offset;
    return c;
  }

  /**
   * Returns the current line and column number for error reporting.
   */
  private location(): { line: number; column: number } {
    const lines = this.input.slice(0, this.pos).split("\n");
    const last = lines[lines.length - 1];
    return { line: lines.length, column: last.length + 1 };
  }
}

function isAlpha(c: string) {
  return /[a-zA-Z_]/.test(c);
}

function isAlphaNumeric(c: string) {
  return /[a-zA-Z0-9_]/.test(c);
}

function isDigit(c: string) {
  return /[0-9]/.test(c);
}
