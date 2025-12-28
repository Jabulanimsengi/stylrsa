"use client";

import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import {
  Product,
  ProductOrder,
  ProductOrderStatus,
  PlanCode,
  PlanPaymentStatus,
  ApprovalStatus,
} from '@/types';
import ProductFormModal from '@/components/ProductFormModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import styles from './ProductDashboard.module.css';
import { Skeleton, SkeletonGroup } from '@/components/Skeleton/Skeleton';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { useSocket } from '@/context/SocketContext';
import { getImageWithFallback } from '@/lib/placeholders';
import SellerStats from '@/components/SellerStats/SellerStats';
import { FaChartLine, FaBox, FaShoppingCart, FaCog, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Badge,
  Input,
  Textarea,
  FormField,
  LoadingButton,
  EmptyState,
  AlertDialog,
} from '@/components/ui';
import StatusBadge from '@/components/StatusBadge';

type TabKey = 'stats' | 'products' | 'orders' | 'settings';
const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: 'stats', label: 'Overview', icon: <FaChartLine /> },
  { key: 'products', label: 'Products', icon: <FaBox /> },
  { key: 'orders', label: 'Orders', icon: <FaShoppingCart /> },
  { key: 'settings', label: 'Settings', icon: <FaCog /> },
];

const statusOptions: ProductOrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];



const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
  PENDING_SELECTION: 'Package not selected',
  AWAITING_PROOF: 'Awaiting proof of payment',
  PROOF_SUBMITTED: 'Proof submitted — pending review',
  VERIFIED: 'Payment verified',
};

