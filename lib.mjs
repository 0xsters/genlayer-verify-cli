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
