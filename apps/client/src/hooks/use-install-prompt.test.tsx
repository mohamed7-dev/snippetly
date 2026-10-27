import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type BeforeInstallPromptEvent, useInstallPrompt } from './use-install-prompt';

describe('useInstallPrompt', () => {
    it('keeps the install prompt available after a button unmounts and remounts', () => {
        const firstMount = renderHook(() => useInstallPrompt());
        const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
            prompt: vi.fn().mockResolvedValue(undefined),
            userChoice: Promise.resolve({ outcome: 'dismissed' as const, platform: 'test' }),
        }) as BeforeInstallPromptEvent;

        act(() => {
            window.dispatchEvent(event);
        });

        expect(firstMount.result.current.supportsInstall).toBe(true);
        expect(event.defaultPrevented).toBe(true);
        firstMount.unmount();

        const secondMount = renderHook(() => useInstallPrompt());
        expect(secondMount.result.current.supportsInstall).toBe(true);
        secondMount.unmount();
    });
});
