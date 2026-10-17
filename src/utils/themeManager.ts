export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "school_portal_theme_preference";
export const THEME_MANUAL_FLAG = "school_portal_theme_is_manual";

/**
 * Checks whether current time falls into the night-time period according to user rule:
 * 6:00 to 18:00 -> Claro (Light/Dia)
 * 18:00 to 06:00 -> Escuro (Dark/Noite)
 */
export const isNightTimeSchedule = (date: Date = new Date()): boolean => {
  const hours = date.getHours();
  // 6 as 18 claro (06:00 to 17:59 => false)
  // 18 as 6h escuro (18:00 to 05:59 => true)
  return hours >= 18 || hours < 6;
};

/**
 * Resolves whether dark mode should be enabled based on preference:
 * - "system": follows Auto schedule (6h-18h claro, 18h-6h escuro)
 * - "dark": always dark
 * - "light": always light
 */
export const resolveTheme = (preference: ThemePreference): boolean => {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  // "system" (Auto) default
  return isNightTimeSchedule();
};

/**
 * Retrieves the stored theme preference.
 * User requirement: "o tema deve ficar em Auto (a não ser que o usuário mude)"
 * If the user has not manually set "Dia" or "Noite", it ALWAYS returns "system" (Auto)!
 */
export const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") return "system";
  try {
    const isManual = localStorage.getItem(THEME_MANUAL_FLAG);
    if (isManual === "true") {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    }
  } catch {
    // ignore localStorage errors
  }
  // Default is ALWAYS "system" (Auto)
  return "system";
};

export const setStoredThemePreference = (pref: ThemePreference): void => {
  if (typeof window === "undefined") return;
  try {
    if (pref === "system") {
      // User chose Auto/System: clear manual override so it stays in Auto schedule
      localStorage.removeItem(THEME_MANUAL_FLAG);
      localStorage.setItem(THEME_STORAGE_KEY, "system");
    } else {
      // User manually forced "light" or "dark" by their own choice
      localStorage.setItem(THEME_MANUAL_FLAG, "true");
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    }
    const isDark = resolveTheme(pref);
    localStorage.setItem("school_portal_dark_mode", String(isDark));
  } catch {
    // ignore
  }
};

/**
 * Returns human-readable label explaining the current scheduled state
 */
export const getScheduleStatus = (locale: string = "pt"): string => {
  const isNight = isNightTimeSchedule();
  if (locale === "en") {
    return isNight 
      ? "Dark Mode active (6 PM - Midnight / Dawn schedule)"
      : "Light Mode active (6 AM - 6 PM schedule)";
  }
  return isNight 
    ? "Modo Escuro ativo (programação 18h às 24h)"
    : "Modo Claro ativo (programação 6h às 18h)";
};

