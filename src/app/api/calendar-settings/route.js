export const runtime = "nodejs";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/db";

const VALID_THEMES = ["default", "default-horizontal"];
const VALID_POS = ["left", "center", "right"];

const DEFAULT_TITLE = { es: "Calendario Promocional", en: "Promotion Calendar" };
const DEFAULT_LOGO  = "/img/logo.svg";
const DEFAULT_SEO_META = {
  es: { title: "Calendario Promocional | Meridianbet Perú", description: "Descubre las promociones diarias de Meridianbet Perú y aprovecha recompensas exclusivas con el Calendario Promocional." },
  en: { title: "Promotion Calendar | Meridianbet Peru", description: "Discover daily promotions at Meridianbet Peru and take advantage of exclusive rewards with the Promotion Calendar." },
};

function getAdminIdFromCookie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

export async function GET(req) {
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) return new Response("unauthorized", { status: 401 });

  const row = await prisma.calendarSettings.findFirst();
  return Response.json({
    bgImageUrl:       row?.bgImageUrl       || "/img/bg-calendar.png",
    bgImageUrlMobile: row?.bgImageUrlMobile || "/img/bg-calendar-mobile.png",
    theme:            row?.theme            || "default",
    seoMeta:          row?.seoMeta          || DEFAULT_SEO_META,
    monthBackgrounds: row?.monthBackgrounds || {},
    calendarPosition: row?.calendarPosition || "left",
    calendarTitle:    row?.calendarTitle    || DEFAULT_TITLE,
    logoUrl:          row?.logoUrl          || DEFAULT_LOGO,
  });
}

export async function PUT(req) {
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const patch = {};

  if ("bgImageUrl" in body)
    patch.bgImageUrl = (body.bgImageUrl || "").trim() || null;

  if ("bgImageUrlMobile" in body)
    patch.bgImageUrlMobile = (body.bgImageUrlMobile || "").trim() || null;

  if ("theme" in body)
    patch.theme = VALID_THEMES.includes(body.theme) ? body.theme : "default";

  if ("calendarPosition" in body)
    patch.calendarPosition = VALID_POS.includes(body.calendarPosition) ? body.calendarPosition : "left";

  if ("logoUrl" in body)
    patch.logoUrl = (body.logoUrl || "").trim() || null;

  if ("calendarTitle" in body) {
    const t = body.calendarTitle;
    patch.calendarTitle = {
      es: (typeof t?.es === "string" ? t.es.trim() : "") || DEFAULT_TITLE.es,
      en: (typeof t?.en === "string" ? t.en.trim() : "") || DEFAULT_TITLE.en,
    };
  }

  if ("seoMeta" in body) {
    const s = body.seoMeta;
    patch.seoMeta = {
      es: {
        title:       (typeof s?.es?.title       === "string" ? s.es.title.trim()       : "") || DEFAULT_SEO_META.es.title,
        description: (typeof s?.es?.description === "string" ? s.es.description.trim() : "") || DEFAULT_SEO_META.es.description,
      },
      en: {
        title:       (typeof s?.en?.title       === "string" ? s.en.title.trim()       : "") || DEFAULT_SEO_META.en.title,
        description: (typeof s?.en?.description === "string" ? s.en.description.trim() : "") || DEFAULT_SEO_META.en.description,
      },
    };
  }

  if ("monthBackgrounds" in body) {
    let cleaned = null;
    const raw = body.monthBackgrounds;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const out = {};
      for (const [key, val] of Object.entries(raw)) {
        if (val && typeof val === "object") {
          const desktop  = (val.desktop  || "").trim() || null;
          const mobile   = (val.mobile   || "").trim() || null;
          const position = VALID_POS.includes(val.position) ? val.position : null;
          const titleEs  = (val.titleEs  || "").trim() || null;
          const titleEn  = (val.titleEn  || "").trim() || null;
          const inactive = val.inactive === true ? true : null;
          const theme    = VALID_THEMES.includes(val.theme) ? val.theme : null;
          if (desktop || mobile || position || titleEs || titleEn || inactive || theme)
            out[key] = { desktop, mobile, position, titleEs, titleEn, inactive, theme };
        }
      }
      cleaned = Object.keys(out).length ? out : null;
    }
    patch.monthBackgrounds = cleaned;
  }

  const row = await prisma.calendarSettings.upsert({
    where:  { id: 1 },
    update: patch,
    create: { id: 1, ...patch },
  });

  revalidateTag("calendar");
  return Response.json({
    bgImageUrl:       row.bgImageUrl       || "/img/bg-calendar.png",
    bgImageUrlMobile: row.bgImageUrlMobile || "/img/bg-calendar-mobile.png",
    theme:            row.theme            || "default",
    seoMeta:          row.seoMeta          || DEFAULT_SEO_META,
    monthBackgrounds: row.monthBackgrounds || {},
    calendarPosition: row.calendarPosition || "left",
    calendarTitle:    row.calendarTitle    || DEFAULT_TITLE,
    logoUrl:          row.logoUrl          || DEFAULT_LOGO,
  });
}
