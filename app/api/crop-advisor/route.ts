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

class CropAdvisorError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "CropAdvisorError";
  }
}

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

    // 3. Rank crop candidates without using literature as a suitability signal.
    const cropsDb = await getCrops();
    const pestsDb = await getPestsDiseases();
    const preliminaryResults = calculatePlantSuitability(
      imageObservations,
      [],
      [],
      environmentalData,
      cropsDb,
      pestsDb
    );
    const searchTopics = preliminaryResults.recommendations
      .slice(0, 3)
      .map((crop) => crop.plantName);

    // 4. Include only studies that mention one of the candidate crops.
    const internalResearch = await queryResearcherDatabase(searchTopics);
    const webResearchResult = await searchAgriculturalStudies(searchTopics);
    const webResearch = webResearchResult.sources;

    // 5. Rank candidates using catalog fields; literature is supporting context, not a match score.
    const { recommendations, lessSuitable } = calculatePlantSuitability(
      imageObservations,
      internalResearch,
      webResearch,
      environmentalData,
      cropsDb,
      pestsDb
    );

    // 6. Report evidence limitations and missing information.
    const evidenceAssessment = assessEvidenceLimits(internalResearch, webResearch, webResearchResult.status);
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
      confidence_score: evidenceAssessment,
      missing_information: missingInformation,
    });

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error("Crop Advisor processing error:", error);
    if (error instanceof CropAdvisorError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
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
  if (!apiKey?.trim()) {
    throw new CropAdvisorError(
      "Image analysis is not configured. Set GEMINI_API_KEY on the server and restart the app.",
      503
    );
  }

  let response: Response;
  try {
    response = await fetch(
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
Describe only features that are directly visible in the image. Do not infer the region, climate, plant species,
soil fertility, organic matter, drainage, or exact soil texture from vegetation or color alone. If a feature is
unclear, say so. Do NOT claim that an image can determine laboratory-level soil properties (like exact pH or N-P-K).

Respond ONLY with JSON using this structure:
{
  "visuallyObserved": ["array of details directly visible in the image"],
  "estimatedProperties": ["conservative visual hypotheses; do not infer unobservable soil properties"],
  "requiresLabTesting": ["array of exact chemical/biological properties requiring laboratory testing"],
  "soilColor": "visible color of exposed soil, or null if soil is not clearly visible",
  "soilTexture": "visible surface particle or aggregate appearance, or null if indeterminable",
  "moistureLevel": "visible surface wetness only, or null if indeterminable",
  "terrainType": "visible slope only when clear, or null if indeterminable",
  "vegetationNotes": "vegetation directly visible in the image"
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
        signal: AbortSignal.timeout(30000),
      }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new CropAdvisorError("Image analysis timed out. Please try again.", 504);
    }
    throw new CropAdvisorError(
      "Could not connect to the image analysis service. Check the server's network connection and try again.",
      503
    );
  }
  if (!response.ok) {
    const errorByStatus: Record<number, { message: string; status: number }> = {
      400: {
        message: "The image analysis service rejected the request. Check that GEMINI_API_KEY is a valid Google AI Studio API key.",
        status: 502,
      },
      401: {
        message: "The image analysis service rejected GEMINI_API_KEY. Check the server configuration.",
        status: 502,
      },
      403: {
        message: "The image analysis service denied access. Check GEMINI_API_KEY permissions and API availability.",
        status: 502,
      },
      404: {
        message: "The configured image analysis model is unavailable. Check the Gemini model configuration.",
        status: 502,
      },
      429: {
        message: "The image analysis service quota has been reached. Check the Gemini project quota or try again later.",
        status: 503,
      },
    };
    const failure = errorByStatus[response.status] ?? {
      message: "The image analysis service is temporarily unavailable. Please try again later.",
      status: 503,
    };
    console.error("Gemini image analysis request failed:", response.status);
    throw new CropAdvisorError(failure.message, failure.status);
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new CropAdvisorError(
      "The image analysis service returned an unreadable response. Please try again.",
      502
    );
  }
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;
  const candidates = isRecord(data) && Array.isArray(data.candidates) ? data.candidates : [];
  const candidate = candidates[0];
  const content = isRecord(candidate) ? candidate.content : undefined;
  const parts = isRecord(content) && Array.isArray(content.parts) ? content.parts : [];
  const textResponse = isRecord(parts[0]) ? parts[0].text : undefined;
  if (typeof textResponse !== "string") {
    throw new CropAdvisorError(
      "The image analysis service returned no usable analysis. Try another image.",
      502
    );
  }
  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new CropAdvisorError(
      "The image analysis service returned an invalid result. Please try again.",
      502
    );
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    throw new CropAdvisorError(
      "The image analysis service returned an invalid result. Please try again.",
      502
    );
  }
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
async function queryResearcherDatabase(cropNames: string[]): Promise<InternalResearchRef[]> {
  const publications = await getPublications();
  const articles = await getArticles();

  const internalRefs: InternalResearchRef[] = [];
  const isRelevant = (text: string) => cropNames.some((cropName) => textMentionsCrop(text, cropName));

  for (const pub of publications) {
    const searchableText = `${pub.title} ${pub.crop_type} ${pub.soil_type} ${pub.abstract}`;
    if (!isRelevant(searchableText)) continue;
    internalRefs.push({
      title: pub.title,
      author: pub.researcher_name,
      categoryOrCrop: pub.crop_type,
      summary: pub.abstract,
      relevanceReason: `Stored research publication that mentions ${pub.crop_type}.`,
      url: `/knowledge-base`,
    });
  }

  for (const art of articles) {
    if (!isRelevant(`${art.title} ${art.category} ${art.summary}`)) continue;
    internalRefs.push({
      title: art.title,
      author: art.author_name || "Author not recorded",
      categoryOrCrop: art.category,
      summary: art.summary,
      relevanceReason: `Stored knowledge-base article that mentions ${art.category}.`,
      url: `/knowledge-base`,
    });
  }

  return internalRefs;
}

