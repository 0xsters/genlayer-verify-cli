# genlayer-verify-cli

Inspect a deployed GenLayer Intelligent Contract from the command line. The tool reads the contract code and schema back from a GenLayer node and prints what is actually deployed: code size, a SHA-256 hash of the deployed source, the runner header, the constructor parameters, and every method with its parameter types and whether it is a view or a write method.

Builders submit explorer links as proof of deployment, but an explorer page alone does not show whether the deployed code is the code that was reviewed. This tool makes that check one command, against the node itself.

## Usage

```bash
node verify.mjs --address 0xD974a24a033714a64987539EF13986f63E51d426
node verify.mjs --address 0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D --network studionet
node verify.mjs --address 0x... --rpc https://your-node.example/api
```

Options:

- `--address` (required): the deployed contract address.
- `--network`: `studionet` (default) or `bradbury`.
- `--rpc`: a custom GenLayer node API endpoint, overrides `--network`.

No dependencies. Node 18 or newer (uses the built-in fetch).

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

## Roadmap

- Compare the deployed code hash against a local contract file (`--file contracts/my_contract.py`) and fail with a clear diff summary when they differ.
- Call view methods directly (`--call total_tasks`) and print the live result.
- Recorded-fixture test suite so the output format is covered without a live node.
- Publish as an npm package with a `genlayer-verify` binary.

## License

MIT
