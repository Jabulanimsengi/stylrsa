'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaHeart, FaEye } from 'react-icons/fa';
import { Trend } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { toast } from 'react-toastify';
import { Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface TrendCardProps {
  trend: Trend;
  onLike?: (trendId: string, isLiked: boolean) => void;
}

export default function TrendCard({ trend, onLike }: TrendCardProps) {
  const [isLiked, setIsLiked] = useState(trend.isLiked || false);
  const [likeCount, setLikeCount] = useState(trend.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const { showPageLoader } = useNavigationLoading();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to like trends');
      openModal('login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousState = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const endpoint = isLiked
        ? `/api/trends/${trend.id}/unlike`
        : `/api/trends/${trend.id}/like`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }

      onLike?.(trend.id, !isLiked);
    } catch {
      // Revert on error
      setIsLiked(previousState);
      setLikeCount(previousCount);
      toast.error('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const primaryImage = trend.images[0];
  const categoryLabel = trend.category.replace(/_/g, ' ');

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    showPageLoader();
    router.push(`/trends/${trend.id}`);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
      onClick={handleCardClick}
    >
      {/* Image Wrapper */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={transformCloudinary(primaryImage, {
            width: 600,
            quality: 'auto',
            format: 'auto',
            crop: 'fill',
          })}
          alt={trend.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Category badge - top left */}
        <Badge className="absolute top-3 left-3 capitalize">
          {categoryLabel}
        </Badge>

        {/* Like button - top right */}
        <button
          onClick={handleLike}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full transition-all duration-200',
            'bg-white/90 hover:bg-white shadow-sm',
            isLiked && 'text-red-500'
          )}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          disabled={isLiking}
        >
          <FaHeart className="w-4 h-4" />
        </button>
      </div>

      {/* Card content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{trend.title}</h3>
        {trend.styleName && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{trend.styleName}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FaEye className="w-3 h-3" /> {trend.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FaHeart className="w-3 h-3" /> {likeCount.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
