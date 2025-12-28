import { NextResponse } from 'next/server';

// Server-side geocoding proxy to hide Mapbox token from client
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get('query');

        if (!query || query.length < 3) {
            return NextResponse.json({ features: [] });
        }

        const accessToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        if (!accessToken) {
            console.error('Mapbox access token not configured');
            return NextResponse.json({ features: [] }, { status: 500 });
        }

        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
            `access_token=${accessToken}&country=za&types=address,place&limit=5`,
            { cache: 'no-store' }
        );

        if (!response.ok) {
            console.error('Mapbox API error:', response.status);
            return NextResponse.json({ features: [] });
        }

        const data = await response.json();

        // Return simplified result structure
        return NextResponse.json({
            features: data.features.map((feature: any) => ({
                id: feature.id,
                place_name: feature.place_name,
                center: feature.center, // [longitude, latitude]
                text: feature.text,
                context: feature.context,
            })),
        });
    } catch (error) {
        console.error('Geocoding proxy error:', error);
        return NextResponse.json({ features: [] }, { status: 500 });
    }
}
