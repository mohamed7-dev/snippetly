import type { SVGProps } from 'react';

export function CreateSnippetIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M6 3.75h8l4 4v8.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 16.25z" />
            <path d="M14 3.75v4h4M9 11l-1.5 1.5L9 14m4-3 1.5 1.5L13 14" />
            <path d="M19 17v5m-2.5-2.5h5" />
        </svg>
    );
}

export function CreateCollectionIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h5l2 2h7a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
            <path d="M17.5 14v5m-2.5-2.5h5" />
        </svg>
    );
}

export function AddSnippetToCollectionIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h5l2 2h7a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
            <path d="M8 11.5 6.5 13 8 14.5m3-3 1.5 1.5-1.5 1.5m6-1v5m-2.5-2.5h5" />
        </svg>
    );
}

export function UpdateSnippetIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h7L18 7.5v5" />
            <path d="M13.5 3v5H18M8 12h5m-5 3h3" />
            <path d="m14.5 17.5 5.8-5.8a1.4 1.4 0 0 1 2 2l-5.8 5.8-3.2 1z" />
        </svg>
    );
}

export function UpdateCollectionIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h5l2 2h7a1.5 1.5 0 0 1 1.5 1.5v2" />
            <path d="M3.5 7.5v9A1.5 1.5 0 0 0 5 18h7" />
            <path d="m14.5 17.5 5.8-5.8a1.4 1.4 0 0 1 2 2l-5.8 5.8-3.2 1z" />
        </svg>
    );
}

export function UpdateProfileIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M15 20H5.5A2.5 2.5 0 0 1 3 17.5v-.4a3.6 3.6 0 0 1 2.5-3.4l2.3-.7" />
            <circle cx="10" cy="7" r="4" />
            <path d="m15.5 16.5 5.8-5.8a1.4 1.4 0 0 1 2 2l-5.8 5.8-3.2 1z" />
        </svg>
    );
}
