import { decodeAscii85, encodeAscii85 } from "@std/encoding/ascii85";
import { chunk } from "@std/collections";

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

export function encode92(bytes: Uint8Array): string {
  const encodedBlockSize = 5;
  const text85 = _encode85(bytes);
  const blocks = chunk(
    text85 as unknown as any,
    encodedBlockSize,
  ) as unknown as string[];
  const pieces = new Array();
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

export function decode92(encoded: string): Uint8Array {
  return _decode85(encoded);
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
