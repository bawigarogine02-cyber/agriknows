"use client";

import { useEffect, useState } from "react";
import { getAccurateUserLocation } from "@/lib/utils/geolocation";
import {
  Calendar,
  Cloud,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";

type LiveWeather = {
  locationName: string;
  latitude: number;
  longitude: number;
  temp: number | null;
  humidity: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  solarRadiation: number | null;
  soilTemperature: number | null;
  weatherCode: number;
  condition: string;
  forecast: Array<{
    date: string;
    dayName: string;
    maxTemp: number;
    minTemp: number;
    rainSum: number;
    maxWind: number;
  }>;
};

export default function WeatherPage() {
  const defaultLat = 10.2520;
  const defaultLon = 123.8396;
  const defaultName = "Laray, Talisay City, Cebu, Philippines";

  const [weather, setWeather] = useState<LiveWeather>({
    locationName: defaultName,
    latitude: defaultLat,
    longitude: defaultLon,
    temp: 28,
    humidity: 74,
    precipitation: 0,
    windSpeed: 12,
    solarRadiation: 420,
    soilTemperature: 26.5,
    weatherCode: 2,
    condition: "Partly Cloudy",
    forecast: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = (lat: number, lon: number, name = defaultName) => {
    setLoading(true);
    setError("");

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,shortwave_radiation,weather_code&hourly=soil_temperature_0cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch weather data");
        return res.json();
      })
      .then((data) => {
        const current = data.current ?? {};
        const daily = data.daily ?? {};
        const code = current.weather_code ?? 0;
        let cond = "Partly Cloudy";
        if (code === 0) cond = "Clear Sky";
        else if (code <= 3) cond = "Partly Cloudy";
        else if (code <= 65) cond = "Rain Showers";
        else cond = "Overcast";

        const dates: string[] = daily.time ?? [];
        const forecastList = dates.slice(0, 7).map((dStr, idx) => {
          const dateObj = new Date(dStr);
          const dayName = idx === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
          return {
            date: dStr,
            dayName,
            maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 30),
            minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 23),
            rainSum: Number((daily.precipitation_sum?.[idx] ?? 0).toFixed(1)),
            maxWind: Math.round(daily.wind_speed_10m_max?.[idx] ?? 14),
          };
        });

        setWeather({
          locationName: name,
          latitude: lat,
          longitude: lon,
          temp: Math.round(current.temperature_2m ?? 28),
          humidity: Math.round(current.relative_humidity_2m ?? 74),
          precipitation: Number((current.precipitation ?? 0).toFixed(1)),
          windSpeed: Math.round(current.wind_speed_10m ?? 12),
          solarRadiation: Math.round(current.shortwave_radiation ?? 400),
          soilTemperature: Number((data.hourly?.soil_temperature_0cm?.[0] ?? 26.5).toFixed(1)),
          weatherCode: code,
          condition: cond,
          forecast: forecastList,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getAccurateUserLocation().then((loc) => {
      fetchWeather(loc.latitude, loc.longitude, loc.locationName);
    });
  }, []);

  const detectLocation = () => {
    setLoading(true);
    setError("");
    getAccurateUserLocation().then((loc) => {
      fetchWeather(loc.latitude, loc.longitude, loc.locationName);
    });
  };

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Weather Header Card */}
      <header className="relative overflow-hidden rounded-2xl bg-[#277e96] p-7 text-white shadow-md sm:p-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,#75c0d2,transparent_38%),linear-gradient(135deg,#267c95,#84bc87)] opacity-90" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[2px] text-white/75 uppercase">Live Meteorological Data</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Farm Weather Dashboard</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin size={16} /> {weather.locationName} ({weather.latitude.toFixed(4)}, {weather.longitude.toFixed(4)})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={detectLocation}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 disabled:opacity-50"
            >
              <Compass size={15} /> Detect My Location
            </button>
            <button
              type="button"
              onClick={() => fetchWeather(weather.latitude, weather.longitude, weather.locationName)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 p-2.5 text-white backdrop-blur-md hover:bg-white/30 disabled:opacity-50"
              aria-label="Refresh weather"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            {weather.condition.includes("Clear") ? (
              <Sun size={56} className="text-amber-300" strokeWidth={1.5} />
            ) : weather.condition.includes("Rain") ? (
              <CloudRain size={56} strokeWidth={1.5} />
            ) : (
              <CloudSun size={56} strokeWidth={1.5} />
            )}
            <div>
              <strong className="text-5xl font-extrabold">{loading ? "--" : `${weather.temp}°C`}</strong>
              <p className="mt-1 text-sm font-semibold text-white/90">{weather.condition}</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Current Environmental Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#288b69]">
              <Droplets size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Relative Humidity</p>
              <strong className="block text-2xl font-bold text-[#123d35]">{weather.humidity ?? "--"}%</strong>
              <small className="text-[10px] text-slate-400">Optimum for field transpiration</small>
            </div>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f1f4] text-[#287184]">
              <CloudRain size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Current Rainfall</p>
              <strong className="block text-2xl font-bold text-[#123d35]">{weather.precipitation ?? 0} mm</strong>
              <small className="text-[10px] text-slate-400">Open-Meteo precipitation signal</small>
            </div>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dd] text-[#bd8a20]">
              <Wind size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Wind Speed</p>
              <strong className="block text-2xl font-bold text-[#123d35]">{weather.windSpeed ?? "--"} km/h</strong>
              <small className="text-[10px] text-slate-400">Surface 10m wind signal</small>
            </div>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0edff] text-[#6857c9]">
              <Thermometer size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Topsoil Temp</p>
              <strong className="block text-2xl font-bold text-[#123d35]">{weather.soilTemperature ?? "--"}°C</strong>
              <small className="text-[10px] text-slate-400">0cm root zone signal</small>
            </div>
          </div>
        </article>
      </div>

      {/* 7-Day Forecast Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#123d35]">
            <Calendar size={18} className="text-[#17875f]" /> 7-Day Agronomic Forecast
          </h2>
          <span className="text-xs font-semibold text-slate-500">Updated every 15 minutes</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#16875f]">
            <LoaderCircle className="animate-spin mr-2" size={20} /> Loading 7-day forecast...
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {weather.forecast.map((f) => (
              <div
                key={f.date}
                className="flex flex-col items-center justify-between rounded-xl border border-slate-100 bg-[#fafcf9] p-4 text-center transition hover:border-[#16875f]/40 hover:shadow-sm"
              >
                <p className="text-xs font-bold text-[#123d35]">{f.dayName}</p>
                <p className="mt-1 text-[11px] text-slate-400">{f.date.slice(5)}</p>

                <div className="my-3">
                  {f.rainSum > 10 ? (
                    <CloudRain size={28} className="text-blue-500" />
                  ) : f.maxTemp > 32 ? (
                    <Sun size={28} className="text-amber-500" />
                  ) : (
                    <CloudSun size={28} className="text-teal-600" />
                  )}
                </div>

                <div className="text-xs font-bold text-[#123d35]">
                  {f.maxTemp}° <span className="font-normal text-slate-400">/ {f.minTemp}°</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                  <CloudRain size={12} className="text-blue-400" /> {f.rainSum} mm
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agronomic Advisory Note */}
      <div className="rounded-2xl border border-[#d6e5d3] bg-[#f2f7f0] p-5 text-xs leading-relaxed text-[#2d4d2b]">
        <strong>🌾 Agronomic Advisory:</strong> Weather predictions are pulled directly from Open-Meteo high-resolution models. Use forecasted rainfall and surface temperatures to schedule planting, irrigation, fertilizer application, and crop protection.
      </div>
    </section>
  );
}