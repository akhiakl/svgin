#!/usr/bin/env node
// Shared bundle-size budget checker, run from each publishable package's own
// `size` script (see packages/react/package.json, packages/element/package.json)
// against that package's own size-budget.json. Ported from akhiakl/svgin-react's
// scripts/check-bundle-size.mjs (same budget-per-file, gzip-based approach),
// generalized to read its budgets from a config file instead of a hard-coded
// object, since this monorepo has more than one package to check.
//
// Usage (run with cwd set to the package being checked):
//   node ../../scripts/check-bundle-size.mjs                    human-readable, exits 1 over budget
//   node ../../scripts/check-bundle-size.mjs --json              prints a JSON array to stdout instead
//   node ../../scripts/check-bundle-size.mjs --json --no-fail    also skip the non-zero exit code
//
// --json is for a future PR size-report step (see #22) to compare a pull
// request's bundle size against its base branch, same as the original.
//
// size-budget.json shape: { "<dist file>": <budget in KB, gzipped>, ... }.
// Budgets are for the CJS build (dist/*.cjs), which is the worst case for
// bundle size since ESM output is what bundlers tree-shake most
// aggressively - see each package's own size-budget.json for per-entry
// budget numbers and the reasoning behind them.
import { gzipSync } from 'node:zlib';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const BUDGET_FILE = 'size-budget.json';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const noFail = args.includes('--no-fail');

let budgets;
try {
    budgets = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));
} catch (e) {
    // Defensive, not just stylistic: JSON.parse/readFileSync almost always
    // throw a real Error, but assuming e.message exists unconditionally
    // would itself throw (and hide the actual failure) if something ever
    // throws a plain string or other non-Error value.
    const reason = e instanceof Error ? e.message : String(e);
    console.error(`Could not read/parse ${BUDGET_FILE} in ${process.cwd()}: ${reason}`);
    process.exit(1);
}

let failed = false;
const results = [];

for (const [file, budgetKb] of Object.entries(budgets)) {
    const path = join(DIST, file);
    let raw;
    try {
        raw = readFileSync(path);
    } catch {
        failed = true;
        results.push({ file, found: false, budgetKb });
        if (!jsonMode) console.error(`✖ ${file}: not found at ${path} - did the build run?`);
        continue;
    }
    const gzipBytes = gzipSync(raw).length;
    const gzipKb = gzipBytes / 1024;
    const rawKb = statSync(path).size / 1024;
    const overBudget = gzipKb > budgetKb;
    if (overBudget) failed = true;
    results.push({ file, found: true, rawKb, gzipKb, budgetKb, overBudget });
    if (!jsonMode) {
        const status = overBudget ? '✖' : '✓';
        console.log(
            `${status} ${file}: ${rawKb.toFixed(2)} KB raw, ${gzipKb.toFixed(2)} KB gzip (budget: ${budgetKb} KB gzip)`
        );
    }
}

if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
} else if (failed) {
    console.error(`\nBundle size budget exceeded. See ${process.cwd()}/${BUDGET_FILE}.`);
}

if (failed && !noFail) {
    process.exit(1);
}
