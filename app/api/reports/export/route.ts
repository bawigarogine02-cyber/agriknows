import { getSession } from "@/lib/auth/session";
import { getFields, getRecommendations } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const [fields, recommendations] = await Promise.all([
    getFields(session.id),
    getRecommendations(session.id)
  ]);

  // Build CSV headers and row rows
  const csvRows: string[] = [];
  csvRows.push(["Field Name", "Crop Name", "Advisory Type", "Growth Stage", "Soil pH", "Organic Matter %", "Rule Applied", "Advisory Output", "Date Generated"].join(","));

  recommendations.forEach((r) => {
    const field = fields.find((f) => f.id === r.field_id);
    const row = [
      `"${r.field_name || field?.name || "Field Plot"}"`,
      `"${r.crop_name || field?.crop_name || "Crop"}"`,
      `"${r.type}"`,
      `"${r.crop_stage || "N/A"}"`,
      `"${field?.soil_ph || 6.5}"`,
      `"${field?.organic_matter || 3.0}"`,
      `"${r.rule_applied || "Agronomic Rule"}"`,
      `"${r.output_text.replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleDateString()}"`
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="AgriKMS_System_Report_${new Date().toISOString().split("T")[0]}.csv"`
    }
  });
}
