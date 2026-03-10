'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { cn } from '@/lib/utils';

type ModalShellSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<ModalShellSize, string> = {
  sm: 'sm:max-w-[420px]',
  md: 'sm:max-w-[560px]',
  lg: 'sm:max-w-[720px]',
  xl: 'sm:max-w-[920px]',
};

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalShellSize;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  className,
  bodyClassName,
  children,
}: ModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'border border-black/5 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-0 shadow-[0_24px_80px_rgba(15,23,42,0.16)]',
          'max-h-[92vh] overflow-hidden rounded-[28px]',
          sizeClasses[size],
          className
        )}
      >
        {(title || description) && (
          <DialogHeader className="border-b border-black/5 px-6 py-5 text-left sm:px-7">
            {title ? (
              <DialogTitle className="text-[1.15rem] font-semibold text-slate-950">
                {title}
              </DialogTitle>
            ) : null}
            {description ? (
              <DialogDescription className="text-sm leading-6 text-slate-600">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
        )}
        <div className={cn('overflow-y-auto px-6 py-6 sm:px-7', bodyClassName)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
