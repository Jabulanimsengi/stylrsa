// frontend/src/components/ConfirmationModal/ConfirmationModal.tsx
import styles from './ConfirmationModal.module.css';
import { Button } from '@/components/ui';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  details?: string[];
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  details,
  isDestructive = false,
}: ConfirmationModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p className={styles.message}>{message}</p>
        {details && details.length > 0 && (
          <div className={styles.details}>
            <p className={styles.detailsLabel}>Marking as completed will:</p>
            <ul className={styles.detailsList}>
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
        <div className={styles.buttonGroup}>
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={isDestructive ? 'destructive' : 'default'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}