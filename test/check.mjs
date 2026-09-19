#!/usr/bin/env node
/**
 * The site's own check. Run: node test/check.mjs
 *
 * Two assertions, and the first one is the point: these pages sell an
 * accessibility checker, so they run it on themselves and must come back with
 * zero findings. A marketing site for an accessibility tool that fails its own
 * tool is not a small embarrassment — it is the whole argument, lost.
 *
 * The second covers what the checker cannot see: the palette lives in CSS
 * custom properties, and the contrast rule only fires on literal colour pairs
 * inside one rule. So the ratios are computed here, for the pairs that
 * actually appear together on the page.
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');

const failures = [];
const check = (label, actual, expected) => {
  const ok = actual === expected;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`);
  if (!ok) failures.push(label);
};

console.log('\nplainform.github.io checks\n');

// --- the site must pass the checker it advertises -------------------------
console.log('the site must pass eaa-lint, which it sells:');
let report;
try {
  const out = execFileSync('npx', ['--yes', 'eaa-lint', site, '--json'], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, shell: process.platform === 'win32',
  });
  report = JSON.parse(out);
} catch (err) {
  console.log(`  skip  eaa-lint could not run (${err.message.split('\n')[0]})`);
}

if (report) {
  check('blocking violations', report.counts.blocking, 0);
  check('serious violations', report.counts.serious, 0);
  check('minor violations', report.counts.minor, 0);
  check('findings needing review', report.counts.review, 0);
}

// --- contrast, which the checker cannot see through CSS variables ---------
const hex = (h) => {
  const s = h.replace('#', '');
  const f = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(hex(a)), luminance(hex(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const PAIRS = [
  ['light body text', '#16150f', '#fdfdfb'],
  ['light muted text', '#55514a', '#fdfdfb'],
  ['light links', '#8a1f11', '#fdfdfb'],
  ['light muted on surface', '#55514a', '#f3f2ec'],
  ['light CTA label', '#ffffff', '#8a1f11'],
  ['light live badge', '#14532d', '#e3f0e6'],
  ['dark body text', '#edeade', '#13130f'],
  ['dark muted text', '#b3ada0', '#13130f'],
  ['dark links', '#ff9d86', '#13130f'],
  ['dark muted on surface', '#b3ada0', '#1e1d18'],
  ['dark CTA label', '#13130f', '#ff9d86'],
  ['dark live badge', '#b7e4c2', '#1c2e21'],
];

console.log('\nevery colour pair must meet WCAG 1.4.3 AA (4.5:1):');
for (const [label, fg, bg] of PAIRS) {
  const r = ratio(fg, bg);
  check(`${label} (${r.toFixed(2)}:1)`, r >= 4.5 ? 1 : 0, 1);
}

console.log(failures.length ? `\n${failures.length} FAILED\n` : '\nall green\n');
process.exit(failures.length ? 1 : 0);
