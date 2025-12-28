'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Button } from './button';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    showFirstLast?: boolean;
    className?: string;
}

function generatePages(
    currentPage: number,
    totalPages: number,
    siblingCount: number
): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const leftSibling = Math.max(2, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

    // Add left ellipsis
    if (leftSibling > 2) {
        pages.push('ellipsis');
    } else if (leftSibling === 2) {
        pages.push(2);
    }

    // Add pages around current
    for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== totalPages) {
            pages.push(i);
        }
    }

    // Add right ellipsis
    if (rightSibling < totalPages - 1) {
        pages.push('ellipsis');
    } else if (rightSibling === totalPages - 1) {
        pages.push(totalPages - 1);
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
        pages.push(totalPages);
    }

    return pages;
}

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    showFirstLast = true,
    className,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = generatePages(currentPage, totalPages, siblingCount);

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className={cn('flex items-center justify-center gap-1', className)}
        >
            {/* Previous button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
            >
                <FaChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {pages.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-muted-foreground"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                            className="min-w-[36px]"
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            {/* Next button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
            >
                <FaChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
}

export { Pagination };
