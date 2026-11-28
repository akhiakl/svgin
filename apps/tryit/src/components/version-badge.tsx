import { Badge } from '@/components/ui/badge';
import { getSvginReactVersion } from '@/lib/svgin-react-version';

// Async so the registry fetch can sit behind a Suspense boundary.
export async function VersionBadge() {
    const version = await getSvginReactVersion();
    return (
        <Badge variant="outline" className="mb-4">
            @svgin/react {version}
        </Badge>
    );
}

export function VersionBadgeFallback() {
    return (
        <Badge variant="outline" className="mb-4 animate-pulse">
            <span aria-hidden className="text-transparent">
                @svgin/react 0.0.0
            </span>
            <span className="sr-only">Loading @svgin/react version</span>
        </Badge>
    );
}
