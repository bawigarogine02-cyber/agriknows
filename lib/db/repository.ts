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
  ip_address: string;
  device_info: string;
  created_at: string;
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
  suitabilityRating: "Highly Suitable" | "Moderately Suitable" | "Marginally Suitable" | "Unsuitable";
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

// Fallback In-Memory Seed Store
const mockCropAdvisorAnalyses: CropAdvisorAnalysis[] = [];

const mockFarms: Farm[] = [
  { id: "f-1", user_id: "demo-user-1", name: "Green Valley Estate", location: "Central Valley, Sector 4", soil_type: "Loam", total_area: 14.5, created_at: "2026-01-15T08:00:00Z", field_count: 3 },
  { id: "f-2", user_id: "demo-user-1", name: "Sunburst Plantation", location: "Eastern Ridge, Zone B", soil_type: "Clay Loam", total_area: 28.0, created_at: "2026-02-10T10:30:00Z", field_count: 2 },
  { id: "f-3", user_id: "demo-user-1", name: "Highland Terrace Parcel", location: "Northern Plateau", soil_type: "Sandy Loam", total_area: 9.2, created_at: "2026-03-01T14:15:00Z", field_count: 1 },
];

const mockFields: Field[] = [
  { id: "fld-1", farm_id: "f-1", farm_name: "Green Valley Estate", name: "North Maize Plot", area: 5.5, current_crop_id: "c-1", crop_name: "Maize (Corn)", planting_date: "2026-05-12", soil_ph: 6.2, organic_matter: 3.1, water_source: "Drip Irrigation", is_harvested: false, created_at: "2026-05-12T09:00:00Z" },
  { id: "fld-2", farm_id: "f-1", farm_name: "Green Valley Estate", name: "Paddy Field A1", area: 4.0, current_crop_id: "c-2", crop_name: "Rice (Paddy)", planting_date: "2026-06-01", soil_ph: 5.8, organic_matter: 4.0, water_source: "Canal System", is_harvested: false, created_at: "2026-06-01T08:30:00Z" },
  { id: "fld-3", farm_id: "f-1", farm_name: "Green Valley Estate", name: "Legacy Wheat Field", area: 5.0, current_crop_id: "c-3", crop_name: "Wheat", planting_date: "2025-11-10", soil_ph: 6.8, organic_matter: 2.8, water_source: "Rainfed", is_harvested: true, created_at: "2025-11-10T07:45:00Z" },
  { id: "fld-4", farm_id: "f-2", farm_name: "Sunburst Plantation", name: "Soybean Basin", area: 18.0, current_crop_id: "c-4", crop_name: "Soybean", planting_date: "2026-04-20", soil_ph: 6.5, organic_matter: 3.5, water_source: "Borehole / Well", is_harvested: false, created_at: "2026-04-20T11:00:00Z" },
  { id: "fld-5", farm_id: "f-2", farm_name: "Sunburst Plantation", name: "Cassava Sector B", area: 10.0, current_crop_id: "c-5", crop_name: "Cassava", planting_date: "2026-02-15", soil_ph: 5.5, organic_matter: 2.2, water_source: "Rainfed", is_harvested: false, created_at: "2026-02-15T10:00:00Z" },
];

const mockCrops: Crop[] = [
  { id: "c-1", name: "Maize (Corn)", ideal_ph_min: 5.8, ideal_ph_max: 7.0, water_requirement: "500 - 800 mm", growth_days: 110, climate: "Warm Subtropical / Tropical", companion_crops: "Beans, Squash, Cowpeas", season: "Wet Season" },
  { id: "c-2", name: "Rice (Paddy)", ideal_ph_min: 5.5, ideal_ph_max: 6.8, water_requirement: "1200 - 1600 mm", growth_days: 130, climate: "Humid Tropical", companion_crops: "Duckweed, Azolla, Fish co-culture", season: "Wet Season" },
  { id: "c-3", name: "Wheat", ideal_ph_min: 6.0, ideal_ph_max: 7.2, water_requirement: "450 - 650 mm", growth_days: 120, climate: "Cool Temperate / Subtropical", companion_crops: "Clover, Peas", season: "Dry / Cool Season" },
  { id: "c-4", name: "Soybean", ideal_ph_min: 6.0, ideal_ph_max: 7.0, water_requirement: "450 - 700 mm", growth_days: 100, climate: "Warm Temperate / Tropical", companion_crops: "Corn, Sorghum", season: "Wet Season" },
  { id: "c-5", name: "Cassava", ideal_ph_min: 5.5, ideal_ph_max: 6.5, water_requirement: "300 - 500 mm", growth_days: 270, climate: "Hot Tropical", companion_crops: "Peanuts, Melon, Cowpeas", season: "Year-Round" },
  { id: "c-6", name: "Tomato", ideal_ph_min: 6.0, ideal_ph_max: 6.8, water_requirement: "400 - 600 mm", growth_days: 85, climate: "Warm Subtropical", companion_crops: "Basil, Marigold, Onions", season: "Dry / Controlled" },
];

