export interface Demo {
    href: string;
    title: string;
    badge: string;
    description: string;
}

export interface DemoGroup {
    id: string;
    label: string;
    demos: Demo[];
}

// Single source for the demo routes (landing grids, sidebar, drawer, sitemap). Explicit types, not `as const`: per-group literal tuples don't unify for flatMap.
export const DEMO_GROUPS: DemoGroup[] = [
    {
        id: 'react',
        label: 'React',
        demos: [
            {
                href: '/inspector',
                title: 'Inspector',
                badge: 'Client',
                description: 'Paste an SVG and see exactly what the default DOMPurify sanitizer strips, live, using the real library.',
            },
            {
                href: '/rsc',
                title: 'Server component',
                badge: 'RSC',
                description: 'The async server <SvgIn /> fetching and sanitizing an SVG on the server, with zero client JS shipped for it.',
            },
            {
                href: '/suspense',
                title: 'Suspense',
                badge: 'Client',
                description: '<SvgInSuspense /> driven by React 19\'s use(), paired with a real <Suspense> boundary and an error boundary.',
            },
            {
                href: '/provider',
                title: 'Provider defaults',
                badge: 'Client',
                description: '<SvgInProvider /> setting shared className, fallback, and onError defaults for every <SvgIn /> beneath it.',
            },
            {
                href: '/lazy',
                title: 'Lazy loading',
                badge: 'Client',
                description: '<SvgIn loading="lazy" /> deferring fetch/sanitize until the placeholder scrolls near the viewport.',
            },
            {
                href: '/native-props',
                title: 'Native SVG props',
                badge: 'Client',
                description: 'style, onClick, role, and data-* forwarded straight onto the rendered <svg>, the same as a plain <svg> tag.',
            },
            {
                href: '/shadow',
                title: 'Shadow DOM',
                badge: 'Client',
                description: '<SvgInShadow /> encapsulating an SVG (and its own styles) inside a shadow root, immune to page-wide CSS in either direction.',
            },
        ],
    },
    {
        id: 'element',
        label: 'Element',
        demos: [
            {
                href: '/element/basic',
                title: 'Basic',
                badge: 'Vanilla JS',
                description: '<svg-in src="..."> fetching and rendering a real SVG, no React wrapper, plus the svg-in-load event.',
            },
            {
                href: '/element/raw',
                title: 'Raw markup',
                badge: 'Vanilla JS',
                description: 'The svg attribute rendering markup you already have directly, sanitized, with no fetch at all.',
            },
            {
                href: '/element/lazy',
                title: 'Lazy loading',
                badge: 'Vanilla JS',
                description: 'loading="lazy" deferring fetch/sanitize until the element scrolls near the viewport, via IntersectionObserver.',
            },
            {
                href: '/element/inspector',
                title: 'Inspector',
                badge: 'Vanilla JS',
                description: 'disable-sanitization compared side by side: a malicious payload stripped by default, or rendered raw when opted out.',
            },
            {
                href: '/element/events',
                title: 'Events',
                badge: 'Vanilla JS',
                description: 'A failing src dispatching svg-in-error instead of throwing - no React error boundary involved.',
            },
        ],
    },
];

export const DEMOS: Demo[] = DEMO_GROUPS.flatMap((group) => group.demos);
