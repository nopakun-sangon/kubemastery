/**
 * KubeMastery: Global Instant Search Modal (Ctrl+K / Cmd+K)
 * Searches across Courses, Topic Blocks, Detailed Units, and CLI Drills.
 */

class GlobalSearchModal {
  constructor() {
    this.isOpen = false;
    this.index = [];
    this.initModalDOM();
    this.bindShortcuts();
  }

  buildIndex() {
    const items = [];

    // 1. Courses, Blocks & Units
    (window.courseData || []).forEach((course) => {
      // Index Course itself
      items.push({
        type: "Course",
        badge: course.badge,
        icon: course.icon || "☸️",
        title: course.title,
        subtitle: course.subtitle,
        keywords: `${course.title} ${course.subtitle} ${course.description} ${course.badge}`.toLowerCase(),
        action: () => {
          window.app.openCourse(course.id);
        }
      });

      // Index Blocks & Units
      (course.blocks || []).forEach((block) => {
        (block.units || []).forEach((unit) => {
          items.push({
            type: "Unit",
            badge: course.badge,
            icon: block.icon || "📖",
            title: unit.title,
            subtitle: `${course.title} • ${block.title} (Docs: ${unit.docsKeyword})`,
            keywords: `${unit.title} ${unit.summary} ${unit.explanation} ${unit.blueprint || ''} ${unit.docsKeyword}`.toLowerCase(),
            action: () => {
              window.app.openUnitReader(course.id, block.id, unit.id);
            }
          });
        });
      });
    });

    // 2. CLI Drills
    (window.cliDrillsData || []).forEach((drill, idx) => {
      items.push({
        type: "CLI Drill",
        badge: drill.examTag,
        icon: "⌨️",
        title: drill.title,
        subtitle: drill.canonicalCommand,
        keywords: `${drill.title} ${drill.scenario} ${drill.canonicalCommand} ${drill.category}`.toLowerCase(),
        action: () => {
          window.app.openCliDrillByIndex(idx);
        }
      });
    });

    // 3. Kubernetes Concepts Pages
    const conceptsMap = window.KUBE_CONCEPTS_PAGES || {};
    ((window.KUBE_CONCEPTS_INDEX && window.KUBE_CONCEPTS_INDEX.pages) || []).forEach((p) => {
      const fullPage = conceptsMap[p.id] || p;
      let extraText = fullPage.lead || "";
      (fullPage.sections || []).forEach(s => {
        extraText += ` ${s.headingTh} ${s.headingEn} ${s.contentMarkdown}`;
      });
      items.push({
        type: "Concept",
        badge: "CONCEPTS",
        icon: "📘",
        title: `${p.titleTh} (${p.titleEn})`,
        subtitle: `${p.categoryTitle} • docs.kubernetes.io`,
        keywords: `${p.titleTh} ${p.titleEn} ${p.categoryTitle} ${extraText}`.toLowerCase(),
        action: () => {
          window.app.openConceptPage(p.id);
        }
      });
    });

    // 4. Kubernetes Tasks Pages
    const tasksMap = window.KUBE_TASKS_PAGES || {};
    ((window.KUBE_TASKS_INDEX && window.KUBE_TASKS_INDEX.pages) || []).forEach((p) => {
      const fullPage = tasksMap[p.id] || p;
      let extraText = fullPage.lead || "";
      (fullPage.sections || []).forEach(s => {
        extraText += ` ${s.headingTh} ${s.headingEn} ${s.contentMarkdown}`;
      });
      items.push({
        type: "Task",
        badge: "TASKS",
        icon: "🛠️",
        title: `${p.titleTh} (${p.titleEn})`,
        subtitle: `${p.categoryTitle} • Step-by-Step Task`,
        keywords: `${p.titleTh} ${p.titleEn} ${p.categoryTitle} ${extraText}`.toLowerCase(),
        action: () => {
          window.app.openTaskPage(p.id);
        }
      });
    });

    this.index = items;
  }

  initModalDOM() {
    const modal = document.createElement("div");
    modal.id = "global-search-modal";
    modal.className = "fixed inset-0 z-50 hidden items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-950/70 backdrop-blur-sm";
    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden popup-scale-in">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input id="global-search-input" type="text" placeholder="ค้นหาบทเรียน, คำสั่ง kubectl, NetworkPolicy, Etcd, RBAC..." class="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none" autocomplete="off" />
          <button onclick="window.globalSearch.close()" class="px-2 py-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">ESC</button>
        </div>
        <div id="global-search-results" class="max-h-[65vh] overflow-y-auto p-3 space-y-1.5"></div>
      </div>
    `;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.close();
    });
    document.body.appendChild(modal);

    const input = modal.querySelector("#global-search-input");
    input.addEventListener("input", () => this.renderResults(input.value));
  }

  bindShortcuts() {
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (this.isOpen) this.close();
        else this.open();
      } else if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    this.buildIndex();
    const modal = document.getElementById("global-search-modal");
    const input = document.getElementById("global-search-input");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    this.isOpen = true;
    input.value = "";
    this.renderResults("");
    setTimeout(() => input.focus(), 50);
  }

  close() {
    const modal = document.getElementById("global-search-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    this.isOpen = false;
  }

  renderResults(query) {
    const container = document.getElementById("global-search-results");
    const q = (query || "").trim().toLowerCase();
    const filtered = q
      ? this.index.filter((item) => item.keywords.includes(q)).slice(0, 15)
      : this.index.slice(0, 10);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="py-10 text-center text-slate-400 text-sm">
          ไม่พบเนื้อหาที่ตรงกับ "<span class="font-bold text-slate-600 dark:text-slate-200">${query}</span>"
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map(
        (item, idx) => `
        <button data-search-idx="${idx}" class="w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 transition-all text-left group">
          <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base shrink-0">
            ${item.icon}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 truncate">${item.title}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 shrink-0">${item.badge}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">${item.type}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">${item.subtitle}</p>
          </div>
        </button>
      `
      )
      .join("");

    container.querySelectorAll("[data-search-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-search-idx"));
        const chosen = filtered[idx];
        this.close();
        if (chosen && chosen.action) chosen.action();
      });
    });
  }
}

window.GlobalSearchModal = GlobalSearchModal;

window.addEventListener("DOMContentLoaded", () => {
  window.globalSearch = new GlobalSearchModal();
});