const mockPests: PestDisease[] = [
  { id: "p-1", crop_id: "c-1", crop_name: "Maize (Corn)", name: "Fall Armyworm (Spodoptera frugiperda)", type: "insect", symptoms: "Ragged holes in leaves, whorl damage, sawdust-like frass on stems and ears.", prevention: "Early planting, crop rotation with non-host leguminous crops, neem oil spray.", treatment: "Biological control using Trichogramma wasps, Bacillus thuringiensis (Bt), or targeted Emamectin Benzoate." },
  { id: "p-2", crop_id: "c-2", crop_name: "Rice (Paddy)", name: "Rice Blast (Magnaporthe oryzae)", type: "fungus", symptoms: "Spindle-shaped lesions on leaves with gray centers and reddish-brown borders; neck rot.", prevention: "Avoid excessive Nitrogen fertilization, maintain 5-10cm standing water depth, use resistant varieties.", treatment: "Apply Tricyclazole or Azoxystrobin fungicide upon early symptom spotting." },
  { id: "p-3", crop_id: "c-6", crop_name: "Tomato", name: "Bacterial Wilt (Ralstonia solanacearum)", type: "bacterial", symptoms: "Rapid wilting of green leaves during hot sunny days without initial leaf yellowing.", prevention: "Solarize soil prior to planting, maintain pH > 6.5, practice 4-year crop rotation.", treatment: "No chemical cure; rogue out infected plants immediately and drench surrounding soil with Copper Hydroxide." },
  { id: "p-4", crop_id: "c-4", crop_name: "Soybean", name: "Soybean Rust (Phakopsora pachyrhizi)", type: "fungus", symptoms: "Tan to reddish-brown lesions on leaf undersides with small powdery pustules.", prevention: "Plant early maturing varieties, inspect lower canopy regularly during flowering.", treatment: "Foliar application of Triazole + Strobilurin fungicide combinations at first sign." },
];

const mockArticles: Article[] = [
  { id: "a-1", author_id: "u-res-1", author_name: "Dr. Elena Rostova (Agronomist)", title: "Integrated Pest Management Strategies for Fall Armyworm", category: "Pest Management", summary: "A comprehensive guide on non-chemical and targeted biological controls for controlling armyworm outbreaks in cereal crops.", body: "### Introduction\nFall Armyworm (*Spodoptera frugiperda*) poses a severe threat to cereal crops across tropical regions...\n\n### Prevention Techniques\n1. Intercropping with desmodium (push-pull strategy).\n2. Regular scouting every 3 days during seedling growth.\n3. Application of neem oil extracts.\n\n### Targeted Chemical Controls\nUse selective bio-insecticides like Bacillus thuringiensis to minimize impact on beneficial predatory insects.", created_at: "2026-04-10T11:00:00Z" },
  { id: "a-2", author_id: "u-res-2", author_name: "Prof. Marcus Thorne", title: "Optimizing Soil Organic Matter and N-P-K Utilization", category: "Soil Health", summary: "Learn how organic matter percentages directly alter N-P-K absorption efficiency and soil water retention.", body: "### Soil Health Mechanics\nOrganic matter serves as a nutrient buffer and water reservoir...\n\n### Application Steps\n- Incorporate crop residues after harvest.\n- Utilize cover cropping with legumes during fallow periods.\n- Test soil pH biannually.", created_at: "2026-05-18T14:30:00Z" },
  { id: "a-3", author_id: "u-res-1", author_name: "Dr. Elena Rostova (Agronomist)", title: "Precision Drip Irrigation Scheduling for High-Yield Crops", category: "Irrigation", summary: "Key water management protocols tailored to crop growth stages to reduce water waste by up to 40%.", body: "### Water Requirement Mapping\nCrops demand varying moisture volumes at different phenological stages...\n\n- Seedling stage: Light, frequent applications.\n- Vegetative stage: Deeper root zone wetting.\n- Flowering/Fruiting stage: Peak water demand window.", created_at: "2026-06-02T09:15:00Z" },
];

