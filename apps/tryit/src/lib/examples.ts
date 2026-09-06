export interface SvgExample {
    id: string;
    label: string;
    svg: string;
}

export const EXAMPLES: SvgExample[] = [
    {
        id: 'clean',
        label: 'Clean',
        svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
  <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
    },
    {
        id: 'gradient',
        label: 'Gradient + defs',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="80" height="80" rx="12" fill="url(#g)" />
</svg>`,
    },
    {
        id: 'malicious',
        label: 'Malicious',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" onload="alert('xss')">
  <script>alert('xss via script tag')</script>
  <rect width="100" height="100" fill="red" onclick="alert('xss via onclick')" />
  <image href="javascript:alert('xss via image href')" />
  <a xlink:href="javascript:alert('xss via xlink')"><text x="10" y="50">click me</text></a>
</svg>`,
    },
];
