"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SessionRecord, AppMode } from "@/lib/types";

interface SessionState {
  sessions: SessionRecord[];
  addSession: (s: Omit<SessionRecord, "id">) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (s) =>
        set((state) => ({
          sessions: [
            {
              ...s,
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            },
            ...state.sessions,
          ].slice(0, 50), // keep last 50
        })),
      clearSessions: () => set({ sessions: [] }),
    }),
    { name: "fb-unfollow-sessions" }
  )
);

export function recordManualSession(
  mode: AppMode,
  success: number,
  fail: number,
  dryRun: boolean
) {
  // helper for UI if needed later
  return {
    mode,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    success,
    fail,
    dryRun,
  };
}
