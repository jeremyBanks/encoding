// deno-lint-ignore no-unused-vars -- for linking from jsdoc
import type { encode92 } from "./92.ts";
// deno-lint-ignore no-unused-vars -- for linking from jsdoc
import type { encode66 } from "./66.ts";

/** Options modifying encoding behavior. */
export interface EncodeOptions {
  /**
   * Extra characters that should also be considered safe for this encoding.
   *
   * All characters must be in the range `"\x00"` to `"\xFF"`.
   */
  extraSafeCharacters?: string;
}

/** Options modifying decoding behavior. */
export interface DecodeOptions extends EncodeOptions {
  /**
   * Whether to require that the encoded input matches the canonical encoding
   * that would be produced by encoding with the provided encoding options,
   * throwing a {@linkcode DecodeError} if not.
   *
   * @default false
   */
  strict?: boolean;
}

/** Thrown if invalid options are provided. */
export class OptionsError extends Error {}

/** Thrown if invalid data is encountered during decoding. */
export class DecodeError extends Error {}

/**
 * Validates that the provided {@linkcode EncodeOptions} are valid.
 *
 * @throws {OptionsError} Thrown if invalid options are provided
 */
export function validateEncodeOptions(options?: EncodeOptions) {
  if (options?.extraSafeCharacters) {
    for (const character of options.extraSafeCharacters) {
      if (character >= "\xFF") {
        throw new OptionsError(
          `options.extraSafeCharacters contained an out-of-range character`,
        );
      }
    }
  }
}

/**
 * Sets of characters that are safe to use as-is in different contexts. Some of
 * these may be useful values for {@linkcode EncodeOptions.extraSafeCharacters}.
 */
export const SAFE_CHARACTERS = {
  /**
   * The set of URL-safe characters defined by the current
   * [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986).
   * This is the default and minimum set of safe characters used by
   * {@linkcode encode66}.
   */
  RFC_3986_URL:
    "~.-_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",

  /**
   * The broader set of URL-safe characters previously defined by the
   * now-obsolete [RFC 2396](https://datatracker.ietf.org/doc/html/rfc2396).
   * This is the set of characters that are preserved by the standard
   * `encodeURIComponent` function.
   */
  RFC_2396_URL:
    "!()'~.-_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",

  /**
   * Characters that are safe for use in of any of JavaScript's string literal
   * syntaxes. This is the default and minimum set of safe characters used by
   * {@linkcode encode92}.
   */
  STRING:
    ".-:+=^!/*?&<>()[]{}@%$#,;~|_` 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",

  /**
   * Characters that are safe for use in JavaScript's double-quote-delimited
   * string literal syntax.
   */
  DOUBLE_QUOTE_STRING:
    "'`$.-:+=^!/*?&<>()[]{}@%$#,;~|_` 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",

  /**
   * Characters that are safe for use in JavaScript's single-quote-delimited
   * string literal syntax.
   */
  SINGLE_QUOTE_STRING:
    '"`$.-:+=^!/*?&<>()[]{}@%$#,;~|_` 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',

  /**
   * Characters that are safe for use in JavaScript's backtick-delimited
   * "template" string literal syntax.
   */
  BACKTICK_STRING:
    "'\".-:+=^!/*?&<>()[]{}@%$#,;~|_` 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",

  /** All "printable" ASCII characters. */
  ASCII_PRINTABLE:
    " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",

  /** All ASCII characters (`"\x00"` to `"\x7F"`). */
  ASCII:
    "\x00\x01\x02\x03\x04\x05\x06\x07\b\t\n\v\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F",

  /**
   * All allowed characters (those whose code points map to a one-byte value,
   * i.e. `"\x00"` to `"\xFF"`). */
  ALL:
    "\x00\x01\x02\x03\x04\x05\x06\x07\b\t\n\v\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
};

export function chunk(input: string, size: number): string[] {
  const ret: Array<string> = Array.from({
    length: Math.ceil(input.length / size),
  });
  let readIndex = 0;
  let writeIndex = 0;

  while (readIndex < input.length) {
    ret[writeIndex] = input.slice(readIndex, readIndex + size);

    writeIndex += 1;
    readIndex += size;
  }

  return ret;
}
