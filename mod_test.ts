import * as module from "./mod.ts";

import { assertEquals } from "@std/assert";

const utf8 = (text: string) => new TextEncoder().encode(text);

Deno.test("encode66", (t) => {
  for (
    const [input, expected, b64] of [
      [
        utf8("hey\nhello\nhi"),
        "~heyCmhl~lloCmhp",
        "",
      ],
      [
        utf8("hello world!\ngoodbye world!\n123456789012345678901234567890123"),
        "~helbG8g~worbGQhCmdv~odbeWUg~worbGQhCjEy.10.345678901234567890123456789012......Mw",
        "",
      ],
      [
        Uint8Array.from(new Array(256).fill(0).map((_, index) => index)),
        "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4v.3.012345678OTo7PD0-P0BB.8.BCDEFGHIJKLMNOPQRSTUVWXY.....WltcXV5fYGFi.8.cdefghijklmnopqrstuvwxyz.....e3x9fn-AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq-wsbKztLW2t7i5uru8vb6_wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t_g4eLj5OXm5-jp6uvs7e7v8PHy8_T19vf4-fr7_P3-_w",
        "",
      ],
    ] as [Uint8Array, string][]
  ) {
    const encoded = module.encode66(input);
    assertEquals(encoded, expected, "encoded value didn't match expectation");

    assertEquals(
      module._encode64(input),
      b64,
      "encoded value didn't match expectation",
    );

    // const decoded = module.decode66(encoded);
    // assertEquals(decoded, input, "round-tripped value didn't match input");
  }
});

Deno.test("encode92", (t) => {
  for (
    const [input, expected] of [
      [
        utf8("hey\nhello\nhi"),
        "xK#C@~hellzWHe(",
      ],
      [
        utf8("hello world!\ngoodbye world!\n123456789012345678901234567890123"),
        "|3|hello world!3tjo}||dbye wory?aW@|8|12345678901234567890123456789012.....gx",
      ],
      [
        Uint8Array.from(new Array(256).fill(0).map((_, index) => index)),
        "009c61o!#m2NH?C3>iWS5d]J*6CRx17-skh9337xar.{NbQB=+|4|()*+,-./01234567|i5%2Y|8|<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[.....tWpVy|7|`abcdefghijklmnopqrstuvwxyz{....E0{D[FpSr8GOteoH(41EJe-<UKDCY&L:dM3N3<zjOsMmzPRn9PQ[%@^ShV!$TGwUeU^7HuW6^uKXvGh.YUh4]Z})[9-kP:p:JqPF+*1CV^9Zp<!yAd4/Xb0k*$*&A&nJXQ<MkK!>&}x#)cTlf[Bu8v].4}L}1:^-@qDS{",
      ],
    ] as [Uint8Array, string][]
  ) {
    const encoded = module.encode92(input);
    assertEquals(encoded, expected, "encoded value didn't match expectation");

    // const decoded = module.decode92(encoded);
    // assertEquals(decoded, input, "round-tripped value didn't match input");
  }
});
