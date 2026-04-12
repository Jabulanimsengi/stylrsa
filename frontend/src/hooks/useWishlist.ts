/**
 * useWishlist Hook
 * 
 * Manages product wishlist using localStorage for persistence.
 * Works without authentication - items are stored locally in the browser.
 * 
 * Usage:
 * ```ts
 * const { wishlist, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist } = useWishlist();
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
    addedAt: number; // timestamp
}

const WISHLIST_KEY = 'stylrsa-product-wishlist';

type WishlistProductInput = {
    id: string;
    name: string;
    price: number;
    images?: string[];
};

export function useWishlist() {
    const [wishlistItems, setWishlistItems] = useLocalStorage<WishlistItem[]>(WISHLIST_KEY, []);

    // Check if a product is in the wishlist
    const isInWishlist = useCallback(
        (productId: string): boolean => {
            return wishlistItems.some(item => item.id === productId);
        },
        [wishlistItems]
    );

    // Add a product to the wishlist
    const addToWishlist = useCallback(
        (product: WishlistProductInput | WishlistItem) => {
            if (isInWishlist(product.id)) return;

            const newItem: WishlistItem = {
                id: product.id,
                name: 'name' in product ? product.name : '',
                price: product.price,
                image: 'images' in product && Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : ('image' in product ? product.image : ''),
                addedAt: Date.now(),
            };

            setWishlistItems(prev => [...prev, newItem]);
        },
        [isInWishlist, setWishlistItems]
    );

    // Remove a product from the wishlist
    const removeFromWishlist = useCallback(
        (productId: string) => {
            setWishlistItems(prev => prev.filter(item => item.id !== productId));
        },
        [setWishlistItems]
    );

    // Toggle a product in the wishlist
    const toggleWishlist = useCallback(
        (product: WishlistProductInput | WishlistItem): boolean => {
            if (isInWishlist(product.id)) {
                removeFromWishlist(product.id);
                return false;
            } else {
                addToWishlist(product);
                return true;
            }
        },
        [isInWishlist, addToWishlist, removeFromWishlist]
    );

    // Clear the entire wishlist
    const clearWishlist = useCallback(() => {
        setWishlistItems([]);
    }, [setWishlistItems]);

    // Get wishlist count
    const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

    return {
        wishlist: wishlistItems,
        wishlistCount,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
    };
}

export default useWishlist;
