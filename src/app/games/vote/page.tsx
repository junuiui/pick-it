"use client";

import { Vote, Play, PlusCircle, History } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function VoteLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-6 rounded-3xl bg-purple-500/10 text-purple-500 mb-4"
        >
          <Vote size={64} />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl font-black tracking-tighter"
        >
          Vote <span className="bg-linear-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Now</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl"
        >
          Host real-time, anonymous polls for your friends or team. Transparent results, instant feedback, and fun interaction.
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center w-full max-w-3xl"
      >
        <Link href="/games/vote/create" className="group relative w-full sm:w-1/2">
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl group-hover:bg-purple-500/30 transition-all rounded-[2.5rem]" />
          <div className="relative flex flex-col items-center p-8 bg-card border border-white/10 rounded-[2.5rem] hover:border-purple-500/50 transition-all text-center space-y-4">
            <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500">
              <PlusCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold">Create Poll</h3>
            <p className="text-sm text-muted-foreground">Start a new anonymous poll. Customize options, duration, and share the link with others.</p>
            <div className="pt-4 w-full">
              <div className="bg-purple-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                <Play fill="white" size={18} /> Get Started
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}