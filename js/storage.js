/**
 * KubeMastery: Local Storage & State Management
 * Tracks course completion, completed units, CLI drills, and JSON backup/restore.
 */

class StorageManager {
  constructor() {
    this.STORAGE_KEY = "kubemastery_data_v2";
    this.state = this.loadState();
    this.updateDailyStreak();
  }

  getDefaultState() {
    const today = new Date().toISOString().split("T")[0];
    return {
      version: 2,
      profile: {
        name: "Kubestronaut",
        avatar: "☸️",
        joinedDate: today
      },
      stats: {
        totalXP: 0,
        dailyXP: 0,
        streak: 1,
        lastActiveDate: today,
        cliDrillsCount: 0
      },
      completedCourses: [],  // e.g. ["course-ckad"]
      completedUnits: [],    // e.g. ["ckad-u1-1", "cka-u1-2"]
      unitQuizHistory: {},   // e.g. { "ckad-u1-1": { answered: 1, correct: true } }
      solvedCliDrills: [],   // e.g. ["cli-01", "cli-02"]
      dailyQuests: {
        date: today,
        readUnits: 0,        // target: 2 (+20 XP)
        solveCliDrills: 0    // target: 3 (+25 XP)
      },
      preferences: {
        theme: "dark",
        sfx: true
      }
    };
  }

  loadState() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const defaults = this.getDefaultState();
        const today = new Date().toISOString().split("T")[0];
        let quests = parsed.dailyQuests;
        if (!quests || quests.date !== today) {
          quests = defaults.dailyQuests;
        }
        return {
          ...defaults,
          ...parsed,
          profile: { ...defaults.profile, ...(parsed.profile || {}) },
          stats: { ...defaults.stats, ...(parsed.stats || {}) },
          completedUnits: Array.isArray(parsed.completedUnits) ? parsed.completedUnits : [],
          completedCourses: Array.isArray(parsed.completedCourses) ? parsed.completedCourses : [],
          solvedCliDrills: Array.isArray(parsed.solvedCliDrills) ? parsed.solvedCliDrills : [],
          dailyQuests: quests,
          preferences: { ...defaults.preferences, ...(parsed.preferences || {}) }
        };
      }
    } catch (e) {
      console.warn("StorageManager: Could not load state, using defaults.", e);
    }
    return this.getDefaultState();
  }

  getState() {
    return this.state;
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("StorageManager: Could not save state.", e);
    }
  }

  updateDailyStreak() {
    const today = new Date().toISOString().split("T")[0];
    const last = this.state.stats.lastActiveDate;
    if (last === today) return;

    const lastDate = new Date(last);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.state.stats.streak += 1;
    } else if (diffDays > 1) {
      this.state.stats.streak = 1;
    }
    this.state.stats.dailyXP = 0;
    this.state.stats.lastActiveDate = today;
    this.save();
  }

  addXP(amount) {
    const pts = Number(amount) || 0;
    if (pts <= 0) return;
    this.state.stats.totalXP += pts;
    this.state.stats.dailyXP += pts;
    this.save();
  }

  toggleUnitComplete(unitId, xpReward = 15) {
    const idx = this.state.completedUnits.indexOf(unitId);
    let isNowComplete = false;
    if (idx === -1) {
      this.state.completedUnits.push(unitId);
      this.addXP(xpReward);
      this.state.dailyQuests.readUnits += 1;
      isNowComplete = true;
    } else {
      this.state.completedUnits.splice(idx, 1);
      isNowComplete = false;
    }
    this.save();
    return isNowComplete;
  }

  recordUnitQuizAnswer(unitId, selectedOption, isCorrect) {
    if (!this.state.unitQuizHistory) this.state.unitQuizHistory = {};
    const prev = this.state.unitQuizHistory[unitId];
    this.state.unitQuizHistory[unitId] = {
      answered: selectedOption,
      correct: isCorrect,
      timestamp: new Date().toISOString()
    };
    if (isCorrect && (!prev || !prev.correct)) {
      this.addXP(10);
    }
    this.save();
  }

  markCliDrillSolved(drillId, xp = 15) {
    if (!this.state.solvedCliDrills.includes(drillId)) {
      this.state.solvedCliDrills.push(drillId);
      this.addXP(xp);
    } else {
      this.addXP(5);
    }
    this.state.stats.cliDrillsCount += 1;
    this.state.dailyQuests.solveCliDrills += 1;
    this.save();
  }

  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  importJSON(jsonStr) {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object" || !parsed.stats) {
      throw new Error("รูปแบบไฟล์ JSON Backup ไม่ถูกต้อง");
    }
    this.state = {
      ...this.getDefaultState(),
      ...parsed
    };
    this.save();
    return true;
  }

  resetAll() {
    this.state = this.getDefaultState();
    this.save();
  }
}

window.storage = new StorageManager();
