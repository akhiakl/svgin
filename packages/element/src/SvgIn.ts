import { fetchAndSanitizeSvg, releaseFetchAndSanitizeSvg } from 'svgin-core/fetchAndSanitizeSvgClient';
import { sanitizeSvgString } from 'svgin-core/sanitizeSvgStringClient';
import { buildSvgMarkup } from 'svgin-core/buildSvgMarkup';
import { nextInstanceId } from 'svgin-core/instanceId';

/** Changing one of these restarts the fetch/sanitize cycle. */
const FETCH_ATTRS = new Set(['src', 'svg', 'disable-sanitization']);

/** Changing one of these re-renders without refetching. */
const RENDER_ATTRS = new Set(['width', 'height', 'fill', 'class', 'aria-label', 'svg-title', 'svg-description']);

const OBSERVED_ATTRS = [...FETCH_ATTRS, 'loading', ...RENDER_ATTRS] as const;

export interface SvgInLoadEventDetail {
    /** The rendered, sanitized `<svg>` element now inlined into `<svg-in>`. */
    svg: SVGSVGElement;
}

export interface SvgInErrorEventDetail {
    /** The fetch or sanitization failure. */
    error: Error;
}

/** Fired once the fetched/sanitized SVG has been inlined into the element. */
export type SvgInLoadEvent = CustomEvent<SvgInLoadEventDetail>;
/** Fired when the fetch or sanitization fails. */
export type SvgInErrorEvent = CustomEvent<SvgInErrorEventDetail>;

/**
 * `<svg-in>`: fetches, sanitizes and inlines an SVG into its light DOM, so page CSS can style it.
 * `sanitizeFn` and `fetchOptions` are JS properties; results arrive as `svg-in-load` and
 * `svg-in-error` events. See the README for the full attribute reference.
 */
export class SvgIn extends HTMLElement {
    static get observedAttributes(): readonly string[] {
        return OBSERVED_ATTRS;
    }

