// src/components/CalendarGrid.js (SERVER)
import { buildPromoUrlISO, slugify } from "@/lib/slug";

function asArray(x) {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object") return Object.values(x);
  return [];
}

const LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// --- specials → map po danu
function indexSpecialsForMonth(specials, year, month) {
  const map = new Map();
  for (const sp of asArray(specials)) {
    if (!sp?.active) continue;
    if (sp.year === year && sp.month === month) map.set(sp.day, sp);
  }
  return map;
}


function pickPromoForDate(date, weekly, specialsMap) {
  const sp = specialsMap.get(date.getDate());
  if (sp) return { promo: sp, type: "special" };

  let wd = date.getDay(); // 0..6 (Sun..Sat)
  if (wd === 0) wd = 7;   // Sun -> 7
  wd = wd - 1;            // 0..6 (Mon..Sun)
  const w = asArray(weekly)[wd];
  if (w && w.active) return { promo: w, type: "weekly" };

  return { promo: null, type: null };
}

export default function CalendarGrid({
  year,
  month,
  weekly = [],
  specials = [],
  adminPreview = false, 
}) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startDay = firstDay === 0 ? 7 : firstDay; // 1..7 (Mon..Sun)

  const specialsMap = indexSpecialsForMonth(specials, year, month);

  const cells = [];
  const daysPayload = [];

 
  for (let i = 1; i < startDay; i++) {
    cells.push({ type: "pad", key: `pad-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const isFuture = d > today;
    const isToday = d.toDateString() === today.toDateString();

    const { promo, type } = pickPromoForDate(d, weekly, specialsMap);

    const icon = promo?.icon && String(promo.icon).trim() ? promo.icon : null;

    const shareUrl = promo
      ? buildPromoUrlISO(d, promo.title || slugify("promocao"))
      : null;


    const isFutureForUx = adminPreview ? false : (isFuture && !isToday);

 
    const isLocked = adminPreview ? false : (!promo || isFutureForUx);

 
    const showGift =
      (!promo) ||
      (!adminPreview && isFutureForUx) ||
      (!icon); 

    const classBucket = isFutureForUx
      ? (adminPreview ? "future-admin" : "future")
      : (isToday ? "today" : "past");

    cells.push({
      type: "day",
      key: `day-${day}`,
      day,
      hasPromo: Boolean(promo),
      isToday,
      isFutureForUx,
      isLocked,
      icon,
      classBucket,
    });

    daysPayload.push({
      day,
      shareUrl,
      type,
      promo: promo
        ? {
            title: promo.title || "",
            richHtml: promo.richHtml || null,
            link: promo.link || "#",
            button: promo.button || "Saiba mais",
            buttonColor: promo.buttonColor || "green",
          }
        : null,
    });
  }

  return (
    <section
      id="calendar-root"
      className={`w-full ${adminPreview ? "admin-preview" : ""}`}
    >
      <div className="grid grid-cols-7 gap-2 text-center text-sm text-white/70 mb-2">
        {LABELS.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 auto-rows-fr" data-cal-grid>
        {cells.map((cell) => {
          if (cell.type === "pad") return <div key={cell.key} />;

          return (
            <button
              key={cell.key}
              data-day-button
              data-day={cell.day}
              disabled={cell.isLocked}
              className={`relative h-24 md:h-28 border-[1.4px] border-double border-transparent rounded-[8px]
              bg-[linear-gradient(to_bottom,#0f1620,#371b19),linear-gradient(to_bottom,transparent,#C3602B)]
              [background-clip:padding-box,border-box] [background-origin:border-box]
              grid place-items-center transition ${cell.classBucket} ${
               
                adminPreview && cell.isFutureForUx ? "opacity-90" : ""
              }`}
              aria-label={`Day ${cell.day}`}
              title={
                !adminPreview && cell.isFutureForUx
                  ? "Otključano tek na dan promocije"
                  : ""
              }
             
              style={
                adminPreview && cell.isFutureForUx
                  ? { pointerEvents: "auto", cursor: "pointer" }
                  : undefined
              }
            >
              <span className="absolute left-2 top-2 text-xs text-white/70">
                {cell.day}
              </span>

            
              {cell.hasPromo && adminPreview && cell.icon ? (
                <img src={cell.icon} alt="icon" width={56} height={56} loading="lazy" />
              ) : !cell.hasPromo || (cell.isFutureForUx && !adminPreview) || !cell.icon ? (
                <span>🎁</span>
              ) : (
                <img src={cell.icon} alt="icon" width={56} height={56} loading="lazy" />
              )}
            </button>
          );
        })}
      </div>

      <div id="promo-modal" className="modal-backdrop hidden">
        <div className="modal-card">
          <button id="promo-close" className="float-right text-white/70">
            ✕
          </button>
          <article id="promo-content" />
        </div>
      </div>

      <script
        id="calendar-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ days: daysPayload, adminPreview }),
        }}
      />
    </section>
  );
}
