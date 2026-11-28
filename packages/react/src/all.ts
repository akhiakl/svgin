// Every client component plus core in one import. The async server component
// can't share a module with client components; import it from '@svgin/react/server'.
export * from './client';
export * from './core';
// Named, not `export *`: './core' already re-exports SvgInShadowProps.
export { SvgInSuspense } from './suspense';
export { SvgInShadow } from './shadow';
