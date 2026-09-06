import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Sitewide default - every route inherits this unless it defines its own
// opengraph-image. One branded image is enough for a demo site this small;
// per-route images would be real duplication for no reader-facing gain.
export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    backgroundColor: '#100d08',
                    color: '#f6f1eb',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 96,
                        height: 96,
                        borderRadius: 20,
                        backgroundColor: '#fbae02',
                        marginBottom: 48,
                    }}
                >
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="#100d08" strokeWidth="2" />
                        <path
                            d="M8 12l2.5 2.5L16 9"
                            stroke="#100d08"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>{SITE_NAME}</div>
                <div style={{ display: 'flex', fontSize: 32, color: '#9f978b', marginTop: 20, maxWidth: 900 }}>
                    Fetch an SVG, render it as a real React element, sanitized by default.
                </div>
            </div>
        ),
        { ...size }
    );
}
