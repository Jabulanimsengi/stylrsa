'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './CreateSellerProfile.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import PageNav from '@/components/PageNav';
import { APP_PLANS, PLAN_BY_CODE, PlanCode } from '@/constants/plans';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { ApprovalStatus } from '@/types';

const DRAFT_STORAGE_KEY = 'seller-profile-draft';

// South African provinces
const SA_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape',
];

interface SellerProfileDraft {
    businessName: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    physicalAddress: string;
    website: string;
    whatsapp: string;
    provincesServed: string[];
    selectedPlan: PlanCode;
    hasSentProof: boolean;
    paymentReference: string;
    savedAt: string;
}

const BANK_DETAILS = {
    bank: 'Capitec Bank',
    accountNumber: '1618097723',
    accountHolder: 'J Msengi',
    whatsapp: '0738021196',
};

const PLAN_PAYMENT_LABELS: Record<string, string> = {
    PENDING_SELECTION: 'Package not selected',
    AWAITING_PROOF: 'Awaiting proof of payment',
    PROOF_SUBMITTED: 'Proof submitted — pending review',
    VERIFIED: 'Payment verified',
};

const APPROVAL_LABELS: Record<ApprovalStatus, { label: string; color: string }> = {
    PENDING: { label: 'Pending Review', color: '#b45309' },
    APPROVED: { label: 'Approved', color: '#047857' },
    REJECTED: { label: 'Rejected', color: '#dc2626' },
};

