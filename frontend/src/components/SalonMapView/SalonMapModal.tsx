'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaMapMarkerAlt, FaExternalLinkAlt, FaSearch, FaLocationArrow } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './SalonMapView.module.css';
import Link from 'next/link';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

// Set Mapbox access token (same token as lib/mapbox.ts)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoidHNha2FuaW1zZW5naSIsImEiOiJjbWo5eDBxOWswMTBwM2ZzOXRkNTNzNm5yIn0.sGUZfX9eJHmhoFIJFn_0kw';
mapboxgl.accessToken = MAPBOX_TOKEN;

interface Salon {
    id: string;
    name: string;
    slug?: string;
    latitude?: number | null;
    longitude?: number | null;
    operatingHours?: any;
    address?: string;
    city?: string;
    town?: string;
    province?: string;
    __dist?: number;
    services?: Array<{
        id: string;
        title: string;
        price?: number;
        category?: { name: string };
    }>;
}

interface SalonMapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Helper to check if salon is currently open
function isOpenNow(operatingHours: any): { isOpen: boolean; hours: string } {
    if (!operatingHours) return { isOpen: false, hours: 'Hours not set' };

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    let daySchedule: any = null;

    if (Array.isArray(operatingHours)) {
        daySchedule = operatingHours.find(
            (d: any) => d.day?.toLowerCase() === dayOfWeek
        );
    } else if (typeof operatingHours === 'object') {
        daySchedule = operatingHours[dayOfWeek];
    }

    if (!daySchedule || daySchedule.closed) {
        return { isOpen: false, hours: 'Closed today' };
    }

    const openParts = daySchedule.open?.split(':') || daySchedule.openTime?.split(':');
    const closeParts = daySchedule.close?.split(':') || daySchedule.closeTime?.split(':');

    if (!openParts || !closeParts) {
        return { isOpen: false, hours: 'Hours not set' };
    }

    const openTime = parseInt(openParts[0]) * 60 + parseInt(openParts[1] || 0);
    const closeTime = parseInt(closeParts[0]) * 60 + parseInt(closeParts[1] || 0);

    const isCurrentlyOpen = currentTime >= openTime && currentTime < closeTime;
    const hoursStr = `${daySchedule.open || daySchedule.openTime} - ${daySchedule.close || daySchedule.closeTime}`;

    return { isOpen: isCurrentlyOpen, hours: hoursStr };
}

