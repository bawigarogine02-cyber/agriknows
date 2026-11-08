import { getDb } from "@/lib/db/pool";
import { randomUUID } from "node:crypto";

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  soil_type: string;
  total_area: number;
  created_at?: string;
  field_count?: number;
}

export interface Field {
  id: string;
  farm_id: string;
  farm_name?: string;
  name: string;
  area: number;
  current_crop_id: string | null;
  crop_name?: string;
  crop_ideal_ph_min?: number;
  crop_ideal_ph_max?: number;
  crop_water_requirement?: string;
  planting_date: string;
  soil_ph: number;
  organic_matter: number;
  water_source: string;
  is_harvested: boolean;
  created_at?: string;
}

export interface Crop {
  id: string;
  name: string;
  ideal_ph_min: number;
  ideal_ph_max: number;
  water_requirement: string;
  growth_days: number;
  climate: string;
  companion_crops: string;
  season: string;
  type?: string;
  category?: string;
  stage?: string;
  detail?: string;
  soil?: string;
  minimum_temperature?: number | null;
  maximum_temperature?: number | null;
  minimum_rainfall?: number | null;
  maximum_rainfall?: number | null;
  minimum_soil_temperature?: number | null;
  maximum_soil_temperature?: number | null;
  minimum_soil_moisture?: number | null;
  maximum_soil_moisture?: number | null;
  sunlight?: string;
  terrain?: string;
}

export interface PestDisease {
  id: string;
  crop_id: string | null;
  crop_name?: string;
  name: string;
  type: "insect" | "fungus" | "bacterial" | "virus";
  symptoms: string;
  prevention: string;
  treatment: string;
}

export interface Article {
  id: string;
  author_id: string | null;
  author_name?: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  evidence_note?: string;
  source_url?: string;
  published_at: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  field_id: string;
  field_name?: string;
  crop_name?: string;
  type: "fertilizer" | "irrigation" | "general";
  rule_applied: string;
  output_text: string;
  crop_stage: string;
  rainfall_recent: string;
  observed_issues: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  farmer_id: string;
  farmer_name?: string;
  researcher_id: string | null;
  researcher_name?: string;
  crop_name: string;
  subject: string;
  description: string;
  status: "Pending Review" | "Answered" | "Closed";
  image_url?: string;
  created_at: string;
  replies?: ConsultationReply[];
}

export interface ConsultationReply {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

export interface ResearchPublication {
  id: string;
  researcher_id: string;
  researcher_name: string;
  title: string;
  abstract: string;
  pdf_url: string;
  crop_type: string;
  soil_type: string;
  publication_date: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  user_email?: string;
  action: string;
  target_table: string;
  details: string;
  ip_address: string | null;
  device_info: string | null;
  created_at: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  recommendation_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface PublicAboutData {
  researchers: Array<{ id: string; name: string; role: string }>;
  stats: Array<{ value: number; label: string }>;
}

export interface StoredWeatherSnapshot {
  location: string;
  temperature_c: number;
  humidity_percent: number | null;
  rainfall_probability_percent: number | null;
  wind_kph: number | null;
  condition_label: string;
  observed_at: string;
}

export interface UserPreferences {
  default_farm_id: string | null;
  units: "metric" | "imperial";
  notify_weather: boolean;
  notify_recommendations: boolean;
}

export interface ImageObservations {
  visuallyObserved: string[];
  estimatedProperties: string[];
  requiresLabTesting: string[];
  soilColor?: string;
  soilTexture?: string;
  moistureLevel?: string;
  terrainType?: string;
  vegetationNotes?: string;
  rawAnalysisText?: string;
}

export interface InternalResearchRef {
  title: string;
  author: string;
  categoryOrCrop: string;
  summary: string;
  relevanceReason: string;
  url?: string;
}

export interface ExternalWebSource {
  title: string;
  sourceName: string;
  url: string;
  keyTakeaway: string;
  topic: string;
}

export interface EnvironmentalSnapshot {
  locationName: string;
  latitude?: number;
  longitude?: number;
  currentTempC?: number;
  soilTempC?: number;
  rainfallMm?: number;
  climateZone?: string;
}

export interface SuitabilityFactors {
  soilCompatibility: number;
  moistureCompatibility: number;
  temperatureCompatibility: number;
  terrainCompatibility: number;
  researchEvidence: number;
}

export interface PlantRecommendation {
  plantName: string;
  cropCategory: string;
  estimatedSuitability: number;
  suitabilityRating:
    | "Higher relative match"
    | "Potential match"
    | "Lower relative match"
    | "Highly Suitable"
    | "Moderately Suitable"
    | "Marginally Suitable"
    | "Unsuitable";
  reasons: string[];
  supportingObservations: string[];
  matchingFactors: string[];
  potentialProblems: string[];
  requiredImprovements: string[];
  waterRequirement: string;
  temperatureRequirement: string;
  soilRequirement: string;
  idealPhRange: string;
  growthDays: number;
  companionCrops: string;
  researcherNotes: string[];
  scoreBreakdown: SuitabilityFactors;
}

export interface LessSuitablePlant {
  plantName: string;
  estimatedSuitability: number;
  suitabilityRating: string;
  bottleneckFactors: string[];
  explanation: string;
  requiredRemediation: string[];
}

export interface ConfidenceAssessment {
  overallLevel: "High" | "Medium" | "Limited";
  confidenceScore: number;
  evidenceBreakdown: {
    imageObservationQuality: string;
    internalResearcherDataMatch: string;
    webResearchSupport: string;
    aiInferenceCertainty: string;
  };
}

export interface MissingInformationGuide {
  criticalMissingFields: string[];
  recommendedTests: {
    testName: string;
    description: string;
    importance: "High" | "Medium" | "Recommended";
  }[];
}

export interface CropAdvisorAnalysis {
  id: string;
  user_id: string;
  image_name?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  image_observations: ImageObservations;
  internal_research: InternalResearchRef[];
  web_research: ExternalWebSource[];
  environmental_data: EnvironmentalSnapshot;
  recommendations: PlantRecommendation[];
  less_suitable: LessSuitablePlant[];
  confidence_score: ConfidenceAssessment;
  missing_information: MissingInformationGuide;
  created_at: string;
}

export async function getFarms(userId: string): Promise<Farm[]> {
  const db = getDb();
  const where = userId === "admin" ? "" : "WHERE f.owner_id = ?";
  const [rows] = userId === "admin"
    ? await db.query(
        `SELECT f.id, f.owner_id AS user_id, f.name, COALESCE(l.name, '') AS location,
                COALESCE(f.soil_type, '') AS soil_type, COALESCE(f.total_area, 0) AS total_area,
                f.created_at, COUNT(fl.id) AS field_count
         FROM farms f
         LEFT JOIN locations l ON l.id = f.location_id
         LEFT JOIN fields fl ON fl.farm_id = f.id
         GROUP BY f.id, l.name
         ORDER BY f.created_at DESC`
      )
    : await db.query(
    `SELECT f.id, f.owner_id AS user_id, f.name, COALESCE(l.name, '') AS location,
            COALESCE(f.soil_type, '') AS soil_type, COALESCE(f.total_area, 0) AS total_area,
            f.created_at, COUNT(fl.id) AS field_count
     FROM farms f
     LEFT JOIN locations l ON l.id = f.location_id
     LEFT JOIN fields fl ON fl.farm_id = f.id
     ${where}
     GROUP BY f.id, l.name
     ORDER BY f.created_at DESC`,
        [userId]
      );
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name),
    location: String(row.location),
    soil_type: String(row.soil_type),
    total_area: Number(row.total_area),
    created_at: String(row.created_at),
    field_count: Number(row.field_count),
  }));
}

