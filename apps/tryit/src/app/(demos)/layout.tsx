import type { ReactNode } from 'react';
import { SiteSidebar } from '@/components/site-sidebar';

// Route group: demo pages keep top-level paths while sharing this layout.
export default function DemosLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
                {/* Hidden below lg: the mobile hamburger drawer (SiteNav)
                    renders this exact same SiteSidebar already - showing it
                    inline here too on small screens just pushed the real
                    page content down behind a redundant copy of the same nav. */}
                <div className="hidden lg:block">
                    <SiteSidebar />
                </div>
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}
