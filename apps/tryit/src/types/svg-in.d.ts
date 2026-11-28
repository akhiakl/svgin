import type { DetailedHTMLProps, HTMLAttributes } from 'react';

// JSX typing for <svg-in>, which the framework-agnostic package can't provide. Attributes only: sanitizeFn/fetchOptions are JS properties.
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
