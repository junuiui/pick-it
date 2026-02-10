"use client";

import { Rows3, Play, ListPlus, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LadderLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-6 rounded-3xl bg-blue-500/10 text-blue-500 mb-4"
        >
          <Rows3 size={64} />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl font-black tracking-tighter"
        >
          Ladder <span className="bg-linear-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">Game</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl"
        >
          The classic "Ghost Leg" (Amidakuji) game, reimagined with real-time multiplayer rooms, snake animations, and instant results.
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl"
      >
        <Link href="/games/ladder/create" className="group relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl group-hover:bg-blue-500/30 transition-all rounded-[2.5rem]" />
          <div className="relative flex flex-col items-center p-8 bg-card border border-white/10 rounded-[2.5rem] hover:border-blue-500/50 transition-all text-center space-y-4">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
              <ListPlus size={32} />
            </div>
            <h3 className="text-2xl font-bold">Create Room</h3>
            <p className="text-sm text-muted-foreground">Host a shared ladder game. Link participants to slots and watch the results together in real-time.</p>
            <div className="pt-4 w-full">
              <div className="bg-blue-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                <Play fill="white" size={18} /> Get Started
              </div>
            </div>
          </div>
        </Link>

        <Link href="/games/ladder/play-local" className="group relative">
          <div className="relative flex flex-col items-center p-8 bg-card border border-white/5 rounded-[2.5rem] hover:border-white/20 transition-all text-center space-y-4">
            <div className="p-4 bg-muted/10 rounded-2xl text-muted-foreground">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-bold">Local Play</h3>
            <p className="text-sm text-muted-foreground">Play a quick one-off game on a single device. Perfect for immediate decisions between friends.</p>
            <div className="pt-4 w-full">
              <div className="bg-secondary text-foreground py-3 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                Go Local
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
