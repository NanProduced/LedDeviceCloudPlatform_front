'use client'

import * as React from 'react'
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  type PanelGroupProps,
  type PanelProps,
} from 'react-resizable-panels'
import { cn } from '@/lib/utils'

export interface ResizablePanelGroupProps extends PanelGroupProps {
  className?: string
}

export function ResizablePanelGroup({
  className,
  direction = 'horizontal',
  ...props
}: ResizablePanelGroupProps) {
  return (
    <PanelGroup
      direction={direction}
      className={cn('h-full w-full', className)}
      {...props}
    />
  )
}

export interface ResizablePanelProps extends PanelProps {
  className?: string
}

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return <Panel className={cn('outline-none', className)} {...props} />
}

export interface ResizableHandleProps
  extends React.ComponentProps<typeof PanelResizeHandle> {
  withHandle?: boolean
  className?: string
}

export function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
  return (
    <PanelResizeHandle
      className={cn(
        // base line
        'relative data-[panel-group-direction=horizontal]:w-px data-[panel-group-direction=horizontal]:cursor-col-resize data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:cursor-row-resize bg-border transition-colors',
        // active/hover
        'data-[resize-handle-active]:bg-primary hover:bg-primary/70',
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* dot/line indicator */}
          <div className="data-[panel-group-direction=horizontal]:h-6 data-[panel-group-direction=horizontal]:w-1 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-6 rounded-full bg-border" />
        </div>
      ) : null}
    </PanelResizeHandle>
  )
}

export default ResizablePanelGroup

