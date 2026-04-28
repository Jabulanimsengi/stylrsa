import React from 'react';
import { Service } from '@/types';
import styles from './SimpleServiceList.module.css';
import { FaClock } from 'react-icons/fa';

type ServiceWithCategoryDetails = Omit<Service, 'category'> & {
    category?: string | { name?: string } | null;
};

interface SimpleServiceListProps {
    services: ServiceWithCategoryDetails[];
    onBook: (service: Service) => void;
}

export default function SimpleServiceList({ services, onBook }: SimpleServiceListProps) {
    // Filter out services that have images (those are displayed elsewhere)
    const simpleServices = services.filter(s => !s.images || s.images.length === 0);

    if (simpleServices.length === 0) {
        return null;
    }

    // Group by category if available, otherwise 'Other'
    const groupedServices = simpleServices.reduce((acc, service) => {
        const categoryName = typeof service.category === 'string'
            ? service.category
            : service.category?.name || 'Other Services';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(service);
        return acc;
    }, {} as Record<string, ServiceWithCategoryDetails[]>);

    const toBookableService = (service: ServiceWithCategoryDetails): Service => ({
        ...service,
        category: typeof service.category === 'string' ? service.category : undefined,
    });

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Service Price List</h3>

            {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category} style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#555' }}>{category}</h4>
                    <div className={styles.list}>
                        {categoryServices.map(service => (
                            <div key={service.id} className={styles.item}>
                                <div className={styles.info}>
                                    <span className={styles.name}>{service.title || service.name}</span>
                                    <div className={styles.details}>
                                        <span className={styles.duration}>
                                            <FaClock size={12} /> {service.duration} min
                                        </span>
                                        {service.description && (
                                            <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                                • {service.description.substring(0, 60)}{service.description.length > 60 ? '...' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.action}>
                                    <span className={styles.price}>R{service.price.toFixed(0)}</span>
                                    <button
                                        className={styles.bookButton}
                                        onClick={() => onBook(toBookableService(service))}
                                    >
                                        Book
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
