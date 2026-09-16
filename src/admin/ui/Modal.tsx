import type { ReactNode } from 'react'
import { Sheet } from '../../components/ui/Sheet'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  size?: 'md' | 'lg'
  children: ReactNode
}

export function Modal(props: ModalProps) {
  return <Sheet closeLabel="Закрыть" {...props} />
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>
}
