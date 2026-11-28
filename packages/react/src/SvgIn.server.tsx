import type { SvgInProps } from './types';
import { fetchAndSanitizeSvg } from 'svgin-core/fetchAndSanitizeSvgServer';
import { sanitizeSvgString } from 'svgin-core/sanitizeSvgStringServer';
import { SvgInComponent } from './SvgInComponent';
import { nextInstanceId } from 'svgin-core/instanceId';

export async function SvgIn(props: SvgInProps) {
    // Client-only props, pulled out so they are not spread onto the <svg>.
    const { src, svg: svgProp, sanitizeFn, disableSanitization, fetchOptions, onError, onMount, loadingFallback, loading, ...rest } = props;
    void onMount;
    void loadingFallback;
    void loading;
    try {
        let svg: string;
        if (svgProp !== undefined) {
            svg = await sanitizeSvgString(svgProp, { sanitizeFn, disableSanitization });
        } else if (src !== undefined) {
            svg = await fetchAndSanitizeSvg(src, { sanitizeFn, disableSanitization, fetchOptions });
        } else {
            throw new Error('<SvgIn /> requires either `src` or `svg`.');
        }
        return <SvgInComponent svg={svg} idSuffix={nextInstanceId()} {...rest} />;
    } catch (error) {
        onError?.(error as Error);
        return props.fallback ?? null;
    }
}
