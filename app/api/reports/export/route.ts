import { getSession } from "@/lib/auth/session";
import { getFields, getRecommendations } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const [fields, recommendations] = await Promise.all([
    getFields(session.id),
    getRecommendations(session.id)
  ]);

  const params = new URL(request.url).searchParams;
  const days = params.get("days") || "30";
  const type = params.get("type") || "all";
  const crop = params.get("crop") || "all";
  const allowedDays = ["30", "90", "365", "all"];
  const allowedTypes = ["all", "fertilizer", "irrigation", "general"];
  if (!allowedDays.includes(days) || !allowedTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid report filter." }, { status: 400 });
  }
  const cutoff = days === "all" ? null : Date.now() - Number(days) * 24 * 60 * 60 * 1000;
  const filteredRecommendations = recommendations.filter((recommendation) =>
    (type === "all" || recommendation.type === type) &&
    (crop === "all" || recommendation.crop_name === crop) &&
    (cutoff === null || new Date(recommendation.created_at).getTime() >= cutoff)
  );
  const csvCell = (value: string | number | null | undefined) => {
    const text = String(value ?? "");
    const safeText = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  };

  const csvRows: string[] = [];
  csvRows.push(["Field Name", "Crop Name", "Advisory Type", "Growth Stage", "Soil pH", "Organic Matter %", "Rule Applied", "Advisory Output", "Date Generated"].map(csvCell).join(","));

  filteredRecommendations.forEach((r) => {
    const field = fields.find((f) => f.id === r.field_id);
    const row = [
      r.field_name || field?.name,
      r.crop_name || field?.crop_name,
      r.type,
      r.crop_stage,
      field?.soil_ph,
      field?.organic_matter,
      r.rule_applied,
      r.output_text,
      new Date(r.created_at).toISOString(),
    ].map(csvCell);
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
