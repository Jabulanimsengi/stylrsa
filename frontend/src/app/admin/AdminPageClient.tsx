// frontend/src/app/admin/AdminPageClient.tsx

'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminPage.module.css';
import AdminLayout from './AdminLayout';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AllSalons from './components/AllSalons/AllSalons';
import { DEFAULT_ADMIN_VIEW, getAdminPath, type AdminView } from './admin-config';
import {
  AdminAuditLog,
  DeletedSalonArchiveRow,
  PendingSalon,
  PendingService,
  PendingReview,
  PLAN_PAYMENT_LABELS,
  formatRand,
  ensureArray,
} from './types';
import type {
  ApprovalStatus,
  PlanCode,
  PlanPaymentStatus,
} from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/lib/notify';
import type { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
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
  const { data: session } = useSession();
  const { authStatus, user } = useAuth();
  const [pendingSalons, setPendingSalons] = useState<PendingSalon[]>([]);
  const [allSalons, setAllSalons] = useState<PendingSalon[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [deletedSalons, setDeletedSalons] = useState<DeletedSalonArchiveRow[]>([]);
  const [auditLogs] = useState<AdminAuditLog[]>([]);
  const [view, setView] = useState<AdminView>(initialView);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingSalon, setDeletingSalon] = useState<PendingSalon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Bulk selection state
  const [selSalons, setSelSalons] = useState<Set<string>>(new Set());
  const [selServices, setSelServices] = useState<Set<string>>(new Set());
  const [selReviews, setSelReviews] = useState<Set<string>>(new Set());
  const [updatingSalonPlanId, setUpdatingSalonPlanId] = useState<string | null>(null);
  // Collapsible items - track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Computed: Count salons with pending payment verification
  const pendingPaymentSalons = useMemo(() => allSalons.filter(s => s.planPaymentStatus === 'PROOF_SUBMITTED'), [allSalons]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filters for pending items
  const [salonFilter, setSalonFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [reviewFilter, setReviewFilter] = useState('');

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  // Filtered pending items
  const filteredPendingSalons = useMemo(() => {
    const q = salonFilter.trim().toLowerCase();
    if (!q) return pendingSalons;
    return pendingSalons.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.owner.email.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.province?.toLowerCase().includes(q)
    );
  }, [pendingSalons, salonFilter]);

  const filteredPendingServices = useMemo(() => {
    const q = serviceFilter.trim().toLowerCase();
    if (!q) return pendingServices;
    return pendingServices.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.salon?.name?.toLowerCase().includes(q)
    );
  }, [pendingServices, serviceFilter]);

  const filteredPendingReviews = useMemo(() => {
    const q = reviewFilter.trim().toLowerCase();
    if (!q) return pendingReviews;
    return pendingReviews.filter(r =>
      r.comment?.toLowerCase().includes(q) ||
      r.author?.firstName?.toLowerCase().includes(q) ||
      r.salon?.name?.toLowerCase().includes(q)
    );
  }, [pendingReviews, reviewFilter]);

  const clearSelections = () => { setSelSalons(new Set()); setSelServices(new Set()); setSelReviews(new Set()); };

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(value);
      notify.success(successMessage);
    } catch {
      notify.error('Unable to copy to clipboard');
    }
  };

  const updateSalonPaymentStatus = async (
    salonId: string,
    status: PlanPaymentStatus,
  ) => {
    const authHeaders: Record<string, string> = session?.backendJwt
      ? { Authorization: `Bearer ${session.backendJwt}` }
      : {};
    setUpdatingSalonPlanId(salonId);
    try {
      const res = await fetch(`/api/admin/salons/${salonId}/plan/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        notify.error(`Failed to update payment status (${res.status}). ${msg}`);
        return;
      }
      const updated = await res.json();
      setPendingSalons((prev) =>
        prev.map((salon) =>
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
            : salon,
        ),
      );
      setAllSalons((prev) =>
        prev.map((salon) =>
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
            : salon,
        ),
      );
      notify.success('Payment status updated');
    } catch (error) {
      notify.error('Failed to update payment status');
    } finally {
      setUpdatingSalonPlanId(null);
    }
  };

  const bulkUpdate = async (type: 'salon' | 'service' | 'review', ids: string[], status: ApprovalStatus) => {
    if (ids.length === 0) return;
    await Promise.all(ids.map(id => fetch(
      type === 'salon' ? `/api/admin/salons/${id}/status` :
        type === 'service' ? `/api/admin/services/${id}/status` :
          `/api/admin/reviews/${id}/status`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ approvalStatus: status }) }
    )));
    if (type === 'salon') setPendingSalons(prev => prev.filter(x => !ids.includes(x.id)));
    if (type === 'service') setPendingServices(prev => prev.filter(x => !ids.includes(x.id)));
    if (type === 'review') setPendingReviews(prev => prev.filter(x => !ids.includes(x.id)));
    clearSelections();
    notify.success(`Updated ${ids.length} ${type}${ids.length > 1 ? 's' : ''}`);
  };

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }
    if (authStatus !== 'authenticated' || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      // FIX: Use relative URLs instead of hardcoding localhost.
      const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
      const requestOptions = { credentials: 'include' as const, headers: authHeaders } as const;

      try {
        const ts = Date.now();
        const noStore: RequestInit = { ...requestOptions, cache: 'no-store' } as any;
        const [pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, deletedSalonsRes] = await Promise.all([
          fetch(`/api/admin/salons/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/all?ts=${ts}`, noStore),
          fetch(`/api/admin/services/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/reviews/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/deleted?ts=${ts}`, noStore),
        ]);

        if ([pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, deletedSalonsRes].some(res => res.status === 401)) {
          router.push('/login');
          return;
        }

        // This is where the original error happened. With the backend fix, it should now work.
        setPendingSalons(ensureArray<PendingSalon>(await pendingSalonsRes.json()));
        setAllSalons(ensureArray<PendingSalon>(await allSalonsRes.json()));
        setPendingServices(ensureArray<PendingService>(await servicesRes.json()));
        setPendingReviews(ensureArray<PendingReview>(await reviewsRes.json()));
        setDeletedSalons(ensureArray<DeletedSalonArchiveRow>(await deletedSalonsRes.json()));

      } catch (error) {
        logger.error("Failed to fetch admin data:", error);
        notify.error(toFriendlyMessage(error, 'Failed to load admin data. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Realtime updates - dynamically import socket.io to reduce bundle size
    let socket: Socket | null = null;
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io('/', { transports: ['websocket'], withCredentials: true });
        const getAuthHeaders = (): Record<string, string> => {
          return session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
        };
        socket.on('salon:deleted', async () => {
          try {
            const authHeaders = getAuthHeaders();
            const [allRes, delRes] = await Promise.all([
              fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/salons/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
            ]);
            if (allRes.ok) setAllSalons(ensureArray<PendingSalon>(await allRes.json()));
            if (delRes.ok) setDeletedSalons(ensureArray<PendingSalon>(await delRes.json()));
          } catch { }
        });
        socket.on('visibility:updated', async () => {
          try {
            const authHeaders = getAuthHeaders();
            const [allRes] = await Promise.all([
              fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
            ]);
            if (allRes.ok) setAllSalons(ensureArray<PendingSalon>(await allRes.json()));
          } catch { }
        });
      } catch { }
    };
    initSocket();

    return () => { try { socket?.disconnect(); } catch { } };
  }, [authStatus, user, router, session?.backendJwt]);

  const handleUpdateStatus = async (type: 'salon' | 'service' | 'review', id: string, status: ApprovalStatus) => {
    if (authStatus !== 'authenticated') {
      router.push('/login');
      return;
    }

    let url = '';
    switch (type) {
      case 'salon': url = `/api/admin/salons/${id}/status`; break;
      case 'service': url = `/api/admin/services/${id}/status`; break;
      case 'review': url = `/api/admin/reviews/${id}/status`; break;
    }

    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      credentials: 'include',
      body: JSON.stringify({ approvalStatus: status }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      notify.error(`Failed to update status (${res.status}). ${msg}`);
      return;
    }

    if (type === 'salon') setPendingSalons(pendingSalons.filter(s => s.id !== id));
    if (type === 'service') setPendingServices(pendingServices.filter(s => s.id !== id));
    if (type === 'review') setPendingReviews(pendingReviews.filter(r => r.id !== id));
  };

  const openDeleteSalonModal = (salon: PendingSalon) => {
    setDeletingSalon(salon);
    setDeleteReason('');
    setShowDeleteModal(true);
    setIsDeleting(false);
  };

  const confirmDeleteSalon = async () => {
    if (!deletingSalon || isDeleting) return;
    if (!deleteReason.trim()) {
      notify.error('Please provide a reason for deletion.');
      return;
    }

    setIsDeleting(true);
    const id = deletingSalon.id;
    const authHeaders: Record<string, string> = session?.backendJwt
      ? { Authorization: `Bearer ${session.backendJwt}` }
      : {};
    try {
      const res = await fetch(`/api/admin/salons/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ reason: deleteReason.trim() }),
      });

      if (res.ok || res.status === 404) {
        setAllSalons((prev) => prev.filter((s) => s.id !== id));
        setShowDeleteModal(false);
        setDeletingSalon(null);
        setDeleteReason('');
        notify.success(
          res.status === 404 ? 'Profile was already removed' : 'Profile deleted',
        );
        try {
          const r = await fetch(`/api/admin/salons/deleted?ts=${Date.now()}`, {
            credentials: 'include',
            cache: 'no-store' as any,
            headers: authHeaders,
          });
          if (r.ok) {
            const deleted = await r.json();
            setDeletedSalons(ensureArray<any>(deleted));
          }
        } catch {
          // no-op
        }
      } else {
        const msg = await res.text().catch(() => '');
        notify.error(`Failed to delete (${res.status}). ${msg}`);
      }
    } catch (err) {
      notify.error('Failed to delete salon.');
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreDeletedSalon = async (archiveId: string) => {
    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
    const res = await fetch(`/api/admin/salons/deleted/${archiveId}/restore`, {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders,
    });
    if (res.ok) {
      notify.success('Profile restored');
      try {
        const [allRes, delRes] = await Promise.all([
          fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
          fetch(`/api/admin/salons/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
        ]);
        if (allRes.ok) setAllSalons(ensureArray<PendingSalon>(await allRes.json()));
        if (delRes.ok) setDeletedSalons(await delRes.json());
      } catch { }
    } else {
      const msg = await res.text().catch(() => '');
      notify.error(`Failed to restore (${res.status}). ${msg}`);
    }
  };

  if (isLoading || authStatus === 'loading') return <LoadingSpinner />;

  // Calculate pending counts for the sidebar
  const pendingCounts = {
    salons: pendingSalons.length,
    services: pendingServices.length,
    reviews: pendingReviews.length,
    promotions: 0,
    payments: pendingPaymentSalons.length,
  };

  // Dashboard metrics
  const dashboardMetrics = {
    totalSalons: allSalons.length,
    pendingApprovals: pendingSalons.length + pendingServices.length + pendingReviews.length,
    pendingPayments: pendingPaymentSalons.length,
  };

  // Handle view changes with special cases
  const handleViewChange = async (newView: AdminView) => {
    router.push(getAdminPath(newView));
    setView(newView);
  };

  return (
    <>
      <AdminLayout
        currentView={view}
        onViewChange={handleViewChange}
        pendingCounts={pendingCounts}
      >

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <AdminDashboard
            metrics={dashboardMetrics}
            onNavigate={handleViewChange}
          />
        )}

        <div className={styles.list}>
          {view === 'salons' && (
            <>
              {/* Filter and bulk actions bar */}
              <div className={styles.filterBar} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={salonFilter}
                  onChange={e => setSalonFilter(e.target.value)}
                  placeholder="Filter by name, email, city..."
                  className={styles.searchInput}
                  style={{ minWidth: '200px', maxWidth: '300px' }}
                />
                {pendingSalons.length > 0 && (
                  <>
                    <input type="checkbox" checked={selSalons.size === filteredPendingSalons.length && filteredPendingSalons.length > 0} onChange={e => setSelSalons(e.target.checked ? new Set(filteredPendingSalons.map(s => s.id)) : new Set())} />
                    <span>Select all ({filteredPendingSalons.length})</span>
                    <button className={styles.approveButton} disabled={selSalons.size === 0} onClick={() => bulkUpdate('salon', Array.from(selSalons), 'APPROVED')}>Approve selected</button>
                    <button className={styles.rejectButton} disabled={selSalons.size === 0} onClick={() => bulkUpdate('salon', Array.from(selSalons), 'REJECTED')}>Reject selected</button>
                  </>
                )}
              </div>
              {filteredPendingSalons.length > 0 ? filteredPendingSalons.map((salon) => {
                const planCode = (salon.planCode ?? 'PREMIUM') as PlanCode;
                const plan = PLAN_BY_CODE[planCode] ?? APP_PLANS[0];
                const amountDue =
                  typeof salon.planPriceCents === 'number'
                    ? formatRand(salon.planPriceCents)
                    : plan.price;
                const paymentStatus = (salon.planPaymentStatus ??
                  'PENDING_SELECTION') as PlanPaymentStatus;
                const isFree = planCode === 'FREE';
                const proofSubmittedAt = salon.planProofSubmittedAt
                  ? new Date(salon.planProofSubmittedAt).toLocaleString('en-ZA')
                  : null;
                const verifiedAt = salon.planVerifiedAt
                  ? new Date(salon.planVerifiedAt).toLocaleString('en-ZA')
                  : null;
                const isUpdating = updatingSalonPlanId === salon.id;
                const reference = salon.planPaymentReference ?? salon.name;
                const isExpanded = expandedItems.has(salon.id);
                const location = [salon.city, salon.province].filter(Boolean).join(', ') || 'Location not set';

                return (
                  <div key={salon.id} className={styles.collapsibleItem}>
                    {/* Collapsible Header - always visible */}
                    <div
                      className={styles.collapsibleHeader}
                      onClick={() => toggleExpanded(salon.id)}
                    >
                      <div className={styles.collapsibleHeaderLeft}>
                        <input
                          type="checkbox"
                          className={styles.collapsibleCheckbox}
                          checked={selSalons.has(salon.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const ns = new Set(selSalons);
                            if (e.target.checked) ns.add(salon.id);
                            else ns.delete(salon.id);
                            setSelSalons(ns);
                          }}
                        />
                        <span className={styles.collapsibleName} title={salon.name}>{salon.name}</span>
                        <span className={styles.collapsibleLocation} title={location}>{location}</span>
                      </div>
                      <div className={styles.collapsibleHeaderRight}>
                        <span className={`${styles.collapsibleStatus} ${isFree ? styles.free : styles.pending}`}>
                          {isFree ? 'FREE' : 'Pending'}
                        </span>
                        <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>▼</span>
                      </div>
                    </div>

                    {/* Collapsible Content - shown when expanded */}
                    {isExpanded && (
                      <div className={styles.collapsibleContent}>
                        <div className={styles.info}>
                          <h4>{salon.name}</h4>
                          <p>Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email})</p>
                          <div className={styles.planInfo}>
                            <div className={styles.planInfoRow}>
                              <span><strong>Package:</strong> {plan.name}</span>
                              <span><strong>Amount due:</strong> {isFree ? 'R0' : amountDue}</span>
                              <span>
                                <strong>Status:</strong>{' '}
                                {isFree ? (
                                  <span className={`${styles.planBadge} ${styles[`planStatus_verified`]}`}>No payment required</span>
                                ) : (
                                  <span className={`${styles.planBadge} ${styles[`planStatus_${paymentStatus.toLowerCase()}`]}`}>
                                    {PLAN_PAYMENT_LABELS[paymentStatus]}
                                  </span>
                                )}
                              </span>
                            </div>
                            {!isFree && (
                              <>
                                <div className={styles.planInfoRow}>
                                  <span>
                                    <strong>Reference:</strong>{' '}
                                    <code className={styles.planReference}>{reference}</code>
                                    <button
                                      type="button"
                                      className={styles.copyButton}
                                      onClick={() => copyToClipboard(reference, 'Reference copied')}
                                    >
                                      Copy
                                    </button>
                                  </span>
                                  {proofSubmittedAt && <span>Proof submitted: {proofSubmittedAt}</span>}
                                  {verifiedAt && <span>Verified on: {verifiedAt}</span>}
                                </div>
                                <div className={styles.planAdminActions}>
                                  <button
                                    type="button"
                                    className={styles.approveButton}
                                    onClick={() => updateSalonPaymentStatus(salon.id, 'VERIFIED')}
                                    disabled={isUpdating || paymentStatus === 'VERIFIED'}
                                  >
                                    {isUpdating && paymentStatus !== 'VERIFIED' ? 'Saving…' : 'Mark verified'}
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.approveButton}
                                    onClick={() => updateSalonPaymentStatus(salon.id, 'PROOF_SUBMITTED')}
                                    disabled={isUpdating || paymentStatus === 'PROOF_SUBMITTED'}
                                  >
                                    {isUpdating && paymentStatus === 'PROOF_SUBMITTED' ? 'Saving…' : 'Proof received'}
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.rejectButton}
                                    onClick={() => updateSalonPaymentStatus(salon.id, 'AWAITING_PROOF')}
                                    disabled={isUpdating || paymentStatus === 'AWAITING_PROOF'}
                                  >
                                    {isUpdating && paymentStatus === 'AWAITING_PROOF' ? 'Saving…' : 'Awaiting proof'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className={styles.actions}>
                          <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                          <button onClick={() => handleUpdateStatus('salon', salon.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                          <button onClick={() => handleUpdateStatus('salon', salon.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }) : <p>No pending salons.</p>}
            </>
          )}

          {view === 'all-salons' && (
            <AllSalons
              salons={allSalons}
              onSalonsUpdate={setAllSalons}
              onOpenDeleteModal={openDeleteSalonModal}
              backendJwt={session?.backendJwt}
            />
          )}
          {view === 'deleted-salons' && (
            <AdminDeletedSalonsSection
              deletedSalons={deletedSalons}
              onRestoreDeletedSalon={restoreDeletedSalon}
            />
          )}
          {view === 'services' && (
            <>
              {/* Filter and bulk actions bar */}
              <div className={styles.filterBar} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={serviceFilter}
                  onChange={e => setServiceFilter(e.target.value)}
                  placeholder="Filter by service title or salon..."
                  className={styles.searchInput}
                  style={{ minWidth: '200px', maxWidth: '300px' }}
                />
                {pendingServices.length > 0 && (
                  <>
                    <input type="checkbox" checked={selServices.size === filteredPendingServices.length && filteredPendingServices.length > 0} onChange={e => setSelServices(e.target.checked ? new Set(filteredPendingServices.map(s => s.id)) : new Set())} />
                    <span>Select all ({filteredPendingServices.length})</span>
                    <button className={styles.approveButton} disabled={selServices.size === 0} onClick={() => bulkUpdate('service', Array.from(selServices), 'APPROVED')}>Approve selected</button>
                    <button className={styles.rejectButton} disabled={selServices.size === 0} onClick={() => bulkUpdate('service', Array.from(selServices), 'REJECTED')}>Reject selected</button>
                  </>
                )}
              </div>
              {filteredPendingServices.length > 0 ? filteredPendingServices.map(service => {
                const isExpanded = expandedItems.has(service.id);
                return (
                  <div key={service.id} className={styles.collapsibleItem}>
                    <div className={styles.collapsibleHeader} onClick={() => toggleExpanded(service.id)}>
                      <div className={styles.collapsibleHeaderLeft}>
                        <input
                          type="checkbox"
                          className={styles.collapsibleCheckbox}
                          checked={selServices.has(service.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const ns = new Set(selServices);
                            if (e.target.checked) ns.add(service.id);
                            else ns.delete(service.id);
                            setSelServices(ns);
                          }}
                        />
                        <span className={styles.collapsibleName} title={service.title}>{service.title}</span>
                        <span className={styles.collapsibleLocation}>{service.salon?.name || 'Unknown Salon'}</span>
                      </div>
                      <div className={styles.collapsibleHeaderRight}>
                        <span className={`${styles.collapsibleStatus} ${styles.pending}`}>Pending</span>
                        <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>▼</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className={styles.collapsibleContent}>
                        <div className={styles.info}>
                          <h4>{service.title}</h4>
                          <p>Salon: {service.salon?.name || 'Unknown'}</p>
                          {service.description && <p style={{ color: '#666', fontSize: '0.9rem' }}>{service.description}</p>}
                          {service.price != null && <p><strong>Price:</strong> R{service.price.toFixed(2)}</p>}
                          {service.duration != null && <p><strong>Duration:</strong> {service.duration} min</p>}
                        </div>
                        <div className={styles.actions}>
                          <button onClick={() => handleUpdateStatus('service', service.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                          <button onClick={() => handleUpdateStatus('service', service.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }) : <p>No pending services.</p>}
            </>
          )}

          {view === 'reviews' && (
            <>
              {/* Filter and bulk actions bar */}
              <div className={styles.filterBar} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={reviewFilter}
                  onChange={e => setReviewFilter(e.target.value)}
                  placeholder="Filter by reviewer, salon, comment..."
                  className={styles.searchInput}
                  style={{ minWidth: '200px', maxWidth: '300px' }}
                />
                {pendingReviews.length > 0 && (
                  <>
                    <input type="checkbox" checked={selReviews.size === filteredPendingReviews.length && filteredPendingReviews.length > 0} onChange={e => setSelReviews(e.target.checked ? new Set(filteredPendingReviews.map(s => s.id)) : new Set())} />
                    <span>Select all ({filteredPendingReviews.length})</span>
                    <button className={styles.approveButton} disabled={selReviews.size === 0} onClick={() => bulkUpdate('review', Array.from(selReviews), 'APPROVED')}>Approve selected</button>
                    <button className={styles.rejectButton} disabled={selReviews.size === 0} onClick={() => bulkUpdate('review', Array.from(selReviews), 'REJECTED')}>Reject selected</button>
                  </>
                )}
              </div>
              {filteredPendingReviews.length > 0 ? filteredPendingReviews.map(review => {
                const isExpanded = expandedItems.has(review.id);
                const truncatedComment = review.comment?.length > 40 ? `${review.comment.slice(0, 40)}...` : review.comment;
                return (
                  <div key={review.id} className={styles.collapsibleItem}>
                    <div className={styles.collapsibleHeader} onClick={() => toggleExpanded(review.id)}>
                      <div className={styles.collapsibleHeaderLeft}>
                        <input
                          type="checkbox"
                          className={styles.collapsibleCheckbox}
                          checked={selReviews.has(review.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const ns = new Set(selReviews);
                            if (e.target.checked) ns.add(review.id);
                            else ns.delete(review.id);
                            setSelReviews(ns);
                          }}
                        />
                        <span className={styles.collapsibleName} title={review.author?.firstName}>{review.author?.firstName || 'Anonymous'} ({review.rating}★)</span>
                        <span className={styles.collapsibleLocation} title={review.salon?.name}>{review.salon?.name || 'Unknown Salon'}</span>
                      </div>
                      <div className={styles.collapsibleHeaderRight}>
                        <span className={`${styles.collapsibleStatus} ${styles.pending}`}>Pending</span>
                        <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>▼</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className={styles.collapsibleContent}>
                        <div className={styles.info}>
                          <h4>"{review.comment}" ({review.rating} ★)</h4>
                          <p>By: {review.author?.firstName || 'Anonymous'} | For Salon: {review.salon?.name || 'Unknown'}</p>
                          {review.createdAt && <p style={{ color: '#666', fontSize: '0.85rem' }}>Submitted: {new Date(review.createdAt).toLocaleString()}</p>}
                        </div>
                        <div className={styles.actions}>
                          <button onClick={() => handleUpdateStatus('review', review.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                          <button onClick={() => handleUpdateStatus('review', review.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }) : <p>No pending reviews.</p>}
            </>
          )}

          {view === 'pending-payments' && (
            <AdminPendingPaymentsSection
              pendingPaymentSalons={pendingPaymentSalons}
              updatingSalonPlanId={updatingSalonPlanId}
              onCopyReference={copyToClipboard}
              onUpdateSalonPaymentStatus={updateSalonPaymentStatus}
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

        {showDeleteModal && deletingSalon && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', color: '#000', padding: '1rem', borderRadius: 8, maxWidth: 560, width: '96%', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
              <h3 style={{ marginTop: 0 }}>Delete Provider Profile</h3>
              <p style={{ color: '#a00', fontWeight: 600 }}>Caution: This will remove the provider profile and all their listings from the platform. You can later restore it from Deleted Profiles.</p>
              <p><strong>Provider:</strong> {deletingSalon.name}</p>
              <label style={{ display: 'block', margin: '0.5rem 0' }}>Reason (required)</label>
              <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} rows={4} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 6 }} placeholder="Enter reason for deletion" />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button className={styles.approveButton} onClick={confirmDeleteSalon} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</button>
                <button className={styles.rejectButton} onClick={() => { setShowDeleteModal(false); setDeletingSalon(null); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}

