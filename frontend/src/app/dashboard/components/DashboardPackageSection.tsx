import type { PlanCode, PlanPaymentStatus } from '@/types';
import { APP_PLANS, PLAN_BY_CODE, type AppPlan } from '@/constants/plans';
import { Button, LoadingButton } from '@/components/ui';
import styles from '../Dashboard.module.css';

const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
  PENDING_SELECTION: 'Package not selected',
  AWAITING_PROOF: 'Awaiting proof',
  PROOF_SUBMITTED: 'Proof submitted',
  VERIFIED: 'Verified',
};

const BANK_DETAILS = {
  bank: 'Capitec Bank',
  accountNumber: '1618097723',
  accountHolder: 'J Msengi',
  whatsapp: '0738021196',
};

interface DashboardPackageSectionProps {
  planCode: PlanCode;
  planDetails: AppPlan;
  planStatus: PlanPaymentStatus;
  planReference: string;
  selectedPlanForUpgrade: PlanCode | null;
  paymentReference: string;
  isPlanUpdating: boolean;
  isSubmittingPlanChange: boolean;
  salonName?: string;
  onSelectPlan: (planCode: PlanCode | null) => void;
  onPaymentReferenceChange: (value: string) => void;
  onCopyReference: () => void;
  onPlanProofUpdate: (hasProof: boolean) => void;
  onPlanChange: (planCode: PlanCode) => void;
}