export default function CreateSellerProfilePage() {
    const { authStatus, user } = useAuth();
    const router = useRouter();

    // Business profile fields
    const [businessName, setBusinessName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [physicalAddress, setPhysicalAddress] = useState('');
    const [website, setWebsite] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [provincesServed, setProvincesServed] = useState<string[]>([]);

    // Plan selection fields
    const [selectedPlan, setSelectedPlan] = useState<PlanCode>('STARTER');
    const [hasSentProof, setHasSentProof] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');

    // Status from server
    const [planPaymentStatus, setPlanPaymentStatus] = useState<string>('PENDING_SELECTION');
    const [sellerApprovalStatus, setSellerApprovalStatus] = useState<ApprovalStatus | null>(null);
    const [profileSubmittedAt, setProfileSubmittedAt] = useState<string | null>(null);

    // UI state
    const [hasDraft, setHasDraft] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const selectedPlanDetails = PLAN_BY_CODE[selectedPlan];

    // Load existing profile data from server
    const loadProfile = useCallback(async () => {
        try {
            const res = await fetch('/api/users/me', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load profile');
            const data = await res.json();

            // Populate form fields
            setBusinessName(data.sellerBusinessName ?? '');
            setContactPerson(data.sellerContactPerson ?? '');
            setContactPhone(data.sellerContactPhone ?? '');
            setContactEmail(data.sellerContactEmail ?? data.email ?? '');
            setPhysicalAddress(data.sellerPhysicalAddress ?? '');
            setWebsite(data.sellerWebsite ?? '');
            setWhatsapp(data.sellerWhatsapp ?? '');
            setProvincesServed(data.sellerProvincesServed ?? []);

            // Plan info
            setSelectedPlan((data.sellerPlanCode ?? 'STARTER') as PlanCode);
            setPlanPaymentStatus(data.sellerPlanPaymentStatus ?? 'PENDING_SELECTION');
            setPaymentReference(data.sellerPlanPaymentReference ?? '');
            setHasSentProof(
                data.sellerPlanPaymentStatus === 'PROOF_SUBMITTED' ||
                data.sellerPlanPaymentStatus === 'VERIFIED'
            );

            // Approval status
            setSellerApprovalStatus(data.sellerApprovalStatus ?? null);
            setProfileSubmittedAt(data.sellerProfileSubmittedAt ?? null);
        } catch (error) {
            logger.error('Failed to load seller profile:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check for existing draft on mount
    useEffect(() => {
        if (authStatus !== 'authenticated') return;

        // Check if user already has an approved profile - redirect to dashboard
        loadProfile().then(() => {
            try {
                const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (savedDraft) {
                    const draft: SellerProfileDraft = JSON.parse(savedDraft);
                    setHasDraft(true);
                    const savedDate = draft.savedAt ? new Date(draft.savedAt).toLocaleString() : 'unknown time';
                    if (window.confirm(`You have a saved draft from ${savedDate}. Would you like to restore it?`)) {
                        loadDraft(draft);
                        toast.success('Draft restored!');
                    }
                }
            } catch (error) {
                logger.error('Failed to load draft:', error);
            }
        });
    }, [authStatus, loadProfile]);

    useEffect(() => {
        if (authStatus === 'loading') return;
        if (authStatus === 'unauthenticated') {
            router.push('/?auth=login&redirect=/create-seller-profile');
        }
        if (user && user.role !== 'PRODUCT_SELLER') {
            toast.error('This page is only for product sellers');
            router.push('/');
        }
    }, [authStatus, router, user]);

    // Save draft to localStorage
    const saveDraft = useCallback(() => {
        setIsSaving(true);
        try {
            const draft: SellerProfileDraft = {
                businessName,
                contactPerson,
                contactPhone,
                contactEmail,
                physicalAddress,
                website,
                whatsapp,
                provincesServed,
                selectedPlan,
                hasSentProof,
                paymentReference,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
            setLastSaved(new Date().toLocaleTimeString());
            setHasDraft(true);
            toast.success('Draft saved! You can continue later.', { autoClose: 2000 });

            // Also save to server
            fetch('/api/users/me/seller-profile', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerBusinessName: businessName || null,
                    sellerContactPerson: contactPerson || null,
                    sellerContactPhone: contactPhone || null,
                    sellerContactEmail: contactEmail || null,
                    sellerPhysicalAddress: physicalAddress || null,
                    sellerWebsite: website || null,
                    sellerWhatsapp: whatsapp || null,
                    sellerProvincesServed: provincesServed,
                }),
            }).catch((err) => logger.error('Failed to save to server:', err));
        } catch (error) {
            toast.error('Failed to save draft');
            logger.error('Failed to save draft:', error);
        } finally {
            setIsSaving(false);
        }
    }, [businessName, contactPerson, contactPhone, contactEmail, physicalAddress, website, whatsapp, provincesServed, selectedPlan, hasSentProof, paymentReference]);

    // Load draft from saved data
    const loadDraft = (draft: SellerProfileDraft) => {
        setBusinessName(draft.businessName || '');
        setContactPerson(draft.contactPerson || '');
        setContactPhone(draft.contactPhone || '');
        setContactEmail(draft.contactEmail || '');
        setPhysicalAddress(draft.physicalAddress || '');
        setWebsite(draft.website || '');
        setWhatsapp(draft.whatsapp || '');
        setProvincesServed(draft.provincesServed || []);
        setSelectedPlan(draft.selectedPlan || 'STARTER');
        setHasSentProof(draft.hasSentProof || false);
        setPaymentReference(draft.paymentReference || '');
        if (draft.savedAt) {
            setLastSaved(new Date(draft.savedAt).toLocaleString());
        }
    };

    // Clear draft from localStorage
    const clearDraft = () => {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
        setLastSaved(null);
        toast.info('Draft cleared');
    };

    const handleProvinceToggle = (province: string) => {
        setProvincesServed((prev) =>
            prev.includes(province)
                ? prev.filter((p) => p !== province)
                : [...prev, province]
        );
    };

    const handleSelectAllProvinces = () => {
        if (provincesServed.length === SA_PROVINCES.length) {
            setProvincesServed([]);
        } else {
            setProvincesServed([...SA_PROVINCES]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Client-side validation
            if (!businessName.trim()) throw new Error('Business name is required');
            if (!contactPerson.trim()) throw new Error('Contact person name is required');
            if (!contactPhone.trim()) throw new Error('Contact phone is required');
            if (!physicalAddress.trim()) throw new Error('Physical address is required');
            if (provincesServed.length === 0) throw new Error('Please select at least one province you serve');

            // Save profile data first
            const saveRes = await fetch('/api/users/me/seller-profile', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerBusinessName: businessName.trim(),
                    sellerContactPerson: contactPerson.trim(),
                    sellerContactPhone: contactPhone.trim(),
                    sellerContactEmail: contactEmail.trim() || null,
                    sellerPhysicalAddress: physicalAddress.trim(),
                    sellerWebsite: website.trim() || null,
                    sellerWhatsapp: whatsapp.trim() || null,
                    sellerProvincesServed: provincesServed,
                }),
            });
            if (!saveRes.ok) {
                const errData = await saveRes.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to save profile');
            }

            // Submit for approval
            const submitRes = await fetch('/api/users/me/seller-profile/submit', {
                method: 'POST',
                credentials: 'include',
            });
            if (!submitRes.ok) {
                const errData = await submitRes.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to submit profile');
            }

            // Clear local draft
            localStorage.removeItem(DRAFT_STORAGE_KEY);

            toast.success('🎉 Profile submitted for review!');
            toast.info('💡 Our team will review your profile shortly. You will be notified when approved.', {
                autoClose: 7000,
            });

            router.push('/product-dashboard');
        } catch (error: any) {
            logger.error('Failed to submit seller profile:', error);
            toast.error(toFriendlyMessage(error, 'Failed to submit profile. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePlanSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/users/me/seller-plan', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planCode: selectedPlan,
                    hasSentProof,
                    paymentReference: paymentReference.trim() || businessName.trim() || undefined,
                }),
            });
            if (!res.ok) throw new Error('Failed to save plan');
            const updated = await res.json();
            setPlanPaymentStatus(updated.sellerPlanPaymentStatus ?? 'AWAITING_PROOF');
            toast.success('Package selection saved');
        } catch (error) {
            logger.error('Error saving plan:', error);
            toast.error(toFriendlyMessage(error, 'Could not save package selection'));
        } finally {
            setIsSaving(false);
        }
    };

    if (authStatus === 'loading' || isLoading) {
        return <LoadingSpinner />;
    }

    const isApproved = sellerApprovalStatus === 'APPROVED';
    const isPending = sellerApprovalStatus === 'PENDING';

    return (
        <div className={styles.container}>
            <PageNav />
            <h1 className={styles.title}>Create Your Seller Profile</h1>
            <p className={styles.subtitle}>
                Set up your business profile to start listing products on Stylr SA
            </p>

            {/* Approval Status Banner */}
            {sellerApprovalStatus && (
                <div
                    className={styles.statusBanner}
                    style={{
                        backgroundColor: `${APPROVAL_LABELS[sellerApprovalStatus].color}15`,
                        borderColor: APPROVAL_LABELS[sellerApprovalStatus].color,
                    }}
                >
                    <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: APPROVAL_LABELS[sellerApprovalStatus].color }}
                    >
                        {APPROVAL_LABELS[sellerApprovalStatus].label}
                    </span>
                    {isPending && (
                        <p>Your profile is under review. You can update your details below.</p>
                    )}
                    {isApproved && (
                        <p>
                            Your profile is approved! You can now{' '}
                            <a href="/product-dashboard" style={{ color: 'inherit', fontWeight: 600 }}>
                                add products to your store
                            </a>
                            .
                        </p>
                    )}
                    {profileSubmittedAt && (
                        <small>Submitted: {new Date(profileSubmittedAt).toLocaleString()}</small>
                    )}
                </div>
            )}

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Plan Selection Section */}
                    <div className={styles.planSection}>
                        <h2 className={styles.sectionTitle}>Select your package</h2>
                        <p className={styles.sectionHint}>
                            Choose the plan that matches your business needs. Pricing is the same for all sellers.
                        </p>

                        <div className={styles.planMeta}>
                            <span className={`${styles.planStatusBadge} ${styles[`planStatus_${planPaymentStatus.toLowerCase()}`]}`}>
                                {PLAN_PAYMENT_LABELS[planPaymentStatus]}
                            </span>
                        </div>

                        <div className={styles.planGrid}>
                            {APP_PLANS.map((plan) => {
                                const isSelected = plan.code === selectedPlan;
                                return (
                                    <button
                                        type="button"
                                        key={plan.code}
                                        onClick={() => setSelectedPlan(plan.code as PlanCode)}
                                        className={`${styles.planCard} ${isSelected ? styles.planCardSelected : ''}`}
                                        aria-pressed={isSelected}
                                    >
                                        <div className={styles.planCardHeader}>
                                            <span className={styles.planName}>{plan.name}</span>
                                            <span className={styles.planPrice}>
                                                {plan.price}
                                                <span className={styles.planPerMonth}>/mo</span>
                                            </span>
                                        </div>
                                        <div className={styles.planDetails}>
                                            <span>Max listings: <strong>{plan.maxListings}</strong></span>
                                            <span>Visibility weight: <strong>{plan.visibilityWeight}</strong></span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className={styles.paymentNotice}>
                            <p>
                                Send <strong>{selectedPlanDetails.price}</strong> to{' '}
                                <strong>{BANK_DETAILS.bank}</strong>, account{' '}
                                <strong>{BANK_DETAILS.accountNumber}</strong> (Account holder:{' '}
                                <strong>{BANK_DETAILS.accountHolder}</strong>). Use{' '}
                                <strong>{paymentReference.trim() || businessName || 'your business name'}</strong>{' '}
                                as the payment reference and WhatsApp the proof to{' '}
                                <strong>{BANK_DETAILS.whatsapp}</strong>.
                            </p>
                        </div>

                        <div className={styles.paymentFields}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="paymentReference">Payment reference</label>
                                <input
                                    id="paymentReference"
                                    type="text"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    placeholder={businessName || 'Your business name'}
                                    className={styles.input}
                                />
                            </div>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={hasSentProof}
                                    onChange={(e) => setHasSentProof(e.target.checked)}
                                    disabled={planPaymentStatus === 'VERIFIED'}
                                />
                                <span>I have sent the proof of payment via WhatsApp</span>
                            </label>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handlePlanSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Package Selection'}
                            </button>
                        </div>
                    </div>

                    {/* Business Details Section */}
                    <h2 className={styles.sectionTitle}>Business Details</h2>
                    <p className={styles.sectionHint}>
                        Provide your business information. This will be reviewed by our team.
                    </p>

                    <div className={styles.formGrid}>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label htmlFor="businessName">Business Name *</label>
                            <input
                                id="businessName"
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                required
                                className={styles.input}
                                placeholder="e.g., Beauty Supplies SA"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="contactPerson">Contact Person Name *</label>
                            <input
                                id="contactPerson"
                                type="text"
                                value={contactPerson}
                                onChange={(e) => setContactPerson(e.target.value)}
                                required
                                className={styles.input}
                                placeholder="Full name of primary contact"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="contactPhone">Contact Phone *</label>
                            <input
                                id="contactPhone"
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                required
                                className={styles.input}
                                placeholder="+27 82 123 4567"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="contactEmail">Contact Email</label>
                            <input
                                id="contactEmail"
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className={styles.input}
                                placeholder="business@example.com"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="whatsapp">WhatsApp Number</label>
                            <input
                                id="whatsapp"
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className={styles.input}
                                placeholder="+27 82 123 4567"
                            />
                        </div>

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label htmlFor="physicalAddress">Physical Address *</label>
                            <input
                                id="physicalAddress"
                                type="text"
                                value={physicalAddress}
                                onChange={(e) => setPhysicalAddress(e.target.value)}
                                required
                                className={styles.input}
                                placeholder="123 Main Street, Johannesburg, 2000"
                            />
                        </div>

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label htmlFor="website">Website (Optional)</label>
                            <input
                                id="website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className={styles.input}
                                placeholder="https://www.example.com"
                            />
                        </div>
                    </div>

                    {/* Provinces Served Section */}
                    <h2 className={styles.sectionTitle}>Provinces You Serve *</h2>
                    <p className={styles.sectionHint}>
                        Select all the South African provinces where you can deliver or provide services.
                    </p>

                    <div className={styles.provinceSection}>
                        <label className={styles.provinceSelectAll}>
                            <input
                                type="checkbox"
                                checked={provincesServed.length === SA_PROVINCES.length}
                                onChange={handleSelectAllProvinces}
                            />
                            <span>Select All Provinces</span>
                        </label>
                        <div className={styles.provinceGrid}>
                            {SA_PROVINCES.map((province) => (
                                <label key={province} className={styles.provinceItem}>
                                    <input
                                        type="checkbox"
                                        checked={provincesServed.includes(province)}
                                        onChange={() => handleProvinceToggle(province)}
                                    />
                                    <span>{province}</span>
                                </label>
                            ))}
                        </div>
                        {provincesServed.length > 0 && (
                            <p className={styles.provinceCount}>
                                {provincesServed.length} province{provincesServed.length !== 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.buttonContainer}>
                        <div className={styles.draftActions}>
                            <button
                                type="button"
                                onClick={saveDraft}
                                disabled={isSaving}
                                className={styles.saveDraftButton}
                            >
                                {isSaving ? 'Saving...' : '💾 Save & Continue Later'}
                            </button>
                            {hasDraft && (
                                <button
                                    type="button"
                                    onClick={clearDraft}
                                    className={styles.clearDraftButton}
                                >
                                    🗑️ Clear Draft
                                </button>
                            )}
                            {lastSaved && (
                                <span className={styles.lastSaved}>
                                    Last saved: {lastSaved}
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                        >
                            {isSubmitting ? 'Submitting...' : isApproved ? 'Update Profile' : 'Submit for Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
