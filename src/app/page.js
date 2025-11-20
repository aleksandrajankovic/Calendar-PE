// src/app/page.js
import CalendarGrid from "@/components/CalendarGrid";
import CalendarEnhancer from "@/components/CalendarEnhancer";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

// helperi
function prevYM(y, m) {
  return m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };
}
function nextYM(y, m) {
  return m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 };
}

//helper za čitanje iz translations
function getTextFromTranslations(row, lang) {
  const translations = row.translations || {};

  const t =
    translations[lang] ||
    (Object.keys(translations).length
      ? translations[Object.keys(translations)[0]]
      : null);

  return {
    title: t?.title ?? row.title ?? "",
    button: t?.button ?? row.button ?? "",
    link: t?.link ?? row.link ?? "#",
    richHtml: t?.richHtml ?? row.richHtml ?? null,
  };
}

function normWeeklyRows(rows = [], lang) {
  const out = Array(7).fill(null);
  for (const r of rows) {
    if (typeof r.weekday === "number" && r.weekday >= 0 && r.weekday <= 6) {
      const t = getTextFromTranslations(r, lang);
      out[r.weekday] = {
        title: t.title,
        icon: r.icon || "",
        richHtml: t.richHtml,
        link: t.link,
        button: t.button,
        active: !!r.active,
        buttonColor: r.buttonColor || "green",
      };
    }
  }
  return out;
}

function normalizeSpecials(rows = [], lang) {
  return rows.map((r) => {
    const t = getTextFromTranslations(r, lang);
    return {
      year: r.year,
      month: r.month,
      day: r.day,
      title: t.title,
      icon: r.icon || "",
      richHtml: t.richHtml,
      link: t.link,
      button: t.button,
      active: !!r.active,
      buttonColor: r.buttonColor || "green",
    };
  });
}

function getParam(sp, key) {
  if (!sp) return undefined;
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function getMonthLabel(year, month, lang) {
  const locale = lang === "pt" ? "pt-BR" : "en-US";

  const raw = new Date(year, month, 1).toLocaleString(locale, {
    month: "long",
  });

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
export default async function Home({ searchParams }) {
  const sp = await searchParams;

  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_auth");
  const isAdmin = !!adminCookie?.value;

  const now = new Date();
  const yRaw = getParam(sp, "y");
  const mRaw = getParam(sp, "m");
  const langRaw = getParam(sp, "lang");

  const ALLOWED_LANGS = ["pt", "en"];
  const lang = ALLOWED_LANGS.includes(langRaw) ? langRaw : "pt";

  const reqYear = Number.parseInt(yRaw ?? "", 10);
  const reqMonth = Number.parseInt(mRaw ?? "", 10);

  const year = Number.isInteger(reqYear) ? reqYear : now.getFullYear();
  const month =
    Number.isInteger(reqMonth) && reqMonth >= 0 && reqMonth <= 11
      ? reqMonth
      : now.getMonth();

  const [weeklyDefaults, weeklyPlanRows, specialRows] = await Promise.all([
    prisma.weeklyPromotion.findMany({ orderBy: { weekday: "asc" } }),
    prisma.weeklyPlan.findMany({
      where: { year, month },
      orderBy: { weekday: "asc" },
    }),
    prisma.specialPromotion.findMany({
      where: { year, month },
      orderBy: [{ day: "asc" }],
    }),
  ]);

  const defaults = normWeeklyRows(weeklyDefaults, lang);
  const planned = normWeeklyRows(weeklyPlanRows, lang);

  const weeklyRaw = Array.from(
    { length: 7 },
    (_, i) =>
      planned[i] ??
      defaults[i] ?? {
        title: "",
        icon: "",
        richHtml: null,
        link: "#",
        button: "",
        active: false,
        buttonColor: "green",
      }
  );
  const weekly = weeklyRaw;

  const specialsRaw = normalizeSpecials(specialRows, lang);
  const specials = specialsRaw;

  const p = prevYM(year, month);
  const n = nextYM(year, month);
  const monthLabel = getMonthLabel(year, month, lang);
  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8">
      <header className="text-center mb-6">
        <img
          src="./img/logo.svg"
          alt="Meridian Logo"
          className="mx-auto w-40 md:w-48"
        />

        {/* Naslov kalendara po jeziku (čisto primer) */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
          {lang === "pt" ? "Calendário de Promoções" : "Promotion Calendar"}
        </h1>

        {isAdmin && (
          <div className="mt-2 inline-block rounded bg-amber-500/20 text-amber-200 px-3 py-1 text-sm">
            Admin preview
          </div>
        )}

        {/* Language switcher */}
        <div className="mt-3 flex items-center justify-center gap-2 text-white/80">
          {ALLOWED_LANGS.map((lng) => (
            <a
              key={lng}
              href={`/?y=${year}&m=${month}&lang=${lng}`}
              className={`px-2 py-1 rounded text-xs border ${
                lng === lang
                  ? "bg-white text-black border-white"
                  : "border-white/40 text-white/80 hover:bg-white/10"
              }`}
            >
              {lng.toUpperCase()}
            </a>
          ))}
        </div>
      </header>

      <CalendarGrid
        year={year}
        month={month}
        weekly={weekly}
        specials={specials}
        adminPreview={isAdmin}
        lang={lang} // može ti zatrebati u modalu
      />
      <CalendarEnhancer adminPreview={isAdmin} lang={lang} />
      {/* Month switcher – strelice + mesec/godina */}
      <div className="mt-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-4 rounded-full bg-black/40 px-4 py-2 text-white text-sm md:text-base">
          {/* Prev month */}
          <a
            href={`/?y=${p.y}&m=${p.m}&lang=${lang}`}
            className="p-1 hover:opacity-80"
            aria-label="Previous month"
          >
            ‹
          </a>

          <span className="min-w-[140px] text-center font-semibold">
            {monthLabel} <span className="ml-1 opacity-80">{year}</span>
          </span>

          {/* Next month */}
          <a
            href={`/?y=${n.y}&m=${n.m}&lang=${lang}`}
            className="p-1 hover:opacity-80"
            aria-label="Next month"
          >
            ›
          </a>
        </div>
      </div>
    </main>
  );
}
