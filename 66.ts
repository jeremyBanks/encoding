import { decodeBase64Url, encodeBase64Url } from "@std/encoding/base64url";
import {
  chunk,
  DecodeError,
  type DecodeOptions,
  type EncodeOptions,
  // deno-lint-ignore no-unused-vars
  type OptionsError,
  validateEncodeOptions,
} from "./_common.ts";

const DIGITS_64 = "\
0123456789\
abcdefghij\
klmnopqrst\
uvwxyzABCD\
EFGHIJKLMN\
OPQRSTUVWX\
YZ-_\
";

const DIGITS_66 = DIGITS_64 + "~.";

const encodedBlockSize = 4;
const decodedBlockSize = 3;

/**
 * Encodes bytes as a string using an extended variation of base64url encoding.
 *
 * @throws {OptionsError} Thrown if invalid options are provided
 */
export function encode66(bytes: Uint8Array, options?: EncodeOptions): string {
  validateEncodeOptions(options);

  const text64 = encode64(bytes);
  const blocks = chunk(text64, encodedBlockSize);
  const pieces = [];
  let cleanBlockCount = 0;
  let cleanDataBuffer = "";
  const flushClean = () => {
    if (cleanBlockCount === 0) {
      return;
    } else if (cleanBlockCount === 1) {
      pieces.push(`~${cleanDataBuffer}`);
    } else if (cleanBlockCount === 2) {
      pieces.push(`..${cleanDataBuffer}`);
    } else if (cleanBlockCount === 3) {
      pieces.push(`.3.${cleanDataBuffer}`);
    } else if (cleanBlockCount === 4) {
      pieces.push(`.4.${cleanDataBuffer}.`);
    } else if (cleanBlockCount <= 99) {
      pieces.push(
        `.${cleanBlockCount.toString(10)}.${cleanDataBuffer}.`.padEnd(
          cleanBlockCount * encodedBlockSize,
          ".",
        ),
      );
    } else {
      throw new Error("not implemented");
    }
    cleanBlockCount = 0;
    cleanDataBuffer = "";
  };
  cleanBlockCount = 0;
  cleanDataBuffer = "";
  for (const block of blocks) {
    const b = String.fromCodePoint(...decode64(block));
    const isSafe = [...b].every((c) =>
      DIGITS_66.includes(c) || options?.extraSafeCharacters?.includes(c)
    );
    if (isSafe && block.length === encodedBlockSize) {
      cleanBlockCount += 1;
      cleanDataBuffer += b;
    } else {
      flushClean();
      pieces.push(block);
    }
  }
  flushClean();

  return pieces.join("");
}

/**
 * Decodes bytes from a string using an extended variation of base64url encoding.
 *
 * @throws {OptionsError} Thrown if invalid options are provided
 * @throws {DecodeError} Thrown if invalid data is encountered during decoding.
 */
export function decode66(
  encoded: string,
  options?: DecodeOptions,
): Uint8Array {
  validateEncodeOptions(options);

  const blocks = chunk(encoded, encodedBlockSize);

  const pieces: string[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]!;

    if (block.length < encodedBlockSize) {
      pieces.push(block);
    } else if (block.startsWith("~")) {
      pieces.push(encode64(new TextEncoder().encode(block.slice(1))));
    } else if (block.startsWith(".")) {
      if (block[1] === ".") {
        i += 1;
        const twoBlocks = block + blocks[i];
        pieces.push(encode64(new TextEncoder().encode(twoBlocks.slice(2))));
      } else {
        const [prefix, prefixDigits] = block.match(/^\.([1-9][0-9]*)\./)!;
        const blocksCount = Number(prefixDigits);
        const allBlocks = blocks.slice(i, i + blocksCount).join("");
        const dataLength = decodedBlockSize * blocksCount;
        const rawData = allBlocks.slice(
          prefix.length,
          prefix.length + dataLength,
        );
        pieces.push(encode64(new TextEncoder().encode(rawData)));
        i += blocksCount - 1;
      }
    } else {
      pieces.push(block);
    }
  }

  const decoded = decode64(pieces.join(""));

  if (options?.strict) {
    const reencoded = encode66(decoded, options);
    if (reencoded !== encoded) {
      throw new DecodeError(
        "encoded data had non-canonical representation",
      );
    }
  }

  return decoded;
}

function encode64(bytes: Uint8Array): string {
  return encodeBase64Url(bytes);
}

function decode64(encoded: string): Uint8Array {
  return decodeBase64Url(encoded);
}
