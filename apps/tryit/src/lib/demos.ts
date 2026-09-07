// Single source of truth for the demo route list, so the home page's card
// grid, the docs sidebar's "Live demos" section, and anywhere else that
// needs to enumerate them can never drift out of sync with each other (the
// sidebar previously hand-duplicated this list and silently fell behind
// when native-props/shadow were added).
export const DEMOS = [
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
    {
        href: '/element',
        title: 'Web Component',
        badge: 'Vanilla JS',
        description: '<svg-in>, a framework-agnostic native Custom Element from svgin-element, usable without React at all.',
    },
] as const;
