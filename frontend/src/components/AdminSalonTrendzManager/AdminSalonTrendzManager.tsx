'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import styles from './AdminSalonTrendzManager.module.css';

interface SalonTrendzData {
  id: string;
  name: string;
  city: string;
  province: string;
  avgRating: number;
  trendzProfile: {
    isEnabled: boolean;
    categories: string[];
    isPremium: boolean;
    impressions: number;
    clicks: number;
  };
}

const TREND_CATEGORIES = [
  { value: 'HAIRSTYLE', label: 'Hairstyle' },
  { value: 'BRAIDS', label: 'Braids' },
  { value: 'LOCS', label: 'Locs' },
  { value: 'EXTENSIONS', label: 'Extensions' },
  { value: 'NAILS', label: 'Nails' },
  { value: 'SPA', label: 'Spa' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'MASSAGE', label: 'Massage' },
  { value: 'BARBERING', label: 'Barbering' },
];

export default function AdminSalonTrendzManager() {
  const [salons, setSalons] = useState<SalonTrendzData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  // Filter salons based on search query
  const filteredSalons = filterQuery.trim()
    ? salons.filter(s =>
      s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.province.toLowerCase().includes(filterQuery.toLowerCase())
    )
    : salons;

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trends/admin/salons', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setSalons(data);
      } else {
        toast.error('Failed to fetch salons');
      }
    } catch (error) {
      toast.error('Error loading salons');
    } finally {
      setIsLoading(false);
    }
  };

  const activateSalon = async (salonId: string) => {
    try {
      const res = await fetch(`/api/trends/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isEnabled: true }),
      });

      if (res.ok) {
        toast.success('Salon activated for Trendz!');
        fetchSalons();
      } else {
        toast.error('Failed to activate salon');
      }
    } catch (error) {
      toast.error('Error activating salon');
    }
  };

  const deactivateSalon = async (salonId: string) => {
    try {
      const res = await fetch(`/api/trends/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isEnabled: false }),
      });

      if (res.ok) {
        toast.success('Salon deactivated from Trendz');
        fetchSalons();
      } else {
        toast.error('Failed to deactivate salon');
      }
    } catch (error) {
      toast.error('Error deactivating salon');
    }
  };

  const startEditing = (salon: SalonTrendzData) => {
    setEditingId(salon.id);
    setSelectedCategories(salon.trendzProfile.categories);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setSelectedCategories([]);
  };

  const saveCategories = async (salonId: string) => {
    try {
      const res = await fetch(`/api/trends/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ categories: selectedCategories }),
      });

      if (res.ok) {
        toast.success('Categories updated!');
        setEditingId(null);
        fetchSalons();
      } else {
        toast.error('Failed to update categories');
      }
    } catch (error) {
      toast.error('Error updating categories');
    }
  };

  const togglePremium = async (salon: SalonTrendzData) => {
    try {
      const res = await fetch(`/api/trends/admin/salons/${salon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPremium: !salon.trendzProfile.isPremium }),
      });

      if (res.ok) {
        toast.success(salon.trendzProfile.isPremium ? 'Premium removed' : 'Premium activated!');
        fetchSalons();
      } else {
        toast.error('Failed to update premium status');
      }
    } catch (error) {
      toast.error('Error updating premium status');
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading salons...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Manage Salon Trendz Recommendations</h3>
        <p>Control which salons appear in trend recommendations</p>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by salon name, city, province..."
          className={styles.filterInput}
        />
        <span className={styles.filterCount}>
          Showing {filteredSalons.length} of {salons.length}
        </span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{salons.filter(s => s.trendzProfile.isEnabled).length}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{salons.filter(s => s.trendzProfile.isPremium).length}</span>
          <span className={styles.statLabel}>Premium</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{salons.length}</span>
          <span className={styles.statLabel}>Total Salons</span>
        </div>
      </div>

      {filteredSalons.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{salons.length === 0 ? 'No salons found' : 'No salons match your filter'}</p>
        </div>
      ) : (
        <div className={styles.salonsList}>
          {filteredSalons.map((salon) => (
            <div key={salon.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{salon.name}</h4>
                <p>{salon.city}, {salon.province}</p>
                {salon.trendzProfile.impressions > 0 && (
                  <p className={styles.analytics}>
                    👁️ {salon.trendzProfile.impressions.toLocaleString()} impressions •
                    🖱️ {salon.trendzProfile.clicks.toLocaleString()} clicks
                    {salon.trendzProfile.clicks > 0 && (
                      <> • 📊 {((salon.trendzProfile.clicks / salon.trendzProfile.impressions) * 100).toFixed(1)}% CTR</>
                    )}
                  </p>
                )}

                {editingId === salon.id ? (
                  <div className={styles.categoryEditor}>
                    <p><strong>Select Categories:</strong></p>
                    <div className={styles.categoryGrid}>
                      {TREND_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => toggleCategory(cat.value)}
                          className={`${styles.categoryChip} ${selectedCategories.includes(cat.value) ? styles.selected : ''
                            }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className={styles.editorActions}>
                      <button onClick={() => saveCategories(salon.id)} className={styles.saveButton}>
                        <FaCheck /> Save
                      </button>
                      <button onClick={cancelEditing} className={styles.cancelButton}>
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : salon.trendzProfile.isEnabled && salon.trendzProfile.categories.length > 0 && (
                  <div className={styles.categories}>
                    <p><strong>Categories:</strong></p>
                    <div className={styles.categoryList}>
                      {salon.trendzProfile.categories.map((cat) => (
                        <span key={cat} className={styles.categoryTag}>
                          {TREND_CATEGORIES.find((c) => c.value === cat)?.label || cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                {salon.trendzProfile.isEnabled ? (
                  <>
                    <button onClick={() => startEditing(salon)} className={styles.editButton}>
                      Edit Categories
                    </button>
                    <button onClick={() => togglePremium(salon)} className={salon.trendzProfile.isPremium ? styles.premiumButton : styles.makePremiumButton}>
                      {salon.trendzProfile.isPremium ? '⭐ Premium' : 'Make Premium'}
                    </button>
                    <button onClick={() => deactivateSalon(salon.id)} className={styles.deactivateButton}>
                      Deactivate
                    </button>
                  </>
                ) : (
                  <button onClick={() => activateSalon(salon.id)} className={styles.activateButton}>
                    Activate for Trendz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