function cropNameVariants(cropName: string): string[] {
  const variants = cropName
    .split(/[()[\],/]/)
    .map((variant) => variant.trim())
    .filter((variant) => variant.length >= 3);
  return [...new Set([cropName.trim(), ...variants])];
}

function textMentionsCrop(text: string, cropName: string): boolean {
  const normalizedText = text.toLowerCase();
  return cropNameVariants(cropName).some((variant) => {
    const escaped = variant.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(normalizedText);
  });
}

async function searchAgriculturalStudies(
  cropNames: string[]
): Promise<{ sources: ExternalWebSource[]; status: string }> {
  const distinctCropNames = [...new Set(cropNames.map((name) => name.trim()).filter(Boolean))].slice(0, 3);
  if (!distinctCropNames.length) {
    return { sources: [], status: "No crop candidates were available to search for." };
  }

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;
  const results = await Promise.all(distinctCropNames.map(async (cropName) => {
    const url = new URL("https://api.crossref.org/works");
    url.search = new URLSearchParams({
      query: `${cropName} agriculture soil yield`,
      filter: "type:journal-article",
      rows: "10",
      select: "DOI,title,publisher,URL,published,abstract,container-title",
    }).toString();

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AgriKMS/1.0 (agricultural study citation lookup)",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        console.warn("Crossref study search failed:", response.status);
        return { sources: [] as ExternalWebSource[], failed: true };
      }

      const result: unknown = await response.json();
      const message = isRecord(result) ? result.message : undefined;
      const items = isRecord(message) && Array.isArray(message.items) ? message.items : [];
      const sources = items.flatMap((item): ExternalWebSource[] => {
        if (!isRecord(item) || typeof item.DOI !== "string" || !Array.isArray(item.title)) return [];
        const title = item.title.find((value): value is string => typeof value === "string")?.trim();
        if (!title) return [];

        const abstract = typeof item.abstract === "string"
          ? item.abstract
            .replace(/<[^>]*>/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&#39;|&apos;/g, "'")
            .replace(/\s+/g, " ")
            .trim()
          : "";
        const searchableText = `${title} ${abstract}`;
        const hasAgriculturalContext =
          /\b(agricultur\w*|agronom\w*|cultivat\w*|crop\w*|farm\w*|fertili[sz]\w*|harvest\w*|irrigat\w*|nutrient\w*|plant\w*|soil\w*|yield\w*)\b/i.test(searchableText);
        if (!textMentionsCrop(searchableText, cropName) || !hasAgriculturalContext) return [];

        const doi = item.DOI.trim();
        if (!/^10\.\d{4,9}\/\S+$/i.test(doi)) return [];
        const sourceUrl = `https://doi.org/${doi}`;
        const journal = Array.isArray(item["container-title"])
          ? item["container-title"].find((value): value is string => typeof value === "string")
          : undefined;
        const publisher = typeof item.publisher === "string" ? item.publisher : undefined;
        const dateParts = isRecord(item.published) && Array.isArray(item.published["date-parts"])
          ? item.published["date-parts"][0]
          : undefined;
        const year = Array.isArray(dateParts) && typeof dateParts[0] === "number"
          ? dateParts[0]
          : undefined;

        return [{
          title,
          sourceName: [journal || publisher || "Crossref-indexed article", year].filter(Boolean).join(" · "),
          url: sourceUrl,
          keyTakeaway: abstract
            ? abstract.slice(0, 600)
            : `Abstract not supplied by the publisher. DOI: ${doi}`,
          topic: cropName,
        }];
      });
      return { sources, failed: false };
    } catch (error) {
      console.warn(`Crossref study search failed for ${cropName}:`, error);
      return { sources: [] as ExternalWebSource[], failed: true };
    }
  }));

  const seenDois = new Set<string>();
  const sources = results.flatMap((result) => result.sources)
    .filter((source) => {
      const doi = source.url.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").toLowerCase();
      if (seenDois.has(doi)) return false;
      seenDois.add(doi);
      return true;
    })
    .slice(0, 5);
  const searchesFailed = results.every((result) => result.failed);

  return {
    sources,
    status: sources.length
      ? `Found ${sources.length} Crossref-indexed article${sources.length === 1 ? "" : "s"} whose title or abstract mentions a candidate crop.`
      : searchesFailed
        ? "The external literature service could not be reached. Please try again later."
        : "No Crossref-indexed articles passed the crop-relevance check.",
  };
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
      textMentionsCrop(`${reference.title} ${reference.categoryOrCrop}`, crop.name)
    );
    const matchingWebResearch = webResearch.filter((reference) => textMentionsCrop(reference.topic, crop.name));
    const matchingPests = pestsDb.filter((pest) => pest.crop_id === crop.cropId);
    const moistureScore = observations.moistureLevel ? 65 : 50;

    const totalEstimated = Math.round(
      (soilScore * 0.3 + moistureScore * 0.2 + tempScore * 0.2 + terrainScore * 0.15) / 0.85
    );

    recommendations.push({
      plantName: crop.name,
      cropCategory: crop.category,
      estimatedSuitability: totalEstimated,
      suitabilityRating: "Potential match",
      reasons: [
        "AI-estimated surface details were compared with the crop catalog; they are not measured soil properties.",
        env.currentTempC !== undefined
          ? "Current air temperature, not a seasonal climate average, was compared with the crop catalog range."
          : "No live temperature data was available for comparison.",
        `Supporting literature: ${matchingResearch.length} relevant internal and ${matchingWebResearch.length} external source(s).`,
      ],
      supportingObservations: [
        ...[observations.soilTexture, observations.terrainType, observations.moistureLevel].filter(
          (value): value is string => Boolean(value)
        ),
      ],
      matchingFactors: [
        "Image-estimated soil characteristics",
        ...(env.currentTempC !== undefined ? ["Current weather temperature"] : []),
        ...(observations.terrainType ? ["Image-estimated terrain"] : []),
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
      researcherNotes: [
        ...matchingResearch.map((reference) => `${reference.title} — ${reference.author}: ${reference.summary}`),
        ...matchingWebResearch.map((reference) => `${reference.title} — ${reference.sourceName}: ${reference.keyTakeaway}`),
      ],
      scoreBreakdown: {
        soilCompatibility: soilScore,
        moistureCompatibility: moistureScore,
        temperatureCompatibility: tempScore,
        terrainCompatibility: terrainScore,
        researchEvidence: matchingResearch.length || matchingWebResearch.length ? 80 : 0,
      },
    });
  }

  recommendations.sort((a, b) => b.estimatedSuitability - a.estimatedSuitability);
  const qualifyingCandidates = recommendations
    .filter((recommendation) => recommendation.estimatedSuitability >= 50)
    .map((recommendation, index) => ({
      ...recommendation,
      suitabilityRating: index === 0 ? "Higher relative match" as const : "Potential match" as const,
    }));

  return { recommendations: qualifyingCandidates, lessSuitable };
}

/**
 * Assesses evidence confidence level.
 */
function assessEvidenceLimits(
  internalRes: InternalResearchRef[],
  webRes: ExternalWebSource[],
  webResearchStatus: string
): ConfidenceAssessment {
  return {
    overallLevel: "Limited",
    confidenceScore: 0,
    evidenceBreakdown: {
      imageObservationQuality: "Image interpretation is not a soil measurement.",
      internalResearcherDataMatch: `${internalRes.length} internal research record(s) mention the candidate crop(s).`,
      webResearchSupport: webResearchStatus,
      aiInferenceCertainty: webRes.length
        ? `${webRes.length} Crossref-indexed citation(s) passed a crop-name relevance check; this does not verify study quality or results.`
        : "No relevant external citation was included; recommendations remain preliminary.",
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