export async function createFarm(userId: string, farm: { name: string; location: string; soil_type: string; total_area: number }): Promise<Farm> {
  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [locationResult] = await connection.execute(
      "INSERT INTO locations (user_id, name) VALUES (?, ?)",
      [userId, farm.location || null]
    );
    const locationId = (locationResult as { insertId: number }).insertId;
    const [farmResult] = await connection.execute(
      "INSERT INTO farms (owner_id, name, location_id, soil_type, total_area) VALUES (?, ?, ?, ?, ?)",
      [userId, farm.name, locationId, farm.soil_type || null, farm.total_area]
    );
    await connection.commit();
    const newFarm: Farm = {
      id: String((farmResult as { insertId: number }).insertId),
      user_id: userId,
      name: farm.name,
      location: farm.location,
      soil_type: farm.soil_type,
      total_area: farm.total_area,
      created_at: new Date().toISOString(),
      field_count: 0,
    };
    await addAuditLog(userId, "Created Farm Parcel", "farms", `Created ${farm.name} (${farm.total_area} ha)`);
    return newFarm;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateFarm(
  userId: string,
  farmId: string,
  farm: { name: string; location: string; soil_type: string; total_area: number }
): Promise<boolean> {
  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT location_id, total_area FROM farms WHERE id = ? AND owner_id = ? FOR UPDATE",
      [farmId, userId]
    );
    const existing = (rows as Array<{ location_id: number | null; total_area: number }>)[0];
    if (!existing) {
      await connection.rollback();
      return false;
    }
    const [fieldRows] = await connection.query(
      "SELECT COALESCE(SUM(area_hectares), 0) AS field_area FROM fields WHERE farm_id = ?",
      [farmId]
    );
    const fieldArea = Number((fieldRows as Array<{ field_area: number }>)[0]?.field_area ?? 0);
    if (fieldArea > farm.total_area) {
      throw new Error("Farm area cannot be smaller than the combined area of its fields.");
    }

    let locationId = existing.location_id;
    if (locationId) {
      await connection.execute(
        "UPDATE locations SET name = ? WHERE id = ? AND user_id = ?",
        [farm.location, locationId, userId]
      );
    } else {
      const [locationResult] = await connection.execute(
        "INSERT INTO locations (user_id, name) VALUES (?, ?)",
        [userId, farm.location]
      );
      locationId = (locationResult as { insertId: number }).insertId;
    }
    await connection.execute(
      "UPDATE farms SET name = ?, location_id = ?, soil_type = ?, total_area = ? WHERE id = ? AND owner_id = ?",
      [farm.name, locationId, farm.soil_type || null, farm.total_area, farmId, userId]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await addAuditLog(userId, "Updated Farm Parcel", "farms", `Updated farm '${farm.name}' (${farm.total_area} ha)`);
  return true;
}

export async function deleteFarm(userId: string, farmId: string): Promise<boolean> {
  const [result] = await getDb().execute(
    "DELETE FROM farms WHERE id = ? AND owner_id = ?",
    [farmId, userId]
  );
  if (!(result as { affectedRows: number }).affectedRows) return false;
  await addAuditLog(userId, "Deleted Farm Parcel", "farms", `Deleted farm parcel '${farmId}'`);
  return true;
}

export async function getFields(userId: string): Promise<Field[]> {
  const db = getDb();
  const [rows] = await db.query(
    `SELECT fl.id, fl.farm_id, f.name AS farm_name, fl.name, fl.area_hectares AS area,
            fl.current_crop_id, COALESCE(fl.crop_name, c.name) AS crop_name,
            c.ideal_ph_min AS crop_ideal_ph_min, c.ideal_ph_max AS crop_ideal_ph_max,
            c.water_requirement AS crop_water_requirement,
            DATE_FORMAT(fl.planting_date, '%Y-%m-%d') AS planting_date,
            fl.soil_ph, fl.organic_matter, fl.water_source, fl.is_harvested, fl.created_at
     FROM fields fl
     JOIN farms f ON f.id = fl.farm_id
     LEFT JOIN crops c ON c.id = fl.current_crop_id
     WHERE f.owner_id = ?
     ORDER BY fl.created_at DESC`,
    [userId]
  );
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    farm_id: String(row.farm_id),
    farm_name: String(row.farm_name),
    name: String(row.name),
    area: Number(row.area),
    current_crop_id: row.current_crop_id === null ? null : String(row.current_crop_id),
    crop_name: row.crop_name ? String(row.crop_name) : undefined,
    crop_ideal_ph_min: row.crop_ideal_ph_min === null ? undefined : Number(row.crop_ideal_ph_min),
    crop_ideal_ph_max: row.crop_ideal_ph_max === null ? undefined : Number(row.crop_ideal_ph_max),
    crop_water_requirement: row.crop_water_requirement ? String(row.crop_water_requirement) : undefined,
    planting_date: row.planting_date ? String(row.planting_date).slice(0, 10) : "",
    soil_ph: Number(row.soil_ph),
    organic_matter: Number(row.organic_matter),
    water_source: String(row.water_source),
    is_harvested: Boolean(row.is_harvested),
    created_at: String(row.created_at),
  }));
}

