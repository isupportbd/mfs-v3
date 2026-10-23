import { defineStore } from "pinia";
import { computed, ref } from "vue";

const THEME_KEY = "app-theme";
const FONT_KEY = "app-bangla-font";
const SIDEBAR_COLLAPSE_KEY = "sidebar-open-collapses";
const SIDEBAR_SCROLL_KEY = "sidebar-scroll-top";
type ThemeMode = "light" | "dark" | "auto";
type EffectiveTheme = "light" | "dark";
const THEME_MODES: ThemeMode[] = ["light", "dark", "auto"];
const THEME_CLASSES = ["theme-light", "theme-dark", "theme-auto"];

export interface BanglaFontOption {
  id: string;
  name: string;
  englishName: string;
  fontFamily: string;
  description: string;
  badge?: string;
}

export const BANGLA_FONTS: BanglaFontOption[] = [
  {
    id: "hind-siliguri",
    name: "হিন্দ শিলিগুড়ি (Hind Siliguri)",
    englishName: "Hind Siliguri",
    fontFamily: '"Hind Siliguri", "Public Sans", sans-serif',
    description: "সবচেয়ে জনপ্রিয়, আধুনিক ও দৃষ্টিনন্দন UI ফন্ট। ড্যাশবোর্ড ও অ্যাপের জন্য সেরা।",
    badge: "Recommended"
  },
  {
    id: "anek-bangla",
    name: "অনেকে বাংলা (Anek Bangla)",
    englishName: "Anek Bangla",
    fontFamily: '"Anek Bangla", "Public Sans", sans-serif',
    description: "স্মার্ট, আধুনিক ও ইউনিক কার্ভ স্টাইলের চমৎকার ফন্ট।",
    badge: "Modern"
  },
  {
    id: "noto-sans-bengali",
    name: "নোতো সান্স (Noto Sans Bengali)",
    englishName: "Noto Sans Bengali",
    fontFamily: '"Noto Sans Bengali", "Public Sans", sans-serif',
    description: "গুগলের অফিসিয়াল স্ট্যান্ডার্ড পরিচ্ছন্ন ফন্ট।"
  },
  {
    id: "tiro-bangla",
    name: "তিরো বাংলা (Tiro Bangla)",
    englishName: "Tiro Bangla",
    fontFamily: '"Tiro Bangla", "Public Sans", serif',
    description: "প্রফেশনাল, স্পষ্ট ও মার্জিত ট্রেডিশনাল লুক।"
  },
  {
    id: "mina",
    name: "মীনা (Mina)",
    englishName: "Mina",
    fontFamily: '"Mina", "Public Sans", sans-serif',
    description: "সহজ, সরল ও জ্যামিতিক মিনিমালিস্টিক স্টাইল।"
  },
  {
    id: "system",
    name: "সিস্টেম ডিফল্ট (Kalpurush / SolaimanLipi)",
    englishName: "System Bengali",
    fontFamily: 'Kalpurush, SolaimanLipi, "Nirmala UI", Vrinda, sans-serif',
    description: "ডিভাইসে থাকা লোকাল বা সিস্টেমের বাংলা ফন্ট।"
  }
];

