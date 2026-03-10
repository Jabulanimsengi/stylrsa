import { Button, LoadingButton } from '@/components/ui';
import OperatingHoursInput, { type OperatingHours } from '@/components/OperatingHoursInput';
import styles from '../Dashboard.module.css';

interface DashboardBookingSettingsSectionProps {
  bookingMessage: string;
  isEditingMessage: boolean;
  isSavingMessage: boolean;
  operatingHours: OperatingHours;
  isEditingHours: boolean;
  isSavingHours: boolean;
  onBookingMessageChange: (value: string) => void;
  onEditMessage: () => void;
  onClearMessage: () => void;
  onSaveMessage: () => void;
  onHoursChange: (hours: OperatingHours) => void;
  onEditHours: () => void;
  onSaveHours: () => void;
}

export default function DashboardBookingSettingsSection({
  bookingMessage,
  isEditingMessage,
  isSavingMessage,
  operatingHours,
  isEditingHours,
  isSavingHours,
  onBookingMessageChange,
  onEditMessage,
  onClearMessage,
  onSaveMessage,
  onHoursChange,
  onEditHours,
  onSaveHours,
}: DashboardBookingSettingsSectionProps) {
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Booking Settings</h3>
      </div>
      <div className={styles.settingsSection}>
        <h4 className={styles.settingsSubheading}>Custom Booking Message</h4>
        <p className={styles.settingsDescription}>
          Set a message customers see before booking, such as booking fees or preparation requirements.
        </p>
        {!isEditingMessage && bookingMessage ? (
          <div>
            <div className={styles.messageDisplay}>
              {bookingMessage}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onEditMessage}>
              Edit Message
            </Button>
          </div>
        ) : (
          <div>
            <textarea
              value={bookingMessage}
              onChange={(event) => event.target.value.length <= 200 && onBookingMessageChange(event.target.value)}
              placeholder="e.g., Please arrive 10 minutes early. Booking fee: R50"
              rows={4}
              className={styles.messageTextarea}
            />
            <p className={styles.characterCount}>{bookingMessage.length}/200</p>
            <div className={styles.actionButtonGroup}>
              <LoadingButton type="button" onClick={onSaveMessage} loading={isSavingMessage}>
                Save
              </LoadingButton>
              {bookingMessage && (
                <Button type="button" variant="ghost" size="sm" onClick={onClearMessage}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        <h4 className={`${styles.settingsSubheading} ${styles.sectionDivider}`}>Operating Hours</h4>
        <OperatingHoursInput hours={operatingHours} onChange={onHoursChange} />
        <div className={styles.actionButtonGroup}>
          {isEditingHours ? (
            <LoadingButton type="button" onClick={onSaveHours} loading={isSavingHours}>
              Save Hours
            </LoadingButton>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={onEditHours}>
              Edit Hours
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
