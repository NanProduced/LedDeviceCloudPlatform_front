'use client'

import { Toaster as Sonner, toast as sonnerToast } from 'sonner'

export type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-background border shadow-sm text-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-foreground',
        },
      }}
      {...props}
    />
  )
}

export const toast = sonnerToast

