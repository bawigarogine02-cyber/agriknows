import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/pool";

type Analysis = {
  id: string; ownerId: string; latitude: number; longitude: number; locationName?: string; imageReference: string;
  weather: Record<string, unknown>; recommendations: Recommendation[]; aiObservation?: string; hazards?: string[]; createdAt: string;
};
type Recommendation = {
  name: string;
  plantType?: string;
  soilSuitability?: string;
  score: number;
  confidence: string;
  explanation: string;
  factors: string[];
  risks: string[];
  considerations: string;
  resilience: string;
  guideSteps: string[];
  guideSource: string;
  evidenceNote: string;
  nextSteps: string[];
  referenceUrl: string;
  imageUrl: string;
};
const memory = globalThis as typeof globalThis & { plantingAnalyses?: Map<string, Analysis> };
memory.plantingAnalyses ??= new Map();
const pending = globalThis as typeof globalThis & { pendingPlantingAnalyses?: Map<string, Analysis> };
pending.pendingPlantingAnalyses ??= new Map();

const crops = [
  {
    name: "Bush Green Beans (Phaseolus vulgaris)",
    plantType: "Compact Bush Legume",
    min: 15,
    max: 28,
    rain: 70,
    sunlight: "Full to Partial sun",
    soilSuitability: "Thrives in loose, well-drained loamy to sandy-loam soil (pH 6.0–6.8). Self-supporting bush variety (40–50 cm) requiring no trellises or stakes. Fixes atmospheric nitrogen to enrich soil fertility for subsequent crops.",
    resilience: "Choose disease-resistant bush seeds (e.g., Provider or Contender). Ensure good field drainage to prevent root rot during heavy rainfall; avoid overhead watering.",
    reason: "Fast-maturing (45–60 days) compact bush bean ideal for open field plots and raised beds without requiring trellises or vertical staking."
  },
  {
    name: "Pole / Yardlong Beans (Sitaw - Vigna unguiculata)",
    plantType: "Climbing Vertical Legume",
    min: 18,
    max: 32,
    rain: 85,
    sunlight: "Full sun",
    soilSuitability: "Requires fertile, well-aerated loamy soil rich in organic matter. Needs vertical bamboo poles, trellises, or corn stalk supports. Deep taproot system efficiently extracts subsoil moisture.",
    resilience: "Install 6–8 ft bamboo trellises at planting time. Continuous pod production over 60–90 days; harvest tender pods every 2–3 days to stimulate new blooms.",
    reason: "Maximizes yield per square meter of land using vertical trellis structures. High heat tolerance suited for tropical warm field conditions."
  },
  {
    name: "Cowpeas & Black-Eyed Peas (Vigna unguiculata)",
    plantType: "Heat & Drought Tolerant Tropical Bean",
    min: 20,
    max: 35,
    rain: 60,
    sunlight: "Full sun",
    soilSuitability: "Adapts to poor, sandy, or clay soils where other crops struggle. Excellent green manure cover crop that enriches land with vital nitrogen.",
    resilience: "Exceptional tolerance for high heat and dry spells. Requires minimal irrigation once established. Protect young seedlings from bean fly.",
    reason: "The most heat and drought resilient bean species for warm, sandy, or low-water land conditions."
  },
  {
    name: "Mung Beans (Mungo - Vigna radiata)",
    plantType: "Fast-Maturing Short-Cycle Legume",
    min: 20,
    max: 34,
    rain: 65,
    sunlight: "Full sun",
    soilSuitability: "Requires loose, well-drained loamy soil. Low moisture requirement makes it perfect for dry-season crop rotation following rice or corn harvest.",
    resilience: "Ultra-fast harvest window in just 60 days. Sensitive to standing water, so plant on elevated field ridges or sloped ground.",
    reason: "Ultra-short 60-day crop cycle legume that rejuvenates soil nitrogen while thriving on minimal water."
  },
  {
    name: "Soybeans (Glycine max)",
    plantType: "Sturdy High-Protein Grain Legume",
    min: 18,
    max: 32,
    rain: 90,
    sunlight: "Full sun",
    soilSuitability: "Requires deep, fertile, well-drained clay-loam or silt-loam soil. High nitrogen-fixing capacity restores depleted soil nutrients.",
    resilience: "Needs steady soil moisture during flowering and pod filling; avoid waterlogged or poorly drained fields during seedling emergence.",
    reason: "High-value protein legume for fertile, moist field land with high nitrogen restoration benefits."
  },
  {
    name: "Tomato - Roma & Cherry (Solanum lycopersicum)",
    plantType: "Fruiting Solanaceous Nightshade",
    min: 18,
    max: 30,
    rain: 80,
    sunlight: "Full sun",
    soilSuitability: "Deep loamy soil with high organic compost content (pH 6.0–6.8). Requires raised beds for active root zone drainage.",
    resilience: "Use raised beds, organic mulch, and staking; keep leaves dry to protect against early blight and bacterial wilt.",
    reason: "Warm temperatures and direct sunlight foster abundant flowering and fruit set in well-drained, fertile soil."
  },
  {
    name: "Sweet Corn & Field Maize (Zea mays)",
    plantType: "Heavy-Feeder Cereal Grain Stalk",
    min: 16,
    max: 32,
    rain: 100,
    sunlight: "Full sun",
    soilSuitability: "Deep, fertile, nitrogen-rich loamy soil. Benefits greatly from crop rotation on land previously planted with nitrogen-fixing beans.",
    resilience: "Sturdy stalk crop; protect young plants from high winds and ensure adequate water during cob formation.",
    reason: "Resilient staple cereal thriving in full sun and nitrogen-rich field soil."
  }
];

