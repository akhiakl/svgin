// Standalone entry point for <SvgInSuspense /> - its own physical tsup
// output/budget, so it costs nothing to consumers of 'svgin-react/client'
// who don't use it. Not re-exported from client.ts: import it from here,
// `import { SvgInSuspense } from 'svgin-react/suspense'`, not from
// 'svgin-react/client'.
export { SvgInSuspense } from './SvgIn.suspense.client';
