import type { ReactNode } from 'react';

export const metadata = {
    title: 'svgin — try it',
    description: 'Live demo app for svgin-react and svgin-element.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
