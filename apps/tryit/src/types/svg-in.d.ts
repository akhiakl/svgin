import type { DetailedHTMLProps, HTMLAttributes } from 'react';

// svgin-element's own `declare global { interface HTMLElementTagNameMap }`
// (see its src/index.ts) covers document.createElement/querySelector typing
// but not JSX - React 19's @types/react declares JSX.IntrinsicElements as
// `React.JSX.IntrinsicElements` (a `declare module 'react'` augmentation,
// not the older global `JSX` namespace), so that's what needs augmenting
// here too, or a plain `<svg-in src="..." />` fails to typecheck.
// `svgin-element` itself doesn't (and shouldn't) provide this - it's a
// framework-agnostic package with no React dependency - so it belongs in
// this React app's own types instead.
//
// Attributes only, matching <svg-in>'s actual documented attribute API (see
// SvgIn.ts's own class doc comment) - `sanitizeFn`/`fetchOptions` are JS
// properties (`el.sanitizeFn = ...`), not attributes, and have no JSX/DOM-
// attribute representation; set them imperatively via a ref instead.
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'svg-in': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                svg?: string;
                width?: string | number;
                height?: string | number;
                fill?: string;
                'svg-title'?: string;
                'svg-description'?: string;
                'disable-sanitization'?: boolean | '';
                loading?: 'eager' | 'lazy';
            };
        }
    }
}
