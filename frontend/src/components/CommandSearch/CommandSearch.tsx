'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    Kbd,
} from '@/components/ui';
import { FaSearch, FaCut, FaStore, FaChartLine, FaMapMarkerAlt } from 'react-icons/fa';
import { getSalonUrl } from '@/utils/salonUrl';

interface SearchResult {
    id: string;
    type: 'salon' | 'service' | 'trend' | 'location';
    title: string;
    subtitle?: string;
    url: string;
}

type SalonSearchMatch = {
    id: string;
    name: string;
    city?: string | null;
    province?: string | null;
    slug?: string | null;
};

type ServiceSearchMatch = {
    id: string;
    title?: string | null;
    name?: string | null;
    salon?: {
        id?: string;
        name?: string | null;
        slug?: string | null;
        city?: string | null;
        province?: string | null;
    } | null;
};

const QUICK_LINKS = [
    { title: 'Salon Map', url: '/salons?map=1', icon: FaStore },
    { title: 'Browse Services', url: '/services', icon: FaCut },
    { title: 'View Trends', url: '/trends', icon: FaChartLine },
    { title: 'Near Me', url: '/salons/near-me', icon: FaMapMarkerAlt },
];

export function CommandSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Handle keyboard shortcut (Ctrl+K / Cmd+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Search API
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            // Search salons
            const salonRes = await fetch(`/api/salons?search=${encodeURIComponent(searchQuery)}&limit=3`);
            const salonData = salonRes.ok ? await salonRes.json() : [];

            // Search services
            const serviceRes = await fetch(`/api/services?search=${encodeURIComponent(searchQuery)}&limit=3`);
            const serviceData = serviceRes.ok ? await serviceRes.json() : [];

            // Combine results
            const searchResults: SearchResult[] = [
                ...salonData.slice(0, 3).map((s: SalonSearchMatch) => ({
                    id: s.id,
                    type: 'salon' as const,
                    title: s.name,
                    subtitle: [s.city, s.province].filter(Boolean).join(', '),
                    url: getSalonUrl(s),
                })),
                ...serviceData.slice(0, 3).map((s: ServiceSearchMatch) => {
                    const serviceSalon = s.salon;
                    return {
                        id: s.id,
                        type: 'service' as const,
                        title: s.title || s.name,
                        subtitle: serviceSalon?.name,
                        url: serviceSalon?.id
                            ? getSalonUrl({ id: serviceSalon.id, slug: serviceSalon.slug })
                            : '/services',
                    };
                }),
            ];

            setResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleSelect = (url: string) => {
        setOpen(false);
        setQuery('');
        router.push(url);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'salon': return <FaStore className="mr-2 h-4 w-4" />;
            case 'service': return <FaCut className="mr-2 h-4 w-4" />;
            case 'trend': return <FaChartLine className="mr-2 h-4 w-4" />;
            default: return <FaSearch className="mr-2 h-4 w-4" />;
        }
    };

    return (
        <>
            {/* Search trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-md border transition-colors"
                aria-label="Search (Ctrl+K)"
            >
                <FaSearch className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search...</span>
                <Kbd className="hidden md:flex ml-2">⌘K</Kbd>
            </button>

            {/* Command dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search salons and services..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    {isLoading && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Searching...
                        </div>
                    )}

                    {!isLoading && query && results.length === 0 && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}

                    {/* Search results */}
                    {results.length > 0 && (
                        <CommandGroup heading="Results">
                            {results.map((result) => (
                                <CommandItem
                                    key={`${result.type}-${result.id}`}
                                    value={result.title}
                                    onSelect={() => handleSelect(result.url)}
                                    data-testid={`command-result-${result.type}-${result.id}`}
                                    data-url={result.url}
                                >
                                    {getTypeIcon(result.type)}
                                    <div className="flex flex-col">
                                        <span>{result.title}</span>
                                        {result.subtitle && (
                                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Quick links */}
                    {!query && (
                        <CommandGroup heading="Quick Links">
                            {QUICK_LINKS.map((link) => (
                                <CommandItem
                                    key={link.url}
                                    value={link.title}
                                    onSelect={() => handleSelect(link.url)}
                                >
                                    <link.icon className="mr-2 h-4 w-4" />
                                    <span>{link.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}

export default CommandSearch;
