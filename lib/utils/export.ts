export type ExportableRecommendation = {
  name: string;
  plantType?: string;
  soilSuitability?: string;
  score: number;
  confidence: string;
  explanation: string;
  factors?: string[];
  risks?: string[];
  considerations?: string | string[];
  resilience?: string;
  guideSteps?: string[];
  guideSource?: string;
  evidenceNote?: string;
  nextSteps?: string[];
  referenceUrl?: string;
  imageUrl?: string;
};

export type ExportableAnalysis = {
  id: string;
  latitude: number;
  longitude: number;
  locationName?: string | null;
  weather?: Record<string, unknown>;
  soil?: { status?: string };
  recommendations: ExportableRecommendation[];
  aiObservation?: string;
  hazards?: string[];
  createdAt: string;
};

export function exportToCSV(analysis: ExportableAnalysis) {
  const sanitize = (text: string | number | null | undefined) => {
    if (text === null || text === undefined) return '""';
    const str = String(text).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    "Rank",
    "Crop Name",
    "Plant Type",
    "Suitability Score",
    "Confidence Level",
    "Why It Fits",
    "Land & Soil Compatibility",
    "Watch Risks",
    "Next Steps",
    "Planting Guide FAQ Steps",
    "Evidence Note",
    "Extension Source Link",
  ];

  const rows = (analysis.recommendations ?? []).map((crop, index) => [
    index + 1,
    crop.name,
    crop.plantType ?? "Agricultural Crop",
    `${crop.score}/100`,
    crop.confidence,
    crop.explanation,
    crop.soilSuitability ?? "",
    Array.isArray(crop.risks) ? crop.risks.join(" ") : String(crop.risks ?? ""),
    Array.isArray(crop.nextSteps) ? crop.nextSteps.join(" ; ") : String(crop.nextSteps ?? ""),
    Array.isArray(crop.guideSteps) ? crop.guideSteps.map((s, i) => `${i + 1}. ${s}`).join(" | ") : "",
    crop.evidenceNote ?? "",
    crop.guideSource ?? "",
  ]);

  const csvContent = [
    `"Agricultural Crop Recommendations Report"`,
    `"Location: ${analysis.locationName || "Confirmed Coordinates"}"`,
    `"GPS Coordinates: ${analysis.latitude}, ${analysis.longitude}"`,
    `"Date Generated: ${new Date(analysis.createdAt).toLocaleString()}"`,
    "",
    headers.map(sanitize).join(","),
    ...rows.map((row) => row.map(sanitize).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `crop_recommendations_${(analysis.locationName || "field").replace(/[^a-zA-Z0-9]/g, "_")}_${analysis.id.slice(0, 8)}.csv`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToDOCX(analysis: ExportableAnalysis) {
  const sanitizeHtml = (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const recommendationsHtml = (analysis.recommendations ?? []).map((crop, index) => `
    <div style="background-color: #f8faf7; border: 1px solid #dce5d7; padding: 14px; margin-bottom: 16px; border-radius: 8px;">
      <h3 style="color: #2d5a27; margin-top: 0; font-size: 14pt;">
        #${index + 1} ${sanitizeHtml(crop.name)} 
        ${crop.plantType ? `<span style="background-color: #e8f2e3; color: #2d5a27; font-size: 9pt; padding: 2px 6px; border-radius: 4px;">🌱 ${sanitizeHtml(crop.plantType)}</span>` : ""}
      </h3>
      <p><strong>Suitability Score:</strong> <span style="color: #2d5a27; font-size: 14pt; font-weight: bold;">${crop.score}/100</span> (${sanitizeHtml(crop.confidence)} confidence)</p>
      <p><strong>Why it fits:</strong> ${sanitizeHtml(crop.explanation)}</p>
      ${crop.soilSuitability ? `<p style="background-color: #eef6ec; padding: 8px; border-left: 4px solid #2d5a27;"><strong>🌾 Land &amp; Soil Compatibility:</strong> ${sanitizeHtml(crop.soilSuitability)}</p>` : ""}
      ${crop.risks && crop.risks.length > 0 ? `<p><strong>Watch Risks:</strong> ${sanitizeHtml(Array.isArray(crop.risks) ? crop.risks.join(" ") : String(crop.risks))}</p>` : ""}
      ${crop.nextSteps && crop.nextSteps.length > 0 ? `<p><strong>Next Steps:</strong> ${sanitizeHtml(Array.isArray(crop.nextSteps) ? crop.nextSteps.join(" · ") : String(crop.nextSteps))}</p>` : ""}
      
      <div style="background-color: #ffffff; border: 1px solid #e1e8de; padding: 10px; margin-top: 10px; border-radius: 6px;">
        <h4 style="color: #2d5a27; margin-top: 0; margin-bottom: 6px;">FAQ: What is the best way to plant ${sanitizeHtml(crop.name)}?</h4>
        ${crop.guideSteps && crop.guideSteps.length > 0 ? `<ol>${crop.guideSteps.map((step) => `<li>${sanitizeHtml(step)}</li>`).join("")}</ol>` : ""}
        ${crop.evidenceNote ? `<p style="font-size: 9pt; color: #745f22; background-color: #fff8df; padding: 6px;"><strong>Evidence Note:</strong> ${sanitizeHtml(crop.evidenceNote)}</p>` : ""}
        ${crop.guideSource ? `<p style="font-size: 9pt;"><a href="${crop.guideSource}">View Extension Planting Guide</a></p>` : ""}
      </div>
    </div>
  `).join("");

  const docxContent = `
    <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Crop Recommendations Report</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1a201a; line-height: 1.5; margin: 30px; }
        h1 { color: #2d5a27; font-size: 20pt; border-bottom: 2px solid #2d5a27; padding-bottom: 6px; }
        h2 { color: #9a621e; font-size: 14pt; margin-top: 20px; }
        .meta-box { background-color: #f3faef; border: 1px solid #bed5b9; padding: 12px; margin-bottom: 20px; border-radius: 6px; }
      </style>
    </head>
    <body>
      <h1>AgriKMS — Recommended Plants & Field Analysis Report</h1>
      <div class="meta-box">
        <p><strong>Location:</strong> ${sanitizeHtml(analysis.locationName || "Confirmed Coordinates")}</p>
        <p><strong>GPS Coordinates:</strong> ${analysis.latitude.toFixed(6)}, ${analysis.longitude.toFixed(6)}</p>
        <p><strong>Date Generated:</strong> ${new Date(analysis.createdAt).toLocaleString()}</p>
      </div>

      ${analysis.aiObservation ? `<div style="background-color: #edf6e9; padding: 12px; margin-bottom: 20px;"><strong>AI Field Visual Notes:</strong> ${sanitizeHtml(analysis.aiObservation)}</div>` : ""}

      <h2>Recommended Crops Shortlist (${analysis.recommendations?.length ?? 0} Species)</h2>
      ${recommendationsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + docxContent], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `crop_recommendations_${(analysis.locationName || "field").replace(/[^a-zA-Z0-9]/g, "_")}_${analysis.id.slice(0, 8)}.docx`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(analysis: ExportableAnalysis) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate and download the PDF report.");
    return;
  }

  const recommendationsHtml = (analysis.recommendations ?? []).map((crop, index) => `
    <div style="background: #ffffff; border: 1px solid #dce5d7; padding: 16px; margin-bottom: 16px; border-radius: 10px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #9a621e;">#${index + 1} Recommendation</span>
          <h3 style="font-size: 18px; font-weight: bold; color: #1a201a; margin: 4px 0;">${crop.name}</h3>
          ${crop.plantType ? `<span style="background: #e8f2e3; color: #2d5a27; font-weight: bold; font-size: 11px; padding: 3px 8px; border-radius: 4px;">🌱 ${crop.plantType}</span>` : ""}
        </div>
        <div style="text-align: right;">
          <span style="font-size: 26px; font-weight: bold; color: #2d5a27;">${crop.score}<span style="font-size: 13px;">/100</span></span>
          <br><span style="font-size: 11px; color: #657365;">${crop.confidence} confidence</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #445044; margin-top: 12px; line-height: 1.5;"><strong>Why it fits:</strong> ${crop.explanation}</p>
      
      ${crop.soilSuitability ? `<div style="background: #f2f7f0; border-left: 4px solid #2d5a27; padding: 10px; margin-top: 10px; font-size: 12px; color: #2d4d2b; border-radius: 4px;"><strong>🌾 Land &amp; Soil Compatibility:</strong> ${crop.soilSuitability}</div>` : ""}

      ${crop.risks && crop.risks.length > 0 ? `<p style="font-size: 12px; color: #586459; margin-top: 8px;"><strong>Watch:</strong> ${Array.isArray(crop.risks) ? crop.risks.join(" ") : crop.risks}</p>` : ""}
      ${crop.nextSteps && crop.nextSteps.length > 0 ? `<p style="font-size: 12px; color: #586459; margin-top: 4px;"><strong>Next steps:</strong> ${Array.isArray(crop.nextSteps) ? crop.nextSteps.join(" · ") : crop.nextSteps}</p>` : ""}

      <div style="background: #f9f9f6; border: 1px solid #e4ebe1; padding: 12px; margin-top: 12px; border-radius: 8px;">
        <h4 style="font-size: 13px; font-weight: bold; color: #2d5a27; margin: 0 0 8px 0;">FAQ: What is the best way to plant ${crop.name}?</h4>
        ${crop.guideSteps && crop.guideSteps.length > 0 ? `<ol style="font-size: 12px; color: #445044; padding-left: 20px; margin: 0;">${crop.guideSteps.map((step) => `<li style="margin-bottom: 4px;">${step}</li>`).join("")}</ol>` : ""}
        ${crop.evidenceNote ? `<p style="font-size: 11px; color: #745f22; background: #fff8df; padding: 8px; margin-top: 8px; border-radius: 4px;"><strong>Evidence Note:</strong> ${crop.evidenceNote}</p>` : ""}
      </div>
    </div>
  `).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Crop Recommendations PDF Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1a201a; padding: 30px; margin: 0; }
        header { border-bottom: 3px solid #2d5a27; padding-bottom: 12px; margin-bottom: 20px; }
        .logo { font-size: 22px; font-weight: bold; color: #2d5a27; }
        .subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #9a621e; margin-bottom: 4px; }
        .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f5f8f3; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #2d5a27; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer;">Save / Print as PDF</button>
      </div>
      <header>
        <div class="subtitle">AgriKMS — Field Intelligence</div>
        <div class="logo">Recommended Plants & Agronomic Guidance Report</div>
      </header>

      <div class="meta-grid">
        <div><strong>Location:</strong><br>${analysis.locationName || "Confirmed Location"}</div>
        <div><strong>Coordinates:</strong><br>${analysis.latitude.toFixed(6)}, ${analysis.longitude.toFixed(6)}</div>
        <div><strong>Date:</strong><br>${new Date(analysis.createdAt).toLocaleString()}</div>
      </div>

      ${analysis.aiObservation ? `<div style="background: #edf6e9; border-left: 4px solid #2d5a27; padding: 12px; font-size: 12px; margin-bottom: 20px;"><strong>AI Field Notes:</strong> ${analysis.aiObservation}</div>` : ""}

      <h2 style="font-size: 16px; color: #2d5a27; margin-bottom: 14px;">Shortlist of Recommended Plants (${analysis.recommendations?.length ?? 0})</h2>
      ${recommendationsHtml}

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
