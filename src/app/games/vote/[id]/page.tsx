"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Loader2, Clock, User, AlertCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  id: string;
  text: string;
  count: number;
}

interface Poll {
  id: string;
  title: string;
  host_name: string;
  is_anonymous: boolean;
  expires_at: string;
  is_active: boolean;
}

interface Vote {
  option_id: string;
  voter_name: string;
}

export default function VoteRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  // State for interaction
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [voterNickname, setVoterNickname] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // State for showing voters (click to toggle)
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check local storage for previous vote and nickname
    const localVote = localStorage.getItem(`vote_poll_${id}`);
    if (localVote) {
      setHasVoted(true);
      setSelectedOptionId(localVote);
    }

    const savedName = localStorage.getItem(`vote_user_name_${id}`);
    if (savedName) {
      setVoterNickname(savedName);
    }

    fetchPollData();
    fetchVotes();

    // Subscribe to realtime changes (options count)
    const optionsChannel = supabase
      .channel("vote-options")
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

    // Subscribe to realtime changes (new votes for names)
    const votesChannel = supabase
      .channel("vote-log")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${id}`,
        },
        (payload) => {
          setVotes((prev) => [...prev, payload.new as Vote]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(optionsChannel);
      supabase.removeChannel(votesChannel);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [id]);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".voter-tooltip-trigger")) {
      setActiveTooltipId(null);
    }
  };

  useEffect(() => {
    if (poll?.expires_at) {
      const checkExpiry = () => {
        const now = new Date();
        const expires = new Date(poll.expires_at);
        if (now > expires) {
          setIsExpired(true);
        }
      };

      checkExpiry();
      const interval = setInterval(checkExpiry, 1000 * 60);
      return () => clearInterval(interval);
    }
  }, [poll]);

  const fetchPollData = async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("*")
        .eq("id", id)
        .single();

      if (pollError) throw pollError;
      setPoll(pollData);

      const { data: optionsData, error: optionsError } = await supabase
        .from("options")
        .select("*")
        .eq("poll_id", id)
        .order("id");

      if (optionsError) throw optionsError;
      setOptions(optionsData || []);
    } catch (error) {
      console.error("Error fetching poll data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    const { data, error } = await supabase
      .from("votes")
      .select("option_id, voter_name")
      .eq("poll_id", id);

    if (!error && data) {
      setVotes(data);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (hasVoted || isExpired) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitVote = async () => {
    if (!selectedOptionId || hasVoted || isSubmitting || isExpired || !poll) return;
    if (!poll.is_anonymous && !voterNickname.trim()) {
      alert("Please enter your nickname to vote.");
      return;
    }

    setIsSubmitting(true);
    setHasVoted(true);
    localStorage.setItem(`vote_poll_${id}`, selectedOptionId);
    // Save nickname for future use
    localStorage.setItem(`vote_user_name_${id}`, voterNickname);

    // Optimistic update
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === selectedOptionId ? { ...opt, count: opt.count + 1 } : opt
      )
    );
    if (!poll.is_anonymous) {
      setVotes(prev => [...prev, { option_id: selectedOptionId, voter_name: voterNickname }]);
    }

    try {
      await supabase.from("votes").insert([{
        poll_id: id,
        option_id: selectedOptionId,
        voter_name: poll.is_anonymous ? null : voterNickname,
      }]);

      const { error } = await supabase.rpc("increment_vote", {
        option_id: selectedOptionId,
      });

      if (error) {
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
        <div className="space-y-4">
          {isExpired && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg flex items-center justify-center gap-2 font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              Voting has ended.
            </div>
          )}

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User size={14} /> {poll.host_name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {isExpired
                  ? "Expired"
                  : `Ends ${new Date(poll.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                }
              </span>
              <span>•</span>
              <span>{poll.is_anonymous ? "Anonymous" : "Open Vote"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight break-words">
              {poll.title}
            </h1>

            <div className="flex justify-center pt-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-3 py-1 rounded-full"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Link Copied!" : "Share Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          {options.map((option) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((option.count / totalVotes) * 100);
            const isSelected = selectedOptionId === option.id;
            const showResults = hasVoted || isExpired;

            // Get voters for this option
            const optionVoters = votes
              .filter(v => v.option_id === option.id && v.voter_name)
              .map(v => v.voter_name);

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={hasVoted || isSubmitting || isExpired}
                className={`relative w-full text-left p-4 rounded-xl border-2 transition-all overflow-visible group
                  ${hasVoted || isExpired
                    ? "cursor-default border-transparent bg-secondary/20"
                    : isSelected
                      ? "border-green-500 bg-green-500/5 text-green-700"
                      : "hover:border-primary/50 hover:bg-secondary/10 border-border bg-card"
                  }
                `}
                whileTap={!hasVoted && !isExpired ? { scale: 0.98 } : {}}
              >
                {/* Progress Bar Background */}
                {showResults && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${isSelected ? "bg-primary/20" : "bg-muted/40"}`}
                  />
                )}

                <div className="relative flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-lg ${isSelected && showResults ? "text-primary" : ""}`}>
                      {option.text}
                    </span>

                    {/* You Indicator */}
                    {isSelected && hasVoted && (
                      <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold border border-primary/20 bg-background shadow-sm">
                        <User size={12} />
                        You
                      </div>
                    )}

                    {/* Show Voters Icon on Result View if not anonymous */}
                    {!poll.is_anonymous && showResults && optionVoters.length > 0 && (
                      <div className="relative voter-tooltip-trigger" onClick={(e) => { e.stopPropagation(); setActiveTooltipId(activeTooltipId === option.id ? null : option.id); }}>
                        <div className="bg-background/80 p-1 rounded-full shadow-sm hover:bg-background border cursor-pointer hover:scale-110 transition-transform">
                          <Users size={14} className="text-muted-foreground" />
                        </div>

                        {/* Custom Tooltip */}
                        <AnimatePresence>
                          {activeTooltipId === option.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute left-0 bottom-full mb-2 w-max max-w-[200px] z-[100] p-3 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-semibold mb-1 border-b pb-1">Voters</div>
                              <div className="flex flex-wrap gap-1">
                                {optionVoters.map((name, i) => (
                                  <span key={i} className="bg-secondary px-1.5 py-0.5 rounded-sm">{name}</span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {showResults && (
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

        {/* Nickname Input & Submit Button */}
        {!hasVoted && !isExpired && (
          <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {!poll.is_anonymous && (
              <div className="max-w-xs mx-auto">
                <label className="text-sm font-medium mb-1.5 block text-center">Your Nickname</label>
                <input
                  type="text"
                  placeholder="Enter name to vote"
                  value={voterNickname}
                  onChange={(e) => setVoterNickname(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleSubmitVote}
                disabled={!selectedOptionId || isSubmitting || (!poll.is_anonymous && !voterNickname.trim())}
                className="w-full sm:w-auto min-w-[200px] h-12 rounded-full border-2 font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit Vote"}
              </button>
            </div>
          </div>
        )}

        {(hasVoted || isExpired) && (
          <div className="text-center text-sm text-muted-foreground animate-in fade-in pt-4">
            {isExpired ? "This poll has ended." : "Thank you for voting! Real-time results above."}
          </div>
        )}

      </div>
    </div>
  );
}
