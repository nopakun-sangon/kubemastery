/**
 * KubeMastery: Progressive Web App (PWA) Manager
 * Cross-platform installation controller for Web Browsers, PC, Android, and iOS.
 */

(function () {
  'use strict';

  class PWAManager {
    constructor() {
      this.deferredPrompt = null;
      this.isStandalone = false;
      this.isIOS = false;
      this.isAndroid = false;
      this.isDesktop = false;
      this.bannerDismissed = false;

      this.initEnvironment();
      this.initServiceWorker();
      this.initInstallEvents();
      this.initUI();
    }

    initEnvironment() {
      // 1. Detect if running as an installed standalone app
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = window.navigator.standalone === true;
      this.isStandalone = isStandaloneMedia || isIOSStandalone;

      // 2. Detect platform OS
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      this.isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      this.isAndroid = /android/i.test(ua);
      this.isDesktop = !this.isIOS && !this.isAndroid;

      // Check if user previously dismissed prompt
      this.bannerDismissed = localStorage.getItem('kubemastery_pwa_dismissed') === 'true';

      console.log(`[PWA] Environment: Standalone=${this.isStandalone}, iOS=${this.isIOS}, Android=${this.isAndroid}, Desktop=${this.isDesktop}`);
    }

    initServiceWorker() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('./sw.js')
            .then((reg) => {
              console.log('[PWA] Service Worker registered with scope:', reg.scope);

              // Check for updates
              reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New version available! Ready to refresh.');
                    this.showUpdateToast(newWorker);
                  }
                });
              });
            })
            .catch((err) => {
              console.warn('[PWA] Service Worker registration failed:', err);
            });
        });
      }
    }

    initInstallEvents() {
      // Chrome / Edge / Android install prompt capture
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        console.log('[PWA] Captured beforeinstallprompt event.');

        // Update UI to show install buttons
        this.updateInstallButtons(true);

        // Show floating install banner if not dismissed and not in standalone
        if (!this.isStandalone && !this.bannerDismissed) {
          setTimeout(() => this.showFloatingBanner(), 2500);
        }
      });

      // App successfully installed
      window.addEventListener('appinstalled', () => {
        console.log('[PWA] Application successfully installed!');
        this.deferredPrompt = null;
        this.isStandalone = true;
        this.updateInstallButtons(false);
        this.hideFloatingBanner();

        if (window.soundFx && window.soundFx.playVictory) {
          window.soundFx.playVictory();
        }

        this.showToast('🎉 ติดตั้งแอป KubeMastery สำเร็จแล้ว! พร้อมใช้งานแบบออฟไลน์');
      });
    }

    initUI() {
      // Wait for DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.injectUI());
      } else {
        this.injectUI();
      }
    }

    injectUI() {
      // 1. Inject iOS Install Modal HTML
      this.injectIOSModal();

      // 2. Inject Floating Install Banner HTML
      this.injectFloatingBanner();

      // 3. If on iOS and not standalone, show install button in header & menu
      if (this.isIOS && !this.isStandalone) {
        this.updateInstallButtons(true);
        if (!this.bannerDismissed) {
          setTimeout(() => this.showFloatingBanner(), 3000);
        }
      } else if (this.isStandalone) {
        this.updateInstallButtons(false);
      }
    }

    injectIOSModal() {
      if (document.getElementById('ios-install-modal')) return;

      const modal = document.createElement('div');
      modal.id = 'ios-install-modal';
      modal.className = 'fixed inset-0 z-50 hidden items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.onclick = (e) => {
        if (e.target === modal) this.closeIOSModal();
      };

      modal.innerHTML = `
        <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5 animate-fadeIn">
          
          <!-- Header -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                ⚡
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  ติดตั้ง KubeMastery บน iPhone / iPad
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  ใช้งานเต็มหน้าจอ ไร้แถบเบราว์เซอร์ พร้อมใช้งานออฟไลน์
                </p>
              </div>
            </div>
            <button onclick="window.pwaManager.closeIOSModal()" class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Step-by-step Guide -->
          <div class="space-y-3.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
            
            <!-- Step 1 -->
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-600 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                1
              </div>
              <div class="flex-1">
                <p class="font-bold text-slate-800 dark:text-slate-200">
                  แตะที่ปุ่ม <span class="text-cyan-600 font-black">"แชร์" (Share)</span>
                </p>
                <p class="text-slate-500 dark:text-slate-400 mt-0.5">
                  มองหาไอคอนรูปสี่เหลี่ยมมีลูกศรชี้ขึ้น 
                  <span class="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold mx-1">📤</span>
                  ที่แถบเครื่องมือด้านล่าง (หรือด้านบนของ iPad) ใน Safari
                </p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-600 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                2
              </div>
              <div class="flex-1">
                <p class="font-bold text-slate-800 dark:text-slate-200">
                  เลื่อนลงมาแล้วเลือก <span class="text-indigo-600 dark:text-indigo-400 font-black">"เพิ่มไปยังหน้าจอโฮม"</span>
                </p>
                <p class="text-slate-500 dark:text-slate-400 mt-0.5">
                  เลือกเมนู <span class="font-semibold text-slate-700 dark:text-slate-300">Add to Home Screen</span> (ไอคอนสี่เหลี่ยมมีเครื่องหมายบวก ➕)
                </p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-600 text-white font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                3
              </div>
              <div class="flex-1">
                <p class="font-bold text-slate-800 dark:text-slate-200">
                  แตะ <span class="text-emerald-600 dark:text-emerald-400 font-black">"เพิ่ม" (Add)</span> ที่มุมขวาบน
                </p>
                <p class="text-slate-500 dark:text-slate-400 mt-0.5">
                  แอป KubeMastery จะปรากฏเป็นไอคอนบนหน้าจอโฮมทันที เปิดใช้งานได้เสมือนแอปแท้
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Button -->
          <button onclick="window.pwaManager.closeIOSModal()" class="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-center">
            เข้าใจแล้ว (ปิดหน้าต่างนี้)
          </button>
        </div>
      `;

      document.body.appendChild(modal);
    }

    injectFloatingBanner() {
      if (document.getElementById('pwa-floating-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'pwa-floating-banner';
      banner.className = 'fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 max-w-sm w-[calc(100%-1.5rem)] sm:w-96 bg-white dark:bg-slate-900 border border-cyan-500/30 dark:border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all duration-300 transform translate-y-32 opacity-0 pointer-events-none';

      const platformLabel = this.isIOS ? 'iPhone / iPad' : (this.isAndroid ? 'Android' : 'คอมพิวเตอร์ PC');

      banner.innerHTML = `
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md shrink-0">
            ⚡
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                ติดตั้งแอป KubeMastery
              </h4>
              <button onclick="window.pwaManager.dismissFloatingBanner()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              ติดตั้งลง ${platformLabel} เพื่อเปิดใช้งานได้รวดเร็วทันทีแบบเต็มจอ และเรียนออฟไลน์ได้ทุกที่
            </p>
            <div class="flex items-center gap-2 mt-3">
              <button onclick="window.pwaManager.installApp()" class="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5">
                <span>📲</span>
                <span>ติดตั้งทันที</span>
              </button>
              <button onclick="window.pwaManager.dismissFloatingBanner()" class="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl transition-all">
                ไว้ทีหลัง
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(banner);
    }

    showFloatingBanner() {
      const banner = document.getElementById('pwa-floating-banner');
      if (banner && !this.isStandalone) {
        banner.classList.remove('translate-y-32', 'opacity-0', 'pointer-events-none');
        banner.classList.add('translate-y-0', 'opacity-100');
      }
    }

    hideFloatingBanner() {
      const banner = document.getElementById('pwa-floating-banner');
      if (banner) {
        banner.classList.add('translate-y-32', 'opacity-0', 'pointer-events-none');
        banner.classList.remove('translate-y-0', 'opacity-100');
      }
    }

    dismissFloatingBanner() {
      this.hideFloatingBanner();
      this.bannerDismissed = true;
      localStorage.setItem('kubemastery_pwa_dismissed', 'true');
    }

    updateInstallButtons(canInstall) {
      const headerBtn = document.getElementById('header-install-app-btn');
      const sidebarBtn = document.getElementById('sidebar-install-app-btn');
      const drawerBtn = document.getElementById('drawer-install-app-btn');

      const applyState = (btn) => {
        if (!btn) return;
        if (canInstall && !this.isStandalone) {
          btn.classList.remove('hidden');
          btn.classList.add('flex');
        } else {
          btn.classList.add('hidden');
          btn.classList.remove('flex');
        }
      };

      applyState(headerBtn);
      applyState(sidebarBtn);
      applyState(drawerBtn);
    }

    // Trigger installation flow
    installApp() {
      if (window.soundFx && window.soundFx.playClick) {
        window.soundFx.playClick();
      }

      // 1. Android / Chrome / Edge with deferredPrompt
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted installation prompt.');
            this.hideFloatingBanner();
          } else {
            console.log('[PWA] User dismissed installation prompt.');
          }
          this.deferredPrompt = null;
        });
        return;
      }

      // 2. iOS Safari
      if (this.isIOS) {
        this.openIOSModal();
        return;
      }

      // 3. Desktop browser (Chrome / Edge / Firefox) when beforeinstallprompt didn't trigger
      if (this.isDesktop) {
        this.showDesktopInstallGuide();
        return;
      }

      // Fallback
      alert('หากต้องการติดตั้งแอป กรุณาแตะที่เมนูเบราว์เซอร์ (จุดสามจุด) แล้วเลือก "ติดตั้งแอป" หรือ "เพิ่มลงในหน้าจอหลัก" ครับ');
    }

    openIOSModal() {
      const modal = document.getElementById('ios-install-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    closeIOSModal() {
      const modal = document.getElementById('ios-install-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    showDesktopInstallGuide() {
      this.showToast('💡 เพื่อติดตั้งบน PC: คลิกไอคอน "ติดตั้งแอป" (⊕ หรือ 💻) ที่มุมขวาในแถบ URL Address Bar ด้านบน');
    }

    showToast(message) {
      let toast = document.getElementById('pwa-global-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pwa-global-toast';
        toast.className = 'fixed top-20 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold transition-all duration-300 transform -translate-y-10 opacity-0 pointer-events-none flex items-center gap-2 max-w-sm';
        document.body.appendChild(toast);
      }
      toast.innerHTML = `<span>⚡</span><span>${message}</span>`;
      toast.classList.remove('-translate-y-10', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');

      setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0', 'pointer-events-none');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 5000);
    }

    showUpdateToast(worker) {
      let updateBar = document.getElementById('pwa-update-bar');
      if (!updateBar) {
        updateBar = document.createElement('div');
        updateBar.id = 'pwa-update-bar';
        updateBar.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-3 animate-fadeIn';
        updateBar.innerHTML = `
          <span>🚀 มีเวอร์ชันใหม่ของ KubeMastery พร้อมใช้งาน</span>
          <button onclick="window.location.reload()" class="px-3 py-1 bg-white text-indigo-700 rounded-xl font-black text-xs hover:bg-slate-100 transition-all">
            อัปเดตทันที
          </button>
        `;
        document.body.appendChild(updateBar);
      }
    }
  }

  // Expose global instance
  window.pwaManager = new PWAManager();
})();

