export type AppMode = "unfollow" | "leave-groups" | "unfriend";

export interface UnfollowConfig {
  MODE: AppMode;
  // Shared / Unfollow
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
  // Leave Groups specific
  MAX_PER_MINUTE: number;
  BASE_DELAY: number;
  JITTER: number;
  SCROLL_DISTANCE: number;
  SCROLL_DELAY_ON_EMPTY: number;
  // Unfriend specific
  UNFRIEND_DELAY: number;
  UNFRIEND_SCROLL_AMOUNT: number;
  UNFRIEND_SCROLL_WAIT: number;
}

export const DEFAULT_CONFIG: UnfollowConfig = {
  MODE: "unfollow",
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
  MAX_PER_MINUTE: 20,
  BASE_DELAY: 900,
  JITTER: 600,
  SCROLL_DISTANCE: 2200,
  SCROLL_DELAY_ON_EMPTY: 7000,
  UNFRIEND_DELAY: 800,
  UNFRIEND_SCROLL_AMOUNT: 1000,
  UNFRIEND_SCROLL_WAIT: 1500,
};
