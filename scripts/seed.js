import mysql from "mysql2/promise";

async function run() {
  const conn = process.env.DATABASE_URL
    ? await mysql.createConnection(process.env.DATABASE_URL)
    : await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "farm_reports",
        port: Number(process.env.DB_PORT || 3306),
      });

  console.log("Connected to MySQL database. Applying schema updates...");
  try {
    await conn.query("ALTER TABLE users MODIFY COLUMN role ENUM('farmer', 'researcher', 'admin', 'user') NOT NULL DEFAULT 'farmer'");
  } catch (e) {
    console.log("Modify role enum step 1 info:", e.message);
  }

  await conn.query("UPDATE users SET role = 'farmer' WHERE role = 'user' OR role NOT IN ('farmer', 'researcher', 'admin')");
  await conn.query("ALTER TABLE users MODIFY COLUMN role ENUM('farmer', 'researcher', 'admin') NOT NULL DEFAULT 'farmer'");

  try {
    await conn.query("ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL AFTER status");
  } catch (e) {
    console.log("Address column info:", e.message);
  }

  // Seed initial crops in DB if crops table is empty
  const [cropRows] = await conn.query("SELECT COUNT(*) as cnt FROM crops");
  if (cropRows[0].cnt === 0) {
    console.log("Seeding initial crops into crops table...");
    const initialCrops = [
      { id: "c-1", name: "Maize (Corn)", season: "Wet Season", ideal_ph_min: 5.8, ideal_ph_max: 7.0, water_requirement: "500 - 800 mm", growth_days: 110, climate: "Warm Subtropical / Tropical", companion_crops: "Beans, Squash, Cowpeas" },
      { id: "c-2", name: "Rice (Paddy)", season: "Wet Season", ideal_ph_min: 5.5, ideal_ph_max: 6.8, water_requirement: "1200 - 1600 mm", growth_days: 130, climate: "Humid Tropical", companion_crops: "Duckweed, Azolla" },
      { id: "c-3", name: "Wheat", season: "Dry / Cool Season", ideal_ph_min: 6.0, ideal_ph_max: 7.2, water_requirement: "450 - 650 mm", growth_days: 120, climate: "Cool Temperate", companion_crops: "Clover, Peas" },
      { id: "c-4", name: "Soybean", season: "Wet Season", ideal_ph_min: 6.0, ideal_ph_max: 7.0, water_requirement: "450 - 700 mm", growth_days: 100, climate: "Warm Temperate", companion_crops: "Corn, Sorghum" },
      { id: "c-5", name: "Cassava", season: "Year-Round", ideal_ph_min: 5.5, ideal_ph_max: 6.5, water_requirement: "300 - 500 mm", growth_days: 270, climate: "Hot Tropical", companion_crops: "Peanuts, Melon" },
      { id: "c-6", name: "Tomato", season: "Dry / Controlled", ideal_ph_min: 6.0, ideal_ph_max: 6.8, water_requirement: "400 - 600 mm", growth_days: 85, climate: "Warm Subtropical", companion_crops: "Basil, Marigold" }
    ];
    for (const c of initialCrops) {
      await conn.query(
        "INSERT INTO crops (id, name, season, ideal_ph_min, ideal_ph_max, water_requirement, growth_days, climate, companion_crops) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [c.id, c.name, c.season, c.ideal_ph_min, c.ideal_ph_max, c.water_requirement, c.growth_days, c.climate, c.companion_crops]
      );
    }
    console.log("Crops seeded successfully!");
  }

  const [allCrops] = await conn.query("SELECT id, name, season FROM crops");
  console.log(`Crop catalog contains ${allCrops.length} database records.`);

  await conn.end();
}

run().catch(console.error);
