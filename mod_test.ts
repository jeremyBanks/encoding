import * as module from "./mod.ts";
import { _encode64 } from "./66.ts";
import { _encode85 } from "./92.ts";

import { assertEquals } from "@std/assert";

const utf8 = (text: string) => new TextEncoder().encode(text);

Deno.test("encode66", () => {
  for (
    const [input, expected, b64] of [
      [
        utf8("hey\nhello\nhi"),
        "~heyCmhl~lloCmhp",
        "aGV5CmhlbGxvCmhp",
      ],
      [
        utf8("hello world!\ngoodbye world!\n123456789012345678901234567890123"),
        "~helbG8g~worbGQhCmdv~odbeWUg~worbGQhCjEy.10.345678901234567890123456789012......Mw",
        "aGVsbG8gd29ybGQhCmdvb2RieWUgd29ybGQhCjEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMw",
      ],
      [
        Uint8Array.from(new Array(256).fill(0).map((_, index) => index)),
        "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4v.3.012345678OTo7PD0-P0BB.8.BCDEFGHIJKLMNOPQRSTUVWXY.....WltcXV5fYGFi.8.cdefghijklmnopqrstuvwxyz.....e3x9fn-AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq-wsbKztLW2t7i5uru8vb6_wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t_g4eLj5OXm5-jp6uvs7e7v8PHy8_T19vf4-fr7_P3-_w",
        "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0-P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn-AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq-wsbKztLW2t7i5uru8vb6_wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t_g4eLj5OXm5-jp6uvs7e7v8PHy8_T19vf4-fr7_P3-_w",
      ],
    ] as [Uint8Array, string, string][]
  ) {
    const encoded = module.encode66(input);
    assertEquals(encoded, expected, "encoded value didn't match expectation");

    assertEquals(
      _encode64(input),
      b64,
      "encoded value didn't match expectation",
    );

    const decoded = module.decode66(encoded);
    assertEquals(decoded, input, "round-tripped value didn't match input");
  }
});

Deno.test("encode92", () => {
  for (
    const [input, expected, b64] of [
      [
        utf8("hey\nhello\nhi"),
        "xK#C@~hellzWHe(",
        "xK#C@xK#0@zWHe(",
      ],
      [
        utf8("hello world!\ngoodbye world!\n123456789012345678901234567890123"),
        "|3|hello world!3tjo}||dbye wory?aW@|8|12345678901234567890123456789012.....gx",
        "xK#0@zY<mxA+]nf3tjo}wmx*}aA}:Ay?aW@f!$Kwh8WxMiwrfygC*%Eh-J/Kf!$Kwh8WxMiwrfygx",
      ],
      [
        Uint8Array.from(new Array(256).fill(0).map((_, index) => index)),
        "009c61o!#m2NH?C3>iWS5d]J*6CRx17-skh9337xar.{NbQB=+|13|()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[.........tWpVy|7|`abcdefghijklmnopqrstuvwxyz{....E0{D[FpSr8GOteoH(41EJe-<UKDCY&L:dM3N3<zjOsMmzPRn9PQ[%@^ShV!$TGwUeU^7HuW6^uKXvGh.YUh4]Z})[9-kP:p:JqPF+*1CV^9Zp<!yAd4/Xb0k*$*&A&nJXQ<MkK!>&}x#)cTlf[Bu8v].4}L}1:^-@qDS{",
        "009c61o!#m2NH?C3>iWS5d]J*6CRx17-skh9337xar.{NbQB=+c[cR@eg&FcfFLssg=mfIi5%2YjuU>)kTv.7l}6Nnnj=ADoIFnTp/ga?r8($2sxO*itWpVyu$0IOwmYv=xLzi%y&a6dAb/]tBAI+JCZjQZE0{D[FpSr8GOteoH(41EJe-<UKDCY&L:dM3N3<zjOsMmzPRn9PQ[%@^ShV!$TGwUeU^7HuW6^uKXvGh.YUh4]Z})[9-kP:p:JqPF+*1CV^9Zp<!yAd4/Xb0k*$*&A&nJXQ<MkK!>&}x#)cTlf[Bu8v].4}L}1:^-@qDS{",
      ],
    ] as [Uint8Array, string, string][]
  ) {
    const encoded = module.encode92(input);
    assertEquals(encoded, expected, "encoded value didn't match expectation");

    assertEquals(
      _encode85(input),
      b64,
      "encoded value didn't match expectation",
    );

    const decoded = module.decode92(encoded);
    assertEquals(decoded, input, "round-tripped value didn't match input");
  }
});
