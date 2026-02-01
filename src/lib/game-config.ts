import { Disc3, Vote, Bomb, Rows3, LucideIcon } from "lucide-react";

export interface GameConfig {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  color: string; 
}

export const GAMES: GameConfig[] = [
  { id: "ladder", name: "Ladder", href: "/games/ladder", icon: Rows3, color: "group-hover:text-blue-500" },
  { id: "roulette", name: "Roulette", href: "/games/roulette", icon: Disc3, color: "group-hover:text-red-500" },
  { id: "vote", name: "Vote", href: "/games/vote", icon: Vote, color: "group-hover:text-purple-500" },
  { id: "bomb", name: "Bomb", href: "/games/bomb", icon: Bomb, color: "group-hover:text-orange-500" },
];