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
  DeletedSellerArchiveRow,
  PendingSalon,
  PendingPromotionRow,
  PendingService,
  PendingReview,
  PendingProduct,
  SellerRow,
  SellerDeletionTarget,
  PLAN_PAYMENT_LABELS,
  formatRand,
  ensureArray,
  Top10RequestRow,
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
import AdminMediaReview from '@/components/AdminMediaReview';
import AdminTrendsManager from '@/components/AdminTrendsManager/AdminTrendsManager';
import AdminSalonTrendzManager from '@/components/AdminSalonTrendzManager/AdminSalonTrendzManager';
import AdminBlogManager from '@/components/AdminBlogManager/AdminBlogManager';
import AdminPendingPaymentsSection from './components/AdminPendingPaymentsSection';
import AdminTop10RequestsSection from './components/AdminTop10RequestsSection';
import AdminAuditSection from './components/AdminAuditSection';
import AdminPromotionsSection from './components/AdminPromotionsSection';
import AdminDeletedSellersSection from './components/AdminDeletedSellersSection';
import AdminDeletedSalonsSection from './components/AdminDeletedSalonsSection';
import RejectReasonModal from '@/components/RejectReasonModal/RejectReasonModal';

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
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [pendingPromotions, setPendingPromotions] = useState<PendingPromotionRow[]>([]);
  const [deletedSalons, setDeletedSalons] = useState<DeletedSalonArchiveRow[]>([]);
  const [deletedSellers, setDeletedSellers] = useState<DeletedSellerArchiveRow[]>([]);
  const [allSellers, setAllSellers] = useState<SellerRow[]>([]);
  const [auditLogs] = useState<AdminAuditLog[]>([]);
  const [featuredSalons, setFeaturedSalons] = useState<PendingSalon[]>([]);
  const [availableSalons, setAvailableSalons] = useState<PendingSalon[]>([]);
  const [featureDuration, setFeatureDuration] = useState<number>(30);
  const [view, setView] = useState<AdminView>(initialView);
  const [top10Requests, setTop10Requests] = useState<Top10RequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingSalon, setDeletingSalon] = useState<PendingSalon | null>(null);
  const [deletingSeller, setDeletingSeller] = useState<SellerDeletionTarget | null>(null);
  const [deleteMode, setDeleteMode] = useState<'salon' | 'seller'>('salon');
  const [isDeleting, setIsDeleting] = useState(false);
  // Bulk selection state
  const [selSalons, setSelSalons] = useState<Set<string>>(new Set());
  const [selServices, setSelServices] = useState<Set<string>>(new Set());
  const [selReviews, setSelReviews] = useState<Set<string>>(new Set());
  const [selProducts, setSelProducts] = useState<Set<string>>(new Set());
  const [updatingSalonPlanId, setUpdatingSalonPlanId] = useState<string | null>(null);
  const [updatingSellerPlanId, setUpdatingSellerPlanId] = useState<string | null>(null);
  // Collapsible items - track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Reject Promotion modal state
  const [rejectPromoModalOpen, setRejectPromoModalOpen] = useState(false);
  const [rejectingPromotionId, setRejectingPromotionId] = useState<string | null>(null);
  const [isRejectingPromo, setIsRejectingPromo] = useState(false);


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
  const [productFilter, setProductFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');

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

  const filteredPendingProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return pendingProducts;
    return pendingProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.seller?.firstName?.toLowerCase().includes(q) ||
      p.seller?.lastName?.toLowerCase().includes(q)
    );
  }, [pendingProducts, productFilter]);

  const filteredAllSellers = useMemo(() => {
    const q = sellerFilter.trim().toLowerCase();
    if (!q) return allSellers;
    return allSellers.filter(s =>
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.sellerBusinessName?.toLowerCase().includes(q)
    );
  }, [allSellers, sellerFilter]);

  const clearSelections = () => { setSelSalons(new Set()); setSelServices(new Set()); setSelReviews(new Set()); setSelProducts(new Set()); };

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

  const updateSellerPaymentStatus = async (
    sellerId: string,
    status: PlanPaymentStatus,
  ) => {
    const authHeaders: Record<string, string> = session?.backendJwt
      ? { Authorization: `Bearer ${session.backendJwt}` }
      : {};
    setUpdatingSellerPlanId(sellerId);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/plan/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        notify.error(`Failed to update seller payment (${res.status}). ${msg}`);
        return;
      }
      const updated = await res.json();
      notify.success('Seller payment status updated');
      setPendingProducts((prev) =>
        prev.map((product) =>
          product.seller.id === sellerId
            ? {
              ...product,
              seller: {
                ...product.seller,
                sellerPlanPaymentStatus:
                  updated.sellerPlanPaymentStatus ?? status,
                sellerPlanPaymentReference:
                  updated.sellerPlanPaymentReference ??
                  product.seller.sellerPlanPaymentReference,
                sellerPlanProofSubmittedAt:
                  updated.sellerPlanProofSubmittedAt ??
                  product.seller.sellerPlanProofSubmittedAt,
                sellerPlanVerifiedAt:
                  updated.sellerPlanVerifiedAt ??
                  product.seller.sellerPlanVerifiedAt,
                sellerPlanPriceCents:
                  typeof updated.sellerPlanPriceCents === 'number'
                    ? updated.sellerPlanPriceCents
                    : product.seller.sellerPlanPriceCents,
                sellerPlanCode:
                  updated.sellerPlanCode ?? product.seller.sellerPlanCode,
              },
            }
            : product,
        ),
      );
      // Also update allSellers list
      setAllSellers((prev) =>
        prev.map((seller) =>
          seller.id === sellerId
            ? {
              ...seller,
              sellerPlanPaymentStatus: updated.sellerPlanPaymentStatus ?? status,
              sellerPlanPaymentReference: updated.sellerPlanPaymentReference ?? seller.sellerPlanPaymentReference,
              sellerPlanProofSubmittedAt: updated.sellerPlanProofSubmittedAt ?? seller.sellerPlanProofSubmittedAt,
              sellerPlanVerifiedAt: updated.sellerPlanVerifiedAt ?? seller.sellerPlanVerifiedAt,
            }
            : seller
        )
      );
    } catch (error) {
      notify.error('Failed to update seller payment status');
    } finally {
      setUpdatingSellerPlanId(null);
    }
  };

  const updateSellerApprovalStatus = async (
    sellerId: string,
    status: ApprovalStatus,
  ) => {
    const authHeaders: Record<string, string> = session?.backendJwt
      ? { Authorization: `Bearer ${session.backendJwt}` }
      : {};
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error('Failed to update approval status');
      }
      const updated = await res.json();
      notify.success(`Seller profile ${status.toLowerCase()}`);
      setAllSellers((prev) =>
        prev.map((seller) =>
          seller.id === sellerId
            ? {
              ...seller,
              sellerApprovalStatus: updated.sellerApprovalStatus ?? status,
              sellerApprovedAt: updated.sellerApprovedAt ?? (status === 'APPROVED' ? new Date().toISOString() : null),
            }
            : seller
        )
      );
    } catch (error) {
      notify.error('Failed to update approval status');
    }
  };

  const bulkUpdate = async (type: 'salon' | 'service' | 'review' | 'product', ids: string[], status: ApprovalStatus) => {
    if (ids.length === 0) return;
    await Promise.all(ids.map(id => fetch(
      type === 'salon' ? `/api/admin/salons/${id}/status` :
        type === 'service' ? `/api/admin/services/${id}/status` :
          type === 'review' ? `/api/admin/reviews/${id}/status` : `/api/admin/products/${id}/status`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ approvalStatus: status }) }
    )));
    if (type === 'salon') setPendingSalons(prev => prev.filter(x => !ids.includes(x.id)));
    if (type === 'service') setPendingServices(prev => prev.filter(x => !ids.includes(x.id)));
    if (type === 'review') setPendingReviews(prev => prev.filter(x => !ids.includes(x.id)));
    if (type === 'product') setPendingProducts(prev => prev.filter(x => !ids.includes(x.id)));
    clearSelections();
    notify.success(`Updated ${ids.length} ${type}${ids.length > 1 ? 's' : ''}`);
  };

  const fetchFeaturedSalons = useCallback(async () => {
    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};

    logger.info('Fetching featured salons management data...', { hasAuth: !!session?.backendJwt });

    try {
      const res = await fetch(`/api/admin/salons/featured/manage?ts=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store' as any,
        headers: authHeaders,
      });

      logger.info('Fetch featured salons response:', { status: res.status, ok: res.ok });

      if (res.ok) {
        const data = await res.json();
        setFeaturedSalons(ensureArray<PendingSalon>(data.featured));
        setAvailableSalons(ensureArray<PendingSalon>(data.available));
        logger.info('Featured salons loaded:', {
          featured: data.featured?.length || 0,
          available: data.available?.length || 0
        });
      } else {
        const msg = await res.text().catch(() => '');
        logger.error('Failed to fetch featured salons:', { status: res.status, message: msg });
        notify.error(`Failed to load featured salons (${res.status}): ${msg || 'Unknown error'}`);
      }
    } catch (error) {
      logger.error('Exception fetching featured salons:', error);
      notify.error(`Failed to load featured salons: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [session?.backendJwt]);

  const featureSalon = async (salonId: string, durationDays: number) => {
    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};

    logger.info('Featuring salon:', { salonId, durationDays, hasAuth: !!session?.backendJwt });

    try {
      const res = await fetch(`/api/admin/salons/${salonId}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ durationDays }),
      });

      logger.info('Feature salon response:', { status: res.status, ok: res.ok });

      if (res.ok) {
        const data = await res.json();
        notify.success(`Salon featured for ${durationDays} days`);
        logger.info('Salon featured successfully:', data);
        await fetchFeaturedSalons();
      } else {
        const msg = await res.text().catch(() => '');
        logger.error('Failed to feature salon:', { status: res.status, message: msg });
        notify.error(`Failed to feature salon (${res.status}): ${msg || 'Unknown error'}`);
      }
    } catch (error) {
      logger.error('Exception featuring salon:', error);
      notify.error(`Failed to feature salon: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const unfeatureSalon = async (salonId: string) => {
    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
    try {
      const res = await fetch(`/api/admin/salons/${salonId}/unfeature`, {
        method: 'DELETE',
        headers: authHeaders,
        credentials: 'include',
      });
      if (res.ok) {
        notify.success('Salon unfeatured');
        await fetchFeaturedSalons();
      } else {
        const msg = await res.text().catch(() => '');
        notify.error(`Failed to unfeature salon: ${msg}`);
      }
    } catch (error) {
      notify.error('Failed to unfeature salon');
    }
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
        const [pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes, allSellersRes, deletedSalonsRes, deletedSellersRes, promotionsRes] = await Promise.all([
          fetch(`/api/admin/salons/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/all?ts=${ts}`, noStore),
          fetch(`/api/admin/services/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/reviews/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/products/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/sellers/all?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/deleted?ts=${ts}`, noStore),
          fetch(`/api/admin/sellers/deleted?ts=${ts}`, noStore),
          fetch(`/api/promotions/admin/pending?ts=${ts}`, noStore),
        ]);

        if ([pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes, allSellersRes, deletedSalonsRes, deletedSellersRes, promotionsRes].some(res => res.status === 401)) {
          router.push('/login');
          return;
        }

        // This is where the original error happened. With the backend fix, it should now work.
        setPendingSalons(ensureArray<PendingSalon>(await pendingSalonsRes.json()));
        setAllSalons(ensureArray<PendingSalon>(await allSalonsRes.json()));
        setPendingServices(ensureArray<PendingService>(await servicesRes.json()));
        setPendingReviews(ensureArray<PendingReview>(await reviewsRes.json()));
        setPendingProducts(ensureArray<PendingProduct>(await productsRes.json()));
        setAllSellers(ensureArray<SellerRow>(await allSellersRes.json()));
        setDeletedSalons(ensureArray<DeletedSalonArchiveRow>(await deletedSalonsRes.json()));
        setDeletedSellers(ensureArray<DeletedSellerArchiveRow>(await deletedSellersRes.json()));
        setPendingPromotions(ensureArray<PendingPromotionRow>(await promotionsRes.json()));

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
            const [allRes, sellersRes, delRes, deletedSellerRes] = await Promise.all([
              fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/sellers/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/salons/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/sellers/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
            ]);
            if (allRes.ok) setAllSalons(ensureArray<PendingSalon>(await allRes.json()));
            if (sellersRes.ok) setAllSellers(ensureArray<SellerRow>(await sellersRes.json()));
            if (delRes.ok) setDeletedSalons(ensureArray<PendingSalon>(await delRes.json()));
            if (deletedSellerRes.ok) setDeletedSellers(ensureArray<any>(await deletedSellerRes.json()));
          } catch { }
        });
        socket.on('seller:deleted', async () => {
          try {
            const authHeaders = getAuthHeaders();
            const [pendingProductsRes, sellersRes, archivedRes] = await Promise.all([
              fetch(`/api/admin/products/pending?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/sellers/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/sellers/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
            ]);
            if (pendingProductsRes.ok) {
              setPendingProducts(ensureArray<PendingProduct>(await pendingProductsRes.json()));
            }
            if (sellersRes.ok) {
              setAllSellers(ensureArray<SellerRow>(await sellersRes.json()));
            }
            if (archivedRes.ok) {
              setDeletedSellers(ensureArray<any>(await archivedRes.json()));
            }
          } catch { }
        });
        socket.on('visibility:updated', async () => {
          try {
            const authHeaders = getAuthHeaders();
            const [allRes, sellersRes, sellerRes] = await Promise.all([
              fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/sellers/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
              fetch(`/api/admin/sellers/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
            ]);
            if (allRes.ok) setAllSalons(ensureArray<PendingSalon>(await allRes.json()));
            if (sellersRes.ok) setAllSellers(ensureArray<SellerRow>(await sellersRes.json()));
            if (sellerRes.ok) setDeletedSellers(ensureArray<any>(await sellerRes.json()));
          } catch { }
        });
      } catch { }
    };
    initSocket();

    return () => { try { socket?.disconnect(); } catch { } };
  }, [authStatus, user, router, session?.backendJwt]);

  useEffect(() => {
    if (view !== 'featured-salons' && view !== 'top10-requests') {
      return;
    }

    let cancelled = false;

    const loadViewData = async () => {
      if (view === 'featured-salons') {
        await fetchFeaturedSalons();
        return;
      }

      try {
        const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
        const res = await fetch(`/api/salons/top10-requests?ts=${Date.now()}`, {
          credentials: 'include',
          cache: 'no-store' as any,
          headers: authHeaders,
        });
        if (!res.ok || cancelled) {
          return;
        }
        const data = await res.json();
        setTop10Requests(ensureArray<any>(data));
      } catch {
        if (!cancelled) {
          notify.error('Failed to load top 10 requests');
        }
      }
    };

    void loadViewData();

    return () => {
      cancelled = true;
    };
  }, [fetchFeaturedSalons, session?.backendJwt, view]);

  const handleUpdateStatus = async (type: 'salon' | 'service' | 'review' | 'product', id: string, status: ApprovalStatus) => {
    if (authStatus !== 'authenticated') {
      router.push('/login');
      return;
    }

    let url = '';
    switch (type) {
      case 'salon': url = `/api/admin/salons/${id}/status`; break;
      case 'service': url = `/api/admin/services/${id}/status`; break;
      case 'review': url = `/api/admin/reviews/${id}/status`; break;
      case 'product': url = `/api/admin/products/${id}/status`; break;
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
    if (type === 'product') setPendingProducts(pendingProducts.filter(p => p.id !== id));
  };

  const openDeleteSalonModal = (salon: PendingSalon) => {
    setDeletingSalon(salon);
    setDeletingSeller(null);
    setDeleteMode('salon');
    setDeleteReason('');
    setShowDeleteModal(true);
    setIsDeleting(false);
  };

  const openDeleteSellerModal = (sellerId: string, sellerName: string) => {
    setDeletingSeller({ sellerId, name: sellerName });
    setDeletingSalon(null);
    setDeleteMode('seller');
    setDeleteReason('');
    setShowDeleteModal(true);
    setIsDeleting(false);
  };

  const handleApprovePromotion = async (promotionId: string) => {
    if (authStatus !== 'authenticated') {
      router.push('/login');
      return;
    }

    try {
      const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
      const res = await fetch(`/api/promotions/${promotionId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to approve promotion' }));
        throw new Error(errorData.message || 'Failed to approve promotion');
      }

      notify.success('Promotion approved successfully!');
      setPendingPromotions(pendingPromotions.filter(p => p.id !== promotionId));
    } catch (error) {
      notify.error(toFriendlyMessage(error, 'Failed to approve promotion'));
    }
  };

  const handleRejectPromotion = async (promotionId: string) => {
    if (authStatus !== 'authenticated') {
      router.push('/login');
      return;
    }
    // Open modal to collect reason
    setRejectingPromotionId(promotionId);
    setRejectPromoModalOpen(true);
  };

  const confirmRejectPromotion = async (reason: string) => {
    if (!rejectingPromotionId) return;
    setIsRejectingPromo(true);
    try {
      const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
      const res = await fetch(`/api/promotions/${rejectingPromotionId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to reject promotion' }));
        throw new Error(errorData.message || 'Failed to reject promotion');
      }

      notify.success('Promotion rejected');
      setPendingPromotions(pendingPromotions.filter(p => p.id !== rejectingPromotionId));
    } catch (error) {
      notify.error(toFriendlyMessage(error, 'Failed to reject promotion'));
    } finally {
      setIsRejectingPromo(false);
      setRejectPromoModalOpen(false);
      setRejectingPromotionId(null);
    }
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

  const confirmDeleteSeller = async () => {
    if (!deletingSeller || isDeleting) return;
    if (!deleteReason.trim()) {
      notify.error('Please provide a reason for deletion.');
      return;
    }

    setIsDeleting(true);
    const sellerId = deletingSeller.sellerId;
    const authHeaders: Record<string, string> = session?.backendJwt
      ? { Authorization: `Bearer ${session.backendJwt}` }
      : {};

    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ reason: deleteReason.trim() }),
      });

      if (res.ok || res.status === 404) {
        setPendingProducts((prev) => prev.filter((p) => p.seller?.id !== sellerId));
        setAllSellers((prev) => prev.filter((s) => s.id !== sellerId));
        setShowDeleteModal(false);
        setDeletingSeller(null);
        setDeleteReason('');
        notify.success(
          res.status === 404
            ? 'Seller profile already removed'
            : 'Seller profile deleted',
        );

        try {
          const sellersRes = await fetch(`/api/admin/sellers/deleted?ts=${Date.now()}`, {
            credentials: 'include',
            cache: 'no-store' as any,
            headers: authHeaders,
          });
          if (sellersRes.ok) {
            setDeletedSellers(ensureArray<any>(await sellersRes.json()));
          }
        } catch {
          // no-op
        }
      } else {
        const msg = await res.text().catch(() => '');
        notify.error(`Failed to delete seller (${res.status}). ${msg}`);
      }
    } catch (err) {
      notify.error('Failed to delete seller.');
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

  const restoreDeletedSeller = async (archiveId: string) => {
    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
    const res = await fetch(`/api/admin/sellers/deleted/${archiveId}/restore`, {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders,
    });
    if (res.ok) {
      notify.success('Seller restored');
      try {
        const sellersRes = await fetch(`/api/admin/sellers/deleted?ts=${Date.now()}`, {
          credentials: 'include',
          cache: 'no-store' as any,
          headers: authHeaders,
        });
        if (sellersRes.ok) {
          setDeletedSellers(ensureArray<any>(await sellersRes.json()));
        }
      } catch { }
    } else {
      const msg = await res.text().catch(() => '');
      notify.error(`Failed to restore seller (${res.status}). ${msg}`);
    }
  };

  if (isLoading || authStatus === 'loading') return <LoadingSpinner />;

  // Calculate pending counts for the sidebar
  const pendingCounts = {
    salons: pendingSalons.length,
    services: pendingServices.length,
    reviews: pendingReviews.length,
    products: pendingProducts.length,
    promotions: pendingPromotions.length,
    payments: pendingPaymentSalons.length,
  };

  // Dashboard metrics
  const dashboardMetrics = {
    totalSalons: allSalons.length,
    totalSellers: allSellers.length,
    pendingApprovals: pendingSalons.length + pendingServices.length + pendingReviews.length + pendingProducts.length,
    pendingPayments: pendingPaymentSalons.length,
  };

  // Handle view changes with special cases
  const handleViewChange = async (newView: AdminView) => {
    router.push(getAdminPath(newView));
    setView(newView);
  };

  return (
    <>
      {/* Reject Promotion Modal */}
      <RejectReasonModal
        isOpen={rejectPromoModalOpen}
        title="Reject Promotion"
        subtitle="Provide a reason for rejecting this promotion. This will be shared with the salon owner."
        placeholder="e.g. Misleading discount, invalid service listed..."
        required={false}
        onConfirm={confirmRejectPromotion}
        onCancel={() => { setRejectPromoModalOpen(false); setRejectingPromotionId(null); }}
        isLoading={isRejectingPromo}
        confirmLabel="Reject Promotion"
      />

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
                const planCode = (salon.planCode ?? 'FREE') as PlanCode;
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



          {view === 'featured-salons' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Currently Featured Salons</h3>
                {featuredSalons.length > 0 ? (
                  featuredSalons.map((salon) => (
                    <div key={salon.id} className={styles.listItem}>
                      <div className={styles.info}>
                        <h4>{salon.name}</h4>
                        <p>{salon.city}, {salon.province}</p>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                          Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email})
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                          Featured until: {salon.featuredUntil ? new Date(salon.featuredUntil).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className={styles.actions}>
                        <button
                          onClick={() => unfeatureSalon(salon.id)}
                          className={styles.rejectButton}
                        >
                          Unfeature
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No salons are currently featured.</p>
                )}
              </div>

              <div>
                <h3 style={{ marginBottom: '1rem' }}>Feature a Salon</h3>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label>
                    Duration (days):
                    <select
                      value={featureDuration}
                      onChange={(e) => setFeatureDuration(Number(e.target.value))}
                      style={{ marginLeft: '0.5rem', padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }}
                    >
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </label>
                </div>
                {availableSalons.length > 0 ? (
                  availableSalons.map((salon) => (
                    <div key={salon.id} className={styles.listItem}>
                      <div className={styles.info}>
                        <h4>{salon.name}</h4>
                        <p>{salon.city}, {salon.province}</p>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                          Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email})
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                          Plan: {salon.planCode || 'N/A'}
                        </p>
                      </div>
                      <div className={styles.actions}>
                        <button
                          onClick={() => featureSalon(salon.id, featureDuration)}
                          className={styles.approveButton}
                        >
                          Feature for {featureDuration} days
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No approved salons available to feature.</p>
                )}
              </div>
            </>
          )}

          {view === 'deleted-salons' && (
            <AdminDeletedSalonsSection
              deletedSalons={deletedSalons}
              onRestoreDeletedSalon={restoreDeletedSalon}
            />
          )}
          {view === 'all-sellers' && (
            <>
              {/* Filter bar for sellers */}
              <div className={styles.filterBar} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={sellerFilter}
                  onChange={e => setSellerFilter(e.target.value)}
                  placeholder="Filter by name, email, business..."
                  className={styles.searchInput}
                  style={{ minWidth: '200px', maxWidth: '300px' }}
                />
                <span style={{ color: '#666', fontSize: '0.85rem' }}>Showing {filteredAllSellers.length} of {allSellers.length}</span>
              </div>
              {filteredAllSellers.length > 0 ? filteredAllSellers.map((seller) => {
                const planCode = (seller.sellerPlanCode ?? 'FREE') as PlanCode;
                const plan = PLAN_BY_CODE[planCode] ?? APP_PLANS[0];
                const amountDue =
                  typeof seller.sellerPlanPriceCents === 'number'
                    ? formatRand(seller.sellerPlanPriceCents)
                    : plan.price;
                const paymentStatus = (seller.sellerPlanPaymentStatus ?? 'PENDING_SELECTION') as PlanPaymentStatus;
                const proofSubmittedAt = seller.sellerPlanProofSubmittedAt
                  ? new Date(seller.sellerPlanProofSubmittedAt).toLocaleString('en-ZA')
                  : null;
                const verifiedAt = seller.sellerPlanVerifiedAt
                  ? new Date(seller.sellerPlanVerifiedAt).toLocaleString('en-ZA')
                  : null;
                const reference = seller.sellerPlanPaymentReference ?? seller.email;
                const isUpdating = updatingSellerPlanId === seller.id;
                const approvalStatus = (seller.sellerApprovalStatus ?? 'PENDING') as ApprovalStatus;
                const businessName = seller.sellerBusinessName || 'Not set up';
                const profileSubmittedAt = seller.sellerProfileSubmittedAt
                  ? new Date(seller.sellerProfileSubmittedAt).toLocaleString('en-ZA')
                  : null;
                const isExpanded = expandedItems.has(`seller-${seller.id}`);
                const sellerName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.email;
                const isFree = planCode === 'FREE';

                return (
                  <div key={seller.id} className={styles.collapsibleItem}>
                    <div className={styles.collapsibleHeader} onClick={() => toggleExpanded(`seller-${seller.id}`)}>
                      <div className={styles.collapsibleHeaderLeft}>
                        <span className={styles.collapsibleName} title={sellerName}>{sellerName}</span>
                        <span className={styles.collapsibleLocation} title={businessName}>{businessName}</span>
                      </div>
                      <div className={styles.collapsibleHeaderRight}>
                        <span className={`${styles.collapsibleStatus} ${styles[approvalStatus.toLowerCase()]}`}>
                          {approvalStatus}
                        </span>
                        <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>▼</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className={styles.collapsibleContent}>
                        <div className={styles.info}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                              <h4>{seller.firstName} {seller.lastName}</h4>
                              <p>Email: {seller.email}</p>
                            </div>
                            {(approvalStatus === 'PENDING' || approvalStatus === 'REJECTED') && (
                              <span className={`${styles.statusBadge} ${styles[approvalStatus.toLowerCase()]}`}>
                                Profile: {approvalStatus}
                              </span>
                            )}
                          </div>

                          <div style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                            <p><strong>Business:</strong> {businessName}</p>
                            <p><strong>Contact:</strong> {seller.sellerContactPerson} | {seller.sellerContactPhone}</p>
                            <p><strong>Address:</strong> {seller.sellerPhysicalAddress}</p>
                            <p><strong>Service Areas:</strong> {seller.sellerProvincesServed?.join(', ') || 'None'}</p>
                            {profileSubmittedAt && <p style={{ marginTop: '0.25rem', color: '#666' }}>Updated: {profileSubmittedAt}</p>}

                            {approvalStatus === 'PENDING' && (
                              <div className={styles.actions} style={{ marginTop: '0.5rem' }}>
                                <button
                                  className={styles.approveButton}
                                  onClick={() => updateSellerApprovalStatus(seller.id, 'APPROVED')}
                                >
                                  Approve Profile
                                </button>
                                <button
                                  className={styles.rejectButton}
                                  onClick={() => updateSellerApprovalStatus(seller.id, 'REJECTED')}
                                >
                                  Reject Profile
                                </button>
                              </div>
                            )}
                          </div>

                          <p>Products: {seller.productsCount ?? 0} (Pending: {seller.pendingProductsCount ?? 0})</p>

                          <div className={styles.planInfo}>
                            <div className={styles.planInfoRow}>
                              <span><strong>Package:</strong> {plan.name}</span>
                              <span><strong>Amount due:</strong> {amountDue}</span>
                              <span>
                                <strong>Payment:</strong>{' '}
                                <span className={`${styles.planBadge} ${styles[`planStatus_${paymentStatus.toLowerCase()}`]}`}>
                                  {PLAN_PAYMENT_LABELS[paymentStatus]}
                                </span>
                              </span>
                            </div>
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
                                onClick={() => updateSellerPaymentStatus(seller.id, 'VERIFIED')}
                                disabled={isUpdating || paymentStatus === 'VERIFIED'}
                              >
                                {isUpdating && paymentStatus !== 'VERIFIED' ? 'Saving…' : 'Mark Payment Verified'}
                              </button>
                              <button
                                type="button"
                                className={styles.approveButton}
                                onClick={() => updateSellerPaymentStatus(seller.id, 'PROOF_SUBMITTED')}
                                disabled={isUpdating || paymentStatus === 'PROOF_SUBMITTED'}
                              >
                                {isUpdating && paymentStatus === 'PROOF_SUBMITTED' ? 'Saving…' : 'Proof Received'}
                              </button>
                              <button
                                type="button"
                                className={styles.rejectButton}
                                onClick={() => updateSellerPaymentStatus(seller.id, 'AWAITING_PROOF')}
                                disabled={isUpdating || paymentStatus === 'AWAITING_PROOF'}
                              >
                                {isUpdating && paymentStatus === 'AWAITING_PROOF' ? 'Saving…' : 'Unverify Payment'}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className={styles.actions}>
                          <button
                            onClick={() => openDeleteSellerModal(seller.id, `${seller.firstName} ${seller.lastName}`.trim() || seller.email)}
                            className={styles.rejectButton}
                            title="Delete seller"
                          >
                            Delete Seller
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }) : <p>No sellers found.</p>}
            </>
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

          {view === 'products' && (
            <>
              {/* Filter and bulk actions bar */}
              <div className={styles.filterBar} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={productFilter}
                  onChange={e => setProductFilter(e.target.value)}
                  placeholder="Filter by product name or seller..."
                  className={styles.searchInput}
                  style={{ minWidth: '200px', maxWidth: '300px' }}
                />
                {pendingProducts.length > 0 && (
                  <>
                    <input type="checkbox" checked={selProducts.size === filteredPendingProducts.length && filteredPendingProducts.length > 0} onChange={e => setSelProducts(e.target.checked ? new Set(filteredPendingProducts.map(s => s.id)) : new Set())} />
                    <span>Select all ({filteredPendingProducts.length})</span>
                    <button className={styles.approveButton} disabled={selProducts.size === 0} onClick={() => bulkUpdate('product', Array.from(selProducts), 'APPROVED')}>Approve selected</button>
                    <button className={styles.rejectButton} disabled={selProducts.size === 0} onClick={() => bulkUpdate('product', Array.from(selProducts), 'REJECTED')}>Reject selected</button>
                  </>
                )}
              </div>
              {filteredPendingProducts.length > 0 ? filteredPendingProducts.map((product) => {
                const sellerPlanCode = (product.seller.sellerPlanCode ?? 'FREE') as PlanCode;
                const plan = PLAN_BY_CODE[sellerPlanCode] ?? APP_PLANS[0];
                const planAmount =
                  typeof product.seller.sellerPlanPriceCents === 'number'
                    ? formatRand(product.seller.sellerPlanPriceCents)
                    : plan.price;
                const sellerStatus = (product.seller.sellerPlanPaymentStatus ??
                  'PENDING_SELECTION') as PlanPaymentStatus;
                const proofSubmittedAt = product.seller.sellerPlanProofSubmittedAt
                  ? new Date(product.seller.sellerPlanProofSubmittedAt).toLocaleString('en-ZA')
                  : null;
                const sellerVerifiedAt = product.seller.sellerPlanVerifiedAt
                  ? new Date(product.seller.sellerPlanVerifiedAt).toLocaleString('en-ZA')
                  : null;
                const isSellerUpdating = updatingSellerPlanId === product.seller.id;
                const sellerReference =
                  product.seller.sellerPlanPaymentReference ??
                  `${product.seller.firstName} ${product.seller.lastName}`.trim();
                const isExpanded = expandedItems.has(product.id);
                const isFree = sellerPlanCode === 'FREE';
                const sellerName = `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Unknown Seller';
                return (
                  <div key={product.id} className={styles.collapsibleItem}>
                    <div className={styles.collapsibleHeader} onClick={() => toggleExpanded(product.id)}>
                      <div className={styles.collapsibleHeaderLeft}>
                        <input
                          type="checkbox"
                          className={styles.collapsibleCheckbox}
                          checked={selProducts.has(product.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const ns = new Set(selProducts);
                            if (e.target.checked) ns.add(product.id);
                            else ns.delete(product.id);
                            setSelProducts(ns);
                          }}
                        />
                        <span className={styles.collapsibleName} title={product.name}>{product.name}</span>
                        <span className={styles.collapsibleLocation} title={sellerName}>{sellerName}</span>
                      </div>
                      <div className={styles.collapsibleHeaderRight}>
                        <span className={`${styles.collapsibleStatus} ${isFree ? styles.free : styles.pending}`}>
                          {isFree ? 'FREE' : 'Pending'}
                        </span>
                        <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>▼</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className={styles.collapsibleContent}>
                        <div className={styles.info}>
                          <h4>{product.name}</h4>
                          <p>Seller: {sellerName}</p>
                          <div className={styles.planInfo}>
                            <div className={styles.planInfoRow}>
                              <span><strong>Package:</strong> {plan.name}</span>
                              <span><strong>Amount due:</strong> {planAmount}</span>
                              <span>
                                <strong>Status:</strong>{' '}
                                <span className={`${styles.planBadge} ${styles[`planStatus_${sellerStatus.toLowerCase()}`]}`}>
                                  {PLAN_PAYMENT_LABELS[sellerStatus]}
                                </span>
                              </span>
                            </div>
                            <div className={styles.planInfoRow}>
                              <span>
                                <strong>Reference:</strong>{' '}
                                <code className={styles.planReference}>{sellerReference}</code>
                                <button
                                  type="button"
                                  className={styles.copyButton}
                                  onClick={() => copyToClipboard(sellerReference, 'Reference copied')}
                                >
                                  Copy
                                </button>
                              </span>
                              {proofSubmittedAt && <span>Proof submitted: {proofSubmittedAt}</span>}
                              {sellerVerifiedAt && <span>Verified on: {sellerVerifiedAt}</span>}
                            </div>
                            <div className={styles.planAdminActions}>
                              <button
                                type="button"
                                className={styles.approveButton}
                                onClick={() => updateSellerPaymentStatus(product.seller.id, 'VERIFIED')}
                                disabled={isSellerUpdating || sellerStatus === 'VERIFIED'}
                              >
                                {isSellerUpdating && sellerStatus !== 'VERIFIED' ? 'Saving…' : 'Mark verified'}
                              </button>
                              <button
                                type="button"
                                className={styles.approveButton}
                                onClick={() => updateSellerPaymentStatus(product.seller.id, 'PROOF_SUBMITTED')}
                                disabled={isSellerUpdating || sellerStatus === 'PROOF_SUBMITTED'}
                              >
                                {isSellerUpdating && sellerStatus === 'PROOF_SUBMITTED' ? 'Saving…' : 'Proof received'}
                              </button>
                              <button
                                type="button"
                                className={styles.rejectButton}
                                onClick={() => updateSellerPaymentStatus(product.seller.id, 'AWAITING_PROOF')}
                                disabled={isSellerUpdating || sellerStatus === 'AWAITING_PROOF'}
                              >
                                {isSellerUpdating && sellerStatus === 'AWAITING_PROOF' ? 'Saving…' : 'Awaiting proof'}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className={styles.actions}>
                          <button onClick={() => handleUpdateStatus('product', product.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                          <button onClick={() => handleUpdateStatus('product', product.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                          <button onClick={() => openDeleteSellerModal(product.seller.id, sellerName || product.seller.id)} className={styles.rejectButton} title="Delete seller">Delete Seller</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }) : <p>No pending products.</p>}
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


          {view === 'promotions' && (
            <AdminPromotionsSection
              promotions={pendingPromotions}
              onApprovePromotion={handleApprovePromotion}
              onRejectPromotion={handleRejectPromotion}
            />
          )}



          {view === 'media' && (
            <AdminMediaReview />
          )}

          {view === 'trends' && (
            <AdminTrendsManager />
          )}

          {view === 'salon-trendz' && (
            <AdminSalonTrendzManager />
          )}
          {view === 'blogs' && (
            <AdminBlogManager />
          )}

          {view === 'top10-requests' && (
            <AdminTop10RequestsSection
              requests={top10Requests}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
              authToken={session?.backendJwt}
              onRequestsChange={(updater) => setTop10Requests((prev) => updater(prev))}
            />
          )}


          {view === 'deleted-sellers' && (
            <AdminDeletedSellersSection
              deletedSellers={deletedSellers}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
              onRestoreDeletedSeller={restoreDeletedSeller}
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

        {showDeleteModal && deleteMode === 'salon' && deletingSalon && (
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

        {showDeleteModal && deleteMode === 'seller' && deletingSeller && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', color: '#000', padding: '1rem', borderRadius: 8, maxWidth: 560, width: '96%', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
              <h3 style={{ marginTop: 0 }}>Delete Seller Profile</h3>
              <p style={{ color: '#a00', fontWeight: 600 }}>Caution: This will remove the seller account and all their products from the platform. You can restore it from Deleted Sellers.</p>
              <p style={{ color: '#a00', fontWeight: 600 }}>Are you sure you want to proceed with deleting this product seller?</p>
              <p><strong>Seller:</strong> {deletingSeller.name}</p>
              <label style={{ display: 'block', margin: '0.5rem 0' }}>Reason (required)</label>
              <textarea
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 6 }}
                placeholder="Enter reason for deletion"
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button type="button" className={styles.approveButton} onClick={confirmDeleteSeller} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  className={styles.rejectButton}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingSeller(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
