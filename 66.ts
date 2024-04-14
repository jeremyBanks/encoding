import { decodeBase64Url, encodeBase64Url } from "@std/encoding/base64url";
import { chunk } from "./_common.ts";

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
 */
export function encode66(bytes: Uint8Array): string {
  const text64 = _encode64(bytes);
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
    const b = String.fromCodePoint(..._decode64(block));
    const isClean = [...b].every((c) => DIGITS_66.includes(c));
    if (isClean && block.length === encodedBlockSize) {
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
 */
export function decode66(encoded: string): Uint8Array {
  const blocks = chunk(encoded, encodedBlockSize);

  const pieces: string[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]!;

    if (block.length < encodedBlockSize) {
      pieces.push(block);
    } else if (block.startsWith("~")) {
      pieces.push(_encode64(new TextEncoder().encode(block.slice(1))));
    } else if (block.startsWith(".")) {
      if (block[1] === ".") {
        i += 1;
        const twoBlocks = block + blocks[i];
        pieces.push(_encode64(new TextEncoder().encode(twoBlocks.slice(2))));
      } else {
        const [prefix, prefixDigits] = block.match(/^\.([1-9][0-9]*)\./)!;
        const blocksCount = Number(prefixDigits);
        const allBlocks = blocks.slice(i, i + blocksCount).join("");
        const dataLength = decodedBlockSize * blocksCount;
        const rawData = allBlocks.slice(
          prefix.length,
          prefix.length + dataLength,
        );
        pieces.push(_encode64(new TextEncoder().encode(rawData)));
        i += blocksCount - 1;
      }
    } else {
      pieces.push(block);
    }
  }

  return _decode64(pieces.join(""));
}

export function _encode64(bytes: Uint8Array): string {
  return encodeBase64Url(bytes);
}

export function _decode64(encoded: string): Uint8Array {
  return decodeBase64Url(encoded);
}
