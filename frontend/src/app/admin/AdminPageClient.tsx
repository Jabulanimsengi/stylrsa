'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Socket } from 'socket.io-client';
import styles from './AdminPage.module.css';
import AdminLayout from './AdminLayout';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AllSalons from './components/AllSalons/AllSalons';
import {
  DEFAULT_ADMIN_VIEW,
  getAdminPath,
  type AdminView,
} from './admin-config';
import {
  AdminBookingRow,
  AdminAuditLog,
  DeletedSalonArchiveRow,
  PendingSalonApplication,
  PendingSalon,
  PendingService,
  ensureArray,
} from './types';
import type {
  ApprovalStatus,
  PlanPaymentStatus,
  SalonApplicationStatus,
} from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/lib/notify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import AdminPendingPaymentsSection from './components/AdminPendingPaymentsSection';
import AdminAuditSection from './components/AdminAuditSection';
import AdminDeletedSalonsSection from './components/AdminDeletedSalonsSection';

interface AdminPageClientProps {
  initialView?: AdminView;
}

export default function AdminPageClient({
  initialView = DEFAULT_ADMIN_VIEW,
}: AdminPageClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { authStatus, user } = useAuth();

  const [view, setView] = useState<AdminView>(initialView);
  const [isLoading, setIsLoading] = useState(true);
  const [salonApplications, setSalonApplications] = useState<PendingSalonApplication[]>([]);
  const [pendingSalons, setPendingSalons] = useState<PendingSalon[]>([]);
  const [allSalons, setAllSalons] = useState<PendingSalon[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [deletedSalons, setDeletedSalons] = useState<DeletedSalonArchiveRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [salonFilter, setSalonFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [selSalons, setSelSalons] = useState<Set<string>>(new Set());
  const [selServices, setSelServices] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [updatingSalonPlanId, setUpdatingSalonPlanId] = useState<string | null>(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (session?.backendJwt) {
      headers.Authorization = `Bearer ${session.backendJwt}`;
    }
    return headers;
  }, [session?.backendJwt]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredPendingSalons = useMemo(() => {
    const q = salonFilter.trim().toLowerCase();
    if (!q) return pendingSalons;
    return pendingSalons.filter((salon) =>
      salon.name.toLowerCase().includes(q) ||
      salon.owner.email.toLowerCase().includes(q) ||
      salon.city?.toLowerCase().includes(q) ||
      salon.province?.toLowerCase().includes(q),
    );
  }, [pendingSalons, salonFilter]);

  const filteredSalonApplications = useMemo(() => {
    const q = salonFilter.trim().toLowerCase();
    if (!q) return salonApplications;
    return salonApplications.filter((application) =>
      application.applicationReference.toLowerCase().includes(q) ||
      application.salonName.toLowerCase().includes(q) ||
      application.contactPersonName.toLowerCase().includes(q) ||
      application.email.toLowerCase().includes(q) ||
      application.city.toLowerCase().includes(q) ||
      application.province.toLowerCase().includes(q),
    );
  }, [salonApplications, salonFilter]);

  const filteredPendingServices = useMemo(() => {
    const q = serviceFilter.trim().toLowerCase();
    if (!q) return pendingServices;
    return pendingServices.filter((service) =>
      service.title?.toLowerCase().includes(q) ||
      service.salon?.name?.toLowerCase().includes(q),
    );
  }, [pendingServices, serviceFilter]);

  const pendingPaymentSalons = useMemo(
    () => allSalons.filter((salon) => salon.planPaymentStatus === 'PROOF_SUBMITTED'),
    [allSalons],
  );

  const copyToClipboard = useCallback(async (value: string, successMessage: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(value);
      notify.success(successMessage);
    } catch {
      notify.error('Unable to copy to clipboard');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const ts = Date.now();
      const noStore: RequestInit = {
        credentials: 'include',
        headers: authHeaders,
        cache: 'no-store',
      };

      const [
        salonApplicationsRes,
        pendingSalonsRes,
        allSalonsRes,
        servicesRes,
        bookingsRes,
        deletedSalonsRes,
        auditRes,
      ] = await Promise.all([
        fetch(`/api/admin/salon-applications?ts=${ts}`, noStore),
        fetch(`/api/admin/salons/pending?ts=${ts}`, noStore),
        fetch(`/api/admin/salons/all?ts=${ts}`, noStore),
        fetch(`/api/admin/services/pending?ts=${ts}`, noStore),
        fetch(`/api/admin/bookings?ts=${ts}`, noStore),
        fetch(`/api/admin/salons/deleted?ts=${ts}`, noStore),
        fetch(`/api/admin/audit?ts=${ts}`, noStore),
      ]);

      if (
        [
          salonApplicationsRes,
          pendingSalonsRes,
          allSalonsRes,
          servicesRes,
          bookingsRes,
          deletedSalonsRes,
          auditRes,
        ].some((res) => res.status === 401)
      ) {
        router.push('/login');
        return;
      }

      setSalonApplications(
        ensureArray<PendingSalonApplication>(await salonApplicationsRes.json()),
      );
      setPendingSalons(ensureArray<PendingSalon>(await pendingSalonsRes.json()));
      setAllSalons(ensureArray<PendingSalon>(await allSalonsRes.json()));
      setPendingServices(ensureArray<PendingService>(await servicesRes.json()));
      setBookings(ensureArray<AdminBookingRow>(await bookingsRes.json()));
      setDeletedSalons(ensureArray<DeletedSalonArchiveRow>(await deletedSalonsRes.json()));
      setAuditLogs(ensureArray<AdminAuditLog>(await auditRes.json()));
    } catch (error) {
      logger.error('Failed to fetch admin data:', error);
      notify.error(
        toFriendlyMessage(error, 'Failed to load admin data. Please try again.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, router]);

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus !== 'authenticated' || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    void fetchData();

    let socket: Socket | null = null;
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io('/', { transports: ['websocket'], withCredentials: true });
        socket.on('salon:deleted', () => {
          void fetchData();
        });
        socket.on('visibility:updated', () => {
          void fetchData();
        });
      } catch {
        // Realtime refresh is best-effort.
      }
    };

    void initSocket();

    return () => {
      try {
        socket?.disconnect();
      } catch {
        // No-op.
      }
    };
  }, [authStatus, user, router, fetchData]);

  const handleUpdateStatus = useCallback(
    async (type: 'salon' | 'service', id: string, approvalStatus: ApprovalStatus) => {
      const url =
        type === 'salon'
          ? `/api/admin/salons/${id}/status`
          : `/api/admin/services/${id}/status`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ approvalStatus }),
      });

      if (!response.ok) {
        const msg = await response.text().catch(() => '');
        notify.error(`Failed to update status (${response.status}). ${msg}`);
        return;
      }

      if (type === 'salon') {
        setPendingSalons((prev) => prev.filter((salon) => salon.id !== id));
      } else {
        setPendingServices((prev) => prev.filter((service) => service.id !== id));
      }
    },
    [authHeaders],
  );

  const updateSalonApplicationStatus = useCallback(
    async (
      applicationId: string,
      status: Extract<
        SalonApplicationStatus,
        'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'REJECTED'
      >,
    ) => {
      const response = await fetch(
        `/api/admin/salon-applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        const msg = await response.text().catch(() => '');
        notify.error(`Failed to update application (${response.status}). ${msg}`);
        return;
      }

      const updated = await response.json();
      setSalonApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: updated.status ?? status,
                adminNotes: updated.adminNotes ?? application.adminNotes,
                reviewedAt: updated.reviewedAt ?? application.reviewedAt,
              }
            : application,
        ),
      );
      notify.success('Application updated');
    },
    [authHeaders],
  );

  const publishSalonApplication = useCallback(
    async (applicationId: string) => {
      const response = await fetch(
        `/api/admin/salon-applications/${applicationId}/publish`,
        {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const msg = await response.text().catch(() => '');
        notify.error(`Failed to publish application (${response.status}). ${msg}`);
        return;
      }

      setSalonApplications((prev) =>
        prev.filter((application) => application.id !== applicationId),
      );
      notify.success('Salon published');
      void fetchData();
    },
    [authHeaders, fetchData],
  );

  const bulkUpdate = useCallback(
    async (type: 'salon' | 'service', ids: string[], status: ApprovalStatus) => {
      if (ids.length === 0) return;

      await Promise.all(
        ids.map((id) =>
          fetch(
            type === 'salon'
              ? `/api/admin/salons/${id}/status`
              : `/api/admin/services/${id}/status`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              credentials: 'include',
              body: JSON.stringify({ approvalStatus: status }),
            },
          ),
        ),
      );

      if (type === 'salon') {
        setPendingSalons((prev) => prev.filter((salon) => !ids.includes(salon.id)));
        setSelSalons(new Set());
      } else {
        setPendingServices((prev) => prev.filter((service) => !ids.includes(service.id)));
        setSelServices(new Set());
      }

      notify.success(`Updated ${ids.length} ${type}${ids.length > 1 ? 's' : ''}`);
    },
    [authHeaders],
  );

  const updateSalonPaymentStatus = useCallback(
    async (salonId: string, status: PlanPaymentStatus) => {
      setUpdatingSalonPlanId(salonId);
      try {
        const response = await fetch(`/api/admin/salons/${salonId}/plan/payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const msg = await response.text().catch(() => '');
          notify.error(`Failed to update payment status (${response.status}). ${msg}`);
          return;
        }

        const updated = await response.json();
        const syncSalon = (salon: PendingSalon) =>
          salon.id === salonId
            ? {
              ...salon,
              planPaymentStatus: updated.planPaymentStatus ?? status,
              planPaymentReference:
                updated.planPaymentReference ?? salon.planPaymentReference,
              planProofSubmittedAt:
                updated.planProofSubmittedAt ?? salon.planProofSubmittedAt,
              planVerifiedAt: updated.planVerifiedAt ?? salon.planVerifiedAt,
              planPriceCents:
                typeof updated.planPriceCents === 'number'
                  ? updated.planPriceCents
                  : salon.planPriceCents,
            }
            : salon;

        setPendingSalons((prev) => prev.map(syncSalon));
        setAllSalons((prev) => prev.map(syncSalon));
        notify.success('Payment status updated');
      } catch {
        notify.error('Failed to update payment status');
      } finally {
        setUpdatingSalonPlanId(null);
      }
    },
    [authHeaders],
  );

  const openDeleteSalonModal = useCallback(
    async (salon: PendingSalon) => {
      const reason = window.prompt(`Reason for deleting "${salon.name}"?`);
      if (!reason?.trim()) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/salons/${salon.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({ reason: reason.trim() }),
        });

        if (!response.ok && response.status !== 404) {
          const msg = await response.text().catch(() => '');
          notify.error(`Failed to delete (${response.status}). ${msg}`);
          return;
        }

        notify.success(response.status === 404 ? 'Profile already removed' : 'Profile deleted');
        void fetchData();
      } catch {
        notify.error('Failed to delete salon.');
      }
    },
    [authHeaders, fetchData],
  );

  const restoreDeletedSalon = useCallback(
    async (archiveId: string) => {
      const response = await fetch(`/api/admin/salons/deleted/${archiveId}/restore`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
      });

      if (!response.ok) {
        const msg = await response.text().catch(() => '');
        notify.error(`Failed to restore (${response.status}). ${msg}`);
        return;
      }

      notify.success('Profile restored');
      void fetchData();
    },
    [authHeaders, fetchData],
  );

  const handleViewChange = useCallback(
    (newView: AdminView) => {
      router.push(getAdminPath(newView));
      setView(newView);
    },
    [router],
  );

  const handleExportBookings = useCallback(() => {
    window.open('/api/admin/bookings/export', '_blank', 'noopener,noreferrer');
  }, []);

  if (isLoading || authStatus === 'loading') {
    return <LoadingSpinner />;
  }

  const pendingCounts = {
    applications: salonApplications.length,
    salons: pendingSalons.length,
    services: pendingServices.length,
    payments: pendingPaymentSalons.length,
  };

  const dashboardMetrics = {
    totalSalons: allSalons.length,
    pendingApprovals:
      salonApplications.length + pendingSalons.length + pendingServices.length,
    pendingPayments: pendingPaymentSalons.length,
  };

  return (
    <AdminLayout
      currentView={view}
      onViewChange={handleViewChange}
      pendingCounts={pendingCounts}
    >
      {view === 'dashboard' && (
        <AdminDashboard
          metrics={dashboardMetrics}
          onNavigate={handleViewChange}
        />
      )}

      <div className={styles.list}>
        {view === 'salon-applications' && (
          <>
            <div
              className={styles.filterBar}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                value={salonFilter}
                onChange={(e) => setSalonFilter(e.target.value)}
                placeholder="Filter by reference, salon, contact, email..."
                className={styles.searchInput}
                style={{ minWidth: '220px', maxWidth: '360px' }}
              />
            </div>

            {filteredSalonApplications.length > 0 ? (
              filteredSalonApplications.map((application) => (
                <div key={application.id} className={styles.listItem}>
                  <div className={styles.info}>
                    <h4>{application.salonName}</h4>
                    <p>Reference: {application.applicationReference}</p>
                    <p>{application.contactPersonName} ({application.email})</p>
                    <p>
                      {application.city}, {application.province}
                    </p>
                    <p>
                      Status: {application.status.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p>
                      <a href={application.priceListFileUrl} target="_blank" rel="noreferrer">Price list</a>
                      {' | '}
                      <a href={application.bankingProofFileUrl} target="_blank" rel="noreferrer">Banking proof</a>
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.approveButton}
                      onClick={() => {
                        void publishSalonApplication(application.id);
                      }}
                    >
                      Publish
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        void updateSalonApplicationStatus(
                          application.id,
                          'UNDER_REVIEW',
                        );
                      }}
                    >
                      Review
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => {
                        void updateSalonApplicationStatus(
                          application.id,
                          'REJECTED',
                        );
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending salon applications.</p>
            )}
          </>
        )}

        {view === 'salons' && (
          <>
            <div
              className={styles.filterBar}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                value={salonFilter}
                onChange={(e) => setSalonFilter(e.target.value)}
                placeholder="Filter by name, email, city..."
                className={styles.searchInput}
                style={{ minWidth: '200px', maxWidth: '300px' }}
              />
              {pendingSalons.length > 0 && (
                <>
                  <input
                    type="checkbox"
                    checked={
                      selSalons.size === filteredPendingSalons.length &&
                      filteredPendingSalons.length > 0
                    }
                    onChange={(e) =>
                      setSelSalons(
                        e.target.checked
                          ? new Set(filteredPendingSalons.map((salon) => salon.id))
                          : new Set(),
                      )
                    }
                  />
                  <span>Select all ({filteredPendingSalons.length})</span>
                  <button
                    className={styles.approveButton}
                    disabled={selSalons.size === 0}
                    onClick={() => bulkUpdate('salon', Array.from(selSalons), 'APPROVED')}
                  >
                    Approve selected
                  </button>
                  <button
                    className={styles.rejectButton}
                    disabled={selSalons.size === 0}
                    onClick={() => bulkUpdate('salon', Array.from(selSalons), 'REJECTED')}
                  >
                    Reject selected
                  </button>
                </>
              )}
            </div>

            {filteredPendingSalons.length > 0 ? (
              filteredPendingSalons.map((salon) => (
                <div key={salon.id} className={styles.listItem}>
                  <div className={styles.info}>
                    <h4>{salon.name}</h4>
                    <p>
                      {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email})
                    </p>
                    <p>
                      {salon.city}, {salon.province}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <input
                      type="checkbox"
                      checked={selSalons.has(salon.id)}
                      onChange={(e) => {
                        setSelSalons((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) {
                            next.add(salon.id);
                          } else {
                            next.delete(salon.id);
                          }
                          return next;
                        });
                      }}
                    />
                    <button
                      className={styles.approveButton}
                      onClick={() => void handleUpdateStatus('salon', salon.id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => void handleUpdateStatus('salon', salon.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending salons.</p>
            )}
          </>
        )}

        {view === 'services' && (
          <>
            <div
              className={styles.filterBar}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                placeholder="Filter by service or salon..."
                className={styles.searchInput}
                style={{ minWidth: '200px', maxWidth: '300px' }}
              />
              {pendingServices.length > 0 && (
                <>
                  <input
                    type="checkbox"
                    checked={
                      selServices.size === filteredPendingServices.length &&
                      filteredPendingServices.length > 0
                    }
                    onChange={(e) =>
                      setSelServices(
                        e.target.checked
                          ? new Set(filteredPendingServices.map((service) => service.id))
                          : new Set(),
                      )
                    }
                  />
                  <span>Select all ({filteredPendingServices.length})</span>
                  <button
                    className={styles.approveButton}
                    disabled={selServices.size === 0}
                    onClick={() => bulkUpdate('service', Array.from(selServices), 'APPROVED')}
                  >
                    Approve selected
                  </button>
                  <button
                    className={styles.rejectButton}
                    disabled={selServices.size === 0}
                    onClick={() => bulkUpdate('service', Array.from(selServices), 'REJECTED')}
                  >
                    Reject selected
                  </button>
                </>
              )}
            </div>

            {filteredPendingServices.length > 0 ? (
              filteredPendingServices.map((service) => (
                <div key={service.id} className={styles.listItem}>
                  <div className={styles.info}>
                    <h4>{service.title}</h4>
                    <p>{service.salon?.name ?? 'Unknown salon'}</p>
                    <p>R{service.price}</p>
                  </div>
                  <div className={styles.actions}>
                    <input
                      type="checkbox"
                      checked={selServices.has(service.id)}
                      onChange={(e) => {
                        setSelServices((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) {
                            next.add(service.id);
                          } else {
                            next.delete(service.id);
                          }
                          return next;
                        });
                      }}
                    />
                    <button
                      className={styles.approveButton}
                      onClick={() => void handleUpdateStatus('service', service.id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => void handleUpdateStatus('service', service.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending services.</p>
            )}
          </>
        )}

        {view === 'bookings' && (
          <>
            <div className={styles.filterBar}>
              <button
                type="button"
                className={styles.approveButton}
                onClick={handleExportBookings}
              >
                Export CSV
              </button>
            </div>

            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={`${booking.sourceType}-${booking.id}`} className={styles.listItem}>
                  <div className={styles.info}>
                    <h4>{booking.clientName} • {booking.serviceName}</h4>
                    <p>{booking.salonName}</p>
                    <p>
                      {new Date(booking.bookingTime).toLocaleString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>Status: {booking.status.replace(/_/g, ' ').toLowerCase()}</p>
                    <p>Source: {booking.sourceType === 'WHATSAPP_INTENT' ? 'WhatsApp intent' : 'Account booking'}</p>
                    {booking.clientPhone && <p>Phone: {booking.clientPhone}</p>}
                    {booking.clientEmail && <p>Email: {booking.clientEmail}</p>}
                    <p>Total: R{booking.totalCost.toFixed(2)}</p>
                    {booking.depositAmount > 0 && <p>Deposit rule: R{booking.depositAmount.toFixed(2)}</p>}
                    {booking.notes && <p>Notes: {booking.notes}</p>}
                  </div>
                  <div className={styles.actions}>
                    {booking.whatsappClicks !== null && booking.whatsappClicks !== undefined && (
                      <span className={styles.statusBadge}>
                        WhatsApp clicks: {booking.whatsappClicks}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No bookings found yet.</p>
            )}
          </>
        )}

        {view === 'all-salons' && (
          <AllSalons
            salons={allSalons}
            onSalonsUpdate={setAllSalons}
            onOpenDeleteModal={(salon) => {
              void openDeleteSalonModal(salon);
            }}
            backendJwt={session?.backendJwt}
          />
        )}

        {view === 'pending-payments' && (
          <AdminPendingPaymentsSection
            pendingPaymentSalons={pendingPaymentSalons}
            updatingSalonPlanId={updatingSalonPlanId}
            onCopyReference={copyToClipboard}
            onUpdateSalonPaymentStatus={(salonId, status) => {
              void updateSalonPaymentStatus(salonId, status);
            }}
          />
        )}

        {view === 'deleted-salons' && (
          <AdminDeletedSalonsSection
            deletedSalons={deletedSalons}
            onRestoreDeletedSalon={(archiveId) => {
              void restoreDeletedSalon(archiveId);
            }}
          />
        )}

        {view === 'audit' && (
          <AdminAuditSection
            auditLogs={auditLogs}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
        )}
      </div>
    </AdminLayout>
  );
}
