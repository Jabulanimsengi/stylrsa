// frontend/src/app/admin/page.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminPage.module.css';
import {
  Salon,
  Service,
  ApprovalStatus,
  Review,
  Product,
  PlanPaymentStatus,
  PlanCode,
  SellerSummary,
} from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import type { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import AdminMediaReview from '@/components/AdminMediaReview';
import AdminTrendsManager from '@/components/AdminTrendsManager/AdminTrendsManager';
import AdminSalonTrendzManager from '@/components/AdminSalonTrendzManager/AdminSalonTrendzManager';
import AdminBlogManager from '@/components/AdminBlogManager/AdminBlogManager';

const ensureArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

// FIX: Update PendingSalon to include the new fields from the backend response.
type PendingSalon = Pick<Salon, 'id' | 'name' | 'approvalStatus' | 'createdAt' | 'city' | 'province' | 'isVerified'> & {
  owner: { id: string; email: string; firstName: string; lastName: string; };
  visibilityWeight?: number;
  maxListings?: number;
  featuredUntil?: string | null;
  planCode?: PlanCode | null;
  planPriceCents?: number | null;
  planPaymentStatus?: PlanPaymentStatus | null;
  planPaymentReference?: string | null;
  planProofSubmittedAt?: string | null;
  planVerifiedAt?: string | null;
};
type PendingService = Service & { salon: { name: string } };
type PendingReview = Review & { author: { firstName: string }; salon: { name: string } };
type PendingProduct = Product & {
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    sellerPlanCode?: PlanCode | null;
    sellerPlanPriceCents?: number | null;
    sellerPlanPaymentStatus?: PlanPaymentStatus | null;
    sellerPlanPaymentReference?: string | null;
    sellerPlanProofSubmittedAt?: string | null;
    sellerPlanVerifiedAt?: string | null;
  };
};

type SellerRow = SellerSummary & {
  sellerPlanPaymentStatus?: PlanPaymentStatus | null;
};

type SellerDeletionTarget = {
  sellerId: string;
  name: string;
};

const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
  PENDING_SELECTION: 'Package not selected',
  AWAITING_PROOF: 'Awaiting proof of payment',
  PROOF_SUBMITTED: 'Proof submitted',
  VERIFIED: 'Payment verified',
};

const formatRand = (value: number) => `R${(value / 100).toFixed(2)}`;

