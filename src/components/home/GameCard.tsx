import Link from "next/link";
import { GameConfig } from "@/lib/game-config";
import { ArrowRight, MessageCircleQuestionMark  } from "lucide-react";

interface GameCardProps {
  game: GameConfig;
}

export default function GameCard({ game }: GameCardProps) {
  const Icon = game.icon;

  return (
    <Link
      href={game.href}
      className="group relative block h-64 w-full overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-linear-to-br ${game.gradient} opacity-50 transition-opacity group-hover:opacity-100`} />

      {/* Default Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300 group-hover:scale-105 group-hover:blur-sm">
        <div className={`rounded-full bg-background/50 p-4 shadow-sm ring-1 ring-inset ring-foreground/10 ${game.color}`}>
          <Icon size={48} />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">{game.name}</h3>
      </div>

      {/* Overlay with Instruction */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 p-6 text-center">
        <p className="mb-4 text-lg font-medium text-white translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
          {game.instruction}
        </p>
        <span className="mb-4 **:inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-300 hover:bg-white/30 translate-y-4 group-hover:translate-y-0 delay-75">
          How to play <MessageCircleQuestionMark  size={16} />
        </span>

        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-300 hover:bg-white/30 translate-y-4 group-hover:translate-y-0 delay-75">
          Play Now <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}