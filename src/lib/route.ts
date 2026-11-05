import { useSyncExternalStore } from 'react'

export type Route = 'home' | 'booking'

export const BOOKING_HASH = '#booking'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function currentRoute(): Route {
  return location.hash === BOOKING_HASH ? 'booking' : 'home'
}

/** The booking form lives behind #booking, so it gets its own screen and the back button works. */
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, currentRoute, () => 'home')
}

export function goHome() {
  // Replacing the hash keeps one history entry per visit to the form.
  history.pushState(null, '', location.pathname + location.search)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
