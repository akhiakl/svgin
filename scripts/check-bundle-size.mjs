#!/usr/bin/env node
// Checks dist/ gzip sizes against ./size-budget.json ({ "<dist file>": <KB gzip> }).
// Run with cwd set to the package. --json prints results; --no-fail skips the exit code.
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
