'use client';

import { useState, useEffect } from 'react';
import styles from './BookingPaymentStep.module.css';
import { FaCreditCard, FaGift, FaInfoCircle, FaCheck } from 'react-icons/fa';

// Commission breakdown constants (should match backend)
const COMMISSION_RATES = {
    TOTAL: 0.32,        // 32% total commission
    PLATFORM: 0.25,     // 25% platform fee
    CASHBACK: 0.05,     // 5% cashback pool
    PAYMENT: 0.02,      // 2% payment processing
};

const DEPOSIT_RATE = 0.60; // 60% deposit required

interface BookingPaymentStepProps {
    servicePrice: number;
    serviceName: string;
    salonName: string;
    onConfirm: (paymentDetails: PaymentDetails) => void;
    onBack: () => void;
    isLoading?: boolean;
}

export interface PaymentDetails {
    useCashback: boolean;
    cashbackUsed: number;
    amountToPay: number;
    depositAmount: number;
}

interface CashbackSummary {
    balance: number;
    totalEarned: number;
    totalSpent: number;
}

export default function BookingPaymentStep({
    servicePrice,
    serviceName,
    salonName,
    onConfirm,
    onBack,
    isLoading = false,
}: BookingPaymentStepProps) {
    const [useCashback, setUseCashback] = useState(false);
    const [cashbackData, setCashbackData] = useState<CashbackSummary | null>(null);
    const [loadingCashback, setLoadingCashback] = useState(true);

    // Fetch cashback balance
    useEffect(() => {
        const fetchCashback = async () => {
            try {
                const response = await fetch('/api/cashback/summary', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCashbackData(data);
                }
            } catch (error) {
                console.error('Failed to fetch cashback:', error);
            } finally {
                setLoadingCashback(false);
            }
        };

        fetchCashback();
    }, []);

    // Calculate financials
    const totalCost = servicePrice;
    const depositRequired = totalCost * DEPOSIT_RATE;
    const cashbackBalance = cashbackData?.balance ?? 0;
    const canUseCashback = cashbackBalance >= totalCost;

    // Cashback earned from this booking (5% of total)
    const cashbackToEarn = totalCost * COMMISSION_RATES.CASHBACK;

    // Amount to pay
    let amountToPay = depositRequired;
    let cashbackUsed = 0;

    if (useCashback && canUseCashback) {
        cashbackUsed = totalCost;
        amountToPay = 0;
    }

    const handleConfirm = () => {
        onConfirm({
            useCashback: useCashback && canUseCashback,
            cashbackUsed,
            amountToPay,
            depositAmount: depositRequired,
        });
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Payment Summary</h3>

            {/* Booking Summary */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                    <span className={styles.label}>Service</span>
                    <span className={styles.value}>{serviceName}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span className={styles.label}>Salon</span>
                    <span className={styles.value}>{salonName}</span>
                </div>
                <div className={styles.divider} />
                <div className={styles.summaryRow}>
                    <span className={styles.label}>Service Price</span>
                    <span className={styles.value}>R{totalCost.toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.highlight}`}>
                    <span className={styles.label}>Deposit (60%)</span>
                    <span className={styles.value}>R{depositRequired.toFixed(2)}</span>
                </div>
            </div>

            {/* Cashback Section */}
            <div className={styles.cashbackSection}>
                <div className={styles.cashbackHeader}>
                    <FaGift className={styles.cashbackIcon} />
                    <span>Cashback</span>
                </div>

                {loadingCashback ? (
                    <div className={styles.loadingState}>Loading cashback...</div>
                ) : (
                    <>
                        <div className={styles.cashbackBalance}>
                            <span>Your Balance:</span>
                            <strong>R{cashbackBalance.toFixed(2)}</strong>
                        </div>

                        {canUseCashback ? (
                            <label className={styles.cashbackToggle}>
                                <input
                                    type="checkbox"
                                    checked={useCashback}
                                    onChange={(e) => setUseCashback(e.target.checked)}
                                />
                                <span className={styles.toggleSlider} />
                                <span className={styles.toggleLabel}>
                                    Use cashback to pay R{totalCost.toFixed(2)}
                                </span>
                            </label>
                        ) : (
                            <div className={styles.cashbackInfo}>
                                <FaInfoCircle />
                                <span>
                                    {cashbackBalance > 0
                                        ? `Need R${(totalCost - cashbackBalance).toFixed(2)} more to use cashback`
                                        : 'Earn 5% cashback on every booking!'}
                                </span>
                            </div>
                        )}

                        {!useCashback && (
                            <div className={styles.earnBadge}>
                                <FaGift />
                                <span>You'll earn R{cashbackToEarn.toFixed(2)} cashback!</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Payment Method */}
            {amountToPay > 0 && (
                <div className={styles.paymentMethod}>
                    <h4 className={styles.methodTitle}>Payment Method</h4>
                    <div className={styles.methodCard}>
                        <FaCreditCard className={styles.cardIcon} />
                        <div className={styles.methodInfo}>
                            <span className={styles.methodLabel}>Pay with Card</span>
                            <span className={styles.methodDesc}>
                                Secure payment via our payment partner
                            </span>
                        </div>
                        <FaCheck className={styles.checkIcon} />
                    </div>
                </div>
            )}

            {/* Total */}
            <div className={styles.totalSection}>
                <div className={styles.totalRow}>
                    <span>Amount to Pay Now</span>
                    <strong className={styles.totalAmount}>
                        R{amountToPay.toFixed(2)}
                    </strong>
                </div>
                {amountToPay > 0 && amountToPay < totalCost && (
                    <div className={styles.remainingNote}>
                        Remaining R{(totalCost - amountToPay).toFixed(2)} due at appointment
                    </div>
                )}
                {amountToPay === 0 && (
                    <div className={styles.paidNote}>
                        <FaCheck /> Paid with cashback!
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={onBack}
                    disabled={isLoading}
                >
                    Back
                </button>
                <button
                    type="button"
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : `Confirm & Pay R${amountToPay.toFixed(2)}`}
                </button>
            </div>
        </div>
    );
}