export const useAdminUiStore = defineStore("admin-ui", () => {
  const sidebarOpen = ref(false);
  const themeMode = ref<ThemeMode>("auto");
  const currentFontId = ref<string>("hind-siliguri");
  const sidebarOpenCollapseIds = ref<string[]>([]);
  const sidebarScrollTop = ref(0);
  let sidebarAccordionEl: HTMLElement | null = null;
  let sidebarScrollListener: (() => void) | null = null;
  let colorSchemeQuery: MediaQueryList | null = null;
  let colorSchemeListener: ((event: MediaQueryListEvent) => void) | null = null;

  const themeIcon = computed(() => {
    if (themeMode.value === "light") return "bi-brightness-high-fill";
    if (themeMode.value === "dark") return "bi-moon-stars";
    return "bi-circle-half";
  });

  const isDark = computed(() => {
    if (themeMode.value === "dark") return true;
    if (themeMode.value === "light") return false;
    return systemPrefersDark();
  });

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const closeSidebar = () => {
    sidebarOpen.value = false;
  };

  const systemPrefersDark = () => window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;

  const resolveEffectiveTheme = (mode: ThemeMode): EffectiveTheme => (mode === "auto" ? (systemPrefersDark() ? "dark" : "light") : mode);

  const applyTheme = (mode: ThemeMode) => {
    themeMode.value = mode;

    // Apply to both documentElement and body so all CSS selectors work consistently
    const effective = resolveEffectiveTheme(mode);
    const root = document.documentElement;
    root.classList.remove(...THEME_CLASSES);
    root.classList.add(`theme-${mode}`);
    root.setAttribute("data-bs-theme", effective);

    if (typeof document !== "undefined" && document.body) {
      document.body.classList.remove(...THEME_CLASSES);
      document.body.classList.add(`theme-${mode}`);
    }

    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* storage unavailable - theme stays for this session only */
    }
  };

  const toggleTheme = () => {
    applyTheme(isDark.value ? "light" : "dark");
  };

  const cycleTheme = () => {
    const index = THEME_MODES.indexOf(themeMode.value);
    applyTheme(THEME_MODES[(index + 1) % THEME_MODES.length]);
  };

  const activeFont = computed(() => {
    return BANGLA_FONTS.find((f) => f.id === currentFontId.value) || BANGLA_FONTS[0];
  });

  const applyFont = (fontId: string) => {
    const font = BANGLA_FONTS.find((f) => f.id === fontId) || BANGLA_FONTS[0];
    currentFontId.value = font.id;

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--app-font-family", font.fontFamily);
      root.style.setProperty("--bs-body-font-family", font.fontFamily);
      root.style.setProperty("--bs-font-sans-serif", font.fontFamily);

      if (document.body) {
        document.body.style.setProperty("--app-font-family", font.fontFamily);
        document.body.style.setProperty("--bs-body-font-family", font.fontFamily);
        document.body.style.setProperty("--bs-font-sans-serif", font.fontFamily);
      }
    }

    try {
      localStorage.setItem(FONT_KEY, font.id);
    } catch {
      /* ignore */
    }
  };

  const initFont = () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(FONT_KEY);
    } catch {
      saved = null;
    }

    const initialFontId = saved && BANGLA_FONTS.some((f) => f.id === saved) ? saved : "hind-siliguri";
    applyFont(initialFontId);
  };

  const initTheme = () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {
      saved = null;
    }

    const mode = THEME_MODES.includes(saved as ThemeMode) ? (saved as ThemeMode) : "auto";
    applyTheme(mode);
    initFont();
    watchSystemColorScheme();
  };

  // While the theme is "auto", follow the operating system preference.
  const watchSystemColorScheme = () => {
    cleanupTheme();
    if (!window.matchMedia) return;

    colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeListener = (event: MediaQueryListEvent) => {
      if (themeMode.value !== "auto") return;
      document.documentElement.setAttribute("data-bs-theme", event.matches ? "dark" : "light");
    };
    colorSchemeQuery.addEventListener("change", colorSchemeListener);
  };

  const cleanupTheme = () => {
    if (colorSchemeQuery && colorSchemeListener) {
      colorSchemeQuery.removeEventListener("change", colorSchemeListener);
    }
    colorSchemeQuery = null;
    colorSchemeListener = null;
  };

  const loadSidebarCollapseIds = () => {
    try {
      const raw = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      sidebarOpenCollapseIds.value = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      sidebarOpenCollapseIds.value = [];
    }
  };

  const persistSidebarCollapseIds = () => {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, JSON.stringify(sidebarOpenCollapseIds.value));
  };

  const setSidebarCollapseOpen = (id: string, open: boolean) => {
    const ids = new Set(sidebarOpenCollapseIds.value);
    if (open) ids.add(id);
    else ids.delete(id);
    sidebarOpenCollapseIds.value = Array.from(ids);
    persistSidebarCollapseIds();
  };

  const restoreSidebarCollapseState = () => {
    sidebarOpenCollapseIds.value.forEach((id) => {
      const collapse = document.getElementById(id);
      if (!collapse) return;
      collapse.classList.add("show");
      const trigger = document.querySelector(`[data-bs-target="#${id}"]`);
      if (trigger instanceof HTMLElement) {
        trigger.classList.remove("collapsed");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  };

  const onSidebarCollapseShown = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.id) return;
    setSidebarCollapseOpen(target.id, true);
  };

  const onSidebarCollapseHidden = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.id) return;
    setSidebarCollapseOpen(target.id, false);
  };

  const initSidebarCollapsePersistence = () => {
    loadSidebarCollapseIds();
    restoreSidebarCollapseState();

    const sidebarAccordion = document.querySelector(".sidebar .accordion");
    if (sidebarAccordion instanceof HTMLElement) {
      const storedTop = Number(localStorage.getItem(SIDEBAR_SCROLL_KEY) || "0");
      sidebarScrollTop.value = Number.isFinite(storedTop) ? storedTop : 0;
      sidebarAccordion.scrollTop = sidebarScrollTop.value;

      sidebarAccordionEl = sidebarAccordion;
      sidebarScrollListener = () => {
        sidebarScrollTop.value = sidebarAccordion.scrollTop;
        localStorage.setItem(SIDEBAR_SCROLL_KEY, String(sidebarScrollTop.value));
      };

      sidebarAccordion.addEventListener("scroll", sidebarScrollListener, { passive: true });
    }

    document.addEventListener("shown.bs.collapse", onSidebarCollapseShown);
    document.addEventListener("hidden.bs.collapse", onSidebarCollapseHidden);
  };

  const cleanupSidebarCollapsePersistence = () => {
    if (sidebarAccordionEl && sidebarScrollListener) {
      sidebarAccordionEl.removeEventListener("scroll", sidebarScrollListener);
    }
    sidebarAccordionEl = null;
    sidebarScrollListener = null;
    document.removeEventListener("shown.bs.collapse", onSidebarCollapseShown);
    document.removeEventListener("hidden.bs.collapse", onSidebarCollapseHidden);
  };

  return {
    sidebarOpen,
    themeMode,
    themeIcon,
    isDark,
    currentFontId,
    activeFont,
    applyFont,
    initFont,
    toggleSidebar,
    closeSidebar,
    applyTheme,
    toggleTheme,
    cycleTheme,
    initTheme,
    cleanupTheme,
    sidebarOpenCollapseIds,
    initSidebarCollapsePersistence,
    cleanupSidebarCollapsePersistence
  };
});
