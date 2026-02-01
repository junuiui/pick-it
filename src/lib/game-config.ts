import { Disc3, Vote, Bomb, Rows3, LucideIcon } from "lucide-react";

export interface GameConfig {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  instruction: string;
}

export const GAMES: GameConfig[] = [
  { 
    id: "ladder", 
    name: "Ladder", 
    href: "/games/ladder", 
    icon: Rows3, 
    color: "group-hover:text-blue-500", 
    gradient: "from-blue-500/20 to-blue-600/5", 
    instruction: "Enter names and trace the path to find your destiny." 
  },
  { 
    id: "roulette", 
    name: "Roulette", 
    href: "/games/roulette", 
    icon: Disc3, 
    color: "group-hover:text-red-500", 
    gradient: "from-red-500/20 to-red-600/5",
    instruction: "Spin the wheel to decide your fate with custom options."
  },
  { 
    id: "vote", 
    name: "Vote", 
    href: "/games/vote", 
    icon: Vote, 
    color: "group-hover:text-purple-500", 
    gradient: "from-purple-500/20 to-purple-600/5",
    instruction: "Host anonymous polls and see real-time results."
  },
  { 
    id: "bomb", 
    name: "Bomb", 
    href: "/games/bomb", 
    icon: Bomb, 
    color: "group-hover:text-orange-500", 
    gradient: "from-orange-500/20 to-orange-600/5",
    instruction: "Pass the bomb before the timer runs out! Tick tock..."
  },
];