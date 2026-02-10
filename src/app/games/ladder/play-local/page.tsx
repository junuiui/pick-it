"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Play,
  RotateCcw,
  Eye,
  CheckCircle2,
  Trophy,
  X,
  ClipboardList
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

type GamePhase = "config" | "input" | "play";

interface LadderLine {
  id: string;
  fromX: number;
  toX: number;
  y: number;
}

export default function LocalLadderPage() {
  const [phase, setPhase] = useState<GamePhase>("config");
  const [playerCount, setPlayerCount] = useState(2);
  const [topInputs, setTopInputs] = useState<string[]>([]);
  const [bottomInputs, setBottomInputs] = useState<string[]>([]);

  // Game Logic State
  const [ladderLines, setLadderLines] = useState<LadderLine[]>([]);
  const [activePaths, setActivePaths] = useState<Set<number>>(new Set());
  const [revealedResults, setRevealedResults] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const animatingPathRef = useRef<number | null>(null);

  // Initialization
  useEffect(() => {
    setTopInputs(Array(playerCount).fill("").map((_, i) => `Player ${i + 1}`));
    setBottomInputs(Array(playerCount).fill("").map((_, i) => `Result ${i + 1}`));
  }, [playerCount]);

  const handlePlayerCountChange = (delta: number) => {
    setPlayerCount(prev => Math.max(2, Math.min(10, prev + delta)));
  };

  const startInputPhase = () => setPhase("input");

  const generateLadder = () => {
    const lines: LadderLine[] = [];
    const rows = 10;
    const probability = 0.5;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < playerCount - 1; x++) {
        const hasLeftLine = lines.some(l => l.y === y && l.fromX === x - 1);
        if (!hasLeftLine && Math.random() < probability) {
          lines.push({
            id: `line-${x}-${y}`,
            fromX: x,
            toX: x + 1,
            y
          });
        }
      }

      const linesInRow = lines.filter(l => l.y === y);
      if (linesInRow.length === 0 && playerCount > 1) {
        const randomX = Math.floor(Math.random() * (playerCount - 1));
        lines.push({
          id: `line-forced-${randomX}-${y}`,
          fromX: randomX,
          toX: randomX + 1,
          y
        });
      }
    }
    setLadderLines(lines);
    setPhase("play");
    setActivePaths(new Set());
    setRevealedResults(new Set());
  };

  const getPathForPlayer = (startIndex: number) => {
    let currentX = startIndex;
    const path: [number, number][] = [[currentX, -1]];
    const sortedLines = [...ladderLines].sort((a, b) => a.y - b.y);
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

  const handlePlayerClick = (index: number) => {
    if (isAnimating) return;

    if (activePaths.has(index)) {
      setActivePaths(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      setRevealedResults(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      return;
    }

    setIsAnimating(true);
    animatingPathRef.current = index;
    setActivePaths(prev => new Set(prev).add(index));

    setTimeout(() => {
      setRevealedResults(prev => new Set(prev).add(index));
      setIsAnimating(false);
      animatingPathRef.current = null;
    }, 1500);
  };

  const revealAll = () => {
    const allIndices = Array.from({ length: playerCount }, (_, i) => i);
    setActivePaths(new Set(allIndices));
    setRevealedResults(new Set(allIndices));
  };

  const resetGame = () => {
    setPhase("config");
    setActivePaths(new Set());
    setRevealedResults(new Set());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {phase === "config" && (
          <motion.div
            key="config"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-8 glass p-10 rounded-3xl border shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 mb-2">
                <Users size={48} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Local Game</h2>
              <p className="text-muted-foreground">Select between 2 to 10 participants.</p>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => handlePlayerCountChange(-1)}
                className="p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all active:scale-90"
              >
                <ChevronDown size={32} />
              </button>

              <div className="text-7xl font-black min-w-[3ch] text-center bg-linear-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {playerCount}
              </div>

              <button
                onClick={() => handlePlayerCountChange(1)}
                className="p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all active:scale-90"
              >
                <ChevronUp size={32} />
              </button>
            </div>

            <button
              onClick={startInputPhase}
              className="group flex items-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full flex flex-col space-y-8"
          >
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold">Set Options</h2>
                <p className="text-muted-foreground">Enter names and their corresponding results.</p>
              </div>
              <button onClick={() => setPhase("config")} className="text-sm font-medium hover:underline">Change count</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Names
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {topInputs.map((val, i) => (
                    <input
                      key={`top-${i}`}
                      value={val}
                      onChange={(e) => {
                        const newInputs = [...topInputs];
                        newInputs[i] = e.target.value;
                        setTopInputs(newInputs);
                      }}
                      className="w-full bg-card border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder={`Participant ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" /> Results
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {bottomInputs.map((val, i) => (
                    <input
                      key={`bottom-${i}`}
                      value={val}
                      onChange={(e) => {
                        const newInputs = [...bottomInputs];
                        newInputs[i] = e.target.value;
                        setBottomInputs(newInputs);
                      }}
                      className="w-full bg-card border rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                      placeholder={`Result ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center p-4">
              <button
                onClick={generateLadder}
                className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-3xl font-bold text-xl hover:shadow-xl hover:scale-105 transition-all shadow-blue-500/20"
              >
                <Play fill="currentColor" />
                <span>Start Game</span>
              </button>
            </div>
          </motion.div>
        )}

        {phase === "play" && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center space-y-6"
          >
            <div className="flex w-full justify-between items-center mb-4">
              <button
                onClick={resetGame}
                className="p-3 rounded-2xl bg-secondary hover:bg-red-500/10 hover:text-red-500 transition-all"
              >
                <RotateCcw size={24} />
              </button>
              <h2 className="text-xl font-bold text-center">Local Multiplayer</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowResultModal(true)}
                  className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-5 py-3 rounded-2xl transition-all font-semibold"
                >
                  <ClipboardList size={20} />
                  <span>Result</span>
                </button>
                <button
                  onClick={revealAll}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground hover:opacity-90 px-5 py-3 rounded-2xl transition-all font-semibold"
                >
                  <Eye size={20} />
                  <span>Show All</span>
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-4xl bg-card/50 backdrop-blur-md border rounded-3xl p-8 shadow-inner min-h-[600px] flex flex-col mt-12 mb-12">
              <div className="flex-1 relative">
                {(() => {
                  const width = 100;
                  const margin = 5;
                  const gap = playerCount > 1 ? (width - 2 * margin) / (playerCount - 1) : 0;
                  const rows = 10;
                  const rowHeight = 100 / (rows + 1);

                  const getXPos = (xIdx: number) => margin + xIdx * gap;
                  const getYPos = (yIdx: number) => rowHeight * (yIdx + 1);

                  return (
                    <>
                      <div className="absolute -top-12 left-0 right-0 h-10">
                        {topInputs.map((label, i) => (
                          <motion.button
                            key={`top-btn-${i}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePlayerClick(i)}
                            className={cn(
                              "absolute z-10 min-w-16 px-3 py-2 rounded-xl border text-sm font-bold shadow-sm transition-all whitespace-nowrap",
                              activePaths.has(i)
                                ? "text-white border-transparent"
                                : "bg-background hover:border-blue-500/50"
                            )}
                            style={{
                              left: `${getXPos(i)}%`,
                              transform: "translateX(-50%)",
                              backgroundColor: activePaths.has(i) ? PLAYER_COLORS[i % PLAYER_COLORS.length] : undefined
                            }}
                          >
                            {label}
                          </motion.button>
                        ))}
                      </div>

                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                      >
                        {Array.from({ length: playerCount }).map((_, i) => (
                          <line key={`v-${i}`} x1={getXPos(i)} y1={0} x2={getXPos(i)} y2={100} className="stroke-muted/20 stroke-[1px]" />
                        ))}
                        {ladderLines.map((line) => (
                          <line key={line.id} x1={getXPos(line.fromX)} y1={getYPos(line.y)} x2={getXPos(line.toX)} y2={getYPos(line.y)} className="stroke-muted/40 stroke-[1.5px]" strokeLinecap="round" />
                        ))}
                        {Array.from(activePaths).map(startIdx => {
                          const { path } = getPathForPlayer(startIdx);
                          const points = path.map(([x, y]) => {
                            if (y === -1) return `${getXPos(x)},0`;
                            if (y === 10) return `${getXPos(x)},100`;
                            return `${getXPos(x)},${getYPos(y)}`;
                          }).join(" ");
                          const isRevealed = revealedResults.has(startIdx);
                          const isAnimatingThis = animatingPathRef.current === startIdx;
                          return (
                            <motion.polyline
                              key={`path-${startIdx}`}
                              points={points}
                              fill="none"
                              stroke={PLAYER_COLORS[startIdx % PLAYER_COLORS.length]}
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: isRevealed || isAnimatingThis ? 1 : 0, opacity: isRevealed || isAnimatingThis ? 1 : 0.4 }}
                              transition={{ duration: isAnimatingThis ? 1.5 : 0.3, ease: "linear" }}
                              className="stroke-[2.5px]"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          );
                        })}
                      </svg>

                      <div className="absolute -bottom-12 left-0 right-0 h-10">
                        {bottomInputs.map((label, i) => {
                          const winningPlayerIdx = Array.from(revealedResults).find(startIdx => getPathForPlayer(startIdx).endIndex === i);
                          const isWinner = winningPlayerIdx !== undefined;
                          return (
                            <motion.div
                              key={`bottom-btn-${i}`}
                              animate={isWinner ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                              className={cn(
                                "absolute z-10 min-w-16 px-3 py-2 rounded-xl border text-sm font-bold shadow-sm transition-all text-center whitespace-nowrap",
                                isWinner ? "text-white border-transparent" : "bg-background border-muted/50"
                              )}
                              style={{
                                left: `${getXPos(i)}%`,
                                transform: "translateX(-50%)",
                                backgroundColor: isWinner ? PLAYER_COLORS[winningPlayerIdx % PLAYER_COLORS.length] : undefined
                              }}
                            >
                              {isWinner && <Trophy className="mx-auto mb-1" size={14} />}
                              {label}
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <AnimatePresence>
              {showResultModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResultModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-card border rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-muted/30">
                      <h3 className="text-xl font-bold flex items-center gap-2"><ClipboardList className="text-primary" /> Game Results</h3>
                      <button onClick={() => setShowResultModal(false)} className="p-2 hover:bg-secondary rounded-xl transition-all"><X size={20} /></button>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                      <div className="space-y-3">
                        {topInputs.map((label, i) => {
                          const isRevealed = revealedResults.has(i);
                          const { endIndex } = getPathForPlayer(i);
                          const resultLabel = bottomInputs[endIndex];
                          return (
                            <div key={i} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all", isRevealed ? "bg-card shadow-sm" : "opacity-50 grayscale bg-muted/10")}>
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }} />
                                <span className="font-bold">{label}</span>
                              </div>
                              <ArrowRight className="text-muted-foreground" size={16} />
                              <div className="flex items-center gap-2">
                                <span className={cn("font-bold", isRevealed ? "text-primary" : "text-muted-foreground")}>{isRevealed ? resultLabel : "???"}</span>
                                {isRevealed && <CheckCircle2 className="text-green-500" size={16} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
