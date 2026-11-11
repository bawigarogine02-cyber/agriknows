import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  addAuditLog,
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
  type ArticleInput,
} from "@/lib/db/repository";

function parseArticle(body: Record<string, unknown>): ArticleInput | string {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const content = typeof body.body === "string" ? body.body.trim() : "";
  const evidenceNote = typeof body.evidence_note === "string" ? body.evidence_note.trim() : "";
  const sourceUrl = typeof body.source_url === "string" ? body.source_url.trim() : "";

  if (!title || !category || !summary || !content) {
    return "Title, category, summary, and article body are required.";
  }
  if (title.length > 255 || category.length > 100 || sourceUrl.length > 1000) {
    return "Title, category, or source URL exceeds the allowed length.";
  }
  if (summary.length > 65535 || evidenceNote.length > 65535) {
    return "Summary or evidence note is too long.";
  }
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Source URL must use HTTP or HTTPS.";
      }
    } catch {
      return "Enter a valid source URL.";
    }
  }
  if (typeof body.published !== "boolean") {
    return "Choose whether the article should be published.";
  }

  return {
    title,
    category,
    summary,
    body: content,
    evidence_note: evidenceNote,
    source_url: sourceUrl,
    published: body.published,
  };
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    return NextResponse.json({ articles: await getArticles(true, { includePending: true }) });
  } catch (error) {
    console.error("Knowledge articles could not be loaded:", error);
    return NextResponse.json({ error: "Unable to load knowledge articles." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  const article = parseArticle(body);
  if (typeof article === "string") {
    return NextResponse.json({ error: article }, { status: 400 });
  }

  try {
    await createArticle(access.user.id, article, article.published ? "approved" : "pending");
    await addAuditLog(
      access.user.id,
      article.published ? "Published Knowledge Article" : "Created Knowledge Article",
      "knowledge_articles",
      `${article.published ? "Published" : "Created draft"} article '${article.title}'`
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Knowledge article creation failed:", error);
    return NextResponse.json({ error: "Unable to save the knowledge article." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A valid article ID is required." }, { status: 400 });
  }
  const article = parseArticle(body);
  if (typeof article === "string") {
    return NextResponse.json({ error: article }, { status: 400 });
  }

  try {
    if (!(await updateArticle(id, article))) {
      return NextResponse.json({ error: "Knowledge article not found." }, { status: 404 });
    }
    await addAuditLog(
      access.user.id,
      article.published ? "Updated Knowledge Article" : "Unpublished Knowledge Article",
      "knowledge_articles",
      `${article.published ? "Updated" : "Unpublished"} article '${article.title}'`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Knowledge article update failed:", error);
    return NextResponse.json({ error: "Unable to update the knowledge article." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const body = await readJson(request);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A valid article ID is required." }, { status: 400 });
  }

  try {
    const article = (await getArticles(true, { includePending: true })).find((item) => item.id === id);
    if (!article || !(await deleteArticle(id))) {
      return NextResponse.json({ error: "Knowledge article not found." }, { status: 404 });
    }
    await addAuditLog(
      access.user.id,
      "Deleted Knowledge Article",
      "knowledge_articles",
      `Deleted article '${article.title}'`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Knowledge article deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the knowledge article." }, { status: 500 });
  }
}
