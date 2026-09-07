import { fetchAndSanitizeSvg, releaseFetchAndSanitizeSvg } from 'svgin-core/fetchAndSanitizeSvgClient';
import { sanitizeSvgString } from 'svgin-core/sanitizeSvgStringClient';
import { buildSvgMarkup } from 'svgin-core/buildSvgMarkup';
import { nextInstanceId } from 'svgin-core/instanceId';

/**
 * Attributes that identify *what* to render (a genuine change to any of
 * these requires a fresh fetch/sanitize, the custom-element equivalent of a
 * changed React effect dependency) - mirrors SvgIn.client.tsx's fetch
 * effect's own dependency list (`src`, `svgProp`, `disableSanitization`,
 * `hasSanitizeFn`, `hasFetchOptions`). `sanitizeFn`/`fetchOptions` aren't
 * attributes at all (functions/objects can't be serialized to a DOM
 * attribute string) - they're plain JS properties instead, see their
 * getter/setter pair below.
 */
const FETCH_ATTRS = new Set(['src', 'svg', 'disable-sanitization']);

/**
 * Attributes that only affect how an *already-resolved* (or still-pending)
 * result is presented - changing one of these re-renders from whatever
 * `#sanitized`/`#error` already holds, without touching the network or
 * DOMPurify again. Mirrors the props SvgInComponent applies straight to the
 * rendered `<svg>` (`width`/`height`/`fill`/`className`/`ariaLabel`) plus
 * `title`/`description` (renamed `svg-title`/`svg-description` here - see
 * the class doc comment for why).
 */
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
 * `<svg-in>`: a framework-agnostic, vanilla native Custom Element
 * (`class SvgIn extends HTMLElement`, no Lit, no Stencil - see the
 * svgin-monorepo and web-component-design skills) that securely fetches and
 * inlines an SVG, sanitized by default via `svgin-core`'s shared
 * fetch/sanitize/cache internals - the same ones `<SvgIn />` in
 * `svgin-react` is built on.
 *
 * Renders into **light DOM**, not a shadow root: the sanitized `<svg>` is
 * inlined as a direct child of `<svg-in>` itself, so ordinary page CSS can
 * style it (`svg-in svg { fill: ... }`, or forwarding `fill`/`class`
 * straight onto it - see below) the same way it would a hand-written inline
 * `<svg>`. This is a deliberate, explicit choice, not an oversight: it
 * mirrors `<SvgIn />`'s own default (light DOM), not `<SvgInShadow />`'s
 * shadow-root encapsulation. `svgin-react` offers a *separate* component for
 * the shadow-DOM case because a shadow root needs different, imperative
 * DOM-writing code that would otherwise get bundled into every consumer of
 * the plain component; `<svg-in>` doesn't have that tree-shaking concern
 * (there is nothing else to conditionally bundle away), but it still only
 * ships the light-DOM behavior for this first implementation - full shadow
 * DOM support (e.g. a `shadow` attribute) is left for a follow-up once
 * there's a real consumer need for it.
 *
 * Attribute API (every DOM attribute is a string - see each attribute below
 * for how it's read):
 * - `src`: URL to fetch. Ignored if `svg` is also present.
 * - `svg`: raw SVG markup already in hand - sanitized and rendered
 *   directly, skipping the fetch step. Takes precedence over `src`.
 * - `width` / `height` / `fill`: forwarded verbatim (as strings, no numeric
 *   coercion - SVG attributes accept unitless numbers as strings anyway) to
 *   the rendered `<svg>`, both for the loading placeholder and the resolved
 *   result.
 * - `class`: the *native* DOM attribute already applies to the `<svg-in>`
 *   host element regardless of anything this class does; it is additionally
 *   forwarded onto the rendered inner `<svg>` (mirrors `<SvgIn
 *   className={...} />` applying `className` to the rendered `<svg>`, not
 *   just some wrapper), so page CSS can target the icon itself either way.
 * - `aria-label`: forwarded to the rendered `<svg>`. An explicit
 *   `aria-label` disables the auto-wired `aria-labelledby` this element
 *   otherwise sets when `svg-title` is present (same precedence rule as
 *   `buildSvgMarkup`/`SvgInComponent`).
 * - `svg-title` / `svg-description`: injects a `<title>`/`<desc>` into the
 *   rendered SVG (accessible name/description) - deliberately *not* named
 *   `title`/`description`: a plain `title` attribute is a global HTML
 *   attribute that every browser already gives special meaning (a hover
 *   tooltip) on *any* element, `<svg-in>` included, so reusing that name
 *   here would silently conflict with that native behavior instead of
 *   cleanly mapping to `SvgInProps.title`.
 * - `disable-sanitization`: boolean attribute (presence, not value - matches
 *   the convention `disabled`/`hidden`/etc. use). Skips DOMPurify entirely.
 *   Only use this for markup you already trust.
 * - `loading`: `'eager'` (default) or `'lazy'` - `'lazy'` defers the
 *   fetch/sanitize until this element scrolls near the viewport, via
 *   `IntersectionObserver` (same `rootMargin: '200px'` `<SvgIn loading="lazy"
 *   />` uses). Falls back to eager loading when `IntersectionObserver` isn't
 *   available, or when `svg` is set (there's nothing to fetch).
 *
 * `sanitizeFn` and `fetchOptions` are **JS properties, not attributes**
 * (`el.sanitizeFn = fn`, `el.fetchOptions = { headers: {...} }`) - a
 * function or an arbitrary request-init object has no meaningful string
 * attribute representation. Setting either while connected restarts the
 * fetch/sanitize cycle, same as changing `src`.
 *
 * There is no `onError`/`onMount` callback property (unlike
 * `SvgInProps.onError`/`onMount`) - a plain custom element has no prop
 * channel a callback could hang off of the way a React component does.
 * Instead, this dispatches two bubbling, composed `CustomEvent`s:
 * - `svg-in-load` (`detail: { svg: SVGSVGElement }`) once the sanitized SVG
 *   is inlined.
 * - `svg-in-error` (`detail: { error: Error }`) when the fetch or
 *   sanitization fails - nothing is rendered in this case (any previous
 *   content, including the loading placeholder, is cleared); a consumer
 *   that wants a visible fallback should listen for this event and react
 *   (e.g. set different attributes, or replace the element).
 *
 * `attributeChangedCallback` reacts to `src`/`svg`/`disable-sanitization`
 * changes by restarting the whole fetch/sanitize cycle (mirrors `<SvgIn
 * />`'s fetch effect dependency array), and to the purely-presentational
 * attributes above by re-rendering the already-resolved (or still-pending)
 * result without touching the network again. `disconnectedCallback` releases
 * any in-flight fetch via `releaseFetchAndSanitizeSvg` (same reference-
 * counted cache-release pattern `<SvgIn />`'s effect cleanup uses) and tears
 * down any active `IntersectionObserver`. Reconnecting a previously
 * disconnected `<svg-in>` (e.g. after being moved in the DOM) restarts the
 * load cycle from scratch - the same semantics a real React unmount+remount
 * would have (a fresh mount always re-runs its effects; the shared
 * `svgCache` is what keeps that fast rather than a genuine network refetch).
 */
export class SvgIn extends HTMLElement {
    static get observedAttributes(): readonly string[] {
        return OBSERVED_ATTRS;
    }

    #sanitizeFnValue: ((svg: string) => Promise<string>) | undefined;
    #fetchOptionsValue: RequestInit | undefined;
    // null is the explicit "nothing resolved yet" sentinel, distinct from a
    // sanitized-down-to-empty-string ('') result, which is a real, valid,
    // already-resolved value - see the svgin-monorepo skill's "null-vs-
    // empty-string sentinel" gotcha. Every read of this field below checks
    // `=== null`/`!== null`, never plain truthiness.
    #sanitized: string | null = null;
    #error: Error | null = null;
    // Stable for this element instance's whole lifetime (including across a
    // disconnect/reconnect) so ids inside the rendered SVG don't change (and
    // force a needless DOM update) on every re-render - same reasoning as
    // SvgIn.client.tsx's idSuffix ref.
    readonly #idSuffix = nextInstanceId();
    #connected = false;
    // Incremented on every fresh load attempt so a stale, still-in-flight
    // promise from a *previous* attempt (superseded by a newer attribute
    // change, or by a disconnect) can recognize it's no longer relevant and
    // skip updating state - the custom-element equivalent of the `mounted`
    // flag SvgIn.client.tsx's effect closure captures.
    #loadSeq = 0;
    #observer: IntersectionObserver | null = null;
    // Exactly the arguments the currently-in-flight (or last-completed) `src`
    // fetch was acquired with, so #release can release that same share -
    // null whenever the current load used `svg` instead (nothing was ever
    // fetched to release) or no load has started yet.
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
        // Attributes present at parse time fire this callback before
        // connectedCallback ever runs; connectedCallback's own #restart()
        // already reads every current attribute value fresh, so reacting
        // here too would just duplicate that first load.
        if (!this.#connected) return;
        if (FETCH_ATTRS.has(name)) {
            this.#restart();
        } else if (name === 'loading') {
            this.#handleLoadingChange();
        } else {
            // Every name reaching here is guaranteed to be in RENDER_ATTRS -
            // OBSERVED_ATTRS is built from exactly FETCH_ATTRS, 'loading',
            // and RENDER_ATTRS, with nothing else ever observed - so there is
            // no fourth case to branch on.
            this.#renderCurrent();
        }
    }

    /**
     * `loading` deliberately isn't a full #restart() trigger: mirrors
     * `<SvgIn />`, where `loading`/`loadingFallback` aren't in the fetch
     * effect's own dependency array - only the *derived* `shouldLoad` is,
     * and it only ever flips from false to true once. So flipping `loading`
     * after a load has already started (or finished) does nothing here
     * either; it only matters while still deferring (an active observer).
     *
     * No need to inspect the new value here: the outer `oldValue ===
     * newValue` guard in attributeChangedCallback already means this only
     * runs on a genuine change, and `#observer` being non-null means the
     * *previous* value was `'lazy'` - so the new value can never itself be
     * `'lazy'` again when this actually runs. Any change while deferring
     * therefore always means "stop deferring, load now".
     */
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
        // Same canDefer rule as SvgIn.client.tsx: only defer when there's
        // actually something to fetch (svg not given) and the platform can
        // tell us when to start (IntersectionObserver present). Checked live
        // rather than cached, so a polyfill installed later is still picked up.
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

        // Always yields to a microtask before doing anything else, even on
        // the "neither src nor svg given" path below, which would otherwise
        // throw synchronously. #restart() calls this from
        // connectedCallback, and a consumer appending this element and then
        // immediately attaching a `svg-in-error`/`svg-in-load` listener
        // (`el.addEventListener(...)` right after `document.body.append(el)`
        // - the natural way to wire one up) must always still be listening
        // in time, regardless of whether this attempt ever reaches a real
        // `await` of its own.
        await Promise.resolve();
        // A disconnect (or a newer #restart) landing in this microtask gap,
        // before any real fetch/sanitize call has even started, must not
        // then go on to acquire a share of a fetch nothing will ever
        // release - bail out before `this.#released` (or a real network
        // call) is ever created for an attempt that's already moot.
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
            // A superseded attempt (this element disconnected, or a newer
            // attribute/property change started a fresh #restart) must not
            // clobber whatever state the current attempt already put in
            // place - same guard SvgIn.client.tsx's effect closure gets for
            // free from its `mounted` variable.
            if (!this.#connected || seq !== this.#loadSeq) return;
            this.#sanitized = sanitized;
            this.#renderCurrent();
            const rendered = this.querySelector('svg');
            // Defensive only: #renderCurrent() with a non-null #sanitized
            // always goes through #renderResolved, which either assigns a
            // well-formed `<svg>...</svg>` string via innerHTML or clears
            // the element entirely (a malformed source) - the querySelector
            // immediately after always finds that same element in practice
            // when #sanitized is well-formed. When it's malformed, nothing
            // is rendered and no `svg-in-load` should fire.
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
            // No `fallback` attribute equivalent (an arbitrary ReactNode has
            // no attribute-string representation) - clearing content and
            // leaving the `svg-in-error` event as the hook for a consumer to
            // react (add their own fallback children, restyle the element,
            // etc.) is the documented behavior here.
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

    #forwardPresentationalAttrs(svg: SVGElement): void {
        const width = this.getAttribute('width');
        const height = this.getAttribute('height');
        const fill = this.getAttribute('fill');
        const className = this.getAttribute('class');
        if (width !== null) svg.setAttribute('width', width);
        if (height !== null) svg.setAttribute('height', height);
        if (fill !== null) svg.setAttribute('fill', fill);
        if (className !== null) svg.setAttribute('class', className);
    }

    #renderResolved(sanitized: string): void {
        const markup = buildSvgMarkup(sanitized, {
            title: this.getAttribute('svg-title') ?? undefined,
            description: this.getAttribute('svg-description') ?? undefined,
            idSuffix: this.#idSuffix,
            attrs: {
                width: this.getAttribute('width') ?? undefined,
                height: this.getAttribute('height') ?? undefined,
                fill: this.getAttribute('fill') ?? undefined,
                class: this.getAttribute('class') ?? undefined,
                'aria-label': this.getAttribute('aria-label') ?? undefined,
            },
        });
        if (markup === null) {
            // Not a well-formed `<svg>...</svg>` string (e.g. `disable-
            // sanitization` was used with genuinely malformed input) -
            // mirrors extractSvgInner/buildSvgMarkup's own null contract.
            this.replaceChildren();
            return;
        }
        // Safe: `sanitized` was produced by sanitizeSvgString/
        // fetchAndSanitizeSvg (DOMPurify-sanitized, unless the consumer
        // explicitly opted out via `disable-sanitization`) - buildSvgMarkup
        // only HTML-escapes the consumer-supplied title/description/attrs it
        // injects around that content, mirroring SvgInShadow's identical use
        // of buildSvgMarkup + innerHTML. This never assigns raw, un-passed-
        // through-sanitization input here.
        this.innerHTML = markup;
    }
}