export async function updateField(
  userId: string,
  fieldId: string,
  data: { name: string; area: number; current_crop_id?: string | null; crop_name?: string; planting_date: string; soil_ph: number; organic_matter: number; water_source: string }
): Promise<boolean> {
  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT fl.farm_id, f.total_area
       FROM fields fl JOIN farms f ON f.id = fl.farm_id
       WHERE fl.id = ? AND f.owner_id = ? FOR UPDATE`,
      [fieldId, userId]
    );
    const existing = (rows as Array<{ farm_id: number; total_area: number }>)[0];
    if (!existing) {
      await connection.rollback();
      return false;
    }
    const [areaRows] = await connection.query(
      "SELECT COALESCE(SUM(area_hectares), 0) AS field_area FROM fields WHERE farm_id = ? AND id <> ?",
      [existing.farm_id, fieldId]
    );
    const otherFieldArea = Number((areaRows as Array<{ field_area: number }>)[0]?.field_area ?? 0);
    if (otherFieldArea + data.area > Number(existing.total_area)) {
      throw new Error("Combined field area cannot exceed the farm's total area.");
    }
    await connection.execute(
      `UPDATE fields
       SET name = ?, area_hectares = ?, current_crop_id = ?, crop_name = ?,
           planting_date = ?, soil_ph = ?, organic_matter = ?, water_source = ?
       WHERE id = ?`,
      [
        data.name,
        data.area,
        data.current_crop_id || null,
        data.crop_name || null,
        data.planting_date,
        data.soil_ph,
        data.organic_matter,
        data.water_source,
        fieldId,
      ]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await addAuditLog(userId, "Updated Field Plot", "fields", `Updated field '${data.name}' (${data.area} ha)`);
  return true;
}

export async function deleteField(userId: string, fieldId: string): Promise<boolean> {
  const [result] = await getDb().execute(
    `DELETE fl FROM fields fl
     JOIN farms f ON f.id = fl.farm_id
     WHERE fl.id = ? AND f.owner_id = ?`,
    [fieldId, userId]
  );
  if (!(result as { affectedRows: number }).affectedRows) return false;
  await addAuditLog(userId, "Deleted Field Plot", "fields", `Deleted field plot '${fieldId}'`);
  return true;
}

export async function createField(userId: string, data: { farm_id: string; name: string; area: number; current_crop_id?: string; crop_name?: string; planting_date: string; soil_ph: number; organic_matter: number; water_source: string }): Promise<Field> {
  const db = getDb();
  const connection = await db.getConnection();
  let farmName = "";
  let fieldId = "";
  try {
    await connection.beginTransaction();
    const [farmRows] = await connection.query(
      "SELECT name, total_area FROM farms WHERE id = ? AND owner_id = ? FOR UPDATE",
      [data.farm_id, userId]
    );
    const farm = (farmRows as Array<{ name: string; total_area: number }>)[0];
    if (!farm) throw new Error("Farm parcel not found.");
    const [areaRows] = await connection.query(
      "SELECT COALESCE(SUM(area_hectares), 0) AS field_area FROM fields WHERE farm_id = ?",
      [data.farm_id]
    );
    const existingFieldArea = Number((areaRows as Array<{ field_area: number }>)[0]?.field_area ?? 0);
    if (existingFieldArea + data.area > Number(farm.total_area)) {
      throw new Error("Combined field area cannot exceed the farm's total area.");
    }
    const [result] = await connection.execute(
      `INSERT INTO fields (farm_id, name, area_hectares, current_crop_id, crop_name, planting_date, soil_ph, organic_matter, water_source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.farm_id, data.name, data.area, data.current_crop_id || null, data.crop_name || null, data.planting_date, data.soil_ph, data.organic_matter, data.water_source]
    );
    farmName = farm.name;
    fieldId = String((result as { insertId: number }).insertId);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  let cropName: string | undefined;
  if (data.current_crop_id) {
    const [cropRows] = await db.query("SELECT name FROM crops WHERE id = ? LIMIT 1", [data.current_crop_id]);
    cropName = (cropRows as Array<{ name: string }>)[0]?.name;
  }
  const createdAt = new Date().toISOString();
  const field: Field = {
    id: fieldId,
    farm_id: data.farm_id,
    farm_name: farmName,
    name: data.name,
    area: data.area,
    current_crop_id: data.current_crop_id || null,
    crop_name: data.crop_name || cropName,
    planting_date: data.planting_date,
    soil_ph: data.soil_ph,
    organic_matter: data.organic_matter,
    water_source: data.water_source,
    is_harvested: false,
    created_at: createdAt,
  };
  await addAuditLog(userId, "Created Field Plot", "fields", `Added field '${data.name}' (${data.area} ha) under ${farmName}`);
  return field;
}

export async function toggleFieldHarvest(userId: string, fieldId: string): Promise<Field | null> {
  const db = getDb();
  const [result] = await db.execute(
    `UPDATE fields fl JOIN farms f ON f.id = fl.farm_id
     SET fl.is_harvested = NOT fl.is_harvested
     WHERE fl.id = ? AND f.owner_id = ?`,
    [fieldId, userId]
  );
  if (!(result as { affectedRows: number }).affectedRows) return null;
  const field = (await getFields(userId)).find((item) => item.id === fieldId);
  if (!field) return null;
  await addAuditLog(userId, "Toggled Field Harvest Status", "fields", `Field '${field.name}' marked as ${field.is_harvested ? "Harvested" : "Active"}`);
  return field;
}

export async function updateUserProfile(
  userId: string,
  data: { name: string; address: string }
): Promise<boolean> {
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND status = 'active' FOR UPDATE",
      [userId]
    );
    if (!(rows as Array<{ id: string }>).length) {
      await connection.rollback();
      return false;
    }
    await connection.execute(
      "UPDATE users SET name = ?, address = ? WHERE id = ?",
      [data.name, data.address || null, userId]
    );
    await connection.execute(
      "INSERT INTO audit_logs (user_id, action, target_table, details) VALUES (?, ?, ?, ?)",
      [userId, "Updated Account Profile", "users", "Updated account name or address"]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return true;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND status = 'active' FOR UPDATE",
      [userId]
    );
    if (!(rows as Array<{ id: string }>).length) {
      await connection.rollback();
      return false;
    }
    await connection.execute(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, userId]
    );
    await connection.execute(
      "INSERT INTO audit_logs (user_id, action, target_table, details) VALUES (?, ?, ?, ?)",
      [userId, "Changed Account Password", "users", "Updated account password"]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return true;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "researcher" | "admin";
  status: UserAccountStatus;
  password_hash: string;
  address?: string;
  created_at: string;
}

export type UserAccountStatus = "pending" | "active" | "suspended" | "rejected";
export type UserAccountRole = "farmer" | "researcher" | "admin";


