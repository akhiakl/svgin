import { createContext } from 'react';
import type { SvgInProps } from './types';

// <SvgInSuspense /> does not read this context, so it stays free of the Provider module.
export type SvgInDefaults = Pick<
    SvgInProps,
    | 'sanitizeFn'
    | 'disableSanitization'
    | 'fetchOptions'
    | 'fallback'
    | 'loadingFallback'
    | 'className'
    | 'onError'
    | 'loading'
>;

export const SvgInContext = createContext<SvgInDefaults>({});