// Format distance
function formatDistance(distanceKm: number | undefined): string {
    if (distanceKm === undefined || distanceKm === Infinity) return '';
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
    return `${distanceKm.toFixed(1)}km`;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

interface GeocodeSuggestion {
    id: string;
    place_name: string;
    center: [number, number]; // [lon, lat]
}

export default function SalonMapModal({ isOpen, onClose }: SalonMapModalProps) {
    const [allSalons, setAllSalons] = useState<Salon[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationLabel, setLocationLabel] = useState<string>('');
    const [locationError, setLocationError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const popupRef = useRef<mapboxgl.Popup | null>(null);

    // Salons with coordinates for map markers
    const salonsWithCoords = allSalons.filter(
        (s) => s.latitude != null && s.longitude != null
    );

    // Salons without coordinates need to be shown in a list
    const salonsWithoutCoords = allSalons.filter(
        (s) => s.latitude == null || s.longitude == null
    );

    // Get user location via GPS
    const requestGPSLocation = useCallback(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                    setLocationLabel('Your current location');
                    setLocationError(null);
                    setSearchQuery('');
                    setSuggestions([]);
                },
                (error) => {
                    console.warn('Geolocation error:', error.message);
                    setLocationError('Could not get your location. Try searching instead.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        } else {
            setLocationError('Geolocation not supported. Try searching instead.');
        }
    }, []);

    // Don't auto-request GPS - let users click the GPS button to grant permission
    // This respects user privacy and only asks once when they explicitly click

    // Geocode search query
    const searchLocation = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                `access_token=${MAPBOX_TOKEN}&country=ZA&limit=5&types=place,locality,neighborhood,address`
            );
            const data = await response.json();
            setSuggestions(data.features || []);
        } catch (error) {
            console.error('Geocoding error:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle search input with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchLocation(query);
        }, 300);
    };

    // Handle suggestion selection
    const handleSelectLocation = (suggestion: GeocodeSuggestion) => {
        const [lon, lat] = suggestion.center;
        setUserLocation({ lat, lon });
        setLocationLabel(suggestion.place_name);
        setSearchQuery('');
        setSuggestions([]);
        setLocationError(null);
    };

    // Fetch salons
    const fetchSalons = useCallback(async () => {
        setLoading(true);
        try {
            let url = '/api/salons/approved';
            const params = new URLSearchParams();

            if (userLocation) {
                params.set('lat', userLocation.lat.toString());
                params.set('lon', userLocation.lon.toString());
                params.set('sortBy', 'distance');
            }

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch salons');

            const data = await res.json();
            setAllSalons(data || []);
        } catch (error) {
            console.error('Error fetching salons:', error);
            setAllSalons([]);
        } finally {
            setLoading(false);
        }
    }, [userLocation]);

    useEffect(() => {
        if (isOpen) {
            fetchSalons();
        }
    }, [isOpen, fetchSalons]);

    // Initialize map - always show the map even with no markers
    useEffect(() => {
        if (!isOpen || !mapContainerRef.current || mapRef.current || loading) return;

        // Default center: South Africa
        const defaultCenter: [number, number] = [28.0339, -26.2041]; // Johannesburg

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/tsakanimsengi/cmkp36ijo001l01s54l2cgg4e', // Custom Stylr SA style
            center: userLocation ? [userLocation.lon, userLocation.lat] : defaultCenter,
            zoom: userLocation ? 10 : 5,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add user location marker
        if (userLocation) {
            const userMarkerEl = document.createElement('div');
            userMarkerEl.className = styles.userMarker;
            new mapboxgl.Marker({ element: userMarkerEl })
                .setLngLat([userLocation.lon, userLocation.lat])
                .addTo(map);
        }

        mapRef.current = map;

        // Add salon markers once map is loaded
        map.on('load', () => {
            if (salonsWithCoords.length === 0) return;

            const bounds = new mapboxgl.LngLatBounds();

            if (userLocation) {
                bounds.extend([userLocation.lon, userLocation.lat]);
            }

            salonsWithCoords.forEach((salon) => {
                if (salon.latitude == null || salon.longitude == null) return;

                const markerEl = document.createElement('div');
                markerEl.className = styles.salonMarker;

                const marker = new mapboxgl.Marker({ element: markerEl })
                    .setLngLat([salon.longitude, salon.latitude])
                    .addTo(map);

                bounds.extend([salon.longitude, salon.latitude]);

                // Function to show popup (used by both click and hover)
                const showPopup = () => {
                    if (popupRef.current) {
                        popupRef.current.remove();
                    }

                    const { isOpen: salonIsOpen, hours } = isOpenNow(salon.operatingHours);
                    // Calculate distance client-side for real-time updates
                    const distanceKm = userLocation && salon.latitude && salon.longitude
                        ? calculateDistance(userLocation.lat, userLocation.lon, salon.latitude, salon.longitude)
                        : undefined;
                    const distanceStr = formatDistance(distanceKm);
                    const salonUrl = `/salons/${salon.slug || salon.id}`;

                    // Get unique service categories
                    const serviceCategories = salon.services
                        ? [...new Set(salon.services.map(s => s.category?.name).filter(Boolean))]
                        : [];
                    const servicesHtml = serviceCategories.length > 0
                        ? `<div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.75rem;">
                            ${serviceCategories.slice(0, 4).map(cat =>
                            `<span style="font-size: 0.65rem; padding: 0.2rem 0.5rem; background: #f3f4f6; color: #374151; border-radius: 12px; white-space: nowrap;">${cat}</span>`
                        ).join('')}
                            ${serviceCategories.length > 4 ? `<span style="font-size: 0.65rem; padding: 0.2rem 0.5rem; background: #f3f4f6; color: #374151; border-radius: 12px;">+${serviceCategories.length - 4}</span>` : ''}
                           </div>`
                        : '';

                    const popupContent = `
                        <div style="padding: 0.875rem; min-width: 220px; max-width: 280px;">
                            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1a1a1a; line-height: 1.3;">${salon.name}</h4>
                                ${distanceStr ? `<span style="font-size: 0.75rem; font-weight: 600; color: #F51957; white-space: nowrap; background: rgba(245, 25, 87, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">${distanceStr}</span>` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.375rem; font-size: 0.8rem;">
                                <span style="color: ${salonIsOpen ? '#16a34a' : '#dc2626'}; font-weight: 600;">
                                    ${salonIsOpen ? '● Open' : '● Closed'}
                                </span>
                                <span style="color: #666;">${hours}</span>
                            </div>
                            <div style="font-size: 0.8rem; color: #666; margin-bottom: 0.5rem;">
                                ${salon.city || ''}${salon.city && salon.province ? ', ' : ''}${salon.province || ''}
                            </div>
                            ${servicesHtml}
                            <a href="${salonUrl}" style="display: flex; align-items: center; justify-content: center; gap: 0.375rem; width: 100%; padding: 0.625rem; background: #F51957; color: white; border: 2px solid #F51957; border-radius: 8px; font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='white'; this.style.color='#F51957';" onmouseout="this.style.background='#F51957'; this.style.color='white';">
                                <span style="font-size: 1rem; font-weight: 700;">+</span>
                                <span>Book</span>
                            </a>
                        </div>
                    `;

                    const popup = new mapboxgl.Popup({
                        offset: 25,
                        closeButton: true, // Show close button for mobile
                        closeOnClick: false,
                        maxWidth: '280px',
                    })
                        .setLngLat([salon.longitude!, salon.latitude!])
                        .setHTML(popupContent)
                        .addTo(map);

                    popupRef.current = popup;
                };

                // Click handler for mobile (touch) support
                markerEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showPopup();
                });

                // Hover handler for desktop
                markerEl.addEventListener('mouseenter', showPopup);

                // Close popup on mouse leave (desktop only - with small delay for UX)
                markerEl.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        // Only close if mouse is not over the popup
                        const popupEl = document.querySelector('.mapboxgl-popup');
                        if (popupEl && !popupEl.matches(':hover')) {
                            if (popupRef.current) {
                                popupRef.current.remove();
                                popupRef.current = null;
                            }
                        }
                    }, 300);
                });

                markersRef.current.push(marker);
            });

            // Fit bounds if we have markers
            if (salonsWithCoords.length > 0) {
                map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
            }
        });

        return () => {
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
            }
            map.remove();
            mapRef.current = null;
        };
    }, [isOpen, salonsWithCoords, userLocation, loading]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <FaMapMarkerAlt /> Find Salons Near You
                    </h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close map">
                        <FaTimes />
                    </button>
                </div>

                {/* Location Search Section */}
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <FaSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '0.85rem' }} />
                                <input
                                    type="text"
                                    placeholder="Search for a location..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                    }}
                                />
                                {isSearching && (
                                    <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                                        <LoadingSpinner size="sm" inline />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={requestGPSLocation}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.625rem 0.75rem',
                                    background: '#F51957',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                                title="Use my current location"
                            >
                                <FaLocationArrow />
                                <span style={{ display: 'none' }}>GPS</span>
                            </button>
                        </div>

                        {/* Suggestions dropdown */}
                        {suggestions.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                marginTop: '0.25rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                maxHeight: '200px',
                                overflowY: 'auto',
                            }}>
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSelectLocation(suggestion)}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '0.625rem 0.75rem',
                                            textAlign: 'left',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            borderBottom: '1px solid #f0f0f0',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FaMapMarkerAlt style={{ color: '#F51957', marginRight: '0.5rem', fontSize: '0.75rem' }} />
                                        {suggestion.place_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Current location label or prompt */}
                    {userLocation && locationLabel ? (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#16a34a' }}>
                            <FaLocationArrow style={{ fontSize: '0.65rem' }} />
                            <span>{locationLabel}</span>
                        </div>
                    ) : !locationError && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
                            Search for your location or click <FaLocationArrow style={{ color: '#F51957', margin: '0 2px' }} /> to use GPS for distance info
                        </div>
                    )}
                </div>

                {locationError && !userLocation && (
                    <div className={styles.locationWarning}>
                        <FaMapMarkerAlt /> {locationError}
                    </div>
                )}

                <div className={styles.mapWrapper}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <LoadingSpinner size="md" inline text="Loading salons..." />
                        </div>
                    ) : (
                        <div ref={mapContainerRef} className={styles.mapContainer} />
                    )}
                </div>

                {/* List of salons without map coordinates */}
                {!loading && salonsWithoutCoords.length > 0 && (
                    <div className={styles.salonListSection}>
                        <h3 className={styles.salonListTitle}>
                            Salons not on map ({salonsWithoutCoords.length})
                        </h3>
                        <div className={styles.salonList}>
                            {salonsWithoutCoords.map((salon) => {
                                const { isOpen: salonIsOpen } = isOpenNow(salon.operatingHours);
                                return (
                                    <Link
                                        key={salon.id}
                                        href={`/salons/${salon.slug || salon.id}`}
                                        className={styles.salonListItem}
                                    >
                                        <div className={styles.salonListInfo}>
                                            <span className={styles.salonListName}>{salon.name}</span>
                                            <span className={styles.salonListLocation}>
                                                {salon.city || salon.town || salon.province || 'Location not set'}
                                            </span>
                                        </div>
                                        <div className={styles.salonListStatus}>
                                            <span className={salonIsOpen ? styles.statusOpen : styles.statusClosed}>
                                                {salonIsOpen ? 'Open' : 'Closed'}
                                            </span>
                                            <FaExternalLinkAlt className={styles.salonListArrow} />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className={styles.modalFooter}>
                    <span className={styles.salonCount}>
                        {allSalons.length} salon{allSalons.length !== 1 ? 's' : ''} total
                        {salonsWithCoords.length > 0 && ` • ${salonsWithCoords.length} on map`}
                    </span>
                </div>
            </div>
        </div>
    );

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
