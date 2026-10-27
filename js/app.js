/**
 * KubeMastery: CNCF Official Exam Preparation Platform (CKAD & CKA)
 * Main Application Controller & View Router
 * Features:
 *  - 2-Way Deep-Link URL Router (#/dashboard, #/lessons, #/concepts, #/tasks, #/cli-playground, #/profile)
 *  - 3-Tier Lessons Hub (Course Portal -> Topic Blocks Catalog -> Official Docs Lesson Reader)
 *  - Kubernetes Concepts Full Docs Reader (11 Official Domains, 38 Pages)
 *  - Kubernetes Tasks Full Docs Reader (8 Official Domains, 36 Pages)
 *  - Image Lightbox Zoom for Architecture SVGs
 *  - Global & Per-Page Share Modal (Web Share API + Deep-Link Copy)
 *  - Interactive Imperative CLI Speed Playground
 */

class KubeMasteryApp {
  constructor() {
    this.currentView = "dashboard";

    // 3-Tier Lessons Hub Navigation State
    this.activeCourseId = null;     // null or "course-ckad" / "course-cka" / "course-foundation"
    this.activeBlockId = null;      // block id inside course
    this.activeUnitId = null;       // unit id for Reader View
    this.lessonSearchTerm = "";
    this.lessonCategoryFilter = "all";

    // Docs State
    this.activeConceptPageId = "overview-what-is-kubernetes";
    this.activeTaskPageId = "tools-install-kubectl";
    this.conceptSearchTerm = "";
    this.taskSearchTerm = "";
    this.isConceptsDropdownOpen = false;
    this.isTasksDropdownOpen = false;

    // CLI Playground state
    this.cliDrillIndex = 0;
    this.cliCategoryFilter = "ALL";
    this.cliLastFeedback = null;

    // Current Share State
    this.currentShareData = null;

    this.initTheme();
    this.bindGlobalEvents();
    this.syncHeaderStats();
    this.initRouting();
  }

