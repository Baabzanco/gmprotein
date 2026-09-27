import { LandingSectionPublicDTO } from "../types";

class LandingApiClient {
  private baseUrl = "/api/v1/landing";

  /**
   * Fetches all published, active landing sections in order from the database.
   * Returns empty array if none found or on network error (activating safe fallback).
   */
  async getLandingSections(): Promise<LandingSectionPublicDTO[]> {
    try {
      const res = await fetch(`${this.baseUrl}/sections`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.warn(`[LandingApi] Failed to fetch sections: HTTP ${res.status}`);
        return [];
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }

      return [];
    } catch (err) {
      console.warn("[LandingApi] Network error fetching landing sections:", err);
      return [];
    }
  }

  /**
   * Fetches a single published section by its unique key.
   */
  async getLandingSectionByKey(key: string): Promise<LandingSectionPublicDTO | null> {
    try {
      const res = await fetch(`${this.baseUrl}/sections/${encodeURIComponent(key)}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }

      return null;
    } catch (err) {
      console.warn(`[LandingApi] Network error fetching section by key '${key}':`, err);
      return null;
    }
  }
}

export const landingApiClient = new LandingApiClient();
export const getLandingSections = () => landingApiClient.getLandingSections();
export const getLandingSectionByKey = (key: string) => landingApiClient.getLandingSectionByKey(key);
