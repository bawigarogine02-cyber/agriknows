export type GeolocationResult = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName: string;
};

/**
 * HTML5 Geolocation Hardware Options
 */
export const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true, // Force hardware GPS usage
  timeout: 10000,           // 10 second hardware timeout
  maximumAge: 0,            // No cached location
};

/**
 * Reverse geocodes coordinates to a clean human-readable location name
 */
export async function reverseGeocodeToLocationName(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18`,
      {
        headers: { "User-Agent": "AgriKMS location advisor (agrikms@field.org)" },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.village || addr.hamlet || addr.road;
      const city = addr.city || addr.town || addr.municipality || addr.city_district;
      const province = addr.county || addr.state_district || addr.state;
      const country = addr.country;

      const parts = [locality, city, province, country]
        .filter((val): val is string => typeof val === "string" && Boolean(val.trim()))
        .filter((val, idx, self) => self.indexOf(val) === idx);

      if (parts.length >= 2) return parts.join(", ");
      if (data.display_name) return data.display_name.split(",").slice(0, 3).join(", ");
    }
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
  }

  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

export function formatLocationName(lat: number, lon: number): string {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

/**
 * HTML5 Geolocation API: get accurate current hardware location and human readable name
 */
export async function getAccurateUserLocation(): Promise<GeolocationResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Location services are unavailable in this browser.");
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, GPS_OPTIONS);
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const locationName = await reverseGeocodeToLocationName(latitude, longitude);

    return {
      latitude,
      longitude,
      accuracy,
      locationName,
    };
  } catch (err) {
    console.warn("Unable to get the browser's current location:", err);
    throw new Error("Unable to get your current location. Check location permissions and try again.");
  }
}

/**
 * HTML5 Geolocation API: watch continuous live hardware positions and location names
 */
export function watchUserLocation(
  onSuccess: (result: GeolocationResult) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null {
  if (typeof window === "undefined" || !navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      const locationName = await reverseGeocodeToLocationName(latitude, longitude);

      onSuccess({
        latitude,
        longitude,
        accuracy,
        locationName,
      });
    },
    (error) => {
      console.error(`HTML5 GPS Error (${error.code}): ${error.message}`);
      if (onError) onError(error);
    },
    GPS_OPTIONS
  );
}

/**
 * HTML5 Geolocation API: stop watching location
 */
export function stopWatchingUserLocation(watchId: number | null) {
  if (typeof window !== "undefined" && navigator.geolocation && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}
