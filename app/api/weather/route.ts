import { getSession } from "@/lib/auth/session";
import { getPreferredFarmWeatherLocation } from "@/lib/db/repository";
import { NextResponse } from "next/server";

type OpenMeteoLocation = {
  name?: string;
  admin1?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

function weatherLabel(code: number | undefined): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code !== undefined && code >= 51 && code <= 57) return "Drizzle";
  if (code !== undefined && code >= 61 && code <= 67) return "Rain";
  if (code !== undefined && code >= 71 && code <= 77) return "Snow";
  if (code !== undefined && code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code !== undefined && code >= 95) return "Thunderstorm";
  return "Weather conditions unavailable";
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const requestUrl = new URL(request.url);
    const latitudeParam = requestUrl.searchParams.get("latitude");
    const longitudeParam = requestUrl.searchParams.get("longitude");
    const usingDeviceLocation = latitudeParam !== null || longitudeParam !== null;
    let latitude: number | null;
    let longitude: number | null;
    let resolvedLocation: string;

    if (usingDeviceLocation) {
      latitude = latitudeParam === null ? NaN : Number(latitudeParam);
      longitude = longitudeParam === null ? NaN : Number(longitudeParam);
      resolvedLocation = "Current location";
    } else {
      const farmLocation = await getPreferredFarmWeatherLocation(session.id);
      if (!farmLocation) {
        return NextResponse.json(
          { error: "Add a farm and location, or use your device location, to see a forecast." },
          { status: 404 }
        );
      }

      latitude = farmLocation.latitude;
      longitude = farmLocation.longitude;
      resolvedLocation = farmLocation.location || farmLocation.farm_name;

      if (
        latitude === null ||
        longitude === null ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        if (!farmLocation.location.trim()) {
          return NextResponse.json(
            { error: "Add a location to your farm, or use your device location, to see a forecast." },
            { status: 400 }
          );
        }

        const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geocodingUrl.search = new URLSearchParams({
          name: farmLocation.location,
          count: "1",
          language: "en",
          format: "json",
        }).toString();
        const geocodingResponse = await fetch(geocodingUrl, { signal: AbortSignal.timeout(8000) });
        if (!geocodingResponse.ok) throw new Error("Weather location lookup failed.");
        const geocodingData = await geocodingResponse.json();
        const match = geocodingData.results?.[0] as OpenMeteoLocation | undefined;
        if (!match || typeof match.latitude !== "number" || typeof match.longitude !== "number") {
          return NextResponse.json(
            {
              error: `Could not find a weather location matching "${farmLocation.location}". Edit the farm location or use your device location.`,
            },
            { status: 404 }
          );
        }
        latitude = match.latitude;
        longitude = match.longitude;
        resolvedLocation = [match.name, match.admin1, match.country].filter(Boolean).join(", ");
      }
    }

    if (
      latitude === null ||
      longitude === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: usingDeviceLocation ? "Your device returned invalid location coordinates." : "The farm has invalid location coordinates." },
        { status: 400 }
      );
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.search = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      hourly: "precipitation_probability,soil_temperature_0cm",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      forecast_days: "4",
      timezone: "auto",
    }).toString();
    const forecastResponse = await fetch(forecastUrl, { signal: AbortSignal.timeout(8000) });
    if (!forecastResponse.ok) throw new Error("Weather provider request failed.");
    const data = await forecastResponse.json();
    const current = data.current;
    if (!current || typeof current.time !== "string") {
      throw new Error("Weather provider returned incomplete current conditions.");
    }

    const currentHourIndex = Array.isArray(data.hourly?.time)
      ? data.hourly.time.indexOf(current.time)
      : -1;
    const hourlyProbability = currentHourIndex >= 0
      ? asNumber(data.hourly.precipitation_probability?.[currentHourIndex])
      : null;
    const hourlySoilTemperature = currentHourIndex >= 0
      ? asNumber(data.hourly.soil_temperature_0cm?.[currentHourIndex])
      : null;
    const daily = Array.isArray(data.daily?.time)
      ? data.daily.time.map((date: string, index: number) => ({
          date,
          high: asNumber(data.daily.temperature_2m_max?.[index]),
          low: asNumber(data.daily.temperature_2m_min?.[index]),
          rainfall: asNumber(data.daily.precipitation_probability_max?.[index]),
          condition: weatherLabel(asNumber(data.daily.weather_code?.[index]) ?? undefined),
        }))
      : [];

    return NextResponse.json({
      location: resolvedLocation,
      observedAt: current.time,
      temp: asNumber(current.temperature_2m),
      humidity: asNumber(current.relative_humidity_2m),
      rainfall: hourlyProbability ?? daily[0]?.rainfall ?? null,
      wind: asNumber(current.wind_speed_10m),
      soilTemperature: hourlySoilTemperature,
      condition: weatherLabel(asNumber(current.weather_code) ?? undefined),
      forecast: daily,
    });
  } catch (error) {
    console.error("Dashboard weather request failed:", error);
    return NextResponse.json(
      { error: "Live weather is temporarily unavailable. Please try again shortly." },
      { status: 502 }
    );
  }
}