  // ===========================================================================
  // THEME & GLOBAL EVENTS
  // ===========================================================================
  initTheme() {
    const state = window.storage.getState();
    const theme = state.preferences.theme || "dark";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  toggleTheme() {
    const state = window.storage.getState();
    const isDark = document.documentElement.classList.toggle("dark");
    state.preferences.theme = isDark ? "dark" : "light";
    window.storage.save();
    if (window.soundFx && window.soundFx.playClick) window.soundFx.playClick();
  }

  bindGlobalEvents() {
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) themeBtn.addEventListener("click", () => this.toggleTheme());

    document.querySelectorAll("[data-nav-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-nav-target");
        this.closeMobileDrawer();
        this.navigateTo(target);
      });
    });

    const openBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("close-drawer-btn");
    if (openBtn) openBtn.addEventListener("click", () => this.openMobileDrawer());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeMobileDrawer());

    // Lightbox modal backdrop click to close
    const lightboxModal = document.getElementById("image-lightbox-modal");
    if (lightboxModal) {
      lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) this.closeLightbox();
      });
    }

    // Share modal backdrop click to close
    const shareModal = document.getElementById("share-modal");
    if (shareModal) {
      shareModal.addEventListener("click", (e) => {
        if (e.target === shareModal) this.closeShareModal();
      });
    }

    // Escape key listener for modals
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeLightbox();
        this.closeShareModal();
      }
    });

    // Scroll listener for Floating Back-to-Top button
    window.addEventListener("scroll", () => {
      const btn = document.getElementById("back-to-top-btn");
      if (!btn) return;
      if (window.scrollY > 300) {
        btn.classList.remove("opacity-0", "pointer-events-none", "translate-y-4");
        btn.classList.add("opacity-100", "pointer-events-auto", "translate-y-0");
      } else {
        btn.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
        btn.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");
      }
    }, { passive: true });
  }

  openMobileDrawer() {
    const drawer = document.getElementById("mobile-drawer");
    if (drawer) drawer.classList.remove("hidden");
  }

  closeMobileDrawer() {
    const drawer = document.getElementById("mobile-drawer");
    if (drawer) drawer.classList.add("hidden");
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const colors = {
      success: "bg-emerald-600 text-white border-emerald-500",
      error: "bg-rose-600 text-white border-rose-500",
      info: "bg-slate-900 dark:bg-blue-600 text-white border-blue-500"
    };
    const toast = document.createElement("div");
    toast.className = `px-4 py-2.5 rounded-2xl border shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 popup-scale-in pointer-events-auto ${colors[type] || colors.info}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 2600);
  }

  copyText(rawText, label = "คัดลอกคำสั่งเรียบร้อยแล้ว!") {
    navigator.clipboard.writeText(rawText).then(() => {
      if (window.soundFx && window.soundFx.playClick) window.soundFx.playClick();
      this.showToast(`📋 ${label}`, "success");
    });
  }

  escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  formatInlineMarkdown(rawStr) {
    if (!rawStr) return "";
    // 1. Extract inline code spans first so inner characters aren't mangled
    const codePlaceholders = [];
    let str = String(rawStr).replace(/`([^`]+)`/g, (_, code) => {
      const idx = codePlaceholders.length;
      codePlaceholders.push(
        `<code class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 font-mono text-xs border border-slate-200/70 dark:border-slate-700/70">${this.escapeHtml(code)}</code>`
      );
      return `\x00CODE_${idx}\x00`;
    });

    // 2. Escape HTML on remaining text
    str = this.escapeHtml(str);

    // 3. Markdown links [text](url)
    str = str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const cleanUrl = url.replace(/&amp;/g, "&");
      const isExternal = /^https?:\/\//i.test(cleanUrl);
      const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${cleanUrl}"${targetAttr} class="text-blue-600 dark:text-cyan-400 font-bold underline decoration-blue-400/50 hover:decoration-blue-500">${label}${isExternal ? " ↗" : ""}</a>`;
    });

    // 4. Bold **text**
    str = str.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>');

    // 5. Italic *text*
    str = str.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em class="italic text-slate-800 dark:text-slate-200">$2</em>');

    // 6. Restore inline code placeholders
    str = str.replace(/\x00CODE_(\d+)\x00/g, (_, idx) => codePlaceholders[Number(idx)] || "");
    return str;
  }

  formatMarkdown(text) {
    if (!text) return "";

    // Normalize line endings & fix collapsed single-line tables or alert lines
    let normalized = String(text)
      .replace(/\r\n/g, "\n")
      .replace(/\|\s+\|\s*(?=:?-+:?\s*\|)/g, "|\n| ")
      .replace(/\|\s+\|\s*(?=[^|\n]+\|)/g, "|\n| ")
      .replace(/(>\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\])\s*>\s*/gi, "$1\n> ");

    const lines = normalized.split("\n");
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Skip empty line
      if (!trimmed) {
        i++;
        continue;
      }

      // 2. Fenced Code Block ```lang ... ```
      if (trimmed.startsWith("```")) {
        const lang = trimmed.slice(3).trim() || "code";
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // skip closing ```
        const rawCode = codeLines.join("\n");
        out.push(`
          <div class="my-3.5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
            <div class="px-4 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px]">
              <span class="font-mono text-cyan-400 uppercase">${this.escapeHtml(lang)}</span>
              <button onclick='window.app.copyText(${JSON.stringify(rawCode)}, "คัดลอกโค้ดเรียบร้อยแล้ว!")'
                class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">
                📋 Copy
              </button>
            </div>
            <pre class="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">${this.escapeHtml(rawCode)}</pre>
          </div>
        `);
        continue;
      }

      // 3. Markdown Table (| col1 | col2 |)
      if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.split("|").length >= 3) {
        const tableLines = [];
        while (i < lines.length) {
          const tLine = lines[i].trim();
          if (tLine.startsWith("|") && tLine.endsWith("|")) {
            tableLines.push(tLine);
            i++;
          } else {
            break;
          }
        }

        if (tableLines.length >= 2) {
          const parseRow = (r) =>
            r
              .replace(/^\|/, "")
              .replace(/\|$/, "")
              .split("|")
              .map((c) => c.trim());

          const headerCells = parseRow(tableLines[0]);
          const bodyRows = [];
          for (let rIdx = 1; rIdx < tableLines.length; rIdx++) {
            const cells = parseRow(tableLines[rIdx]);
            // Skip separator row like | :--- | :--- |
            if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
            bodyRows.push(cells);
          }

          out.push(`
            <div class="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
              <table class="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr class="bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                    ${headerCells.map((h) => `<th class="px-4 py-3 whitespace-nowrap">${this.formatInlineMarkdown(h)}</th>`).join("")}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                  ${bodyRows
                    .map(
                      (row) => `
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      ${row.map((cell, cIdx) => `<td class="px-4 py-2.5 align-top ${cIdx === 0 ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}">${this.formatInlineMarkdown(cell)}</td>`).join("")}
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `);
          continue;
        }
      }

      // 4. Blockquotes & GitHub Alerts (> [!WARNING], > [!NOTE], etc.)
      if (trimmed.startsWith(">")) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          const cleaned = lines[i]
            .trim()
            .replace(/^>\s?/, "")
            .replace(/^>\s?/, "");
          if (cleaned) quoteLines.push(cleaned);
          i++;
        }

        let fullQuote = quoteLines.join("\n").trim();
        let alertType = null;
        const alertMatch = fullQuote.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
        if (alertMatch) {
          alertType = alertMatch[1].toUpperCase();
          fullQuote = fullQuote.slice(alertMatch[0].length).replace(/^>\s*/, "").trim();
        }

        const alertStyles = {
          NOTE: {
            box: "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-cyan-400 text-slate-700 dark:text-slate-200",
            badge: "text-blue-700 dark:text-cyan-300",
            label: "ℹ️ หมายเหตุ (Note)"
          },
          TIP: {
            box: "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-slate-700 dark:text-slate-200",
            badge: "text-emerald-700 dark:text-emerald-300",
            label: "💡 เคล็ดลับ (Tip)"
          },
          IMPORTANT: {
            box: "bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 text-slate-700 dark:text-slate-200",
            badge: "text-purple-700 dark:text-purple-300",
            label: "📌 สำคัญ (Important)"
          },
          WARNING: {
            box: "bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 text-slate-800 dark:text-amber-100",
            badge: "text-amber-700 dark:text-amber-400",
            label: "⚠️ คำเตือน (Warning)"
          },
          CAUTION: {
            box: "bg-rose-50/90 dark:bg-rose-950/40 border-rose-500 text-slate-800 dark:text-rose-100",
            badge: "text-rose-700 dark:text-rose-400",
            label: "🚨 ข้อควรระวัง (Caution)"
          }
        };

        const st = (alertType && alertStyles[alertType]) || {
          box: "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-cyan-400 text-slate-700 dark:text-slate-300",
          badge: "",
          label: ""
        };

        out.push(`
          <blockquote class="p-4 my-3 rounded-2xl border-l-4 ${st.box} text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-2xs">
            ${st.label ? `<div class="font-black text-xs uppercase tracking-wider ${st.badge}">${st.label}</div>` : ""}
            <div>${fullQuote.split("\n").map((l) => this.formatInlineMarkdown(l)).join("<br/>")}</div>
          </blockquote>
        `);
        continue;
      }

      // 5. Headings (####, ###, ##)
      if (/^####\s+(.+)/.test(trimmed)) {
        const hText = trimmed.replace(/^####\s+/, "");
        out.push(`<h4 class="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 mt-3.5 mb-1.5">${this.formatInlineMarkdown(hText)}</h4>`);
        i++;
        continue;
      }
      if (/^###\s+(.+)/.test(trimmed)) {
        const hText = trimmed.replace(/^###\s+/, "");
        out.push(`<h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-5 mb-2 flex items-center gap-1.5"><span class="text-cyan-500 text-xs">▶</span><span>${this.formatInlineMarkdown(hText)}</span></h3>`);
        i++;
        continue;
      }
      if (/^##\s+(.+)/.test(trimmed)) {
        const hText = trimmed.replace(/^##\s+/, "");
        out.push(`<h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-6 mb-2.5 pb-1.5 border-b border-slate-200 dark:border-slate-800">${this.formatInlineMarkdown(hText)}</h2>`);
        i++;
        continue;
      }

      // 6. Unordered List (* or -)
      if (/^\s*[*-]\s+(.+)/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[*-]\s+(.+)/.test(lines[i])) {
          const isSub = /^\s{2,}[*-]\s+/.test(lines[i]);
          const itemText = lines[i].replace(/^\s*[*-]\s+/, "").trim();
          items.push(`<li class="${isSub ? "ml-8 list-[circle]" : "ml-5 list-disc"} text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">${this.formatInlineMarkdown(itemText)}</li>`);
          i++;
        }
        out.push(`<ul class="space-y-1.5 my-2.5">${items.join("")}</ul>`);
        continue;
      }

      // 7. Ordered List (1. 2. ...)
      if (/^\s*\d+\.\s+(.+)/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+(.+)/.test(lines[i])) {
          const itemText = lines[i].replace(/^\s*\d+\.\s+/, "").trim();
          items.push(`<li class="ml-5 list-decimal text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">${this.formatInlineMarkdown(itemText)}</li>`);
          i++;
        }
        out.push(`<ol class="space-y-1.5 my-2.5">${items.join("")}</ol>`);
        continue;
      }

      // 8. Horizontal rule
      if (/^---+$/.test(trimmed)) {
        out.push(`<hr class="my-4 border-slate-200 dark:border-slate-800" />`);
        i++;
        continue;
      }

      // 9. Standard Paragraph
      out.push(`<p class="my-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${this.formatInlineMarkdown(trimmed)}</p>`);
      i++;
    }

    return out.join("\n");
  }

  syncHeaderStats() {
    const state = window.storage.getState();
    const avatarEl = document.getElementById("header-avatar");
    const nameEl = document.getElementById("header-user-name");

    if (avatarEl) avatarEl.textContent = state.profile.avatar || "☸️";
    if (nameEl) nameEl.textContent = state.profile.name || "Kubestronaut";
  }

  // ===========================================================================
  // TWO-WAY DEEP-LINK URL ROUTER
  // ===========================================================================
  initRouting() {
    window.addEventListener("hashchange", () => this.handleHashChange());
    this.handleHashChange();
  }

  handleHashChange() {
    const rawHash = window.location.hash.replace(/^#\/?/, "");
    if (!rawHash) {
      this.navigateTo("dashboard", {}, false);
      return;
    }

    const parts = rawHash.split("/").map(decodeURIComponent);
    const route = parts[0];

    if (route === "dashboard") {
      this.navigateTo("dashboard", {}, false);
    } else if (route === "lessons") {
      const courseId = parts[1] || null;
      const blockId = parts[2] || null;
      const unitId = parts[3] || null;
      this.navigateTo("lessons", { courseId, blockId, unitId }, false);
    } else if (route === "concepts") {
      const pageId = parts[1] || "overview-what-is-kubernetes";
      this.navigateTo("concepts", { conceptPageId: pageId }, false);
    } else if (route === "tasks") {
      const pageId = parts[1] || "tools-install-kubectl";
      this.navigateTo("tasks", { taskPageId: pageId }, false);
    } else if (route === "cli-playground") {
      const drillIndex = parts[1] ? parseInt(parts[1], 10) : 0;
      this.navigateTo("cli-playground", { drillIndex: isNaN(drillIndex) ? 0 : drillIndex }, false);
    } else if (route === "profile") {
      this.navigateTo("profile", {}, false);
    } else {
      this.navigateTo("dashboard", {}, false);
    }
  }

  navigateTo(view, params = {}, updateHash = true) {
    this.currentView = view;
    if (params.courseId !== undefined) this.activeCourseId = params.courseId;
    if (params.blockId !== undefined) this.activeBlockId = params.blockId;
    if (params.unitId !== undefined) this.activeUnitId = params.unitId;
    if (params.conceptPageId !== undefined) this.activeConceptPageId = params.conceptPageId;
    if (params.taskPageId !== undefined) this.activeTaskPageId = params.taskPageId;
    if (params.drillIndex !== undefined) this.cliDrillIndex = params.drillIndex;

    if (view === "concepts") {
      this.isConceptsDropdownOpen = true;
    } else if (view === "tasks") {
      this.isTasksDropdownOpen = true;
    }

    if (updateHash) {
      let newHash = `#/${view}`;
      if (view === "lessons") {
        if (this.activeCourseId && this.activeBlockId && this.activeUnitId) {
          newHash = `#/lessons/${this.activeCourseId}/${this.activeBlockId}/${this.activeUnitId}`;
        } else if (this.activeCourseId) {
          newHash = `#/lessons/${this.activeCourseId}`;
        }
      } else if (view === "concepts") {
        if (this.activeConceptPageId) newHash = `#/concepts/${this.activeConceptPageId}`;
      } else if (view === "tasks") {
        if (this.activeTaskPageId) newHash = `#/tasks/${this.activeTaskPageId}`;
      } else if (view === "cli-playground") {
        if (this.cliDrillIndex > 0) newHash = `#/cli-playground/${this.cliDrillIndex}`;
      }
      history.replaceState(null, "", newHash);
    }

    if (window.soundFx && window.soundFx.playClick) window.soundFx.playClick();
    this.updateActiveNavButtons();
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateActiveNavButtons() {
    document.querySelectorAll("[data-nav-target]").forEach((btn) => {
      const target = btn.getAttribute("data-nav-target");
      const isActive = target === this.currentView;
      if (btn.closest("#mobile-drawer")) {
        btn.className = isActive
          ? "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 text-left"
          : "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left";
      } else {
        btn.className = isActive
          ? "w-full flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-3 rounded-2xl text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/50 transition-all text-left group"
          : "w-full flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group";
      }
    });

    // Update Desktop Concepts & Tasks Accordion Header Buttons
    const conceptsToggleBtn = document.getElementById("sidebar-concepts-toggle-btn");
    if (conceptsToggleBtn) {
      const isConceptsActive = this.currentView === "concepts";
      conceptsToggleBtn.className = isConceptsActive
        ? "w-full flex items-center justify-center lg:justify-between gap-3 px-3 lg:px-4 py-3 rounded-2xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 transition-all text-left group"
        : "w-full flex items-center justify-center lg:justify-between gap-3 px-3 lg:px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group";
    }

    const tasksToggleBtn = document.getElementById("sidebar-tasks-toggle-btn");
    if (tasksToggleBtn) {
      const isTasksActive = this.currentView === "tasks";
      tasksToggleBtn.className = isTasksActive
        ? "w-full flex items-center justify-center lg:justify-between gap-3 px-3 lg:px-4 py-3 rounded-2xl text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 transition-all text-left group"
        : "w-full flex items-center justify-center lg:justify-between gap-3 px-3 lg:px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group";
    }

    document.querySelectorAll("[data-bottom-nav]").forEach((btn) => {
      const target = btn.getAttribute("data-bottom-nav");
      const isActive = target === this.currentView;
      btn.className = isActive
        ? "flex-1 min-w-0 flex flex-col items-center justify-center py-1 rounded-xl transition-all text-blue-600 dark:text-cyan-400 font-bold active:scale-95"
        : "flex-1 min-w-0 flex flex-col items-center justify-center py-1 rounded-xl transition-all text-slate-500 dark:text-slate-400 font-medium active:scale-95";
    });

    this.syncSidebarDropdownUI();
  }

  // ===========================================================================
  // SHARE MODAL & LIGHTBOX HELPERS
  // ===========================================================================
  openShareModal(customTitle = null, customUrl = null) {
    const modal = document.getElementById("share-modal");
    const input = document.getElementById("share-modal-url");
    if (!modal || !input) return;
    const currentUrl = customUrl || window.location.href;
    const title = customTitle || document.title || "KubeMastery: CNCF Official Exam Prep";
    this.currentShareData = { title, url: currentUrl };
    input.value = currentUrl;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  closeShareModal() {
    const modal = document.getElementById("share-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  copyShareModalUrl() {
    const input = document.getElementById("share-modal-url");
    if (!input) return;
    this.copyText(input.value, "คัดลอกลิงก์เรียบร้อยแล้ว!");
    this.closeShareModal();
  }

  triggerNativeShare() {
    if (navigator.share && this.currentShareData) {
      navigator.share({
        title: this.currentShareData.title,
        url: this.currentShareData.url,
        text: "เรียนรู้และเตรียมสอบ Kubernetes (CKAD & CKA) ด้วยเอกสารแปลทางการและ CLI Drills"
      }).catch(() => {});
    } else {
      this.copyShareModalUrl();
    }
  }

  openLightbox(imgSrc, caption = "Kubernetes Architecture Diagram") {
    const modal = document.getElementById("image-lightbox-modal");
    const img = document.getElementById("lightbox-image");
    const cap = document.getElementById("lightbox-caption");
    const rawLink = document.getElementById("lightbox-open-raw");
    if (!modal || !img) return;
    img.src = imgSrc;
    if (cap) cap.textContent = caption;
    if (rawLink) rawLink.href = imgSrc;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  closeLightbox() {
    const modal = document.getElementById("image-lightbox-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  // ===========================================================================
  // MAIN ROUTER
  // ===========================================================================
  render() {
    this.syncHeaderStats();
    const container = document.getElementById("main-content-view");
    if (!container) return;

    switch (this.currentView) {
      case "dashboard":
        container.innerHTML = this.renderDashboardView();
        break;
      case "lessons":
        this.renderLessonsHub(container);
        break;
      case "concepts":
        this.renderConceptsView(container);
        break;
      case "tasks":
        this.renderTasksView(container);
        break;
      case "cli-playground":
        container.innerHTML = this.renderCliPlaygroundView();
        this.bindCliPlaygroundEvents();
        break;
      case "profile":
        container.innerHTML = this.renderProfileView();
        break;
      default:
        container.innerHTML = this.renderDashboardView();
    }
  }

  // ===========================================================================
  // VIEW: DASHBOARD
  // ===========================================================================
  renderDashboardView() {
    const state = window.storage.getState();
    const courses = window.courseData || [];
    const conceptsIndex = window.KUBE_CONCEPTS_INDEX || { pages: [] };
    const tasksIndex = window.KUBE_TASKS_INDEX || { pages: [] };

    let totalUnits = 0;
    courses.forEach(c => {
      (c.blocks || []).forEach(b => {
        totalUnits += (b.units || []).length;
      });
    });
    const completedUnits = (state.completedUnits || []).length;
    const progressPercent = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0;

    return `
      <div class="space-y-8 animate-fadeIn max-w-6xl mx-auto w-full">
        <!-- Top Hero Banner with Share Button -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-800/40">
          <div class="relative z-10 space-y-4 max-w-3xl">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                <span>☸️ Kubernetes Official Prep</span>
                <span>•</span>
                <span>CKAD &amp; CKA Excellence</span>
              </div>
              <button onclick="window.app.openShareModal('KubeMastery: CNCF Official Exam Prep')" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all">
                <span>🔗</span>
                <span>แชร์หน้านี้ (Share)</span>
              </button>
            </div>

            <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              เตรียมสอบ Kubernetes สู่ระดับมืออาชีพ
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              แพลตฟอร์มติวสอบและคลังเอกสารทางการฉบับสมบูรณ์ แปลเนื้อหาโดยละเอียดจาก kubernetes.io ทั้ง Concepts, Tasks, หลักสูตร CKAD, CKA และ CLI Speed Drills
            </p>
          </div>
        </div>

        <!-- Quick Stats Cards Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span class="text-xs text-slate-400 font-bold">ความคืบหน้าบทเรียน</span>
            <div class="text-xl sm:text-2xl font-black text-blue-600 dark:text-cyan-400">${completedUnits} / ${totalUnits}</div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${progressPercent}%"></div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span class="text-xs text-slate-400 font-bold">คลัง Concepts แปลเต็ม</span>
            <div class="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">${conceptsIndex.pages.length} หน้า</div>
            <p class="text-[10px] text-slate-400">11 หมวดหมู่สถาปัตยกรรม</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span class="text-xs text-slate-400 font-bold">คลัง Tasks แปลเต็ม</span>
            <div class="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400">${tasksIndex.pages.length} หน้า</div>
            <p class="text-[10px] text-slate-400">8 หมวดคู่มือปฏิบัติงาน</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span class="text-xs text-slate-400 font-bold">CLI Speed Playground</span>
            <div class="text-xl sm:text-2xl font-black text-amber-500">${(window.cliDrillsData || []).length} โจทย์</div>
            <p class="text-[10px] text-slate-400">ฝึกพิมพ์คำสั่ง Imperative kubectl</p>
          </div>
        </div>

        <!-- 3 Feature Portals (Lessons, Concepts, Tasks) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onclick="window.app.navigateTo('lessons')" class="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between">
            <div class="space-y-3">
              <span class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">☸️</span>
              <h2 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400">Lessons Hub (คอร์สเรียน)</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">หลักสูตรเตรียมสอบแยกตามข้อสอบ CKAD, CKA และ Foundation พร้อมคำสั่ง Manifest และแบบทดสอบท้ายบท</p>
            </div>
            <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-cyan-400">
              <span>เข้าสู่ห้องเรียน</span>
              <span>➔</span>
            </div>
          </div>

          <div onclick="window.app.navigateTo('concepts')" class="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between">
            <div class="space-y-3">
              <span class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📘</span>
              <h2 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">Kubernetes Concepts</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">เอกสารคำแปลเนื้อหาและสถาปัตยกรรมฉบับสมบูรณ์ (11 หมวด) พร้อมแผนภาพไดอะแกรม SVG คมชัด</p>
            </div>
            <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>เปิดอ่าน Concepts (${conceptsIndex.pages.length} หน้า)</span>
              <span>➔</span>
            </div>
          </div>

          <div onclick="window.app.navigateTo('tasks')" class="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between">
            <div class="space-y-3">
              <span class="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛠️</span>
              <h2 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">Kubernetes Tasks</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">คู่มือปฏิบัติการทีละขั้นตอน (Step-by-Step) แปลฉบับเต็ม พร้อมคำสั่งจริงและตัวอย่าง YAML ทุกสถานการณ์</p>
            </div>
            <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>เปิดอ่าน Tasks (${tasksIndex.pages.length} หน้า)</span>
              <span>➔</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // VIEW: LESSONS HUB (3-TIER)
  // ===========================================================================
  renderLessonsHub(container) {
    if (!this.activeCourseId) {
      this.renderCoursePortal(container);
    } else if (!this.activeUnitId) {
      this.renderCourseBlocksCatalog(container, this.activeCourseId);
    } else {
      this.renderLessonUnitReader(container, this.activeCourseId, this.activeBlockId, this.activeUnitId);
    }
  }

  renderCoursePortal(container) {
    const courses = window.courseData || [];
    const state = window.storage.getState();

    container.innerHTML = `
      <div class="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-14 w-full">
        <!-- Top Banner with Share -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-800/40">
          <div class="relative z-10 space-y-3 max-w-3xl">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                <span>☸️ CNCF Official Curriculum Hub</span>
                <span>•</span>
                <span>เลือกคอร์สเพื่อเตรียมสอบ</span>
              </div>
              <button onclick="window.app.openShareModal('KubeMastery: Lessons Hub')" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all">
                <span>🔗</span>
                <span>แชร์หน้านี้ (Share)</span>
              </button>
            </div>
            <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              เลือกคอร์สเตรียมสอบ Kubernetes ที่คุณต้องการ
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              เมื่อกดเข้าคอร์ส คุณจะได้พบกับบล็อกหัวข้อเตรียมสอบหลายๆ บล็อกที่จัดหมวดหมู่ตามข้อสอบจริง สามารถคลิกเข้าไปอ่านเนื้อหาละเอียด คำสั่ง ตัวอย่าง Manifest และแบบทดสอบทบทวนความเข้าใจได้ทันที
            </p>
          </div>
        </div>

        <!-- 3 Big Course Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          ${courses.map(course => {
            const blocks = course.blocks || [];
            let totalUnits = 0;
            blocks.forEach(b => { totalUnits += (b.units || []).length; });
            const completedInCourse = blocks.reduce((acc, b) => {
              return acc + (b.units || []).filter(u => (state.completedUnits || []).includes(u.id)).length;
            }, 0);
            const percent = totalUnits ? Math.round((completedInCourse / totalUnits) * 100) : 0;

            return `
              <div onclick="window.app.openCourse('${course.id}')"
                class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-500 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden relative">
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${course.color} text-white flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                      ${course.icon}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${course.badgeColor.bg} ${course.badgeColor.text} border ${course.badgeColor.border}">
                      ${course.badge}
                    </span>
                  </div>

                  <div>
                    <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      ${course.title}
                    </h2>
                    <p class="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      ${course.description}
                    </p>
                  </div>

                  <!-- Blocks overview pill list -->
                  <div class="space-y-1.5 pt-1">
                    <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      หมวดหมู่ในคอร์ส (${blocks.length} บล็อก):
                    </div>
                    <div class="flex flex-wrap gap-1">
                      ${blocks.map(b => `
                        <span class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-bold truncate max-w-full">
                          ${b.icon} ${b.title.split(':')[0]}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div class="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div class="flex items-center justify-between text-xs font-bold">
                    <span class="text-slate-400">ความคืบหน้า</span>
                    <span class="text-emerald-500">${completedInCourse} / ${totalUnits} บท (${percent}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r ${course.color} h-2 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                  </div>
                  <div class="pt-2 flex items-center justify-between">
                    <span class="text-[11px] font-bold text-slate-400">${blocks.length} บล็อก • ${totalUnits} บทย่อย</span>
                    <button class="px-3.5 py-1.5 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1">
                      <span>เข้าสู่คอร์ส</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderCourseBlocksCatalog(container, courseId) {
    const courses = window.courseData || [];
    const course = courses.find(c => c.id === courseId) || courses[0];
    const state = window.storage.getState();
    const blocks = course.blocks || [];

    let totalUnits = 0;
    blocks.forEach(b => { totalUnits += (b.units || []).length; });
    const completedUnits = blocks.reduce((acc, b) => {
      return acc + (b.units || []).filter(u => (state.completedUnits || []).includes(u.id)).length;
    }, 0);
    const progressPercent = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0;

    container.innerHTML = `
      <div class="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-14 w-full">
        <!-- Top Navigation Bar & Breadcrumb -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <button onclick="window.app.openCourse(null)"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>← กลับสู่หน้ารวมคอร์ส (Course Hub)</span>
          </button>

          <div class="flex items-center gap-2">
            <button onclick="window.app.openShareModal('${course.title}')" class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <span>🔗</span>
              <span>แชร์</span>
            </button>
            <div class="flex items-center gap-1.5">
              ${courses.map(c => `
                <button onclick="window.app.openCourse('${c.id}')"
                  class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    c.id === course.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }">
                  <span>${c.icon}</span>
                  <span class="hidden sm:inline">${c.badge}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Course Header Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-800/40">
          <div class="relative z-10 space-y-4 max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <span>${course.icon} ${course.badge} Course</span>
              <span>•</span>
              <span>${blocks.length} บล็อกหมวดหมู่ • ${totalUnits} บทย่อย</span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              ${course.title}
            </h1>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ${course.description}
            </p>

            <!-- Course Progress Bar -->
            <div class="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
              <div class="flex-1 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div class="flex items-center justify-between mb-1.5 font-bold">
                  <span class="text-slate-300">ความคืบหน้าของคอร์ส</span>
                  <span class="text-cyan-300">${completedUnits} / ${totalUnits} บทย่อย (${progressPercent}% เสร็จแล้ว)</span>
                </div>
                <div class="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                  <div class="bg-gradient-to-r from-blue-400 to-cyan-400 h-2.5 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Topic Blocks Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          ${blocks.map((block, bIdx) => {
            const units = block.units || [];
            const doneInBlock = units.filter(u => (state.completedUnits || []).includes(u.id)).length;
            const isAllDone = units.length > 0 && doneInBlock === units.length;

            return `
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
                        ${block.icon}
                      </span>
                      <div>
                        <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">บล็อกที่ ${bIdx + 1}</span>
                        <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          ${block.title}
                        </h2>
                      </div>
                    </div>
                    ${isAllDone ? `
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        อ่านจบแล้ว ✓
                      </span>
                    ` : `
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        ${doneInBlock} / ${units.length} บท
                      </span>
                    `}
                  </div>

                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ${block.description}
                  </p>

                  <!-- Units List in Block -->
                  <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    ${units.map((unit) => {
                      const isDone = (state.completedUnits || []).includes(unit.id);
                      return `
                        <div onclick="window.app.openUnitReader('${course.id}', '${block.id}', '${unit.id}')"
                          class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-400'
                              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800 hover:border-blue-400'
                          }">
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="text-xs shrink-0">${isDone ? '✅' : '📄'}</span>
                            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${unit.title}</span>
                          </div>
                          <span class="text-[10px] text-blue-500 dark:text-cyan-400 font-bold shrink-0">อ่าน ➔</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span class="text-[11px] text-slate-400 font-mono">Docs: ${units[0] ? units[0].docsKeyword : ''}</span>
                  <button onclick="window.app.openUnitReader('${course.id}', '${block.id}', '${units[0] ? units[0].id : ''}')"
                    class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1">
                    <span>เปิดอ่านบล็อกนี้</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderLessonUnitReader(container, courseId, blockId, unitId) {
    const courses = window.courseData || [];
    const course = courses.find(c => c.id === courseId) || courses[0];
    const block = (course.blocks || []).find(b => b.id === blockId) || (course.blocks && course.blocks[0]);
    const units = block ? (block.units || []) : [];
    const unit = units.find(u => u.id === unitId) || units[0];

    if (!unit) {
      this.renderCourseBlocksCatalog(container, courseId);
      return;
    }

    const state = window.storage.getState();
    const isUnitDone = (state.completedUnits || []).includes(unit.id);
    const currIndex = units.findIndex(u => u.id === unit.id);
    const prevUnit = currIndex > 0 ? units[currIndex - 1] : null;
    const nextUnit = currIndex < units.length - 1 ? units[currIndex + 1] : null;
    const quizHistory = (state.unitQuizHistory && state.unitQuizHistory[unit.id]) || null;

    container.innerHTML = `
      <div class="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-20 w-full">
        <!-- Breadcrumb & Top Bar Navigation -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <button onclick="window.app.openCourse('${course.id}')"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>← กลับสู่หน้ารวมบล็อก (${course.badge}: ${block.title.split(':')[0]})</span>
          </button>

          <div class="flex items-center gap-2">
            <button onclick="window.app.openShareModal('${unit.title}')" class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1" title="แชร์บทเรียนนี้">
              <span>🔗</span>
              <span>แชร์</span>
            </button>
            ${prevUnit ? `
              <button onclick="window.app.openUnitReader('${course.id}', '${block.id}', '${prevUnit.id}')"
                class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1">
                <span>←</span>
                <span class="hidden sm:inline">ก่อนหน้า</span>
              </button>
            ` : ''}
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
              ${currIndex + 1} / ${units.length}
            </span>
            ${nextUnit ? `
              <button onclick="window.app.openUnitReader('${course.id}', '${block.id}', '${nextUnit.id}')"
                class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1">
                <span class="hidden sm:inline">ถัดไป</span>
                <span>→</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Article Header -->
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${course.badgeColor.bg} ${course.badgeColor.text} border ${course.badgeColor.border}">
                Lessons / ${course.badge}
              </span>
              <span class="text-slate-400 text-xs">/</span>
              <span class="text-xs font-bold text-slate-600 dark:text-slate-300">${block.title}</span>
              <span class="text-slate-400 text-xs">/</span>
              <span class="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">${unit.title}</span>
            </div>

            <button onclick="window.app.toggleCompleteUnit('${unit.id}')"
              class="whitespace-nowrap shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isUnitDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
              }">
              <span>${isUnitDone ? '✅ อ่านจบแล้ว (Completed)' : '🎯 กดทำเครื่องหมายว่าอ่านจบแล้ว'}</span>
            </button>
          </div>

          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              ${unit.title}
            </h1>
          </div>

          <!-- Official Docs Link & Keyword Pill -->
          <div class="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
            <span class="text-xs font-bold text-blue-700 dark:text-cyan-300">📖 อ้างอิงเอกสารทางการ:</span>
            <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
              Docs Keyword: ${this.escapeHtml(unit.docsKeyword)}
            </span>
            <a href="${unit.docsUrl}" target="_blank" rel="noopener noreferrer"
              class="ml-auto inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline">
              <span>เปิดอ่านบน kubernetes.io</span>
              <span>↗</span>
            </a>
          </div>

          <!-- Summary Box -->
          ${unit.summary ? `
            <div class="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <strong class="text-blue-600 dark:text-cyan-400 block mb-1">💡 สรุปใจความสำคัญ (Summary):</strong>
              ${unit.summary}
            </div>
          ` : ''}
        </div>

        <!-- Section 1: Blueprint Box -->
        ${unit.blueprint ? `
          <div class="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
            <div class="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <span>⚡ โครงสร้างคำสั่งหลัก &amp; Blueprint</span>
              </span>
              <button onclick='window.app.copyText(${JSON.stringify(unit.blueprint)}, "คัดลอก Blueprint แล้ว!")'
                class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold">
                📋 Copy
              </button>
            </div>
            <pre class="p-5 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto leading-relaxed">${this.escapeHtml(unit.blueprint)}</pre>
          </div>
        ` : ''}

        <!-- Section 2: Detailed Explanation -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-9 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span class="text-xl">📖</span>
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              คำอธิบายเนื้อหาและหลักการทำงานเพื่อเตรียมสอบ
            </h2>
          </div>
          <div class="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 text-slate-700 dark:text-slate-300">
            ${this.formatMarkdown(unit.explanation)}
          </div>
        </div>

        <!-- Section 3: Real Examples -->
        ${(unit.examples && unit.examples.length) ? `
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-9 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <span class="text-xl">💻</span>
                <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  ตัวอย่างคำสั่งและการเขียน YAML ที่ใช้จริง
                </h2>
              </div>
            </div>

            <div class="space-y-5">
              ${unit.examples.map(ex => `
                <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    ${ex.desc}
                  </div>

                  ${ex.cmd ? `
                    <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div class="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span class="text-[10px] font-mono text-cyan-400">Terminal Command</span>
                        <button onclick='window.app.copyText(${JSON.stringify(ex.cmd)}, "คัดลอกคำสั่งแล้ว!")' class="text-[10px] font-bold text-slate-400 hover:text-white">
                          Copy
                        </button>
                      </div>
                      <pre class="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto">${this.escapeHtml(ex.cmd)}</pre>
                    </div>
                  ` : ''}

                  ${ex.yaml ? `
                    <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div class="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span class="text-[10px] font-mono text-amber-400">YAML Manifest</span>
                        <button onclick='window.app.copyText(${JSON.stringify(ex.yaml)}, "คัดลอก YAML แล้ว!")' class="text-[10px] font-bold text-slate-400 hover:text-white">
                          Copy
                        </button>
                      </div>
                      <pre class="p-3.5 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed">${this.escapeHtml(ex.yaml)}</pre>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Section 4: Exam Pitfalls & Pro Tips -->
        ${(unit.examTips && unit.examTips.length) ? `
          <div class="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
            <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-sm">
              <span>💡</span>
              <span>จุดที่ข้อสอบชอบหลอก &amp; กลเม็ดห้องสอบ (Exam Tips):</span>
            </div>
            <ul class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
              ${unit.examTips.map(tip => `<li>${this.escapeHtml(tip)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Section 5: Quick Check Quiz -->
        ${unit.quickCheck ? `
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎯 คำถามทบทวนความเข้าใจท้ายบท (Quick Check)</span>
              </h3>
            </div>

            <p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              ${this.escapeHtml(unit.quickCheck.question)}
            </p>

            <div class="space-y-2 pt-1">
              ${unit.quickCheck.options.map((opt, oIdx) => {
                const isSelected = quizHistory && quizHistory.answered === oIdx;
                let btnCls = "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400";
                if (quizHistory) {
                  if (oIdx === unit.quickCheck.answer) {
                    btnCls = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold";
                  } else if (isSelected && !quizHistory.correct) {
                    btnCls = "bg-rose-500/20 border-rose-500 text-rose-500";
                  }
                }
                return `
                  <button onclick="window.app.answerUnitQuiz('${unit.id}', ${oIdx})"
                    class="w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-mono transition-all ${btnCls}">
                    ${this.escapeHtml(opt)}
                  </button>
                `;
              }).join('')}
            </div>

            ${quizHistory ? `
              <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-xs text-slate-700 dark:text-cyan-200">
                <strong>💡 เฉลย:</strong> ${this.escapeHtml(unit.quickCheck.explanation)}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Next / Prev Footer Navigation -->
        <div class="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          ${prevUnit ? `
            <button onclick="window.app.openUnitReader('${course.id}', '${block.id}', '${prevUnit.id}')"
              class="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2">
              <span>←</span>
              <span>บทก่อนหน้า (${prevUnit.title.split(':')[0]})</span>
            </button>
          ` : `
            <button onclick="window.app.openCourse('${course.id}')"
              class="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
              <span>← กลับไปหน้ารวมบล็อก</span>
            </button>
          `}

          <button onclick="window.app.openCourse('${course.id}')"
            class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
            หน้ารวมบล็อกหัวข้อ
          </button>

          ${nextUnit ? `
            <button onclick="window.app.openUnitReader('${course.id}', '${block.id}', '${nextUnit.id}')"
              class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow">
              <span>บทถัดไป (${nextUnit.title.split(':')[0]})</span>
              <span>→</span>
            </button>
          ` : `
            <button onclick="window.app.openCourse(null)"
              class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow">
              <span>จบคอร์สนี้แล้ว 🎉</span>
            </button>
          `}
        </div>
      </div>
    `;
  }

  // Course Hub Navigation helpers
  openCourse(courseId) {
    this.navigateTo("lessons", { courseId, blockId: null, unitId: null });
  }

  openUnitReader(courseId, blockId, unitId) {
    this.navigateTo("lessons", { courseId, blockId, unitId });
  }

  toggleCompleteUnit(unitId) {
    const isDone = window.storage.toggleUnitCompletion(unitId);
    if (isDone) {
      if (window.soundFx && window.soundFx.playCelebration) window.soundFx.playCelebration();
      this.showToast("✅ บันทึกสถานะเรียนจบบทนี้แล้ว", "success");
    } else {
      this.showToast("ยกเลิกสถานะเรียนจบแล้ว", "info");
    }
    this.render();
  }

  answerUnitQuiz(unitId, selectedOption) {
    const courses = window.courseData || [];
    let foundUnit = null;
    for (const c of courses) {
      for (const b of (c.blocks || [])) {
        const u = (b.units || []).find(x => x.id === unitId);
        if (u) { foundUnit = u; break; }
      }
      if (foundUnit) break;
    }

    if (!foundUnit || !foundUnit.quickCheck) return;
    const isCorrect = selectedOption === foundUnit.quickCheck.answer;

    window.storage.recordUnitQuizAnswer(unitId, selectedOption, isCorrect);
    if (isCorrect) {
      if (window.soundFx && window.soundFx.playCorrect) window.soundFx.playCorrect();
      this.showToast("🎉 ตอบถูกต้อง!", "success");
    } else {
      if (window.soundFx && window.soundFx.playWrong) window.soundFx.playWrong();
      this.showToast("ยังไม่ถูกต้อง ลองอ่านเฉลยดูนะครับ", "error");
    }
    this.render();
  }

  // ===========================================================================
  // SIDEBAR DROPDOWN NAVIGATION (CONCEPTS & TASKS)
  // ===========================================================================
  toggleConceptsDropdown() {
    this.isConceptsDropdownOpen = !this.isConceptsDropdownOpen;
    if (this.isConceptsDropdownOpen && this.currentView !== "concepts") {
      this.navigateTo("concepts");
    } else {
      this.syncSidebarDropdownUI();
    }
  }

  toggleTasksDropdown() {
    this.isTasksDropdownOpen = !this.isTasksDropdownOpen;
    if (this.isTasksDropdownOpen && this.currentView !== "tasks") {
      this.navigateTo("tasks");
    } else {
      this.syncSidebarDropdownUI();
    }
  }

  filterSidebarConcepts(val) {
    this.conceptSearchTerm = val;
    const desktopEl = document.getElementById("sidebar-concepts-dropdown");
    const mobileEl = document.getElementById("mobile-concepts-dropdown");
    if (desktopEl && this.isConceptsDropdownOpen) {
      desktopEl.innerHTML = this.renderConceptsDropdownContent(false);
      const search = desktopEl.querySelector("input");
      if (search) {
        search.focus();
        search.setSelectionRange(val.length, val.length);
      }
    }
    if (mobileEl && this.isConceptsDropdownOpen) {
      mobileEl.innerHTML = this.renderConceptsDropdownContent(true);
      const search = mobileEl.querySelector("input");
      if (search) {
        search.focus();
        search.setSelectionRange(val.length, val.length);
      }
    }
  }

  filterSidebarTasks(val) {
    this.taskSearchTerm = val;
    const desktopEl = document.getElementById("sidebar-tasks-dropdown");
    const mobileEl = document.getElementById("mobile-tasks-dropdown");
    if (desktopEl && this.isTasksDropdownOpen) {
      desktopEl.innerHTML = this.renderTasksDropdownContent(false);
      const search = desktopEl.querySelector("input");
      if (search) {
        search.focus();
        search.setSelectionRange(val.length, val.length);
      }
    }
    if (mobileEl && this.isTasksDropdownOpen) {
      mobileEl.innerHTML = this.renderTasksDropdownContent(true);
      const search = mobileEl.querySelector("input");
      if (search) {
        search.focus();
        search.setSelectionRange(val.length, val.length);
      }
    }
  }

  syncSidebarDropdownUI() {
    // Concepts Chevron
    const cChevron = document.getElementById("sidebar-concepts-chevron");
    const mcChevron = document.getElementById("mobile-concepts-chevron");
    if (cChevron) cChevron.style.transform = this.isConceptsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)";
    if (mcChevron) mcChevron.style.transform = this.isConceptsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)";

    // Tasks Chevron
    const tChevron = document.getElementById("sidebar-tasks-chevron");
    const mtChevron = document.getElementById("mobile-tasks-chevron");
    if (tChevron) tChevron.style.transform = this.isTasksDropdownOpen ? "rotate(180deg)" : "rotate(0deg)";
    if (mtChevron) mtChevron.style.transform = this.isTasksDropdownOpen ? "rotate(180deg)" : "rotate(0deg)";

    // Desktop Concepts Dropdown
    const cDropdown = document.getElementById("sidebar-concepts-dropdown");
    if (cDropdown) {
      if (this.isConceptsDropdownOpen) {
        cDropdown.classList.remove("hidden");
        cDropdown.innerHTML = this.renderConceptsDropdownContent(false);
      } else {
        cDropdown.classList.add("hidden");
      }
    }

    // Mobile Concepts Dropdown
    const mcDropdown = document.getElementById("mobile-concepts-dropdown");
    if (mcDropdown) {
      if (this.isConceptsDropdownOpen) {
        mcDropdown.classList.remove("hidden");
        mcDropdown.innerHTML = this.renderConceptsDropdownContent(true);
      } else {
        mcDropdown.classList.add("hidden");
      }
    }

    // Desktop Tasks Dropdown
    const tDropdown = document.getElementById("sidebar-tasks-dropdown");
    if (tDropdown) {
      if (this.isTasksDropdownOpen) {
        tDropdown.classList.remove("hidden");
        tDropdown.innerHTML = this.renderTasksDropdownContent(false);
      } else {
        tDropdown.classList.add("hidden");
      }
    }

    // Mobile Tasks Dropdown
    const mtDropdown = document.getElementById("mobile-tasks-dropdown");
    if (mtDropdown) {
      if (this.isTasksDropdownOpen) {
        mtDropdown.classList.remove("hidden");
        mtDropdown.innerHTML = this.renderTasksDropdownContent(true);
      } else {
        mtDropdown.classList.add("hidden");
      }
    }
  }

  renderConceptsDropdownContent(isMobile = false) {
    const index = window.KUBE_CONCEPTS_INDEX || { pages: [] };
    const pages = index.pages || [];
    const filter = (this.conceptSearchTerm || "").toLowerCase();
    const filteredPages = pages.filter(p => {
      return p.titleEn.toLowerCase().includes(filter) ||
             p.titleTh.toLowerCase().includes(filter) ||
             p.categoryTitle.toLowerCase().includes(filter);
    });

    const categories = {};
    filteredPages.forEach(p => {
      if (!categories[p.categoryId]) {
        categories[p.categoryId] = { title: p.categoryTitle, items: [] };
      }
      categories[p.categoryId].items.push(p);
    });

    return `
      <div class="space-y-2 py-1 pr-1">
        <!-- Quick Search Input -->
        <div class="relative px-1">
          <input type="text"
            placeholder="Search Concepts..."
            value="${this.escapeHtml(this.conceptSearchTerm)}"
            oninput="window.app.filterSidebarConcepts(this.value)"
            class="w-full px-2.5 py-1.5 pl-7 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500" />
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- Categorized Pages List -->
        <div class="max-h-[50vh] overflow-y-auto space-y-3 pr-1 text-xs">
          ${Object.keys(categories).length === 0 ? `
            <div class="text-slate-400 text-center py-4 text-[11px]">No documents found</div>
          ` : Object.keys(categories).map(catId => {
            const cat = categories[catId];
            const catTitleEn = (cat.title || "").replace(/\s*\([^)]*\)/g, "").trim().toUpperCase();
            return `
              <div class="space-y-1">
                <div class="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">
                  ${catTitleEn}
                </div>
                <div class="space-y-0.5">
                  ${cat.items.map(p => {
                    const isActive = p.id === this.activeConceptPageId && this.currentView === "concepts";
                    return `
                      <button onclick="window.app.openConceptPage('${p.id}'); ${isMobile ? 'window.app.closeMobileDrawer();' : ''}"
                        title="${this.escapeHtml(p.titleEn)}"
                        class="w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between gap-1.5 text-[11px] ${
                          isActive
                            ? 'bg-purple-100/80 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold border-l-2 border-purple-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }">
                        <span class="truncate">${p.titleEn}</span>
                        <span class="text-[9px] shrink-0 ${isActive ? 'text-purple-500 font-bold' : 'text-slate-400'}">${isActive ? '●' : '›'}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderTasksDropdownContent(isMobile = false) {
    const index = window.KUBE_TASKS_INDEX || { pages: [] };
    const pages = index.pages || [];
    const filter = (this.taskSearchTerm || "").toLowerCase();
    const filteredPages = pages.filter(p => {
      return p.titleEn.toLowerCase().includes(filter) ||
             p.titleTh.toLowerCase().includes(filter) ||
             p.categoryTitle.toLowerCase().includes(filter);
    });

    const categories = {};
    filteredPages.forEach(p => {
      if (!categories[p.categoryId]) {
        categories[p.categoryId] = { title: p.categoryTitle, items: [] };
      }
      categories[p.categoryId].items.push(p);
    });

    return `
      <div class="space-y-2 py-1 pr-1">
        <!-- Quick Search Input -->
        <div class="relative px-1">
          <input type="text"
            placeholder="Search Tasks..."
            value="${this.escapeHtml(this.taskSearchTerm)}"
            oninput="window.app.filterSidebarTasks(this.value)"
            class="w-full px-2.5 py-1.5 pl-7 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500" />
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- Categorized Pages List -->
        <div class="max-h-[50vh] overflow-y-auto space-y-3 pr-1 text-xs">
          ${Object.keys(categories).length === 0 ? `
            <div class="text-slate-400 text-center py-4 text-[11px]">No tasks found</div>
          ` : Object.keys(categories).map(catId => {
            const cat = categories[catId];
            const catTitleEn = (cat.title || "").replace(/\s*\([^)]*\)/g, "").trim().toUpperCase();
            return `
              <div class="space-y-1">
                <div class="text-[9px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded">
                  ${catTitleEn}
                </div>
                <div class="space-y-0.5">
                  ${cat.items.map(p => {
                    const isActive = p.id === this.activeTaskPageId && this.currentView === "tasks";
                    return `
                      <button onclick="window.app.openTaskPage('${p.id}'); ${isMobile ? 'window.app.closeMobileDrawer();' : ''}"
                        title="${this.escapeHtml(p.titleEn)}"
                        class="w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between gap-1.5 text-[11px] ${
                          isActive
                            ? 'bg-teal-100/80 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-bold border-l-2 border-teal-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }">
                        <span class="truncate">${p.titleEn}</span>
                        <span class="text-[9px] shrink-0 ${isActive ? 'text-teal-500 font-bold' : 'text-slate-400'}">${isActive ? '●' : '›'}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // VIEW: KUBERNETES CONCEPTS (FULL-WIDTH DOCUMENT READER)
  // ===========================================================================
  renderConceptsView(container) {
    const index = window.KUBE_CONCEPTS_INDEX || { pages: [] };
    const pagesMap = window.KUBE_CONCEPTS_PAGES || {};
    const pages = index.pages || [];
    const activeId = this.activeConceptPageId || (pages[0] && pages[0].id);
    const currentPage = pagesMap[activeId] || pagesMap[pages[0]?.id] || null;

    container.innerHTML = `
      <div class="max-w-[1300px] mx-auto w-full pb-16 animate-fadeIn space-y-6">
        ${currentPage ? this.renderDocArticle(currentPage, "concepts") : `
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
            Please select a document from the Concepts menu on the left.
          </div>
        `}
      </div>
    `;
  }

  filterConcepts(val) {
    this.conceptSearchTerm = val;
    this.syncSidebarDropdownUI();
  }

  openConceptPage(pageId, anchor = null) {
    this.activeConceptPageId = pageId;
    this.navigateTo("concepts", { conceptPageId: pageId });
    this.syncSidebarDropdownUI();
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  // ===========================================================================
  // VIEW: KUBERNETES TASKS (FULL-WIDTH DOCUMENT READER)
  // ===========================================================================
  renderTasksView(container) {
    const index = window.KUBE_TASKS_INDEX || { pages: [] };
    const pagesMap = window.KUBE_TASKS_PAGES || {};
    const pages = index.pages || [];
    const activeId = this.activeTaskPageId || (pages[0] && pages[0].id);
    const currentPage = pagesMap[activeId] || pagesMap[pages[0]?.id] || null;

    container.innerHTML = `
      <div class="max-w-[1300px] mx-auto w-full pb-16 animate-fadeIn space-y-6">
        ${currentPage ? this.renderDocArticle(currentPage, "tasks") : `
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
            Please select a task from the Tasks menu on the left.
          </div>
        `}
      </div>
    `;
  }

  filterTasks(val) {
    this.taskSearchTerm = val;
    this.syncSidebarDropdownUI();
  }

  openTaskPage(pageId, anchor = null) {
    this.activeTaskPageId = pageId;
    this.navigateTo("tasks", { taskPageId: pageId });
    this.syncSidebarDropdownUI();
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  // ===========================================================================
  // DOCUMENT ARTICLE RENDERER (SHARED FOR CONCEPTS & TASKS)
  // ===========================================================================
  renderDocArticle(page, docType) {
    const badgeColor = docType === "concepts"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      : "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800";

    const badgeLabel = docType === "concepts" ? "Concepts" : "Tasks";
    const shareUrl = window.location.href;

    const pages = (docType === "concepts" ? window.KUBE_CONCEPTS_INDEX?.pages : window.KUBE_TASKS_INDEX?.pages) || [];
    const currentIndex = pages.findIndex(p => p.id === page.id);
    const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
    const nextPage = currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;
    const catClean = page.categoryTitle.replace(/\s*\([^)]*\)/g, '').trim();

    return `
      <article class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <!-- Top Pagination (Previous / Next Article) -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          ${prevPage ? `
            <button onclick="window.app.${docType === 'concepts' ? 'openConceptPage' : 'openTaskPage'}('${prevPage.id}')"
              class="w-full sm:w-auto px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2.5 text-left transition-all group">
              <span class="text-base text-slate-400 group-hover:-translate-x-1 transition-transform">←</span>
              <div class="min-w-0">
                <div class="text-[9px] text-slate-400 uppercase font-bold tracking-wider">PREVIOUS</div>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[240px]">${prevPage.titleEn}</div>
              </div>
            </button>
          ` : '<div></div>'}

          ${nextPage ? `
            <button onclick="window.app.${docType === 'concepts' ? 'openConceptPage' : 'openTaskPage'}('${nextPage.id}')"
              class="w-full sm:w-auto px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2.5 text-right transition-all group sm:ml-auto">
              <div class="min-w-0">
                <div class="text-[9px] text-slate-400 uppercase font-bold tracking-wider">NEXT</div>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[240px]">${nextPage.titleEn}</div>
              </div>
              <span class="text-base text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ` : '<div></div>'}
        </div>

        <!-- Top Breadcrumb & Share Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badgeColor}">
              ${badgeLabel}
            </span>
            <span>/</span>
            <span class="font-bold text-slate-700 dark:text-slate-300">${catClean}</span>
            <span>/</span>
            <span class="font-mono font-bold text-cyan-600 dark:text-cyan-400">Official Title: ${page.titleEn}</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Share Button -->
            <button onclick="window.app.openShareModal('${page.titleEn}', '${shareUrl}')"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all">
              <span>🔗</span>
              <span>Share</span>
            </button>

            <!-- External Official Docs Link -->
            <a href="${page.officialUrl}" target="_blank" rel="noopener noreferrer"
              class="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-all">
              <span>kubernetes.io</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <!-- Titles & Lead -->
        <div class="space-y-3">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            ${page.titleTh}
          </h1>
          <div class="text-xs sm:text-sm font-mono text-cyan-600 dark:text-cyan-400">
            ${badgeLabel} / ${catClean} / Official Title: ${page.titleEn}
          </div>
          ${page.lead ? `
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              ${this.formatMarkdown(page.lead)}
            </div>
          ` : ''}
        </div>

        <!-- Architecture Diagram Box (If present) -->
        ${page.diagram ? `
          <div class="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 shadow-md">
            <div class="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span class="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <span>🖼️</span>
                <span>${page.diagram.caption}</span>
              </span>
              <button onclick="window.app.openLightbox('${page.diagram.src}', '${page.diagram.caption}')"
                class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1">
                <span>🔍</span>
                <span>ขยายภาพ (Zoom)</span>
              </button>
            </div>
            <div class="p-4 sm:p-6 flex items-center justify-center cursor-pointer group" onclick="window.app.openLightbox('${page.diagram.src}', '${page.diagram.caption}')">
              <img src="${page.diagram.src}" alt="${page.diagram.caption}" class="max-h-80 w-auto object-contain rounded-xl group-hover:scale-102 transition-transform duration-300" />
            </div>
          </div>
        ` : ''}

        <!-- In-Page Table of Contents (On this page) -->
        ${(page.sections && page.sections.length > 1) ? `
          <div class="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 space-y-2">
            <div class="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              📌 On this page:
            </div>
            <div class="flex flex-wrap gap-2">
              ${page.sections.map(s => `
                <a href="#${s.id}" onclick="document.getElementById('${s.id}')?.scrollIntoView({behavior:'smooth'}); return false;"
                  class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-xs text-slate-700 dark:text-slate-300 transition-colors">
                  ${s.headingEn || s.headingTh}
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Sections Content -->
        <div class="space-y-8 pt-2">
          ${(page.sections || []).map((sec, sIdx) => `
            <section id="${sec.id}" class="space-y-3 pt-2 scroll-mt-24">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 class="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-blue-600 dark:text-cyan-400">#${sIdx + 1}</span>
                  <span>${sec.headingTh}</span>
                </h2>
                <a href="#${sec.id}" onclick="window.app.copyText(window.location.origin + window.location.pathname + window.location.hash + '?section=${sec.id}', 'คัดลอกลิงก์ตรงไปยังหัวข้อนี้แล้ว!'); return false;"
                  class="text-xs text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 font-mono shrink-0" title="คัดลอกลิงก์ตรงไปยังหัวข้อนี้">
                  # Link
                </a>
              </div>
              <div class="text-xs text-slate-400 dark:text-slate-400 font-mono flex flex-wrap items-center gap-1.5">
                <span class="text-slate-500">${badgeLabel} / ${catClean} / Official Title: ${page.titleEn}</span>
                <span>•</span>
                <span class="text-cyan-600 dark:text-cyan-400 font-semibold">${sec.headingEn}</span>
              </div>

              <!-- Content Markdown -->
              <div class="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 text-slate-700 dark:text-slate-300">
                ${this.formatMarkdown(sec.contentMarkdown)}
              </div>

              <!-- Code blocks (if any) -->
              ${(sec.codeBlocks || []).map(cb => `
                <div class="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                  <div class="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span class="font-mono text-cyan-400">${cb.label || cb.lang}</span>
                    <button onclick='window.app.copyText(${JSON.stringify(cb.code)}, "คัดลอกโค้ดเรียบร้อยแล้ว!")'
                      class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">
                      📋 Copy
                    </button>
                  </div>
                  <pre class="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed">${this.escapeHtml(cb.code)}</pre>
                </div>
              `).join('')}
            </section>
          `).join('')}
        </div>

        <!-- Related Links / What's next -->
        ${(page.relatedLinks && page.relatedLinks.length) ? `
          <div class="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🔗</span>
              <span>ลิงก์ที่เกี่ยวข้องและขั้นตอนถัดไป (What's next):</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${page.relatedLinks.map(link => `
                <div onclick="window.app.navigateRelatedLink('${link.targetType}', '${link.targetPageId}', '${link.officialUrl}')"
                  class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 cursor-pointer transition-all flex items-center justify-between gap-3 group">
                  <div class="space-y-0.5 min-w-0">
                    <div class="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400">${link.targetType.toUpperCase()}</div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500">${link.title}</div>
                  </div>
                  <span class="text-slate-400 group-hover:text-blue-500 shrink-0">➔</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <!-- Bottom Pagination (Previous / Next Article) -->
        <div class="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          ${prevPage ? `
            <button onclick="window.app.${docType === 'concepts' ? 'openConceptPage' : 'openTaskPage'}('${prevPage.id}')"
              class="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-left transition-all group">
              <span class="text-lg text-slate-400 group-hover:-translate-x-1 transition-transform">←</span>
              <div class="min-w-0">
                <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">PREVIOUS</div>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[260px]">${prevPage.titleEn}</div>
              </div>
            </button>
          ` : '<div></div>'}

          ${nextPage ? `
            <button onclick="window.app.${docType === 'concepts' ? 'openConceptPage' : 'openTaskPage'}('${nextPage.id}')"
              class="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 text-right transition-all group ml-auto">
              <div class="min-w-0">
                <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">NEXT</div>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[260px]">${nextPage.titleEn}</div>
              </div>
              <span class="text-lg text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ` : '<div></div>'}
        </div>
      </article>
    `;
  }

  navigateRelatedLink(targetType, targetPageId, fallbackUrl) {
    if (targetType === "concepts") {
      this.openConceptPage(targetPageId);
    } else if (targetType === "tasks") {
      this.openTaskPage(targetPageId);
    } else if (targetType === "courses") {
      // Find course unit
      const courses = window.courseData || [];
      for (const c of courses) {
        for (const b of (c.blocks || [])) {
          const u = (b.units || []).find(x => x.id === targetPageId);
          if (u) {
            this.openUnitReader(c.id, b.id, u.id);
            return;
          }
        }
      }
      this.openCourse(null);
    } else if (fallbackUrl) {
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }

  // ===========================================================================
  // VIEW: CLI SPEED PLAYGROUND
  // ===========================================================================
  renderCliPlaygroundView() {
    const drills = window.cliDrillsData || [];
    const currentDrill = drills[this.cliDrillIndex] || drills[0];
    const categories = ["ALL", "PODS", "DEPLOYMENTS", "SERVICES", "CONFIG", "TROUBLESHOOTING", "ADVANCED"];

    return `
      <div class="space-y-8 animate-fadeIn max-w-4xl mx-auto w-full pb-16">
        <!-- Header with Share -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">⌨️ Imperative CLI Speed Playground</h1>
            <p class="text-xs text-slate-400">ฝึกพิมพ์คำสั่ง kubectl ให้เร็วและแม่นยำ พร้อมระบบตรวจคำตอบอัตโนมัติ</p>
          </div>
          <button onclick="window.app.openShareModal('KubeMastery: CLI Playground', window.location.href)"
            class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all">
            <span>🔗</span>
            <span>แชร์</span>
          </button>
        </div>

        <!-- Category Selector -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          ${categories.map(cat => `
            <button onclick="window.app.setCliCategoryFilter('${cat}')"
              class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                this.cliCategoryFilter === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Terminal Challenge Box -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 sm:p-8">
          <div class="flex items-center justify-between text-xs">
            <span class="px-2.5 py-1 rounded-full bg-blue-500/20 text-cyan-300 font-mono font-bold">
              โจทย์ข้อที่ ${this.cliDrillIndex + 1} / ${drills.length} • ${currentDrill.examTag}
            </span>
            <span class="text-slate-400 font-mono">${currentDrill.category}</span>
          </div>

          <div class="space-y-2">
            <h2 class="text-lg sm:text-xl font-bold text-white">${currentDrill.title}</h2>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              ${currentDrill.scenario}
            </p>
          </div>

          <!-- Command Input Form -->
          <form onsubmit="window.app.submitCliAnswer(event)" class="space-y-3 pt-2">
            <div class="flex items-center gap-2 bg-black/60 p-3 rounded-2xl border border-slate-800 focus-within:border-cyan-500">
              <span class="text-emerald-400 font-mono font-bold text-sm select-none">$</span>
              <input id="cli-input-box" type="text"
                placeholder="พิมพ์คำสั่ง kubectl ที่นี่..."
                autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                class="w-full bg-transparent font-mono text-xs sm:text-sm text-white focus:outline-none" />
              <button type="submit" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 shadow">
                รันคำสั่ง ↵
              </button>
            </div>
          </form>

          <!-- Feedback message -->
          <div id="cli-feedback-box"></div>

          <!-- Actions -->
          <div class="pt-3 flex items-center justify-between border-t border-slate-900 text-xs">
            <button onclick="window.app.revealCliSolution()" class="text-slate-400 hover:text-amber-400 font-bold">
              💡 ดูเฉลยคำสั่ง
            </button>
            <div class="flex items-center gap-2">
              <button onclick="window.app.prevCliDrill()" class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white font-bold">
                ← ข้อก่อนหน้า
              </button>
              <button onclick="window.app.nextCliDrill()" class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white font-bold">
                ข้อถัดไป →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindCliPlaygroundEvents() {
    const input = document.getElementById("cli-input-box");
    if (input) input.focus();
  }

  submitCliAnswer(e) {
    if (e) e.preventDefault();
    const input = document.getElementById("cli-input-box");
    const feedback = document.getElementById("cli-feedback-box");
    if (!input || !feedback) return;
    const drills = window.cliDrillsData || [];
    const currentDrill = drills[this.cliDrillIndex] || drills[0];

    const result = window.kubectlEngine.evaluateCommand(input.value, currentDrill);
    if (result.isCorrect) {
      if (window.soundFx && window.soundFx.playCorrect) window.soundFx.playCorrect();
      feedback.innerHTML = `
        <div class="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
          🎉 ถูกต้องยอดเยี่ยม! คำสั่งของคุณทำงานได้ตามเป้าหมาย
        </div>
      `;
    } else {
      if (window.soundFx && window.soundFx.playWrong) window.soundFx.playWrong();
      feedback.innerHTML = `
        <div class="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono space-y-1">
          <div>❌ ยังไม่ถูกต้อง: ${result.reason || "คำสั่งไม่ตรงกับเงื่อนไข"}</div>
          <div class="text-[11px] text-slate-400">ลองตรวจสอบ flag หรือชื่อ resource อีกครั้ง</div>
        </div>
      `;
    }
  }

  revealCliSolution() {
    const drills = window.cliDrillsData || [];
    const currentDrill = drills[this.cliDrillIndex] || drills[0];
    const feedback = document.getElementById("cli-feedback-box");
    if (!feedback) return;
    feedback.innerHTML = `
      <div class="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs font-mono space-y-2">
        <div>💡 <strong>คำสั่งเฉลย:</strong></div>
        <div class="bg-black/60 p-2.5 rounded-lg text-emerald-300">${currentDrill.canonicalCommand}</div>
        <div class="text-[11px] text-slate-300">${currentDrill.explanation}</div>
      </div>
    `;
  }

  setCliCategoryFilter(cat) {
    this.cliCategoryFilter = cat;
    const drills = window.cliDrillsData || [];
    if (cat === "ALL") {
      this.cliDrillIndex = 0;
    } else {
      const idx = drills.findIndex(d => d.category.toUpperCase() === cat);
      if (idx !== -1) this.cliDrillIndex = idx;
    }
    this.render();
  }

  prevCliDrill() {
    const drills = window.cliDrillsData || [];
    if (this.cliDrillIndex > 0) {
      this.cliDrillIndex--;
      this.navigateTo("cli-playground", { drillIndex: this.cliDrillIndex });
    }
  }

  nextCliDrill() {
    const drills = window.cliDrillsData || [];
    if (this.cliDrillIndex < drills.length - 1) {
      this.cliDrillIndex++;
      this.navigateTo("cli-playground", { drillIndex: this.cliDrillIndex });
    }
  }

  openCliDrillByIndex(idx) {
    this.cliDrillIndex = idx;
    this.navigateTo("cli-playground", { drillIndex: idx });
  }

  // ===========================================================================
  // VIEW: PROFILE
  // ===========================================================================
  renderProfileView() {
    const state = window.storage.getState();
    const courses = window.courseData || [];
    let totalUnits = 0;
    courses.forEach(c => (c.blocks || []).forEach(b => { totalUnits += (b.units || []).length; }));
    const completedUnits = (state.completedUnits || []).length;
    const passedQuizzes = Object.values(state.unitQuizHistory || {}).filter(q => q && q.correct).length;

    return `
      <div class="space-y-8 animate-fadeIn max-w-3xl mx-auto w-full pb-16">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <span class="text-4xl">${state.profile.avatar || '☸️'}</span>
              <div>
                <h1 class="text-xl font-black text-slate-900 dark:text-white">${state.profile.name || 'Kubestronaut'}</h1>
                <p class="text-xs text-slate-400">เป้าหมาย: ${state.profile.targetExam || 'CKAD & CKA'}</p>
              </div>
            </div>
            <button onclick="window.app.openShareModal('โปรไฟล์ผู้เรียน: ' + (window.storage.getState().profile.name || 'Kubestronaut'))" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🔗</span>
              <span>แชร์โปรไฟล์</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="text-slate-400">บทเรียนที่อ่านจบแล้ว</div>
              <div class="text-xl font-black text-blue-600 dark:text-cyan-400 mt-1">${completedUnits} / ${totalUnits} บท</div>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="text-slate-400">แบบทดสอบท้ายบทที่ผ่าน</div>
              <div class="text-xl font-black text-emerald-500 mt-1">${passedQuizzes} ข้อ ✓</div>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">สำรองข้อมูลและความคืบหน้า (Backup &amp; Restore)</h3>
            <div class="flex items-center gap-3 flex-wrap">
              <button onclick="window.app.exportBackup()" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow">
                💾 Export JSON Backup
              </button>
              <label class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer">
                📂 Import Backup
                <input type="file" accept=".json" onchange="window.app.importBackup(event)" class="hidden" />
              </label>
              <button onclick="window.app.resetProgress()" class="px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold ml-auto">
                รีเซ็ตข้อมูลทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  exportBackup() {
    const stateStr = JSON.stringify(window.storage.getState(), null, 2);
    const blob = new Blob([stateStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kubemastery-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("สำรองข้อมูลสำเร็จแล้ว!", "success");
  }

  importBackup(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        window.storage.state = parsed;
        window.storage.save();
        this.showToast("กู้คืนข้อมูลสำเร็จแล้ว!", "success");
        this.render();
      } catch (err) {
        this.showToast("ไฟล์ข้อมูลไม่ถูกต้อง", "error");
      }
    };
    reader.readAsText(file);
  }

  resetProgress() {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตประวัติการเรียนและความคืบหน้าทั้งหมด?")) {
      window.storage.resetState();
      this.showToast("รีเซ็ตความคืบหน้าเรียบร้อยแล้ว", "info");
      this.render();
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new KubeMasteryApp();
});