function getCropPlantDetails(name: string) {
  const match = crops.find(c => c.name === name || name.toLowerCase().includes(c.name.split(" ")[0].toLowerCase()));
  return {
    plantType: match?.plantType ?? "Agricultural Crop",
    soilSuitability: match?.soilSuitability ?? "Requires well-drained soil with adequate sunlight and organic nutrients."
  };
}

function cropReference(name: string) {
  let wikiTerm = name.trim();
  let imgTerm = name.trim();

  if (name.includes("Bush Green Beans")) {
    wikiTerm = "Green_bean";
    imgTerm = "Phaseolus_vulgaris";
  } else if (name.includes("Pole") || name.includes("Sitaw") || name.includes("Yardlong")) {
    wikiTerm = "Yardlong_bean";
    imgTerm = "Yardlong_bean";
  } else if (name.includes("Cowpeas")) {
    wikiTerm = "Cowpea";
    imgTerm = "Cowpea";
  } else if (name.includes("Mung")) {
    wikiTerm = "Mung_bean";
    imgTerm = "Mung_bean";
  } else if (name.includes("Soybean")) {
    wikiTerm = "Soybean";
    imgTerm = "Soybeans";
  } else if (name.includes("Tomato")) {
    wikiTerm = "Tomato";
    imgTerm = "Tomato";
  } else if (name.includes("Corn") || name.includes("Maize")) {
    wikiTerm = "Maize";
    imgTerm = "Corn";
  } else if (name.includes("Bean")) {
    wikiTerm = "Bean";
    imgTerm = "Phaseolus_vulgaris";
  }

  return {
    referenceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTerm)}`,
    imageUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imgTerm)}.jpg?width=800`,
  };
}

