import { decodeAscii85, encodeAscii85 } from "@std/encoding/ascii85";
import { chunk } from "./_common.ts";

const DIGITS_85 = "\
0123456789\
abcdefghij\
klmnopqrst\
uvwxyzABCD\
EFGHIJKLMN\
OPQRSTUVWX\
YZ.-:+=^!/\
*?&<>()[]{\
}@%$#\
";

const DIGITS_92 = DIGITS_85 + ",.~|_` ";

const encodedBlockSize = 5;
const decodedBlockSize = 4;

/**
 * Encodes bytes as a string using an extended variation of Z85 encoding.
 */
export function encode92(bytes: Uint8Array): string {
  const text85 = _encode85(bytes);
  const blocks = chunk(text85, encodedBlockSize);
  const pieces = [];
  let cleanBlockCount = 0;
  let cleanDataBuffer = "";
  const flushClean = () => {
    if (cleanBlockCount === 0) {
      return;
    } else if (cleanBlockCount === 1) {
      pieces.push(`~${cleanDataBuffer}`);
    } else if (cleanBlockCount === 2) {
      pieces.push(`||${cleanDataBuffer}`);
    } else if (cleanBlockCount === 3) {
      pieces.push(`|3|${cleanDataBuffer}`);
    } else if (cleanBlockCount === 4) {
      pieces.push(`|4|${cleanDataBuffer}|`);
    } else if (cleanBlockCount <= 999) {
      pieces.push(
        `|${cleanBlockCount.toString(10)}|${cleanDataBuffer}`.padEnd(
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
    const b = String.fromCodePoint(..._decode85(block));
    const isClean = [...b].every((c) => DIGITS_92.includes(c));
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
 * Decodes bytes from a string using an extended variation of Z85 encoding.
 */
export function decode92(encoded: string): Uint8Array {
  const blocks = chunk(encoded, encodedBlockSize);

  const pieces: string[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]!;

    if (block.length < encodedBlockSize) {
      pieces.push(block);
    } else if (block.startsWith("~")) {
      pieces.push(_encode85(new TextEncoder().encode(block.slice(1))));
    } else if (block.startsWith("|")) {
      if (block[1] === "|") {
        i += 1;
        const twoBlocks = block + blocks[i];
        pieces.push(_encode85(new TextEncoder().encode(twoBlocks.slice(2))));
      } else {
        const [prefix, prefixDigits] = block.match(/^\|([1-9][0-9]*)\|/)!;
        const blocksCount = Number(prefixDigits);
        const allBlocks = blocks.slice(i, i + blocksCount).join("");
        const dataLength = decodedBlockSize * blocksCount;
        const rawData = allBlocks.slice(
          prefix.length,
          prefix.length + dataLength,
        );
        pieces.push(_encode85(new TextEncoder().encode(rawData)));
        i += blocksCount - 1;
      }
    } else {
      pieces.push(block);
    }
  }

  return _decode85(pieces.join(""));
}

export function _encode85(bytes: Uint8Array): string {
  return encodeAscii85(bytes, {
    standard: "Z85",
  });
}

export function _decode85(encoded: string): Uint8Array {
  return decodeAscii85(encoded, {
    standard: "Z85",
  });
}
