import { getSession } from "@/lib/auth/session";
import {
  getArticles,
  getCrops,
  getPestsDiseases,
  getCropAdvisorAnalyses,
  getPublications,
  saveCropAdvisorAnalysis,
  deleteCropAdvisorAnalysis,
  type Crop,
  type PestDisease,
  type ConfidenceAssessment,
  type EnvironmentalSnapshot,
  type ExternalWebSource,
  type ImageObservations,
  type InternalResearchRef,
  type LessSuitablePlant,
  type MissingInformationGuide,
  type PlantRecommendation,
} from "@/lib/db/repository";
import { reverseGeocodeToLocationName } from "@/lib/utils/geolocation";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const analyses = await getCropAdvisorAnalyses(session.id);
    return NextResponse.json({ analyses });
  } catch (err) {
    console.error("Error fetching crop advisor analyses:", err);
    return NextResponse.json({ error: "Failed to load analysis history." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Analysis ID is required." }, { status: 400 });
    }
    if (!(await deleteCropAdvisorAnalysis(session.id, id))) {
      return NextResponse.json({ error: "Analysis record not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Analysis removed from history." });
  } catch (err) {
    console.error("Error deleting analysis:", err);
    return NextResponse.json({ error: "Failed to delete analysis record." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const latitudeRaw = formData.get("latitude") as string | null;
    const longitudeRaw = formData.get("longitude") as string | null;
    let locationName = (formData.get("locationName") as string | null) || "";

    if (!file) {
      return NextResponse.json({ error: "Please upload an image of your land or soil." }, { status: 400 });
    }

    const validMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Unsupported image format. Please upload JPG, JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    // Read image buffer and convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type.toLowerCase();

    // Determine location metrics
    const latitudeValue = latitudeRaw ? Number(latitudeRaw) : NaN;
    const longitudeValue = longitudeRaw ? Number(longitudeRaw) : NaN;
    const latitude = Number.isFinite(latitudeValue) ? latitudeValue : undefined;
    const longitude = Number.isFinite(longitudeValue) ? longitudeValue : undefined;

    if (!locationName.trim() && latitude !== undefined && longitude !== undefined) {
      try {
        locationName = await reverseGeocodeToLocationName(latitude, longitude);
      } catch (error) {
        console.warn("Unable to resolve analysis location name:", error);
      }
    }

    let environmentalData: EnvironmentalSnapshot = {
      locationName,
      latitude,
      longitude,
    };

    if (latitude !== undefined && longitude !== undefined) {
      try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&hourly=soil_temperature_0cm&timezone=auto`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (weatherRes.ok) {
        const wData = await weatherRes.json();
        environmentalData = {
          locationName,
          latitude,
          longitude,
          currentTempC: typeof wData.current?.temperature_2m === "number"
            ? wData.current.temperature_2m
            : undefined,
          soilTempC: typeof wData.hourly?.soil_temperature_0cm?.[0] === "number"
            ? wData.hourly.soil_temperature_0cm[0]
            : undefined,
          rainfallMm: typeof wData.current?.precipitation === "number"
            ? wData.current.precipitation
            : undefined,
        };
      }
      } catch (err) {
        console.warn("Open-Meteo weather fetch failed:", err);
      }
    }

    // 2. Perform AI Vision Model Image Analysis
    const imageObservations: ImageObservations = await analyzeLandImageWithAI(base64Image, mimeType);

    // 3. Query Researchers' Database
    const internalResearch = await queryResearcherDatabase();

    // 4. Perform Web Research
    const webResearch: ExternalWebSource[] = [];

    // 5. Calculate Comparison & Suitability Scores for Potential Crops
    const cropsDb = await getCrops();
    const pestsDb = await getPestsDiseases();
    const { recommendations, lessSuitable } = calculatePlantSuitability(
      imageObservations,
      internalResearch,
      webResearch,
      environmentalData,
      cropsDb,
      pestsDb
    );

    // 6. Formulate Confidence Rating & Missing Information Guide
    const confidenceScore = assessConfidenceLevel(imageObservations, internalResearch, webResearch);
    const missingInformation = generateMissingInformationGuide(imageObservations);

    // 7. Save Analysis to Database/Repository
    const savedAnalysis = await saveCropAdvisorAnalysis(session.id, {
      image_name: file.name,
      location_name: locationName,
      latitude,
      longitude,
      image_observations: imageObservations,
      internal_research: internalResearch,
      web_research: webResearch,
      environmental_data: environmentalData,
      recommendations,
      less_suitable: lessSuitable,
      confidence_score: confidenceScore,
      missing_information: missingInformation,
    });

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error("Crop Advisor processing error:", error);
    return NextResponse.json({ error: "Failed to process land/soil analysis." }, { status: 500 });
  }
}
 
/**
 * AI Vision Analysis Helper.
 */
async function analyzeLandImageWithAI(
  base64Data: string,
  mimeType: string
): Promise<ImageObservations> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) throw new Error("Image analysis is unavailable because GEMINI_API_KEY is not configured.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert agronomic visual analyst. Analyze this uploaded image of land/soil.
Extract useful visual observations relevant to plant and crop suitability.
Do NOT claim that an image can determine laboratory-level soil properties (like exact pH or N-P-K) with certainty.

Respond ONLY with JSON using this structure:
{
  "visuallyObserved": ["array of clearly visible physical characteristics"],
  "estimatedProperties": ["array of plausible estimated soil/land traits"],
  "requiresLabTesting": ["array of exact chemical/biological properties requiring laboratory testing"],
  "soilColor": "e.g. Dark Brown / Reddish Loam / Light Clay",
  "soilTexture": "e.g. Friable Loamy Texture with moderate organic aggregates",
  "moistureLevel": "e.g. Adequate surface moisture / Dry surface topsoil",
  "terrainType": "e.g. Gently sloping arable land / Flat flood plain",
  "vegetationNotes": "e.g. Sparse native grass cover, healthy green foliage nearby"
}`,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    }
  );
  if (!response.ok) throw new Error(`Image analysis service returned HTTP ${response.status}.`);
  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof textResponse !== "string") throw new Error("Image analysis service returned no analysis.");
  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Image analysis service returned an invalid result.");
  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  const stringArray = (value: unknown) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const optionalString = (value: unknown) => typeof value === "string" && value.trim() ? value : undefined;
  return {
    visuallyObserved: stringArray(parsed.visuallyObserved),
    estimatedProperties: stringArray(parsed.estimatedProperties),
    requiresLabTesting: stringArray(parsed.requiresLabTesting),
    soilColor: optionalString(parsed.soilColor),
    soilTexture: optionalString(parsed.soilTexture),
    moistureLevel: optionalString(parsed.moistureLevel),
    terrainType: optionalString(parsed.terrainType),
    vegetationNotes: optionalString(parsed.vegetationNotes),
    rawAnalysisText: textResponse,
  };
}

/**
 * Queries internal researcher database publications, articles, and crop studies.
 */
async function queryResearcherDatabase(): Promise<InternalResearchRef[]> {
  const publications = await getPublications();
  const articles = await getArticles();

  const internalRefs: InternalResearchRef[] = [];

  // Match research publications
  for (const pub of publications) {
    internalRefs.push({
      title: pub.title,
      author: pub.researcher_name,
      categoryOrCrop: pub.crop_type,
      summary: pub.abstract,
      relevanceReason: `Research publication stored in the database; crop: ${pub.crop_type}, soil: ${pub.soil_type}.`,
      url: `/knowledge-base`,
    });
  }

  // Match knowledge articles
  for (const art of articles) {
    internalRefs.push({
      title: art.title,
      author: art.author_name || "Author not recorded",
      categoryOrCrop: art.category,
      summary: art.summary,
      relevanceReason: `Knowledge-base article stored in the ${art.category} category.`,
      url: `/knowledge-base`,
    });
  }

  return internalRefs;
}

/**
 * Suitability scoring engine evaluating database crops against gathered evidence.
 */
function calculatePlantSuitability(
  observations: ImageObservations,
  internalResearch: InternalResearchRef[],
  webResearch: ExternalWebSource[],
  env: EnvironmentalSnapshot,
  cropsDb: Crop[],
  pestsDb: PestDisease[]
) {
  const candidateCrops = cropsDb.map((crop) => ({
    id: crop.id,
    name: crop.name,
    cropId: crop.id,
    category: crop.category || crop.type || "",
    idealPhMin: crop.ideal_ph_min,
    idealPhMax: crop.ideal_ph_max,
    waterReq: crop.water_requirement,
    growthDays: crop.growth_days,
    climate: crop.climate,
    companionCrops: crop.companion_crops,
    soilReq: crop.soil || "",
    minTemperature: crop.minimum_temperature,
    maxTemperature: crop.maximum_temperature,
    terrain: crop.terrain || "",
  }));
  const recommendations: PlantRecommendation[] = [];
  const lessSuitable: LessSuitablePlant[] = [];

  for (const crop of candidateCrops) {
    const soilDescription = crop.soilReq.toLowerCase();
    const observedSoil = observations.soilTexture?.toLowerCase() || "";
    const soilScore = soilDescription && observedSoil
      ? (soilDescription.includes(observedSoil) || observedSoil.includes(soilDescription) ? 85 : 55)
      : 50;
    const currentTemp = env.currentTempC;
    const tempScore = currentTemp !== undefined && crop.minTemperature !== null && crop.minTemperature !== undefined
      && crop.maxTemperature !== null && crop.maxTemperature !== undefined
      ? (currentTemp >= crop.minTemperature && currentTemp <= crop.maxTemperature ? 90 : 45)
      : 50;
    const observedTerrain = observations.terrainType?.toLowerCase() || "";
    const terrainScore = crop.terrain && observedTerrain
      ? (crop.terrain.toLowerCase().includes(observedTerrain) || observedTerrain.includes(crop.terrain.toLowerCase()) ? 85 : 50)
      : 50;
    const matchingResearch = internalResearch.filter((reference) =>
      `${reference.title} ${reference.categoryOrCrop}`.toLowerCase().includes(crop.name.toLowerCase())
    );
    const matchingPests = pestsDb.filter((pest) => pest.crop_id === crop.cropId);
    const researchScore = matchingResearch.length ? 80 : 30;
    const moistureScore = observations.moistureLevel ? 65 : 50;

    const totalEstimated = Math.round(
      soilScore * 0.3 + moistureScore * 0.2 + tempScore * 0.2 + terrainScore * 0.15 + researchScore * 0.15
    );

    if (totalEstimated >= 78) {
      recommendations.push({
        plantName: crop.name,
        cropCategory: crop.category,
        estimatedSuitability: totalEstimated,
        suitabilityRating: totalEstimated >= 88 ? "Highly Suitable" : "Moderately Suitable",
        reasons: [
          `Database soil requirement match: ${soilScore}%.`,
          `Temperature requirement match using available measurements: ${tempScore}%.`,
          `Matching database research records: ${matchingResearch.length}.`,
        ],
        supportingObservations: [
          ...[observations.soilTexture, observations.terrainType, observations.moistureLevel].filter(
            (value): value is string => Boolean(value)
          ),
        ],
        matchingFactors: [
          `Soil Texture Compatibility: ${soilScore}%`,
          `Moisture Index Match: ${moistureScore}%`,
          `Temperature Range Alignment: ${tempScore}%`,
        ],
        potentialProblems: matchingPests.map((pest) => `${pest.name}: ${pest.symptoms}`),
        requiredImprovements: matchingPests.map((pest) => pest.prevention),
        waterRequirement: crop.waterReq,
        temperatureRequirement: crop.minTemperature !== null && crop.minTemperature !== undefined
          && crop.maxTemperature !== null && crop.maxTemperature !== undefined
          ? `${crop.minTemperature}°C - ${crop.maxTemperature}°C`
          : crop.climate,
        soilRequirement: crop.soilReq,
        idealPhRange: `${crop.idealPhMin} - ${crop.idealPhMax}`,
        growthDays: crop.growthDays,
        companionCrops: crop.companionCrops,
        researcherNotes: matchingResearch.map((reference) => `${reference.title} — ${reference.author}: ${reference.summary}`),
        scoreBreakdown: {
          soilCompatibility: soilScore,
          moistureCompatibility: moistureScore,
          temperatureCompatibility: tempScore,
          terrainCompatibility: terrainScore,
          researchEvidence: researchScore,
        },
      });
    } else {
      lessSuitable.push({
        plantName: crop.name,
        estimatedSuitability: totalEstimated,
        suitabilityRating: "Marginally Suitable",
        bottleneckFactors: [
          `Available soil observations: ${soilScore}% match`,
          `Available temperature observations: ${tempScore}% match`,
        ],
        explanation: `The available observations produced a database-requirement match of ${totalEstimated}%.`,
        requiredRemediation: [],
      });
    }
  }

  // Sort recommendations descending by score
  recommendations.sort((a, b) => b.estimatedSuitability - a.estimatedSuitability);

  return { recommendations, lessSuitable };
}

/**
 * Assesses evidence confidence level.
 */
function assessConfidenceLevel(
  obs: ImageObservations,
  internalRes: InternalResearchRef[],
  webRes: ExternalWebSource[]
): ConfidenceAssessment {
  const confidenceScore = Math.min(95, 35 + obs.visuallyObserved.length * 5 + internalRes.length * 5 + webRes.length * 10);
  return {
    overallLevel: confidenceScore >= 75 ? "High" : confidenceScore >= 50 ? "Medium" : "Limited",
    confidenceScore,
    evidenceBreakdown: {
      imageObservationQuality: `${obs.visuallyObserved.length} image observations were recorded.`,
      internalResearcherDataMatch: `${internalRes.length} matching database research records were considered.`,
      webResearchSupport: webRes.length
        ? `${webRes.length} external research sources were considered.`
        : "No external research sources are configured.",
      aiInferenceCertainty: "Scores use saved crop requirements and the available analysis observations.",
    },
  };
}

/**
 * Generates actionable guide for missing lab test measurements.
 */
function generateMissingInformationGuide(obs: ImageObservations): MissingInformationGuide {
  return {
    criticalMissingFields: [
      "Exact Soil pH (hydrogen ion activity)",
      "Available Nitrogen, Phosphorus, Potassium (N-P-K) concentrations",
      "Organic Matter Percentage (Loss-on-ignition test)",
      "Soil Electrical Conductivity / Salinity Index",
    ],
    recommendedTests: [
      {
        testName: "Standard Laboratory Soil pH & Buffer Test",
        description: "Determines precise chemical acidity/alkalinity to refine fertilizer selection and lime dosage.",
        importance: "High",
      },
      {
        testName: "Macronutrient Assay (N-P-K)",
        description: "Quantifies available Nitrogen (ppm), Phosphorus (Olsen/Mehlich), and Potassium (ppm).",
        importance: "High",
      },
      {
        testName: "Soil Moisture & Drainage Percolation Rate Test",
        description: "Measures water infiltration speed per hour to refine irrigation scheduling.",
        importance: "Medium",
      },
      {
        testName: "Soil Organic Matter (SOM) Test",
        description: "Accurately measures soil carbon reserves and biological activity potential.",
        importance: "Recommended",
      },
    ],
  };
}
