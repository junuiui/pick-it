"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  nickname: string;
  setNickname: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: "",
      setNickname: (name) => set({ nickname: name }),
    }),
    {
      name: "pick-it-user-storage",
    }
  )
);
