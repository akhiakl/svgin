#!/usr/bin/env node
// Builds the markdown body for the "Quality checks summary" sticky PR
// comment (see .github/workflows/ci.yml, job quality-summary). Unlike
// pr-report.mjs (which re-runs vitest itself to compute pass/fail counts),
// this reads the *actual* output of the real CI gate jobs (lint, typecheck,
// test, coverage, build) - each of those jobs tees its own command output
// to a log file and uploads it as a `quality-log-<job>` artifact on
// always(), win or lose. The point is letting a reviewer see *why* a check
// failed directly in the PR, without opening the Actions run at all.
//
// Usage: node scripts/quality-summary.mjs <logs-dir>
// <logs-dir> is wherever actions/download-artifact@v8 placed the
// `quality-log-*` artifacts - each one its own subdirectory
// (`<logs-dir>/quality-log-lint/lint-output.log`, etc.), download-artifact's
// own default layout for a multi-artifact pattern download.
//
// Reads each check's pass/fail/skipped status from the RESULT_* env vars
// (set from `needs.<job>.result` in the workflow) rather than inferring it
// from the log - a log can be empty/missing for reasons that aren't a
// failure (the job never ran on this event, e.g. commitlint being PR-only),
// and `needs.*.result` is the one source of truth GitHub itself computed.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [logsDir] = process.argv.slice(2);
if (!logsDir) {
    console.error('Usage: node scripts/quality-summary.mjs <logs-dir>');
    process.exit(1);
}

const RUN_URL = process.env.RUN_URL ?? '';

// One entry per real CI gate job. `logArtifacts` lists every
// `quality-log-*` artifact name that can contain this check's output - more
// than one only for the `test` job, whose Node 22/24 matrix each upload
// their own log under a different artifact name.
const CHECKS = [
    { key: 'lint', label: 'Lint', resultEnv: 'RESULT_LINT', logArtifacts: ['quality-log-lint'] },
    { key: 'typecheck', label: 'Typecheck', resultEnv: 'RESULT_TYPECHECK', logArtifacts: ['quality-log-typecheck'] },
    {
        key: 'test',
        label: 'Test (Node 22 & 24)',
        resultEnv: 'RESULT_TEST',
        logArtifacts: ['quality-log-test-node22', 'quality-log-test-node24'],
    },
    { key: 'coverage', label: 'Coverage thresholds', resultEnv: 'RESULT_COVERAGE', logArtifacts: ['quality-log-coverage'] },
    { key: 'build', label: 'Build & bundle size', resultEnv: 'RESULT_BUILD', logArtifacts: ['quality-log-build'] },
];

// Generous but bounded: a GitHub issue/PR comment body caps out around 65536
// characters total, and this report has up to 5 of these sections plus a
// summary table - keeping each one well under that, with a clear truncation
// notice, beats silently hitting the real limit and having the whole
// comment post fail.
const MAX_LOG_CHARS = 12000;

