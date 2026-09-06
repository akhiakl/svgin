export const PACKAGE_MANAGERS = [
    { id: 'pnpm', label: 'pnpm', command: 'pnpm add' },
    { id: 'npm', label: 'npm', command: 'npm install' },
    { id: 'yarn', label: 'yarn', command: 'yarn add' },
    { id: 'bun', label: 'bun', command: 'bun add' },
] as const;

export type PackageManagerId = (typeof PACKAGE_MANAGERS)[number]['id'];
