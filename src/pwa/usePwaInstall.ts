import { useSyncExternalStore } from 'react'
import { closeInstallGuide, installStore, requestInstall } from './installStore'

export function usePwaInstall() {
  const state = useSyncExternalStore(installStore.subscribe, installStore.getSnapshot)
  return { ...state, requestInstall, closeInstallGuide }
}
