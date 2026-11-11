import { requireResearcher } from "@/lib/auth/authorization";
import {
  addAuditLog,
  createArticle,
  createPestDisease,
  deleteResearcherArticle,
  deleteResearcherPestDisease,
  getCrops,
  updateResearcherArticle,
  updateResearcherPestDisease,
  type ArticleInput,
  type PestDiseaseInput,
} from "@/lib/db/repository";
import { serializeGuideSteps } from "@/lib/knowledge/guide-content";
import { NextResponse } from "next/server";

type KnowledgeSubmission = Record<string, unknown>;

async function readJson(request: Request): Promise<KnowledgeSubmission | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
    return body as KnowledgeSubmission;
  } catch {
    return null;
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const access = await requireResearcher();
  if (access.response) return access.response;

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });

  if (body.kind === "pest") {
    const name = text(body.name);
    const type = text(body.type);
    const symptoms = text(body.symptoms);
    const prevention = text(body.prevention);
    const treatment = text(body.treatment);
    const cropId = text(body.crop_id);

    if (!name || !symptoms || !prevention || !treatment) {
      return NextResponse.json(
        { error: "Name, symptoms, prevention, and treatment are required." },
        { status: 400 }
      );
    }
    if (name.length > 160 || !type || type.length > 80) {
      return NextResponse.json(
        { error: "Provide a valid name and a classification of 80 characters or fewer." },
        { status: 400 }
      );
    }
    if ([symptoms, prevention, treatment].some((value) => value.length > 65535)) {
      return NextResponse.json({ error: "Pest and disease descriptions must be 65,535 characters or fewer." }, { status: 400 });
    }
    if (cropId && !/^\d+$/.test(cropId)) {
      return NextResponse.json({ error: "Choose a valid crop or select All Crops." }, { status: 400 });
    }

    const pest: PestDiseaseInput = {
      name,
      type: type as PestDiseaseInput["type"],
      crop_id: cropId || null,
      symptoms,
      prevention,
      treatment,
    };

    try {
      if (pest.crop_id && !(await getCrops()).some((crop) => crop.id === pest.crop_id)) {
        return NextResponse.json({ error: "The selected crop could not be found." }, { status: 400 });
      }
      const approvalStatus = access.user.role === "admin" ? "approved" : "pending";
      await createPestDisease(pest, access.user.id, approvalStatus);
      await addAuditLog(
        access.user.id,
        approvalStatus === "approved" ? "Published Pest and Disease Entry" : "Submitted Pest and Disease Entry for Approval",
        "pests_diseases",
        approvalStatus === "approved" ? `Published '${pest.name}'` : `Submitted '${pest.name}' for approval`
      );
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      console.error("Pest and disease entry creation failed:", error);
      return NextResponse.json({ error: "Unable to save the pest or disease entry." }, { status: 500 });
    }
  }

  if (body.kind === "guide" || body.kind === "article") {
    const isGuide = body.kind === "guide";
    const title = text(body.title);
    const topic = text(body.category);
    const summary = text(body.summary);
    const steps = isGuide && Array.isArray(body.steps) ? body.steps.map((step) => text(step)) : [];
    const evidenceNote = text(body.evidence_note);
    const sourceUrl = text(body.source_url);
    const content = isGuide ? serializeGuideSteps(steps) : text(body.body);
    const category = `${isGuide ? "Guide" : "Article"}: ${topic}`;

    if (!title || !topic || !summary || !content || (isGuide && (steps.length === 0 || steps.some((step) => !step)))) {
      return NextResponse.json(
        {
          error: isGuide
            ? "Guide title, topic, overview, and at least one complete step are required."
            : "Article title, topic, summary, and content are required.",
        },
        { status: 400 }
      );
    }
    if (isGuide && (steps.length > 20 || steps.some((step) => step.length > 4000))) {
      return NextResponse.json(
        { error: "Guides can contain up to 20 steps, with no more than 4,000 characters per step." },
        { status: 400 }
      );
    }
    if (title.length > 255 || category.length > 100 || sourceUrl.length > 1000) {
      return NextResponse.json(
        { error: "Title, topic, or source URL exceeds the allowed length." },
        { status: 400 }
      );
    }
    if (summary.length > 65535 || evidenceNote.length > 65535 || content.length > 100000) {
      return NextResponse.json({ error: "One or more article fields exceed the allowed length." }, { status: 400 });
    }
    if (!validHttpUrl(sourceUrl)) {
      return NextResponse.json({ error: "Source URL must be a valid HTTP or HTTPS link." }, { status: 400 });
    }

    const article: ArticleInput = {
      title,
      category,
      summary,
      body: content,
      evidence_note: evidenceNote,
      source_url: sourceUrl,
      published: true,
    };

    try {
      const approvalStatus = access.user.role === "admin" ? "approved" : "pending";
      await createArticle(access.user.id, article, approvalStatus);
      await addAuditLog(
        access.user.id,
        approvalStatus === "approved"
          ? isGuide ? "Published Farming Guide" : "Published Knowledge Article"
          : isGuide ? "Submitted Farming Guide for Approval" : "Submitted Knowledge Article for Approval",
        "knowledge_articles",
        approvalStatus === "approved"
          ? `Published ${isGuide ? "guide" : "article"} '${article.title}'`
          : `Submitted ${isGuide ? "guide" : "article"} '${article.title}' for approval`
      );
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      console.error(`${isGuide ? "Farming guide" : "Knowledge article"} creation failed:`, error);
      return NextResponse.json(
        { error: `Unable to save the ${isGuide ? "farming guide" : "knowledge article"}.` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Choose a pest or guide entry type." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const access = await requireResearcher();
  if (access.response) return access.response;

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  const id = text(body.id);
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A valid knowledge entry ID is required." }, { status: 400 });
  }

  if (body.kind === "pest") {
    const name = text(body.name);
    const type = text(body.type);
    const symptoms = text(body.symptoms);
    const prevention = text(body.prevention);
    const treatment = text(body.treatment);
    const cropId = text(body.crop_id);
    if (!name || name.length > 160 || !type || type.length > 80 || !symptoms || !prevention || !treatment) {
      return NextResponse.json({ error: "Provide a valid name, type, symptoms, prevention, and treatment." }, { status: 400 });
    }
    if ([symptoms, prevention, treatment].some((value) => value.length > 65535)) {
      return NextResponse.json({ error: "Pest and disease descriptions must be 65,535 characters or fewer." }, { status: 400 });
    }
    if (cropId && !/^\d+$/.test(cropId)) {
      return NextResponse.json({ error: "Choose a valid crop or select All Crops." }, { status: 400 });
    }

    try {
      if (cropId && !(await getCrops()).some((crop) => crop.id === cropId)) {
        return NextResponse.json({ error: "The selected crop could not be found." }, { status: 400 });
      }
      const updated = await updateResearcherPestDisease(id, access.user.id, {
        name,
        type,
        crop_id: cropId || null,
        symptoms,
        prevention,
        treatment,
      });
      if (!updated) return NextResponse.json({ error: "Entry not found or you do not own it." }, { status: 404 });
      await addAuditLog(access.user.id, "Resubmitted Pest and Disease Entry", "pests_diseases", `Resubmitted '${name}' for approval`);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Pest and disease entry update failed:", error);
      return NextResponse.json({ error: "Unable to update the pest or disease entry." }, { status: 500 });
    }
  }

  if (body.kind === "guide" || body.kind === "article") {
    const isGuide = body.kind === "guide";
    const title = text(body.title);
    const topic = text(body.category).replace(/^(Guide|Article):\s*/, "");
    const summary = text(body.summary);
    const steps = isGuide && Array.isArray(body.steps) ? body.steps.map((step) => text(step)) : [];
    const evidenceNote = text(body.evidence_note);
    const sourceUrl = text(body.source_url);
    const content = isGuide ? serializeGuideSteps(steps) : text(body.body);
    const category = `${isGuide ? "Guide" : "Article"}: ${topic}`;

    if (!title || !topic || !summary || !content || (isGuide && (steps.length === 0 || steps.some((step) => !step)))) {
      return NextResponse.json(
        { error: isGuide ? "Provide a title, topic, overview, and at least one complete step." : "Provide a title, topic, summary, and content." },
        { status: 400 }
      );
    }
    if (isGuide && (steps.length > 20 || steps.some((step) => step.length > 4000))) {
      return NextResponse.json({ error: "Guides can contain up to 20 steps, with no more than 4,000 characters per step." }, { status: 400 });
    }
    if (title.length > 255 || category.length > 100 || sourceUrl.length > 1000) {
      return NextResponse.json({ error: "Title, topic, or source URL exceeds the allowed length." }, { status: 400 });
    }
    if (summary.length > 65535 || evidenceNote.length > 65535 || content.length > 100000) {
      return NextResponse.json({ error: "One or more knowledge entry fields exceed the allowed length." }, { status: 400 });
    }
    if (!validHttpUrl(sourceUrl)) {
      return NextResponse.json({ error: "Source URL must be a valid HTTP or HTTPS link." }, { status: 400 });
    }

    try {
      const updated = await updateResearcherArticle(id, access.user.id, {
        title,
        category,
        summary,
        body: content,
        evidence_note: evidenceNote,
        source_url: sourceUrl,
        published: true,
      });
      if (!updated) return NextResponse.json({ error: "Entry not found or you do not own it." }, { status: 404 });
      await addAuditLog(
        access.user.id,
        isGuide ? "Resubmitted Farming Guide" : "Resubmitted Knowledge Article",
        "knowledge_articles",
        `Resubmitted ${isGuide ? "guide" : "article"} '${title}' for approval`
      );
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Knowledge entry update failed:", error);
      return NextResponse.json({ error: "Unable to update the knowledge entry." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Choose a pest, guide, or article entry type." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const access = await requireResearcher();
  if (access.response) return access.response;

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  const id = text(body.id);
  const kind = body.kind;
  if (!/^\d+$/.test(id) || (kind !== "pest" && kind !== "guide" && kind !== "article")) {
    return NextResponse.json({ error: "Provide a valid knowledge entry ID and type." }, { status: 400 });
  }

  try {
    const deleted = kind === "pest"
      ? await deleteResearcherPestDisease(id, access.user.id)
      : await deleteResearcherArticle(id, access.user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Knowledge entry not found or you do not own it." }, { status: 404 });
    }

    const label = kind === "pest" ? "Pest and Disease Entry" : kind === "guide" ? "Farming Guide" : "Knowledge Article";
    await addAuditLog(access.user.id, `Deleted ${label}`, kind === "pest" ? "pests_diseases" : "knowledge_articles", `Deleted ${kind} #${id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Researcher knowledge entry deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the knowledge entry." }, { status: 500 });
  }
}