export default function AdminPage() {
  const { data: session } = useSession();
  const { authStatus, user } = useAuth();
  const [pendingSalons, setPendingSalons] = useState<PendingSalon[]>([]);
  const [allSalons, setAllSalons] = useState<PendingSalon[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [pendingPromotions, setPendingPromotions] = useState<any[]>([]);
  const [deletedSalons, setDeletedSalons] = useState<any[]>([]);
  const [deletedSellers, setDeletedSellers] = useState<any[]>([]);
  const [allSellers, setAllSellers] = useState<SellerRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [featuredSalons, setFeaturedSalons] = useState<PendingSalon[]>([]);
  const [availableSalons, setAvailableSalons] = useState<PendingSalon[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [featureDuration, setFeatureDuration] = useState<number>(30);
  const [view, setView] = useState<'salons' | 'services' | 'reviews' | 'all-salons' | 'products' | 'all-sellers' | 'deleted-salons' | 'deleted-sellers' | 'audit' | 'featured-salons' | 'promotions' | 'media' | 'trends' | 'salon-trendz' | 'blogs' | 'top10-requests'>('salons');
  const [top10Requests, setTop10Requests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // Inline edit state for salon visibility features
  const [editingSalonId, setEditingSalonId] = useState<string | null>(null);
  const [draftPlan, setDraftPlan] = useState<string>('STARTER');
  const [draftWeight, setDraftWeight] = useState<string>('');
  const [draftMax, setDraftMax] = useState<string>('');
  const [draftFeatured, setDraftFeatured] = useState<string>('');
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingSalon, setDeletingSalon] = useState<PendingSalon | null>(null);
  const [deletingSeller, setDeletingSeller] = useState<SellerDeletionTarget | null>(null);
  const [deleteMode, setDeleteMode] = useState<'salon' | 'seller'>('salon');
  const [isDeleting, setIsDeleting] = useState(false);
  // Simple filters/saved views for All Salons
  const [search, setSearch] = useState('');
  const [savedViews, setSavedViews] = useState<{ name: string; query: string }[]>([]);
  const filteredAllSalons = useMemo(() => allSalons.filter(s => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.owner.email.toLowerCase().includes(q) ||
      (s.planCode ?? '').toLowerCase().includes(q)
    );
  }), [allSalons, search]);
  // Bulk selection state
  const [selSalons, setSelSalons] = useState<Set<string>>(new Set());
  const [selServices, setSelServices] = useState<Set<string>>(new Set());
  const [selReviews, setSelReviews] = useState<Set<string>>(new Set());
  const [selProducts, setSelProducts] = useState<Set<string>>(new Set());
  const [updatingSalonPlanId, setUpdatingSalonPlanId] = useState<string | null>(null);
  const [updatingSellerPlanId, setUpdatingSellerPlanId] = useState<string | null>(null);

  const clearSelections = () => { setSelSalons(new Set()); setSelServices(new Set()); setSelReviews(new Set()); setSelProducts(new Set()); };

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error('Unable to copy to clipboard');
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
        toast.error(`Failed to update payment status (${res.status}). ${msg}`);
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
      toast.success('Payment status updated');
    } catch (error) {
      toast.error('Failed to update payment status');
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
        toast.error(`Failed to update seller payment (${res.status}). ${msg}`);
        return;
      }
      const updated = await res.json();
      toast.success('Seller payment status updated');
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
      toast.error('Failed to update seller payment status');
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
      toast.success(`Seller profile ${status.toLowerCase()}`);
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
      toast.error('Failed to update approval status');
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
    toast.success(`Updated ${ids.length} ${type}${ids.length > 1 ? 's' : ''}`);
  };

  const fetchFeaturedSalons = async () => {
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
        toast.error(`Failed to load featured salons (${res.status}): ${msg || 'Unknown error'}`);
      }
    } catch (error) {
      logger.error('Exception fetching featured salons:', error);
      toast.error(`Failed to load featured salons: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
        toast.success(`Salon featured for ${durationDays} days`);
        logger.info('Salon featured successfully:', data);
        await fetchFeaturedSalons();
      } else {
        const msg = await res.text().catch(() => '');
        logger.error('Failed to feature salon:', { status: res.status, message: msg });
        toast.error(`Failed to feature salon (${res.status}): ${msg || 'Unknown error'}`);
      }
    } catch (error) {
      logger.error('Exception featuring salon:', error);
      toast.error(`Failed to feature salon: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        toast.success('Salon unfeatured');
        await fetchFeaturedSalons();
      } else {
        const msg = await res.text().catch(() => '');
        toast.error(`Failed to unfeature salon: ${msg}`);
      }
    } catch (error) {
      toast.error('Failed to unfeature salon');
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
        const [pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes, allSellersRes, deletedSalonsRes, deletedSellersRes, metricsRes, promotionsRes] = await Promise.all([
          fetch(`/api/admin/salons/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/all?ts=${ts}`, noStore),
          fetch(`/api/admin/services/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/reviews/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/products/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/sellers/all?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/deleted?ts=${ts}`, noStore),
          fetch(`/api/admin/sellers/deleted?ts=${ts}`, noStore),
          fetch(`/api/admin/metrics?ts=${ts}`, noStore),
          fetch(`/api/promotions/admin/pending?ts=${ts}`, noStore),
        ]);

        if ([pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes, allSellersRes, deletedSalonsRes, deletedSellersRes, metricsRes, promotionsRes].some(res => res.status === 401)) {
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
        setDeletedSalons(ensureArray<any>(await deletedSalonsRes.json()));
        setDeletedSellers(ensureArray<any>(await deletedSellersRes.json()));
        setMetrics(await metricsRes.json());
        setPendingPromotions(ensureArray<any>(await promotionsRes.json()));

      } catch (error) {
        logger.error("Failed to fetch admin data:", error);
        toast.error(toFriendlyMessage(error, 'Failed to load admin data. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // load saved views
    try { const raw = localStorage.getItem('admin-saved-views'); if (raw) setSavedViews(JSON.parse(raw)); } catch { }

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
      toast.error(`Failed to update status (${res.status}). ${msg}`);
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

      toast.success('Promotion approved successfully!');
      setPendingPromotions(pendingPromotions.filter(p => p.id !== promotionId));
    } catch (error) {
      toast.error(toFriendlyMessage(error, 'Failed to approve promotion'));
    }
  };

  const handleRejectPromotion = async (promotionId: string) => {
    if (authStatus !== 'authenticated') {
      router.push('/login');
      return;
    }

    const reason = window.prompt('Enter reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
      const res = await fetch(`/api/promotions/${promotionId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to reject promotion' }));
        throw new Error(errorData.message || 'Failed to reject promotion');
      }

      toast.success('Promotion rejected');
      setPendingPromotions(pendingPromotions.filter(p => p.id !== promotionId));
    } catch (error) {
      toast.error(toFriendlyMessage(error, 'Failed to reject promotion'));
    }
  };

  const confirmDeleteSalon = async () => {
    if (!deletingSalon || isDeleting) return;
    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deletion.');
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
        toast.success(
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
        toast.error(`Failed to delete (${res.status}). ${msg}`);
      }
    } catch (err) {
      toast.error('Failed to delete salon.');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteSeller = async () => {
    if (!deletingSeller || isDeleting) return;
    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deletion.');
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
        toast.success(
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
        toast.error(`Failed to delete seller (${res.status}). ${msg}`);
      }
    } catch (err) {
      toast.error('Failed to delete seller.');
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
      toast.success('Profile restored');
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
      toast.error(`Failed to restore (${res.status}). ${msg}`);
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
      toast.success('Seller restored');
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
      toast.error(`Failed to restore seller (${res.status}). ${msg}`);
    }
  };

  if (isLoading || authStatus === 'loading') return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      {metrics && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span>Pending: Salons {metrics.salonsPending}, Services {metrics.servicesPending}, Reviews {metrics.reviewsPending}, Products {metrics.productsPending}</span>
          <span style={{ opacity: 0.8 }}>Oldest: {['salon', 'service', 'review', 'product'].map(k => metrics.oldest?.[k] ? `${k}: ${new Date(metrics.oldest[k]).toLocaleDateString()}` : null).filter(Boolean).join(' | ')}</span>
        </div>
      )}
      <div className={styles.tabs}>
        <button
          onClick={() => setView('salons')}
          className={`${styles.tabButton} ${view === 'salons' ? styles.activeTab : ''}`}
        >
          Pending Salons ({pendingSalons.length})
        </button>
        <button
          onClick={() => setView('all-salons')}
          className={`${styles.tabButton} ${view === 'all-salons' ? styles.activeTab : ''}`}
        >
          All Salons ({allSalons.length})
        </button>
        <button
          onClick={async () => {
            setView('featured-salons');
            await fetchFeaturedSalons();
          }}
          className={`${styles.tabButton} ${view === 'featured-salons' ? styles.activeTab : ''}`}
        >
          Featured Salons ({featuredSalons.length})
        </button>
        <button
          onClick={() => setView('all-sellers')}
          className={`${styles.tabButton} ${view === 'all-sellers' ? styles.activeTab : ''}`}
        >
          All Sellers ({allSellers.length})
        </button>
        <button
          onClick={() => setView('services')}
          className={`${styles.tabButton} ${view === 'services' ? styles.activeTab : ''}`}
        >
          Pending Services ({pendingServices.length})
        </button>
        <button
          onClick={() => setView('reviews')}
          className={`${styles.tabButton} ${view === 'reviews' ? styles.activeTab : ''}`}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
        <button
          onClick={() => setView('products')}
          className={`${styles.tabButton} ${view === 'products' ? styles.activeTab : ''}`}
        >
          Pending Products ({pendingProducts.length})
        </button>
        <button
          onClick={() => setView('promotions')}
          className={`${styles.tabButton} ${view === 'promotions' ? styles.activeTab : ''}`}
        >
          Pending Promotions ({pendingPromotions.length})
        </button>
        <button
          onClick={() => setView('media')}
          className={`${styles.tabButton} ${view === 'media' ? styles.activeTab : ''}`}
        >
          Media Review
        </button>
        <button
          onClick={() => setView('trends')}
          className={`${styles.tabButton} ${view === 'trends' ? styles.activeTab : ''}`}
        >
          Trendz
        </button>
        <button
          onClick={() => setView('salon-trendz')}
          className={`${styles.tabButton} ${view === 'salon-trendz' ? styles.activeTab : ''}`}
        >
          Salon Trendz
        </button>
        <button
          onClick={() => setView('blogs')}
          className={`${styles.tabButton} ${view === 'blogs' ? styles.activeTab : ''}`}
        >
          Blogs
        </button>
        <button
          onClick={async () => {
            setView('top10-requests');
            try {
              const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
              const r = await fetch(`/api/admin/top10-requests?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders });
              if (r.ok) setTop10Requests(await r.json());
            } catch { }
          }}
          className={`${styles.tabButton} ${view === 'top10-requests' ? styles.activeTab : ''}`}
        >
          Top 10 Requests ({top10Requests.length})
        </button>
        <button
          onClick={() => setView('deleted-salons')}
          className={`${styles.tabButton} ${view === 'deleted-salons' ? styles.activeTab : ''}`}
        >
          Deleted Profiles ({deletedSalons.length})
        </button>
        <button
          onClick={() => setView('deleted-sellers')}
          className={`${styles.tabButton} ${view === 'deleted-sellers' ? styles.activeTab : ''}`}
        >
          Deleted Sellers ({deletedSellers.length})
        </button>
        <button
          onClick={async () => {
            setView('audit');
            try { const r = await fetch(`/api/admin/audit?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any }); if (r.ok) setAuditLogs(await r.json()); } catch { }
          }}
          className={`${styles.tabButton} ${view === 'audit' ? styles.activeTab : ''}`}
        >
          Activity Log
        </button>
        <Link
          href="/admin/candidates"
          className={styles.tabButton}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          📄 Candidates / CVs
        </Link>
      </div>

      <div className={styles.list}>
        {view === 'salons' && (
          <>
            {pendingSalons.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={selSalons.size === pendingSalons.length} onChange={e => setSelSalons(e.target.checked ? new Set(pendingSalons.map(s => s.id)) : new Set())} />
                <span>Select all</span>
                <button className={styles.approveButton} disabled={selSalons.size === 0} onClick={() => bulkUpdate('salon', Array.from(selSalons), 'APPROVED')}>Approve selected</button>
                <button className={styles.rejectButton} disabled={selSalons.size === 0} onClick={() => bulkUpdate('salon', Array.from(selSalons), 'REJECTED')}>Reject selected</button>
              </div>
            )}
            {pendingSalons.length > 0 ? pendingSalons.map((salon) => {
              const planCode = (salon.planCode ?? 'STARTER') as PlanCode;
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
              return (
                <div key={salon.id} className={styles.listItem}>
                  <div className={styles.info}>
                    <input
                      type="checkbox"
                      checked={selSalons.has(salon.id)}
                      onChange={(e) => {
                        const ns = new Set(selSalons);
                        if (e.target.checked) ns.add(salon.id);
                        else ns.delete(salon.id);
                        setSelSalons(ns);
                      }}
                    />
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
              );
            }) : <p>No pending salons.</p>}
          </>
        )}

        {view === 'all-salons' && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name/email/plan" style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8, minWidth: 260 }} />
              <button className={styles.approveButton} onClick={() => {
                const name = window.prompt('Save current search as view name:');
                if (!name) return;
                const next = [...savedViews, { name, query: search }];
                setSavedViews(next);
                try { localStorage.setItem('admin-saved-views', JSON.stringify(next)); } catch { }
              }}>Save view</button>
              {savedViews.length > 0 && (
                <select onChange={e => setSearch(savedViews.find(v => v.name === e.target.value)?.query ?? '')} defaultValue="">
                  <option value="" disabled>Load view…</option>
                  {savedViews.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              )}
            </div>
            {filteredAllSalons.length > 0 ? filteredAllSalons.map(salon => (
              <div key={salon.id} className={styles.listItem}>
                <div className={styles.info}>
                  <h4>{salon.name}</h4>
                  <p>Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email}) | Status: {salon.approvalStatus}</p>
                  <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {editingSalonId !== salon.id ? (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span><strong>Package:</strong> {salon.planCode ?? '—'}</span>
                        <span><strong>Visibility:</strong> {salon.visibilityWeight ?? '—'}</span>
                        <span><strong>Max listings:</strong> {salon.maxListings ?? '—'}</span>
                        <span><strong>Featured until:</strong> {salon.featuredUntil ? new Date(salon.featuredUntil).toLocaleString() : '—'}</span>
                        <button
                          className={styles.approveButton}
                          onClick={() => {
                            setEditingSalonId(salon.id);
                            setDraftPlan((salon.planCode ?? 'STARTER').toUpperCase());
                            setDraftWeight(String(salon.visibilityWeight ?? ''));
                            setDraftMax(String(salon.maxListings ?? ''));
                            setDraftFeatured(salon.featuredUntil ? new Date(salon.featuredUntil).toISOString().slice(0, 16) : '');
                          }}
                        >Edit</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label>Package</label>
                        <select value={draftPlan} onChange={e => setDraftPlan(e.target.value)} style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                          {APP_PLANS.map((plan) => (
                            <option key={plan.code} value={plan.code}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                        <label>Weight</label>
                        <input value={draftWeight} onChange={e => setDraftWeight(e.target.value)} type="number" min={1} placeholder="visibility" style={{ width: 90, padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                        <label>Max listings</label>
                        <input value={draftMax} onChange={e => setDraftMax(e.target.value)} type="number" min={1} placeholder="max" style={{ width: 90, padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                        <label>Featured until</label>
                        <input value={draftFeatured} onChange={e => setDraftFeatured(e.target.value)} type="datetime-local" style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                        <button
                          className={styles.approveButton}
                          onClick={async () => {
                            // Start with explicit new plans, but also allow whatever is in APP_PLANS dynamic list
                            const allowedPlans = APP_PLANS.map(p => p.code);
                            const normalizedPlan = (draftPlan ?? '').toUpperCase();
                            const visibilityWeight = Number(draftWeight);
                            const maxListings = Number(draftMax);
                            const featuredUntil = draftFeatured;
                            const body: Record<string, unknown> = {};
                            if (allowedPlans.includes(normalizedPlan as typeof allowedPlans[number])) {
                              body.planCode = normalizedPlan;
                            }
                            if (!Number.isNaN(visibilityWeight) && draftWeight !== '') body.visibilityWeight = visibilityWeight;
                            if (!Number.isNaN(maxListings) && draftMax !== '') body.maxListings = maxListings;
                            // Always send featuredUntil to allow clearing on server (null when empty)
                            body.featuredUntil = featuredUntil ? new Date(featuredUntil).toISOString() : null;
                            const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
                            const r = await fetch(`/api/admin/salons/${salon.id}/plan`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders }, credentials: 'include', body: JSON.stringify(body) });
                            if (r.ok) {
                              const updated = await r.json();
                              toast.success('Visibility updated');
                              // Trust server response to avoid client drift
                              setAllSalons(prev => prev.map(s => s.id === salon.id ? {
                                ...s,
                                planCode: (updated?.planCode ?? body.planCode ?? s.planCode) as typeof s.planCode,
                                visibilityWeight: updated?.visibilityWeight ?? (body.visibilityWeight as number | undefined) ?? s.visibilityWeight,
                                maxListings: updated?.maxListings ?? (body.maxListings as number | undefined) ?? s.maxListings,
                                featuredUntil: updated?.featuredUntil ?? (body.featuredUntil as string | null) ?? null,
                              } : s));
                              setEditingSalonId(null);
                              // Re-fetch from server to ensure persistence and avoid stale UI
                              try {
                                const allRes = await fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders });
                                if (allRes.ok) {
                                  const fresh = ensureArray<PendingSalon>(await allRes.json());
                                  setAllSalons(fresh);
                                }
                              } catch { }
                            } else {
                              const errText = await r.text().catch(() => '');
                              toast.error(`Failed to update (${r.status}). ${errText}`);
                            }
                          }}
                        >Save</button>
                        <button className={styles.rejectButton} onClick={() => setEditingSalonId(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.actions}>
                  <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                  <button
                    className={salon.isVerified ? styles.approveButton : styles.rejectButton}
                    onClick={async () => {
                      const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
                      try {
                        const r = await fetch(`/api/admin/salons/${salon.id}/verification`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', ...authHeaders },
                          credentials: 'include',
                        });
                        if (r.ok) {
                          const updated = await r.json();
                          toast.success(`Salon ${updated.isVerified ? 'verified' : 'unverified'}`);
                          setAllSalons(prev => prev.map(s => s.id === salon.id ? { ...s, isVerified: updated.isVerified } : s));
                          // Re-fetch to ensure consistency
                          try {
                            const allRes = await fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders });
                            if (allRes.ok) {
                              const fresh = ensureArray<PendingSalon>(await allRes.json());
                              setAllSalons(fresh);
                            }
                          } catch { }
                        } else {
                          const errText = await r.text().catch(() => '');
                          toast.error(`Failed to update verification (${r.status}). ${errText}`);
                        }
                      } catch (error) {
                        toast.error('Error updating verification');
                      }
                    }}
                    title={salon.isVerified ? 'Remove verification' : 'Verify service provider'}
                  >
                    {salon.isVerified ? '✓ Verified' : 'Verify'}
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={() => openDeleteSalonModal(salon)}
                    title="Delete provider profile"
                  >Delete Profile</button>
                </div>
              </div>
            )) : <p>No salons found.</p>}
          </>
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
          deletedSalons.length > 0 ? deletedSalons.map((row: any) => (
            <div key={row.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{row.salon?.name ?? 'Unknown name'}</h4>
                <p>Deleted at: {row.deletedAt ? new Date(row.deletedAt).toLocaleString() : ''} {row.reason ? `| Reason: ${row.reason}` : ''}</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.approveButton} onClick={() => restoreDeletedSalon(row.id)}>Restore</button>
              </div>
            </div>
          )) : <p>No deleted profiles.</p>
        )}
        {view === 'all-sellers' && (
          allSellers.length > 0 ? allSellers.map((seller) => {
            const planCode = (seller.sellerPlanCode ?? 'STARTER') as PlanCode;
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

            return (
              <div key={seller.id} className={styles.listItem}>
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
            );
          }) : <p>No sellers found.</p>
        )}

        {view === 'services' && (
          <>
            {pendingServices.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={selServices.size === pendingServices.length} onChange={e => setSelServices(e.target.checked ? new Set(pendingServices.map(s => s.id)) : new Set())} />
                <span>Select all</span>
                <button className={styles.approveButton} disabled={selServices.size === 0} onClick={() => bulkUpdate('service', Array.from(selServices), 'APPROVED')}>Approve selected</button>
                <button className={styles.rejectButton} disabled={selServices.size === 0} onClick={() => bulkUpdate('service', Array.from(selServices), 'REJECTED')}>Reject selected</button>
              </div>
            )}
            {pendingServices.length > 0 ? pendingServices.map(service => (
              <div key={service.id} className={styles.listItem}>
                <div className={styles.info}>
                  <input type="checkbox" checked={selServices.has(service.id)} onChange={e => { const ns = new Set(selServices); if (e.target.checked) ns.add(service.id); else ns.delete(service.id); setSelServices(ns); }} />
                  <h4>{service.title}</h4>
                  <p>Salon: {service.salon.name}</p>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleUpdateStatus('service', service.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                  <button onClick={() => handleUpdateStatus('service', service.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                </div>
              </div>
            )) : <p>No pending services.</p>}
          </>
        )}

        {view === 'reviews' && (
          <>
            {pendingReviews.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={selReviews.size === pendingReviews.length} onChange={e => setSelReviews(e.target.checked ? new Set(pendingReviews.map(s => s.id)) : new Set())} />
                <span>Select all</span>
                <button className={styles.approveButton} disabled={selReviews.size === 0} onClick={() => bulkUpdate('review', Array.from(selReviews), 'APPROVED')}>Approve selected</button>
                <button className={styles.rejectButton} disabled={selReviews.size === 0} onClick={() => bulkUpdate('review', Array.from(selReviews), 'REJECTED')}>Reject selected</button>
              </div>
            )}
            {pendingReviews.length > 0 ? pendingReviews.map(review => (
              <div key={review.id} className={styles.listItem}>
                <div className={styles.info}>
                  <input type="checkbox" checked={selReviews.has(review.id)} onChange={e => { const ns = new Set(selReviews); if (e.target.checked) ns.add(review.id); else ns.delete(review.id); setSelReviews(ns); }} />
                  <h4>"{review.comment}" ({review.rating} ★)</h4>
                  <p>By: {review.author.firstName} | For Salon: {review.salon.name}</p>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleUpdateStatus('review', review.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                  <button onClick={() => handleUpdateStatus('review', review.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                </div>
              </div>
            )) : <p>No pending reviews.</p>}
          </>
        )}

        {view === 'products' && (
          <>
            {pendingProducts.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={selProducts.size === pendingProducts.length} onChange={e => setSelProducts(e.target.checked ? new Set(pendingProducts.map(s => s.id)) : new Set())} />
                <span>Select all</span>
                <button className={styles.approveButton} disabled={selProducts.size === 0} onClick={() => bulkUpdate('product', Array.from(selProducts), 'APPROVED')}>Approve selected</button>
                <button className={styles.rejectButton} disabled={selProducts.size === 0} onClick={() => bulkUpdate('product', Array.from(selProducts), 'REJECTED')}>Reject selected</button>
              </div>
            )}
            {pendingProducts.length > 0 ? pendingProducts.map((product) => {
              const sellerPlanCode = (product.seller.sellerPlanCode ?? 'STARTER') as PlanCode;
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
              return (
                <div key={product.id} className={styles.listItem}>
                  <div className={styles.info}>
                    <input
                      type="checkbox"
                      checked={selProducts.has(product.id)}
                      onChange={(e) => {
                        const ns = new Set(selProducts);
                        if (e.target.checked) ns.add(product.id);
                        else ns.delete(product.id);
                        setSelProducts(ns);
                      }}
                    />
                    <h4>{product.name}</h4>
                    <p>Seller: {product.seller.firstName} {product.seller.lastName}</p>
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
                    <button onClick={() => openDeleteSellerModal(product.seller.id, `${product.seller.firstName} ${product.seller.lastName}`.trim() || product.seller.id)} className={styles.rejectButton} title="Delete seller">Delete Seller</button>
                  </div>
                </div>
              );
            }) : <p>No pending products.</p>}
          </>
        )}

        {view === 'promotions' && (
          <>
            {pendingPromotions.length > 0 ? pendingPromotions.map((promo) => {
              const isService = Boolean(promo.service);
              const item = isService ? promo.service : promo.product;
              const itemName = isService ? item?.title : item?.name;
              const providerName = isService
                ? promo.service?.salon?.name
                : `${promo.product?.seller?.firstName || ''} ${promo.product?.seller?.lastName || ''}`.trim();
              const endDate = new Date(promo.endDate);
              const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div key={promo.id} className={styles.listItem}>
                  <div className={styles.info}>
                    <h4>{itemName}</h4>
                    <p>
                      <strong>Provider:</strong> {providerName || 'Unknown'} | <strong>Type:</strong> {isService ? 'Service' : 'Product'}
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
                      <strong>Duration:</strong> {new Date(promo.startDate).toLocaleDateString()} → {new Date(promo.endDate).toLocaleDateString()}
                      {' '}({daysLeft > 0 ? `${daysLeft} days` : 'Expired'})
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleApprovePromotion(promo.id)}
                      className={styles.approveButton}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectPromotion(promo.id)}
                      className={styles.rejectButton}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            }) : <p>No pending promotions.</p>}
          </>
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
          top10Requests.length > 0 ? top10Requests.map((req: any) => (
            <div key={req.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{req.fullName} - {req.category}</h4>
                <p><strong>Service:</strong> {req.serviceNeeded}</p>
                <p><strong>Budget:</strong> R{req.budget} | <strong>Type:</strong> {req.serviceType === 'onsite' ? 'Mobile' : 'Visit Salon'}</p>
                <p><strong>Location:</strong> {req.location}</p>
                <p><strong>Date:</strong> {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : 'Not specified'} {req.preferredTime ? `at ${req.preferredTime}` : ''}</p>
                <p><strong>Phone:</strong> <a href={`tel:${req.phone}`}>{req.phone}</a> {req.whatsapp && <> | <strong>WhatsApp:</strong> <a href={`https://wa.me/${req.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{req.whatsapp}</a></>}</p>
                {req.email && <p><strong>Email:</strong> <a href={`mailto:${req.email}`}>{req.email}</a></p>}
                {req.styleOrLook && <p><strong>Style:</strong> {req.styleOrLook}</p>}
                <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> <span style={{ color: req.status === 'PENDING' ? '#f59e0b' : req.status === 'CONTACTED' ? '#3b82f6' : req.status === 'MATCHED' ? '#10b981' : '#6b7280' }}>{req.status}</span></p>
              </div>
              <div className={styles.actions}>
                <select
                  value={req.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
                    try {
                      const res = await fetch(`/api/admin/top10-requests/${req.id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', ...authHeaders },
                        credentials: 'include',
                        body: JSON.stringify({ status: newStatus }),
                      });
                      if (res.ok) {
                        setTop10Requests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
                        toast.success('Status updated');
                      } else {
                        toast.error('Failed to update status');
                      }
                    } catch {
                      toast.error('Failed to update status');
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
          )) : <p>No Top 10 requests yet.</p>
        )}

        {view === 'deleted-sellers' && (
          deletedSellers.length > 0 ? deletedSellers.map((row: any) => (
            <div key={row.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{row.seller?.firstName ? `${row.seller.firstName} ${row.seller.lastName ?? ''}`.trim() : 'Unknown seller'}</h4>
                <p>Deleted at: {row.deletedAt ? new Date(row.deletedAt).toLocaleString() : ''} {row.reason ? `| Reason: ${row.reason}` : ''}</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.approveButton} onClick={() => restoreDeletedSeller(row.id)}>Restore</button>
              </div>
            </div>
          )) : <p>No deleted sellers.</p>
        )}

        {view === 'audit' && (
          auditLogs.length > 0 ? auditLogs.map((log: any) => (
            <div key={log.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{log.action}</h4>
                <p>Target: {log.targetType} {log.targetId}</p>
                <p>{log.reason ? `Reason: ${log.reason}` : ''}</p>
              </div>
              <div className={styles.actions}>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )) : <p>No recent admin activity.</p>
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
    </div>
  );
}
