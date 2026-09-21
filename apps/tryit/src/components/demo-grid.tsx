import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface DemoGridItem {
    href: string;
    title: string;
    badge: string;
    description: string;
}

// Shared by the /react and /element landing pages - both render the same
// "Try it live" card grid shape for their own DEMO_GROUPS entry, so this is
// the one place that layout/markup lives rather than being duplicated per
// package (see the SOLID/YAGNI note in AGENTS.md: extracted once a second
// real usage showed up, not speculatively ahead of one).
export function DemoGrid({ demos }: { demos: readonly DemoGridItem[] }) {
    return (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
                <Link key={demo.href} href={demo.href} className="group">
                    <Card className="h-full transition-colors group-hover:border-foreground/30">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle>{demo.title}</CardTitle>
                                {/* RSC gets the primary accent rather than another neutral badge -
                                    it is the one demo that ships zero client JS, worth distinguishing
                                    at a glance rather than blending in with every "Client" badge. */}
                                <Badge variant={demo.badge === 'RSC' ? 'default' : 'secondary'}>{demo.badge}</Badge>
                            </div>
                            <CardDescription>{demo.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-sm font-medium text-foreground/80 group-hover:underline underline-offset-4">
                                Open demo →
                            </span>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
