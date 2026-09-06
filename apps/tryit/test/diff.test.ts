import { describe, expect, it } from 'vitest';
import { diffSanitization } from '@/lib/diff';

describe('diffSanitization', () => {
    it('reports no removed tags/attrs and zero bytesRemoved for identical markup', () => {
        const svg = '<svg><circle r="1" /></svg>';
        expect(diffSanitization(svg, svg)).toEqual({ removedTags: [], removedAttrs: [], bytesRemoved: 0 });
    });

    it('detects a fully removed tag', () => {
        const raw = '<svg><script>alert(1)</script><circle r="1" /></svg>';
        const sanitized = '<svg><circle r="1" /></svg>';
        const diff = diffSanitization(raw, sanitized);
        expect(diff.removedTags).toContain('script');
        expect(diff.bytesRemoved).toBeGreaterThan(0);
    });

    it('detects a removed attribute even when the tag survives', () => {
        const raw = '<svg><rect onclick="evil()" width="1" /></svg>';
        const sanitized = '<svg><rect width="1" /></svg>';
        const diff = diffSanitization(raw, sanitized);
        expect(diff.removedAttrs).toContain('onclick');
        expect(diff.removedTags).toEqual([]);
    });

    it('reports a tag as removed if any instance of it was dropped, even when others of the same tag survive', () => {
        const raw = '<svg><rect /><rect onclick="evil()" /></svg>';
        const sanitized = '<svg><rect /></svg>';
        const diff = diffSanitization(raw, sanitized);
        expect(diff.removedTags).toContain('rect');
    });

    it('does not report a tag as removed when every instance of it survives', () => {
        const raw = '<svg><rect /><rect /></svg>';
        const sanitized = '<svg><rect /><rect /></svg>';
        expect(diffSanitization(raw, sanitized).removedTags).toEqual([]);
    });

    it('clamps bytesRemoved to zero when sanitized markup is longer (e.g. added namespace attrs)', () => {
        const raw = '<svg></svg>';
        const sanitized = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
        expect(diffSanitization(raw, sanitized).bytesRemoved).toBe(0);
    });

    it('matches tag/attribute names case-insensitively', () => {
        const raw = '<SVG><SCRIPT>x</SCRIPT></SVG>';
        const sanitized = '<svg></svg>';
        expect(diffSanitization(raw, sanitized).removedTags).toContain('script');
    });
});
