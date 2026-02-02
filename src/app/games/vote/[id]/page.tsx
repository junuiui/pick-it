"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Option {
  id: string;
  text: string;
  count: number;
}

interface Poll {
  id: string;
  title: string;
  is_active: boolean;
}

export default function VoteRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPollData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("vote-room")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "options",
          filter: `poll_id=eq.${id}`,
        },
        (payload) => {
          setOptions((currentOptions) =>
            currentOptions.map((opt) =>
              opt.id === payload.new.id ? { ...opt, count: payload.new.count } : opt
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchPollData = async () => {
    try {
      // Fetch Poll
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("*")
        .eq("id", id)
        .single();

      if (pollError) throw pollError;
      setPoll(pollData);

      // Fetch Options
      const { data: optionsData, error: optionsError } = await supabase
        .from("options")
        .select("*")
        .eq("poll_id", id)
        .order("id"); // Ensure consistent order

      if (optionsError) throw optionsError;
      setOptions(optionsData || []);
    } catch (error) {
      console.error("Error fetching poll:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (votedOptionId) return; // Prevent double voting locally

    // Optimistic UI update
    setVotedOptionId(optionId);
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, count: opt.count + 1 } : opt
      )
    );

    try {
      const { error } = await supabase.rpc("increment_vote", {
        option_id: optionId,
      });

      if (error) {
        // If RPC fails (e.g., function missing), try direct update (less safe for concurrency but works for simple demo)
        // Ideally we use RPC for atomic increment. For now, fallback to simple update if RPC fails
        // But for this demo, let's assume we might need to fallback or just rely on the user confirming setup.
        // Actually, let's try a direct update first as it's easier without extra SQL setup from user
        const option = options.find((o) => o.id === optionId);
        if (option) {
          await supabase
            .from("options")
            .update({ count: option.count + 1 })
            .eq("id", optionId);
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      // Revert optimistic update if needed, but keeping simple for now
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.count, 0);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-muted-foreground">
        Poll not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] py-10 px-4">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight break-words">
            {poll.title}
          </h1>
          <div className="flex justify-center">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-3 py-1 rounded-full"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Link Copied!" : "Share Link"}
            </button>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          {options.map((option) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((option.count / totalVotes) * 100);
            const isVoted = votedOptionId === option.id;

            return (
              <motion.button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={!!votedOptionId}
                className={`relative w-full text-left p-4 rounded-xl border-2 transition-all overflow-hidden group
                  ${votedOptionId
                    ? "cursor-default border-transparent bg-secondary/20"
                    : "hover:border-primary/50 hover:bg-secondary/10 border-border bg-card"
                  }
                  ${isVoted ? "ring-2 ring-primary ring-offset-2" : ""}
                `}
                whileTap={!votedOptionId ? { scale: 0.98 } : {}}
              >
                {/* Progress Bar Background */}
                {votedOptionId && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${isVoted ? "bg-primary/20" : "bg-muted/40"}`}
                  />
                )}

                <div className="relative flex justify-between items-center z-10">
                  <span className={`font-semibold text-lg ${isVoted ? "text-primary" : ""}`}>
                    {option.text}
                  </span>
                  {votedOptionId && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium opacity-80">{option.count} votes</span>
                      <span className="text-sm font-bold w-12 text-right">{percentage}%</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {votedOptionId && (
          <div className="text-center text-sm text-muted-foreground animate-in fade-in pt-4">
            Waiting for others to vote... Real-time updates active.
          </div>
        )}

      </div>
    </div>
  );
}
