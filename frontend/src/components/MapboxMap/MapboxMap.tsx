'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './MapboxMap.module.css';

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoidHNha2FuaW1zZW5naSIsImEiOiJjbWo5eDBxOWswMTBwM2ZzOXRkNTNzNm5yIn0.sGUZfX9eJHmhoFIJFn_0kw';

interface MapboxMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: string | number;
    markerColor?: string;
    interactive?: boolean;
    showPopup?: boolean;
    popupContent?: string;
    style?: 'streets' | 'outdoors' | 'light' | 'dark' | 'satellite' | 'satellite-streets';
    className?: string;
}

const STYLE_URLS: Record<string, string> = {
    streets: 'mapbox://styles/tsakanimsengi/cmkp36ijo001l01s54l2cgg4e', // Custom Stylr SA style
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
};

export default function MapboxMap({
    latitude,
    longitude,
    zoom = 14,
    height = 250,
    markerColor = '#F51957', // Stylr SA brand color
    interactive = false,
    showPopup = false,
    popupContent,
    style = 'streets',
    className = '',
}: MapboxMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        // Validate coordinates
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            return;
        }

        // Initialize the map
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: STYLE_URLS[style],
            center: [longitude, latitude],
            zoom,
            interactive,
            attributionControl: true,
            logoPosition: 'bottom-left',
        });

        // Add navigation controls if interactive
        if (interactive) {
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = styles.customMarker;
        markerEl.style.backgroundColor = markerColor;

        // Add the marker
        const marker = new mapboxgl.Marker({
            element: markerEl,
            anchor: 'bottom',
        })
            .setLngLat([longitude, latitude])
            .addTo(map);

        // Add popup if enabled
        if (showPopup && popupContent) {
            const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                closeOnClick: false,
            }).setHTML(`<div class="${styles.popupContent}">${popupContent}</div>`);

            marker.setPopup(popup);

            // Show popup on hover
            markerEl.addEventListener('mouseenter', () => popup.addTo(map));
            markerEl.addEventListener('mouseleave', () => popup.remove());
        }

        mapRef.current = map;
        markerRef.current = marker;

        map.on('load', () => {
            setIsLoaded(true);
        });

        // Cleanup
        return () => {
            marker.remove();
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, [latitude, longitude, zoom, markerColor, interactive, showPopup, popupContent, style]);

    // Update marker position when coordinates change
    useEffect(() => {
        if (markerRef.current && latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
            markerRef.current.setLngLat([longitude, latitude]);
            if (mapRef.current) {
                mapRef.current.flyTo({ center: [longitude, latitude], zoom });
            }
        }
    }, [latitude, longitude, zoom]);

    const containerHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            ref={mapContainer}
            className={`${styles.mapContainer} ${className}`}
            style={{ height: containerHeight }}
            aria-label="Map showing location"
        />
    );
}
