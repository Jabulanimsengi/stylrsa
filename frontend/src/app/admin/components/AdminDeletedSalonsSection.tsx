import styles from '../AdminPage.module.css';
import type { DeletedSalonArchiveRow } from '../types';

interface AdminDeletedSalonsSectionProps {
  deletedSalons: DeletedSalonArchiveRow[];
  onRestoreDeletedSalon: (archiveId: string) => void;
}

export default function AdminDeletedSalonsSection({
  deletedSalons,
  onRestoreDeletedSalon,
}: AdminDeletedSalonsSectionProps) {
  return deletedSalons.length > 0 ? deletedSalons.map((row) => (
    <div key={row.id} className={styles.listItem}>
      <div className={styles.info}>
        <h4>{row.salon?.name ?? 'Unknown name'}</h4>
        <p>Deleted at: {row.deletedAt ? new Date(row.deletedAt).toLocaleString() : ''} {row.reason ? `| Reason: ${row.reason}` : ''}</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.approveButton} onClick={() => onRestoreDeletedSalon(row.id)}>Restore</button>
      </div>
    </div>
  )) : <p>No deleted profiles.</p>;
}
