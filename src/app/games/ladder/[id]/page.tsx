"use client";

import { useEffect, useState, useRef, use } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  RotateCcw,
  Eye,
  CheckCircle2,
  Trophy,
  X,
  ClipboardList,
  User,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  LogOut,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYER_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
];

interface LadderLine {
  id: string;
  fromX: number;
  toX: number;
  y: number;
}

interface Ladder {
  id: string;
  title: string;
  host_name: string;
  player_count: number;
  ladder_lines: LadderLine[];
  bottom_labels: string[];
  expires_at: string;
}

interface Player {
  player_index: number;
  nickname: string;
  is_revealed: boolean;
}

export default function LadderRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ladder, setLadder] = useState<Ladder | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null);
  const [joiningIndex, setJoiningIndex] = useState<number | null>(null);
  const [joinNickname, setJoinNickname] = useState("");
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animatingPathRef = useRef<number | null>(null);

  useEffect(() => {
    fetchLadderData();
    fetchPlayers();

    const playersChannel = supabase
      .channel(`ladder-players-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ladder_players",
          filter: `ladder_id=eq.${id}`,
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
    };
  }, [id]);

  const fetchLadderData = async () => {
    try {
      const { data, error } = await supabase
        .from("ladders")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setLadder(data);
    } catch (error) {
      console.error("Error fetching ladder:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("ladder_players")
      .select("player_index, nickname, is_revealed")
      .eq("ladder_id", id);
    if (!error && data) {
      setPlayers(data);

      // Check if I am one of the players (based on local storage)
      const savedName = localStorage.getItem(`ladder_voter_name_${id}`);
      if (savedName) {
        const me = data.find(p => p.nickname === savedName);
        if (me) setMyPlayerIndex(me.player_index);
      }
    }
  };

  const handleJoin = async () => {
    if (joiningIndex === null || !joinNickname.trim() || isSubmittingJoin || !ladder) return;
    setIsSubmittingJoin(true);

    try {
      const { error } = await supabase
        .from("ladder_players")
        .insert([{
          ladder_id: id,
          player_index: joiningIndex,
          nickname: joinNickname
        }]);

      if (error) throw error;

      localStorage.setItem(`ladder_voter_name_${id}`, joinNickname);
      setMyPlayerIndex(joiningIndex);
      setJoiningIndex(null);
      setJoinNickname("");
    } catch (error) {
      console.error("Error joining ladder:", error);
      alert("This slot might have been taken. Please try another one.");
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const togglePath = async (index: number) => {
    const player = players.find(p => p.player_index === index);
    if (!player || (myPlayerIndex !== index && myPlayerIndex !== 0)) return; // Only owner or host can toggle

    const nextRevealed = !player.is_revealed;

    if (nextRevealed) {
      // Start snake animation locally first
      setIsAnimating(true);
      animatingPathRef.current = index;

      setTimeout(async () => {
        await supabase
          .from("ladder_players")
          .update({ is_revealed: true })
          .eq("ladder_id", id)
          .eq("player_index", index);

        setIsAnimating(false);
        animatingPathRef.current = null;
      }, 1500);
    } else {
      await supabase
        .from("ladder_players")
        .update({ is_revealed: false })
        .eq("ladder_id", id)
        .eq("player_index", index);
    }
  };

  const getPathForPlayer = (startIndex: number) => {
    if (!ladder) return { path: [], endIndex: 0 };
    let currentX = startIndex;
    const path: [number, number][] = [[currentX, -1]];
    const sortedLines = [...ladder.ladder_lines].sort((a, b) => a.y - b.y);
    const rows = 10;

    for (let y = 0; y < rows; y++) {
      const horizontalLine = sortedLines.find(l => l.y === y && (l.fromX === currentX || l.toX === currentX));
      if (horizontalLine) {
        const nextX = horizontalLine.fromX === currentX ? horizontalLine.toX : horizontalLine.fromX;
        path.push([currentX, y]);
        path.push([nextX, y]);
        currentX = nextX;
      } else {
        path.push([currentX, y]);
      }
    }
    path.push([currentX, rows]);
    return { path, endIndex: currentX };
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!ladder) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-muted-foreground">
        Ladder game not found.
      </div>
    );
  }

  const activePaths = new Set(players.filter(p => p.is_revealed).map(p => p.player_index));
  const revealedResults = activePaths;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] py-10 px-4 max-w-6xl mx-auto">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User size={14} /> {ladder.host_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Users size={14} /> {players.length}/{ladder.player_count} Players</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">{ladder.title}</h1>

          <div className="flex justify-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all bg-secondary/50 px-4 py-2 rounded-full"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Share Link"}
            </button>
            <button
              onClick={() => setShowResultModal(true)}
              className="flex items-center gap-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-all px-4 py-2 rounded-full font-bold"
            >
              <ClipboardList size={14} />
              Final Result
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-4xl mx-auto bg-card/30 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl min-h-[600px] flex flex-col mt-12 mb-12">
          <div className="flex-1 relative">
            {(() => {
              const width = 100;
              const margin = 5;
              const gap = ladder.player_count > 1 ? (width - 2 * margin) / (ladder.player_count - 1) : 0;
              const rows = 10;
              const rowHeight = 100 / (rows + 1);

              const getXPos = (xIdx: number) => margin + xIdx * gap;
              const getYPos = (yIdx: number) => rowHeight * (yIdx + 1);

              return (
                <>
                  {/* Top Labels / Joining Slots */}
                  <div className="absolute -top-16 left-0 right-0 h-14">
                    {Array.from({ length: ladder.player_count }).map((_, i) => {
                      const player = players.find(p => p.player_index === i);
                      const isMe = myPlayerIndex === i;
                      const isRevealed = player?.is_revealed;

                      return (
                        <div
                          key={`slot-${i}`}
                          className="absolute"
                          style={{ left: `${getXPos(i)}%`, transform: "translateX(-50%)" }}
                        >
                          <AnimatePresence mode="wait">
                            {player ? (
                              <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ y: -5 }}
                                onClick={() => togglePath(i)}
                                className={cn(
                                  "min-w-20 px-4 py-2 rounded-2xl border font-bold text-sm shadow-xl transition-all relative overflow-hidden",
                                  isRevealed ? "text-white border-transparent" : "bg-card border-white/10 hover:border-primary/50"
                                )}
                                style={{
                                  backgroundColor: isRevealed ? PLAYER_COLORS[i % PLAYER_COLORS.length] : undefined
                                }}
                              >
                                {isMe && <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full m-1" />}
                                {player.nickname}
                              </motion.button>
                            ) : (
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                whileHover={{ opacity: 1, scale: 1.1 }}
                                onClick={() => setJoiningIndex(i)}
                                className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all"
                              >
                                <Plus size={16} />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* SVG Visualization */}
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    {Array.from({ length: ladder.player_count }).map((_, i) => (
                      <line key={`v-${i}`} x1={getXPos(i)} y1={0} x2={getXPos(i)} y2={100} className="stroke-white/5 stroke-[0.5px]" />
                    ))}

                    {ladder.ladder_lines.map((line) => (
                      <line
                        key={line.id}
                        x1={getXPos(line.fromX)}
                        y1={getYPos(line.y)}
                        x2={getXPos(line.toX)}
                        y2={getYPos(line.y)}
                        className="stroke-white/20 stroke-[1px]"
                        strokeLinecap="round"
                      />
                    ))}

                    {players.filter(p => p.is_revealed || animatingPathRef.current === p.player_index).map(p => {
                      const { path } = getPathForPlayer(p.player_index);
                      const points = path.map(([x, y]) => {
                        if (y === -1) return `${getXPos(x)},0`;
                        if (y === 10) return `${getXPos(x)},100`;
                        return `${getXPos(x)},${getYPos(y)}`;
                      }).join(" ");

                      const isAnimatingThis = animatingPathRef.current === p.player_index;

                      return (
                        <motion.polyline
                          key={`path-${p.player_index}`}
                          points={points}
                          fill="none"
                          stroke={PLAYER_COLORS[p.player_index % PLAYER_COLORS.length]}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: isAnimatingThis ? 1.5 : 0.4, ease: "linear" }}
                          className="stroke-[3px]"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })}
                  </svg>

                  {/* Bottom Labels */}
                  <div className="absolute -bottom-16 left-0 right-0 h-14">
                    {ladder.bottom_labels.map((label, i) => {
                      const winningPlayer = players.find(p => p.is_revealed && getPathForPlayer(p.player_index).endIndex === i);

                      return (
                        <div
                          key={`bottom-${i}`}
                          className="absolute text-center"
                          style={{ left: `${getXPos(i)}%`, transform: "translateX(-50%)" }}
                        >
                          <motion.div
                            animate={winningPlayer ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                            className={cn(
                              "min-w-20 px-4 py-2 rounded-2xl border font-bold text-sm shadow-xl transition-all",
                              winningPlayer ? "text-white border-transparent" : "bg-card/50 border-white/5 text-muted-foreground"
                            )}
                            style={{
                              backgroundColor: winningPlayer ? PLAYER_COLORS[winningPlayer.player_index % PLAYER_COLORS.length] : undefined
                            }}
                          >
                            {winningPlayer && <Trophy className="mx-auto mb-1" size={12} />}
                            {label}
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Join Slot Modal */}
      <AnimatePresence>
        {joiningIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setJoiningIndex(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-card border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Join this slot</h3>
              <p className="text-muted-foreground mb-6">Enter your nickname to take slot #{joiningIndex + 1}</p>
              <input
                autoFocus
                type="text"
                placeholder="Your nickname"
                className="w-full h-14 rounded-2xl border bg-background px-6 mb-6 focus:ring-2 focus:ring-primary outline-none transition-all"
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <div className="flex gap-3">
                <button onClick={() => setJoiningIndex(null)} className="flex-1 h-14 rounded-2xl bg-secondary font-bold hover:bg-secondary/80 transition-all">Cancel</button>
                <button onClick={handleJoin} disabled={isSubmittingJoin || !joinNickname.trim()} className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all disabled:opacity-50">
                  {isSubmittingJoin ? <Loader2 className="animate-spin mx-auto" /> : "Join Game"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {showResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResultModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative bg-card border border-white/10 rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black">Ladder Results</h3>
                <button onClick={() => setShowResultModal(false)} className="p-2 hover:bg-secondary rounded-xl transition-all"><X /></button>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {players.sort((a, b) => a.player_index - b.player_index).map((p) => {
                  const { endIndex } = getPathForPlayer(p.player_index);
                  const resultLabel = ladder.bottom_labels[endIndex];
                  return (
                    <div key={p.player_index} className={cn("flex items-center justify-between p-5 rounded-3xl border transition-all", p.is_revealed ? "bg-white/5 border-white/10" : "opacity-30 border-transparent bg-muted/5")}>
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PLAYER_COLORS[p.player_index % PLAYER_COLORS.length] }} />
                        <span className="text-xl font-bold">{p.nickname}</span>
                      </div>
                      <ArrowRight className="text-muted-foreground" />
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black">{p.is_revealed ? resultLabel : "???"}</span>
                        {p.is_revealed && <CheckCircle2 className="text-green-500" />}
                      </div>
                    </div>
                  );
                })}
                {players.length === 0 && <div className="text-center py-10 text-muted-foreground italic">No players joined yet.</div>}
              </div>
              <button onClick={() => setShowResultModal(false)} className="w-full mt-8 h-16 rounded-3xl bg-primary text-primary-foreground text-xl font-bold hover:opacity-90 transition-all">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