function cropGuide(name: string) {
  const guides: Record<string, { steps: string[]; source: string }> = {
    "Bush Green Beans (Phaseolus vulgaris)": {
      steps: [
        "Sow seeds directly 1 inch deep in warm, well-drained soil once cold/frost risk has passed.",
        "Space rows 18-24 inches apart; no trellis or staking needed as plants are self-supporting compact bushes.",
        "Water consistently at the soil line to keep foliage dry and prevent fungal leaf spot.",
        "Harvest pods frequently when firm and snap-fresh to encourage continuous pod production."
      ],
      source: "https://extension.umn.edu/vegetables/growing-beans",
    },
    "Pole / Yardlong Beans (Sitaw - Vigna unguiculata)": {
      steps: [
        "Install 6-8 foot bamboo poles or wire trellises at planting time before vining begins.",
        "Plant seeds in fertile, organic-rich soil at the base of support poles.",
        "Gently train young climbing vines onto the trellis structure as they begin to stretch.",
        "Harvest long, tender pods every 2-3 days to keep plants actively flowering and bearing."
      ],
      source: "https://extension.umn.edu/vegetables/growing-beans",
    },
    "Cowpeas & Black-Eyed Peas (Vigna unguiculata)": {
      steps: [
        "Sow directly into warm soil (above 20°C); cowpeas thrive in light sandy or poorer soils.",
        "Water sparingly—overwatering reduces pod yield and causes excessive leafy vine growth.",
        "Harvest green pods early for fresh cooking, or allow pods to dry completely on the vine for dry beans.",
        "Incorporate remaining plant residue into the soil after harvest to enrich field nitrogen."
      ],
      source: "https://extension.uga.edu/publications/detail.html?number=C976",
    },
    "Mung Beans (Mungo - Vigna radiata)": {
      steps: [
        "Plant in well-drained, loose soil with full sun during dry or warm seasonal windows.",
        "Sow seeds 1-1.5 inches deep with 4-6 inch plant spacing in raised ridges.",
        "Keep soil moist until germination, then reduce watering as plants develop drought tolerance.",
        "Harvest mature pods when they turn dark brown or black within 60 days of planting."
      ],
      source: "https://extension.okstate.edu/fact-sheets/mungbean-production-guide.html",
    },
    "Soybeans (Glycine max)": {
      steps: [
        "Inoculate seeds with Rhizobium bacteria prior to planting to optimize nitrogen fixation.",
        "Sow in deep, moist loamy soil when soil temperatures reach 18-20°C.",
        "Control weeds early while seedlings establish strong erect stalks.",
        "Harvest green pods at 80% fullness for edamame, or allow full drying for soy grain."
      ],
      source: "https://extension.umn.edu/crop-production/soybean",
    },
    "Tomato - Roma & Cherry (Solanum lycopersicum)": {
      steps: [
        "Transplant healthy seedlings into sun-drenched raised beds enriched with compost.",
        "Install stakes or cages early to elevate branches and fruit off moist soil.",
        "Water at the root zone and mulch to maintain consistent soil moisture.",
        "Prune lower suckers for good airflow and monitor regularly for leaf spot or pests."
      ],
      source: "https://extension.umn.edu/vegetables/growing-tomatoes",
    },
    "Sweet Corn & Field Maize (Zea mays)": {
      steps: [
        "Plant in block grids (at least 4x4 rows) to ensure thorough wind pollination.",
        "Incorporate nitrogen-rich soil amendments or rotate into land previously planted with beans.",
        "Provide steady watering during critical tasseling and silk emergence stages.",
        "Harvest when ear silks turn dark brown and kernels release milky juice when punctured."
      ],
      source: "https://extension.umn.edu/agriculture/crop-production/corn",
    }
  };

  const defaultGuide = {
    steps: [
      "Select a locally adapted crop variety suited to your regional soil type and climate.",
      "Follow local planting depth, row spacing, and soil amendment recommendations.",
      "Maintain appropriate drainage, weed control, and irrigation based on weather forecasts.",
      "Inspect crops regularly and consult local agricultural extension services for guidance."
    ],
    source: "https://extension.umn.edu/agriculture/crop-production"
  };

  const key = Object.keys(guides).find(k => name.includes(k.split(" ")[0])) ?? name;
  const guide = guides[name] ?? guides[key] ?? defaultGuide;

  return {
    guideSteps: guide.steps,
    guideSource: guide.source,
    evidenceNote: "This is extension-reviewed agronomic guidance. Success depends on local seed variety, soil health, seasonal timing, water access, and pest management."
  };
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T | null | undefined) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function authorized() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return user;
}

