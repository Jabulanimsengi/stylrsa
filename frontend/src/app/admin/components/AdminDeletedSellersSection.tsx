import styles from '../AdminPage.module.css';
import type { DeletedSellerArchiveRow } from '../types';

interface AdminDeletedSellersSectionProps {
  deletedSellers: DeletedSellerArchiveRow[];
  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
  onRestoreDeletedSeller: (archiveId: string) => void;
}

export default function AdminDeletedSellersSection({
  deletedSellers,
  expandedItems,
  toggleExpanded,
  onRestoreDeletedSeller,
}: AdminDeletedSellersSectionProps) {
  return deletedSellers.length > 0 ? deletedSellers.map((row) => {
    const isExpanded = expandedItems.has(`delseller-${row.id}`);
    const sellerName = row.seller?.firstName ? `${row.seller.firstName} ${row.seller.lastName ?? ''}`.trim() : 'Unknown seller';
    return (
      <div key={row.id} className={styles.collapsibleItem}>
        <div className={styles.collapsibleHeader} onClick={() => toggleExpanded(`delseller-${row.id}`)}>
          <div className={styles.collapsibleHeaderLeft}>
            <span className={styles.collapsibleName} title={sellerName}>{sellerName}</span>
            <span className={styles.collapsibleLocation}>{row.deletedAt ? new Date(row.deletedAt).toLocaleDateString() : ''}</span>
          </div>
          <div className={styles.collapsibleHeaderRight}>
            <span className={`${styles.collapsibleStatus} ${styles.rejected}`}>Deleted</span>
            <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>v</span>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.collapsibleContent}>
            <div className={styles.info}>
              <h4>{sellerName}</h4>
              <p>Deleted at: {row.deletedAt ? new Date(row.deletedAt).toLocaleString() : ''}</p>
              {row.reason && <p><strong>Reason:</strong> {row.reason}</p>}
            </div>
            <div className={styles.actions}>
              <button className={styles.approveButton} onClick={() => onRestoreDeletedSeller(row.id)}>Restore</button>
            </div>
          </div>
        )}
      </div>
    );
  }) : <p>No deleted sellers.</p>;
}
