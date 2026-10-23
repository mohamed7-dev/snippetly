import { useCallback, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

export type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type InstallPromptState = {
    deferredPrompt: BeforeInstallPromptEvent | null;
    isInstalled: boolean;
};

const serverSnapshot: InstallPromptState = {
    deferredPrompt: null,
    isInstalled: false,
};

function isAppInstalled() {
    return (
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
}

let state: InstallPromptState =
    typeof window === 'undefined' ? serverSnapshot : { deferredPrompt: null, isInstalled: isAppInstalled() };

const subscribers = new Set<() => void>();

function notifySubscribers() {
    subscribers.forEach(subscriber => subscriber());
}

function updateState(nextState: InstallPromptState) {
    state = nextState;
    notifySubscribers();
}

function subscribe(subscriber: () => void) {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        updateState({
            ...state,
            deferredPrompt: event as BeforeInstallPromptEvent,
        });
    });

    window.addEventListener('appinstalled', () => {
        updateState({ deferredPrompt: null, isInstalled: true });
    });

    const displayMode = window.matchMedia?.('(display-mode: standalone)');
    displayMode?.addEventListener('change', event => {
        updateState({ ...state, isInstalled: event.matches });
    });
}

export function useInstallPrompt() {
    const { deferredPrompt, isInstalled } = useSyncExternalStore(
        subscribe,
        () => state,
        () => serverSnapshot,
    );

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            updateState({ ...state, deferredPrompt: null });
        } catch (error) {
            updateState({ ...state, deferredPrompt: null });
            toast.error(
                error instanceof Error
                    ? `Could not open the install prompt: ${error.message}`
                    : 'Could not open the install prompt. Please try again.',
            );
        }
    }, [deferredPrompt]);

    return {
        isInstalled,
        supportsInstall: deferredPrompt !== null && !isInstalled,
        promptInstall,
    };
}
