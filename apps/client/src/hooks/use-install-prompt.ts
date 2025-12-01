import { useEffect, useState, useCallback } from 'react'

// Chrome-specific BeforeInstallPrompt event typing
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function useInstallPrompt() {
  const [supportsInstall, setSupportsInstall] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [isInstalled, setIsInstalled] = useState(false)

  // Detect installed state
  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        // iOS Safari old heuristic
        (navigator as any).standalone === true
      setIsInstalled(standalone)
    }
    checkInstalled()

    const onAppInstalled = () => setIsInstalled(true)
    window.addEventListener('appinstalled', onAppInstalled)

    const mq = window.matchMedia?.('(display-mode: standalone)')
    const onChange = () => checkInstalled()
    mq?.addEventListener?.('change', onChange)

    return () => {
      window.removeEventListener('appinstalled', onAppInstalled)
      mq?.removeEventListener?.('change', onChange)
    }
  }, [])

  // Capture beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setSupportsInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler as any)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return
    await deferred.prompt()
    try {
      await deferred.userChoice
      // After user choice, clear our stored prompt and hide the button
      setDeferred(null)
      setSupportsInstall(false)
    } catch {
      setDeferred(null)
      setSupportsInstall(false)
    }
  }, [deferred])

  return {
    isInstalled,
    supportsInstall: supportsInstall && !isInstalled,
    promptInstall,
  }
}
