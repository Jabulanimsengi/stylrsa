import Link from 'next/link';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import type { PlanCode, PlanPaymentStatus } from '@/types';
import { PLAN_PAYMENT_LABELS, formatRand, type PendingSalon } from '../types';
import styles from '../AdminPage.module.css';

interface AdminPendingPaymentsSectionProps {
  pendingPaymentSalons: PendingSalon[];
  updatingSalonPlanId: string | null;
  onCopyReference: (value: string, successMessage: string) => void;
  onUpdateSalonPaymentStatus: (salonId: string, status: PlanPaymentStatus) => void;
}

export default function AdminPendingPaymentsSection({
  pendingPaymentSalons,
  updatingSalonPlanId,
  onCopyReference,
  onUpdateSalonPaymentStatus,
}: AdminPendingPaymentsSectionProps) {
  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pending Payment Verification</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Salons that have submitted payment proof and are awaiting admin verification.
        </p>
      </div>
      {pendingPaymentSalons.length > 0 ? pendingPaymentSalons.map((salon) => {
        const planCode = (salon.planCode ?? 'FREE') as PlanCode;
        const plan = PLAN_BY_CODE[planCode] ?? APP_PLANS[0];
        const planAmount =
          typeof salon.planPriceCents === 'number'
            ? formatRand(salon.planPriceCents)
            : plan.price;
        const paymentStatus = (salon.planPaymentStatus ?? 'PENDING_SELECTION') as PlanPaymentStatus;
        const proofSubmittedAt = salon.planProofSubmittedAt
          ? new Date(salon.planProofSubmittedAt).toLocaleString('en-ZA')
          : null;
        const isUpdating = updatingSalonPlanId === salon.id;
        const paymentReference = salon.planPaymentReference ?? salon.name;

        return (
          <div key={salon.id} className={styles.listItem} style={{ background: 'var(--color-surface-elevated)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
            <div className={styles.info}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{salon.name}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {salon.city}, {salon.province}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email})
                  </p>
                </div>
                <span className={`${styles.planBadge} ${styles[`planStatus_${paymentStatus.toLowerCase()}`]}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  {PLAN_PAYMENT_LABELS[paymentStatus]}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Plan</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{plan.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Amount Due</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{planAmount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Payment Reference</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.25rem 0.5rem', background: '#f3f4f6', borderRadius: '4px' }}>{paymentReference}</code>
                    <button
                      type="button"
                      onClick={() => onCopyReference(paymentReference, 'Reference copied')}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                {proofSubmittedAt && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Proof Submitted</div>
                    <div style={{ fontSize: '0.85rem' }}>{proofSubmittedAt}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onUpdateSalonPaymentStatus(salon.id, 'VERIFIED')}
                  disabled={isUpdating || paymentStatus === 'VERIFIED'}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: paymentStatus === 'VERIFIED' ? '#d1d5db' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: paymentStatus === 'VERIFIED' ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  {isUpdating && paymentStatus !== 'VERIFIED' ? 'Verifying...' : paymentStatus === 'VERIFIED' ? 'Verified' : 'Verify Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSalonPaymentStatus(salon.id, 'AWAITING_PROOF')}
                  disabled={isUpdating || paymentStatus === 'AWAITING_PROOF'}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  {isUpdating && paymentStatus === 'AWAITING_PROOF' ? 'Saving...' : 'Reject / Request Re-submission'}
                </button>
                <Link
                  href={`/dashboard?ownerId=${salon.owner.id}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-strong)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        );
      }) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--color-surface-elevated)', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>OK</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>All payments verified</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>There are no pending payment verifications at the moment.</p>
        </div>
      )}
    </>
  );
}
