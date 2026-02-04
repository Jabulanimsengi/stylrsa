'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../AdminPage.module.css';
import { PendingSalon, ensureArray } from '../../types';
import { APP_PLANS } from '@/constants/plans';
import { toast } from 'react-toastify';

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
    const [draftPlan, setDraftPlan] = useState('STARTER');
    const [draftWeight, setDraftWeight] = useState('');
    const [draftMax, setDraftMax] = useState('');
    const [draftFeatured, setDraftFeatured] = useState('');

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
        setDraftPlan((salon.planCode ?? 'STARTER').toUpperCase());
        setDraftWeight(String(salon.visibilityWeight ?? ''));
        setDraftMax(String(salon.maxListings ?? ''));
        setDraftFeatured(salon.featuredUntil ? new Date(salon.featuredUntil).toISOString().slice(0, 16) : '');
    };

    const handleSave = async (salonId: string) => {
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
        body.featuredUntil = featuredUntil ? new Date(featuredUntil).toISOString() : null;

        const r = await fetch(`/api/admin/salons/${salonId}/plan`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        if (r.ok) {
            toast.success('Visibility updated');
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
            toast.error(`Failed to update (${r.status}). ${errText}`);
        }
    };

    const toggleVerification = async (salon: PendingSalon) => {
        try {
            const r = await fetch(`/api/admin/salons/${salon.id}/verification`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                credentials: 'include',
            });
            if (r.ok) {
                const updated = await r.json();
                toast.success(`Salon ${updated.isVerified ? 'verified' : 'unverified'}`);
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
                toast.error(`Failed to update verification (${r.status}). ${errText}`);
            }
        } catch {
            toast.error('Error updating verification');
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
                        <option value="" disabled>Load view…</option>
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
                                    <span><strong>Package:</strong> {salon.planCode ?? '—'}</span>
                                    <span><strong>Visibility:</strong> {salon.visibilityWeight ?? '—'}</span>
                                    <span><strong>Max listings:</strong> {salon.maxListings ?? '—'}</span>
                                    <span><strong>Featured until:</strong> {salon.featuredUntil ? new Date(salon.featuredUntil).toLocaleString() : '—'}</span>
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
                                    <label>Weight</label>
                                    <input value={draftWeight} onChange={e => setDraftWeight(e.target.value)} type="number" min={1} placeholder="visibility" style={{ width: 90, padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                                    <label>Max listings</label>
                                    <input value={draftMax} onChange={e => setDraftMax(e.target.value)} type="number" min={1} placeholder="max" style={{ width: 90, padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                                    <label>Featured until</label>
                                    <input value={draftFeatured} onChange={e => setDraftFeatured(e.target.value)} type="datetime-local" style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                                    <button className={styles.approveButton} onClick={() => handleSave(salon.id)}>Save</button>
                                    <button className={styles.rejectButton} onClick={() => setEditingSalonId(null)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                        <button
                            className={salon.isVerified ? styles.approveButton : styles.rejectButton}
                            onClick={() => toggleVerification(salon)}
                            title={salon.isVerified ? 'Remove verification' : 'Verify service provider'}
                        >
                            {salon.isVerified ? '✓ Verified' : 'Verify'}
                        </button>
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
