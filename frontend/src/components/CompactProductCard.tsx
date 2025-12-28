'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { getPlaceholder } from '@/lib/placeholders';
import { Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CompactProductCardProps {
    product: Product;
}

export default function CompactProductCard({ product }: CompactProductCardProps) {
    // Get the first image, or placeholder
    const mainImage = useMemo(() => {
        const images = Array.isArray(product.images)
            ? product.images.filter((img) => img)
            : [];
        return images.length > 0 ? images[0] : getPlaceholder('wide');
    }, [product.images]);

    // Check if product is on sale
    const isOnSale = product.isOnSale && product.salePrice && product.salePrice < product.price;
    const displayPrice = isOnSale ? product.salePrice! : product.price;
    const discountPercent = isOnSale
        ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
        : 0;

    // Check if product is new (within 7 days)
    const isNew = useMemo(() => {
        const createdAt = new Date(product.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
    }, [product.createdAt]);

    // Truncate description for compact view
    const truncatedDescription = useMemo(() => {
        if (!product.description) return '';
        const maxLength = 60;
        if (product.description.length <= maxLength) return product.description;
        return product.description.substring(0, maxLength).trim() + '...';
    }, [product.description]);

    return (
        <Link href={`/products/${product.slug || product.id}`} className="block group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isOnSale && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                                -{discountPercent}%
                            </Badge>
                        )}
                        {isNew && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                NEW
                            </Badge>
                        )}
                    </div>

                    {/* Stock indicator */}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">Sold Out</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <CardContent className="p-3">
                    {/* Product Name */}
                    <h3 className="font-semibold text-foreground line-clamp-1 text-sm mb-1">
                        {product.name}
                    </h3>

                    {/* Description */}
                    {truncatedDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {truncatedDescription}
                        </p>
                    )}

                    {/* Price Section */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">R{displayPrice.toFixed(2)}</span>
                        {isOnSale && (
                            <span className="text-xs text-muted-foreground line-through">
                                R{product.price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    {product.stock > 0 && product.stock <= 5 && (
                        <span className="text-xs text-orange-500 mt-1 block">
                            Only {product.stock} left
                        </span>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
