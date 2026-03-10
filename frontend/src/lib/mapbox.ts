// Mapbox configuration and utilities
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Mapbox Geocoding API endpoints
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface MapboxFeature {
    id: string;
    type: 'Feature';
    place_type: string[];
    relevance: number;
    properties: {
        accuracy?: string;
        address?: string;
        category?: string;
        maki?: string;
        wikidata?: string;
        short_code?: string;
    };
    text: string;
    place_name: string;
    center: [number, number]; // [longitude, latitude]
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
    context?: Array<{
        id: string;
        text: string;
        short_code?: string;
        wikidata?: string;
    }>;
}

export interface MapboxGeocodingResponse {
    type: 'FeatureCollection';
    query: string[];
    features: MapboxFeature[];
    attribution: string;
}

export interface GeocodingResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        suburb?: string;
        city?: string;
        town?: string;
        state?: string;
        country?: string;
        postcode?: string;
    };
}

/**
 * Forward geocoding - convert address text to coordinates
 * @param query Search text (address, place name, etc.)
 * @param options Optional parameters
 * @returns Array of geocoding results
 */
export async function forwardGeocode(
    query: string,
    options: {
        country?: string;
        limit?: number;
        types?: string[];
    } = {}
): Promise<GeocodingResult[]> {
    const { country = 'za', limit = 5, types } = options;

    const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        country,
        limit: limit.toString(),
        language: 'en',
    });

    if (types && types.length > 0) {
        params.set('types', types.join(','));
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `${MAPBOX_GEOCODING_URL}/${encodedQuery}.json?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Mapbox geocoding failed: ${response.status}`);
        }

        const data: MapboxGeocodingResponse = await response.json();

        return data.features.map(feature => {
            // Extract address components from context
            const context = feature.context || [];
            const getContextValue = (prefix: string) =>
                context.find(c => c.id.startsWith(prefix))?.text;

            return {
                place_id: feature.id,
                display_name: feature.place_name,
                lat: feature.center[1].toString(),
                lon: feature.center[0].toString(),
                address: {
                    suburb: feature.text,
                    city: getContextValue('place') || getContextValue('locality'),
                    town: getContextValue('place') || getContextValue('locality'),
                    state: getContextValue('region'),
                    country: getContextValue('country'),
                    postcode: getContextValue('postcode'),
                },
            };
        });
    } catch (error) {
        console.error('Mapbox forward geocoding error:', error);
        return [];
    }
}

export interface ReverseGeocodingResult {
    city?: string;
    province?: string;
    country?: string;
    formattedAddress?: string;
    neighborhood?: string;
    postcode?: string;
}

/**
 * Reverse geocoding - convert coordinates to address
 * @param longitude Longitude coordinate
 * @param latitude Latitude coordinate
 * @returns Address information
 */
export async function reverseGeocode(
    longitude: number,
    latitude: number
): Promise<ReverseGeocodingResult | null> {
    const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        language: 'en',
        types: 'address,place,locality,neighborhood,region,country',
    });

    const url = `${MAPBOX_GEOCODING_URL}/${longitude},${latitude}.json?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Mapbox reverse geocoding failed: ${response.status}`);
        }

        const data: MapboxGeocodingResponse = await response.json();

        if (data.features.length === 0) {
            return null;
        }

        // Get the most specific feature (usually address or place)
        const mainFeature = data.features[0];
        const context = mainFeature.context || [];

        const getContextValue = (prefix: string) =>
            context.find(c => c.id.startsWith(prefix))?.text;

        // Also check other features for fallback values
        const placeFeature = data.features.find(f => f.place_type.includes('place'));
        const regionFeature = data.features.find(f => f.place_type.includes('region'));
        const neighborhoodFeature = data.features.find(f => f.place_type.includes('neighborhood'));

        return {
            city: getContextValue('place') ||
                getContextValue('locality') ||
                placeFeature?.text,
            province: getContextValue('region') ||
                regionFeature?.text,
            country: getContextValue('country'),
            formattedAddress: mainFeature.place_name,
            neighborhood: getContextValue('neighborhood') ||
                neighborhoodFeature?.text ||
                (mainFeature.place_type.includes('neighborhood') ? mainFeature.text : undefined),
            postcode: getContextValue('postcode'),
        };
    } catch (error) {
        console.error('Mapbox reverse geocoding error:', error);
        return null;
    }
}
