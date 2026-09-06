// Rough, purely visual diff between the raw SVG markup a user pasted and the
// markup DOMPurify produced from it - counts removed tags/attributes by
// regex rather than parsing, since this only needs to drive a "here's roughly
// what changed" summary, not a byte-accurate diff.
const TAG_RE = /<([a-zA-Z][a-zA-Z0-9:-]*)/g;
const ATTR_RE = /\s([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=/g;

function countBy(re: RegExp, text: string): Map<string, number> {
    const counts = new Map<string, number>();
    for (const match of text.matchAll(re)) {
        const key = match[1].toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
}

function removedKeys(before: Map<string, number>, after: Map<string, number>): string[] {
    const removed: string[] = [];
    for (const [key, count] of before) {
        const remaining = after.get(key) ?? 0;
        if (remaining < count) removed.push(key);
    }
    return removed.sort();
}

export interface SanitizationDiff {
    removedTags: string[];
    removedAttrs: string[];
    bytesRemoved: number;
}

export function diffSanitization(raw: string, sanitized: string): SanitizationDiff {
    return {
        removedTags: removedKeys(countBy(TAG_RE, raw), countBy(TAG_RE, sanitized)),
        removedAttrs: removedKeys(countBy(ATTR_RE, raw), countBy(ATTR_RE, sanitized)),
        bytesRemoved: Math.max(0, raw.length - sanitized.length),
    };
}
