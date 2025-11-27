// src/components/CalendarMobileStack.jsx
"use client";

import { useEffect, useState } from "react";
import { getCategoryGradient } from "@/lib/promoCategoryStyles";

export default function CalendarMobileStack({ adminPreview = false }) {
  const [days, setDays] = useState([]);
  const [lang, setLang] = useState("pt");
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);

  // čitamo payload iz #calendar-data
  useEffect(() => {
    const dataEl = document.getElementById("calendar-data");
    if (!dataEl) return;

    try {
      const payload = JSON.parse(dataEl.textContent || "{}");
      const allDays = Array.isArray(payload.days) ? payload.days : [];

      const now = new Date();

      // uzmi samo "prave" dane (bez prev/next)
      const onlyDays = allDays.filter((d) => d && typeof d.day === "number");

      setDays(onlyDays);

      if (payload.lang) setLang(payload.lang);

      // today → prvi sa promo → prvi dan
      let todayIndex = onlyDays.findIndex((d) => d.isToday);
      if (todayIndex === -1) {
        todayIndex = onlyDays.findIndex((d) => d.hasPromo);
      }
      if (todayIndex === -1) todayIndex = 0;

      setActiveIndex(todayIndex >= 0 ? todayIndex : 0);
    } catch {
      // ignore
    }
  }, []);

  // navigacija gore/dole
  const goPrev = () => {
    setActiveIndex((idx) => (idx > 0 ? idx - 1 : idx));
  };

  const goNext = () => {
    setActiveIndex((idx) => (idx < days.length - 1 ? idx + 1 : idx));
  };

  // swipe gest
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (touchStartY == null) return;
    const delta = e.changedTouches[0].clientY - touchStartY;

    if (delta > 40) {
      goPrev(); // swipe down
    } else if (delta < -40) {
      goNext(); // swipe up
    }

    setTouchStartY(null);
  };

  if (!days.length) return null;

  const MAX_OFFSET = 4;
  const CARD_HEIGHT = 140;
  const CARD_GAP = 58;
  const STACK_HEIGHT = 560;
  const ACTIVE_Y = STACK_HEIGHT / 2 - CARD_HEIGHT / 2;

  return (
    <div className="w-full flex flex-col items-center">
      {/* stack kartica */}
      <div
        className="relative w-full max-w-[380px] overflow-hidden touch-none"
        style={{ height: STACK_HEIGHT }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {days.map((day, index) => {
          const offset = index - activeIndex;
          if (Math.abs(offset) > MAX_OFFSET) return null;

          const locked = day.isLocked && !adminPreview;
          const category = day.category || "ALL";

          // ghost dan = nema promo i nije future
          const isGhost = !day.hasPromo && !day.isFutureForUx;

          const gradientClass = locked
            ? "bg-black"
            : getCategoryGradient(category);
          const isToday = day.isToday;
          const isTodayActive = isToday && !isGhost;
          const translateY = ACTIVE_Y + offset * CARD_GAP;
          const scale =
            offset === 0
              ? 1
              : 1 - Math.min(Math.abs(offset), MAX_OFFSET) * 0.06;
          const zIndex = MAX_OFFSET - Math.abs(offset);
          const opacity = offset === 0 ? 1 : 0.9;

          return (
            <button
              key={day.day}
              data-day-button
              data-day={day.day}
              disabled={locked || isGhost}
              onClick={() => !isGhost && setActiveIndex(index)}
              className={`
    absolute top-0 left-1/2
    w-[92%]
    h-[140px]
    rounded-[18px]
    overflow-hidden

    ${
      isTodayActive
        ? "border-2 border-[#FACC01] shadow-[0_0_20px_rgba(250,204,1,0.9)]"
        : "border border-transparent"
    }

    ${
      isGhost
        ? "bg-[#000000D9] border-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
        : gradientClass
    }

    shadow-[0_18px_40px_rgba(0,0,0,0.7)]
    transition
    duration-300
    ${
      locked || isGhost
        ? "cursor-default"
        : "cursor-pointer active:scale-[0.98]"
    }
  `}
              style={{
                transform: `translate(-50%, ${translateY}px) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              {/* broj dana */}
              <span className="absolute left-4 top-3 z-10 text-[64px] leading-[65px] font-bold bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                {day.day.toString().padStart(2, "0")}
              </span>

              {/* slika / lock – samo ako NIJE ghost */}
              {!isGhost &&
                (!locked && day.hasPromo && day.icon ? (
                  <img
                    src={day.icon}
                    alt="promo icon"
                    className="absolute right-0 inset-y-0 h-full w-[50%] object-cover object-center
            "
                    loading="lazy"
                  />
                ) : (
                  <img
                    src="./img/lock.png"
                    alt="default promo icon"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ))}

              {/* overlay samo ako nije ghost */}
              {!isGhost && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-black/0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
