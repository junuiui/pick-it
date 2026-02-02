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

  // State for interaction
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check local storage for previous vote
    const localVote = localStorage.getItem(`vote_poll_${id}`);
    if (localVote) {
      setHasVoted(true);
      setSelectedOptionId(localVote);
    }

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

  const handleSelectOption = (optionId: string) => {
    if (hasVoted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitVote = async () => {
    if (!selectedOptionId || hasVoted || isSubmitting) return;

    setIsSubmitting(true);

    // Optimistic UI update
    setHasVoted(true);
    // Save to local storage
    localStorage.setItem(`vote_poll_${id}`, selectedOptionId);

    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === selectedOptionId ? { ...opt, count: opt.count + 1 } : opt
      )
    );

    try {
      const { error } = await supabase.rpc("increment_vote", {
        option_id: selectedOptionId,
      });

      if (error) {
        // Fallback to direct update
        const option = options.find((o) => o.id === selectedOptionId);
        if (option) {
          await supabase
            .from("options")
            .update({ count: option.count + 1 })
            .eq("id", selectedOptionId);
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      // Revert optimistic update if needed, but keeping simple for now
    } finally {
      setIsSubmitting(false);
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
            const isSelected = selectedOptionId === option.id;

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={hasVoted || isSubmitting}
                className={`relative w-full text-left p-4 rounded-xl border-2 transition-all overflow-hidden group
                  ${hasVoted
                    ? "cursor-default border-transparent bg-secondary/20"
                    : isSelected
                      ? "border-green-500 bg-green-500/5 text-white"
                      : "hover:border-primary/50 hover:bg-secondary/10 border-border bg-card"
                  }
                `}
                whileTap={!hasVoted ? { scale: 0.98 } : {}}
              >
                {/* Progress Bar Background */}
                {hasVoted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${isSelected ? "bg-primary/20" : "bg-muted/40"}`}
                  />
                )}

                <div className="relative flex justify-between items-center z-10">
                  <span className={`font-semibold text-lg ${isSelected && hasVoted ? "text-primary" : ""}`}>
                    {option.text}
                  </span>
                  {hasVoted && (
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

        {/* Submit Button */}
        {!hasVoted && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleSubmitVote}
              disabled={!selectedOptionId || isSubmitting}
              className="w-full sm:w-auto min-w-[200px] h-12 rounded-full border-2 font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Submit Vote"
              )}
            </button>
          </div>
        )}

        {hasVoted && (
          <div className="text-center text-sm text-muted-foreground animate-in fade-in pt-4">
            Thank you for voting! Check back for real-time results.
          </div>
        )}

      </div>
    </div>
  );
}
