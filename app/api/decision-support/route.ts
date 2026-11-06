import { getSession } from "@/lib/auth/session";
import { getFields, saveRecommendation } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: {
    field_id?: string;
    crop_stage?: string;
    rainfall_recent?: string;
    observed_issues?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }

  const cropStages = ["seedling", "vegetative", "flowering", "mature"];
  const rainfallLevels = ["Low (<25mm)", "Moderate (25-50mm)", "Heavy (>50mm)"];
  const observedIssues = [
    "None",
    "Leaf Yellowing (N-deficiency)",
    "Stunted Growth & Purple Leaves",
    "Marginal Leaf Scorching",
    "Severe Pest Infestation",
  ];
  if (
    !body.field_id ||
    !cropStages.includes(body.crop_stage || "") ||
    !rainfallLevels.includes(body.rainfall_recent || "") ||
    !observedIssues.includes(body.observed_issues || "None")
  ) {
    return NextResponse.json({ error: "Select a field plot, growth stage, and rainfall condition." }, { status: 400 });
  }

  const fields = await getFields(session.id);
  const selectedField = fields.find((f) => f.id === body.field_id);

  if (!selectedField) {
    return NextResponse.json({ error: "Field parcel not found" }, { status: 404 });
  }

  const cropName = selectedField.crop_name?.trim();
  if (!cropName) {
    return NextResponse.json({ error: "Assign a crop to this field before generating recommendations." }, { status: 400 });
  }
  const soilPh = selectedField.soil_ph;
  const organicMatter = selectedField.organic_matter;
  if (
    !Number.isFinite(soilPh) || soilPh < 0 || soilPh > 14 ||
    !Number.isFinite(organicMatter) || organicMatter < 0
  ) {
    return NextResponse.json({ error: "Add valid soil pH and organic matter values to this field before generating recommendations." }, { status: 400 });
  }

  const stage = body.crop_stage as "seedling" | "vegetative" | "flowering" | "mature";
  const rainfallRecent = body.rainfall_recent as string;
  const observedIssue = body.observed_issues || "None";
  const stageGuidance = {
    seedling: {
      rule: "Seedling soil-test-led nutrient guidance",
      advice: `For ${cropName} at the seedling stage, use starter nutrients only where soil-test results and crop-specific local guidance indicate a need; avoid placing concentrated fertilizer against seedlings.`,
    },
    vegetative: {
      rule: "Vegetative crop nutrient guidance",
      advice: `For ${cropName} during vegetative growth, base any nutrient top-dressing on crop-specific recommendations and soil-test results. Avoid applying fertilizer before heavy rain.`,
    },
    flowering: {
      rule: "Flowering-stage nutrient guidance",
      advice: `For ${cropName} during flowering, maintain balanced nutrition and apply additional nutrients only when crop-specific guidance or soil/plant testing supports it.`,
    },
    mature: {
      rule: "Mature crop nutrient guidance",
      advice: `For mature ${cropName}, avoid late nutrient applications unless a crop-specific recommendation calls for them; use soil-test results to plan post-harvest amendments.`,
    },
  }[stage];
  const phTarget = selectedField.crop_ideal_ph_min !== undefined && selectedField.crop_ideal_ph_max !== undefined
    ? `The catalog pH range for ${cropName} is ${selectedField.crop_ideal_ph_min}–${selectedField.crop_ideal_ph_max}; compare it with the recorded field pH (${soilPh}) before considering amendments.`
    : `The crop catalog has no pH target for ${cropName}; use a soil test and local extension guidance before choosing an amendment.`;
  const issueNote = body.observed_issues && body.observed_issues !== "None"
    ? `Observed symptom: ${body.observed_issues}. Symptoms alone do not confirm a nutrient deficiency or pest diagnosis; verify with field inspection or testing before treatment.`
    : "";
  const fertilizerRule = stageGuidance.rule;
  const fertilizerPlan = `${stageGuidance.advice} ${phTarget} Recorded organic matter: ${organicMatter}%. ${issueNote}`.trim();
  let irrigationSchedule = "";
  let irrigationRule = "";
  if (rainfallRecent === "Heavy (>50mm)") {
    irrigationRule = "Heavy rainfall and drainage check";
    irrigationSchedule = `With heavy recent rainfall, pause scheduled irrigation and check root-zone moisture and drainage for ${cropName}. Resume only when the soil and crop water needs indicate it; recorded water source: ${selectedField.water_source}.`;
  } else if (rainfallRecent === "Moderate (25-50mm)") {
    irrigationRule = "Moderate rainfall moisture monitoring";
    irrigationSchedule = `Check root-zone moisture before irrigating ${cropName}; supplement rainfall only when the crop's water needs and field conditions indicate a deficit. Use the catalog water requirement (${selectedField.crop_water_requirement || "not specified"}) as a seasonal reference, not a single-application rate. Recorded water source: ${selectedField.water_source}.`;
  } else {
    irrigationRule = "Low rainfall water-deficit monitoring";
    irrigationSchedule = `With low recent rainfall, check root-zone moisture more frequently and irrigate ${cropName} according to crop-specific seasonal water needs and local conditions. Mulch where appropriate to reduce evaporation. Use the catalog water requirement (${selectedField.crop_water_requirement || "not specified"}) as a seasonal reference, not a single-application rate. Recorded water source: ${selectedField.water_source}.`;
  }

  // Save fertilizer recommendation record
  const fertRec = await saveRecommendation(session.id, {
    field_id: selectedField.id,
    field_name: selectedField.name,
    crop_name: cropName,
    type: "fertilizer",
    rule_applied: fertilizerRule,
    output_text: fertilizerPlan,
    crop_stage: stage,
    rainfall_recent: rainfallRecent,
    observed_issues: observedIssue
  });

  // Save irrigation recommendation record
  const irrigRec = await saveRecommendation(session.id, {
    field_id: selectedField.id,
    field_name: selectedField.name,
    crop_name: cropName,
    type: "irrigation",
    rule_applied: irrigationRule,
    output_text: irrigationSchedule,
    crop_stage: stage,
    rainfall_recent: rainfallRecent,
    observed_issues: observedIssue
  });

  return NextResponse.json({
    fertilizer: fertRec,
    irrigation: irrigRec,
    field: selectedField
  });
}
