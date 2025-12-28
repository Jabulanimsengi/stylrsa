'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist, type WishlistItem } from '@/hooks/useWishlist';
import styles from './MyWishlistPage.module.css';
import PageNav from '@/components/PageNav';
import { FaHeart, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPlaceholder } from '@/lib/placeholders';

export default function MyWishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch - localStorage is only available on client
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRemove = (item: WishlistItem) => {
        removeFromWishlist(item.id);
        toast.success(`${item.name} removed from wishlist`);
    };

    const handleClearAll = () => {
        if (wishlist.length === 0) return;
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            clearWishlist();
            toast.success('Wishlist cleared');
        }
    };

    if (!mounted) {
        return (
            <div className={styles.container}>
                <PageNav />
                <h1 className={styles.title}>My Wishlist</h1>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <PageNav />

            <div className={styles.header}>
                <h1 className={styles.title}>
                    <FaHeart className={styles.titleIcon} />
                    My Wishlist
                </h1>
                {wishlist.length > 0 && (
                    <button onClick={handleClearAll} className={styles.clearButton}>
                        <FaTrash />
                        Clear All
                    </button>
                )}
            </div>

            {wishlist.length === 0 ? (
                <div className={styles.emptyState}>
                    <FaHeart className={styles.emptyIcon} />
                    <h2>Your wishlist is empty</h2>
                    <p>Browse products and click the heart icon to save items you love.</p>
                    <Link href="/products" className={styles.browseButton}>
                        <FaShoppingBag />
                        Browse Products
                    </Link>
                </div>
            ) : (
                <>
                    <p className={styles.itemCount}>
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                    </p>
                    <div className={styles.grid}>
                        {wishlist.map((item) => (
                            <div key={item.id} className={styles.card}>
                                <Link href={`/products/${item.id}`} className={styles.cardLink}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={item.image || getPlaceholder('wide')}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className={styles.cardImage}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemove(item);
                                            }}
                                            className={styles.removeButton}
                                            aria-label="Remove from wishlist"
                                        >
                                            <FaHeart />
                                        </button>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{item.name}</h3>
                                        <p className={styles.cardPrice}>R{item.price.toFixed(2)}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
