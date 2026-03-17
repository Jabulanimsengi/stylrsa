'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './AddressBook.module.css';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaHome, FaBriefcase, FaEllipsisH } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface UserAddress {
    id: string;
    label: string;
    address: string;
    latitude?: number;
    longitude?: number;
    isDefault: boolean;
}

interface AddressBookProps {
    userId?: string;
    onAddressSelect?: (address: UserAddress) => void;
    selectable?: boolean;
}

interface GeocodeFeature {
    id: string;
    place_name: string;
    center: [number, number];
}

const LABEL_ICONS: Record<string, React.ReactNode> = {
    HOME: <FaHome />,
    WORK: <FaBriefcase />,
    OTHER: <FaEllipsisH />,
};

export default function AddressBook({ userId: _userId, onAddressSelect, selectable = false }: AddressBookProps) {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        label: 'HOME',
        address: '',
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
    });
    const [searchResults, setSearchResults] = useState<GeocodeFeature[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Fetch addresses
    const fetchAddresses = useCallback(async () => {
        try {
            const response = await fetch('/api/user-addresses', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // Mapbox geocoding search (via server proxy)
    const searchAddress = async (query: string) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await fetch(
                `/api/geocode?query=${encodeURIComponent(query)}`
            );
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.features || []);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.address && !formData.latitude) {
                searchAddress(formData.address);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.address, formData.latitude]);

    const selectSearchResult = (result: GeocodeFeature) => {
        setFormData({
            ...formData,
            address: result.place_name,
            latitude: result.center[1],
            longitude: result.center[0],
        });
        setSearchResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.address) {
            toast.error('Please enter an address');
            return;
        }

        try {
            const url = editingId
                ? `/api/user-addresses/${editingId}`
                : '/api/user-addresses';

            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(editingId ? 'Address updated!' : 'Address added!');
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ label: 'HOME', address: '', latitude: undefined, longitude: undefined });
                fetchAddresses();
            } else {
                throw new Error('Failed to save address');
            }
        } catch {
            toast.error('Failed to save address');
        }
    };

    const handleEdit = (address: UserAddress) => {
        setFormData({
            label: address.label,
            address: address.address,
            latitude: address.latitude,
            longitude: address.longitude,
        });
        setEditingId(address.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await fetch(`/api/user-addresses/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Address deleted');
                fetchAddresses();
            } else {
                throw new Error('Failed to delete');
            }
        } catch {
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const response = await fetch(`/api/user-addresses/${id}/set-default`, {
                method: 'PUT',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Default address updated');
                fetchAddresses();
            }
        } catch {
            toast.error('Failed to set default');
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <FaMapMarkerAlt /> My Addresses
                </h3>
                {!showAddForm && (
                    <button
                        className={styles.addButton}
                        onClick={() => setShowAddForm(true)}
                    >
                        <FaPlus /> Add Address
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.labelSelector}>
                        {['HOME', 'WORK', 'OTHER'].map((label) => (
                            <button
                                key={label}
                                type="button"
                                className={`${styles.labelOption} ${formData.label === label ? styles.active : ''}`}
                                onClick={() => setFormData({ ...formData, label })}
                            >
                                {LABEL_ICONS[label]}
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value, latitude: undefined, longitude: undefined })}
                            placeholder="Search for an address..."
                            className={styles.searchInput}
                        />
                        {searchLoading && <div className={styles.searchSpinner} />}

                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map((result) => (
                                    <button
                                        key={result.id}
                                        type="button"
                                        className={styles.searchResult}
                                        onClick={() => selectSearchResult(result)}
                                    >
                                        <FaMapMarkerAlt />
                                        <span>{result.place_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {formData.latitude && (
                        <div className={styles.selectedAddress}>
                            <FaCheck /> Address selected
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setFormData({ label: 'HOME', address: '', latitude: undefined, longitude: undefined });
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            {editingId ? 'Update' : 'Save'} Address
                        </button>
                    </div>
                </form>
            )}

            {/* Address List */}
            <div className={styles.addressList}>
                {addresses.length === 0 && !showAddForm ? (
                    <div className={styles.emptyState}>
                        <FaMapMarkerAlt className={styles.emptyIcon} />
                        <p>No saved addresses yet</p>
                        <button
                            className={styles.addFirstButton}
                            onClick={() => setShowAddForm(true)}
                        >
                            Add your first address
                        </button>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`${styles.addressCard} ${address.isDefault ? styles.default : ''} ${selectable ? styles.selectable : ''}`}
                            onClick={selectable ? () => onAddressSelect?.(address) : undefined}
                        >
                            <div className={styles.addressIcon}>
                                {LABEL_ICONS[address.label] || <FaMapMarkerAlt />}
                            </div>
                            <div className={styles.addressInfo}>
                                <div className={styles.addressLabel}>
                                    {address.label}
                                    {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
                                </div>
                                <div className={styles.addressText}>{address.address}</div>
                            </div>
                            {!selectable && (
                                <div className={styles.addressActions}>
                                    {!address.isDefault && (
                                        <button
                                            className={styles.actionBtn}
                                            onClick={(e) => { e.stopPropagation(); handleSetDefault(address.id); }}
                                            title="Set as default"
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                    <button
                                        className={styles.actionBtn}
                                        onClick={(e) => { e.stopPropagation(); handleEdit(address); }}
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={(e) => { e.stopPropagation(); handleDelete(address.id); }}
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
