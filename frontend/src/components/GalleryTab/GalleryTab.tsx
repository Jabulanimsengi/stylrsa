'use client';

import React from 'react';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';
import styles from '../../app/dashboard/Dashboard.module.css';
import { GalleryImage } from '@/types';

interface GalleryTabProps {
    images: GalleryImage[];
    onAddImage: () => void;
    onDeleteImage: (id: string) => void;
}

export default function GalleryTab({ images, onAddImage, onDeleteImage }: GalleryTabProps) {
    return (
        <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Gallery</h3>
                <button onClick={onAddImage} className={styles.addButton}>Add Image</button>
            </div>

            <div className={styles.galleryGrid}>
                {images.length > 0 ? images.map((image) => (
                    <div key={image.id} className={styles.galleryItem}>
                        <Image
                            src={image.imageUrl}
                            alt={image.caption || 'Gallery'}
                            className={styles.galleryItemImage}
                            fill
                            sizes="(max-width: 768px) 33vw, 160px"
                        />
                        <button
                            onClick={() => onDeleteImage(image.id)}
                            className={styles.deleteButton}
                            aria-label="Delete image"
                        >
                            <FaTrash />
                        </button>
                    </div>
                )) : (
                    <div className={styles.emptyState}>
                        <h3 className={styles.emptyStateTitle}>Your Gallery is Empty</h3>
                        <p className={styles.emptyStateMessage}>
                            Upload photos to showcase your work and attract more customers.
                        </p>
                        <button onClick={onAddImage} className={styles.emptyStateAction}>
                            Upload Your First Image
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