    #sanitizeFnValue: ((svg: string) => Promise<string>) | undefined;
    #fetchOptionsValue: RequestInit | undefined;
    // null means not resolved yet; '' is a valid result.
    #sanitized: string | null = null;
    #error: Error | null = null;
    // Per element, so ids stay stable across re-renders.
    readonly #idSuffix = nextInstanceId();
    #connected = false;
    // Lets a superseded in-flight attempt detect it is stale.
    #loadSeq = 0;
    #observer: IntersectionObserver | null = null;
    // The args the current src fetch was acquired with; null when nothing to release.
    #released: {
        src: string;
        sanitizeFn: ((svg: string) => Promise<string>) | undefined;
        disableSanitization: boolean;
        fetchOptions: RequestInit | undefined;
    } | null = null;

    get sanitizeFn(): ((svg: string) => Promise<string>) | undefined {
        return this.#sanitizeFnValue;
    }

    set sanitizeFn(fn: ((svg: string) => Promise<string>) | undefined) {
        if (fn === this.#sanitizeFnValue) return;
        this.#sanitizeFnValue = fn;
        if (this.#connected) this.#restart();
    }

    get fetchOptions(): RequestInit | undefined {
        return this.#fetchOptionsValue;
    }

    set fetchOptions(options: RequestInit | undefined) {
        if (options === this.#fetchOptionsValue) return;
        this.#fetchOptionsValue = options;
        if (this.#connected) this.#restart();
    }

    connectedCallback(): void {
        this.#connected = true;
        this.#restart();
    }

    disconnectedCallback(): void {
        this.#connected = false;
        this.#teardownObserver();
        this.#release();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue === newValue) return;
        // Parse-time attributes fire before connect; connectedCallback reads them all anyway.
        if (!this.#connected) return;
        if (FETCH_ATTRS.has(name)) {
            this.#restart();
        } else if (name === 'loading') {
            this.#handleLoadingChange();
        } else {
            this.#renderCurrent();
        }
    }

    // Only matters while still deferring: any change then means "load now".
    #handleLoadingChange(): void {
        if (!this.#observer) return;
        this.#teardownObserver();
        void this.#beginLoad();
    }

    #restart(): void {
        this.#release();
        this.#teardownObserver();
        this.#loadSeq++;
        this.#sanitized = null;
        this.#error = null;
        this.#renderCurrent();

        const svgAttr = this.getAttribute('svg');
        const loadingAttr = this.getAttribute('loading');
        const canDefer = loadingAttr === 'lazy' && svgAttr === null && typeof IntersectionObserver !== 'undefined';
        if (canDefer) {
            this.#observeForLazyLoad();
        } else {
            void this.#beginLoad();
        }
    }

    #observeForLazyLoad(): void {
        this.#observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    this.#teardownObserver();
                    void this.#beginLoad();
                }
            },
            { rootMargin: '200px' }
        );
        this.#observer.observe(this);
    }

    #teardownObserver(): void {
        this.#observer?.disconnect();
        this.#observer = null;
    }

    async #beginLoad(): Promise<void> {
        const seq = this.#loadSeq;
        const svgAttr = this.getAttribute('svg');
        const srcAttr = this.getAttribute('src');
        const disableSanitization = this.hasAttribute('disable-sanitization');
        const sanitizeFn = this.#sanitizeFnValue;
        const fetchOptions = this.#fetchOptionsValue;

        // Yield first, so a listener attached right after append() still sees the events.
        await Promise.resolve();
        // Disconnected during the yield: bail before taking a fetch share nobody releases.
        if (!this.#connected || seq !== this.#loadSeq) return;

        try {
            let sanitized: string;
            if (svgAttr !== null) {
                sanitized = await sanitizeSvgString(svgAttr, { sanitizeFn, disableSanitization });
            } else if (srcAttr !== null) {
                this.#released = { src: srcAttr, sanitizeFn, disableSanitization, fetchOptions };
                sanitized = await fetchAndSanitizeSvg(srcAttr, { sanitizeFn, disableSanitization, fetchOptions });
            } else {
                throw new Error('<svg-in> requires a `src` or `svg` attribute.');
            }
            if (!this.#connected || seq !== this.#loadSeq) return;
            this.#sanitized = sanitized;
            this.#renderCurrent();
            const rendered = this.querySelector('svg');
            if (rendered) this.#dispatch('svg-in-load', { svg: rendered });
        } catch (e) {
            if (!this.#connected || seq !== this.#loadSeq) return;
            const err = e instanceof Error ? e : new Error(String(e));
            this.#error = err;
            this.#renderCurrent();
            this.#dispatch('svg-in-error', { error: err });
        }
    }

    #release(): void {
        if (!this.#released) return;
        releaseFetchAndSanitizeSvg(this.#released.src, {
            sanitizeFn: this.#released.sanitizeFn,
            disableSanitization: this.#released.disableSanitization,
            fetchOptions: this.#released.fetchOptions,
        });
        this.#released = null;
    }

    #dispatch(type: 'svg-in-load', detail: SvgInLoadEventDetail): void;
    #dispatch(type: 'svg-in-error', detail: SvgInErrorEventDetail): void;
    #dispatch(type: string, detail: SvgInLoadEventDetail | SvgInErrorEventDetail): void {
        this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
    }

    #renderCurrent(): void {
        if (this.#error !== null) {
            // No fallback attribute: consumers react to `svg-in-error`.
            this.replaceChildren();
            return;
        }
        if (this.#sanitized === null) {
            this.#renderPlaceholder();
            return;
        }
        this.#renderResolved(this.#sanitized);
    }

    #renderPlaceholder(): void {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.#forwardPresentationalAttrs(svg);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('tabindex', '-1');
        this.replaceChildren(svg);
    }

    #presentationalAttrs(): { width?: string; height?: string; fill?: string; class?: string; ariaLabel?: string } {
        return {
            width: this.getAttribute('width') ?? undefined,
            height: this.getAttribute('height') ?? undefined,
            fill: this.getAttribute('fill') ?? undefined,
            class: this.getAttribute('class') ?? undefined,
            ariaLabel: this.getAttribute('aria-label') ?? undefined,
        };
    }

    #forwardPresentationalAttrs(svg: SVGElement): void {
        const { width, height, fill, class: className } = this.#presentationalAttrs();
        if (width !== undefined) svg.setAttribute('width', width);
        if (height !== undefined) svg.setAttribute('height', height);
        if (fill !== undefined) svg.setAttribute('fill', fill);
        if (className !== undefined) svg.setAttribute('class', className);
    }

    #renderResolved(sanitized: string): void {
        const { width, height, fill, class: className, ariaLabel } = this.#presentationalAttrs();
        const markup = buildSvgMarkup(sanitized, {
            title: this.getAttribute('svg-title') ?? undefined,
            description: this.getAttribute('svg-description') ?? undefined,
            idSuffix: this.#idSuffix,
            attrs: { width, height, fill, class: className, 'aria-label': ariaLabel },
        });
        if (markup === null) {
            this.replaceChildren();
            return;
        }
        // Safe: `sanitized` came through the sanitizer; buildSvgMarkup escapes what it adds.
        this.innerHTML = markup;
    }
}
