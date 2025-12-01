import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { LoadingButton } from '../inputs/loading-button'

type ConfirmationOptions = {
  title?: string
  description?: string
  onConfirm?: () => void | Promise<any>
  isPending?: boolean
}

type ContextType = {
  confirm: (options: ConfirmationOptions) => void
  resetAndClose?: () => void
}

const DeleteConfirmationContext = React.createContext<ContextType | null>(null)

export function useDeleteConfirmation() {
  const ctx = React.useContext(DeleteConfirmationContext)
  if (!ctx)
    throw new Error(
      'useDeleteConfirmation must be used inside DeleteConfirmationProvider',
    )
  return ctx
}

export function DeleteConfirmationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmationOptions>({})

  const confirm = React.useCallback((opts: ConfirmationOptions) => {
    setOptions(opts)
    setOpen(true)
  }, [])

  const resetAndClose = React.useCallback(() => {
    setOptions({})
    setOpen(false)
  }, [])

  const handleConfirm = async () => {
    if (options.onConfirm) await options.onConfirm()
    setOpen(false)
  }

  return (
    <DeleteConfirmationContext.Provider value={{ confirm, resetAndClose }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options.title ?? 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options.description ??
                'Are you sure you want to delete this item? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <LoadingButton
                isLoading={!!options.isPending}
                disabled={options.isPending}
                onClick={handleConfirm}
              >
                Delete
              </LoadingButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DeleteConfirmationContext.Provider>
  )
}
