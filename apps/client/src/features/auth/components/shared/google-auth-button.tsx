import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useAuthenticateDeveloper } from '../../hooks/use-authenticate-developer';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleCredentialResponse {
    credential: string;
}

interface GoogleIdentityServices {
    accounts: {
        id: {
            initialize(options: {
                client_id: string;
                callback: (response: GoogleCredentialResponse) => void;
            }): void;
            renderButton(
                parent: HTMLElement,
                options: {
                    theme: 'outline';
                    shape: 'rect';
                    size: 'large';
                    text: 'continue_with';
                },
            ): void;
            cancel(): void;
        };
    };
}

declare global {
    interface Window {
        google?: GoogleIdentityServices;
    }
}

export function GoogleAuthButton({ redirect }: { redirect?: string }) {
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const buttonContainerRef = React.useRef<HTMLDivElement>(null);

    const { mutateAsync } = useAuthenticateDeveloper({
        onSuccess: async () => {
            if (!redirect) {
                await navigate({
                    to: '/dashboard',
                    replace: true,
                });
            } else {
                await navigate({
                    href: redirect,
                    replace: true,
                });
            }
        },
    });

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            return;
        }

        let isMounted = true;
        const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
            window.google?.accounts.id.cancel();

            if (!response.credential) {
                console.error('Google authentication did not return an ID token');
                return;
            }

            setPending(true);
            try {
                await mutateAsync({ google: { token: response.credential } });
            } catch (error) {
                console.error('Google authentication error:', error);
            } finally {
                setPending(false);
            }
        };

        const initializeGoogleIdentityServices = () => {
            const buttonContainer = buttonContainerRef.current;
            if (!isMounted || !window.google || !buttonContainer) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(buttonContainer, {
                theme: 'outline',
                shape: 'rect',
                size: 'large',
                text: 'continue_with',
            });
        };

        if (window.google) {
            initializeGoogleIdentityServices();
        } else {
            const existingScript = document.querySelector<HTMLScriptElement>(
                'script[src="https://accounts.google.com/gsi/client"]',
            );
            if (existingScript) {
                existingScript.addEventListener('load', initializeGoogleIdentityServices, { once: true });
            } else {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.onload = initializeGoogleIdentityServices;
                script.onerror = () => console.error('Failed to load Google Identity Services');
                document.head.appendChild(script);
            }
        }

        return () => {
            isMounted = false;
            window.google?.accounts.id.cancel();
        };
    }, [mutateAsync]);

    if (!GOOGLE_CLIENT_ID) return null;

    return (
        <div className="mx-auto w-full" aria-busy={pending}>
            <div
                ref={buttonContainerRef}
                className={cn('w-full', pending ? 'pointer-events-none opacity-50' : undefined)}
            />
            {pending && (
                <p className="sr-only" role="status">
                    Authenticating with Google...
                </p>
            )}
        </div>
    );
}
