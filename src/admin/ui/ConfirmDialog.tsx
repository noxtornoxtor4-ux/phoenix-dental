import { useState, type ReactNode } from 'react'
import { useToast } from './toastContext'
import { Button } from './Button'
import { Modal, ModalActions } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => Promise<unknown>
  onClose: () => void
}

/** Destructive confirmation; errors are shown as a toast and keep the dialog open. */
export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      toast.error(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-sm text-white/70">{children}</div>
      <ModalActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="danger" loading={busy} onClick={confirm}>
          {confirmLabel}
        </Button>
      </ModalActions>
    </Modal>
  )
}
