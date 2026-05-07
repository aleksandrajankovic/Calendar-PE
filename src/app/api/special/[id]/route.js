// src/app/api/special/[id]/route.js
export const runtime = "nodejs";
import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { sanitizeLink } from "@/lib/validate";

function sanitizeTranslations(translations) {
  if (!translations || typeof translations !== "object" || Array.isArray(translations)) return null;
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

async function getIdFromParamsOrUrl(req, paramsMaybePromise) {
  const params = await paramsMaybePromise;
  const raw = params?.id;
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const id = Number(raw ?? last);
  if (!Number.isFinite(id)) return null;
  return id;
}

export async function PUT(req, ctx) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const id = await getIdFromParamsOrUrl(req, ctx?.params);
  if (!id) return new Response("bad id", { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { year, month, day, icon, link, buttonColor, active, title, button, rich, richHtml, translations, category, scratch } = body;

  const updated = await prisma.specialPromotion.update({
    where: { id },
    data: {
      year, month, day,
      icon: icon ?? "",
      link: sanitizeLink(link ?? ""),
      buttonColor: buttonColor ?? "green",
      active: typeof active === "boolean" ? active : true,
      title: title ?? "",
      button: button ?? "",
      rich: rich ?? null,
      richHtml: sanitizeRichHtml(richHtml ?? null),
      translations: sanitizeTranslations(translations) ?? null,
      category: category ?? "ALL",
      scratch: !!scratch,
    },
  });

  return Response.json(updated);
}

export async function PATCH(req, ctx) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const id = await getIdFromParamsOrUrl(req, ctx?.params);
  if (!id) return new Response("bad id", { status: 400 });

  const body = await req.json().catch(() => ({}));

  const updated = await prisma.specialPromotion.update({
    where: { id },
    data: {
      ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      ...(typeof body.scratch === "boolean" ? { scratch: body.scratch } : {}),
    },
  });

  return Response.json(updated);
}

export async function DELETE(req, ctx) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const id = await getIdFromParamsOrUrl(req, ctx?.params);
  if (!id) return new Response("bad id", { status: 400 });

  await prisma.specialPromotion.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
