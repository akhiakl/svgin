import { SvgIn } from '@svgin/react/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
    title: 'Server component',
    description:
        "The async server <SvgIn /> from @svgin/react/server fetches and sanitizes an SVG entirely on the server, with zero client JS shipped for it.",
    path: '/rsc',
});

// External URL: Vercel Authentication blocks a server-side fetch of this deployment's own origin.
const ICON_URL = 'https://raw.githubusercontent.com/feathericons/feather/master/icons/alert-triangle.svg';

export default async function RscPage() {
    return (
        <article>
            <h1 className="text-2xl font-semibold tracking-tight">Server component</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                The async server <code className="font-mono text-sm">&lt;SvgIn /&gt;</code> from{' '}
                <code className="font-mono text-sm">@svgin/react/server</code> fetches and sanitizes an SVG entirely on
                the server. No sanitizer or fetch code ships to the browser for this. Inspect the page source and
                there is no client bundle involved in producing this markup.
            </p>

            <Card className="mt-8 max-w-md">
                <CardHeader>
                    <CardTitle>Server-fetched icon</CardTitle>
                    <CardDescription className="break-all font-mono text-xs">{ICON_URL}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center rounded-md border bg-muted/30 p-10">
                    <SvgIn
                        src={ICON_URL}
                        width={64}
                        height={64}
                        ariaLabel="Server-fetched demo icon"
                        fallback={<p className="text-sm text-destructive">Server fetch failed.</p>}
                    />
                </CardContent>
            </Card>
        </article>
    );
}
