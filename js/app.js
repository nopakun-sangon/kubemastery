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

    // Initialize CKAD Hands-On Exam Labs State
    this.initCkadLabsState();

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
      setTimeout(() => {
        if (typeof toast.remove === "function") toast.remove();
      }, 260);
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

  handleHashRoute() {
    return this.handleHashChange();
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
    } else if (route === "ckad-labs") {
      const ckadTab = parts[1] || this.ckadTab || "exam";
      const blueprintId = parts[2] || null;
      this.navigateTo("ckad-labs", { ckadTab, blueprintId }, false);
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
    if (params.ckadTab !== undefined && ["exam", "sets", "analytics"].includes(params.ckadTab)) {
      this.ckadTab = params.ckadTab;
      if (this.ckadLabState) {
        this.ckadLabState.subView = params.ckadTab;
      }
    }
    if (params.blueprintId) {
      this.selectOrBuildCkadBlueprint(params.blueprintId, params.seed || null);
    }

    if (view === "concepts") {
      this.isConceptsDropdownOpen = true;
    } else if (view === "tasks") {
      this.isTasksDropdownOpen = true;
    } else if (view === "ckad-labs") {
      this.ensureCkadTimerLoop();
      this.syncCkadBackendStatus();
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
      } else if (view === "ckad-labs") {
        if (this.ckadTab && this.ckadTab !== "exam") {
          newHash = `#/ckad-labs/${this.ckadTab}`;
        }
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

  updateActiveNav() {
    return this.updateActiveNavButtons();
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
      case "ckad-labs":
        container.innerHTML = this.renderCkadLabsView();
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
  renderDashboard() {
    return this.renderDashboardView();
  }

  renderDashboardView() {
    const state = window.storage.getState();
    const courses = window.courseData || [];
    const conceptsIndex = window.KUBE_CONCEPTS_INDEX || { pages: [] };
    const tasksIndex = window.KUBE_TASKS_INDEX || { pages: [] };
    const ckadCatalog = window.CKAD_LABS_DATA || { blueprints: [], domains: [] };

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
              แพลตฟอร์มติวสอบและคลังเอกสารทางการฉบับสมบูรณ์ แปลเนื้อหาโดยละเอียดจาก kubernetes.io ทั้ง Concepts, Tasks, หลักสูตร CKAD, CKA, สนามสอบจริง CKAD Hands-On Labs และ CLI Speed Drills
            </p>
          </div>
        </div>

        <!-- Prominent CKAD Hands-On Exam Labs Banner Card -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-900 border border-indigo-500/40 p-6 sm:p-7 text-white shadow-xl">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-3 max-w-3xl">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
                  🧪 Real Terminal + AI Auto-Grader
                </span>
                <span class="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                  100% Official CNCF CKAD 5 Domains (${ckadCatalog.blueprints.length || 20} Blueprints • สุ่มโจทย์ไม่จำกัด)
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black tracking-tight text-white">
                🧪 CKAD Hands-On Exam Labs (ทำข้อสอบจริงผ่านโปรแกรม Terminal ของคุณ)
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ฝึกทำโจทย์ CKAD เสมือนสอบจริงครบทั้ง 5 หมวด: กดปุ่มให้ระบบสร้างโฟลเดอร์โจทย์ <code class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">~/ckad-workspace/</code> และคลัสเตอร์จำลองบนเครื่อง ➔ เปิดโปรแกรม Terminal ของคุณพิมพ์ <code class="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">kubectl</code> แก้โจทย์จริง ➔ กดตรวจคำตอบพร้อมดูวิเคราะห์จุดผิดราย Checkpoint และเวลาที่ใช้!
              </p>
            </div>
            <div class="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
              <button onclick="window.app.navigateTo('ckad-labs', { ckadTab: 'exam' })" class="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>🖥️ เข้าสู่สนามสอบ CKAD Labs</span>
                <span>➔</span>
              </button>
              <div class="flex items-center gap-2">
                <button onclick="window.app.navigateTo('ckad-labs', { ckadTab: 'sets' })" class="flex-1 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-slate-200 transition-all cursor-pointer">
                  📋 ชุดข้อสอบ &amp; เลือกหมวด
                </button>
                <button onclick="window.app.navigateTo('ckad-labs', { ckadTab: 'analytics' })" class="flex-1 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-slate-200 transition-all cursor-pointer">
                  📊 สถิติ &amp; วิเคราะห์จุดผิด
                </button>
              </div>
            </div>
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

  toggleDocSummary() {
    const content = document.getElementById("doc-summary-content");
    const chevron = document.getElementById("doc-summary-chevron");
    if (!content || !chevron) return;
    const isHidden = content.classList.contains("hidden");
    if (isHidden) {
      content.classList.remove("hidden");
      chevron.innerHTML = "▲ ซ่อนสรุป";
      chevron.classList.add("text-amber-500");
    } else {
      content.classList.add("hidden");
      chevron.innerHTML = "▼ แสดงสรุป";
      chevron.classList.remove("text-amber-500");
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

        <!-- Collapsible Page Summary (Below On this page, Hidden by default) -->
        ${page.summary ? `
          <div class="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden transition-all shadow-2xs">
            <button onclick="window.app.toggleDocSummary()"
              class="w-full px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer group">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-base group-hover:scale-110 transition-transform">💡</span>
                <span class="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                  สรุปเนื้อหาสำคัญแบบเข้าใจง่าย (Quick Summary)
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  คลิกเพื่อเปิด/ปิด
                </span>
              </div>
              <span id="doc-summary-chevron" class="text-xs font-bold text-amber-700 dark:text-amber-400 transition-transform duration-200 shrink-0">
                ▼ แสดงสรุป
              </span>
            </button>
            <div id="doc-summary-content" class="hidden px-5 pb-5 pt-3 border-t border-amber-200/60 dark:border-amber-800/50 prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-200">
              ${this.formatMarkdown(page.summary)}
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
  // VIEW: CKAD HANDS-ON EXAM LABS (OFFICIAL PSI BRIDGE CONSOLE + REAL TERMINAL)
  // ===========================================================================
  initCkadLabsState() {
    this.CKAD_ANALYTICS_KEY = "kubemastery_ckad_analytics_v1";
    this.CKAD_CUSTOM_SETS_KEY = "kubemastery_ckad_custom_sets_v1";

    this.ckadTab = "exam"; // "exam" | "sets" | "analytics"
    this.ckadBackendOnline = true;
    this.ckadBackendChecked = false;
    this.ckadWorkspaceRoot = "/home/nopakun-sangon/ckad-workspace";
    this.ckadBusySetup = false;
    this.ckadBusyVerify = false;

    this.ckadCustomSets = this.loadCkadCustomSets();
    this.ckadAnalytics = this.loadCkadLocalAnalytics();
    this.ckadEnvStatus = {};
    this.ckadGradeResults = {};
    this.ckadQuestionTimeMap = {};

    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.ckadTimerInterval = null;

    const catalog = window.CKAD_LABS_DATA || { domains: [], blueprints: [], initialSets: [] };
    const defaultSetDef = (catalog.initialSets && catalog.initialSets[0]) || {
      id: "set-a",
      badge: "Official Mock Exam — Set A",
      title: "CKAD Official Mock Exam — Set A (Full 16 Questions)",
      description: "Full 2-hour (120 minutes) official-style CKAD certification exam covering all 5 CNCF domains. Passing score: 66%.",
      durationMinutes: 120,
      passingScore: 66,
      seedBase: 100,
      questionIds: (catalog.blueprints || []).slice(0, 16).map((b) => b.id)
    };

    this.ckadActiveSet = this.buildCkadSetInstance(defaultSetDef, false);
    this.ckadQuestionIndex = 0;

    let savedName = "";
    let savedEmail = "candidate@linuxfoundation.org";
    try {
      savedName = localStorage.getItem("ckad_candidate_name") || "";
      savedEmail = localStorage.getItem("ckad_candidate_email") || "candidate@linuxfoundation.org";
    } catch (_) {}

    const durationSec = ((this.ckadActiveSet && this.ckadActiveSet.durationMinutes) || 120) * 60;
    this.ckadLabState = {
      subView: "exam",
      examSessionActive: false,
      candidateName: savedName,
      candidateEmail: savedEmail,
      selectedSetId: this.ckadActiveSet.id || "set-a",
      examRemainingSeconds: durationSec,
      examTotalDurationSeconds: durationSec,
      flaggedQuestions: {},
      examSubmitted: false,
      lastScoreReport: null,
      showThaiTranslation: false
    };
  }

  createDefaultCkadAnalytics() {
    return {
      updatedAt: new Date().toISOString(),
      attempts: [],
      setHistory: [],
      domainStats: {
        "domain-1": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
        "domain-2": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
        "domain-3": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
        "domain-4": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
        "domain-5": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 }
      },
      mistakes: {}
    };
  }

  loadCkadLocalAnalytics() {
    try {
      const raw = localStorage.getItem(this.CKAD_ANALYTICS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const def = this.createDefaultCkadAnalytics();
        return {
          ...def,
          ...parsed,
          attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
          setHistory: Array.isArray(parsed.setHistory) ? parsed.setHistory : [],
          domainStats: { ...def.domainStats, ...(parsed.domainStats || {}) },
          mistakes: parsed.mistakes && typeof parsed.mistakes === "object" ? parsed.mistakes : {}
        };
      }
    } catch (_) {}
    return this.createDefaultCkadAnalytics();
  }

  saveCkadLocalAnalytics(analyticsObj = null) {
    if (analyticsObj) {
      const def = this.createDefaultCkadAnalytics();
      this.ckadAnalytics = {
        ...def,
        ...analyticsObj,
        attempts: Array.isArray(analyticsObj.attempts) ? analyticsObj.attempts : [],
        setHistory: Array.isArray(analyticsObj.setHistory) ? analyticsObj.setHistory : [],
        domainStats: { ...def.domainStats, ...(analyticsObj.domainStats || {}) },
        mistakes: analyticsObj.mistakes && typeof analyticsObj.mistakes === "object" ? analyticsObj.mistakes : {}
      };
    }
    try {
      localStorage.setItem(this.CKAD_ANALYTICS_KEY, JSON.stringify(this.ckadAnalytics));
    } catch (_) {}
  }

  loadCkadCustomSets() {
    try {
      const raw = localStorage.getItem(this.CKAD_CUSTOM_SETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  }

  saveCkadCustomSets() {
    try {
      localStorage.setItem(this.CKAD_CUSTOM_SETS_KEY, JSON.stringify(this.ckadCustomSets));
    } catch (_) {}
  }

  getCkadApiUrl(endpointPath) {
    if (
      typeof window !== "undefined" &&
      window.location &&
      typeof window.location.origin === "string" &&
      /^https?:\/\//i.test(window.location.origin) &&
      !window.location.origin.includes("null")
    ) {
      return `${window.location.origin}${endpointPath}`;
    }
    return `http://localhost:3080${endpointPath}`;
  }

  async syncCkadBackendStatus() {
    if (typeof window !== "undefined" && window.location && /github\.io/i.test(window.location.hostname || "")) {
      this.ckadBackendOnline = false;
      this.ckadBackendChecked = true;
      return;
    }
    if (typeof fetch !== "function") {
      this.ckadBackendOnline = false;
      this.ckadBackendChecked = true;
      return;
    }
    try {
      const statusRes = await fetch(this.getCkadApiUrl("/api/lab/status"));
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        this.ckadBackendOnline = Boolean(statusData && statusData.ok);
        if (statusData && statusData.workspaceRoot) {
          this.ckadWorkspaceRoot = statusData.workspaceRoot;
        }
      } else {
        this.ckadBackendOnline = false;
      }

      const anaRes = await fetch(this.getCkadApiUrl("/api/lab/analytics"));
      if (anaRes && anaRes.ok) {
        const anaData = await anaRes.json();
        if (anaData && anaData.ok && anaData.analytics) {
          if ((anaData.analytics.attempts || []).length >= (this.ckadAnalytics.attempts || []).length) {
            this.saveCkadLocalAnalytics(anaData.analytics);
          }
          if (this.currentView === "ckad-labs" && this.ckadTab === "analytics") {
            this.render();
          }
        }
      }
    } catch (_) {
      this.ckadBackendOnline = false;
    } finally {
      this.ckadBackendChecked = true;
    }
  }

  buildCkadSetInstance(setDef, randomizeSeeds = false) {
    const catalog = window.CKAD_LABS_DATA || { blueprints: [], buildQuestion: () => null };
    const baseSeed = randomizeSeeds
      ? Math.floor(200 + Math.random() * 8000)
      : Number(setDef.seedBase) || 100;

    const qIds = Array.isArray(setDef.questionIds) && setDef.questionIds.length
      ? setDef.questionIds
      : (catalog.blueprints || []).map((b) => b.id);

    const questions = qIds
      .map((qId, idx) => {
        const seed = baseSeed + idx + 1;
        if (typeof catalog.buildQuestion === "function") {
          return catalog.buildQuestion(qId, seed);
        }
        const bp = (catalog.blueprints || []).find((b) => b.id === qId) || (catalog.blueprints || [])[0];
        return bp ? bp.build(seed) : null;
      })
      .filter(Boolean);

    return {
      id: setDef.id || "custom-set",
      badge: setDef.badge || "Custom Set",
      title: setDef.title || "CKAD Practice Set",
      description: setDef.description || "ชุดฝึกทำข้อสอบ CKAD ผ่าน Terminal จริง",
      durationMinutes: setDef.durationMinutes || questions.length * 6,
      seedBase: baseSeed,
      questions
    };
  }

  getActiveCkadQuestion() {
    if (!this.ckadActiveSet || !Array.isArray(this.ckadActiveSet.questions) || !this.ckadActiveSet.questions.length) {
      const catalog = window.CKAD_LABS_DATA;
      if (catalog && catalog.initialSets && catalog.initialSets[0]) {
        this.ckadActiveSet = this.buildCkadSetInstance(catalog.initialSets[0], false);
      }
    }
    const questions = (this.ckadActiveSet && this.ckadActiveSet.questions) || [];
    if (this.ckadQuestionIndex < 0 || this.ckadQuestionIndex >= questions.length) {
      this.ckadQuestionIndex = 0;
    }
    return questions[this.ckadQuestionIndex] || null;
  }

  getCkadQuestionKey(q) {
    if (!q) return "none";
    return `${q.id}:${q.seed || 100}`;
  }

  ensureCkadTimerLoop() {
    if (this.ckadTimerInterval) return;
    this.ckadTimerInterval = setInterval(() => {
      const activeSubView = (this.ckadLabState && this.ckadLabState.subView) || this.ckadTab || "exam";
      if (this.currentView === "ckad-labs" && activeSubView === "exam" && this.ckadTimerRunning) {
        // Per-question stopwatch
        this.ckadTimerSeconds += 1;
        const activeQ = this.getActiveCkadQuestion();
        if (activeQ) {
          const qk = this.getCkadQuestionKey(activeQ);
          this.ckadQuestionTimeMap[qk] = (this.ckadQuestionTimeMap[qk] || 0) + 1;
        }
        const el = document.getElementById("ckad-q-timer");
        if (el) {
          el.textContent = this.formatCkadTime(this.ckadTimerSeconds);
        }

        // Official 120-Minute Exam Countdown Timer
        if (
          this.ckadLabState &&
          this.ckadLabState.examSessionActive &&
          !this.ckadLabState.examSubmitted
        ) {
          if (this.ckadLabState.examRemainingSeconds > 0) {
            this.ckadLabState.examRemainingSeconds -= 1;
          }
          const rem = this.ckadLabState.examRemainingSeconds;
          const total = this.ckadLabState.examTotalDurationSeconds || 7200;
          const cdEl = document.getElementById("ckad-exam-countdown");
          if (cdEl) {
            cdEl.textContent = this.formatCkadExamCountdown(rem);
          }
          const barEl = document.getElementById("ckad-exam-progress-bar");
          if (barEl) {
            const pct = Math.max(0, Math.min(100, Math.round((rem / total) * 100)));
            barEl.style.width = `${pct}%`;
          }
          if (rem <= 0) {
            this.submitOfficialCkadExam(true);
          }
        }
      }
    }, 1000);
    if (this.ckadTimerInterval && typeof this.ckadTimerInterval.unref === "function") {
      this.ckadTimerInterval.unref();
    }
  }

  formatCkadTime(totalSeconds) {
    const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  formatCkadExamCountdown(totalSeconds) {
    const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  toggleCkadTimer() {
    this.ckadTimerRunning = !this.ckadTimerRunning;
    this.render();
  }

  resetCkadTimer() {
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    const el = document.getElementById("ckad-q-timer");
    if (el) el.textContent = "00:00";
    this.render();
  }

  setCkadCandidateName(val) {
    if (!this.ckadLabState) return;
    this.ckadLabState.candidateName = String(val || "");
    try {
      localStorage.setItem("ckad_candidate_name", this.ckadLabState.candidateName.trim());
    } catch (_) {}
  }

  setCkadCandidateEmail(val) {
    if (!this.ckadLabState) return;
    this.ckadLabState.candidateEmail = String(val || "");
    try {
      localStorage.setItem("ckad_candidate_email", this.ckadLabState.candidateEmail.trim());
    } catch (_) {}
  }

  selectCheckinExamSet(setId) {
    const catalog = window.CKAD_LABS_DATA || { initialSets: [] };
    const allSets = [...(catalog.initialSets || []), ...(this.ckadCustomSets || [])];
    const targetDef = allSets.find((s) => s.id === setId) || allSets[0];
    if (!targetDef) return;

    this.ckadActiveSet = this.buildCkadSetInstance(targetDef, false);
    this.ckadQuestionIndex = 0;
    if (this.ckadLabState) {
      this.ckadLabState.selectedSetId = targetDef.id;
      const dur = (this.ckadActiveSet.durationMinutes || 120) * 60;
      this.ckadLabState.examTotalDurationSeconds = dur;
      this.ckadLabState.examRemainingSeconds = dur;
    }
    this.render();
  }

  async startOfficialCkadExam(nameOverride = null, setIdOverride = null) {
    const inputEl = typeof document !== "undefined" ? document.getElementById("ckad-candidate-name-input") : null;
    const emailEl = typeof document !== "undefined" ? document.getElementById("ckad-candidate-email-input") : null;
    const selectEl = typeof document !== "undefined" ? document.getElementById("ckad-checkin-set-select") : null;

    const rawName =
      nameOverride !== null && nameOverride !== undefined
        ? String(nameOverride)
        : inputEl && typeof inputEl.value === "string" && inputEl.value.trim()
        ? inputEl.value
        : (this.ckadLabState && this.ckadLabState.candidateName) || "";

    const candidateName = rawName.trim();
    if (!candidateName) {
      if (inputEl && typeof inputEl.focus === "function") {
        inputEl.focus();
      }
      this.showToast("Please enter your Candidate Full Name to begin the exam.", "error");
      return false;
    }

    const rawEmail =
      emailEl && typeof emailEl.value === "string" && emailEl.value.trim()
        ? emailEl.value.trim()
        : (this.ckadLabState && this.ckadLabState.candidateEmail) || "candidate@linuxfoundation.org";

    const chosenSetId =
      setIdOverride ||
      (selectEl && selectEl.value) ||
      (this.ckadLabState && this.ckadLabState.selectedSetId) ||
      (this.ckadActiveSet && this.ckadActiveSet.id) ||
      "set-a";

    const catalog = window.CKAD_LABS_DATA || { initialSets: [] };
    const allSets = [...(catalog.initialSets || []), ...(this.ckadCustomSets || [])];
    const targetDef = allSets.find((s) => s.id === chosenSetId);
    if (targetDef && (!this.ckadActiveSet || this.ckadActiveSet.id !== targetDef.id)) {
      this.ckadActiveSet = this.buildCkadSetInstance(targetDef, false);
    }

    try {
      localStorage.setItem("ckad_candidate_name", candidateName);
      localStorage.setItem("ckad_candidate_email", rawEmail);
    } catch (_) {}

    const durationMinutes = (this.ckadActiveSet && this.ckadActiveSet.durationMinutes) || 120;
    const durationSeconds = durationMinutes * 60;

    this.ckadQuestionIndex = 0;
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.ckadGradeResults = {};
    this.ckadQuestionTimeMap = {};
    this.ckadTab = "exam";

    this.ckadLabState = {
      ...this.ckadLabState,
      subView: "exam",
      examSessionActive: true,
      candidateName,
      candidateEmail: rawEmail,
      selectedSetId: (this.ckadActiveSet && this.ckadActiveSet.id) || chosenSetId,
      examRemainingSeconds: durationSeconds,
      examTotalDurationSeconds: durationSeconds,
      flaggedQuestions: {},
      examSubmitted: false,
      lastScoreReport: null,
      showThaiTranslation: false
    };

    this.ensureCkadTimerLoop();
    this.showToast(
      `☸️ Official CKAD Exam Session started for ${candidateName} (${durationMinutes}:00 Countdown)`,
      "success"
    );
    this.render();

    // Automatically provision Task 1 environment so ~/ckad-workspace/ckad-XX is ready immediately
    await this.setupCkadLabEnvironment(true);
    return true;
  }

  exitOfficialCkadExam() {
    if (this.ckadLabState) {
      this.ckadLabState.examSessionActive = false;
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.lastScoreReport = null;
      this.ckadLabState.showThaiTranslation = false;
    }
    this.ckadTimerRunning = false;
    this.ckadTab = "exam";
    this.render();
  }

  resumeOfficialCkadExam() {
    if (this.ckadLabState) {
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.examSessionActive = true;
    }
    this.ckadTimerRunning = true;
    this.render();
  }

  toggleCkadFlagQuestion(idx = null) {
    const targetIdx = idx !== null && idx !== undefined ? Number(idx) : this.ckadQuestionIndex;
    const questions = (this.ckadActiveSet && this.ckadActiveSet.questions) || [];
    const q = questions[targetIdx] || this.getActiveCkadQuestion();
    if (!this.ckadLabState) return false;
    if (!this.ckadLabState.flaggedQuestions) {
      this.ckadLabState.flaggedQuestions = {};
    }

    const qKey = this.getCkadQuestionKey(q);
    const currentlyFlagged = Boolean(
      this.ckadLabState.flaggedQuestions[targetIdx] ||
      this.ckadLabState.flaggedQuestions[qKey] ||
      (q && this.ckadLabState.flaggedQuestions[q.id])
    );
    const nextState = !currentlyFlagged;

    this.ckadLabState.flaggedQuestions[targetIdx] = nextState;
    if (qKey) this.ckadLabState.flaggedQuestions[qKey] = nextState;
    if (q && q.id) this.ckadLabState.flaggedQuestions[q.id] = nextState;

    this.showToast(
      nextState
        ? `🚩 Task ${targetIdx + 1} (${q ? q.id.toUpperCase() : ""}) flagged for review.`
        : `Flag removed from Task ${targetIdx + 1}.`,
      "info"
    );
    this.render();
    return nextState;
  }

  isCkadQuestionFlagged(idx, q) {
    if (!this.ckadLabState || !this.ckadLabState.flaggedQuestions) return false;
    const qKey = this.getCkadQuestionKey(q);
    return Boolean(
      this.ckadLabState.flaggedQuestions[idx] ||
      this.ckadLabState.flaggedQuestions[qKey] ||
      (q && this.ckadLabState.flaggedQuestions[q.id])
    );
  }

  toggleCkadThaiTranslation() {
    if (!this.ckadLabState) return;
    this.ckadLabState.showThaiTranslation = !this.ckadLabState.showThaiTranslation;
    this.render();
  }

  async submitOfficialCkadExam(autoExpired = false) {
    if (!this.ckadLabState) return null;
    this.ckadLabState.examSubmitted = true;
    this.ckadTimerRunning = false;

    const activeSet = this.ckadActiveSet || { id: "set-a", badge: "Exam Set A", title: "CKAD Official Mock Exam", questions: [] };
    const questions = activeSet.questions || [];
    const totalDuration = this.ckadLabState.examTotalDurationSeconds || 7200;
    const remaining = Math.max(0, this.ckadLabState.examRemainingSeconds || 0);
    const timeUsedSeconds = Math.max(1, totalDuration - remaining);

    let earnedWeight = 0;
    let totalWeight = 0;
    let tasksPassed = 0;
    let tasksAttempted = 0;

    const taskBreakdown = questions.map((item, idx) => {
      const k = this.getCkadQuestionKey(item);
      const gr = this.ckadGradeResults[k] || null;
      const w = Number(item.weight) || 5;
      totalWeight += w;

      const earned = gr ? Number(gr.earnedScore) || 0 : 0;
      const passedAll = Boolean(gr && gr.passedAll);
      if (gr) tasksAttempted += 1;
      if (passedAll) tasksPassed += 1;
      earnedWeight += earned;

      const spentSec =
        (gr && gr.timeSpentSeconds) ||
        this.ckadQuestionTimeMap[k] ||
        (idx === this.ckadQuestionIndex ? this.ckadTimerSeconds : 0);

      return {
        index: idx,
        questionId: item.id,
        seed: item.seed,
        title: item.title,
        domainId: item.domainId,
        domainTitle: item.domainTitle,
        contextCluster: item.contextCluster || "k8s-c1-H",
        weight: w,
        earnedScore: Math.round(earned * 10) / 10,
        attempted: Boolean(gr),
        passedAll,
        passedCount: gr ? gr.passedCount : 0,
        totalChecks: gr ? gr.totalChecks : (item.verifySpec?.checks || []).length,
        timeSpentSeconds: spentSec
      };
    });

    earnedWeight = Math.round(earnedWeight * 10) / 10;
    const scorePercentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    const passingScore = Number(activeSet.passingScore) || 66;
    const passedExam = scorePercentage >= passingScore;

    const scoreReport = {
      candidateName: this.ckadLabState.candidateName || "Candidate",
      candidateEmail: this.ckadLabState.candidateEmail || "candidate@linuxfoundation.org",
      examId: `LF-CKAD-${activeSet.seedBase || 100}`,
      setId: activeSet.id,
      setBadge: activeSet.badge,
      setTitle: activeSet.title,
      earnedWeight,
      totalWeight,
      scorePercentage,
      passingScore,
      passedExam,
      tasksPassed,
      tasksAttempted,
      totalTasks: questions.length,
      timeUsedSeconds,
      totalDurationSeconds: totalDuration,
      autoExpired: Boolean(autoExpired),
      submittedAt: new Date().toISOString(),
      taskBreakdown
    };

    this.ckadLabState.lastScoreReport = scoreReport;

    // Save set result to local analytics & backend /api/lab/analytics
    const analytics = this.ckadAnalytics || this.createDefaultCkadAnalytics();
    if (!Array.isArray(analytics.setHistory)) analytics.setHistory = [];
    analytics.setHistory.unshift({
      id: `set-run-${Date.now()}`,
      ...scoreReport,
      timestamp: scoreReport.submittedAt
    });
    this.saveCkadLocalAnalytics(analytics);

    if (typeof fetch === "function") {
      try {
        const res = await fetch(this.getCkadApiUrl("/api/lab/analytics"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setResult: scoreReport })
        });
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.analytics) {
            this.saveCkadLocalAnalytics(data.analytics);
          }
        }
      } catch (_) {}
    }

    if (passedExam) {
      if (window.soundFx && window.soundFx.playCorrect) window.soundFx.playCorrect();
      this.showToast(
        `🎉 CONGRATULATIONS ${scoreReport.candidateName}! You PASSED the CKAD Exam with ${scorePercentage}%!`,
        "success"
      );
    } else {
      this.showToast(
        `📊 Exam Submitted — Score: ${scorePercentage}% (Passing Threshold: ${passingScore}%). Review your task breakdown below.`,
        "info"
      );
    }

    this.render();
    return scoreReport;
  }

  switchCkadTab(tab) {
    if (!["exam", "sets", "analytics"].includes(tab)) return;
    this.ckadTab = tab;
    if (this.ckadLabState) {
      this.ckadLabState.subView = tab;
    }
    if (tab === "analytics") {
      this.syncCkadBackendStatus();
    }
    this.navigateTo("ckad-labs", { ckadTab: tab });
  }

  selectCkadQuestionIndex(idx) {
    const questions = (this.ckadActiveSet && this.ckadActiveSet.questions) || [];
    if (idx < 0 || idx >= questions.length) return;
    this.ckadQuestionIndex = idx;
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    if (this.ckadLabState) {
      this.ckadLabState.showThaiTranslation = false;
    }
    this.render();

    // Auto-provision the newly selected task's local environment when in an active exam session
    if (this.ckadLabState && this.ckadLabState.examSessionActive && !this.ckadLabState.examSubmitted) {
      const q = this.getActiveCkadQuestion();
      const qKey = this.getCkadQuestionKey(q);
      if (q && (!this.ckadEnvStatus[qKey] || !this.ckadEnvStatus[qKey].ready)) {
        this.setupCkadLabEnvironment(true);
      }
    }
  }

  prevCkadQuestion() {
    if (this.ckadQuestionIndex > 0) {
      this.selectCkadQuestionIndex(this.ckadQuestionIndex - 1);
    }
  }

  nextCkadQuestion() {
    const questions = (this.ckadActiveSet && this.ckadActiveSet.questions) || [];
    if (this.ckadQuestionIndex < questions.length - 1) {
      this.selectCkadQuestionIndex(this.ckadQuestionIndex + 1);
    }
  }

  randomizeCurrentQuestion() {
    const q = this.getActiveCkadQuestion();
    const catalog = window.CKAD_LABS_DATA;
    if (!q || !catalog || typeof catalog.buildQuestion !== "function") return null;

    const newSeed = Math.floor(200 + Math.random() * 8900);
    const rebuilt = catalog.buildQuestion(q.id, newSeed);
    this.ckadActiveSet.questions[this.ckadQuestionIndex] = rebuilt;
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.showToast(
      `🎲 Generated new variant for ${rebuilt.id.toUpperCase()} (Context: ${rebuilt.contextCluster || "k8s-c1-H"}, Namespace: ${rebuilt.namespace})`,
      "info"
    );
    this.render();
    if (this.ckadLabState && this.ckadLabState.examSessionActive) {
      this.setupCkadLabEnvironment(true);
    }
    return rebuilt;
  }

  randomizeCkadQuestion() {
    return this.randomizeCurrentQuestion();
  }

  startCkadExamSet(setId, randomizeSeeds = false) {
    const catalog = window.CKAD_LABS_DATA || { initialSets: [] };
    const allSets = [...(catalog.initialSets || []), ...(this.ckadCustomSets || [])];
    const targetDef = allSets.find((s) => s.id === setId) || allSets[0];
    if (!targetDef) return;

    this.ckadActiveSet = this.buildCkadSetInstance(targetDef, randomizeSeeds);
    this.ckadQuestionIndex = 0;
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.ckadGradeResults = {};
    this.ckadQuestionTimeMap = {};
    this.ckadTab = "exam";

    if (this.ckadLabState) {
      const dur = (this.ckadActiveSet.durationMinutes || 120) * 60;
      this.ckadLabState.subView = "exam";
      this.ckadLabState.selectedSetId = targetDef.id;
      this.ckadLabState.examTotalDurationSeconds = dur;
      this.ckadLabState.examRemainingSeconds = dur;
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.lastScoreReport = null;
      this.ckadLabState.flaggedQuestions = {};
    }

    this.showToast(
      randomizeSeeds
        ? `🎲 Randomized parameters for ${targetDef.badge}!`
        : `🚀 Selected ${targetDef.badge}: ${targetDef.title}`,
      "success"
    );
    this.navigateTo("ckad-labs", { ckadTab: "exam" });
    if (this.ckadLabState && this.ckadLabState.examSessionActive) {
      this.setupCkadLabEnvironment(true);
    }
  }

  generateNewRandomExamSet(questionCount = 16) {
    const catalog = window.CKAD_LABS_DATA || { blueprints: [] };
    const allIds = (catalog.blueprints || []).map((b) => b.id);
    if (!allIds.length) return null;

    // Shuffle blueprint IDs while preserving domain order after selection
    const shuffled = [...allIds].sort(() => Math.random() - 0.5);
    const chosenIds = shuffled.slice(0, Math.min(questionCount, allIds.length)).sort();
    const randNum = Math.floor(100 + Math.random() * 900);
    const seedBase = Math.floor(500 + Math.random() * 8500);

    const newSetDef = {
      id: `custom-set-${randNum}-${Date.now().toString(36)}`,
      badge: `Dynamic Set #${randNum}`,
      title: `CKAD Randomized Mock Exam #${randNum}`,
      description: `Full ${chosenIds.length}-task randomized official CKAD mock exam (Seed #${seedBase}) covering all 5 CNCF curriculum domains.`,
      durationMinutes: chosenIds.length === 16 ? 120 : chosenIds.length * 7,
      passingScore: 66,
      seedBase,
      questionIds: chosenIds,
      createdAt: new Date().toISOString()
    };

    this.ckadCustomSets.unshift(newSetDef);
    if (this.ckadCustomSets.length > 15) {
      this.ckadCustomSets = this.ckadCustomSets.slice(0, 15);
    }
    this.saveCkadCustomSets();

    this.ckadActiveSet = this.buildCkadSetInstance(newSetDef, false);
    this.ckadQuestionIndex = 0;
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.ckadGradeResults = {};
    this.ckadQuestionTimeMap = {};
    this.ckadTab = "exam";

    if (this.ckadLabState) {
      const dur = (this.ckadActiveSet.durationMinutes || 120) * 60;
      this.ckadLabState.subView = "exam";
      this.ckadLabState.selectedSetId = newSetDef.id;
      this.ckadLabState.examTotalDurationSeconds = dur;
      this.ckadLabState.examRemainingSeconds = dur;
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.lastScoreReport = null;
      this.ckadLabState.flaggedQuestions = {};
    }

    this.showToast(`✨ Generated ${newSetDef.badge} (${chosenIds.length} Tasks • 120 Mins)!`, "success");
    this.navigateTo("ckad-labs", { ckadTab: "exam" });
    if (this.ckadLabState && this.ckadLabState.examSessionActive) {
      this.setupCkadLabEnvironment(true);
    }
    return this.ckadActiveSet;
  }

  generateNewExamSet(questionCount = 16) {
    return this.generateNewRandomExamSet(questionCount);
  }

  startCkadDomainPractice(domainId, randomizeSeeds = false) {
    const catalog = window.CKAD_LABS_DATA || { domains: [], blueprints: [] };
    const dom = (catalog.domains || []).find((d) => d.id === domainId);
    const domainBlueprints = (catalog.blueprints || []).filter((b) => b.domainId === domainId);
    if (!domainBlueprints.length) return;

    const practiceDef = {
      id: `domain-practice-${domainId}`,
      badge: dom ? `Domain ${dom.number} (${dom.weight}%)` : "Topic Focus",
      title: dom ? `${dom.title} — ${dom.titleTh}` : "Domain Practice",
      description: dom ? dom.topics : "Focused Domain Practice",
      durationMinutes: domainBlueprints.length * 8,
      seedBase: randomizeSeeds ? Math.floor(300 + Math.random() * 8000) : 150,
      questionIds: domainBlueprints.map((b) => b.id)
    };

    this.ckadActiveSet = this.buildCkadSetInstance(practiceDef, randomizeSeeds);
    this.ckadQuestionIndex = 0;
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.ckadGradeResults = {};
    this.ckadTab = "exam";

    if (this.ckadLabState) {
      const dur = (this.ckadActiveSet.durationMinutes || 30) * 60;
      this.ckadLabState.subView = "exam";
      this.ckadLabState.examSessionActive = true;
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.lastScoreReport = null;
      this.ckadLabState.candidateName = this.ckadLabState.candidateName || "Candidate (Domain Practice)";
      this.ckadLabState.examTotalDurationSeconds = dur;
      this.ckadLabState.examRemainingSeconds = dur;
    }

    this.showToast(`🎯 Started Domain Practice: ${practiceDef.badge} (${domainBlueprints.length} Tasks)`, "info");
    this.navigateTo("ckad-labs", { ckadTab: "exam" });
    this.setupCkadLabEnvironment(true);
  }

  startCkadWeaknessPractice() {
    const catalog = window.CKAD_LABS_DATA || { blueprints: [] };
    const unresolvedQuestionIds = new Set();

    Object.values(this.ckadAnalytics.mistakes || {}).forEach((m) => {
      if (m && !m.resolved && m.questionId) {
        unresolvedQuestionIds.add(m.questionId);
      }
    });

    (this.ckadAnalytics.attempts || []).forEach((att) => {
      if (att && !att.passedAll && att.questionId) {
        unresolvedQuestionIds.add(att.questionId);
      }
    });

    let targetIds = Array.from(unresolvedQuestionIds);
    const hadMistakes = targetIds.length > 0;
    if (!targetIds.length) {
      // Default high-value tricky CKAD blueprints if no failed attempts yet
      targetIds = ["ckad-01", "ckad-05", "ckad-10", "ckad-14", "ckad-15", "ckad-18", "ckad-20"];
    }

    const weaknessDef = {
      id: "weakness-retry-set",
      badge: "🔥 Weakness Focus",
      title: hadMistakes
        ? `Weakness Retry Practice (${targetIds.length} Tasks)`
        : `High-Weight Challenge Tasks (${targetIds.length} Tasks)`,
      description: "Practice tasks with previous failed checkpoints using fresh randomized parameters.",
      durationMinutes: targetIds.length * 8,
      seedBase: Math.floor(400 + Math.random() * 8000),
      questionIds: targetIds
    };

    this.ckadActiveSet = this.buildCkadSetInstance(weaknessDef, true);
    this.ckadQuestionIndex = 0;
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.ckadGradeResults = {};
    this.ckadTab = "exam";

    if (this.ckadLabState) {
      const dur = (this.ckadActiveSet.durationMinutes || 45) * 60;
      this.ckadLabState.subView = "exam";
      this.ckadLabState.examSessionActive = true;
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.lastScoreReport = null;
      this.ckadLabState.candidateName = this.ckadLabState.candidateName || "Candidate (Weakness Retry)";
      this.ckadLabState.examTotalDurationSeconds = dur;
      this.ckadLabState.examRemainingSeconds = dur;
    }

    this.showToast(`🔥 Started Weakness Focus Mode (${targetIds.length} Tasks)!`, "info");
    this.navigateTo("ckad-labs", { ckadTab: "exam" });
    this.setupCkadLabEnvironment(true);
  }

  selectOrBuildCkadBlueprint(blueprintId, customSeed = null) {
    const catalog = window.CKAD_LABS_DATA;
    if (!catalog || !Array.isArray(catalog.blueprints)) return;
    const bp = catalog.blueprints.find((b) => b.id === blueprintId);
    if (!bp) return;

    const existingIdx = (this.ckadActiveSet?.questions || []).findIndex((q) => q.id === blueprintId);
    if (existingIdx !== -1) {
      this.ckadQuestionIndex = existingIdx;
      if (customSeed !== null) {
        this.ckadActiveSet.questions[existingIdx] = catalog.buildQuestion(blueprintId, customSeed);
      }
    } else {
      const seed = customSeed !== null ? customSeed : Math.floor(100 + Math.random() * 8000);
      const built = catalog.buildQuestion(blueprintId, seed);
      if (!this.ckadActiveSet || !Array.isArray(this.ckadActiveSet.questions)) {
        this.ckadActiveSet = {
          id: "single-practice",
          badge: "Focused Lab",
          title: built.title,
          description: built.domainTitle,
          durationMinutes: 60,
          questions: [built]
        };
        this.ckadQuestionIndex = 0;
      } else {
        this.ckadActiveSet.questions.push(built);
        this.ckadQuestionIndex = this.ckadActiveSet.questions.length - 1;
      }
    }
    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
  }

  openCkadLabQuestion(blueprintId, customSeed = null) {
    this.selectOrBuildCkadBlueprint(blueprintId, customSeed);
    this.ckadTab = "exam";
    if (this.ckadLabState) {
      this.ckadLabState.subView = "exam";
      this.ckadLabState.examSessionActive = true;
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.candidateName = this.ckadLabState.candidateName || "Candidate";
    }
    this.navigateTo("ckad-labs", { ckadTab: "exam" });
    this.setupCkadLabEnvironment(true);
  }

  retryCkadQuestion(blueprintId, exactSeed = null) {
    const seedToUse = exactSeed !== null && exactSeed !== undefined
      ? Number(exactSeed)
      : Math.floor(200 + Math.random() * 8900);
    this.selectOrBuildCkadBlueprint(blueprintId, seedToUse);
    this.ckadTab = "exam";
    if (this.ckadLabState) {
      this.ckadLabState.subView = "exam";
      this.ckadLabState.examSessionActive = true;
      this.ckadLabState.examSubmitted = false;
      this.ckadLabState.candidateName = this.ckadLabState.candidateName || "Candidate";
    }
    this.showToast(
      exactSeed !== null && exactSeed !== undefined
        ? `🔁 Opened ${blueprintId.toUpperCase()} (Seed #${seedToUse}) for retry!`
        : `🎲 Generated new variant for ${blueprintId.toUpperCase()} (Seed #${seedToUse})!`,
      "info"
    );
    this.navigateTo("ckad-labs", { ckadTab: "exam" });
    this.setupCkadLabEnvironment(true);
  }

  async setupCkadLabEnvironment(silent = false) {
    const q = this.getActiveCkadQuestion();
    if (!q || this.ckadBusySetup) return null;

    this.ckadBusySetup = true;
    const qKey = this.getCkadQuestionKey(q);
    let setupResult = null;

    if (typeof fetch === "function") {
      try {
        const res = await fetch(this.getCkadApiUrl("/api/lab/setup"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q })
        });
        if (res && res.ok) {
          setupResult = await res.json();
          this.ckadBackendOnline = true;
        }
      } catch (_) {
        this.ckadBackendOnline = false;
      }
    }

    if (!setupResult || !setupResult.ok) {
      const filesCreated = Object.keys(q.setupSpec?.files || {});
      const namespaces = q.setupSpec?.namespaces || [q.namespace];
      setupResult = {
        ok: true,
        simulated: true,
        workspacePath: `${this.ckadWorkspaceRoot}/${q.workspaceDir || q.id}`,
        filesCreated,
        namespaces,
        message: `Task environment provisioned in ~/ckad-workspace/${q.workspaceDir || q.id} (Context: ${q.contextCluster || "k8s-c1-H"})`
      };
    }

    this.ckadEnvStatus[qKey] = {
      ready: true,
      simulated: Boolean(setupResult.simulated),
      workspacePath: setupResult.workspacePath || `${this.ckadWorkspaceRoot}/${q.workspaceDir || q.id}`,
      filesCreated: setupResult.filesCreated || [],
      namespaces: setupResult.namespaces || [q.namespace],
      initialResourceCount: (q.setupSpec?.resources || []).length,
      setupAt: new Date().toISOString(),
      message: setupResult.message
    };

    this.ckadTimerSeconds = 0;
    this.ckadTimerRunning = true;
    this.ckadBusySetup = false;

    if (!silent) {
      this.showToast(`🛠️ ${setupResult.message || "Task environment provisioned!"}`, "success");
    }
    this.render();
    return setupResult;
  }

  async prepareCkadLabEnv(silent = false) {
    return this.setupCkadLabEnvironment(silent);
  }

  recordLocalCkadAttempt(q, results, timeSpentSeconds, setId) {
    const totalChecks = results.length;
    const passedCount = results.filter((r) => r.passed).length;
    const passedAll = totalChecks > 0 && passedCount === totalChecks;
    const maxScore = Number(q.weight) || 5;
    const earnedScore = totalChecks > 0 ? Math.round((passedCount / totalChecks) * maxScore * 10) / 10 : 0;

    const failedChecks = results
      .filter((r) => !r.passed)
      .map((r) => ({ id: r.id, title: r.title, failHint: r.failHint }));

    const analytics = this.ckadAnalytics || this.createDefaultCkadAnalytics();
    analytics.attempts.unshift({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: q.id,
      seed: q.seed,
      title: q.title,
      domainId: q.domainId,
      domainTitle: q.domainTitle,
      setId: setId || "practice",
      passedAll,
      passedCount,
      totalChecks,
      earnedScore,
      maxScore,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      failedChecks,
      timestamp: new Date().toISOString()
    });

    const domId = q.domainId || "domain-1";
    if (!analytics.domainStats[domId]) {
      analytics.domainStats[domId] = { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 };
    }
    analytics.domainStats[domId].attempts += 1;
    if (passedAll) analytics.domainStats[domId].passed += 1;
    analytics.domainStats[domId].totalEarned =
      Math.round((analytics.domainStats[domId].totalEarned + earnedScore) * 10) / 10;
    analytics.domainStats[domId].totalMax += maxScore;

    for (const r of results) {
      const mKey = `${q.id}:${r.id}`;
      if (!r.passed) {
        const prev = analytics.mistakes[mKey] || {
          key: mKey,
          questionId: q.id,
          questionTitle: q.title,
          domainId: q.domainId,
          domainTitle: q.domainTitle,
          checkId: r.id,
          checkTitle: r.title,
          failHint: r.failHint,
          count: 0,
          resolved: false
        };
        prev.count += 1;
        prev.resolved = false;
        prev.lastSeen = new Date().toISOString();
        prev.failHint = r.failHint;
        analytics.mistakes[mKey] = prev;
      } else if (analytics.mistakes[mKey]) {
        analytics.mistakes[mKey].resolved = true;
        analytics.mistakes[mKey].resolvedAt = new Date().toISOString();
      }
    }

    this.saveCkadLocalAnalytics(analytics);
    return {
      ok: true,
      questionId: q.id,
      passedAll,
      passedCount,
      totalChecks,
      earnedScore,
      maxScore,
      results,
      analytics
    };
  }

  async verifyCkadLabAnswer(simulatedMode = null) {
    const q = this.getActiveCkadQuestion();
    if (!q || this.ckadBusyVerify) return null;

    this.ckadBusyVerify = true;
    const qKey = this.getCkadQuestionKey(q);
    const timeSpentSeconds = this.ckadTimerSeconds || this.ckadQuestionTimeMap[qKey] || 0;
    const setId = (this.ckadActiveSet && this.ckadActiveSet.id) || "practice";
    let verifyResponse = null;

    if (!simulatedMode && typeof fetch === "function") {
      try {
        const res = await fetch(this.getCkadApiUrl("/api/lab/verify"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            timeSpentSeconds,
            setId,
            recordAnalytics: true
          })
        });
        if (res && res.ok) {
          verifyResponse = await res.json();
          this.ckadBackendOnline = true;
        }
      } catch (_) {
        this.ckadBackendOnline = false;
      }
    }

    if (!verifyResponse || !verifyResponse.ok) {
      const checks = q.verifySpec?.checks || [];
      const results = checks.map((chk, idx) => {
        const pass = simulatedMode === "pass" ? true : simulatedMode === "partial" ? idx < checks.length - 1 : false;
        return {
          id: chk.id,
          title: chk.title,
          passed: pass,
          detail: pass ? "Verified OK in cluster" : chk.failHint,
          failHint: pass ? null : chk.failHint
        };
      });
      verifyResponse = this.recordLocalCkadAttempt(q, results, timeSpentSeconds, setId);
    } else if (verifyResponse.analytics) {
      this.saveCkadLocalAnalytics(verifyResponse.analytics);
    }

    verifyResponse.timeSpentSeconds = timeSpentSeconds;
    this.ckadGradeResults[qKey] = verifyResponse;
    this.ckadBusyVerify = false;

    if (verifyResponse.passedAll) {
      if (window.soundFx && window.soundFx.playCorrect) window.soundFx.playCorrect();
      if (window.storage && typeof window.storage.addXP === "function") window.storage.addXP(25);
      this.showToast(`🎉 Task Verified: PASSED ALL CHECKS (+${verifyResponse.earnedScore}% Weight)!`, "success");
    } else {
      if (window.soundFx && window.soundFx.playWrong) window.soundFx.playWrong();
      this.showToast(
        `⚠️ Task Verification: ${verifyResponse.earnedScore}% / ${verifyResponse.maxScore}% — Check diagnostic hints below.`,
        "error"
      );
    }

    this.render();
    return verifyResponse;
  }

  async resetCkadAnalytics() {
    const shouldReset = typeof confirm === "function"
      ? confirm("คุณต้องการล้างสถิติการสอบและประวัติข้อที่ทำผิดทั้งหมดหรือไม่?")
      : true;
    if (!shouldReset) return;

    const fresh = this.createDefaultCkadAnalytics();
    this.saveCkadLocalAnalytics(fresh);
    this.ckadGradeResults = {};

    if (typeof fetch === "function") {
      try {
        await fetch(this.getCkadApiUrl("/api/lab/analytics"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset" })
        });
      } catch (_) {}
    }

    this.showToast("🗑️ ล้างสถิติการสอบ CKAD Labs เรียบร้อยแล้ว", "info");
    this.render();
  }

  renderCkadLabsView() {
    const activeTab = (this.ckadLabState && this.ckadLabState.subView) || this.ckadTab || "exam";

    return `
      <div class="space-y-4 animate-fadeIn max-w-7xl mx-auto w-full pb-16">
        <!-- Top Navigation Strip & 3 Sub-View Tabs -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/15 text-blue-600 dark:text-cyan-400 text-xs font-black tracking-wide">
                  <span>☸️ LINUX FOUNDATION • PSI BRIDGE EXAM SIMULATOR</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  this.ckadBackendOnline
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                } text-xs font-bold">
                  <span class="w-2 h-2 rounded-full ${this.ckadBackendOnline ? "bg-emerald-500" : "bg-amber-500"}"></span>
                  <span>${this.ckadBackendOnline ? "Local Terminal Engine: Connected (~/ckad-workspace)" : "Browser Simulation Mode"}</span>
                </span>
              </div>
              <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Certified Kubernetes Application Developer (CKAD) — Official Exam Console &amp; Real Terminal Lab
              </h1>
            </div>

            <!-- 3 Sub-View Tabs -->
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button onclick="window.app.switchCkadTab('exam')"
                class="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "exam"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }">
                🖥️ 1. PSI Bridge Exam Console
              </button>
              <button onclick="window.app.switchCkadTab('sets')"
                class="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "sets"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }">
                📋 2. Exam Sets &amp; Domain Focus
              </button>
              <button onclick="window.app.switchCkadTab('analytics')"
                class="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }">
                📊 3. Score History &amp; Mistake Analytics
              </button>
            </div>
          </div>

          ${!this.ckadBackendOnline ? `
            <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                💡 <strong>Offline / Browser Demo Mode:</strong> To connect your real Linux Terminal (<code class="font-mono">~/ckad-workspace/</code> &amp; <code class="font-mono">kubectl</code>), run <code class="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 font-mono">./start.sh</code> and open <code class="font-mono">http://localhost:3080</code>.
              </div>
            </div>
          ` : ""}
        </div>

        ${activeTab === "exam" ? this.renderCkadActiveExamTab() : ""}
        ${activeTab === "sets" ? this.renderCkadSetsAndTopicsTab() : ""}
        ${activeTab === "analytics" ? this.renderCkadAnalyticsTab() : ""}
      </div>
    `;
  }

  renderCkadCheckInGate() {
    const catalog = window.CKAD_LABS_DATA || { initialSets: [] };
    const allSets = [...(catalog.initialSets || []), ...(this.ckadCustomSets || [])];
    const activeSet = this.ckadActiveSet || allSets[0] || {
      id: "set-a",
      badge: "Official Mock Exam — Set A",
      title: "CKAD Official Mock Exam — Set A (Full 16 Questions)",
      durationMinutes: 120,
      questions: []
    };
    const candidateName = (this.ckadLabState && this.ckadLabState.candidateName) || "";
    const candidateEmail = (this.ckadLabState && this.ckadLabState.candidateEmail) || "candidate@linuxfoundation.org";
    const totalTasks = (activeSet.questions && activeSet.questions.length) || 16;
    const durationMins = activeSet.durationMinutes || 120;

    return `
      <div class="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100">
        <!-- Official PSI Bridge Portal Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-black tracking-wider uppercase">
              ☸️ THE LINUX FOUNDATION • CNCF CERTIFICATION EXAM PORTAL (PSI BRIDGE SIMULATOR)
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
              Certified Kubernetes Application Developer (CKAD-2026) — Candidate Check-In
            </h2>
            <p class="text-xs text-slate-300">
              Complete candidate verification below to launch your timed 120-minute performance-based exam session.
            </p>
          </div>
          <div class="px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-right font-mono">
            <div class="text-[10px] uppercase tracking-wider text-slate-400">EXAM CODE</div>
            <div class="text-sm font-black text-cyan-400">LF-CKAD-${activeSet.seedBase || 100}</div>
          </div>
        </div>

        <div class="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Column: Official Exam Specifications & Rules (7 cols) -->
          <div class="lg:col-span-7 space-y-5">
            <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>📋 Official CNCF Exam Specifications &amp; Rules</span>
                </h3>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  Kubernetes v1.31 / PSI Bridge Format
                </span>
              </div>

              <!-- 4 Key Spec Boxes -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Duration</div>
                  <div class="text-base font-black text-amber-400 font-mono">${durationMins} Minutes</div>
                  <div class="text-[11px] text-slate-400">02:00:00 Countdown</div>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Total Tasks</div>
                  <div class="text-base font-black text-cyan-400 font-mono">${totalTasks} Tasks</div>
                  <div class="text-[11px] text-slate-400">Performance-Based</div>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Passing Score</div>
                  <div class="text-base font-black text-emerald-400 font-mono">66% or higher</div>
                  <div class="text-[11px] text-slate-400">Auto-Graded Weight</div>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Exam Language</div>
                  <div class="text-base font-black text-white font-mono">English (EN)</div>
                  <div class="text-[11px] text-slate-400">Official PSI Format</div>
                </div>
              </div>

              <!-- Cluster Context & Terminal Instructions -->
              <div class="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2 text-xs leading-relaxed text-slate-200">
                <div class="font-black text-cyan-300 uppercase tracking-wider text-[11px]">
                  🖥️ Real Exam Environment &amp; Cluster Contexts
                </div>
                <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>
                    <strong>Multiple Contexts:</strong> Just like the real CKAD exam, tasks are distributed across cluster contexts (<code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">k8s-c1-H</code>, <code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">k8s-c2-AC</code>, <code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">k8s-c3-CCC</code>). Always run the provided <code class="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 font-mono">kubectl config use-context ...</code> command at the top of each task.
                  </li>
                  <li>
                    <strong>Local Terminal Workspace:</strong> Starter manifests and task files are automatically provisioned inside <code class="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono">~/ckad-workspace/ckad-XX</code> on your machine.
                  </li>
                  <li>
                    <strong>Flag for Review &amp; Navigation:</strong> You may navigate freely between all ${totalTasks} tasks and flag any task (<code class="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300">🚩 Flag for Review</code>) to revisit before time expires.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Right Column: Candidate Registration & Exam Set Selection Form (5 cols) -->
          <div class="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-5 shadow-xl">
            <div class="border-b border-slate-800 pb-3">
              <div class="text-[11px] font-black uppercase tracking-wider text-cyan-400">STEP 1 OF 1 • IDENTITY &amp; EXAM SET</div>
              <h3 class="text-base sm:text-lg font-black text-white mt-0.5">
                👤 Candidate Check-In Registration
              </h3>
            </div>

            <div class="space-y-4">
              <!-- Candidate Full Name Input -->
              <div class="space-y-1.5">
                <label for="ckad-candidate-name-input" class="block text-xs font-black uppercase tracking-wider text-slate-200">
                  Candidate Full Name <span class="text-rose-400">* (Required)</span>
                </label>
                <input
                  id="ckad-candidate-name-input"
                  type="text"
                  value="${this.escapeHtml(candidateName)}"
                  oninput="window.app.setCkadCandidateName(this.value)"
                  placeholder="e.g. Nopakun Sangon"
                  autocomplete="name"
                  class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm font-bold text-white placeholder-slate-500"
                />
                <p class="text-[11px] text-slate-400">
                  Your name will appear on the PSI Bridge Top Bar and Official End-of-Exam Score Report.
                </p>
              </div>

              <!-- Candidate Email / LF ID -->
              <div class="space-y-1.5">
                <label for="ckad-candidate-email-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Linux Foundation ID / Candidate Email
                </label>
                <input
                  id="ckad-candidate-email-input"
                  type="email"
                  value="${this.escapeHtml(candidateEmail)}"
                  oninput="window.app.setCkadCandidateEmail(this.value)"
                  placeholder="candidate@linuxfoundation.org"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-slate-200 placeholder-slate-600"
                />
              </div>

              <!-- Select Exam Set Dropdown -->
              <div class="space-y-2">
                <label for="ckad-checkin-set-select" class="block text-xs font-black uppercase tracking-wider text-slate-200">
                  Select Official Exam Set (16 Tasks • 120 Mins)
                </label>
                <select
                  id="ckad-checkin-set-select"
                  onchange="window.app.selectCheckinExamSet(this.value)"
                  class="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs font-bold text-white cursor-pointer"
                >
                  ${allSets
                    .map((s) => {
                      const count = (s.questionIds || []).length || 16;
                      const mins = s.durationMinutes || 120;
                      const selected = s.id === activeSet.id ? "selected" : "";
                      return `<option value="${this.escapeHtml(s.id)}" ${selected}>${this.escapeHtml(s.badge)} — ${this.escapeHtml(s.title)} (${count} Tasks • ${mins} Mins)</option>`;
                    })
                    .join("")}
                </select>

                <button
                  type="button"
                  onclick="window.app.generateNewRandomExamSet(16)"
                  class="w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🎲 Generate Brand-New Randomized Exam Set (16 Tasks • 120 Mins)</span>
                </button>
              </div>
            </div>

            <!-- Primary Action Button: Start Official Exam -->
            <div class="pt-2 space-y-2.5">
              <button
                id="ckad-start-official-exam-btn"
                type="button"
                onclick="window.app.startOfficialCkadExam()"
                class="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀 I Agree &amp; Start Official CKAD Exam (${durationMins}:00 Countdown)</span>
              </button>
              <div class="text-[11px] text-center text-slate-400">
                Clicking Start immediately activates the 02:00:00 timer and provisions Task 1 in <code class="font-mono text-slate-300">~/ckad-workspace</code>.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCkadScoreReportBanner(report) {
    if (!report) return "";
    const passed = Boolean(report.passedExam);

    return `
      <div class="bg-slate-950 border-2 ${
        passed ? "border-emerald-500/80" : "border-rose-500/80"
      } rounded-3xl overflow-hidden shadow-2xl text-slate-100 space-y-5 p-6 sm:p-7">
        <!-- Header Banner -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full ${
              passed
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            } text-xs font-black uppercase tracking-wider">
              ${
                passed
                  ? "🎉 CONGRATULATIONS! PASSED OFFICIAL CKAD EXAM SIMULATION"
                  : "⚠️ EXAM COMPLETED — SCORE BELOW 66% PASSING THRESHOLD (NEEDS REVIEW)"
              }
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white">
              Official CNCF CKAD Examination Score Report
            </h2>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
              <span>👤 Candidate: <strong class="text-white">${this.escapeHtml(report.candidateName)}</strong></span>
              <span>•</span>
              <span>🆔 Exam ID: <strong class="text-cyan-400">${this.escapeHtml(report.examId)}</strong></span>
              <span>•</span>
              <span>📋 Set: <strong class="text-purple-300">${this.escapeHtml(report.setBadge)}</strong></span>
              <span>•</span>
              <span>⏱️ Time Used: <strong class="text-amber-300">${this.formatCkadExamCountdown(report.timeUsedSeconds)} / ${this.formatCkadExamCountdown(report.totalDurationSeconds)}</strong></span>
            </div>
          </div>

          <!-- Score Badge -->
          <div class="flex items-center gap-4 shrink-0">
            <div class="px-6 py-4 rounded-2xl ${
              passed ? "bg-emerald-950/90 border border-emerald-500/50" : "bg-rose-950/90 border border-rose-500/50"
            } text-center">
              <div class="text-[10px] font-black uppercase tracking-wider text-slate-300">FINAL SCORE</div>
              <div class="text-3xl font-black font-mono ${passed ? "text-emerald-400" : "text-rose-400"}">
                ${report.scorePercentage}%
              </div>
              <div class="text-[11px] font-bold ${passed ? "text-emerald-300" : "text-rose-300"}">
                ${report.earnedWeight} / ${report.totalWeight} pts (Pass: ≥ ${report.passingScore}%)
              </div>
            </div>
          </div>
        </div>

        <!-- Task-by-Task Breakdown Table -->
        <div class="space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-sm font-black uppercase tracking-wider text-slate-200">
              📊 Task-by-Task Performance Breakdown (${report.tasksPassed} / ${report.totalTasks} Tasks Passed)
            </h3>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="window.app.resumeOfficialCkadExam()"
                class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer">
                ▶️ Return to Exam Tasks
              </button>
              <button onclick="window.app.switchCkadTab('analytics')"
                class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer">
                📊 View Full Mistake Analytics
              </button>
              <button onclick="window.app.exitOfficialCkadExam()"
                class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer">
                🔄 Start New Exam Session
              </button>
            </div>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-slate-800">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                  <th class="py-2.5 px-3">Task #</th>
                  <th class="py-2.5 px-3">Task Title &amp; Cluster Context</th>
                  <th class="py-2.5 px-3">Curriculum Domain</th>
                  <th class="py-2.5 px-3">Weight</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3">Score</th>
                  <th class="py-2.5 px-3">Time Spent</th>
                  <th class="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80 bg-slate-950/60">
                ${(report.taskBreakdown || [])
                  .map(
                    (tb) => `
                      <tr class="hover:bg-slate-900/60">
                        <td class="py-2.5 px-3 font-mono font-bold text-slate-300">Task ${tb.index + 1}</td>
                        <td class="py-2.5 px-3">
                          <div class="font-bold text-white">${this.escapeHtml(tb.title)}</div>
                          <div class="text-[11px] font-mono text-cyan-400">Context: ${this.escapeHtml(tb.contextCluster)} • ID: ${this.escapeHtml(tb.questionId.toUpperCase())}</div>
                        </td>
                        <td class="py-2.5 px-3 text-slate-400">${this.escapeHtml(tb.domainTitle)}</td>
                        <td class="py-2.5 px-3 font-mono font-bold text-amber-300">${tb.weight}%</td>
                        <td class="py-2.5 px-3">
                          ${
                            tb.passedAll
                              ? `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">✓ PASSED</span>`
                              : tb.attempted
                              ? `<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[11px]">✗ FAILED (${tb.passedCount}/${tb.totalChecks})</span>`
                              : `<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[11px]">UNVERIFIED</span>`
                          }
                        </td>
                        <td class="py-2.5 px-3 font-mono font-bold ${tb.passedAll ? "text-emerald-400" : "text-slate-300"}">
                          ${tb.earnedScore} / ${tb.weight}%
                        </td>
                        <td class="py-2.5 px-3 font-mono text-slate-400">
                          ${this.formatCkadTime(tb.timeSpentSeconds)}
                        </td>
                        <td class="py-2.5 px-3">
                          <button onclick="window.app.resumeOfficialCkadExam(); window.app.selectCkadQuestionIndex(${tb.index});"
                            class="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 font-bold text-[11px] cursor-pointer">
                            🔍 Review / Retry Task
                          </button>
                        </td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderCkadActiveExamTab() {
    if (!this.ckadLabState || !this.ckadLabState.examSessionActive) {
      return this.renderCkadCheckInGate();
    }

    const activeSet = this.ckadActiveSet;
    const questions = (activeSet && activeSet.questions) || [];
    const q = this.getActiveCkadQuestion();
    if (!q) {
      return `<div class="p-8 text-center text-slate-400">No CKAD Exam Tasks found.</div>`;
    }

    const qKey = this.getCkadQuestionKey(q);
    const envState = this.ckadEnvStatus[qKey] || null;
    const gradeResult = this.ckadGradeResults[qKey] || null;
    const isFlagged = this.isCkadQuestionFlagged(this.ckadQuestionIndex, q);
    const showThai = Boolean(this.ckadLabState.showThaiTranslation);

    // Calculate set progress & flagged count
    let passedInSet = 0;
    let earnedInSet = 0;
    let maxInSet = 0;
    let flaggedCount = 0;
    questions.forEach((item, idx) => {
      const k = this.getCkadQuestionKey(item);
      const gr = this.ckadGradeResults[k];
      maxInSet += Number(item.weight) || 5;
      if (gr) {
        if (gr.passedAll) passedInSet += 1;
        earnedInSet += Number(gr.earnedScore) || 0;
      }
      if (this.isCkadQuestionFlagged(idx, item)) {
        flaggedCount += 1;
      }
    });
    const setScorePct = maxInSet > 0 ? Math.round((earnedInSet / maxInSet) * 100) : 0;

    // Timer state
    const remSec = this.ckadLabState.examRemainingSeconds ?? 7200;
    const totalSec = this.ckadLabState.examTotalDurationSeconds || 7200;
    const remPct = Math.max(0, Math.min(100, Math.round((remSec / totalSec) * 100)));
    const isCriticalTime = remSec < 300; // < 5 mins
    const isWarningTime = !isCriticalTime && remSec < 1200; // < 20 mins
    const timerColorClass = isCriticalTime
      ? "text-rose-400 border-rose-500/70 bg-rose-950/60 animate-pulse"
      : isWarningTime
      ? "text-amber-300 border-amber-500/60 bg-amber-950/50"
      : "text-emerald-400 border-slate-700 bg-slate-900";
    const barColorClass = isCriticalTime
      ? "bg-rose-500"
      : isWarningTime
      ? "bg-amber-400"
      : "bg-emerald-500";

    const wsDir = q.workspaceDir || q.id;
    const contextCluster = q.contextCluster || "k8s-c1-H";
    const contextCmd = q.contextCommand || `kubectl config use-context ${contextCluster}`;
    const starterFiles = Object.keys(q.setupSpec?.files || {});
    const terminalQuickBlock = `${contextCmd}\ncd ~/ckad-workspace/${wsDir}\nkubectl get all -n ${q.namespace}`;

    return `
      <div class="space-y-4">
        <!-- Official Score Report Banner (Shown when examSubmitted === true) -->
        ${
          this.ckadLabState.examSubmitted && this.ckadLabState.lastScoreReport
            ? this.renderCkadScoreReportBanner(this.ckadLabState.lastScoreReport)
            : ""
        }

        <!-- OFFICIAL PSI BRIDGE DARK TOP EXAM BAR -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-3.5">
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <!-- Left: Exam Console Identity & Candidate Info -->
            <div class="flex flex-wrap items-center gap-3">
              <div class="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-cyan-300 font-black text-xs flex items-center gap-2">
                <span>☸️ LF-CKAD Exam Console</span>
                <span class="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 font-mono">PSI Bridge</span>
              </div>
              <div class="text-xs font-mono text-slate-300 flex flex-wrap items-center gap-2">
                <span>Candidate: <strong class="font-bold text-white">${this.escapeHtml(this.ckadLabState.candidateName || "Candidate")}</strong></span>
                <span class="text-slate-600">|</span>
                <span>Exam ID: <strong class="text-cyan-400">LF-CKAD-${activeSet.seedBase || 100}</strong></span>
                <span class="text-slate-600">|</span>
                <span>Verified: <strong class="text-emerald-400">${passedInSet}/${questions.length}</strong> (${setScorePct}%)</span>
              </div>
            </div>

            <!-- Center: Real 120-Minute Countdown Timer (HH:MM:SS) + Task Elapsed Time -->
            <div class="flex flex-wrap items-center gap-3">
              <div class="px-4 py-2 rounded-2xl border ${timerColorClass} flex items-center gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="text-slate-400 font-sans font-bold uppercase text-[10px]">⏳ Time Remaining:</span>
                    <strong id="ckad-exam-countdown" class="text-base sm:text-lg font-black tracking-wider">${this.formatCkadExamCountdown(remSec)}</strong>
                  </div>
                  <div class="w-40 sm:w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div id="ckad-exam-progress-bar" class="${barColorClass} h-1.5 transition-all duration-300" style="width: ${remPct}%"></div>
                  </div>
                </div>
                <button onclick="window.app.toggleCkadTimer()"
                  class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold cursor-pointer"
                  title="Pause / Resume Exam Timer">
                  ${this.ckadTimerRunning ? "⏸️" : "▶️"}
                </button>
              </div>

              <!-- Quiet Task Timer for Per-Task Analytics -->
              <div class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <span class="text-slate-400">Task Time:</span>
                <strong id="ckad-q-timer" class="text-cyan-300">${this.formatCkadTime(this.ckadTimerSeconds)}</strong>
                <button onclick="window.app.resetCkadTimer()" class="text-[10px] text-slate-400 hover:text-white ml-1 cursor-pointer" title="Reset Task Stopwatch">🔄</button>
              </div>
            </div>

            <!-- Right: Flag for Review, New Variant, Submit Exam, Exit -->
            <div class="flex flex-wrap items-center gap-2">
              <button
                id="ckad-flag-btn"
                onclick="window.app.toggleCkadFlagQuestion()"
                class="px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  isFlagged
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40"
                }">
                ${isFlagged ? "🚩 Flagged" : "🚩 Flag for Review"}
              </button>

              <button onclick="window.app.randomizeCurrentQuestion()"
                class="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all cursor-pointer"
                title="Randomize namespace, pod names &amp; ports for this task">
                🎲 New Variant
              </button>

              <button
                id="ckad-submit-exam-btn"
                onclick="window.app.submitOfficialCkadExam()"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all cursor-pointer">
                🏁 End &amp; Submit Exam
              </button>

              <button onclick="window.app.exitOfficialCkadExam()"
                class="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title="Change Candidate / Return to Check-In">
                Exit
              </button>
            </div>
          </div>

          <!-- QUESTION NAVIGATION BAR (1 .. 16 with Flag & Status Indicators) -->
          <div class="pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button onclick="window.app.prevCkadQuestion()"
                ${this.ckadQuestionIndex === 0 ? "disabled" : ""}
                class="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer shrink-0">
                ← Prev Task
              </button>

              ${questions
                .map((item, idx) => {
                  const k = this.getCkadQuestionKey(item);
                  const gr = this.ckadGradeResults[k];
                  const flagged = this.isCkadQuestionFlagged(idx, item);
                  const isCurr = idx === this.ckadQuestionIndex;

                  let pillStyle = "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500";
                  let statusBadge = "";
                  if (gr && gr.passedAll) {
                    pillStyle = "bg-emerald-950/90 text-emerald-300 border-emerald-500/50";
                    statusBadge = " ✓";
                  } else if (gr && !gr.passedAll) {
                    pillStyle = "bg-rose-950/90 text-rose-300 border-rose-500/50";
                    statusBadge = " ✗";
                  }
                  if (isCurr) {
                    pillStyle = "bg-blue-600 text-white border-cyan-400 ring-2 ring-cyan-400/40 shadow-md";
                  }
                  const flagIcon = flagged ? "🚩" : "";
                  return `
                    <button onclick="window.app.selectCkadQuestionIndex(${idx})"
                      class="px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${pillStyle}"
                      title="Task ${idx + 1}: ${this.escapeHtml(item.title)} (${item.weight}%)">
                      ${idx + 1}${flagIcon}${statusBadge}
                    </button>
                  `;
                })
                .join("")}

              <button onclick="window.app.nextCkadQuestion()"
                ${this.ckadQuestionIndex >= questions.length - 1 ? "disabled" : ""}
                class="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer shrink-0">
                Next Task →
              </button>
            </div>

            <div class="text-[11px] font-mono text-slate-400 flex items-center gap-3">
              <span>🚩 Flagged: <strong class="text-amber-400">${flaggedCount}</strong></span>
              <span>•</span>
              <span>Set: <strong class="text-slate-200">${this.escapeHtml(activeSet.badge)}</strong></span>
            </div>
          </div>
        </div>

        <!-- OFFICIAL PSI BRIDGE SPLIT-PANE QUESTION LAYOUT (LEFT: 100% ENGLISH INSTRUCTIONS | RIGHT: TERMINAL & VERIFIER) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <!-- LEFT COLUMN (7 Cols): Official Exam Task Instructions (100% English like PSI Bridge) -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <!-- Task Header Bar -->
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs font-mono">
                  Task ${this.ckadQuestionIndex + 1} of ${questions.length}
                </span>
                <span class="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs font-mono">
                  Weight: ${q.weight}%
                </span>
                <span class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                  Domain: ${this.escapeHtml(q.domainTitle)}
                </span>
                ${
                  isFlagged
                    ? `<span class="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">🚩 FLAGGED FOR REVIEW</span>`
                    : ""
                }
              </div>
              <span class="text-[11px] font-mono text-slate-400">
                ID: ${this.escapeHtml(q.id.toUpperCase())} • Seed #${q.seed}
              </span>
            </div>

            <!-- Mandatory Context Box (Exact Replica of Real CKAD Exam Box) -->
            <div class="p-4 rounded-2xl bg-slate-950 border-l-4 border-cyan-400 text-slate-200 font-mono text-xs space-y-2 shadow-inner">
              <div class="text-[11px] text-amber-300 font-bold">
                [Candidate: Always run this command first before solving this task]
              </div>
              <div class="flex items-center justify-between gap-2 bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800">
                <code class="text-emerald-300 font-bold text-xs sm:text-sm select-all">$ ${this.escapeHtml(contextCmd)}</code>
                <button onclick='window.app.copyText(${JSON.stringify(contextCmd)}, "Copied cluster context command!")'
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] shrink-0 cursor-pointer">
                  📋 Copy
                </button>
              </div>
            </div>

            <!-- Task Title (English) -->
            <div class="space-y-1">
              <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Task ${this.ckadQuestionIndex + 1}: ${this.escapeHtml(q.title)}
              </h2>
              <div class="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Cluster: <strong class="text-blue-600 dark:text-cyan-400">${this.escapeHtml(contextCluster)}</strong></span>
                <span>•</span>
                <span>Namespace: <strong class="text-blue-600 dark:text-cyan-400 cursor-pointer underline decoration-dotted" onclick='window.app.copyText(${JSON.stringify(q.namespace)}, "Copied namespace!")'>${this.escapeHtml(q.namespace)}</strong></span>
                <span>•</span>
                <span>Workspace: <strong class="text-amber-600 dark:text-amber-400 cursor-pointer underline decoration-dotted" onclick='window.app.copyText(${JSON.stringify(`~/ckad-workspace/${wsDir}`)}, "Copied workspace path!")'>~/ckad-workspace/${this.escapeHtml(wsDir)}</strong></span>
              </div>
            </div>

            <!-- Official English Context / Scenario Box -->
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div class="space-y-1.5">
                <div class="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                  Context / Scenario
                </div>
                <p class="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  ${this.formatInlineMarkdown(q.scenario)}
                </p>
              </div>

              <!-- Official English Task Requirements Bullet List -->
              <div class="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Task Requirements:
                </div>
                <ul class="list-disc pl-5 space-y-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  ${(q.requirements || [])
                    .map((req) => `<li class="pl-1">${this.formatInlineMarkdown(req)}</li>`)
                    .join("")}
                </ul>
              </div>
            </div>

            <!-- Bottom of Left Column: Exam Aids / Review Toggles (Hidden by default like real exam) -->
            <div class="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Optional Study &amp; Review Aids (Hidden during standard exam):
                </span>
                <button
                  type="button"
                  onclick="window.app.toggleCkadThaiTranslation()"
                  class="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    showThai
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  }">
                  🌐 ${showThai ? "Hide Thai Translation (ซ่อนคำแปลภาษาไทย)" : "Toggle Thai Translation (ดูคำแปลโจทย์ภาษาไทย)"}
                </button>
              </div>

              ${
                showThai
                  ? `
                    <div class="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/30 space-y-2.5 text-xs sm:text-sm">
                      <div class="font-black text-blue-600 dark:text-cyan-400">
                        🇹🇭 คำแปลโจทย์ภาษาไทย: ${this.escapeHtml(q.titleTh || q.title)}
                      </div>
                      <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
                        ${this.formatInlineMarkdown(q.scenarioTh || q.scenario)}
                      </p>
                      <ul class="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                        ${(q.requirementsTh || q.requirements || [])
                          .map((rTh) => `<li>${this.formatInlineMarkdown(rTh)}</li>`)
                          .join("")}
                      </ul>
                    </div>
                  `
                  : ""
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Exam Hint -->
                <details class="group rounded-2xl bg-amber-500/5 border border-amber-500/30 p-3.5 text-xs">
                  <summary class="font-black text-amber-600 dark:text-amber-400 cursor-pointer flex items-center justify-between">
                    <span>💡 Exam Hint</span>
                    <span class="text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <ul class="mt-2.5 space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    ${(q.hints || []).map((h) => `<li>${this.formatInlineMarkdown(h)}</li>`).join("")}
                  </ul>
                </details>

                <!-- Official Solution Commands -->
                <details class="group rounded-2xl bg-emerald-500/5 border border-emerald-500/30 p-3.5 text-xs">
                  <summary class="font-black text-emerald-600 dark:text-emerald-400 cursor-pointer flex items-center justify-between">
                    <span>🔑 Official Solution Commands</span>
                    <span class="text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div class="mt-2.5 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] text-slate-400">Reference solution for terminal verification:</span>
                      <button onclick='window.app.copyText(${JSON.stringify(q.solutionCommands || "")}, "Copied Official Solution Commands!")'
                        class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer">
                        📋 Copy
                      </button>
                    </div>
                    <pre class="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">${this.escapeHtml(q.solutionCommands || "")}</pre>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (5 Cols): Local Terminal Workspace & AI Exam Verifier -->
          <div class="lg:col-span-5 space-y-4">
            <!-- Card 1: Local Cluster & Workspace Status -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full ${envState && envState.ready ? "bg-emerald-500" : "bg-amber-500"} inline-block"></span>
                    <h3 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      ${
                        envState && envState.ready
                          ? `🟢 Environment Ready in ~/ckad-workspace/${this.escapeHtml(wsDir)}`
                          : `🟡 Local Workspace: ~/ckad-workspace/${this.escapeHtml(wsDir)}`
                      }
                    </h3>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Initial cluster objects and starter YAML manifests for Task ${this.ckadQuestionIndex + 1}
                  </p>
                </div>

                <button onclick="window.app.setupCkadLabEnvironment()"
                  class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-sm transition-all shrink-0 cursor-pointer">
                  🛠️ Provision / Reset Task Environment
                </button>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
                <div>☸️ Cluster Context : <strong class="text-cyan-400">${this.escapeHtml(contextCluster)}</strong></div>
                <div>🏷️ Active Namespace: <strong class="text-emerald-400">${this.escapeHtml(q.namespace)}</strong></div>
                <div>📁 Workspace Path  : <strong class="text-amber-300">~/ckad-workspace/${this.escapeHtml(wsDir)}</strong></div>
                <div>📄 Starter Files   : <strong class="text-slate-200">${
                  starterFiles.length ? this.escapeHtml(starterFiles.join(", ")) : "None (Create manifest or run kubectl)"
                }</strong></div>
              </div>
            </div>

            <!-- Card 2: Your Linux Terminal Commands -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💻 Your Linux Terminal Commands</span>
                </h3>
                <button onclick='window.app.copyText(${JSON.stringify(terminalQuickBlock)}, "Copied terminal commands!")'
                  class="px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-cyan-300 font-bold text-xs cursor-pointer">
                  📋 Copy Commands
                </button>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Run these commands in your local Linux terminal (<code class="font-mono">bash</code> / <code class="font-mono">zsh</code>) to switch context and solve Task ${this.ckadQuestionIndex + 1}:
              </p>
              <pre class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">${this.escapeHtml(terminalQuickBlock)}</pre>
            </div>

            <!-- Card 3: Verify Task / AI Auto-Grader -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    ✅ Verify Task / AI Auto-Grader
                  </h3>
                  <span class="text-[11px] font-mono text-slate-400">Weight: ${q.weight}%</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Inspects live cluster resources in namespace <code class="font-mono">${this.escapeHtml(q.namespace)}</code> and files in <code class="font-mono">~/ckad-workspace/${this.escapeHtml(wsDir)}</code>.
                </p>

                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    id="ckad-verify-task-btn"
                    onclick="window.app.verifyCkadLabAnswer()"
                    class="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2">
                    <span>✅ Verify Task Solution in Local Cluster</span>
                  </button>
                  ${!this.ckadBackendOnline ? `
                    <button onclick="window.app.verifyCkadLabAnswer('pass')"
                      class="w-full py-2 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-cyan-400 text-xs font-bold cursor-pointer">
                      🧪 Simulate Pass (Offline Demo)
                    </button>
                  ` : ""}
                </div>
              </div>

              <!-- Per-Checkpoint Grading Results -->
              ${gradeResult ? `
                <div class="p-4 rounded-2xl border ${
                  gradeResult.passedAll
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-rose-500/50 bg-rose-500/10"
                } space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="font-black text-xs sm:text-sm ${
                      gradeResult.passedAll ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }">
                      ${
                        gradeResult.passedAll
                          ? `🎉 PASSED (${gradeResult.earnedScore}% / ${gradeResult.maxScore}% Weight)`
                          : `⚠️ SCORE: ${gradeResult.earnedScore}% / ${gradeResult.maxScore}% (${gradeResult.passedCount}/${gradeResult.totalChecks} Checks)`
                      }
                    </div>
                    <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Time: ${this.formatCkadTime(gradeResult.timeSpentSeconds || 0)}
                    </div>
                  </div>

                  <div class="space-y-2">
                    ${(gradeResult.results || [])
                      .map(
                        (chk, cIdx) => `
                          <div class="p-3 rounded-xl bg-white/90 dark:bg-slate-950/90 border ${
                            chk.passed ? "border-emerald-500/30" : "border-rose-500/40"
                          } text-xs space-y-1">
                            <div class="font-bold ${
                              chk.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            }">
                              ${chk.passed ? "✅ PASS" : "❌ FAIL"} — Check ${cIdx + 1}: ${this.escapeHtml(chk.title)}
                            </div>
                            ${
                              !chk.passed && chk.failHint
                                ? `<div class="text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                                    💡 Hint: ${this.formatInlineMarkdown(chk.failHint)}
                                  </div>`
                                : `<div class="text-slate-500 dark:text-slate-400">${this.escapeHtml(chk.detail || "Verified OK")}</div>`
                            }
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              ` : ""}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCkadSetsAndTopicsTab() {
    const catalog = window.CKAD_LABS_DATA || { domains: [], blueprints: [], initialSets: [] };
    const allSets = [...(this.ckadCustomSets || []), ...(catalog.initialSets || [])];
    const attempts = this.ckadAnalytics?.attempts || [];

    // Count unresolved mistakes
    const unresolvedIds = new Set();
    Object.values(this.ckadAnalytics?.mistakes || {}).forEach((m) => {
      if (m && !m.resolved && m.questionId) unresolvedIds.add(m.questionId);
    });
    attempts.forEach((a) => {
      if (a && !a.passedAll && a.questionId) unresolvedIds.add(a.questionId);
    });

    return `
      <div class="space-y-6">
        <!-- Section A: Exam Sets & Dynamic Generator -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                📋 Section A: ชุดข้อสอบมาตรฐาน &amp; ชุดที่สร้างใหม่ (Exam Sets)
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                เลือกชุดข้อสอบมาตรฐาน หรือกดสุ่มสร้างข้อสอบชุดใหม่ที่เปลี่ยนชื่อ Namespace, พอด, พอร์ต และเงื่อนไขใหม่ทั้งหมดได้ไม่จำกัด
              </p>
            </div>
            <button onclick="window.app.generateNewRandomExamSet(16)"
              class="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer shrink-0">
              ➕ คลิกสร้างข้อสอบชุดใหม่ (สุ่มโจทย์และพารามิเตอร์ใหม่ทั้งหมด)
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${allSets
              .map((setDef) => {
                const setAttempts = attempts.filter((a) => a.setId === setDef.id);
                const passedCount = setAttempts.filter((a) => a.passedAll).length;
                const qCount = (setDef.questionIds || []).length;
                const isActive = this.ckadActiveSet && this.ckadActiveSet.id === setDef.id;

                return `
                  <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border ${
                    isActive ? "border-blue-500 ring-1 ring-blue-500/40" : "border-slate-200 dark:border-slate-800"
                  } flex flex-col justify-between space-y-4">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <span class="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-cyan-400 font-black text-xs">
                          ${this.escapeHtml(setDef.badge)}
                        </span>
                        <span class="text-xs font-bold ${
                          setAttempts.length ? "text-emerald-500" : "text-slate-400"
                        }">
                          ${setAttempts.length ? `ตรวจแล้ว ${passedCount}/${setAttempts.length} ครั้ง` : "พร้อมเริ่มทำ"}
                        </span>
                      </div>
                      <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        ${this.escapeHtml(setDef.title)}
                      </h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        ${this.escapeHtml(setDef.description)}
                      </p>
                      <div class="text-[11px] font-mono text-slate-400">
                        📌 จำนวน ${qCount} ข้อ • ⏱️ เวลา ${setDef.durationMinutes || qCount * 6} นาที
                      </div>
                    </div>

                    <div class="pt-2 flex flex-col gap-2">
                      <button onclick="window.app.startCkadExamSet('${setDef.id}', false)"
                        class="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all cursor-pointer">
                        🚀 เริ่มทำชุดนี้
                      </button>
                      <button onclick="window.app.startCkadExamSet('${setDef.id}', true)"
                        class="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer">
                        🎲 สุ่มค่าโจทย์ในชุดนี้ใหม่
                      </button>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <!-- Section B: Topic / Domain Focus Mode -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              🎯 Section B: เลือกฝึกเฉพาะหัวข้อ (Topic / Domain Focus Mode)
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              เลือกฝึกเจาะจงเฉพาะหมวดจาก 5 หมวดหลักของ CNCF CKAD หรือคลิกที่ข้อสอบรายข้อเพื่อกระโดดไปฝึกทันที
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${(catalog.domains || [])
              .map((dom) => {
                const domQuestions = (catalog.blueprints || []).filter((b) => b.domainId === dom.id);
                const dStat = (this.ckadAnalytics?.domainStats || {})[dom.id] || {
                  attempts: 0,
                  totalEarned: 0,
                  totalMax: 0
                };
                const accPct = dStat.totalMax > 0 ? Math.round((dStat.totalEarned / dStat.totalMax) * 100) : null;

                return `
                  <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3.5">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                          Domain ${dom.number} (${dom.weight}% Weight)
                        </span>
                        <span class="text-xs font-bold ${
                          accPct === null ? "text-slate-400" : accPct >= 66 ? "text-emerald-500" : "text-rose-500"
                        }">
                          ${accPct === null ? "ยังไม่เคยตรวจ" : `ความแม่นยำ ${accPct}%`}
                        </span>
                      </div>
                      <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        ${this.escapeHtml(dom.title)} — ${this.escapeHtml(dom.titleTh)}
                      </h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400">
                        ${this.escapeHtml(dom.topics)}
                      </p>

                      <!-- Question links in this domain -->
                      <div class="flex flex-wrap gap-1.5 pt-1">
                        ${domQuestions
                          .map(
                            (bp) => `
                              <button onclick="window.app.openCkadLabQuestion('${bp.id}')"
                                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-[11px] font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                                title="${this.escapeHtml(bp.baseTitle)}">
                                ${this.escapeHtml(bp.id)}: ${this.escapeHtml(bp.baseTitle.slice(0, 26))}
                              </button>
                            `
                          )
                          .join("")}
                      </div>
                    </div>

                    <div class="pt-2 flex items-center gap-2">
                      <button onclick="window.app.startCkadDomainPractice('${dom.id}', false)"
                        class="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer">
                        🎯 ฝึกเฉพาะหมวดนี้ (${domQuestions.length} ข้อ)
                      </button>
                      <button onclick="window.app.startCkadDomainPractice('${dom.id}', true)"
                        class="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer">
                        🎲 สุ่มโจทย์ใหม่ในหมวดนี้
                      </button>
                    </div>
                  </div>
                `;
              })
              .join("")}

            <!-- Card 6: Weakness Retry Mode -->
            <div class="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col justify-between space-y-3.5">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-xs">
                    🔥 Weakness Retry Mode
                  </span>
                  <span class="text-xs font-bold text-rose-500">
                    ${unresolvedIds.size ? `พบข้อที่เคยพลาด ${unresolvedIds.size} ข้อ` : "โหมดรวมโจทย์ปราบเซียน"}
                  </span>
                </div>
                <h3 class="font-black text-sm sm:text-base text-rose-600 dark:text-rose-400">
                  🔥 โหมดซ้อมเฉพาะข้อที่เคยทำผิด (Weakness Retry Mode)
                </h3>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ดึงเฉพาะหัวข้อและโจทย์ที่คุณเคยทำผิดในคลัสเตอร์ (เช่นลืมใส่ <code class="font-mono">policyTypes</code>, ใส่ <code class="font-mono">securityContext</code> ผิดระดับ หรือลืมบันทึกไฟล์) มาสุ่มพารามิเตอร์ใหม่ให้ซ้อมจนชำนาญ
                </p>
              </div>
              <button onclick="window.app.startCkadWeaknessPractice()"
                class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow cursor-pointer">
                🔥 เริ่มซ้อมเฉพาะข้อที่เคยทำผิดทันที
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCkadAnalyticsTab() {
    const catalog = window.CKAD_LABS_DATA || { domains: [], blueprints: [] };
    const analytics = this.ckadAnalytics || this.createDefaultCkadAnalytics();
    const attempts = analytics.attempts || [];

    // Calculate KPIs
    let totalEarned = 0;
    let totalMax = 0;
    let totalSeconds = 0;
    let passedAttempts = 0;

    attempts.forEach((a) => {
      totalEarned += Number(a.earnedScore) || 0;
      totalMax += Number(a.maxScore) || 0;
      totalSeconds += Number(a.timeSpentSeconds) || 0;
      if (a.passedAll) passedAttempts += 1;
    });

    const overallAccuracy = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    const avgTimeSeconds = attempts.length > 0 ? Math.round(totalSeconds / attempts.length) : 0;

    // Identify weakest domain
    let weakestDomainLabel = "ยังไม่มีประวัติข้อที่ผิด";
    let lowestPct = 101;
    (catalog.domains || []).forEach((dom) => {
      const st = (analytics.domainStats || {})[dom.id];
      if (st && st.totalMax > 0) {
        const pct = Math.round((st.totalEarned / st.totalMax) * 100);
        if (pct < lowestPct) {
          lowestPct = pct;
          weakestDomainLabel = `Domain ${dom.number}: ${dom.title} (${pct}%)`;
        }
      }
    });

    return `
      <div class="space-y-6">
        <!-- 4 Summary KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-1 shadow-sm">
            <div class="text-xs text-slate-400 font-bold">คะแนนเฉลี่ยล่าสุด (เกณฑ์ผ่าน 66%)</div>
            <div class="text-xl sm:text-2xl font-black ${
              attempts.length === 0 ? "text-slate-400" : overallAccuracy >= 66 ? "text-emerald-500" : "text-rose-500"
            }">
              ${attempts.length === 0 ? "— (0%)" : `${overallAccuracy}% (${overallAccuracy >= 66 ? "PASS" : "NEEDS PRACTICE"})`}
            </div>
            <div class="text-[11px] text-slate-400">เกณฑ์สอบผ่าน CNCF CKAD คือ 66%</div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-1 shadow-sm">
            <div class="text-xs text-slate-400 font-bold">เวลาเฉลี่ยที่ใช้ต่อข้อ</div>
            <div class="text-xl sm:text-2xl font-black text-blue-600 dark:text-cyan-400 font-mono">
              ${this.formatCkadTime(avgTimeSeconds)} นาที
            </div>
            <div class="text-[11px] text-slate-400">เป้าหมายแนะนำ ≤ 06:00 นาที/ข้อ</div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-1 shadow-sm">
            <div class="text-xs text-slate-400 font-bold">จำนวนครั้งที่ตรวจข้อสอบทั้งหมด</div>
            <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ${passedAttempts} / ${attempts.length} ครั้งที่ผ่าน
            </div>
            <div class="text-[11px] text-slate-400">บันทึกจาก Local Env อัตโนมัติ</div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-1 shadow-sm">
            <div class="text-xs text-slate-400 font-bold">หมวดที่ควรเน้นเป็นพิเศษ</div>
            <div class="text-xs sm:text-sm font-black text-amber-500 truncate" title="${this.escapeHtml(weakestDomainLabel)}">
              ${this.escapeHtml(weakestDomainLabel)}
            </div>
            <div class="text-[11px] text-slate-400">วิเคราะห์จากคะแนนรายหมวด</div>
          </div>
        </div>

        <!-- 5-Domain Readiness Progress Bars -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              📊 ความพร้อมแยกตามหมวดข้อสอบจริง (5-Domain Readiness)
            </h3>
            <button onclick="window.app.resetCkadAnalytics()"
              class="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold cursor-pointer">
              🗑️ ล้างสถิติทั้งหมด (Reset Analytics)
            </button>
          </div>

          <div class="space-y-3.5 text-xs">
            ${(catalog.domains || [])
              .map((dom) => {
                const st = (analytics.domainStats || {})[dom.id] || {
                  attempts: 0,
                  passed: 0,
                  totalEarned: 0,
                  totalMax: 0
                };
                const domAttempts = attempts.filter((a) => a.domainId === dom.id);
                const domAvgSec = domAttempts.length
                  ? Math.round(
                      domAttempts.reduce((acc, x) => acc + (Number(x.timeSpentSeconds) || 0), 0) / domAttempts.length
                    )
                  : 0;
                const pct = st.totalMax > 0 ? Math.round((st.totalEarned / st.totalMax) * 100) : 0;
                const barColor =
                  st.totalMax === 0
                    ? "bg-slate-400"
                    : pct >= 70
                    ? "bg-emerald-500"
                    : pct >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500";

                return `
                  <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center justify-between gap-2 font-bold">
                      <span class="text-slate-800 dark:text-slate-200">
                        ${dom.number}. ${this.escapeHtml(dom.title)} (${dom.weight}%) — ${this.escapeHtml(dom.titleTh)}
                      </span>
                      <div class="flex items-center gap-3">
                        <span class="${pct >= 66 ? "text-emerald-500" : st.totalMax > 0 ? "text-amber-500" : "text-slate-400"}">
                          ความแม่นยำ ${pct}% (${st.passed}/${st.attempts} ข้อ) • เวลาเฉลี่ย ${this.formatCkadTime(domAvgSec)} นาที/ข้อ
                        </span>
                        <button onclick="window.app.startCkadDomainPractice('${dom.id}', true)"
                          class="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-600 dark:text-cyan-400 font-bold cursor-pointer">
                          ฝึกหมวดนี้
                        </button>
                      </div>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div class="${barColor} h-2.5 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <!-- Mistake & Time Analysis Log Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              ❌ ตารางวิเคราะห์ข้อที่ทำผิด &amp; เวลาที่ใช้รายข้อ (Mistake &amp; Time Analysis Log)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              บันทึกประวัติการกดตรวจคำตอบทุกครั้ง พร้อมระบุ Checkpoint ที่ผิดและคำแนะนำจาก AI เพื่อให้คุณกดซ้อมข้อเดิมหรือสุ่มโจทย์คล้ายเดิมได้ทันที
            </p>
          </div>

          ${
            attempts.length === 0
              ? `
                <div class="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div class="text-sm font-bold text-slate-600 dark:text-slate-300">ยังไม่มีประวัติการตรวจข้อสอบ</div>
                  <p class="text-xs text-slate-400">ไปที่แท็บ "🖥️ 1. หน้าโจทย์สอบจริง" แล้วกดตรวจคำตอบเพื่อเริ่มเก็บสถิติเวลาและจุดที่ผิด</p>
                </div>
              `
              : `
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th class="py-3 px-3">ข้อที่ / หัวข้อโจทย์</th>
                        <th class="py-3 px-3">หมวด (Domain)</th>
                        <th class="py-3 px-3">คะแนนที่ได้</th>
                        <th class="py-3 px-3">เวลาที่ใช้</th>
                        <th class="py-3 px-3">วิเคราะห์จุดที่ผิด / ผลการตรวจใน Local Env</th>
                        <th class="py-3 px-3">การจัดการ (ซ้อมซ้ำ / สุ่มใหม่)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                      ${attempts
                        .slice(0, 30)
                        .map((att) => {
                          const bp = (catalog.blueprints || []).find((b) => b.id === att.questionId);
                          const targetSec = ((bp && bp.targetMinutes) || 6) * 60;
                          const isOverTime = (Number(att.timeSpentSeconds) || 0) > targetSec;
                          const failedList = att.failedChecks || [];

                          return `
                            <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                              <td class="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                                <div>${this.escapeHtml((att.questionId || "").toUpperCase())}: ${this.escapeHtml(att.title)}</div>
                                <div class="text-[10px] font-mono text-slate-400">Seed #${att.seed || 100}</div>
                              </td>
                              <td class="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                                ${this.escapeHtml(att.domainTitle || att.domainId)}
                              </td>
                              <td class="py-3.5 px-3 font-black ${
                                att.passedAll ? "text-emerald-500" : "text-rose-500"
                              }">
                                ${att.passedCount}/${att.totalChecks} (${att.earnedScore}/${att.maxScore}%)
                              </td>
                              <td class="py-3.5 px-3 font-mono ${
                                isOverTime ? "text-amber-500 font-bold" : "text-slate-600 dark:text-slate-300"
                              }">
                                ${this.formatCkadTime(att.timeSpentSeconds)} นาที
                                ${isOverTime ? `<span class="block text-[10px] text-amber-500">⚠️ เกินเวลาเป้า</span>` : ""}
                              </td>
                              <td class="py-3.5 px-3 max-w-md">
                                ${
                                  att.passedAll
                                    ? `<span class="text-emerald-500 font-semibold">✅ ผ่านครบทุก Checkpoint</span>`
                                    : failedList
                                        .map(
                                          (fc) => `
                                            <div class="mb-1 text-rose-500">
                                              <strong>❌ ${this.escapeHtml(fc.title)}:</strong>
                                              <span class="text-slate-600 dark:text-slate-300">${this.formatInlineMarkdown(fc.failHint || "")}</span>
                                            </div>
                                          `
                                        )
                                        .join("")
                                }
                              </td>
                              <td class="py-3.5 px-3">
                                <div class="flex flex-col sm:flex-row gap-1.5">
                                  <button onclick="window.app.retryCkadQuestion('${att.questionId}', ${Number(att.seed) || 100})"
                                    class="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold whitespace-nowrap cursor-pointer">
                                    🔁 ซ้อมข้อนี้ซ้ำ (Retry Exact)
                                  </button>
                                  <button onclick="window.app.retryCkadQuestion('${att.questionId}', null)"
                                    class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold whitespace-nowrap cursor-pointer">
                                    🎲 สุ่มโจทย์คล้ายข้อนี้ (New Variant)
                                  </button>
                                </div>
                              </td>
                            </tr>
                          `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
          }
        </div>
      </div>
    `;
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