export async function getCrops(): Promise<Crop[]> {
  const db = getDb();
  const [rows] = await db.query(
    `SELECT c.id, c.name, c.season, c.ideal_ph_min, c.ideal_ph_max, c.water_requirement, c.growth_days,
            c.climate, c.companion_crops, c.category, c.type, c.stage, c.detail, c.soil,
            cr.min_temperature AS minimum_temperature, cr.max_temperature AS maximum_temperature,
            cr.min_rainfall AS minimum_rainfall, cr.max_rainfall AS maximum_rainfall,
            cr.min_soil_temperature AS minimum_soil_temperature, cr.max_soil_temperature AS maximum_soil_temperature,
            cr.min_soil_moisture AS minimum_soil_moisture, cr.max_soil_moisture AS maximum_soil_moisture,
            cr.sunlight, cr.terrain
     FROM crops c
     LEFT JOIN crop_requirements cr ON cr.crop_id = c.id
     ORDER BY c.created_at DESC`
  );
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    season: String(row.season || ""),
    ideal_ph_min: Number(row.ideal_ph_min),
    ideal_ph_max: Number(row.ideal_ph_max),
    water_requirement: String(row.water_requirement || ""),
    growth_days: Number(row.growth_days),
    climate: String(row.climate || ""),
    companion_crops: String(row.companion_crops || ""),
    category: row.category ? String(row.category) : undefined,
    type: row.type ? String(row.type) : undefined,
    stage: row.stage ? String(row.stage) : undefined,
    detail: row.detail ? String(row.detail) : undefined,
    soil: row.soil ? String(row.soil) : undefined,
    minimum_temperature: row.minimum_temperature === null ? null : Number(row.minimum_temperature),
    maximum_temperature: row.maximum_temperature === null ? null : Number(row.maximum_temperature),
    minimum_rainfall: row.minimum_rainfall === null ? null : Number(row.minimum_rainfall),
    maximum_rainfall: row.maximum_rainfall === null ? null : Number(row.maximum_rainfall),
    minimum_soil_temperature: row.minimum_soil_temperature === null ? null : Number(row.minimum_soil_temperature),
    maximum_soil_temperature: row.maximum_soil_temperature === null ? null : Number(row.maximum_soil_temperature),
    minimum_soil_moisture: row.minimum_soil_moisture === null ? null : Number(row.minimum_soil_moisture),
    maximum_soil_moisture: row.maximum_soil_moisture === null ? null : Number(row.maximum_soil_moisture),
    sunlight: row.sunlight ? String(row.sunlight) : undefined,
    terrain: row.terrain ? String(row.terrain) : undefined,
  }));
}

