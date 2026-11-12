# Example: WorkProof on studionet

WorkProof is an Intelligent Contract that grades a piece of work against
written criteria with validator consensus. It is deployed on GenLayer
studionet at:

- Address: `0xD974a24a033714a64987539EF13986f63E51d426`
- Network: studionet (`https://studio.genlayer.com/api`)
- Deployed code SHA-256: `6c42b6cd00a87664f1683196a35ecbb223ec9ebe1a40d5367a5ac5ed97a6a14f`
- Code size: 7779 chars

The commands below were run against the live node on 2026-11-12 and the
outputs are copied verbatim. If the hash below does not match what the
tool prints for you, the deployed code has changed since this example
was written.

## Inspect the deployed contract

```bash
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426
```

```text
Network:  studionet (https://studio.genlayer.com/api)
Address:  0xD974a24a033714a64987539EF13986f63E51d426
Code size: 7779 chars
Code SHA-256: 6c42b6cd00a87664f1683196a35ecbb223ec9ebe1a40d5367a5ac5ed97a6a14f
Runner header: # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

Constructor params: (none)
Methods:
  create_task(title: string, criteria: string, evidence_url: string, pass_score: int) -> int  [write]
  get_task(task_id: int) -> string  [view]
  resolve_task(task_id: int) -> null  [write]
  total_tasks() -> int  [view]
```

## Prove the deployed code is the reviewed file

The recorded copy of the deployed code lives in
`test/fixtures/workproof-code.txt`. Comparing it against the live
contract must print MATCH:

```bash
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426 --file test/fixtures/workproof-code.txt
```

The report above prints first, then:

```text
Local file: test/fixtures/workproof-code.txt
Local SHA-256 (normalized):    37c5cde97712002ba14137086277487de2d188d4d2d6fd9b64fbc4a0dfde8540
Deployed SHA-256 (normalized): 37c5cde97712002ba14137086277487de2d188d4d2d6fd9b64fbc4a0dfde8540
Comparison: MATCH, the deployed code is this file.
```

The hashes here are the normalized hashes used by `--file` (line
endings unified, trailing blank lines trimmed). They differ from the
report hash above, which is the SHA-256 of the deployed source as
returned by the node.

## Read a view method live

```bash
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426 --call total_tasks
```

The report prints first, then the live result on the last line:

```text
Call: total_tasks() => 0
```

The deployed contract holds no tasks yet, so the count is 0.
