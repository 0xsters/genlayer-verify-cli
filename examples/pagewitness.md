# Example: PageWitness on studionet

PageWitness answers what a public web page actually says (a deadline,
eligibility, a price) with validator consensus, and keeps the verbatim
quote as proof. It is deployed on GenLayer studionet at:

- Address: `0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D`
- Network: studionet (`https://studio.genlayer.com/api`)
- Deployed code SHA-256: `8ccc74e98879b2f1fc5b63a1ce1dadb8c02911b1b0724c843ffdfd70dfbf1f47`
- Code size: 7345 chars

The commands below were run against the live node on 2026-11-12 and the
outputs are copied verbatim. If the hash below does not match what the
tool prints for you, the deployed code has changed since this example
was written.

## Inspect the deployed contract

```bash
node verify.mjs --address 0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D
```

```text
Network:  studionet (https://studio.genlayer.com/api)
Address:  0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D
Code size: 7345 chars
Code SHA-256: 8ccc74e98879b2f1fc5b63a1ce1dadb8c02911b1b0724c843ffdfd70dfbf1f47
Runner header: # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

Constructor params: (none)
Methods:
  answer_query(query_id: int) -> null  [write]
  ask(page_url: string, question: string) -> int  [write]
  get_query(query_id: int) -> string  [view]
  total_queries() -> int  [view]
```

## Prove the deployed code is the reviewed file

The recorded copy of the deployed code lives in
`test/fixtures/pagewitness-code.txt`. Comparing it against the live
contract must print MATCH:

```bash
node verify.mjs --address 0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D --file test/fixtures/pagewitness-code.txt
```

The report above prints first, then:

```text
Local file: test/fixtures/pagewitness-code.txt
Local SHA-256 (normalized):    439e89d58862416010d4bb6500879a1dcea6e134e19d4f961eb2edfea3b5db6e
Deployed SHA-256 (normalized): 439e89d58862416010d4bb6500879a1dcea6e134e19d4f961eb2edfea3b5db6e
Comparison: MATCH, the deployed code is this file.
```

The hashes here are the normalized hashes used by `--file` (line
endings unified, trailing blank lines trimmed). They differ from the
report hash above, which is the SHA-256 of the deployed source as
returned by the node.

## Read a view method live

```bash
node verify.mjs --address 0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D --call total_queries
```

The report prints first, then the live result on the last line:

```text
Call: total_queries() => 0
```

The deployed contract holds no queries yet, so the count is 0.