export async function createCrop(crop: Partial<Crop> & { name: string }): Promise<Crop> {
  const db = getDb();
  const [result] = await db.execute(
    `INSERT INTO crops (name, season, ideal_ph_min, ideal_ph_max, water_requirement, growth_days, climate, companion_crops, category, type, stage, detail, soil)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      crop.name,
      crop.season ?? null,
      crop.ideal_ph_min ?? null,
      crop.ideal_ph_max ?? null,
      crop.water_requirement ?? null,
      crop.growth_days ?? null,
      crop.climate ?? null,
      crop.companion_crops ?? null,
      crop.category ?? null,
      crop.type ?? null,
      crop.stage ?? null,
      crop.detail ?? null,
      crop.soil ?? null,
    ]
  );
  return {
    id: String((result as { insertId: number }).insertId),
    name: crop.name,
    season: crop.season || "",
    ideal_ph_min: Number(crop.ideal_ph_min),
    ideal_ph_max: Number(crop.ideal_ph_max),
    water_requirement: crop.water_requirement || "",
    growth_days: Number(crop.growth_days),
    climate: crop.climate || "",
    companion_crops: crop.companion_crops || "",
    category: crop.category,
    type: crop.type,
    stage: crop.stage,
    detail: crop.detail,
    soil: crop.soil,
  };
}

export async function deleteCrop(id: string): Promise<boolean> {
  const [result] = await getDb().execute("DELETE FROM crops WHERE id = ?", [id]);
  return (result as { affectedRows: number }).affectedRows > 0;
}

export async function getUsers(
  search = "",
  page = 1,
  pageSize = 10,
  status?: UserAccountStatus,
  role?: UserAccountRole
): Promise<{ users: Array<{ id: string; name: string; email: string; address: string | null; role: UserAccountRole; status: UserAccountStatus; createdAt: string }>; total: number }> {
  const db = getDb();
  const like = `%${search}%`;
  const conditions = ["(name LIKE ? OR email LIKE ?)"];
  const values: Array<string | number> = [like, like];
  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }
  if (role) {
    conditions.push("role = ?");
    values.push(role);
  }
  const where = conditions.join(" AND ");
  const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM users WHERE ${where}`, values);
  const [rows] = await db.query(
    `SELECT id, name, email, address, role, status, created_at AS createdAt FROM users
     WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, pageSize, (page - 1) * pageSize]
  );
  const users = (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    address: row.address === null ? null : String(row.address),
    role: ["farmer", "researcher", "admin"].includes(String(row.role))
      ? (String(row.role) as UserAccountRole)
      : "farmer",
    status: ["pending", "active", "suspended", "rejected"].includes(String(row.status))
      ? (String(row.status) as UserAccountStatus)
      : "active",
    createdAt: String(row.createdAt),
  }));
  return { users, total: Number((countRows as Array<{ total: number }>)[0]?.total ?? 0) };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  if (db) {
    const [rows] = await db.query(
      "SELECT id, name, email, role, status, password_hash, address, created_at FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const r = rows[0] as Record<string, unknown>;
      const validRole = ["farmer", "researcher", "admin"].includes(String(r.role))
        ? (String(r.role) as "farmer" | "researcher" | "admin")
        : "farmer";
      return {
        id: String(r.id),
        name: String(r.name),
        email: String(r.email),
        role: validRole,
        status: ["pending", "active", "suspended", "rejected"].includes(String(r.status))
          ? (String(r.status) as UserAccountStatus)
          : "active",
        password_hash: String(r.password_hash || ""),
        address: r.address ? String(r.address) : "",
        created_at: String(r.created_at || new Date().toISOString()),
      };
    }
    return null;
  }

  return null;
}

export async function createUserRecord(user: Omit<UserRecord, "created_at">): Promise<UserRecord> {
  const newRecord: UserRecord = {
    ...user,
    created_at: new Date().toISOString(),
  };

  const db = getDb();
  if (db) {
    await db.execute(
      "INSERT INTO users (id, name, email, role, status, password_hash, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user.id, user.name, user.email, user.role, user.status, user.password_hash, user.address || null]
    );
    return newRecord;
  }

  return newRecord;
}

export async function updateUserRoleOrStatus(id: string, role?: string, status?: string): Promise<boolean> {
  const db = getDb();
  const [result] = await db.execute("UPDATE users SET role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?", [
    role ?? null,
    status ?? null,
    id,
  ]);
  return (result as { affectedRows: number }).affectedRows > 0;
}

export async function deleteUserRecord(id: string): Promise<boolean> {
  const db = getDb();
  const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
  return (result as { affectedRows: number }).affectedRows > 0;
}


export async function getPestsDiseases(): Promise<PestDisease[]> {
  const [rows] = await getDb().query(
    `SELECT p.id, p.crop_id, c.name AS crop_name, p.name, p.type, p.symptoms, p.prevention, p.treatment
     FROM pests_diseases p
     LEFT JOIN crops c ON c.id = p.crop_id
     ORDER BY p.created_at DESC`
  );
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    crop_id: row.crop_id === null ? null : String(row.crop_id),
    crop_name: row.crop_name ? String(row.crop_name) : undefined,
    name: String(row.name),
    type: String(row.type) as PestDisease["type"],
    symptoms: String(row.symptoms),
    prevention: String(row.prevention),
    treatment: String(row.treatment),
  }));
}

export async function getArticles(includeDrafts = false): Promise<Article[]> {
  const visibilityFilter = includeDrafts ? "" : "WHERE a.published_at IS NOT NULL";
  const [rows] = await getDb().query(
    `SELECT a.id, a.author_id, u.name AS author_name, a.title, a.category, a.summary, a.body,
            a.evidence_note, a.source_url, a.published_at,
            COALESCE(a.published_at, a.created_at) AS created_at
     FROM knowledge_articles a
     LEFT JOIN users u ON u.id = a.author_id
     ${visibilityFilter}
     ORDER BY COALESCE(a.published_at, a.created_at) DESC`
  );
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    author_id: row.author_id ? String(row.author_id) : null,
    author_name: row.author_name ? String(row.author_name) : undefined,
    title: String(row.title),
    category: String(row.category),
    summary: String(row.summary),
    body: String(row.body),
    evidence_note: row.evidence_note ? String(row.evidence_note) : undefined,
    source_url: row.source_url ? String(row.source_url) : undefined,
    published_at: row.published_at ? String(row.published_at) : null,
    created_at: String(row.created_at),
  }));
}

export interface ArticleInput {
  title: string;
  category: string;
  summary: string;
  body: string;
  evidence_note: string;
  source_url: string;
  published: boolean;
}

export async function createArticle(authorId: string, article: ArticleInput): Promise<void> {
  await getDb().execute(
    `INSERT INTO knowledge_articles
      (author_id, title, category, summary, body, evidence_note, source_url, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, IF(?, CURRENT_TIMESTAMP, NULL))`,
    [
      authorId,
      article.title,
      article.category,
      article.summary,
      article.body,
      article.evidence_note || null,
      article.source_url || null,
      article.published,
    ]
  );
}

export async function updateArticle(id: string, article: ArticleInput): Promise<boolean> {
  const [result] = await getDb().execute(
    `UPDATE knowledge_articles
     SET title = ?, category = ?, summary = ?, body = ?, evidence_note = ?, source_url = ?,
         published_at = IF(?, COALESCE(published_at, CURRENT_TIMESTAMP), NULL)
     WHERE id = ?`,
    [
      article.title,
      article.category,
      article.summary,
      article.body,
      article.evidence_note || null,
      article.source_url || null,
      article.published,
      id,
    ]
  );
  if ((result as { affectedRows: number }).affectedRows > 0) return true;
  const [rows] = await getDb().query("SELECT id FROM knowledge_articles WHERE id = ? LIMIT 1", [id]);
  return (rows as Array<{ id: string }>).length > 0;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const [result] = await getDb().execute("DELETE FROM knowledge_articles WHERE id = ?", [id]);
  return (result as { affectedRows: number }).affectedRows > 0;
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const db = getDb();
  const query = `SELECT r.id, r.user_id, r.field_id, f.name AS field_name, r.crop_id,
                        COALESCE(c.name, '') AS crop_name, r.type, r.rule_applied, r.output_text,
                        r.crop_stage, r.rainfall_recent, r.observed_issues, r.created_at
                 FROM recommendations r
                 LEFT JOIN fields f ON f.id = r.field_id
                 LEFT JOIN crops c ON c.id = r.crop_id
                 ${userId === "admin" ? "" : "WHERE r.user_id = ?"}
                 ORDER BY r.created_at DESC`;
  const [rows] = userId === "admin" ? await db.query(query) : await db.query(query, [userId]);
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    field_id: row.field_id === null ? "" : String(row.field_id),
    field_name: row.field_name ? String(row.field_name) : undefined,
    crop_name: row.crop_name ? String(row.crop_name) : undefined,
    type: String(row.type) as Recommendation["type"],
    rule_applied: String(row.rule_applied || ""),
    output_text: String(row.output_text || ""),
    crop_stage: String(row.crop_stage || ""),
    rainfall_recent: String(row.rainfall_recent || ""),
    observed_issues: String(row.observed_issues || ""),
    created_at: String(row.created_at),
  }));
}

export async function saveRecommendation(userId: string, rec: Omit<Recommendation, "id" | "user_id" | "created_at">): Promise<Recommendation> {
  const cleanOutputText = rec.output_text ? rec.output_text.replace(/\*/g, "") : "";
  const title = `${rec.type} recommendation for ${rec.crop_name || "field"}`;
  const db = getDb();
  const [fieldRows] = await db.query(
    `SELECT f.current_crop_id
     FROM fields f JOIN farms farm ON farm.id = f.farm_id
     WHERE f.id = ? AND farm.owner_id = ? LIMIT 1`,
    [rec.field_id || null, userId]
  );
  const field = (fieldRows as Array<{ current_crop_id: number | null }>)[0];
  if (!field) throw new Error("Field parcel not found.");
  const [result] = await db.execute(
    `INSERT INTO recommendations
       (user_id, field_id, crop_id, type, rule_applied, output_text, crop_stage, rainfall_recent, observed_issues, title, explanation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      rec.field_id,
      field.current_crop_id,
      rec.type,
      rec.rule_applied,
      cleanOutputText,
      rec.crop_stage,
      rec.rainfall_recent,
      rec.observed_issues,
      title,
      cleanOutputText,
    ]
  );
  const newRec: Recommendation = {
    ...rec,
    output_text: cleanOutputText,
    id: String((result as { insertId: number }).insertId),
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  try {
    await createNotification(
      userId,
      "Decision-support recommendation ready",
      `Your ${rec.type} guidance for ${rec.field_name || "your field"} is ready to review.`,
      newRec.id
    );
  } catch (error) {
    console.error("Recommendation notification could not be saved:", error);
  }
  await addAuditLog(userId, "Generated Decision Support Advisory", "recommendations", `Generated ${rec.type} advice for field '${rec.field_name || rec.field_id}'`);
  return newRec;
}

export async function getConsultations(userId: string, userRole: string): Promise<Consultation[]> {
  const db = getDb();
  const predicate = userRole === "admin" || userRole === "researcher" ? "" : "WHERE c.farmer_id = ?";
  const [rows] = predicate
    ? await db.query(
        `SELECT c.id, c.farmer_id, farmer.name AS farmer_name, c.researcher_id, researcher.name AS researcher_name,
                c.crop_name, c.subject, c.description, c.status, c.image_url, c.created_at,
                reply.id AS reply_id, reply.sender_id, sender.name AS sender_name, sender.role AS sender_role,
                reply.message, reply.created_at AS reply_created_at
         FROM consultations c
         JOIN users farmer ON farmer.id = c.farmer_id
         LEFT JOIN users researcher ON researcher.id = c.researcher_id
         LEFT JOIN consultation_replies reply ON reply.consultation_id = c.id
         LEFT JOIN users sender ON sender.id = reply.sender_id
         ${predicate}
         ORDER BY c.created_at DESC, reply.created_at ASC`,
        [userId]
      )
    : await db.query(
        `SELECT c.id, c.farmer_id, farmer.name AS farmer_name, c.researcher_id, researcher.name AS researcher_name,
                c.crop_name, c.subject, c.description, c.status, c.image_url, c.created_at,
                reply.id AS reply_id, reply.sender_id, sender.name AS sender_name, sender.role AS sender_role,
                reply.message, reply.created_at AS reply_created_at
         FROM consultations c
         JOIN users farmer ON farmer.id = c.farmer_id
         LEFT JOIN users researcher ON researcher.id = c.researcher_id
         LEFT JOIN consultation_replies reply ON reply.consultation_id = c.id
         LEFT JOIN users sender ON sender.id = reply.sender_id
         ORDER BY c.created_at DESC, reply.created_at ASC`
      );
  const consultations = new Map<string, Consultation>();
  for (const raw of rows as Array<Record<string, unknown>>) {
    const id = String(raw.id);
    let consultation = consultations.get(id);
    if (!consultation) {
      consultation = {
        id,
        farmer_id: String(raw.farmer_id),
        farmer_name: String(raw.farmer_name),
        researcher_id: raw.researcher_id ? String(raw.researcher_id) : null,
        researcher_name: raw.researcher_name ? String(raw.researcher_name) : undefined,
        crop_name: String(raw.crop_name),
        subject: String(raw.subject),
        description: String(raw.description),
        status: String(raw.status) as Consultation["status"],
        image_url: raw.image_url ? String(raw.image_url) : undefined,
        created_at: String(raw.created_at),
        replies: [],
      };
      consultations.set(id, consultation);
    }
    if (raw.reply_id !== null) {
      consultation.replies?.push({
        id: String(raw.reply_id),
        consultation_id: id,
        sender_id: String(raw.sender_id),
        sender_name: String(raw.sender_name),
        sender_role: String(raw.sender_role),
        message: String(raw.message),
        created_at: String(raw.reply_created_at),
      });
    }
  }
  return [...consultations.values()];
}

export async function createConsultation(userId: string, userName: string, data: { crop_name: string; subject: string; description: string; image_url?: string }): Promise<Consultation> {
  const id = randomUUID();
  const db = getDb();
  await db.execute(
    "INSERT INTO consultations (id, farmer_id, crop_name, subject, description, image_url) VALUES (?, ?, ?, ?, ?, ?)",
    [id, userId, data.crop_name, data.subject, data.description, data.image_url || null]
  );
  try {
    await db.execute(
      `INSERT INTO notifications (user_id, title, message)
       SELECT id, 'New farmer consultation', ?
       FROM users WHERE role IN ('researcher', 'admin') AND status = 'active'`,
      [`${userName} submitted a consultation: ${data.subject}`]
    );
  } catch (error) {
    console.error("Researcher consultation notification could not be saved:", error);
  }
  try {
    await createNotification(
      userId,
      "Consultation submitted",
      `Your question about ${data.crop_name} has been sent to agricultural researchers.`
    );
  } catch (error) {
    console.error("Farmer consultation confirmation could not be saved:", error);
  }
  const newCon: Consultation = {
    id,
    farmer_id: userId,
    farmer_name: userName,
    researcher_id: null,
    crop_name: data.crop_name,
    subject: data.subject,
    description: data.description,
    status: "Pending Review",
    image_url: data.image_url,
    created_at: new Date().toISOString(),
    replies: [],
  };
  await addAuditLog(userId, "Submitted Expert Inquiry", "consultations", `Submitted consultation subject: '${data.subject}'`);
  return newCon;
}

export async function addConsultationReply(userId: string, userName: string, userRole: string, consultationId: string, message: string): Promise<ConsultationReply | null> {
  const db = getDb();
  const [consultationRows] = await db.query(
    "SELECT farmer_id FROM consultations WHERE id = ? AND (farmer_id = ? OR ? IN ('researcher', 'admin')) LIMIT 1",
    [consultationId, userId, userRole]
  );
  if (!(consultationRows as unknown[]).length) return null;
  const id = randomUUID();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO consultation_replies (id, consultation_id, sender_id, message) VALUES (?, ?, ?, ?)",
      [id, consultationId, userId, message]
    );
    if (userRole === "researcher" || userRole === "admin") {
      await connection.execute(
        "UPDATE consultations SET status = 'Answered', researcher_id = ? WHERE id = ?",
        [userId, consultationId]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const [threadRows] = await db.query(
    "SELECT farmer_id, researcher_id, subject FROM consultations WHERE id = ? LIMIT 1",
    [consultationId]
  );
  const thread = (threadRows as Array<{ farmer_id: string; researcher_id: string | null; subject: string }>)[0];
  if (thread) {
    try {
      if (userRole === "researcher" || userRole === "admin") {
        await createNotification(
          thread.farmer_id,
          "Your consultation received a reply",
          `${userName} replied to: ${thread.subject}`
        );
      } else if (thread.researcher_id) {
        try {
          await createNotification(
            thread.researcher_id,
            "Farmer replied to a consultation",
            `${userName} replied to: ${thread.subject}`
          );
        } catch (error) {
          console.error("Researcher reply notification could not be saved:", error);
        }
        try {
          await createAdminNotifications(
            "Consultation activity",
            `${userName} replied to: ${thread.subject}`
          );
        } catch (error) {
          console.error("Admin consultation activity notification could not be saved:", error);
        }
      } else {
        await db.execute(
          `INSERT INTO notifications (user_id, title, message)
           SELECT id, 'Farmer replied to a consultation', ?
           FROM users WHERE role IN ('researcher', 'admin') AND status = 'active' AND id <> ?`,
          [`${userName} replied to: ${thread.subject}`, userId]
        );
      }
    } catch (error) {
      console.error("Consultation reply notification could not be saved:", error);
    }
  }
  const reply: ConsultationReply = {
    id,
    consultation_id: consultationId,
    sender_id: userId,
    sender_name: userName,
    sender_role: userRole,
    message,
    created_at: new Date().toISOString(),
  };

  await addAuditLog(userId, "Replied to Consultation Thread", "consultation_replies", `Replied to inquiry #${consultationId.slice(0, 6)}`);
  return reply;
}

export async function getPublications(): Promise<ResearchPublication[]> {
  const [rows] = await getDb().query(
    `SELECT p.id, p.researcher_id, u.name AS researcher_name, p.title, p.abstract, p.pdf_url,
            p.crop_type, p.soil_type, DATE_FORMAT(p.publication_date, '%Y-%m-%d') AS publication_date, p.created_at
     FROM research_publications p
     JOIN users u ON u.id = p.researcher_id
     ORDER BY p.publication_date DESC, p.created_at DESC`
  );
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    researcher_id: String(row.researcher_id),
    researcher_name: String(row.researcher_name),
    title: String(row.title),
    abstract: String(row.abstract),
    pdf_url: String(row.pdf_url),
    crop_type: String(row.crop_type),
    soil_type: String(row.soil_type),
    publication_date: String(row.publication_date).slice(0, 10),
    created_at: String(row.created_at),
  }));
}

