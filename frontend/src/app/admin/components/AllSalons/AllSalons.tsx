'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from '../../AdminPage.module.css';
import { PendingSalon, ensureArray } from '../../types';
import { APP_PLANS } from '@/constants/plans';
import { notify } from '@/lib/notify';
import { LoadingButton } from '@/components/ui';

interface AllSalonsProps {
    salons: PendingSalon[];
    onSalonsUpdate: (salons: PendingSalon[]) => void;
    onOpenDeleteModal: (salon: PendingSalon) => void;
    backendJwt?: string;
}

export default function AllSalons({
    salons,
    onSalonsUpdate,
    onOpenDeleteModal,
    backendJwt,
}: AllSalonsProps) {
    const [search, setSearch] = useState('');
    const [savedViews, setSavedViews] = useState<{ name: string; query: string }[]>([]);
    const [editingSalonId, setEditingSalonId] = useState<string | null>(null);
    const [draftPlan, setDraftPlan] = useState('PREMIUM');
    const [draftWeight, setDraftWeight] = useState('');
    const [draftMax, setDraftMax] = useState('');
    const [savingSalonId, setSavingSalonId] = useState<string | null>(null);
    const [verifyingSalonId, setVerifyingSalonId] = useState<string | null>(null);

    const filteredSalons = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return salons;
        return salons.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.owner.email.toLowerCase().includes(q) ||
            (s.planCode ?? '').toLowerCase().includes(q)
        );
    }, [salons, search]);

    const authHeaders: Record<string, string> = backendJwt
        ? { Authorization: `Bearer ${backendJwt}` }
        : {};

    useEffect(() => {
        try {
            const raw = localStorage.getItem('admin-saved-views');
            if (raw) {
                setSavedViews(JSON.parse(raw));
            }
        } catch { }
    }, []);

    const handleSaveView = () => {
        const name = window.prompt('Save current search as view name:');
        if (!name) return;
        const next = [...savedViews, { name, query: search }];
        setSavedViews(next);
        try {
            localStorage.setItem('admin-saved-views', JSON.stringify(next));
        } catch { }
    };

    const handleLoadView = (viewName: string) => {
        const view = savedViews.find(v => v.name === viewName);
        if (view) {
            setSearch(view.query);
        }
    };

    const startEdit = (salon: PendingSalon) => {
        setEditingSalonId(salon.id);
        setDraftPlan((salon.planCode ?? 'PREMIUM').toUpperCase());
        setDraftWeight(String(salon.visibilityWeight ?? ''));
        setDraftMax(String(salon.maxListings ?? ''));
    };

    const handleSave = async (salonId: string) => {
        setSavingSalonId(salonId);
        const allowedPlans = APP_PLANS.map(p => p.code);
        const normalizedPlan = (draftPlan ?? '').toUpperCase();
        const visibilityWeight = Number(draftWeight);
        const maxListings = Number(draftMax);
        const body: Record<string, unknown> = {};

        if (allowedPlans.includes(normalizedPlan as typeof allowedPlans[number])) {
            body.planCode = normalizedPlan;
        }
        if (!Number.isNaN(visibilityWeight) && draftWeight !== '') body.visibilityWeight = visibilityWeight;
        if (!Number.isNaN(maxListings) && draftMax !== '') body.maxListings = maxListings;

        try {
            const r = await fetch(`/api/admin/salons/${salonId}/plan`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            if (r.ok) {
                notify.success('Visibility updated');
                setEditingSalonId(null);
                // Re-fetch from server
                try {
                    const allRes = await fetch(`/api/admin/salons/all?ts=${Date.now()}`, {
                        credentials: 'include',
                        cache: 'no-store' as RequestCache,
                        headers: authHeaders
                    });
                    if (allRes.ok) {
                        const fresh = ensureArray<PendingSalon>(await allRes.json());
                        onSalonsUpdate(fresh);
                    }
                } catch { }
            } else {
                const errText = await r.text().catch(() => '');
                notify.error(`Failed to update (${r.status}). ${errText}`);
            }
        } finally {
            setSavingSalonId(null);
        }
    };

    const toggleVerification = async (salon: PendingSalon) => {
        setVerifyingSalonId(salon.id);
        try {
            const r = await fetch(`/api/admin/salons/${salon.id}/verification`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                credentials: 'include',
            });
            if (r.ok) {
                const updated = await r.json();
                notify.success(`Salon ${updated.isVerified ? 'verified' : 'unverified'}`);
                // Re-fetch
                try {
                    const allRes = await fetch(`/api/admin/salons/all?ts=${Date.now()}`, {
                        credentials: 'include',
                        cache: 'no-store' as RequestCache,
                        headers: authHeaders
                    });
                    if (allRes.ok) {
                        const fresh = ensureArray<PendingSalon>(await allRes.json());
                        onSalonsUpdate(fresh);
                    }
                } catch { }
            } else {
                const errText = await r.text().catch(() => '');
                notify.error(`Failed to update verification (${r.status}). ${errText}`);
            }
        } catch {
            notify.error('Error updating verification');
        } finally {
            setVerifyingSalonId(null);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name/email/plan"
                    style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8, minWidth: 260 }}
                />
                <button className={styles.approveButton} onClick={handleSaveView}>Save view</button>
                {savedViews.length > 0 && (
                    <select onChange={e => handleLoadView(e.target.value)} defaultValue="">
                        <option value="" disabled>Load view...</option>
                        {savedViews.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>
                )}
            </div>

            {filteredSalons.length > 0 ? filteredSalons.map(salon => (
                <div key={salon.id} className={styles.listItem}>
                    <div className={styles.info}>
                        <h4>{salon.name}</h4>
                        <p>Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email}) | Status: {salon.approvalStatus}</p>
                        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {editingSalonId !== salon.id ? (
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span><strong>Package:</strong> {salon.planCode ?? '-'}</span>
                                    <span><strong>Featured order weight:</strong> {salon.visibilityWeight ?? 0}</span>
                                    <span><strong>Max listings:</strong> {salon.maxListings ?? '-'}</span>
                                    <button className={styles.approveButton} onClick={() => startEdit(salon)}>Edit</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <label>Package</label>
                                    <select value={draftPlan} onChange={e => setDraftPlan(e.target.value)} style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                                        {APP_PLANS.map((plan) => (
                                            <option key={plan.code} value={plan.code}>
                                                {plan.name} ({plan.visibilityWeight}x visibility)
                                            </option>
                                        ))}
                                    </select>
                                    <label>Featured order weight</label>
                                    <input value={draftWeight} onChange={e => setDraftWeight(e.target.value)} type="number" min={0} placeholder="0" style={{ width: 90, padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                                    <label>Max listings</label>
                                    <input value={draftMax} onChange={e => setDraftMax(e.target.value)} type="number" min={1} placeholder="max" style={{ width: 90, padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                                    <LoadingButton
                                        className={styles.approveButton}
                                        loading={savingSalonId === salon.id}
                                        disabled={Boolean(savingSalonId)}
                                        loadingText="Saving..."
                                        onClick={() => handleSave(salon.id)}
                                    >
                                        Save
                                    </LoadingButton>
                                    <button className={styles.rejectButton} onClick={() => setEditingSalonId(null)} disabled={Boolean(savingSalonId)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                        <LoadingButton
                            className={salon.isVerified ? styles.approveButton : styles.rejectButton}
                            loading={verifyingSalonId === salon.id}
                            disabled={Boolean(verifyingSalonId)}
                            loadingText={salon.isVerified ? 'Unverifying...' : 'Verifying...'}
                            onClick={() => toggleVerification(salon)}
                            title={salon.isVerified ? 'Remove verification' : 'Verify service provider'}
                        >
                            {salon.isVerified ? 'Verified' : 'Verify'}
                        </LoadingButton>
                        <button
                            className={styles.rejectButton}
                            onClick={() => onOpenDeleteModal(salon)}
                            title="Delete provider profile"
                        >Delete Profile</button>
                    </div>
                </div>
            )) : <p>No salons found.</p>}
        </>
    );
}
