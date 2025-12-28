'use client';

import { useState, useEffect } from 'react';
import styles from './CashbackWallet.module.css';
import { FaGift, FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa';

interface CashbackTransaction {
    id: string;
    amount: number;
    type: 'EARNED' | 'SPENT' | 'ADJUSTMENT';
    description?: string;
    createdAt: string;
}

interface CashbackSummary {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    recentTransactions: CashbackTransaction[];
}

export default function CashbackWallet() {
    const [data, setData] = useState<CashbackSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const fetchCashback = async () => {
            try {
                const response = await fetch('/api/cashback/summary', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Failed to fetch cashback:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCashback();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton} />
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <FaGift className={styles.icon} />
                    <h3 className={styles.title}>Cashback Wallet</h3>
                </div>
                <div className={styles.infoTip}>
                    <FaInfoCircle />
                    <span>Earn 5% cashback on every booking!</span>
                </div>
            </div>

            <div className={styles.balanceCard}>
                <span className={styles.balanceLabel}>Available Balance</span>
                <span className={styles.balanceAmount}>R{data.balance.toFixed(2)}</span>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <FaArrowUp className={styles.statIconEarned} />
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Earned</span>
                        <span className={styles.statValue}>R{data.totalEarned.toFixed(2)}</span>
                    </div>
                </div>
                <div className={styles.stat}>
                    <FaArrowDown className={styles.statIconSpent} />
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Spent</span>
                        <span className={styles.statValue}>R{data.totalSpent.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {data.recentTransactions.length > 0 && (
                <>
                    <button
                        className={styles.historyToggle}
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? 'Hide' : 'Show'} Transaction History
                    </button>

                    {showHistory && (
                        <div className={styles.transactionList}>
                            {data.recentTransactions.map((tx) => (
                                <div key={tx.id} className={styles.transaction}>
                                    <div className={`${styles.txIcon} ${tx.type === 'EARNED' ? styles.earned : styles.spent}`}>
                                        {tx.type === 'EARNED' ? <FaArrowUp /> : <FaArrowDown />}
                                    </div>
                                    <div className={styles.txInfo}>
                                        <span className={styles.txDesc}>
                                            {tx.description || (tx.type === 'EARNED' ? 'Cashback earned' : 'Cashback used')}
                                        </span>
                                        <span className={styles.txDate}>{formatDate(tx.createdAt)}</span>
                                    </div>
                                    <span className={`${styles.txAmount} ${tx.type === 'EARNED' ? styles.positive : styles.negative}`}>
                                        {tx.type === 'EARNED' ? '+' : '-'}R{Math.abs(tx.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {data.balance === 0 && data.totalEarned === 0 && (
                <div className={styles.emptyState}>
                    <p>Start earning cashback by making your first booking!</p>
                </div>
            )}
        </div>
    );
}