export async function createPublication(userId: string, userName: string, data: { title: string; abstract: string; pdf_url: string; crop_type: string; soil_type: string }): Promise<ResearchPublication> {
  const id = randomUUID();
  const pub: ResearchPublication = {
    id,
    researcher_id: userId,
    researcher_name: userName,
    title: data.title,
    abstract: data.abstract,
    pdf_url: data.pdf_url,
    crop_type: data.crop_type,
    soil_type: data.soil_type,
    publication_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString()
  };
  await getDb().execute(
    "INSERT INTO research_publications (id, researcher_id, title, abstract, pdf_url, crop_type, soil_type, publication_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, userId, data.title, data.abstract, data.pdf_url, data.crop_type, data.soil_type, pub.publication_date]
  );
  await addAuditLog(userId, "Published Research Paper", "research_publications", `Published paper: '${data.title}'`);
  return pub;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const [rows] = await getDb().query(
    `SELECT l.id, l.user_id, u.name AS user_name, u.email AS user_email, l.action, l.target_table,
            l.details, l.ip_address, l.device_info, l.created_at
     FROM audit_logs l
     LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC`
  );
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : null,
    user_name: row.user_name ? String(row.user_name) : undefined,
    user_email: row.user_email ? String(row.user_email) : undefined,
    action: String(row.action),
    target_table: String(row.target_table),
    details: String(row.details || ""),
    ip_address: row.ip_address ? String(row.ip_address) : null,
    device_info: row.device_info ? String(row.device_info) : null,
    created_at: String(row.created_at),
  }));
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  recommendationId: string | null = null
): Promise<void> {
  await getDb().execute(
    "INSERT INTO notifications (user_id, recommendation_id, title, message) VALUES (?, ?, ?, ?)",
    [userId, recommendationId, title, message]
  );
}

