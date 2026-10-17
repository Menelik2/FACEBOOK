"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UnfollowConfig, DEFAULT_CONFIG } from "@/lib/types";

interface ConfigState {
  config: UnfollowConfig;
  setConfig: (partial: Partial<UnfollowConfig>) => void;
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      setConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),
    }),
    {
      name: "fb-unfollow-config",
    }
  )
);