export default function ProductDashboardClient() {
  const { user, authStatus } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const socket = useSocket();
  const initialTab = (search.get('tab') as TabKey) || 'products';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [sellerPlanCode, setSellerPlanCode] = useState<PlanCode>('FREE');
  const [sellerPlanStatus, setSellerPlanStatus] = useState<PlanPaymentStatus>('PENDING_SELECTION');
  const [sellerPlanReference, setSellerPlanReference] = useState('');
  const [sellerPlanProofAt, setSellerPlanProofAt] = useState<string | null>(null);
  const [sellerPlanVerifiedAt, setSellerPlanVerifiedAt] = useState<string | null>(null);
  const [sellerPlanPriceCents, setSellerPlanPriceCents] = useState<number | null>(null);
  const [hasSentProof, setHasSentProof] = useState(false);

  // Seller profile state
  const [sellerWhatsapp, setSellerWhatsapp] = useState('');
  const [sellerWebsite, setSellerWebsite] = useState('');
  const [sellerBankName, setSellerBankName] = useState('');
  const [sellerBankAccountHolder, setSellerBankAccountHolder] = useState('');
  const [sellerBankAccountNumber, setSellerBankAccountNumber] = useState('');
  const [sellerBankBranchCode, setSellerBankBranchCode] = useState('');
  const [sellerBankAccountType, setSellerBankAccountType] = useState('');
  const [sellerPaymentNote, setSellerPaymentNote] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Seller approval status
  const [sellerApprovalStatus, setSellerApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [sellerBusinessName, setSellerBusinessName] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setIsProductsLoading(true);
    try {
      const res = await fetch('/api/products/my-products', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch products');
      setProducts(await res.json());
    } catch (error) {
      logger.error('Failed to fetch products:', error);
      toast.error(toFriendlyMessage(error, 'Could not load your products.'));
    } finally {
      setIsProductsLoading(false);
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsOrdersLoading(true);
    try {
      const res = await fetch('/api/product-orders/seller', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      setOrders(await res.json());
    } catch (error) {
      logger.error('Failed to fetch orders:', error);
      toast.error(toFriendlyMessage(error, 'Could not load orders.'));
    } finally {
      setIsOrdersLoading(false);
    }
  }, [user]);

  const fetchSellerPlan = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
        cache: 'no-store' as any,
      });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      const code = (data.sellerPlanCode ?? 'FREE') as PlanCode;
      const status = (data.sellerPlanPaymentStatus ?? 'PENDING_SELECTION') as PlanPaymentStatus;
      setSellerPlanCode(code);
      setSellerPlanStatus(status);
      setSellerPlanReference(
        data.sellerPlanPaymentReference ?? `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      );
      setSellerPlanProofAt(data.sellerPlanProofSubmittedAt ?? null);
      setSellerPlanVerifiedAt(data.sellerPlanVerifiedAt ?? null);
      setSellerPlanPriceCents(
        typeof data.sellerPlanPriceCents === 'number' ? data.sellerPlanPriceCents : null,
      );
      setHasSentProof(status === 'PROOF_SUBMITTED' || status === 'VERIFIED');
      // Load seller profile fields
      setSellerWhatsapp(data.sellerWhatsapp ?? '');
      setSellerWebsite(data.sellerWebsite ?? '');
      setSellerBankName(data.sellerBankName ?? '');
      setSellerBankAccountHolder(data.sellerBankAccountHolder ?? '');
      setSellerBankAccountNumber(data.sellerBankAccountNumber ?? '');
      setSellerBankBranchCode(data.sellerBankBranchCode ?? '');
      setSellerBankAccountType(data.sellerBankAccountType ?? '');
      setSellerPaymentNote(data.sellerPaymentNote ?? '');
      // Seller approval status
      setSellerApprovalStatus(data.sellerApprovalStatus ?? null);
      setSellerBusinessName(data.sellerBusinessName ?? null);
    } catch (error) {
      logger.error('Error in product dashboard:', error);
      toast.error(toFriendlyMessage(error, 'Unable to load your seller package details.'));
    }
  }, [user]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetchProducts();
  }, [authStatus, fetchProducts]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetchSellerPlan();
  }, [authStatus, fetchSellerPlan]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [authStatus, activeTab, fetchOrders]);

  useEffect(() => {
    if (!socket || !user) return;
    const handler = (payload: any) => {
      try {
        if (payload?.entity === 'seller' && payload.id === user.id) {
          fetchSellerPlan();
          toast.success('Your package has been updated by an admin');
        }
      } catch (err) {
        logger.error('Error handling visibility update:', err);
      }
    };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, user, fetchSellerPlan]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(search.toString());
    params.set('tab', tab);
    router.replace(`/product-dashboard?${params.toString()}`);
  };

  const planDetails = PLAN_BY_CODE[sellerPlanCode] ?? APP_PLANS[0];
  const planAmountDisplay = typeof sellerPlanPriceCents === 'number'
    ? `R${(sellerPlanPriceCents / 100).toFixed(2)}`
    : planDetails.price;
  const proofAtDisplay = sellerPlanProofAt
    ? new Date(sellerPlanProofAt).toLocaleString('en-ZA')
    : null;
  const verifiedAtDisplay = sellerPlanVerifiedAt
    ? new Date(sellerPlanVerifiedAt).toLocaleString('en-ZA')
    : null;
  const defaultReference = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const fallbackReference = defaultReference || 'Your business name';
  const effectiveReference = (sellerPlanReference || '').trim() || fallbackReference;

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSaved = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
    handleModalClose();
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      toast.success('Product deleted successfully.');
    } catch (error) {
      logger.error('Error in product dashboard:', error);
      toast.error(toFriendlyMessage(error, 'Failed to delete product.'));
    } finally {
      setDeletingProduct(null);
    }
  };



  const handleProfileSave = async () => {
    setIsProfileSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerWhatsapp: sellerWhatsapp || null,
          sellerWebsite: sellerWebsite || null,
          sellerBankName: sellerBankName || null,
          sellerBankAccountHolder: sellerBankAccountHolder || null,
          sellerBankAccountNumber: sellerBankAccountNumber || null,
          sellerBankBranchCode: sellerBankBranchCode || null,
          sellerBankAccountType: sellerBankAccountType || null,
          sellerPaymentNote: sellerPaymentNote || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Seller profile updated successfully!');
    } catch (error) {
      logger.error('Error updating seller profile:', error);
      toast.error(toFriendlyMessage(error, 'Could not save your profile.'));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: ProductOrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/product-orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
      toast.success('Order updated');
    } catch (error) {
      logger.error('Error in product dashboard:', error);
      toast.error(toFriendlyMessage(error, 'Could not update order status.'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const isLoading = useMemo(() => {
    if (authStatus === 'loading') return true;
    if (activeTab === 'products') return isProductsLoading;
    return false;
  }, [authStatus, activeTab, isProductsLoading]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Product Dashboard</h1>
        <div className={styles.tabBar} aria-hidden>
          {tabs.map((tab) => (
            <Skeleton
              key={tab.key}
              variant="button"
              style={{ width: '45%' }}
            />
          ))}
        </div>
        <div className={styles.toolbar} aria-hidden>
          <Skeleton variant="button" style={{ width: '30%' }} />
        </div>
        <SkeletonGroup count={3} className={styles.productList}>
          {() => (
            <div className={styles.productCard} aria-hidden>
              <div className={styles.productImageWrapper}>
                <Skeleton style={{ width: '100%', height: '100%' }} />
              </div>
              <div className={styles.productInfo}>
                <Skeleton variant="text" style={{ width: '60%' }} />
                <Skeleton variant="text" style={{ width: '40%' }} />
                <Skeleton variant="text" style={{ width: '30%' }} />
                <div className={styles.actions}>
                  <Skeleton variant="button" style={{ width: '45%' }} />
                  <Skeleton variant="button" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          )}
        </SkeletonGroup>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Product Dashboard</h1>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Simplified Seller Package Status */}
      <section className={styles.planSection}>
        <header className={styles.planHeader}>
          <div>
            <h2>Seller Package</h2>
            <p>Your current package and payment status.</p>
          </div>
          <span className={`${styles.planStatusBadge} ${styles[`planStatus_${sellerPlanStatus.toLowerCase()}`]}`}>
            {PLAN_PAYMENT_LABELS[sellerPlanStatus]}
          </span>
        </header>
        <div className={styles.planMeta}>
          <span><strong>Current package:</strong> {planDetails.name}</span>
          <span><strong>Price:</strong> {planAmountDisplay}/month</span>
          <span><strong>Max listings:</strong> {planDetails.maxListings}</span>
          {proofAtDisplay && <span><strong>Proof submitted:</strong> {proofAtDisplay}</span>}
          {verifiedAtDisplay && <span><strong>Verified:</strong> {verifiedAtDisplay}</span>}
        </div>
        {sellerPlanStatus !== 'VERIFIED' && (
          <div className={styles.planNotice}>
            <p className={styles.planWarning}>
              ⚠️ Your products remain hidden until payment is verified.
            </p>
          </div>
        )}
        <div style={{ marginTop: '1rem' }}>
          <a href="/create-seller-profile" className="btn btn-secondary">
            Manage Profile &amp; Package
          </a>
        </div>
      </section>

      {/* Stats Tab - Overview */}
      {activeTab === 'stats' && (
        <div className={styles.statsSection}>
          <SellerStats />
        </div>
      )}

      {activeTab === 'products' && (
        <>
          {/* Seller Profile Approval Check */}
          {sellerApprovalStatus !== 'APPROVED' && (
            <div className="mb-6">
              {!sellerBusinessName ? (
                <Alert variant="info" title="Complete Your Seller Profile">
                  <p className="mb-3">Before you can add products, you need to set up your seller profile with your business details.</p>
                  <Button asChild>
                    <a href="/create-seller-profile">Set Up Profile</a>
                  </Button>
                </Alert>
              ) : sellerApprovalStatus === 'PENDING' ? (
                <Alert variant="warning" title="Profile Under Review">
                  <p className="mb-3">Your seller profile is currently being reviewed by our team. You&apos;ll be able to add products once approved.</p>
                  <Button variant="outline" asChild>
                    <a href="/create-seller-profile">Edit Profile</a>
                  </Button>
                </Alert>
              ) : sellerApprovalStatus === 'REJECTED' ? (
                <Alert variant="error" title="Profile Needs Updates">
                  <p className="mb-3">Your seller profile was not approved. Please update your information and resubmit.</p>
                  <Button asChild>
                    <a href="/create-seller-profile">Update Profile</a>
                  </Button>
                </Alert>
              ) : null}
            </div>
          )}

          <div className={styles.toolbar}>
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={sellerApprovalStatus !== 'APPROVED' || sellerPlanStatus === 'PENDING_SELECTION'}
              title={
                sellerApprovalStatus !== 'APPROVED'
                  ? 'Your seller profile must be approved before adding products.'
                  : sellerPlanStatus === 'PENDING_SELECTION'
                    ? 'Select a package and submit proof before adding products.'
                    : undefined
              }
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </div>
          {sellerApprovalStatus === 'APPROVED' && sellerPlanStatus === 'PENDING_SELECTION' && (
            <p className={styles.planGuard}>Select a seller package and submit payment proof to unlock product uploads.</p>
          )}
          <div className={styles.productList}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImageWrapper}>
                  <Image
                    src={getImageWithFallback(product.images[0], 'square')}
                    alt={product.name}
                    className={styles.productImage}
                    fill
                    sizes="(max-width: 768px) 100vw, 120px"
                  />
                </div>
                <div className={styles.productInfo}>
                  <h2>{product.name}</h2>
                  <p>Price: R{product.price.toFixed(2)}</p>
                  <p>Stock: {product.stock ?? 0}</p>
                  {product.approvalStatus && (
                    <p className="flex items-center gap-2">
                      Status: <StatusBadge status={product.approvalStatus} size="sm" />
                    </p>
                  )}
                  <div className={styles.actions}>
                    <Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}>
                      <FaEdit className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingProduct(product)}>
                      <FaTrash className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className={styles.ordersSection}>
          {isOrdersLoading ? (
            <SkeletonGroup count={3} className={styles.orderList}>
              {() => (
                <div className={styles.orderCard} aria-hidden>
                  <div className={styles.orderSummary}>
                    <div className={styles.orderImageWrapper}>
                      <Skeleton style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div className={styles.orderDetails}>
                      <Skeleton variant="text" style={{ width: '70%' }} />
                      <Skeleton variant="text" style={{ width: '50%' }} />
                      <Skeleton variant="text" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div className={styles.statusRow}>
                    <Skeleton variant="text" style={{ width: '35%' }} />
                    <Skeleton variant="button" style={{ width: '45%' }} />
                  </div>
                  <Skeleton variant="text" style={{ width: '60%' }} />
                </div>
              )}
            </SkeletonGroup>
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="When customers purchase your products, orders will appear here."
              icon="inbox"
            />
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderSummary}>
                    <div className={styles.orderImageWrapper}>
                      <Image
                        src={getImageWithFallback(order.product.images[0], 'square')}
                        alt={order.product.name}
                        fill
                        sizes="120px"
                      />
                    </div>
                    <div className={styles.orderDetails}>
                      <h3>{order.product.name}</h3>
                      <p>Buyer: {`${order.buyer?.firstName ?? ''} ${order.buyer?.lastName ?? ''}`.trim() || 'Customer'}</p>
                      <p>Quantity: {order.quantity}</p>
                      <p>Total: R{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={styles.statusRow}>
                    <label htmlFor={`order-${order.id}`}>Status</label>
                    <select
                      id={`order-${order.id}`}
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(event) => handleOrderStatusChange(order.id, event.target.value as ProductOrderStatus)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  {order.notes && <p className={styles.orderNotes}>Notes: {order.notes}</p>}
                  {order.contactPhone && <p className={styles.orderNotes}>Contact: {order.contactPhone}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className={styles.settingsSection}>
          <div className={styles.settingsCard}>
            <h2 className={styles.settingsCardTitle}>
              <span>📱</span>
              Contact Information
            </h2>
            <p className={styles.settingsCardDesc}>
              Default contact details for your products. These can be overridden per product.
            </p>
            <div className={styles.settingsGrid}>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>WhatsApp Number</label>
                <input
                  type="tel"
                  value={sellerWhatsapp}
                  onChange={(e) => setSellerWhatsapp(e.target.value)}
                  placeholder="+27 82 123 4567"
                  className={styles.settingsInput}
                />
                <span className={styles.settingsHint}>Customers can message you directly</span>
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Website / Store URL</label>
                <input
                  type="url"
                  value={sellerWebsite}
                  onChange={(e) => setSellerWebsite(e.target.value)}
                  placeholder="https://mystore.com"
                  className={styles.settingsInput}
                />
                <span className={styles.settingsHint}>Your online store or personal website</span>
              </div>
            </div>
          </div>

          <div className={styles.settingsCard}>
            <h2 className={styles.settingsCardTitle}>
              <span>🏦</span>
              Banking Details
            </h2>
            <p className={styles.settingsCardDesc}>
              Your banking details will be displayed on product pages so customers know where to pay.
            </p>
            <div className={styles.settingsGrid}>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Bank Name</label>
                <input
                  type="text"
                  value={sellerBankName}
                  onChange={(e) => setSellerBankName(e.target.value)}
                  placeholder="e.g., FNB, Capitec, Standard Bank"
                  className={styles.settingsInput}
                />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Account Holder Name</label>
                <input
                  type="text"
                  value={sellerBankAccountHolder}
                  onChange={(e) => setSellerBankAccountHolder(e.target.value)}
                  placeholder="Full name as on bank account"
                  className={styles.settingsInput}
                />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Account Number</label>
                <input
                  type="text"
                  value={sellerBankAccountNumber}
                  onChange={(e) => setSellerBankAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className={styles.settingsInput}
                />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Branch Code</label>
                <input
                  type="text"
                  value={sellerBankBranchCode}
                  onChange={(e) => setSellerBankBranchCode(e.target.value)}
                  placeholder="e.g., 250655"
                  className={styles.settingsInput}
                />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Account Type</label>
                <select
                  value={sellerBankAccountType}
                  onChange={(e) => setSellerBankAccountType(e.target.value)}
                  className={styles.settingsInput}
                >
                  <option value="">Select account type</option>
                  <option value="Savings">Savings</option>
                  <option value="Cheque">Cheque / Current</option>
                  <option value="Business">Business</option>
                  <option value="Transmission">Transmission</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.settingsCard}>
            <h2 className={styles.settingsCardTitle}>
              <span>💬</span>
              Payment Note
            </h2>
            <p className={styles.settingsCardDesc}>
              Add delivery info, special instructions, or any message for your customers.
            </p>
            <div className={styles.settingsField}>
              <textarea
                value={sellerPaymentNote}
                onChange={(e) => setSellerPaymentNote(e.target.value)}
                placeholder="e.g., Free delivery in Johannesburg. COD available for orders over R500. Please use your name as payment reference."
                className={styles.settingsTextarea}
                rows={3}
              />
            </div>
          </div>

          <div className={styles.settingsActions}>
            <LoadingButton
              loading={isProfileSaving}
              loadingText="Saving..."
              onClick={handleProfileSave}
            >
              Save Profile Settings
            </LoadingButton>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ProductFormModal
          initialData={editingProduct}
          onClose={handleModalClose}
          onProductAdded={handleProductSaved}
        />
      )}

      {deletingProduct && (
        <ConfirmationModal
          message={`Are you sure you want to delete "${deletingProduct.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProduct(null)}
          confirmText="Delete"
        />
      )}
    </div>
  );
}

