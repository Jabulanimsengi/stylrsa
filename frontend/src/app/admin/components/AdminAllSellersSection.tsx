import styles from '../AdminPage.module.css';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import {
  PLAN_PAYMENT_LABELS,
  formatRand,
  type ApprovalStatus,
  type PlanCode,
  type PlanPaymentStatus,
  type SellerRow,
} from '../types';

interface AdminAllSellersSectionProps {
  sellers: SellerRow[];
  sellerFilter: string;
  onSellerFilterChange: (value: string) => void;
  expandedItems: Set<string>;
  updatingSellerPlanId: string | null;
  toggleExpanded: (id: string) => void;
  copyToClipboard: (value: string, successMessage: string) => void;
  updateSellerApprovalStatus: (sellerId: string, status: ApprovalStatus) => void;
  updateSellerPaymentStatus: (sellerId: string, status: PlanPaymentStatus) => void;
  openDeleteSellerModal: (sellerId: string, sellerName: string) => void;
}

export default function AdminAllSellersSection({
  sellers,
  sellerFilter,
  onSellerFilterChange,
  expandedItems,
  updatingSellerPlanId,
  toggleExpanded,
  copyToClipboard,
  updateSellerApprovalStatus,
  updateSellerPaymentStatus,
  openDeleteSellerModal,
}: AdminAllSellersSectionProps) {
  const query = sellerFilter.trim().toLowerCase();
  const filteredSellers = !query
    ? sellers
    : sellers.filter((seller) =>
        seller.firstName?.toLowerCase().includes(query) ||
        seller.lastName?.toLowerCase().includes(query) ||
        seller.email?.toLowerCase().includes(query) ||
        seller.sellerBusinessName?.toLowerCase().includes(query)
      );

  return (
    <>
      <div
        className={styles.filterBar}
        style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          value={sellerFilter}
          onChange={(event) => onSellerFilterChange(event.target.value)}
          placeholder="Filter by name, email, business..."
          className={styles.searchInput}
          style={{ minWidth: '200px', maxWidth: '300px' }}
        />
        <span style={{ color: '#666', fontSize: '0.85rem' }}>
          Showing {filteredSellers.length} of {sellers.length}
        </span>
      </div>

      {filteredSellers.length > 0 ? filteredSellers.map((seller) => {
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
                <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>v</span>
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
                        {isUpdating && paymentStatus !== 'VERIFIED' ? 'Saving...' : 'Mark Payment Verified'}
                      </button>
                      <button
                        type="button"
                        className={styles.approveButton}
                        onClick={() => updateSellerPaymentStatus(seller.id, 'PROOF_SUBMITTED')}
                        disabled={isUpdating || paymentStatus === 'PROOF_SUBMITTED'}
                      >
                        {isUpdating && paymentStatus === 'PROOF_SUBMITTED' ? 'Saving...' : 'Proof Received'}
                      </button>
                      <button
                        type="button"
                        className={styles.rejectButton}
                        onClick={() => updateSellerPaymentStatus(seller.id, 'AWAITING_PROOF')}
                        disabled={isUpdating || paymentStatus === 'AWAITING_PROOF'}
                      >
                        {isUpdating && paymentStatus === 'AWAITING_PROOF' ? 'Saving...' : 'Unverify Payment'}
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
  );
}
