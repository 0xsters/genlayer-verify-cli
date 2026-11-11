// lib.mjs - pure, testable helpers for genlayer-verify.
//
// verify.mjs stays the CLI entry point; everything here runs offline and
// is covered by the recorded-fixture tests in test/verify.test.mjs.

import { createHash } from 'node:crypto';

// Line endings and trailing blank lines differ between editors and the
// deployed copy, so file comparison normalizes both before hashing.
export function normalize(code) {
  return code.replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';
}

export function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

export function formatMethod(name, method) {
  const params = method.params.map((p) => p[0] + ': ' + p[1]).join(', ');
  return '  ' + name + '(' + params + ') -> ' + method.ret + (method.readonly ? '  [view]' : '  [write]');
}

// Render the same report verify.mjs prints for one deployed contract,
// given the schema and code already read back from a node.
export function formatReport({ network, endpoint, address, schema, code }) {
  const lines = [];
  lines.push('Network:  ' + network + ' (' + endpoint + ')');
  lines.push('Address:  ' + address);
  lines.push('Code size: ' + code.length + ' chars');
  lines.push('Code SHA-256: ' + sha256(code));
  lines.push('Runner header: ' + code.split('\n')[0]);
  lines.push('');
  lines.push('Constructor params: ' + (schema.ctor.params.length ? JSON.stringify(schema.ctor.params) : '(none)'));
  lines.push('Methods:');
  for (const [name, m] of Object.entries(schema.methods)) {
    lines.push(formatMethod(name, m));
  }
  return lines.join('\n');
}

// Compare a local contract file against deployed code the way --file does:
// both sides normalized, then hashed. Returns the hashes and the verdict.
export function compareCode(local, deployed) {
  const localHash = sha256(normalize(local));
  const deployedHash = sha256(normalize(deployed));
  return { localHash, deployedHash, match: localHash === deployedHash };
}

// Parse the --args value for --call: a JSON array of call arguments.
// No value means no arguments. Anything that is not a JSON array is a
// usage error, so the CLI fails before it talks to the node.
export function parseCallArgs(text) {
  if (text === null || text === undefined || text === '') return [];
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('--args must be a JSON array, got: ' + text);
  }
  if (!Array.isArray(parsed)) {
    throw new Error('--args must be a JSON array, got: ' + text);
  }
  return parsed;
}

// Resolve a --call method name against the deployed schema. Only view
// methods may be called: this tool is read-only, so a write method is a
// usage error, and the argument count must match the schema.
export function resolveCallMethod(schema, name, args = []) {
  const method = schema.methods[name];
  if (!method) {
    throw new Error('Unknown method: ' + name + ' (not in the deployed contract schema)');
  }
  if (!method.readonly) {
    throw new Error('Method ' + name + ' is a write method; --call only runs view methods');
  }
  if (args.length !== method.params.length) {
    throw new Error(
      'Method ' + name + ' takes ' + method.params.length + ' argument(s), got ' + args.length
    );
  }
  return method;
}

// Render one call result the way verify.mjs prints it. String results
// print raw (get_task returns the task as JSON text); anything else
// prints as JSON so numbers and objects stay readable.
export function formatCallResult(name, args, result) {
  const renderedArgs = args.map((a) => JSON.stringify(a)).join(', ');
  const renderedResult = typeof result === 'string' ? result : JSON.stringify(result);
  return 'Call: ' + name + '(' + renderedArgs + ') => ' + renderedResult;
}
