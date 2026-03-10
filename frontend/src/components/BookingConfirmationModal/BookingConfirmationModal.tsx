'use client';

import Image from 'next/image';
import styles from './BookingConfirmationModal.module.css';
import { Button, ModalShell } from '@/components/ui';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  salonName: string;
  salonLogo?: string;
  message: string;
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  onAccept,
  salonName,
  salonLogo,
  message,
}: BookingConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <ModalShell
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Booking Confirmation"
      description="Review this salon note before continuing to checkout."
      size="sm"
      bodyClassName="px-0 py-0"
      className={styles.modal}
    >
      <div className={styles.salonInfo}>
        {salonLogo && (
          <div className={styles.logoWrapper}>
            <Image
              src={salonLogo}
              alt={salonName}
              width={80}
              height={80}
              className={styles.logo}
            />
          </div>
        )}
        <h3 className={styles.salonName}>{salonName}</h3>
      </div>

      <div className={styles.messageBox}>
        <div className={styles.messageHeader}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Important Information</span>
        </div>
        <p className={styles.message}>{message}</p>
      </div>

      <div className={styles.actions}>
        <Button onClick={onClose} variant="outline" className={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={onAccept} className={styles.acceptButton}>
          Accept and continue
        </Button>
      </div>
    </ModalShell>
  );
}
