# Changelog

All notable changes to genlayer-verify-cli are recorded here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-11-12

The first usable version: inspect a deployed GenLayer Intelligent Contract
from the command line and prove the deployed code is the reviewed code.

### Added

- Inspect a deployed contract (`node verify.mjs --address 0x...`): reads
  the code and schema back from a GenLayer node and prints the network,
  address, code size, SHA-256 hash of the deployed source, runner header,
  constructor parameters, and every method with its parameter types and
  whether it is a view or a write method. Defaults to studionet; `--network
  bradbury` or `--rpc <endpoint>` select another node.
- Compare a local contract file against the deployed code (`--file`):
  both sides are normalized (line endings unified, trailing blank lines
  trimmed) and hashed with SHA-256. Prints MATCH or MISMATCH and exits
  with code 1 on a mismatch, so it can gate a release script.
- Call a view method on the deployed contract (`--call <method>`,
  `--args '[...]'`): a read-only `gen_call` through genlayer-js, no wallet,
  no transaction, no state change. Only methods the schema marks `[view]`
  may be called; write methods are refused before anything is sent.
- Recorded-fixture test suite (`npm test`, `node:test`, fully offline):
  checks the report format, the file-comparison helpers, the `--call`
  argument parsing, method validation and result formatting, and the
  recorded `gen_getContractSchema` / `gen_getContractCode` responses of
  the two deployed Studionet contracts (WorkProof and PageWitness) stored
  in `test/fixtures/`.
- Worked examples in `examples/`: WorkProof and PageWitness on studionet,
  each with its deployed code hash, verified live against the node.