const mockRecommendations: Recommendation[] = [
  { id: "rec-1", user_id: "demo-user-1", field_id: "fld-1", field_name: "North Maize Plot", crop_name: "Maize (Corn)", type: "fertilizer", rule_applied: "Maize Vegetative Stage High-N Protocol", output_text: "Fertilizer Plan: Apply 120 kg/ha Urea (46-0-0) in two split doses during knee-high stage. Supplement with 50 kg/ha MOP (0-0-60) to strengthen stem vigor.", crop_stage: "Vegetative", rainfall_recent: "Moderate (25-50mm)", observed_issues: "Leaf Yellowing (N-deficiency)", created_at: "2026-06-10T14:20:00Z" },
  { id: "rec-2", user_id: "demo-user-1", field_id: "fld-2", field_name: "Paddy Field A1", crop_name: "Rice (Paddy)", type: "irrigation", rule_applied: "Saturated Soil Moisture Trigger Rule", output_text: "Irrigation Schedule: Maintain 5cm continuous water layer until 10 days before harvest. Increase drainage during tiller production to stimulate root growth.", crop_stage: "Vegetative", rainfall_recent: "Heavy (>50mm)", observed_issues: "None", created_at: "2026-06-12T16:45:00Z" },
];

const mockConsultations: Consultation[] = [];

const mockPublications: ResearchPublication[] = [
  { id: "pub-1", researcher_id: "u-res-1", researcher_name: "Dr. Elena Rostova", title: "Comparative Analysis of Bio-Fertilization in Tropical Maize Cultivation", abstract: "This study evaluates the yield impact of combining Azospirillum inoculants with standard N-P-K application across 12 field trials. Results indicate a 14.2% increase in grain mass alongside a 20% reduction in synthetic Nitrogen requirements.", pdf_url: "#", crop_type: "Maize (Corn)", soil_type: "Loam / Clay Loam", publication_date: "2026-03-15", created_at: "2026-03-15T00:00:00Z" },
  { id: "pub-2", researcher_id: "u-res-2", researcher_name: "Prof. Marcus Thorne", title: "Soil pH Remediation via Biochar and Agricultural Lime in Acidic Fields", abstract: "Field investigations into long-term soil buffering capacity using calcitic limestone vs hardwood biochar. Soil pH increased from 5.1 to 6.4 over a 6-month growth window, boosting phosphorus bioavailability.", pdf_url: "#", crop_type: "All / Cereal Crops", soil_type: "Acidic Clay", publication_date: "2026-04-28", created_at: "2026-04-28T00:00:00Z" },
];

const mockAuditLogs: AuditLog[] = [
  { id: "aud-2", user_id: "u-res-1", user_name: "Dr. Elena Rostova", user_email: "researcher@agrikms.org", action: "Published Research Paper", target_table: "research_publications", details: "Published 'Comparative Analysis of Bio-Fertilization'", ip_address: "10.0.0.12", device_info: "Safari / macOS", created_at: "2026-06-12T11:40:00Z" },
  { id: "aud-4", user_id: "admin-1", user_name: "Admin System Governance", user_email: "admin@agrikms.org", action: "Updated Account Status", target_table: "users", details: "Changed user status to Active for researcher@agrikms.org", ip_address: "127.0.0.1", device_info: "Edge / Windows", created_at: "2026-06-05T14:00:00Z" },
];

export async function getFarms(userId: string): Promise<Farm[]> {
  const db = getDb();
  if (db) {
    try {
      const [rows] = await db.query(
        `SELECT f.id, f.owner_id as user_id, f.name, f.location_id as location, 
                COALESCE(f.soil_type, 'Loam') as soil_type, COALESCE(f.total_area, 0) as total_area, 
                f.created_at, COUNT(fl.id) as field_count 
         FROM farms f 
         LEFT JOIN fields fl ON fl.farm_id = f.id 
         WHERE f.owner_id = ? 
         GROUP BY f.id 
         ORDER BY f.created_at DESC`,
        [userId]
      );
      if (Array.isArray(rows) && rows.length > 0) return rows as Farm[];
    } catch {
      // Fallback if schema/table not migrated yet
    }
  }
  return mockFarms;
}

