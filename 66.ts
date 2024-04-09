import { decodeBase64Url, encodeBase64Url } from "@std/encoding/base64url";
import { chunk } from "@std/collections";

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

export function encode66(bytes: Uint8Array): string {
  const encodedBlockSize = 4;
  const text64 = _encode64(bytes);
  const blocks = chunk(
    text64 as unknown as any,
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

export function decode66(encoded: string): Uint8Array {
  return _decode64(encoded);
}

export function _encode64(bytes: Uint8Array): string {
  return encodeBase64Url(bytes);
}

export function _decode64(encoded: string): Uint8Array {
  return decodeBase64Url(encoded);
}
