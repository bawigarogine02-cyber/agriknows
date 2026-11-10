export type CropItem = {
  id: string;
  name: string;
  season: string;
  category: string;
  type?: string;
  ideal_ph_min: number;
  ideal_ph_max: number;
  water_requirement: string;
  growth_days: number;
  climate: string;
  companion_crops: string;
  detail?: string;
  soil?: string;
};