export async function createFarm(userId: string, farm: { name: string; location: string; soil_type: string; total_area: number }): Promise<Farm> {
  const db = getDb();
  const id = `f-${randomUUID().slice(0, 8)}`;
  const newFarm: Farm = { id, user_id: userId, name: farm.name, location: farm.location, soil_type: farm.soil_type, total_area: farm.total_area, created_at: new Date().toISOString(), field_count: 0 };
  
  if (db) {
    try {
      await db.query("INSERT INTO farms (id, owner_id, name, soil_type, total_area) VALUES (?, ?, ?, ?, ?)", [id, userId, farm.name, farm.soil_type, farm.total_area]);
    } catch {
      // continue with local store insert
    }
  }
  mockFarms.unshift(newFarm);
  addAuditLog(userId, "Created Farm Parcel", "farms", `Created ${farm.name} (${farm.total_area} ha)`);
  return newFarm;
}

export async function getFields(userId?: string): Promise<Field[]> {
  const db = getDb();
  if (db) {
    try {
      const [rows] = await db.query(
        `SELECT fl.id, fl.farm_id, f.name as farm_name, fl.name, fl.area_hectares as area, 
                fl.current_crop_id, c.name as crop_name, fl.planting_date, 
                COALESCE(fl.soil_ph, 6.5) as soil_ph, COALESCE(fl.organic_matter, 2.5) as organic_matter, 
                COALESCE(fl.water_source, 'Rainfed') as water_source, COALESCE(fl.is_harvested, 0) as is_harvested, 
                fl.created_at 
         FROM fields fl 
         JOIN farms f ON f.id = fl.farm_id 
         LEFT JOIN crops c ON c.id = fl.current_crop_id 
         ORDER BY fl.created_at DESC`
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return (rows as Array<Record<string, unknown>>).map(r => ({
          ...r,
          is_harvested: Boolean(r.is_harvested)
        })) as Field[];
      }
    } catch {
      // Fallback
    }
  }
  return mockFields;
}

