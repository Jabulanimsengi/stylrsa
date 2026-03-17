import { Button, LoadingButton } from '@/components/ui';
import OperatingHoursInput, { type OperatingHours } from '@/components/OperatingHoursInput';
import styles from '../Dashboard.module.css';

interface DashboardBankingDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
}

interface DashboardBookingSettingsSectionProps {
  bookingMessage: string;
  isEditingMessage: boolean;
  isSavingMessage: boolean;
  bankingDetails: DashboardBankingDetails;
  isEditingBankingDetails: boolean;
  isSavingBankingDetails: boolean;
  operatingHours: OperatingHours;
  isEditingHours: boolean;
  isSavingHours: boolean;
  onBookingMessageChange: (value: string) => void;
  onEditMessage: () => void;
  onClearMessage: () => void;
  onSaveMessage: () => void;
  onBankingDetailsChange: (value: DashboardBankingDetails) => void;
  onEditBankingDetails: () => void;
  onClearBankingDetails: () => void;
  onSaveBankingDetails: () => void;
  onHoursChange: (hours: OperatingHours) => void;
  onEditHours: () => void;
  onSaveHours: () => void;
}

export default function DashboardBookingSettingsSection({
  bookingMessage,
  isEditingMessage,
  isSavingMessage,
  bankingDetails,
  isEditingBankingDetails,
  isSavingBankingDetails,
  operatingHours,
  isEditingHours,
  isSavingHours,
  onBookingMessageChange,
  onEditMessage,
  onClearMessage,
  onSaveMessage,
  onBankingDetailsChange,
  onEditBankingDetails,
  onClearBankingDetails,
  onSaveBankingDetails,
  onHoursChange,
  onEditHours,
  onSaveHours,
}: DashboardBookingSettingsSectionProps) {
  const hasBankingDetails = Boolean(bankingDetails.bankName && bankingDetails.accountNumber);

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

        <h4 className={`${styles.settingsSubheading} ${styles.sectionDivider}`}>Deposit Banking Details</h4>
        <p className={styles.settingsDescription}>
          Add the account details clients should use when paying the required 50% booking deposit.
        </p>
        {!isEditingBankingDetails && hasBankingDetails ? (
          <div>
            <div className={styles.bankingDisplay}>
              <div className={styles.bankingDisplayRow}>
                <span className={styles.bankingDisplayLabel}>Bank</span>
                <span className={styles.bankingDisplayValue}>{bankingDetails.bankName}</span>
              </div>
              <div className={styles.bankingDisplayRow}>
                <span className={styles.bankingDisplayLabel}>Account holder</span>
                <span className={styles.bankingDisplayValue}>{bankingDetails.accountHolder || 'Uses salon name fallback'}</span>
              </div>
              <div className={styles.bankingDisplayRow}>
                <span className={styles.bankingDisplayLabel}>Account number</span>
                <span className={styles.bankingDisplayValue}>{bankingDetails.accountNumber}</span>
              </div>
              {bankingDetails.branchCode && (
                <div className={styles.bankingDisplayRow}>
                  <span className={styles.bankingDisplayLabel}>Branch code</span>
                  <span className={styles.bankingDisplayValue}>{bankingDetails.branchCode}</span>
                </div>
              )}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onEditBankingDetails}>
              Edit Banking Details
            </Button>
          </div>
        ) : (
          <div>
            <div className={styles.bankingGrid}>
              <div className={styles.bankingField}>
                <label htmlFor="dashboardBankName" className={styles.bankingFieldLabel}>Bank name</label>
                <input
                  id="dashboardBankName"
                  type="text"
                  value={bankingDetails.bankName}
                  onChange={(event) => onBankingDetailsChange({ ...bankingDetails, bankName: event.target.value })}
                  placeholder="e.g. Capitec Bank"
                  className={styles.bankingInput}
                />
              </div>
              <div className={styles.bankingField}>
                <label htmlFor="dashboardAccountHolder" className={styles.bankingFieldLabel}>Account holder</label>
                <input
                  id="dashboardAccountHolder"
                  type="text"
                  value={bankingDetails.accountHolder}
                  onChange={(event) => onBankingDetailsChange({ ...bankingDetails, accountHolder: event.target.value })}
                  placeholder="Defaults to salon name if left blank"
                  className={styles.bankingInput}
                />
              </div>
              <div className={styles.bankingField}>
                <label htmlFor="dashboardAccountNumber" className={styles.bankingFieldLabel}>Account number</label>
                <input
                  id="dashboardAccountNumber"
                  type="text"
                  value={bankingDetails.accountNumber}
                  onChange={(event) => onBankingDetailsChange({ ...bankingDetails, accountNumber: event.target.value })}
                  placeholder="Enter the deposit account number"
                  className={styles.bankingInput}
                />
              </div>
              <div className={styles.bankingField}>
                <label htmlFor="dashboardBranchCode" className={styles.bankingFieldLabel}>Branch code</label>
                <input
                  id="dashboardBranchCode"
                  type="text"
                  value={bankingDetails.branchCode}
                  onChange={(event) => onBankingDetailsChange({ ...bankingDetails, branchCode: event.target.value })}
                  placeholder="Optional"
                  className={styles.bankingInput}
                />
              </div>
            </div>
            <p className={styles.bankingHint}>
              Save at least the bank name and account number if you want clients to see deposit instructions during booking.
            </p>
            <div className={styles.actionButtonGroup}>
              <LoadingButton type="button" onClick={onSaveBankingDetails} loading={isSavingBankingDetails}>
                Save Banking Details
              </LoadingButton>
              {Object.values(bankingDetails).some(Boolean) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearBankingDetails}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        <h4 className={`${styles.settingsSubheading} ${styles.sectionDivider}`}>Operating Hours</h4>
        <OperatingHoursInput
          hours={operatingHours}
          onChange={onHoursChange}
          disabled={!isEditingHours}
        />
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
