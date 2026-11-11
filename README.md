# genlayer-verify-cli

Inspect a deployed GenLayer Intelligent Contract from the command line. The tool reads the contract code and schema back from a GenLayer node and prints what is actually deployed: code size, a SHA-256 hash of the deployed source, the runner header, the constructor parameters, and every method with its parameter types and whether it is a view or a write method.

Builders submit explorer links as proof of deployment, but an explorer page alone does not show whether the deployed code is the code that was reviewed. This tool makes that check one command, against the node itself.

## Usage

```bash
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426
node verify.mjs --address 0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D --network studionet
node verify.mjs --address 0x... --rpc https://your-node.example/api
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426 --file contracts/work_proof_verifier.py
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426 --call total_tasks
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426 --call get_task --args '[0]'
```

Options:

- `--address` (required): the deployed contract address.
- `--network`: `studionet` (default) or `bradbury`.
- `--rpc`: a custom GenLayer node API endpoint, overrides `--network`.
- `--file`: a local contract file to compare against the deployed code. Both sides are normalized (line endings unified, trailing blank lines trimmed) and hashed with SHA-256; the tool prints MATCH or MISMATCH and exits with code 1 on a mismatch, so it can gate a release script.
- `--call`: run one view method on the deployed contract and print its live result. The call goes through genlayer-js as a read-only `gen_call`: no wallet, no transaction, no state change. Only methods the schema marks `[view]` may be called; a write method is refused before anything is sent. Exits with code 1 when the node rejects the call (for example, reading a task id that does not exist).
- `--args`: a JSON array of arguments for `--call`, for example `--args '[0]'`. The count must match the method's parameters.

Depends on genlayer-js (the same version the WorkProof app uses) for
`--call`; run `npm install` first. Node 18 or newer.

## Example output

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

## Calling a view method

```bash
$ node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426 --call total_tasks
```

The report above prints first, then the live result on the last line:

```text
Call: total_tasks() => 0
```

The deployed WorkProof contract holds no tasks yet, so the count is 0.
Reading a task that does not exist fails cleanly instead of printing a
result:

```bash
$ node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426 --call get_task --args '[0]'
Error: call failed: Missing or invalid parameters.
Double check you have provided the correct parameters.
```

## Testing

```bash
npm test
```

The suite uses `node:test` and runs fully offline. It checks the report
format, the file-comparison helpers, the `--call` argument parsing,
method validation and result formatting, and the recorded responses of the two
deployed Studionet contracts (WorkProof
`0xD974a24a033714a64987539EF13986f63E51d426` and PageWitness
`0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D`) stored in
`test/fixtures/`: their `gen_getContractSchema` and
`gen_getContractCode` responses as read from the node on 2026-11-11. To
re-record after a redeploy, read both methods back from the node, replace
the fixture files, and update the expected hashes in
`test/verify.test.mjs`.

## Roadmap

- Publish as an npm package with a `genlayer-verify` binary.

## License

MIT
