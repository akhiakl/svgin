import { SvgIn } from './SvgIn';

export { SvgIn } from './SvgIn';
export type { SvgInErrorEvent, SvgInErrorEventDetail, SvgInLoadEvent, SvgInLoadEventDetail } from './SvgIn';

// Guards against double-registration: a page that loads this module more
// than once (two separate bundles, an HMR reload during development, a
// duplicate <script> tag) would otherwise hit `customElements.define`'s own
// "already defined" DOMException on the second call.
if (!customElements.get('svg-in')) {
    customElements.define('svg-in', SvgIn);
}

declare global {
    interface HTMLElementTagNameMap {
        'svg-in': SvgIn;
    }
}
