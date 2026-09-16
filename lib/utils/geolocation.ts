export type GeolocationResult = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName: string;
};

// Default fallback position (Laray, Talisay City, Cebu, Philippines)
const DEFAULT_LOCATION: GeolocationResult = {
  latitude: 10.2520,
  longitude: 123.8396,
  accuracy: 10,
  locationName: "Laray, Talisay City, Cebu, Philippines",
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
 * Formats coordinates into clean location string
 */
export function formatLocationName(lat: number, lon: number): string {
  // Check if position matches the user's local farm region (Laray, Talisay City, Cebu)
  if (Math.abs(lat - 10.2520) < 0.25 && Math.abs(lon - 123.8396) < 0.25) {
    return "Laray, Talisay City, Cebu, Philippines";
  }

  const latCard = lat >= 0 ? "N" : "S";
  const lonCard = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latCard}, ${Math.abs(lon).toFixed(4)}° ${lonCard}`;
}

/**
 * HTML5 Geolocation API: get accurate current hardware location
 */
export async function getAccurateUserLocation(): Promise<GeolocationResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return DEFAULT_LOCATION;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, GPS_OPTIONS);
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const locationName = formatLocationName(latitude, longitude);

    return {
      latitude,
      longitude,
      accuracy,
      locationName,
    };
  } catch (err) {
    console.warn("HTML5 Geolocation hardware position fallback", err);
    return DEFAULT_LOCATION;
  }
}

/**
 * HTML5 Geolocation API: watch continuous live hardware positions
 */
export function watchUserLocation(
  onSuccess: (result: GeolocationResult) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null {
  if (typeof window === "undefined" || !navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      const locationName = formatLocationName(latitude, longitude);

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
