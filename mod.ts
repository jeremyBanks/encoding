/**
This module provides functions to encode and decode binary data as text using
variants of the [base64url][IETF RFC 4648 S5] and [Z85][ZMQ RFC 32] encodings
which attempt to preserve as much of the original data as ASCII as possible
without negatively affecting intended use cases or affecting the size or
alignment of surrounding data.

These use the encodings as usual for most data, but if one or more contiguous
full blocks (3 bytes for base64url, 4 bytes for Z85) of data can be represented
using ASCII characters that are safe for the intended context, they're instead
encoded/preserved as ASCII text, with a prefix indicating the length of the
preserved content (in blocks) and with padding added to the end to maintain the
alignment of subsequent blocks.

### encode66

### encode85

extended base64url encoding for use in URLs

For use in URLs, base64url is used for encoding, the length prefixes is `~` for
a single block, `..` for two blocks, and `.N.` for 3 to 999 blocks, where `N` is
the number of blocks as a decimal number. Where neccessary (4 or more contiguous
safe blocks), the blocks are padded with trailing `~` characters to maintain the
original length.

The characters `~` and `.` are chosen because those are the only two characters
that are [unreserved in URIs by RFC3986][IETF RFC 3986 S2.3] which aren't
already used by base64url.

Safe ASCII characters in URLs are limited to those that are allowed by RFC3986:
"uppercase and lowercase letters, decimal digits, hyphen, period, underscore,
and tilde."


#### example

##### binary bytes

```
68 65 6c 6c 6f 20 77 6f 72 6c 64 21 0a   "hello world!\n"
```

##### encoded text

```
~helbG8g..world!Cg
```

### extended Z85 encoding for use in string literals

For use in string literals, Z85 is used for encoding, the length prefix is `~`
for a single block, `||` for two blocks, and `|N|` for 3 to 9999 blocks, where
`N` is the number of blocks as a decimal number.  Where neccessary (4 or more
contiguous safe blocks), the blocks are padded with trailing `~` characters to
maintain the original length.

The characters `~` and `|` are chosen arbitrarily from the handful of safe
characters that are not already used by Z85.

Safe characters in a string depend on the type of type of delimiter. If delmited
by single quotes, the single quote character is unsafe. If delimited by double
quotes, the double quote character is unsafe. If delimited by backticks, the
backtick character and the dollar sign character are unsafe. If unknown, all
four of these characters must be considered unsafe. Aside from that it includes
all "printable" ASCII characters except for the backslash, and also includes the
space character.

Another deviation from the Z85 specification is that the data doesn't need to be
a multiple of 4 bytes in length.

[ZMQ RFC 32]: https://rfc.zeromq.org/spec/32/
[IETF RFC 4648 S5]: https://datatracker.ietf.org/doc/html/rfc4648#section-5
[IETF RFC 3986 S2.3]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.3

@module */

import { chunk } from "@std/collections/chunk";

export * from "./66.ts";
export * from "./92.ts";
