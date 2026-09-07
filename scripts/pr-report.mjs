#!/usr/bin/env node
// Builds the markdown body for the "PR size & coverage report" sticky
// comment (see .github/workflows/ci.yml, job pr-report). Ported from
// akhiakl/svgin-react's own scripts/pr-report.mjs (same diff-arrow
// formatting, same head-vs-base comparison idea), generalized from that
// single-package repo's report to a proper superset for this monorepo: one
// section per package/app instead of one, plus a unit-test pass/fail
// summary the original didn't have. E2E/axe-core summaries are a
// deliberately separate, later phase - see #22.
//
// Usage: node scripts/pr-report.mjs <reports-dir>
// Reads <reports-dir>/{head,base}-{coverage,size,test}-<packageId>.json for
// each package below. Any file that's missing or unreadable is treated as
// "no data" for that side/package, not a failure - a package that predates
// this tooling, or whose build failed on the base branch, still gets a
// report, just with that cell/section rendered as n/a.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [reportsDir] = process.argv.slice(2);
if (!reportsDir) {
    console.error('Usage: node scripts/pr-report.mjs <reports-dir>');
    process.exit(1);
}

// The fixed set of packages/apps this report covers. Not auto-discovered
// from the workspace: this monorepo's package list changes rarely enough
// that a hardcoded, readable list here is worth more than the complexity of
// discovering it dynamically (and a new package not yet added here just
// silently isn't reported, rather than crashing the job).
const PACKAGES = [
    { id: 'core', label: 'svgin-core', hasSize: false },
    { id: 'react', label: 'svgin-react', hasSize: true },
    { id: 'element', label: 'svgin-element', hasSize: true },
    { id: 'tryit', label: 'svgin-tryit', hasSize: false },
];

function readJson(path) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return null;
    }
}

function readSide(side, kind, pkgId) {
    return readJson(join(reportsDir, `${side}-${kind}-${pkgId}.json`));
}

function fmtKb(n) {
    return typeof n === 'number' ? `${n.toFixed(2)} KB` : 'n/a';
}

function fmtPct(n) {
    return typeof n === 'number' ? `${n.toFixed(1)}%` : 'n/a';
}

function diffArrow(headVal, baseVal, { lowerIsBetter }) {
    if (typeof headVal !== 'number' || typeof baseVal !== 'number') return '';
    const delta = headVal - baseVal;
    if (Math.abs(delta) < 0.01) return '(no change)';
    const better = lowerIsBetter ? delta < 0 : delta > 0;
    const arrow = delta > 0 ? '↑' : '↓';
    const sign = delta > 0 ? '+' : '';
    const icon = better ? '🟢' : '🔴';
    return `${icon} ${arrow} ${sign}${delta.toFixed(2)}`;
}

function coverageRow(label, headTotal, baseTotal, key) {
    const head = headTotal?.[key]?.pct;
    const base = baseTotal?.[key]?.pct;
    return `| ${label} | ${fmtPct(base)} | ${fmtPct(head)} | ${diffArrow(head, base, { lowerIsBetter: false })} |`;
}

function coverageSection(pkg, headCoverage, baseCoverage) {
    if (!headCoverage) return '**Coverage**: _no data (coverage run may have failed)._';
    const headTotal = headCoverage.total;
    const baseTotal = baseCoverage?.total;
    return [
        `**Coverage**`,
        '',
        '| Metric | Base | This PR | Change |',
        '| --- | --- | --- | --- |',
        coverageRow('Statements', headTotal, baseTotal, 'statements'),
        coverageRow('Branches', headTotal, baseTotal, 'branches'),
        coverageRow('Functions', headTotal, baseTotal, 'functions'),
        coverageRow('Lines', headTotal, baseTotal, 'lines'),
    ].join('\n');
}

function sizeSection(pkg, headSize, baseSize) {
    if (!pkg.hasSize) return null;
    if (!headSize) return '**Bundle size**: _no data (build may have failed)._';
    const headByFile = Object.fromEntries(headSize.map((r) => [r.file, r]));
    const baseByFile = Object.fromEntries((baseSize ?? []).map((r) => [r.file, r]));
    const files = [...headSize.map((r) => r.file), ...Object.keys(baseByFile).filter((f) => !(f in headByFile))];
    const rows = files.map((file) => {
        const head = headByFile[file];
        const base = baseByFile[file];
        const headGzip = head?.found ? head.gzipKb : undefined;
        const baseGzip = base?.found ? base.gzipKb : undefined;
        const budgetKb = head?.budgetKb ?? base?.budgetKb ?? '?';
        const status = !head ? '⚪ removed' : head.found ? (head.overBudget ? '❌ over budget' : '✅') : '❓ not found';
        return `| \`${file}\` | ${fmtKb(baseGzip)} | ${fmtKb(headGzip)} | ${diffArrow(headGzip, baseGzip, { lowerIsBetter: true })} | ${budgetKb} KB | ${status} |`;
    });
    return [
        '**Bundle size (gzip)**',
        '',
        '| File | Base | This PR | Change | Budget | Status |',
        '| --- | --- | --- | --- | --- | --- |',
        ...rows,
    ].join('\n');
}

function testSection(headTest) {
    if (!headTest) return '**Unit tests**: _no data (test run may have failed)._';
    const { numTotalTests, numPassedTests, numFailedTests, numPendingTests } = headTest;
    const icon = numFailedTests > 0 ? '❌' : '✅';
    const pending = numPendingTests > 0 ? `, ${numPendingTests} skipped` : '';
    return `**Unit tests**: ${icon} ${numPassedTests}/${numTotalTests} passed${numFailedTests > 0 ? `, **${numFailedTests} failed**` : ''}${pending}`;
}

let anyFailure = false;
let anyData = false;

const sections = PACKAGES.map((pkg) => {
    const headCoverage = readSide('head', 'coverage', pkg.id);
    const baseCoverage = readSide('base', 'coverage', pkg.id);
    const headSize = readSide('head', 'size', pkg.id);
    const baseSize = readSide('base', 'size', pkg.id);
    const headTest = readSide('head', 'test', pkg.id);

    if (!headCoverage && !headSize && !headTest) {
        return `### ${pkg.label}\n\n_No data collected for this package._`;
    }
    anyData = true;
    if (headTest?.numFailedTests > 0) anyFailure = true;
    if (headSize?.some((r) => r.overBudget || !r.found)) anyFailure = true;

    const parts = [testSection(headTest), sizeSection(pkg, headSize, baseSize), coverageSection(pkg, headCoverage, baseCoverage)].filter(
        (part) => part !== null
    );

    return [`### ${pkg.label}`, ...parts].join('\n\n');
});

const lines = [
    '## PR report: tests, coverage & bundle size',
    '',
    !anyData
        ? "_No data collected for any package - see the `pr-report` job's own logs._"
        : anyFailure
          ? '**🔴 Needs attention** - see the sections below.'
          : '**🟢 All green.**',
    '',
    sections.join('\n\n'),
    '',
    '<sub>Base branch numbers come from rebuilding its current head in this same workflow run. 🟢/🔴 mark whether this PR made a number better or worse; missing data (base predates a script, a build failed) is shown as n/a rather than counted either way. E2E and accessibility summaries are a separate, later phase - see [#22](https://github.com/akhiakl/svgin/issues/22).</sub>',
].join('\n');

console.log(lines);
