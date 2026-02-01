import { Vote, Bomb, Rows3, LucideIcon, Radius } from "lucide-react";

export interface GameConfig {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export const GAMES: GameConfig[] = [
  { id: "ladder", name: "Ladder", href: "/games/ladder", icon: Rows3, color: "text-blue-500" },
  { id: "roulette", name: "Roulette", href: "/games/roulette", icon: Radius, color: "text-red-500" },
  { id: "vote", name: "Vote", href: "/games/vote", icon: Vote, color: "text-purple-500" },
  { id: "bomb", name: "Bomb", href: "/games/bomb", icon: Bomb, color: "text-orange-500" },
];