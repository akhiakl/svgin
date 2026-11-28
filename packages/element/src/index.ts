import { SvgIn } from './SvgIn';

export { SvgIn } from './SvgIn';
export type { SvgInErrorEvent, SvgInErrorEventDetail, SvgInLoadEvent, SvgInLoadEventDetail } from './SvgIn';

// Loading the module twice (two bundles, HMR) must not throw.
if (!customElements.get('svg-in')) {
    customElements.define('svg-in', SvgIn);
}

declare global {
    interface HTMLElementTagNameMap {
        'svg-in': SvgIn;
    }
}
