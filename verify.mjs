#!/usr/bin/env node
// genlayer-verify: inspect a deployed GenLayer Intelligent Contract.
// Reads the contract code and schema back from a GenLayer node and prints
// what is actually deployed, so a builder can prove a deployment matches
// the source they think it does. With --file, the deployed code is also
// compared against a local contract file.

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const NETWORKS = {
  studionet: 'https://studio.genlayer.com/api',
  bradbury: 'https://rpc-bradbury.genlayer.com',
};

function usage() {
  console.log('Usage: node verify.mjs --address 0x... [--network studionet|bradbury] [--rpc URL] [--file path/to/contract.py]');
  process.exit(2);
}

const args = process.argv.slice(2);
let address = null;
let network = 'studionet';
let rpc = null;
let file = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--address') address = args[++i];
  else if (args[i] === '--network') network = args[++i];
  else if (args[i] === '--rpc') rpc = args[++i];
  else if (args[i] === '--file') file = args[++i];
  else usage();
}
if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) usage();
const endpoint = rpc || NETWORKS[network];
if (!endpoint) { console.error('Unknown network: ' + network); process.exit(2); }

async function rpcCall(method, params) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(method + ': ' + (data.error.message || JSON.stringify(data.error)));
  return data.result;
}

// Line endings and trailing blank lines differ between editors and the
// deployed copy, so file comparison normalizes both before hashing.
function normalize(code) {
  return code.replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';
}
function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

const schema = await rpcCall('gen_getContractSchema', [address]);
const codeB64 = await rpcCall('gen_getContractCode', [address]);
const code = Buffer.from(codeB64, 'base64').toString('utf8');

console.log('Network:  ' + network + ' (' + endpoint + ')');
console.log('Address:  ' + address);
console.log('Code size: ' + code.length + ' chars');
console.log('Code SHA-256: ' + sha256(code));
const firstLine = code.split('\n')[0];
console.log('Runner header: ' + firstLine);
console.log('');
console.log('Constructor params: ' + (schema.ctor.params.length ? JSON.stringify(schema.ctor.params) : '(none)'));
console.log('Methods:');
for (const [name, m] of Object.entries(schema.methods)) {
  const params = m.params.map((p) => p[0] + ': ' + p[1]).join(', ');
  console.log('  ' + name + '(' + params + ') -> ' + m.ret + (m.readonly ? '  [view]' : '  [write]'));
}

if (file) {
  const local = await readFile(file, 'utf8');
  const localHash = sha256(normalize(local));
  const deployedHash = sha256(normalize(code));
  console.log('');
  console.log('Local file: ' + file);
  console.log('Local SHA-256 (normalized):    ' + localHash);
  console.log('Deployed SHA-256 (normalized): ' + deployedHash);
  if (localHash === deployedHash) {
    console.log('Comparison: MATCH, the deployed code is this file.');
  } else {
    console.log('Comparison: MISMATCH, the deployed code differs from this file.');
    process.exitCode = 1;
  }
}
