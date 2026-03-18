'use client';

import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './Modal.module.css';
import MobileCloseButton from '@/components/MobileCloseButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  header,
  footer
}: ModalProps) {
  // Handle open state change from Radix
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={styles.overlay}
          onClick={closeOnBackdrop ? undefined : (e) => e.stopPropagation()}
        />
        <Dialog.Content
          className={`${styles.modal} ${styles[size]} ${className}`}
          onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
          onPointerDownOutside={closeOnBackdrop ? undefined : (e) => e.preventDefault()}
          onInteractOutside={closeOnBackdrop ? undefined : (e) => e.preventDefault()}
        >
          {(title || header || showCloseButton) && (
            <div className={styles.header}>
              {header || (title && (
                <Dialog.Title className={styles.title}>
                  {title}
                </Dialog.Title>
              ))}
              {showCloseButton && (
                <Dialog.Close asChild>
                  <MobileCloseButton className={styles.closeButton} label="Close modal" />
                </Dialog.Close>
              )}
            </div>
          )}

          {/* Hidden description for accessibility if no visible title */}
          {!title && !header && (
            <Dialog.Description className="sr-only">
              Modal dialog
            </Dialog.Description>
          )}

          <div className={styles.content}>
            {children}
          </div>

          {footer && (
            <div className={styles.footer}>
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