// Matches a path-looking token ending in a common source extension
// (packages/react/src/Foo.tsx, ./SvgIn.ts, apps/tryit/test/x.test.tsx) -
// used only to decide whether a failing check's output is short enough to
// show inline or needs collapsing behind <details>, not to parse the log
// for real. Deliberately permissive (no anchoring to repo-relative paths):
// both eslint's stylish output and tsc's own file:line:col format match
// this shape well enough for a rough "how many files does this touch" count.
const FILE_TOKEN_RE = /(?:^|[\s(])((?:[\w.-]+\/)*[\w.-]+\.(?:ts|tsx|js|jsx|mjs|cjs))\b/gm;

function countTouchedFiles(log) {
    const files = new Set();
    let m;
    FILE_TOKEN_RE.lastIndex = 0;
    while ((m = FILE_TOKEN_RE.exec(log)) !== null) files.add(m[1]);
    return files.size;
}

// Reads every log artifact for `check`, not just the first non-empty one:
// for the `test` check specifically, logArtifacts lists one artifact per
// matrix leg (Node 22, Node 24), and a failure on only one leg must not be
// masked by the other leg's passing log - concatenating both, each under
// its own artifact-name header, is what actually shows *why* the check
// failed rather than a misleadingly clean log from the other leg (caught in
// review of this exact code: a single-artifact "return the first non-empty
// one" silently showed Node 22's green log for a Node-24-only failure).
function readLogFor(check) {
    const found = [];
    for (const artifact of check.logArtifacts) {
        const dir = join(logsDir, artifact);
        let entries;
        try {
            entries = readdirSync(dir);
        } catch {
            continue;
        }
        // The capture step always tees to exactly one file per artifact -
        // read whichever file is actually there rather than hardcoding its
        // name, so a future rename of that file doesn't silently break this.
        for (const entry of entries) {
            try {
                const content = readFileSync(join(dir, entry), 'utf8').trim();
                if (content !== '') found.push({ artifact, content });
            } catch {
                // Skip unreadable entries (shouldn't happen for a plain
                // text log, but this report degrading to "no log found"
                // is preferable to it crashing the whole job over one).
            }
        }
    }
    if (found.length === 0) return null;
    // A single artifact (every check except `test`) needs no header - only
    // label sections once there's more than one log to tell apart.
    if (found.length === 1) return { content: found[0].content };
    const content = found.map(({ artifact, content }) => `=== ${artifact} ===\n${content}`).join('\n\n');
    return { content };
}

function icon(result) {
    if (result === 'success') return '✅';
    if (result === 'failure') return '❌';
    if (result === 'skipped') return '⚪';
    if (result === 'cancelled') return '⚠️';
    return '❓';
}

function statusWord(result) {
    if (result === 'success') return 'passed';
    if (result === 'failure') return 'failed';
    if (result === 'skipped') return 'skipped';
    if (result === 'cancelled') return 'cancelled';
    return 'unknown';
}

function truncate(content) {
    if (content.length <= MAX_LOG_CHARS) return { text: content, truncated: false };
    // From the end, not the start: a lint/typecheck/test failure's most
    // useful detail (the actual error) is almost always near the bottom of
    // its own tool's output, with setup/passing noise earlier.
    const text = content.slice(content.length - MAX_LOG_CHARS);
    return { text, truncated: true };
}

function renderFailingSection(check, result) {
    const found = readLogFor(check);
    const header = `### ${icon(result)} ${check.label} — ${statusWord(result)}`;
    if (!found) {
        return [
            header,
            '',
            `_No log was captured for this check - it likely failed before reaching its own run step (install, checkout). See the [workflow run](${RUN_URL}) for details._`,
        ].join('\n');
    }
    const { text, truncated } = truncate(found.content);
    const fileCount = countTouchedFiles(found.content);
    const lineCount = found.content.split('\n').length;
    const body = [
        '```',
        text,
        truncated ? `\n… truncated (showing the last ${MAX_LOG_CHARS.toLocaleString()} characters) - see the workflow run for the full log.` : '',
        '```',
    ]
        .filter(Boolean)
        .join('\n');
    // Small enough to just read without an extra click; anything bigger (by
    // line count or by how many distinct files it touches) collapses behind
    // <details> instead, so one noisy check doesn't push every other
    // section below the fold in the PR comment.
    const isSmall = lineCount <= 25 && fileCount <= 3;
    if (isSmall) {
        return [header, '', body].join('\n');
    }
    const summary = `${icon(result)} ${check.label} — ${lineCount} line(s)${fileCount > 0 ? ` across ${fileCount} file(s)` : ''} (click to expand)`;
    return [header, '', `<details>`, `<summary>${summary}</summary>`, '', body, '', `</details>`].join('\n');
}

const results = CHECKS.map((check) => ({ check, result: process.env[check.resultEnv] ?? 'unknown' }));
const anyFailure = results.some((r) => r.result === 'failure');
const anyUnresolved = results.some((r) => r.result !== 'success' && r.result !== 'skipped' && r.result !== 'failure');

const tableRows = results.map(({ check, result }) => `| ${check.label} | ${icon(result)} ${statusWord(result)} |`);

const failingSections = results.filter(({ result }) => result === 'failure' || result === 'cancelled').map(({ check, result }) => renderFailingSection(check, result));

const lines = [
    '## Quality checks summary',
    '',
    anyFailure
        ? '**🔴 One or more checks failed** - details below, no need to open the workflow run.'
        : anyUnresolved
          ? '**🟡 Some checks did not complete** - see below.'
          : '**🟢 All quality checks passed.**',
    '',
    '| Check | Status |',
    '| --- | --- |',
    ...tableRows,
    '',
    ...(failingSections.length > 0 ? [failingSections.join('\n\n')] : []),
    '',
    `<sub>Pulled directly from each check's own output (lint/typecheck/test/build), captured regardless of pass or fail. [Full workflow run](${RUN_URL}).</sub>`,
].join('\n');

console.log(lines);