export async function createAdminNotifications(title: string, message: string): Promise<void> {
  await getDb().execute(
    `INSERT INTO notifications (user_id, title, message)
     SELECT id, ?, ? FROM users WHERE role = 'admin' AND status = 'active'`,
    [title, message]
  );
}

export async function getUserNotifications(
  userId: string,
  limit = 10
): Promise<{ notifications: UserNotification[]; unreadCount: number }> {
  const db = getDb();
  const [[rows], [countRows]] = await Promise.all([
    db.query(
      `SELECT id, title, message, recommendation_id, read_at, created_at
       FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?`,
      [userId, limit]
    ),
    db.query("SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND read_at IS NULL", [userId]),
  ]);
  return {
    notifications: (rows as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      message: String(row.message),
      recommendation_id: row.recommendation_id === null ? null : String(row.recommendation_id),
      read_at: row.read_at ? String(row.read_at) : null,
      created_at: String(row.created_at),
    })),
    unreadCount: Number((countRows as Array<{ total: number }>)[0]?.total ?? 0),
  };
}

export async function markUserNotificationRead(
  userId: string,
  notificationId?: string
): Promise<void> {
  if (notificationId) {
    await getDb().execute(
      "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND read_at IS NULL",
      [notificationId, userId]
    );
    return;
  }
  await getDb().execute(
    "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL",
    [userId]
  );
}

export async function getAdminSystemReport(): Promise<Array<{ label: string; value: number }>> {
  const db = getDb();
  const queries: Array<[string, string]> = [
    ["Total accounts", "SELECT COUNT(*) AS total FROM users"],
    ["Pending accounts", "SELECT COUNT(*) AS total FROM users WHERE status = 'pending'"],
    ["Registered farms", "SELECT COUNT(*) AS total FROM farms"],
    ["Registered fields", "SELECT COUNT(*) AS total FROM fields"],
    ["Crop catalog entries", "SELECT COUNT(*) AS total FROM crops"],
    ["Pest and disease records", "SELECT COUNT(*) AS total FROM pests_diseases"],
    ["Knowledge articles", "SELECT COUNT(*) AS total FROM knowledge_articles"],
    ["Saved recommendations", "SELECT COUNT(*) AS total FROM recommendations"],
    ["Farmer consultations", "SELECT COUNT(*) AS total FROM consultations"],
    ["Research publications", "SELECT COUNT(*) AS total FROM research_publications"],
    ["Crop advisor analyses", "SELECT COUNT(*) AS total FROM analyses"],
    ["Audit events", "SELECT COUNT(*) AS total FROM audit_logs"],
  ];
  const values = await Promise.all(queries.map(async ([label, sql]) => {
    const [rows] = await db.query(sql);
    const total = Number((rows as Array<{ total: number }>)[0]?.total ?? 0);
    return { label, value: total };
  }));
  return values;
}

export async function addAuditLog(
  userId: string | null,
  action: string,
  target_table: string,
  details: string,
  ip: string | null = null,
  device: string | null = null
) {
  await getDb().execute(
    "INSERT INTO audit_logs (user_id, action, target_table, details, ip_address, device_info) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, action, target_table, details, ip, device]
  );
}

export async function getPublicAboutData(): Promise<PublicAboutData> {
  const db = getDb();
  const [[farmers], [farms], [crops], [publications], [researchers]] = await Promise.all([
    db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'farmer' AND status = 'active'"),
    db.query("SELECT COUNT(*) AS total FROM farms"),
    db.query("SELECT COUNT(*) AS total FROM crops"),
    db.query("SELECT COUNT(*) AS total FROM research_publications"),
    db.query("SELECT id, name, role FROM users WHERE role = 'researcher' AND status = 'active' ORDER BY name"),
  ]);
  const count = (rows: unknown) => Number((rows as Array<{ total: number }>)[0]?.total ?? 0);
  return {
    researchers: (researchers as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      role: String(row.role),
    })),
    stats: [
      { value: count(farmers), label: "Active farmers" },
      { value: count(farms), label: "Registered farms" },
      { value: count(crops), label: "Crops in the catalog" },
      { value: count(publications), label: "Research publications" },
    ],
  };
}

