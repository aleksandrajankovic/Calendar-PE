// lib/calendarInteractions.js
function renderModalHTML(entry) {
  const { promo, day, shareUrl } = entry;
  if (!promo) return "<p>Sem promoções neste dia.</p>";

  const openUrl = promo.link && String(promo.link);
  const canOpen = openUrl && openUrl !== "#";
  if (entry.shareUrl) {
    history.pushState({ promo: true }, "", entry.shareUrl);
  }
  const color = promo.buttonColor || "green";

  const BUTTON_COLOR_CLASSES = {
    green:
      "inline-block px-4 py-2 rounded-md mt-4 bg-[#17BB00] text-white font-condensed text-xs uppercase hover:brightness-110",
    yellow:
      "inline-block px-4 py-2 rounded-md mt-4 bg-[#FFCB05] text-black font-condensed text-xs uppercase hover:brightness-110",
  };

  const btnClass = BUTTON_COLOR_CLASSES[color] || BUTTON_COLOR_CLASSES.green;
  if (promo.richHtml) {
    return `
      <header class="mb-2">
        <p class="text-xs text-white/60">${String(day).padStart(2, "0")}</p>
        <h2 class="text-xl font-semibold">${promo.title || ""}</h2>
      </header>
      <div class="prose prose-invert max-w-none
        [&_ul]:list-inside [&_ol]:list-inside
        [&_ul]:pl-0 [&_ol]:pl-0
        [&_li_p]:m-0 [&_li_p]:inline">
        ${promo.richHtml}
      </div>
      ${
        canOpen
          ? `
        <a class="${btnClass}" href="${openUrl}" target="_blank" rel="noreferrer">
          ${promo.button || "Registrate"}
        </a>`
          : ""
      }
    `;
  }
}

export function initCalendarInteractions(rootSelector = "#calendar-root") {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const dataEl = root.querySelector("#calendar-data");
  if (!dataEl) return;
  const payload = JSON.parse(dataEl.textContent || "{}");
  const days = Array.isArray(payload.days) ? payload.days : [];

  const modal = root.querySelector("#promo-modal");
  const content = root.querySelector("#promo-content");
  const closeBtn = root.querySelector("#promo-close");

  let isOpen = false;

  function openModal(entry) {
    if (!modal || !content) return;
    content.innerHTML = renderModalHTML(entry);
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    isOpen = true;

    // 💡 NOVO: guramo shareUrl u istoriju
    if (entry.shareUrl) {
      history.pushState({ promo: true }, "", entry.shareUrl);
    }
  }

  function closeModal({ replace } = {}) {
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    isOpen = false;

    // 💡 NOVO: vraćamo URL
    if (replace) {
      history.replaceState(null, "", "/");
    } else {
      history.replaceState(null, "", "/");
    }
  }

  // Klik na dan - otvori modal
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day-button]");
    if (!btn) return;
    const day = Number(btn.getAttribute("data-day"));
    const entry = days.find((d) => d.day === day);
    if (!entry || !entry.promo) return;
    openModal(entry);
  });

  // Zatvaranje
  closeBtn?.addEventListener("click", () => closeModal({ replace: true }));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) return closeModal({ replace: true });
    if (e.target.id === "promo-close" || e.target.closest("#promo-close")) {
      e.preventDefault();
      return closeModal({ replace: true });
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closeModal({ replace: true });
  });

  // 💡 NOVO: podrži Back/Forward (zatvori modal kad user klikne Back)
  window.addEventListener("popstate", () => {
    if (isOpen) {
      // korisnik stisnuo Back dok je modal otvoren
      closeModal({ replace: false });
    }
  });
}
