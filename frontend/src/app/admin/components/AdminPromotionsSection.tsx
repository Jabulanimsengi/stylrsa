import styles from '../AdminPage.module.css';
import type { PendingPromotionRow } from '../types';

interface AdminPromotionsSectionProps {
  promotions: PendingPromotionRow[];
  onApprovePromotion: (promotionId: string) => void;
  onRejectPromotion: (promotionId: string) => void;
}

export default function AdminPromotionsSection({
  promotions,
  onApprovePromotion,
  onRejectPromotion,
}: AdminPromotionsSectionProps) {
  return (
    <>
      {promotions.length > 0 ? promotions.map((promo) => {
        if (!promo.service) {
          return null;
        }

        const itemName = promo.service.title;
        const providerName = promo.service.salon?.name;
        const endDate = new Date(promo.endDate);
        const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        return (
          <div key={promo.id} className={styles.listItem}>
            <div className={styles.info}>
              <h4>{itemName}</h4>
              <p>
                <strong>Provider:</strong> {providerName || 'Unknown'} | <strong>Type:</strong> Service
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span>
                  <strong>Original:</strong>{' '}
                  <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>
                    R{promo.originalPrice.toFixed(2)}
                  </span>
                </span>
                <span>
                  <strong>Promotional:</strong>{' '}
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    R{promo.promotionalPrice.toFixed(2)}
                  </span>
                </span>
                <span>
                  <strong>Discount:</strong>{' '}
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    {promo.discountPercentage}% OFF
                  </span>
                </span>
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                <strong>Duration:</strong> {new Date(promo.startDate).toLocaleDateString()} to {new Date(promo.endDate).toLocaleDateString()}
                {' '}({daysLeft > 0 ? `${daysLeft} days` : 'Expired'})
              </p>
            </div>
            <div className={styles.actions}>
              <button
                onClick={() => onApprovePromotion(promo.id)}
                className={styles.approveButton}
              >
                Approve
              </button>
              <button
                onClick={() => onRejectPromotion(promo.id)}
                className={styles.rejectButton}
              >
                Reject
              </button>
            </div>
          </div>
        );
      }) : <p>No pending promotions.</p>}
    </>
  );
}
