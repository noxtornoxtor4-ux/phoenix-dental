import { createContext, use } from 'react'
import { services, type ServiceCatalog } from '../data/services'

/** Site calculator prices; defaults to the built-in list until the CRM prices load. */
export const ServiceCatalogContext = createContext<ServiceCatalog>(services)

export function useServiceCatalog() {
  return use(ServiceCatalogContext)
}
