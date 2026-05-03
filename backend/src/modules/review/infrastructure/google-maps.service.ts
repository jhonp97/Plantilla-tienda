import { env } from '@config/env';

export interface GooglePlaceReview {
  authorName: string;
  rating: number;
  text: string;
  reviewDate: Date;
}

export class GoogleMapsPlacesService {
  /**
   * Fetch reviews from Google Places API (Place Details).
   * Only returns reviews with rating >= 4 stars.
   */
  async fetchPlaceReviews(placeId: string): Promise<GooglePlaceReview[]> {
    const apiKey = env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('[GoogleMaps] GOOGLE_MAPS_API_KEY not configured');
      return [];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&reviews_no_translations=true&key=${apiKey}`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) {
        console.error(`[GoogleMaps] API returned ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json() as {
        result?: {
          reviews?: Array<{
            author_name: string;
            rating: number;
            text: string;
            time: number;
          }>;
        };
        status: string;
        error_message?: string;
      };

      if (data.status !== 'OK') {
        console.error(`[GoogleMaps] API error: ${data.status} - ${data.error_message ?? 'Unknown error'}`);
        return [];
      }

      const reviews = data.result?.reviews ?? [];

      // Filter only reviews with rating > 4 (i.e., 5 stars only)
      return reviews
        .filter((r) => r.rating > 4)
        .map((r) => ({
          authorName: r.author_name,
          rating: r.rating,
          text: r.text,
          reviewDate: new Date(r.time * 1000),
        }));
    } catch (error) {
      console.error('[GoogleMaps] Failed to fetch reviews:', error);
      return []; // Graceful degradation
    }
  }
}
