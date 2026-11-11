// Recorded-fixture tests for genlayer-verify-cli.
//
// Fixtures were recorded 2026-11-11 from the Studionet node
// (https://studio.genlayer.com/api) for the two deployed contracts:
// WorkProof 0xD974a24a033714a64987539EF13986f63E51d426 and
// PageWitness 0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D.
// Everything here runs offline with node:test; no live node is needed.
// To re-record after a redeploy, read gen_getContractSchema and
// gen_getContractCode back from the node and replace the fixture files,
// then update the expected hashes below.
//
// The deployed code uses CRLF line endings, so the expected hashes are
// SHA-256 of the normalized code (see normalize in lib.mjs), the same
// value the --file comparison uses. For reference, the raw deployed
// hashes are 6c42b6cd00a87664f1683196a35ecbb223ec9ebe1a40d5367a5ac5ed97a6a14f
// (WorkProof) and 8ccc74e98879b2f1fc5b63a1ce1dadb8c02911b1b0724c843ffdfd70dfbf1f47
// (PageWitness).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { compareCode, formatReport, normalize, sha256 } from '../lib.mjs';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

async function loadFixture(name) {
  const schema = JSON.parse(await readFile(join(fixturesDir, name + '-schema.json'), 'utf8'));
  const code = await readFile(join(fixturesDir, name + '-code.txt'), 'utf8');
  return { schema, code };
}

const STUDIONET = 'https://studio.genlayer.com/api';
const RUNNER_HEADER = '# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }';

const WORKPROOF = {
  address: '0xD974a24a033714a64987539EF13986f63E51d426',
  codeHash: '37c5cde97712002ba14137086277487de2d188d4d2d6fd9b64fbc4a0dfde8540',
};

const PAGEWITNESS = {
  address: '0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D',
  codeHash: '439e89d58862416010d4bb6500879a1dcea6e134e19d4f961eb2edfea3b5db6e',
};

test('WorkProof schema fixture: methods, params and view flags', async () => {
  const { schema } = await loadFixture('workproof');
  assert.deepEqual(schema.ctor.params, []);
  assert.deepEqual(Object.keys(schema.methods).sort(), ['create_task', 'get_task', 'resolve_task', 'total_tasks']);
  assert.deepEqual(schema.methods.create_task.params, [['title', 'string'], ['criteria', 'string'], ['evidence_url', 'string'], ['pass_score', 'int']]);
  assert.equal(schema.methods.create_task.ret, 'int');
  assert.equal(schema.methods.create_task.readonly, false);
  assert.deepEqual(schema.methods.get_task.params, [['task_id', 'int']]);
  assert.equal(schema.methods.get_task.ret, 'string');
  assert.equal(schema.methods.get_task.readonly, true);
  assert.equal(schema.methods.resolve_task.readonly, false);
  assert.equal(schema.methods.resolve_task.ret, 'null');
  assert.deepEqual(schema.methods.total_tasks.params, []);
  assert.equal(schema.methods.total_tasks.ret, 'int');
  assert.equal(schema.methods.total_tasks.readonly, true);
});

test('PageWitness schema fixture: methods, params and view flags', async () => {
  const { schema } = await loadFixture('pagewitness');
  assert.deepEqual(schema.ctor.params, []);
  assert.deepEqual(Object.keys(schema.methods).sort(), ['answer_query', 'ask', 'get_query', 'total_queries']);
  assert.deepEqual(schema.methods.ask.params, [['page_url', 'string'], ['question', 'string']]);
  assert.equal(schema.methods.ask.ret, 'int');
  assert.equal(schema.methods.ask.readonly, false);
  assert.deepEqual(schema.methods.answer_query.params, [['query_id', 'int']]);
  assert.equal(schema.methods.answer_query.ret, 'null');
  assert.equal(schema.methods.answer_query.readonly, false);
  assert.equal(schema.methods.get_query.ret, 'string');
  assert.equal(schema.methods.get_query.readonly, true);
  assert.equal(schema.methods.total_queries.ret, 'int');
  assert.equal(schema.methods.total_queries.readonly, true);
});

test('WorkProof code fixture: runner header, class and normalized hash', async () => {
  const { code } = await loadFixture('workproof');
  assert.equal(code.split('\n')[0].trim(), RUNNER_HEADER);
  assert.match(code, /class WorkProofVerifier\(gl\.Contract\)/);
  assert.equal(sha256(normalize(code)), WORKPROOF.codeHash);
});

test('PageWitness code fixture: runner header, class and normalized hash', async () => {
  const { code } = await loadFixture('pagewitness');
  assert.equal(code.split('\n')[0].trim(), RUNNER_HEADER);
  assert.match(code, /class PageWitness\(gl\.Contract\)/);
  assert.equal(sha256(normalize(code)), PAGEWITNESS.codeHash);
});

test('formatReport renders the recorded WorkProof deployment', async () => {
  const { schema, code } = await loadFixture('workproof');
  const report = formatReport({ network: 'studionet', endpoint: STUDIONET, address: WORKPROOF.address, schema, code });
  assert.match(report, /Network:  studionet \(https:\/\/studio\.genlayer\.com\/api\)/);
  assert.match(report, /Address:  0xD974a24a033714a64987539EF13986f63E51d426/);
  assert.match(report, /Code size: \d+ chars/);
  assert.match(report, /Runner header: # \{ "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" \}/);
  assert.match(report, /Constructor params: \(none\)/);
  assert.match(report, /  create_task\(title: string, criteria: string, evidence_url: string, pass_score: int\) -> int  \[write\]/);
  assert.match(report, /  get_task\(task_id: int\) -> string  \[view\]/);
  assert.match(report, /  resolve_task\(task_id: int\) -> null  \[write\]/);
  assert.match(report, /  total_tasks\(\) -> int  \[view\]/);
});

test('formatReport renders the recorded PageWitness deployment', async () => {
  const { schema, code } = await loadFixture('pagewitness');
  const report = formatReport({ network: 'studionet', endpoint: STUDIONET, address: PAGEWITNESS.address, schema, code });
  assert.match(report, /Address:  0xBBE090C5c5cCd8a93A899867DE41a5c13a8f628D/);
  assert.match(report, /  ask\(page_url: string, question: string\) -> int  \[write\]/);
  assert.match(report, /  answer_query\(query_id: int\) -> null  \[write\]/);
  assert.match(report, /  get_query\(query_id: int\) -> string  \[view\]/);
  assert.match(report, /  total_queries\(\) -> int  \[view\]/);
});

test('normalize unifies line endings and trailing blank lines before hashing', () => {
  assert.equal(normalize('line1\r\nline2\r\n\r\n'), normalize('line1\nline2\n'));
  assert.equal(sha256(normalize('line1\r\nline2\r\n')), sha256(normalize('line1\nline2\n')));
  assert.equal(normalize('x'), 'x\n');
});

test('compareCode matches the recorded code and rejects a changed copy', async () => {
  const { code } = await loadFixture('workproof');
  assert.equal(compareCode(code, code).match, true);
  assert.equal(compareCode(code, code + '\n# changed\n').match, false);
  assert.equal(compareCode(code.replace('WorkProofVerifier', 'SomethingElse'), code).match, false);
  // Same content with different line endings still matches.
  assert.equal(compareCode(code.replace(/\r\n/g, '\n'), code).match, true);
});
