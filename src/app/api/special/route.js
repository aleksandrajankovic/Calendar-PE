// src/app/api/special/route.js
export const runtime = "nodejs";
import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { sanitizeLink } from "@/lib/validate";

const DEFAULT_LANG = "es";

function sanitizeTranslations(translations) {
  if (!translations || typeof translations !== "object" || Array.isArray(translations)) return {};
  return Object.fromEntries(
    Object.entries(translations).map(([lang, value]) => [
      lang,
      {
        ...(value && typeof value === "object" ? value : {}),
        richHtml: sanitizeRichHtml(value?.richHtml ?? null),
        link: sanitizeLink(value?.link ?? ""),
      },
    ])
  );
}

export async function GET(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const rows = await prisma.specialPromotion.findMany();
  const safe = rows.map((r) => ({ ...r, richHtml: r.richHtml ?? null, scratch: !!r.scratch }));
  return Response.json(safe);
}

// PATCH /api/special — bulk activate/deactivate by ids
export async function PATCH(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ids, active } = body;

  if (!Array.isArray(ids) || ids.length === 0 || typeof active !== "boolean") {
    return new Response("bad payload", { status: 400 });
  }

  const { count } = await prisma.specialPromotion.updateMany({
    where: { id: { in: ids.map(Number) } },
    data: { active },
  });

  return Response.json({ updated: count });
}

export async function POST(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    year, month, day, icon, link, buttonColor, active,
    title, button, rich, richHtml,
    translations: rawTranslations, defaultLang, category, scratch,
  } = body;

  const translations = sanitizeTranslations(rawTranslations || {});
  const mainLang = defaultLang || DEFAULT_LANG;
  const mainT = translations[mainLang] || {};

  if (typeof year !== "number" || typeof month !== "number" || typeof day !== "number" || !(title || mainT.title)) {
    return new Response("bad payload", { status: 400 });
  }

  const created = await prisma.specialPromotion.create({
    data: {
      year, month, day,
      title: mainT.title ?? title ?? "",
      button: mainT.button ?? button ?? "",
      link: sanitizeLink(mainT.link ?? link ?? ""),
      rich: mainT.rich ?? rich ?? null,
      richHtml: sanitizeRichHtml(mainT.richHtml ?? richHtml ?? null),
      icon: icon ?? "",
      active: typeof active === "boolean" ? active : true,
      buttonColor: buttonColor || "green",
      translations: Object.keys(translations).length ? translations : null,
      category: category || "ALL",
      scratch: !!scratch,
    },
  });

  return Response.json(created, { status: 201 });
}
