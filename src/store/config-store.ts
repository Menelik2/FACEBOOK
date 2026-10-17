"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UnfollowConfig, DEFAULT_CONFIG, PresetId } from "@/lib/types";
import { PRESETS } from "@/lib/presets";

interface ConfigState {
  config: UnfollowConfig;
  setConfig: (partial: Partial<UnfollowConfig>) => void;
  resetConfig: () => void;
  applyPreset: (id: PresetId) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      setConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial, PRESET: partial.PRESET ?? "custom" },
        })),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),
      applyPreset: (id) =>
        set((state) => {
          if (id === "custom") return { config: { ...state.config, PRESET: "custom" } };
          const p = PRESETS[id];
          if (!p) return state;
          const { label, description, ...overrides } = p;
          return {
            config: {
              ...state.config,
              ...overrides,
              PRESET: id,
            },
          };
        }),
    }),
    {
      name: "fb-unfollow-config",
      merge: (persisted, current) => ({
        ...current,
        config: { ...DEFAULT_CONFIG, ...(persisted as any)?.config },
      }),
    }
  )
);
