import Link from "next/link";
import { Gamepad2, Trophy, Users } from "lucide-react";

const navItems = [
  { name: "Games", href: "/games", icon: <Gamepad2 size={18} /> },
  { name: "Leaderboard", href: "/leaderboard", icon: <Trophy size={18} /> },
  { name: "Community", href: "/community", icon: <Users size={18} /> },
];

export default function NavBar() {
  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {item.icon}
          <span className="hidden sm:inline">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}