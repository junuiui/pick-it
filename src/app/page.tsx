import { GAMES } from "@/lib/game-config";
import GameCard from "@/components/home/GameCard";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] space-y-12 py-10">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl px-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Decide with <span className="text-primary">Fun</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Struggling to make a choice? Invite your friends.<br className="hidden sm:block" />
          Real-time interactive games to settle it once and for all.
        </p>
      </div>

      {/* Game Grid Section */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:gap-8">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}