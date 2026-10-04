const HOUR = 60 * 60 * 1000

/**
 * Keeps installed visitors on the latest build: the service worker activates immediately
 * (skipWaiting), and the page reloads once as soon as it takes control.
 */
export function watchForUpdates() {
  if (!('serviceWorker' in navigator)) return

  // On the very first visit the worker claims the page — that is not a new version.
  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    location.reload()
  })

  const checkForUpdate = () => {
    navigator.serviceWorker.getRegistration().then((registration) => registration?.update())
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkForUpdate()
  })
  setInterval(checkForUpdate, HOUR)
}
