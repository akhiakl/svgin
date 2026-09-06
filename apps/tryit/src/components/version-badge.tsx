import { Badge } from '@/components/ui/badge';
import { getSvginReactVersion } from '@/lib/svgin-react-version';

// Async server component so the npm registry fetch (see
// lib/svgin-react-version.ts) can be deferred behind a Suspense boundary
// instead of blocking the rest of the page.
export async function VersionBadge() {
    const version = await getSvginReactVersion();
    return (
        <Badge variant="outline" className="mb-4">
            svgin-react {version}
        </Badge>
    );
}

export function VersionBadgeFallback() {
    return (
        <Badge variant="outline" className="mb-4 animate-pulse">
            <span aria-hidden className="text-transparent">
                svgin-react 0.0.0
            </span>
            <span className="sr-only">Loading svgin-react version</span>
        </Badge>
    );
}