export async function getLatestWeatherSnapshot(userId: string): Promise<StoredWeatherSnapshot | null> {
  const [rows] = await getDb().query(
    `SELECT l.name AS location, w.temperature_c, w.humidity_percent, w.rainfall_probability_percent,
            w.wind_kph, w.condition_label, w.observed_at
     FROM weather_snapshots w
     JOIN locations l ON l.id = w.location_id
     LEFT JOIN farms f ON f.location_id = l.id AND f.owner_id = l.user_id
     LEFT JOIN user_preferences p ON p.user_id = l.user_id
     WHERE l.user_id = ?
     ORDER BY (f.id = p.default_farm_id) DESC, w.observed_at DESC
     LIMIT 1`,
    [userId]
  );
  const row = (rows as Array<Record<string, unknown>>)[0];
  if (!row) return null;
  return {
    location: String(row.location || ""),
    temperature_c: Number(row.temperature_c),
    humidity_percent: row.humidity_percent === null ? null : Number(row.humidity_percent),
    rainfall_probability_percent:
      row.rainfall_probability_percent === null ? null : Number(row.rainfall_probability_percent),
    wind_kph: row.wind_kph === null ? null : Number(row.wind_kph),
    condition_label: String(row.condition_label || ""),
    observed_at: String(row.observed_at),
  };
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const db = getDb();
  await db.execute(
    "INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)",
    [userId]
  );
  const [rows] = await db.query(
    `SELECT default_farm_id, units, notify_weather, notify_recommendations
     FROM user_preferences
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );
  const row = (rows as Array<Record<string, unknown>>)[0];
  if (!row) throw new Error("Unable to load user preferences.");
  return {
    default_farm_id: row.default_farm_id === null ? null : String(row.default_farm_id),
    units: row.units === "imperial" ? "imperial" : "metric",
    notify_weather: Boolean(row.notify_weather),
    notify_recommendations: Boolean(row.notify_recommendations),
  };
}

export async function saveUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<UserPreferences> {
  const db = getDb();
  if (preferences.default_farm_id) {
    const [farms] = await db.query(
      "SELECT id FROM farms WHERE id = ? AND owner_id = ? LIMIT 1",
      [preferences.default_farm_id, userId]
    );
    if (!(farms as Array<{ id: number }>).length) throw new Error("The selected farm does not belong to this account.");
  }
  await db.execute(
    `INSERT INTO user_preferences (user_id, default_farm_id, units, notify_weather, notify_recommendations)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE default_farm_id = VALUES(default_farm_id),
       units = VALUES(units), notify_weather = VALUES(notify_weather),
       notify_recommendations = VALUES(notify_recommendations)`,
    [
      userId,
      preferences.default_farm_id,
      preferences.units,
      preferences.notify_weather,
      preferences.notify_recommendations,
    ]
  );
  await addAuditLog(userId, "Updated User Preferences", "user_preferences", "Updated farm, units, or notification preferences");
  return preferences;
}

export async function getCropAdvisorAnalyses(userId: string): Promise<CropAdvisorAnalysis[]> {
  const db = getDb();
  const [rows] = await db.query(
    `SELECT id, user_id, ai_analysis, missing_information, created_at
     FROM analyses WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return (rows as Array<Record<string, unknown>>).map((row) => {
    if (typeof row.ai_analysis !== "string" || !row.ai_analysis) {
      throw new Error(`Analysis ${String(row.id)} does not contain a saved result.`);
    }
    const saved = JSON.parse(row.ai_analysis) as Omit<CropAdvisorAnalysis, "id" | "user_id" | "created_at">;
    return {
      ...saved,
      id: String(row.id),
      user_id: String(row.user_id),
      missing_information:
        typeof row.missing_information === "string"
          ? JSON.parse(row.missing_information)
          : saved.missing_information,
      created_at: String(row.created_at),
    };
  });
}

export async function saveCropAdvisorAnalysis(
  userId: string,
  analysisData: Omit<CropAdvisorAnalysis, "id" | "user_id" | "created_at">
): Promise<CropAdvisorAnalysis> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const analysis: CropAdvisorAnalysis = {
    ...analysisData,
    id,
    user_id: userId,
    created_at: now,
  };

  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [locationResult] = await connection.execute(
      "INSERT INTO locations (user_id, latitude, longitude, name) VALUES (?, ?, ?, ?)",
      [
        userId,
        analysisData.latitude ?? null,
        analysisData.longitude ?? null,
        analysisData.location_name || analysisData.environmental_data.locationName || null,
      ]
    );
    const locationId = (locationResult as { insertId: number }).insertId;
    await connection.execute(
      `INSERT INTO analyses (id, user_id, location_id, image_reference, ai_analysis, missing_information)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        locationId,
        analysisData.image_name || null,
        JSON.stringify(analysisData),
        JSON.stringify(analysisData.missing_information),
      ]
    );
    await connection.execute(
      "INSERT INTO soil_data (analysis_id, payload) VALUES (?, ?)",
      [id, JSON.stringify(analysisData.image_observations)]
    );
    await connection.execute(
      "INSERT INTO weather_data (analysis_id, payload) VALUES (?, ?)",
      [id, JSON.stringify(analysisData.environmental_data)]
    );
    for (const recommendation of analysisData.recommendations) {
      await connection.execute(
        `INSERT INTO crop_recommendations
           (analysis_id, crop_name, score, confidence, explanation, risks, considerations, next_steps)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          recommendation.plantName,
          Math.max(0, Math.min(100, Math.round(recommendation.estimatedSuitability))),
          analysisData.confidence_score.overallLevel,
          recommendation.reasons.join("\n"),
          JSON.stringify(recommendation.potentialProblems),
          JSON.stringify(recommendation.supportingObservations),
          JSON.stringify(recommendation.requiredImprovements),
        ]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await addAuditLog(userId, "Performed Crop Advisor Soil Analysis", "analyses", `Analyzed land image for location: '${analysisData.location_name || "Unknown Location"}' (ID: ${id})`);
  return analysis;
}

export async function deleteCropAdvisorAnalysis(userId: string, analysisId: string): Promise<boolean> {
  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT id FROM analyses WHERE id = ? AND user_id = ? FOR UPDATE",
      [analysisId, userId]
    );
    if (!(rows as unknown[]).length) {
      await connection.rollback();
      return false;
    }
    await connection.execute("DELETE FROM crop_recommendations WHERE analysis_id = ?", [analysisId]);
    await connection.execute("DELETE FROM soil_data WHERE analysis_id = ?", [analysisId]);
    await connection.execute("DELETE FROM weather_data WHERE analysis_id = ?", [analysisId]);
    await connection.execute("DELETE FROM analyses WHERE id = ? AND user_id = ?", [analysisId, userId]);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
