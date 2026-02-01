import Link from "next/link";
import { GAMES } from "@/lib/game-config";

export default function NavBar() {
  return (
    <nav className="flex items-center gap-4 md:gap-6">
      {GAMES.map((game) => {
        const Icon = game.icon;
        return (
          <Link
            key={game.id}
            href={game.href}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all group"
          >

            {/* 
              hover: to 110%
              transition-transform: smooth transition
              duration: 0.2s
            */}
            <div className="flex items-center gap-2 transition-transform duration-200 group-hover:scale-110">
              <Icon 
                size={18} 
                className={`transition-colors duration-200 ${game.color}`} 
              />
              <span className="hidden md:inline">{game.name}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}