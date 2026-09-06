import { SiteSidebar } from '@/components/site-sidebar';

export default function DocsLayout({ children }: LayoutProps<'/docs'>) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
                <SiteSidebar />
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}