export async function createField(userId: string, data: { farm_id: string; name: string; area: number; current_crop_id?: string; crop_name?: string; planting_date: string; soil_ph: number; organic_matter: number; water_source: string }): Promise<Field> {
  const db = getDb();
  const id = `fld-${randomUUID().slice(0, 8)}`;
  const farm = mockFarms.find(f => f.id === data.farm_id) || { name: "Registered Farm" };
  const crop = mockCrops.find(c => c.id === data.current_crop_id) || { name: data.crop_name || "Custom Crop" };

  const newField: Field = {
    id,
    farm_id: data.farm_id,
    farm_name: farm.name,
    name: data.name,
    area: data.area,
    current_crop_id: data.current_crop_id || null,
    crop_name: crop.name,
    planting_date: data.planting_date,
    soil_ph: data.soil_ph,
    organic_matter: data.organic_matter,
    water_source: data.water_source,
    is_harvested: false,
    created_at: new Date().toISOString()
  };

  if (db) {
    try {
      await db.query(
        `INSERT INTO fields (id, farm_id, name, area_hectares, current_crop_id, planting_date, soil_ph, organic_matter, water_source) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.farm_id, data.name, data.area, data.current_crop_id || null, data.planting_date, data.soil_ph, data.organic_matter, data.water_source]
      );
    } catch {
      // ignore
    }
  }
  mockFields.unshift(newField);
  addAuditLog(userId, "Created Field Plot", "fields", `Added field '${data.name}' (${data.area} ha) under ${farm.name}`);
  return newField;
}

export async function toggleFieldHarvest(userId: string, fieldId: string): Promise<Field | null> {
  const field = mockFields.find(f => f.id === fieldId);
  if (!field) return null;
  field.is_harvested = !field.is_harvested;

  const db = getDb();
  if (db) {
    try {
      await db.query("UPDATE fields SET is_harvested = ? WHERE id = ?", [field.is_harvested ? 1 : 0, fieldId]);
    } catch {
      // fallback
    }
  }
  addAuditLog(userId, "Toggled Field Harvest Status", "fields", `Field '${field.name}' marked as ${field.is_harvested ? 'Harvested' : 'Active'}`);
  return field;
}

export async function getCrops(): Promise<Crop[]> {
  const db = getDb();
  if (db) {
    try {
      const [rows] = await db.query("SELECT id, name, season, ideal_ph_min, ideal_ph_max, water_requirement, growth_days, climate, companion_crops FROM crops");
      if (Array.isArray(rows) && rows.length > 0) return rows as Crop[];
    } catch {
      // fallback
    }
  }
  return mockCrops;
}

export async function getPestsDiseases(): Promise<PestDisease[]> {
  return mockPests;
}

export async function getArticles(): Promise<Article[]> {
  return mockArticles;
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  return mockRecommendations.filter(r => r.user_id === userId || true);
}

export async function saveRecommendation(userId: string, rec: Omit<Recommendation, "id" | "user_id" | "created_at">): Promise<Recommendation> {
  const id = `rec-${randomUUID().slice(0, 8)}`;
  const cleanOutputText = rec.output_text ? rec.output_text.replace(/\*/g, "") : "";
  const newRec: Recommendation = {
    ...rec,
    output_text: cleanOutputText,
    id,
    user_id: userId,
    created_at: new Date().toISOString()
  };
  mockRecommendations.unshift(newRec);
  addAuditLog(userId, "Generated Decision Support Advisory", "recommendations", `Generated ${rec.type} advice for field '${rec.field_name || rec.field_id}'`);
  return newRec;
}

export async function getConsultations(): Promise<Consultation[]> {
  return mockConsultations;
}

export async function createConsultation(userId: string, userName: string, data: { crop_name: string; subject: string; description: string; image_url?: string }): Promise<Consultation> {
  const id = `con-${randomUUID().slice(0, 8)}`;
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
    replies: [
      {
        id: `rep-${randomUUID().slice(0, 8)}`,
        consultation_id: id,
        sender_id: userId,
        sender_name: userName,
        sender_role: "farmer",
        message: data.description,
        created_at: new Date().toISOString()
      }
    ]
  };
  mockConsultations.unshift(newCon);
  addAuditLog(userId, "Submitted Expert Inquiry", "consultations", `Submitted consultation subject: '${data.subject}'`);
  return newCon;
}

export async function addConsultationReply(userId: string, userName: string, userRole: string, consultationId: string, message: string): Promise<ConsultationReply | null> {
  const con = mockConsultations.find(c => c.id === consultationId);
  if (!con) return null;

  const reply: ConsultationReply = {
    id: `rep-${randomUUID().slice(0, 8)}`,
    consultation_id: consultationId,
    sender_id: userId,
    sender_name: userName,
    sender_role: userRole,
    message,
    created_at: new Date().toISOString()
  };

  con.replies ??= [];
  con.replies.push(reply);

  if (userRole === "researcher" || userRole === "admin") {
    con.status = "Answered";
    con.researcher_id = userId;
    con.researcher_name = userName;
  }

  addAuditLog(userId, "Replied to Consultation Thread", "consultation_replies", `Replied to inquiry #${consultationId.slice(0, 6)}`);
  return reply;
}

export async function getPublications(): Promise<ResearchPublication[]> {
  return mockPublications;
}

export async function createPublication(userId: string, userName: string, data: { title: string; abstract: string; pdf_url: string; crop_type: string; soil_type: string }): Promise<ResearchPublication> {
  const id = `pub-${randomUUID().slice(0, 8)}`;
  const pub: ResearchPublication = {
    id,
    researcher_id: userId,
    researcher_name: userName,
    title: data.title,
    abstract: data.abstract,
    pdf_url: data.pdf_url || "#",
    crop_type: data.crop_type,
    soil_type: data.soil_type,
    publication_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString()
  };
  mockPublications.unshift(pub);
  addAuditLog(userId, "Published Research Paper", "research_publications", `Published paper: '${data.title}'`);
  return pub;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return mockAuditLogs;
}

export function addAuditLog(userId: string | null, action: string, target_table: string, details: string, ip = "127.0.0.1", device = "Browser Client") {
  const log: AuditLog = {
    id: `aud-${randomUUID().slice(0, 8)}`,
    user_id: userId,
    user_name: userId === "admin-1" ? "System Admin" : "Active User",
    user_email: "user@agrikms.org",
    action,
    target_table,
    details,
    ip_address: ip,
    device_info: device,
    created_at: new Date().toISOString()
  };
  mockAuditLogs.unshift(log);
}

export async function getCropAdvisorAnalyses(userId: string): Promise<CropAdvisorAnalysis[]> {
  let dbAnalyses: CropAdvisorAnalysis[] = [];
  const db = getDb();

  if (db) {
    try {
      const [rows] = await db.query(
        `SELECT id, user_id, image_name, location_name, latitude, longitude,
                image_observations, internal_research, web_research, environmental_data,
                recommendations, less_suitable, confidence_score, missing_information, created_at
         FROM crop_advisor_analyses
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
      );
      if (Array.isArray(rows)) {
        dbAnalyses = (rows as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id),
          user_id: String(r.user_id),
          image_name: (r.image_name as string) || undefined,
          location_name: (r.location_name as string) || undefined,
          latitude: typeof r.latitude === "number" ? r.latitude : undefined,
          longitude: typeof r.longitude === "number" ? r.longitude : undefined,
          image_observations: typeof r.image_observations === "string" ? JSON.parse(r.image_observations) : r.image_observations,
          internal_research: typeof r.internal_research === "string" ? JSON.parse(r.internal_research) : r.internal_research,
          web_research: typeof r.web_research === "string" ? JSON.parse(r.web_research) : r.web_research,
          environmental_data: typeof r.environmental_data === "string" ? JSON.parse(r.environmental_data) : r.environmental_data,
          recommendations: typeof r.recommendations === "string" ? JSON.parse(r.recommendations) : r.recommendations,
          less_suitable: typeof r.less_suitable === "string" ? JSON.parse(r.less_suitable) : r.less_suitable,
          confidence_score: typeof r.confidence_score === "string" ? JSON.parse(r.confidence_score) : r.confidence_score,
          missing_information: typeof r.missing_information === "string" ? JSON.parse(r.missing_information) : r.missing_information,
          created_at: String(r.created_at),
        })) as CropAdvisorAnalysis[];
      }
    } catch {
      // Ignore DB query errors and rely on memory store
    }
  }

  const memoryAnalyses = mockCropAdvisorAnalyses.filter((a) => a.user_id === userId);
  
  // Combine DB and memory store items, avoiding duplicates
  const allAnalysesMap = new Map<string, CropAdvisorAnalysis>();
  for (const item of memoryAnalyses) {
    allAnalysesMap.set(item.id, item);
  }
  for (const item of dbAnalyses) {
    allAnalysesMap.set(item.id, item);
  }

  return Array.from(allAnalysesMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function saveCropAdvisorAnalysis(
  userId: string,
  analysisData: Omit<CropAdvisorAnalysis, "id" | "user_id" | "created_at">
): Promise<CropAdvisorAnalysis> {
  const id = `caa-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const analysis: CropAdvisorAnalysis = {
    ...analysisData,
    id,
    user_id: userId,
    created_at: now,
  };

  const db = getDb();
  if (db) {
    try {
      await db.query(
        `INSERT INTO crop_advisor_analyses (
          id, user_id, image_name, location_name, latitude, longitude,
          image_observations, internal_research, web_research, environmental_data,
          recommendations, less_suitable, confidence_score, missing_information, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          analysisData.image_name || null,
          analysisData.location_name || null,
          analysisData.latitude || null,
          analysisData.longitude || null,
          JSON.stringify(analysisData.image_observations),
          JSON.stringify(analysisData.internal_research),
          JSON.stringify(analysisData.web_research),
          JSON.stringify(analysisData.environmental_data),
          JSON.stringify(analysisData.recommendations),
          JSON.stringify(analysisData.less_suitable),
          JSON.stringify(analysisData.confidence_score),
          JSON.stringify(analysisData.missing_information),
          now,
        ]
      );
    } catch (err) {
      console.warn("MySQL insert fallback for Crop Advisor Analysis:", err);
    }
  }

  mockCropAdvisorAnalyses.unshift(analysis);
  addAuditLog(userId, "Performed Crop Advisor Soil Analysis", "crop_advisor_analyses", `Analyzed land image for location: '${analysisData.location_name || "Unknown Location"}' (ID: ${id})`);
  return analysis;
}

export async function deleteCropAdvisorAnalysis(userId: string, analysisId: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db.query(`DELETE FROM crop_advisor_analyses WHERE id = ? AND user_id = ?`, [analysisId, userId]);
    } catch {
      // Fallback
    }
  }

  const idx = mockCropAdvisorAnalyses.findIndex((a) => a.id === analysisId && a.user_id === userId);
  if (idx !== -1) {
    mockCropAdvisorAnalyses.splice(idx, 1);
  }
  return true;
}


