"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface AppState {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  initializeConnection: () => () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
  initializeConnection: () => {
    const channel = supabase.channel("health-check");

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        set({ isConnected: true });
      } else {
        set({ isConnected: false });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
