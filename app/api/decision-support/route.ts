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

  if (!body.field_id || !body.crop_stage || !body.rainfall_recent) {
    return NextResponse.json({ error: "Select a field plot, growth stage, and rainfall condition." }, { status: 400 });
  }

  const fields = await getFields(session.id);
  const selectedField = fields.find((f) => f.id === body.field_id);

  if (!selectedField) {
    return NextResponse.json({ error: "Field parcel not found" }, { status: 404 });
  }

  const cropName = selectedField.crop_name || "Cereal / Field Crop";
  const soilPh = selectedField.soil_ph || 6.5;
  const organicMatter = selectedField.organic_matter || 3.0;

  // Rule-based heuristic decision engine logic
  let fertilizerPlan = "";
  let fertilizerRule = "";
  let irrigationSchedule = "";
  let irrigationRule = "";

  // 1. Fertilizer Rule Matrix
  if (body.crop_stage === "seedling") {
    fertilizerRule = "Seedling Starter Nitrogen & Phosphorus Rule";
    fertilizerPlan = `Apply high-phosphorus starter fertilizer 14-14-14 (Complete) at 60 kg/ha. ${
      soilPh < 6.0 ? "Soil is acidic (pH " + soilPh + "); apply 250 kg/ha agricultural lime prior to top-dressing." : ""
    }`;
  } else if (body.crop_stage === "vegetative") {
    fertilizerRule = "Vegetative Canopy Biomass High-Nitrogen Protocol";
    if (body.observed_issues === "Leaf Yellowing (N-deficiency)") {
      fertilizerPlan = `High Priority: Apply Urea (46-0-0) at 120 kg/ha split in 2 applications 10 days apart. Combine with MOP (0-0-60) at 40 kg/ha to reinforce stem structure.`;
    } else {
      fertilizerPlan = `Apply Urea (46-0-0) at 90 kg/ha + 16-20-0 at 50 kg/ha during side-dressing.`;
    }
  } else if (body.crop_stage === "flowering") {
    fertilizerRule = "Reproductive Potassium & Micronutrient Augmentation Rule";
    fertilizerPlan = `Apply Muriate of Potash (0-0-60) at 75 kg/ha alongside foliar Calcium-Boron spray to mitigate blossom drop and optimize fruit set.`;
  } else {
    fertilizerRule = "Pre-Harvest Nutrient Stabilization Rule";
    fertilizerPlan = `Cease Nitrogen applications. Apply low-dose Potassium sulfate at 30 kg/ha if soil testing indicates K-depletion.`;
  }

  // 2. Irrigation Rule Matrix
  if (body.rainfall_recent === "Heavy (>50mm)") {
    irrigationRule = "Heavy Rainfall Moisture Saturation Rule";
    irrigationSchedule = `Hold Irrigation: Recent rainfall exceeds field capacity. Open field drainage channels to prevent root asphyxiation. Resume monitoring when top 5cm soil dries.`;
  } else if (body.rainfall_recent === "Moderate (25-50mm)") {
    irrigationRule = "Moderate Moisture Maintenance Protocol";
    irrigationSchedule = `Irrigate 1 to 2 times weekly at 15 liters/m² (${selectedField.water_source}). Adjust based on daily evapotranspiration rates.`;
  } else {
    irrigationRule = "Arid / Deficit Irrigation Compensatory Protocol";
    irrigationSchedule = `Irrigate 3 to 4 times weekly at 25 liters/m². Apply mulch around crop root zones to conserve moisture loss.`;
  }

  // Save fertilizer recommendation record
  const fertRec = await saveRecommendation(session.id, {
    field_id: selectedField.id,
    field_name: selectedField.name,
    crop_name: cropName,
    type: "fertilizer",
    rule_applied: fertilizerRule,
    output_text: fertilizerPlan,
    crop_stage: body.crop_stage,
    rainfall_recent: body.rainfall_recent,
    observed_issues: body.observed_issues || "None"
  });

  // Save irrigation recommendation record
  const irrigRec = await saveRecommendation(session.id, {
    field_id: selectedField.id,
    field_name: selectedField.name,
    crop_name: cropName,
    type: "irrigation",
    rule_applied: irrigationRule,
    output_text: irrigationSchedule,
    crop_stage: body.crop_stage,
    rainfall_recent: body.rainfall_recent,
    observed_issues: body.observed_issues || "None"
  });

  return NextResponse.json({
    fertilizer: fertRec,
    irrigation: irrigRec,
    field: selectedField
  });
}
