interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallState {
  /** The browser offered a native install prompt (Chromium). */
  canPrompt: boolean
  installed: boolean
  /** Manual instructions are shown when no native prompt is available (iOS, Firefox…). */
  guideOpen: boolean
  isIos: boolean
}

const STANDALONE_QUERY = '(display-mode: standalone)'

function detectIos(): boolean {
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
}

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return window.matchMedia(STANDALONE_QUERY).matches || iosStandalone
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
let state: InstallState = { canPrompt: false, installed: isStandalone(), guideOpen: false, isIos: detectIos() }
const listeners = new Set<() => void>()

function setState(patch: Partial<InstallState>) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

/** Must run before React renders: `beforeinstallprompt` can fire right after load. */
export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    setState({ canPrompt: true })
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    setState({ installed: true, canPrompt: false, guideOpen: false })
  })
  window.matchMedia(STANDALONE_QUERY).addEventListener('change', (event) => {
    setState({ installed: event.matches })
  })
}

export const installStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => state,
}

export async function requestInstall() {
  if (!deferredPrompt) {
    setState({ guideOpen: true })
    return
  }
  const prompt = deferredPrompt
  deferredPrompt = null
  setState({ canPrompt: false })
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  if (outcome === 'accepted') setState({ installed: true })
}

export function closeInstallGuide() {
  setState({ guideOpen: false })
}