async function reverseGeocode(latitude: number, longitude: number) {
  // Check if position matches the user's local farm region (Laray, Talisay City, Cebu)
  if (Math.abs(latitude - 10.2520) < 0.25 && Math.abs(longitude - 123.8396) < 0.25) {
    return "Laray, Talisay City, Cebu, Philippines";
  }

  // 2. Secondary: OpenStreetMap Nominatim zoom=18
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18`,
      {
        headers: { "User-Agent": "AgriKMS planting advisor (agrikms@field.org)" },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      }
    );
    if (response.ok) {
      const data = (await response.json()) as { address?: Record<string, string>; display_name?: string };
      const address = data.address ?? {};
      const parts = [
        address.suburb || address.neighbourhood || address.quarter || address.village || address.hamlet,
        address.city || address.town || address.municipality || address.city_district,
        address.county || address.state_district || address.state,
        address.country,
      ]
        .filter((val): val is string => typeof val === "string" && Boolean(val.trim()))
        .filter((value, index, values) => values.indexOf(value) === index);

      if (parts.length > 0) return parts.join(", ");
      return data.display_name?.split(",").slice(0, 3).join(",") || "Laray, Talisay City, Cebu, Philippines";
    }
  } catch {}

  return "Laray, Talisay City, Cebu, Philippines";
}

export async function GET(request: Request) {
  const user = await authorized();
  if (user instanceof NextResponse) return user;
  const searchParams = new URL(request.url).searchParams;
  const latitudeParam = searchParams.get("latitude");
  const longitudeParam = searchParams.get("longitude");
  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);
  if (latitudeParam !== null && longitudeParam !== null && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
    return NextResponse.json({ locationName: await reverseGeocode(latitude, longitude) });
  }
  const db = getDb();
  if (db) {
    const [rows] = await db.query("SELECT analyses.id, locations.latitude, locations.longitude, locations.name AS locationName, analyses.image_reference AS imageReference, analyses.ai_analysis AS aiAnalysis, analyses.missing_information AS missingInformation, analyses.created_at AS createdAt FROM analyses INNER JOIN locations ON locations.id = analyses.location_id AND locations.user_id = analyses.user_id WHERE analyses.user_id = ? ORDER BY analyses.created_at DESC", [user.id]);
    const analyses = await Promise.all((rows as Array<{ id: string; latitude: number; longitude: number; locationName: string | null; imageReference: string; aiAnalysis: unknown; missingInformation: unknown; createdAt: string }>).map(async (row) => {
      const [recommendationRows] = await db.query("SELECT crop_name AS name, score, confidence, explanation, risks, considerations, next_steps AS nextSteps FROM crop_recommendations WHERE analysis_id = ? ORDER BY score DESC", [row.id]);
      const [weatherRows] = await db.query("SELECT payload FROM weather_data WHERE analysis_id = ? ORDER BY recorded_at DESC LIMIT 1", [row.id]);
      const [soilRows] = await db.query("SELECT payload FROM soil_data WHERE analysis_id = ? LIMIT 1", [row.id]);
      const parsedAi = parseJson<{ observation?: string }>(row.aiAnalysis, {});
      const recommendations = (recommendationRows as Array<Record<string, unknown>>).map((recommendation) => {
        const nameStr = String(recommendation.name);
        const details = getCropPlantDetails(nameStr);
        return {
          ...recommendation,
          plantType: details.plantType,
          soilSuitability: details.soilSuitability,
          ...cropReference(nameStr),
          resilience: "Confirm a locally adapted variety and management plan for the detected weather risks.",
          ...cropGuide(nameStr),
          risks: parseJson<string[]>(recommendation.risks, []),
          considerations: parseJson<string[]>(recommendation.considerations, []),
          nextSteps: parseJson<string[]>(recommendation.nextSteps, []),
        };
      });
      return {
        ...row,
        weather: parseJson((weatherRows as Array<{ payload: unknown }>)[0]?.payload, {}),
        soil: parseJson((soilRows as Array<{ payload: unknown }>)[0]?.payload, { status: "unknown / not measured" }),
        missingInformation: parseJson(row.missingInformation, []),
        aiObservation: parsedAi.observation,
        recommendations,
      };
    }));
    return NextResponse.json({ analyses }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ analyses: [...memory.plantingAnalyses!.values()].filter((analysis) => analysis.ownerId === user.id).reverse() }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  const user = await authorized();
  if (user instanceof NextResponse) return user;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || id.length > 64) return NextResponse.json({ error: "A valid analysis id is required." }, { status: 400 });

  const db = getDb();
  if (db) {
    const [result] = await db.execute("DELETE FROM analyses WHERE id = ? AND user_id = ?", [id, user.id]);
    if ((result as { affectedRows: number }).affectedRows === 0) return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    memory.plantingAnalyses!.delete(id);
    return NextResponse.json({ deleted: true });
  }

  const analysis = memory.plantingAnalyses!.get(id);
  if (analysis?.ownerId !== user.id) return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  memory.plantingAnalyses!.delete(id);
  return NextResponse.json({ deleted: true });
}

export async function PUT(request: Request) {
  const user = await authorized();
  if (user instanceof NextResponse) return user;
  const body = await request.json() as { id?: string };
  const id = body.id;
  const analysis = id ? pending.pendingPlantingAnalyses!.get(id) : undefined;
  if (!analysis || analysis.ownerId !== user.id) return NextResponse.json({ error: "Pending analysis not found." }, { status: 404 });

  const db = getDb();
  if (db) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [location] = await connection.execute("INSERT INTO locations (user_id, latitude, longitude, name) VALUES (?, ?, ?, ?)", [user.id, analysis.latitude, analysis.longitude, analysis.locationName ?? null]);
      const locationId = (location as { insertId: number }).insertId;
      await connection.execute("INSERT INTO analyses (id, user_id, location_id, image_reference, ai_analysis, missing_information) VALUES (?, ?, ?, ?, ?, ?)", [analysis.id, user.id, locationId, analysis.imageReference, JSON.stringify({ model: process.env.GEMINI_API_KEY ? "gemini-3-flash-preview" : "deterministic-advisor", observation: analysis.aiObservation }), JSON.stringify(["Soil pH", "NPK", "soil composition", "exact soil moisture"]) ]);
      await connection.execute("INSERT INTO weather_data (analysis_id, payload) VALUES (?, ?)", [analysis.id, JSON.stringify(analysis.weather)]);
      await connection.execute("INSERT INTO soil_data (analysis_id, payload) VALUES (?, ?)", [analysis.id, JSON.stringify({ soilTemperature: analysis.weather.soilTemperature ?? null, soilMoisture: analysis.weather.soilMoisture ?? null, status: "sensor values unavailable; image is not a measurement" })]);
      for (const recommendation of analysis.recommendations) await connection.execute("INSERT INTO crop_recommendations (analysis_id, crop_name, score, confidence, explanation, risks, considerations, next_steps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [analysis.id, recommendation.name, recommendation.score, recommendation.confidence, recommendation.explanation, JSON.stringify(recommendation.risks), JSON.stringify([recommendation.considerations]), JSON.stringify(recommendation.nextSteps)]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("Could not save planting analysis", error);
      return NextResponse.json({ error: "Analysis could not be saved." }, { status: 500 });
    } finally { connection.release(); }
  }
  memory.plantingAnalyses!.set(analysis.id, analysis);
  pending.pendingPlantingAnalyses!.delete(analysis.id);
  return NextResponse.json({ analysis }, { status: 201 });
}

export async function POST(request: Request) {
  const user = await authorized();
  if (user instanceof NextResponse) return user;
  const form = await request.formData();
  const latitude = Number(form.get("latitude"));
  const longitude = Number(form.get("longitude"));
  const image = form.get("image");
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return NextResponse.json({ error: "A valid confirmed location is required." }, { status: 400 });
  if (!(image instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 5_000_000) return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image under 5 MB." }, { status: 400 });

  const submittedLocationName = String(form.get("locationName") ?? "").trim().slice(0, 255);
  const locationName = submittedLocationName || await reverseGeocode(latitude, longitude);
  const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,shortwave_radiation&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm,precipitation_probability&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&past_days=30&forecast_days=7&warnings=true&timezone=auto`, { next: { revalidate: 900 } });
  if (!weatherResponse.ok) return NextResponse.json({ error: "Environmental data could not be retrieved right now." }, { status: 502 });
  const weather = await weatherResponse.json();
  const current = weather.current ?? {};
  const daily = weather.daily ?? {};
  const recentTemperatures = (daily.temperature_2m_max ?? []).slice(0, 30).map(Number).filter(Number.isFinite);
  const recentRainfall = (daily.precipitation_sum ?? []).slice(0, 30).map(Number).filter(Number.isFinite);
  const recentWinds = (daily.wind_speed_10m_max ?? []).slice(0, 30).map(Number).filter(Number.isFinite);
  const maxRecentTemperature = recentTemperatures.length ? Math.max(...recentTemperatures) : null;
  const totalRecentRainfall = recentRainfall.length ? recentRainfall.reduce((sum: number, value: number) => sum + value, 0) : null;
  const maxRecentWind = recentWinds.length ? Math.max(...recentWinds) : null;
  const hazards: string[] = [];
  if (maxRecentTemperature !== null && maxRecentTemperature >= 35) hazards.push(`Heat stress: ${maxRecentTemperature.toFixed(1)}°C maximum in the recent period.`);
  if (recentRainfall.some((value: number) => value >= 50)) hazards.push("Heavy rainfall: at least one recent day exceeded 50 mm; drainage and fungal disease are concerns.");
  if (maxRecentWind !== null && maxRecentWind >= 50) hazards.push(`High wind: recent maximum reached ${maxRecentWind.toFixed(0)} km/h; protect young plants and staking.`);
  if (totalRecentRainfall !== null && totalRecentRainfall < 5) hazards.push("Dry spell: less than 5 mm of recent rainfall was recorded; irrigation access is important.");
  const warnings = Array.isArray(weather.warnings) ? weather.warnings.map((warning: { event?: string; headline?: string }) => warning.headline || warning.event).filter(Boolean).slice(0, 5) : [];
  hazards.push(...warnings.map((warning: string) => `Official weather warning: ${warning}`));
  let aiObservation = "Image interpretation is unavailable until GEMINI_API_KEY is configured. Scores remain based on structured crop requirements and measured environmental data.";
  if (process.env.GEMINI_API_KEY) {
    const imageData = Buffer.from(await image.arrayBuffer()).toString("base64");
    const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + encodeURIComponent(process.env.GEMINI_API_KEY), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: image.type, data: imageData } }, { text: "Describe visible land & agricultural features: vegetation, terrain, soil surface texture, drainage clues, shade, and plot setup (e.g. flat ground, raised beds, or trellis structure). Evaluate which specific bean cultivars (e.g. bush green beans vs climbing pole sitaw vs drought-tolerant cowpeas vs mung beans) or crop types are best suited to this visible land. Keep under 100 words." }] }] }) });
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      aiObservation = String(aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? aiObservation).slice(0, 1000);
    }
  }
  const db = getDb();
  let cropProfiles = crops;
  if (db) {
    const [cropRows] = await db.query("SELECT crops.name, crop_requirements.min_temperature AS min, crop_requirements.max_temperature AS max, crop_requirements.max_rainfall AS rain, crop_requirements.sunlight, crop_requirements.terrain FROM crops INNER JOIN crop_requirements ON crop_requirements.crop_id = crops.id");
    if ((cropRows as Array<Record<string, unknown>>).length > 0) {
      cropProfiles = (cropRows as Array<Record<string, unknown>>).map((crop) => {
        const details = getCropPlantDetails(String(crop.name));
        return {
          name: String(crop.name),
          plantType: details.plantType,
          soilSuitability: details.soilSuitability,
          min: Number(crop.min ?? 0),
          max: Number(crop.max ?? 40),
          rain: Number(crop.rain ?? 100),
          sunlight: String(crop.sunlight ?? "Unknown"),
          resilience: `Confirm a locally adapted variety for the detected hazard conditions before planting ${String(crop.name)}.`,
          ...cropGuide(String(crop.name)),
          reason: `${String(crop.sunlight ?? "Suitable sunlight")} and the stored temperature and rainfall requirements match this crop's knowledge profile.`,
        };
      });
    }
  }
  const temperature = Number(current.temperature_2m ?? 22);
  const rainfall = Number(current.precipitation ?? 0);
  const hazardPenalty = Math.min(20, hazards.length * 4);
  const recommendations = cropProfiles.map((crop) => {
    const temperatureFit = temperature >= crop.min && temperature <= crop.max ? 30 : 12;
    const rainFit = rainfall <= crop.rain ? 25 : 12;
    const score = Math.max(0, Math.min(97, temperatureFit + rainFit + 22 + 14 - hazardPenalty));
    const details = getCropPlantDetails(crop.name);
    return {
      name: crop.name,
      plantType: details.plantType,
      soilSuitability: details.soilSuitability,
      score,
      confidence: score > 78 && hazards.length < 2 ? "High" : "Moderate",
      explanation: crop.reason,
      factors: [
        `Temperature: ${temperatureFit > 20 ? "Suitable" : "Needs attention"}`,
        `Rainfall: ${rainFit > 20 ? "Suitable" : "Monitor drainage"}`,
        hazards.length ? `Location risks: ${hazards.length} detected` : "No recent weather hazard signal",
        "Solar radiation: Available from Open-Meteo"
      ],
      risks: [...(rainfall > crop.rain ? ["Excess rainfall may increase fungal leaf disease pressure."] : []), ...hazards, "Soil pH and nutrient levels require lab test confirmation."],
      considerations: details.soilSuitability,
      resilience: crop.resilience,
      ...cropGuide(crop.name),
      nextSteps: [
        "Perform a soil pH and NPK nutrient test for this field location",
        "Verify local seed variety adaptation and planting calendar",
        "Walk the land after heavy rain to verify surface drainage"
      ],
      ...cropReference(crop.name)
    };
  }).sort((a, b) => b.score - a.score);
  const id = randomUUID();
  const analysis: Analysis = { id, ownerId: user.id, latitude, longitude, locationName, imageReference: `${user.id}:${id}:uploaded-image`, weather: { temperature: current.temperature_2m ?? null, humidity: current.relative_humidity_2m ?? null, precipitation: current.precipitation ?? null, wind: current.wind_speed_10m ?? null, solarRadiation: current.shortwave_radiation ?? null, soilTemperature: weather.hourly?.soil_temperature_0cm?.[0] ?? null, soilMoisture: weather.hourly?.soil_moisture_0_to_1cm?.[0] ?? null, recentRainfall30d: totalRecentRainfall, recentMaxTemperature: maxRecentTemperature, recentMaxWind: maxRecentWind, forecastDays: 7, hazards }, recommendations, aiObservation, hazards, createdAt: new Date().toISOString() };
  pending.pendingPlantingAnalyses!.set(id, analysis);
  return NextResponse.json({ analysis }, { status: 201 });
}
