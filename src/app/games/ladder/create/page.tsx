"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, User, Clock, ChevronUp, ChevronDown, ListPlus, Play } from "lucide-react";

interface LadderLine {
  id: string;
  fromX: number;
  toX: number;
  y: number;
}

export default function CreateLadderPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [hostName, setHostName] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [expireHours, setExpireHours] = useState(24);
  const [bottomLabels, setBottomLabels] = useState<string[]>(["Result 1", "Result 2"]);
  const [loading, setLoading] = useState(false);

  const handlePlayerCountChange = (delta: number) => {
    const newCount = Math.max(2, Math.min(10, playerCount + delta));
    setPlayerCount(newCount);

    // Adjust bottom labels
    if (newCount > bottomLabels.length) {
      setBottomLabels([...bottomLabels, ...Array(newCount - bottomLabels.length).fill("").map((_, i) => `Result ${bottomLabels.length + i + 1}`)]);
    } else {
      setBottomLabels(bottomLabels.slice(0, newCount));
    }
  };

  const generateLadderLines = (count: number) => {
    const lines: LadderLine[] = [];
    const rows = 10;
    const probability = 0.5;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < count - 1; x++) {
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
      if (linesInRow.length === 0 && count > 1) {
        const randomX = Math.floor(Math.random() * (count - 1));
        lines.push({
          id: `line-forced-${randomX}-${y}`,
          fromX: randomX,
          toX: randomX + 1,
          y
        });
      }
    }
    return lines;
  };

  const handleCreate = async () => {
    if (!title.trim() || !hostName.trim() || bottomLabels.some(l => !l.trim())) return;
    setLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expireHours);

      const ladderLines = generateLadderLines(playerCount);

      const { data: ladder, error: ladderError } = await supabase
        .from("ladders")
        .insert([{
          title,
          host_name: hostName,
          player_count: playerCount,
          ladder_lines: ladderLines,
          bottom_labels: bottomLabels,
          expires_at: expiresAt.toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (ladderError) throw ladderError;

      // Host joins as Player 1 (index 0)
      const { error: joinError } = await supabase
        .from("ladder_players")
        .insert([{
          ladder_id: ladder.id,
          player_index: 0,
          nickname: hostName
        }]);

      if (joinError) throw joinError;

      localStorage.setItem(`ladder_voter_name_${ladder.id}`, hostName);
      router.push(`/games/ladder/${ladder.id}`);
    } catch (error) {
      console.error("Error creating ladder:", error);
      alert("Failed to create ladder. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-10 px-4 max-w-2xl mx-auto">
      <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create a New Ladder</h1>
          <p className="text-muted-foreground">Set the stage for a fair choice.</p>
        </div>

        <div className="space-y-6 bg-card border rounded-3xl p-8 shadow-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User size={16} /> Host Nickname <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your nickname"
                className="w-full h-12 rounded-xl border bg-background px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ladder Title <span className="text-destructive">*</span></label>
              <input
                type="text"
                placeholder="E.g., Dinner Choice, Team Assignment"
                className="w-full h-12 rounded-xl border bg-background px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock size={16} /> Duration
              </label>
              <select
                className="w-full h-12 rounded-xl border bg-background px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                value={expireHours}
                onChange={(e) => setExpireHours(Number(e.target.value))}
              >
                <option value={2}>2 Hours</option>
                <option value={6}>6 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ListPlus size={16} /> Participant Count
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePlayerCountChange(-1)}
                  className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all"
                >
                  <ChevronDown size={20} />
                </button>
                <span className="text-2xl font-bold min-w-[2ch] text-center">{playerCount}</span>
                <button
                  type="button"
                  onClick={() => handlePlayerCountChange(1)}
                  className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all"
                >
                  <ChevronUp size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Bottom Results (Destinations)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bottomLabels.map((label, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Result ${index + 1}`}
                  className="w-full h-10 rounded-xl border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={label}
                  onChange={(e) => {
                    const newLabels = [...bottomLabels];
                    newLabels[index] = e.target.value;
                    setBottomLabels(newLabels);
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !title.trim() || !hostName.trim() || bottomLabels.some(l => !l.trim())}
            className="w-full flex items-center justify-center h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" size={20} />}
            {loading ? "Creating..." : "Create Ladder Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