export default function DashboardPackageSection({
  planCode,
  planDetails,
  planStatus,
  planReference,
  selectedPlanForUpgrade,
  paymentReference,
  isPlanUpdating,
  isSubmittingPlanChange,
  salonName,
  onSelectPlan,
  onPaymentReferenceChange,
  onCopyReference,
  onPlanProofUpdate,
  onPlanChange,
}: DashboardPackageSectionProps) {
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Package & Billing</h3>
      </div>

      <div className={styles.currentPlanSection}>
        <div className={styles.planHeader}>
          <div className={styles.planInfo}>
            <h4>Current Plan: {planDetails.name}</h4>
            <p>{planDetails.description}</p>
          </div>
          <div className={styles.planPricing}>
            <div className={styles.planPrice}>
              {planDetails.price}{planCode !== 'FREE' && <span className={styles.planPriceUnit}>/month</span>}
            </div>
            <div className={`${styles.planStatusBadgeBox} ${planStatus === 'VERIFIED' ? styles.planStatusVerified : planStatus === 'PROOF_SUBMITTED' ? styles.planStatusProofSubmitted : styles.planStatusAwaiting}`}>
              {PLAN_PAYMENT_LABELS[planStatus]}
            </div>
          </div>
        </div>

        <div className={styles.planMetricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Visibility Boost</div>
            <div className={styles.metricValue}>{planDetails.visibilityWeight}x</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Service Listings</div>
            <div className={styles.metricValue}>{planDetails.maxListings}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Commission Rate</div>
            <div className={styles.metricValue}>{planCode === 'FREE' ? '32%' : '0%'}</div>
          </div>
        </div>

        <div className={styles.planFeaturesBox}>
          <h5 className={styles.featuresHeading}>Plan Features</h5>
          <ul className={styles.featuresList}>
            {planDetails.features.map((feature, index) => (
              <li key={index} className={styles.featureItem}>
                <span className={styles.featureCheckmark}>+</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {planStatus !== 'VERIFIED' && planCode !== 'FREE' && (
        <div className={styles.paymentInstructions}>
          <h4 className={styles.paymentInstructionsHeading}>Complete Your Payment</h4>
          <div className={styles.paymentDetailsBox}>
            <p><strong>Bank:</strong> {BANK_DETAILS.bank}</p>
            <p><strong>Account Number:</strong> {BANK_DETAILS.accountNumber}</p>
            <p><strong>Account Holder:</strong> {BANK_DETAILS.accountHolder}</p>
            <p><strong>Reference:</strong> {planReference}</p>
            <p><strong>Amount:</strong> {planDetails.price}</p>
          </div>
          <p className={styles.paymentNote}>
            After payment, WhatsApp proof to <strong>{BANK_DETAILS.whatsapp}</strong>, then click "I sent proof" below.
          </p>
          <div className={styles.paymentActionsGroup}>
            <Button variant="outline" size="sm" onClick={onCopyReference}>
              Copy Reference
            </Button>
            {planStatus !== 'PROOF_SUBMITTED' && (
              <LoadingButton
                size="sm"
                loading={isPlanUpdating}
                loadingText="Submitting..."
                onClick={() => onPlanProofUpdate(true)}
              >
                I sent proof
              </LoadingButton>
            )}
            {planStatus === 'PROOF_SUBMITTED' && (
              <div className={styles.awaitingVerification}>
                Awaiting admin verification (usually within 24 hours)
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h4 className={styles.availablePlansHeading}>
          {planCode === 'FREE' ? 'Upgrade Your Plan' : 'Change Plan'}
        </h4>
        <div className={styles.plansGrid}>
          {APP_PLANS.filter((plan) => plan.code !== planCode).map((plan) => (
            <div
              key={plan.code}
              className={`${styles.planCard} ${selectedPlanForUpgrade === plan.code ? styles.planCardSelected : ''}`}
              onClick={() => onSelectPlan(plan.code)}
            >
              {plan.popular && (
                <div className={styles.popularBadge}>
                  Popular
                </div>
              )}
              <div className={`${styles.planCardContent} ${plan.popular ? styles.planCardContentWithBadge : ''}`}>
                <h5 className={styles.planCardName}>{plan.name}</h5>
                <div className={styles.planCardPrice}>
                  {plan.price}{plan.code !== 'FREE' && <span className={styles.planCardPriceUnit}>/mo</span>}
                </div>
                {plan.originalPrice && (
                  <div className={styles.planCardOriginalPrice}>
                    {plan.originalPrice}/mo
                  </div>
                )}
                <p className={styles.planCardDescription}>{plan.description}</p>
                <ul className={styles.planCardFeaturesList}>
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className={styles.planCardFeatureItem}>
                      <span className={styles.featureCheckmark}>+</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {selectedPlanForUpgrade === plan.code && (
                  <div className={styles.selectedPlanBadge}>
                    Selected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedPlanForUpgrade && (
          <div className={styles.confirmPlanSection}>
            <h5 className={styles.confirmPlanHeading}>
              Confirm Plan Change to {PLAN_BY_CODE[selectedPlanForUpgrade].name}
            </h5>

            {selectedPlanForUpgrade !== 'FREE' && (
              <>
                <p className={styles.confirmPlanDescription}>
                  After confirming, you&apos;ll need to make a payment of <strong>{PLAN_BY_CODE[selectedPlanForUpgrade].price}</strong> to activate your new plan.
                </p>
                <div className={styles.paymentReferenceSection}>
                  <label className={styles.paymentReferenceLabel}>
                    Payment Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(event) => onPaymentReferenceChange(event.target.value)}
                    placeholder={salonName || 'Your salon name'}
                    className={styles.paymentReferenceInput}
                  />
                  <p className={styles.paymentReferenceHint}>
                    This will be used to track your payment. Leave blank to use your salon name.
                  </p>
                </div>
              </>
            )}

            <div className={styles.confirmActionButtons}>
              <LoadingButton
                loading={isSubmittingPlanChange}
                loadingText="Changing..."
                onClick={() => onPlanChange(selectedPlanForUpgrade)}
              >
                Confirm {selectedPlanForUpgrade === 'FREE' ? 'Downgrade' : 'Upgrade'}
              </LoadingButton>
              <Button
                variant="outline"
                onClick={() => {
                  onSelectPlan(null);
                  onPaymentReferenceChange('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
