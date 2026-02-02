"use client";

import NavBar from "@/components/NavBar.component";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [isConnected, setIsConnected] = useState(false);

  // Check if connected to Supabase
  useEffect(() => {
    const channel = supabase.channel("health");

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setIsConnected(false);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    // Header component
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Pick-it</span>
          </Link>
        </div>

        {/* Navigation Section */}
        <NavBar />

        {/* Action Section */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${isConnected
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" // Connected: Green (Emerald)
            : "bg-red-500/10 text-red-500 border-red-500/20"           // Disconnected: Red
            }`}>
            <span className={`h-2 w-2 rounded-full transition-all ${isConnected
              ? "bg-emerald-500 animate-pulse"
              : "bg-red-500"
              }`} />
            {isConnected ? "Connected" : "Disconnected"}
          </div>

          <button className="text-sm font-medium bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}