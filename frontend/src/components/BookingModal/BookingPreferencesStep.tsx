'use client';

import { useState, useEffect } from 'react';
import styles from './BookingPreferencesStep.module.css';
import { FaPalette, FaBox, FaShoppingCart, FaCheck, FaInfoCircle } from 'react-icons/fa';

interface BookingPreferencesStepProps {
    serviceName: string;
    serviceCategory?: string; // e.g., 'nails', 'braiding', 'hair'
    salonId: string;
    onContinue: (preferences: BookingPreferences) => void;
    onBack: () => void;
}

export interface BookingPreferences {
    colorSelection?: string;
    materialSelection: 'HAVE_OWN' | 'BUY_SALON' | 'BUY_PLATFORM' | null;
}

interface SalonMaterial {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    isSold: boolean;
    price?: number;
}

// Check if service requires color selection
const requiresColorSelection = (category?: string, name?: string): boolean => {
    const colorKeywords = ['nail', 'manicure', 'pedicure', 'polish', 'gel'];
    const searchText = `${category || ''} ${name || ''}`.toLowerCase();
    return colorKeywords.some(keyword => searchText.includes(keyword));
};

// Check if service requires material selection
const requiresMaterialSelection = (category?: string, name?: string): boolean => {
    const materialKeywords = ['braid', 'weave', 'wig', 'extension', 'hairpiece', 'locs', 'twist'];
    const searchText = `${category || ''} ${name || ''}`.toLowerCase();
    return materialKeywords.some(keyword => searchText.includes(keyword));
};

export default function BookingPreferencesStep({
    serviceName,
    serviceCategory,
    salonId,
    onContinue,
    onBack,
}: BookingPreferencesStepProps) {
    const [colorSelection, setColorSelection] = useState('');
    const [materialSelection, setMaterialSelection] = useState<BookingPreferences['materialSelection']>(null);
    const [salonMaterials, setSalonMaterials] = useState<SalonMaterial[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    const showColorInput = requiresColorSelection(serviceCategory, serviceName);
    const showMaterialOptions = requiresMaterialSelection(serviceCategory, serviceName);

    // Fetch salon materials if needed
    useEffect(() => {
        if (showMaterialOptions) {
            const fetchMaterials = async () => {
                setLoadingMaterials(true);
                try {
                    const response = await fetch(`/api/salon-materials/salon/${salonId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSalonMaterials(data.filter((m: SalonMaterial) => m.isSold));
                    }
                } catch (error) {
                    console.error('Failed to fetch materials:', error);
                } finally {
                    setLoadingMaterials(false);
                }
            };
            fetchMaterials();
        }
    }, [salonId, showMaterialOptions]);

    const handleContinue = () => {
        onContinue({
            colorSelection: showColorInput ? colorSelection : undefined,
            materialSelection: showMaterialOptions ? materialSelection : null,
        });
    };

    const canContinue = () => {
        if (showMaterialOptions && !materialSelection) return false;
        return true;
    };

    // If no preferences needed, skip this step
    if (!showColorInput && !showMaterialOptions) {
        // Auto-continue without preferences
        onContinue({ materialSelection: null });
        return null;
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Service Preferences</h3>
            <p className={styles.subtitle}>Help us prepare for your appointment</p>

            {/* Color Selection */}
            {showColorInput && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <FaPalette className={styles.sectionIcon} />
                        <span>Color Preference</span>
                    </div>
                    <p className={styles.sectionDesc}>
                        What color would you like? (optional)
                    </p>
                    <input
                        type="text"
                        value={colorSelection}
                        onChange={(e) => setColorSelection(e.target.value)}
                        placeholder="e.g., French tip, Red #42, Nude pink..."
                        className={styles.colorInput}
                    />
                </div>
            )}

            {/* Material Selection */}
            {showMaterialOptions && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <FaBox className={styles.sectionIcon} />
                        <span>Hair/Material</span>
                    </div>
                    <p className={styles.sectionDesc}>
                        Do you have your own hair/material for this service?
                    </p>

                    <div className={styles.optionsGrid}>
                        <button
                            type="button"
                            className={`${styles.optionCard} ${materialSelection === 'HAVE_OWN' ? styles.selected : ''}`}
                            onClick={() => setMaterialSelection('HAVE_OWN')}
                        >
                            <FaCheck className={styles.optionIcon} />
                            <span className={styles.optionTitle}>I have my own</span>
                            <span className={styles.optionDesc}>
                                I'll bring my own hair/material
                            </span>
                        </button>

                        {salonMaterials.length > 0 && (
                            <button
                                type="button"
                                className={`${styles.optionCard} ${materialSelection === 'BUY_SALON' ? styles.selected : ''}`}
                                onClick={() => setMaterialSelection('BUY_SALON')}
                            >
                                <FaBox className={styles.optionIcon} />
                                <span className={styles.optionTitle}>Use salon's</span>
                                <span className={styles.optionDesc}>
                                    Purchase from the salon
                                </span>
                            </button>
                        )}

                        <button
                            type="button"
                            className={`${styles.optionCard} ${materialSelection === 'BUY_PLATFORM' ? styles.selected : ''}`}
                            onClick={() => setMaterialSelection('BUY_PLATFORM')}
                        >
                            <FaShoppingCart className={styles.optionIcon} />
                            <span className={styles.optionTitle}>Shop on platform</span>
                            <span className={styles.optionDesc}>
                                Browse our marketplace
                            </span>
                        </button>
                    </div>

                    {materialSelection === 'BUY_PLATFORM' && (
                        <div className={styles.platformNote}>
                            <FaInfoCircle />
                            <span>
                                After booking, we'll suggest products from our marketplace that match your service.
                            </span>
                        </div>
                    )}

                    {materialSelection === 'BUY_SALON' && salonMaterials.length > 0 && (
                        <div className={styles.materialsPreview}>
                            <span className={styles.previewTitle}>Available at this salon:</span>
                            <div className={styles.materialsList}>
                                {salonMaterials.slice(0, 3).map((material) => (
                                    <div key={material.id} className={styles.materialItem}>
                                        <span>{material.name}</span>
                                        {material.price && <strong>R{material.price.toFixed(2)}</strong>}
                                    </div>
                                ))}
                                {salonMaterials.length > 3 && (
                                    <span className={styles.moreCount}>
                                        +{salonMaterials.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={onBack}
                >
                    Back
                </button>
                <button
                    type="button"
                    className={styles.continueButton}
                    onClick={handleContinue}
                    disabled={!canContinue()}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
