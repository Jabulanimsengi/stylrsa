import { notify } from '@/lib/notify';
import styles from '../AdminPage.module.css';
import type { Top10RequestRow } from '../types';

interface AdminTop10RequestsSectionProps {
  requests: Top10RequestRow[];
  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
  authToken?: string;
  onRequestsChange: (updater: (prev: Top10RequestRow[]) => Top10RequestRow[]) => void;
}

export default function AdminTop10RequestsSection({
  requests,
  expandedItems,
  toggleExpanded,
  authToken,
  onRequestsChange,
}: AdminTop10RequestsSectionProps) {
  return requests.length > 0 ? requests.map((request) => {
    const isExpanded = expandedItems.has(`req-${request.id}`);
    const statusColor = request.status === 'PENDING'
      ? '#f59e0b'
      : request.status === 'CONTACTED'
        ? '#3b82f6'
        : request.status === 'MATCHED'
          ? '#10b981'
          : '#6b7280';

    return (
      <div key={request.id} className={styles.collapsibleItem}>
        <div className={styles.collapsibleHeader} onClick={() => toggleExpanded(`req-${request.id}`)}>
          <div className={styles.collapsibleHeaderLeft}>
            <span className={styles.collapsibleName} title={request.fullName}>{request.fullName}</span>
            <span className={styles.collapsibleLocation} title={request.location}>{request.location}</span>
          </div>
          <div className={styles.collapsibleHeaderRight}>
            <span className={styles.collapsibleStatus} style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>{request.status}</span>
            <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>v</span>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.collapsibleContent}>
            <div className={styles.info}>
              <h4>{request.fullName} - {request.category}</h4>
              <p><strong>Service:</strong> {request.serviceNeeded}</p>
              <p><strong>Budget:</strong> R{request.budget} | <strong>Type:</strong> {request.serviceType === 'onsite' ? 'Mobile' : 'Visit Salon'}</p>
              <p><strong>Location:</strong> {request.location}</p>
              <p><strong>Date:</strong> {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Not specified'} {request.preferredTime ? `at ${request.preferredTime}` : ''}</p>
              <p><strong>Phone:</strong> <a href={`tel:${request.phone}`}>{request.phone}</a> {request.whatsapp && <> | <strong>WhatsApp:</strong> <a href={`https://wa.me/${request.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{request.whatsapp}</a></>}</p>
              {request.email && <p><strong>Email:</strong> <a href={`mailto:${request.email}`}>{request.email}</a></p>}
              {request.styleOrLook && <p><strong>Style:</strong> {request.styleOrLook}</p>}
              <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>Submitted: {new Date(request.createdAt).toLocaleString()}</p>
            </div>
            <div className={styles.actions}>
              <select
                value={request.status}
                onChange={async (event) => {
                  const newStatus = event.target.value as Top10RequestRow['status'];
                  const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
                  try {
                    const res = await fetch(`/api/admin/top10-requests/${request.id}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', ...authHeaders },
                      credentials: 'include',
                      body: JSON.stringify({ status: newStatus }),
                    });
                    if (res.ok) {
                      onRequestsChange((prev) => prev.map((row) => row.id === request.id ? { ...row, status: newStatus } : row));
                      notify.success('Status updated');
                    } else {
                      notify.error('Failed to update status');
                    }
                  } catch {
                    notify.error('Failed to update status');
                  }
                }}
                style={{ padding: '0.5rem', borderRadius: 4 }}
              >
                <option value="PENDING">Pending</option>
                <option value="CONTACTED">Contacted</option>
                <option value="MATCHED">Matched</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  }) : <p>No Top 10 requests yet.</p>;
}
