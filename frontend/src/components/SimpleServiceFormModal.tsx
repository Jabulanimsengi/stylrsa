// frontend/src/components/SimpleServiceFormModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import styles from './ServiceFormModal.module.css'; // Reusing existing styles
import { toast } from 'react-toastify';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { Service } from '@/types';
import { getCategoriesCached } from '@/lib/resourceCache';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui';

interface ServiceFormInputs {
    name: string;
    description: string;
    price: number;
    duration: number;
    pricingType?: 'PER_PERSON' | 'PER_COUPLE';
    categoryId: string;
}

interface SimpleServiceFormModalProps {
    salonId: string;
    onClose: () => void;
    onServiceAddedOrUpdated?: (service: Service) => void;
    serviceToEdit?: Service | null;
}

interface Category {
    id: string;
    name: string;
}

interface ServicePayload {
    title: string;
    description: string;
    price: number;
    duration: number;
    images: string[];
    salonId: string;
    categoryId?: string;
}

const SimpleServiceFormModal: React.FC<SimpleServiceFormModalProps> = ({
    onClose,
    salonId,
    onServiceAddedOrUpdated,
    serviceToEdit,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ServiceFormInputs>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            duration: 30,
            categoryId: '',
        },
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoadingCategories(true);
        getCategoriesCached()
            .then((data) => {
                if (!cancelled) {
                    setCategories(data || []);
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error('[SimpleServiceFormModal] Failed to load categories:', error);
                    toast.error(toFriendlyMessage(error, 'Failed to load service categories.'));
                    setCategories([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingCategories(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (serviceToEdit) {
            reset({
                name: serviceToEdit.name ?? serviceToEdit.title ?? '',
                description: serviceToEdit.description,
                price: serviceToEdit.price,
                duration: serviceToEdit.duration,
                categoryId: serviceToEdit.categoryId ?? '',
            });
        } else {
            reset({
                name: '',
                description: '',
                price: 0,
                duration: 30,
                categoryId: '',
            });
        }
    }, [serviceToEdit, reset]);

    const onSubmit: SubmitHandler<ServiceFormInputs> = async (data) => {
        setErrorMessage(null);
        try {
            const serviceData: ServicePayload = {
                title: data.name,
                description: data.description,
                price: Number(data.price),
                duration: Number(data.duration),
                images: [], // Explicitly empty for simple services
                salonId,
                ...(data.categoryId && data.categoryId.trim() !== '' && { categoryId: data.categoryId }),
            };

            const url = serviceToEdit
                ? `/api/services/${serviceToEdit.id}`
                : `/api/services`;
            const method = serviceToEdit ? 'PATCH' : 'POST';

            const savedService = await apiJson<Service>(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceData),
            });

            if (serviceToEdit) {
                toast.success(`✅ Service updated successfully!`);
            } else {
                toast.success(`🎉 Service added successfully!`);
            }

            onServiceAddedOrUpdated?.(savedService);
            onClose();
        } catch (error: unknown) {
            const msg = toFriendlyMessage(error, 'Failed to save service.');
            setErrorMessage(msg);
            toast.error(msg);
        }
    };

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        reset();
        setErrorMessage(null);
        onClose();
    }, [isSubmitting, reset, onClose]);

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={handleClose} disabled={isSubmitting}>&times;</button>
                <h2 className={styles.title}>{serviceToEdit ? 'Edit Simple Service' : 'Add Simple Service'}</h2>
                <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Add a service to your price list. No images required.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                    <div className={styles.formScrollableContent}>
                        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>Service Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    {...register('name', { required: 'Service name is required' })}
                                    className={styles.input}
                                    placeholder="e.g., Men's Haircut"
                                />
                                {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <Controller
                                    name="categoryId"
                                    control={control}
                                    rules={{ required: 'Please select a category' }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isLoadingCategories}
                                        >
                                            <SelectTrigger className={styles.select}>
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingCategories
                                                            ? "Loading..."
                                                            : "Select category..."
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.categoryId && <p className={styles.errorMessage}>{errors.categoryId.message}</p>}
                            </div>
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label htmlFor="description" className={styles.label}>Description</label>
                            <textarea
                                id="description"
                                {...register('description', { required: 'Description is required' })}
                                className={styles.textarea}
                                placeholder="Brief description of what's included"
                                rows={3}
                            />
                            {errors.description && <p className={styles.errorMessage}>{errors.description.message}</p>}
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="price" className={styles.label}>Price (R)</label>
                                <input
                                    id="price"
                                    type="number"
                                    {...register('price', {
                                        required: 'Price is required',
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'Price cannot be negative' }
                                    })}
                                    className={styles.input}
                                    placeholder="e.g., 150"
                                />
                                {errors.price && <p className={styles.errorMessage}>{errors.price.message}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="duration" className={styles.label}>Duration (min)</label>
                                <input
                                    id="duration"
                                    type="number"
                                    {...register('duration', {
                                        required: 'Duration is required',
                                        valueAsNumber: true,
                                        min: { value: 5, message: 'Min 5 mins' }
                                    })}
                                    className={styles.input}
                                    step="5"
                                    placeholder="e.g., 30"
                                />
                                {errors.duration && <p className={styles.errorMessage}>{errors.duration.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonContainer}>
                        <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (serviceToEdit ? 'Save Changes' : 'Save Service')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimpleServiceFormModal;
