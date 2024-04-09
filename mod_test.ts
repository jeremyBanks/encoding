import * as module from "./mod.ts";

import { assertEquals } from "@std/assert";

const utf8 = (text: string) => new TextEncoder().encode(text);

Deno.test("encode66", (t) => {
  const input = utf8(
    "hello world!\ngoodbye world!\n123456789012345678901234567890123",
  );
  const expected =
    "~helbG8g~worbGQhCmdv~odbeWUg~worbGQhCjEy.10.345678901234567890123456789012......Mw";

  const encoded = module.encode66(input);
  assertEquals(expected, encoded, "encoded value didn't match expectation");

  const decoded = module.decode66(encoded);
  assertEquals(input, decoded, "round-tripped value didn't match input");
});

Deno.test("encode92", (t) => {
  const input = utf8(
    "hello world!\ngoodbye world!\n123456789012345678901234567890123",
  );
  const expected =
    "|3|hello world!3tjo}||dbye wory?aW@|8|12345678901234567890123456789012|----gx";

  const encoded = module.encode92(input);
  assertEquals(encoded, expected, "encoded value didn't match expectation");

  const decoded = module.decode92(encoded);
  assertEquals(decoded, input, "round-tripped value didn't match input");
});
