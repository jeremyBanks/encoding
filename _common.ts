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
  strict: false;
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
