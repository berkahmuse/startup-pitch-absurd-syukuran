// Fake Paparazzi Ambushes — startup pitch entry for @syukuran
// make.fun competition u-po-pu-ridiculous-at-first-glance-real-by-the-second-9a97d12a
//
// One sentence, at most 200 characters, pitching a startup so strange it
// sounds like a joke, until the business logic lands. The program writes
// that sentence — and nothing else — to /output/entry.txt.
//
// Freshness anchor (drand quicknet, quoted BEFORE the first write of the
// entry file; see ANCHOR.md):
//   round 34235968
//   randomness a312d2da3fea94a3d811b0762a1fcbe1848d3a079cc11442dc753643d2a11b62
//
// The pitch: fake paparazzi. Aspiring influencers pay $199 to be mobbed
// by flashing cameras outside a cafe, because looking famous in photos
// is the cheapest way to look famous — and brands pay more to creators
// whose followers already believe they are stars. The joke is the
// product; the social-proof economy is the business.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const PITCH =
  "We sell $199 fake paparazzi ambushes, because aspiring influencers pay " +
  "to look famous in photos their followers believe — and brands pay more " +
  "for followers who think they're already stars.";

const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 200;
const ENTRY_OUTPUT = process.env.ENTRY_OUTPUT ?? "/output/entry.txt";

function countChars(text: string): number {
  // Count Unicode code points, the way the gate counts characters.
  return Array.from(text).length;
}

function countSentences(text: string): number {
  // A sentence ends at a terminator followed by space or end of text.
  return (text.trim().match(/[.!?]+(?=\s|$)/g) ?? []).length;
}

function checkGate(text: string): void {
  const chars = countChars(text);
  if (chars < GATE_MIN_CHARS || chars > GATE_MAX_CHARS) {
    throw new Error(
      `entry must be ${GATE_MIN_CHARS}-${GATE_MAX_CHARS} chars, got ${chars}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (/[\x00-\x1f\x7f]/.test(text)) {
    throw new Error("entry must not contain control characters");
  }
  if (countSentences(text) !== 1) {
    throw new Error(
      `entry must be exactly one sentence, got ${countSentences(text)}`,
    );
  }
}

function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function main(): void {
  checkGate(PITCH);
  const chars = countChars(PITCH);
  const sha = sha256Hex(PITCH);

  if (process.argv.includes("--check")) {
    console.log(`check ok: ${chars} chars, 1 sentence, sha256 ${sha}`);
    return;
  }

  const outDir = dirname(ENTRY_OUTPUT);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(ENTRY_OUTPUT, PITCH, "utf8");

  // Read back what actually landed on disk and re-enforce the gate on it.
  const onDisk = readFileSync(ENTRY_OUTPUT, "utf8");
  if (onDisk !== PITCH) {
    throw new Error("entry.txt on disk does not match the pitch");
  }
  checkGate(onDisk);
  console.log(
    `wrote ${ENTRY_OUTPUT} (${chars} chars, sha256 ${sha256Hex(onDisk)})`,
  );
}

main();
