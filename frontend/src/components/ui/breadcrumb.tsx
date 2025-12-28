import * as React from 'react';
import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    showHome?: boolean;
    separator?: React.ReactNode;
    className?: string;
}

function Breadcrumb({
    items,
    showHome = true,
    separator = <FaChevronRight className="h-3 w-3" />,
    className,
}: BreadcrumbProps) {
    const allItems = showHome ? [{ label: 'Home', href: '/' }, ...items] : items;

    return (
        <nav aria-label="Breadcrumb" className={cn('flex', className)}>
            <ol className="flex items-center gap-2 text-sm">
                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1;
                    const isHome = index === 0 && showHome;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            {index > 0 && (
                                <span className="text-muted-foreground">{separator}</span>
                            )}
                            {isLast ? (
                                <span
                                    className="font-medium text-foreground"
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            ) : item.href ? (
                                <Link
                                    href={item.href}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {isHome ? (
                                        <span className="flex items-center gap-1">
                                            <FaHome className="h-4 w-4" />
                                            <span className="sr-only sm:not-sr-only">{item.label}</span>
                                        </span>
                                    ) : (
                                        item.label
                                    )}
                                </Link>
                            ) : (
                                <span className="text-muted-foreground">{item.label}</span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export { Breadcrumb };
export type { BreadcrumbItem };
