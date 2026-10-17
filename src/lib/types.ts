export interface UnfollowConfig {
  INTERVAL_BETWEEN_ACTIONS: number;
  SHORT_FIXED_PAUSE: number;
  HOVER_WAIT_TIMEOUT: number;
  MAX_SCROLL_ATTEMPTS: number;
  ALSO_UNLIKE_PAGES: boolean;
  DRY_RUN: boolean;
  RANDOM_JITTER: boolean;
  DAILY_CAP: number;
  COOLDOWN_EVERY_N: number;
  COOLDOWN_SECONDS: number;
  TARGET: "all" | "profiles" | "pages";
  THEME: "neon" | "minimal" | "retro";
}

export const DEFAULT_CONFIG: UnfollowConfig = {
  INTERVAL_BETWEEN_ACTIONS: 2500,
  SHORT_FIXED_PAUSE: 800,
  HOVER_WAIT_TIMEOUT: 4000,
  MAX_SCROLL_ATTEMPTS: 3,
  ALSO_UNLIKE_PAGES: true,
  DRY_RUN: false,
  RANDOM_JITTER: true,
  DAILY_CAP: 500,
  COOLDOWN_EVERY_N: 20,
  COOLDOWN_SECONDS: 20,
  TARGET: "all",
  THEME: "neon",
};
