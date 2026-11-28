import type React from 'react';
import { SvgInContext, type SvgInDefaults } from './SvgInContext';

/**
 * Shared defaults for every client <SvgIn /> beneath it. Props on a given <SvgIn /> win.
 * Client only: the async server <SvgIn /> cannot read context.
 */
export const SvgInProvider: React.FC<React.PropsWithChildren<SvgInDefaults>> = ({ children, ...defaults }) => (
    <SvgInContext.Provider value={defaults}>{children}</SvgInContext.Provider>
);
