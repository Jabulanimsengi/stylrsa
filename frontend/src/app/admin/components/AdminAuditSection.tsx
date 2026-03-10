import styles from '../AdminPage.module.css';
import type { AdminAuditLog } from '../types';

interface AdminAuditSectionProps {
  auditLogs: AdminAuditLog[];
  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
}

export default function AdminAuditSection({
  auditLogs,
  expandedItems,
  toggleExpanded,
}: AdminAuditSectionProps) {
  return auditLogs.length > 0 ? auditLogs.map((log) => {
    const isExpanded = expandedItems.has(`audit-${log.id}`);
    return (
      <div key={log.id} className={styles.collapsibleItem}>
        <div className={styles.collapsibleHeader} onClick={() => toggleExpanded(`audit-${log.id}`)}>
          <div className={styles.collapsibleHeaderLeft}>
            <span className={styles.collapsibleName} title={log.action}>{log.action}</span>
            <span className={styles.collapsibleLocation}>{log.targetType}</span>
          </div>
          <div className={styles.collapsibleHeaderRight}>
            <span style={{ color: '#666', fontSize: '0.8rem' }}>{new Date(log.createdAt).toLocaleDateString()}</span>
            <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>v</span>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.collapsibleContent}>
            <div className={styles.info}>
              <h4>{log.action}</h4>
              <p><strong>Target:</strong> {log.targetType} {log.targetId}</p>
              {log.reason && <p><strong>Reason:</strong> {log.reason}</p>}
              <p style={{ color: '#666', fontSize: '0.85rem' }}>Timestamp: {new Date(log.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    );
  }) : <p>No recent admin activity.</p>;
}
