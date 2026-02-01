import NavBar from "@/components/NavBar.component";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Pick-it</span>
          </Link>
        </div>

        {/* Navigation Section */}
        <NavBar />

        {/* Action Section (e.g., Connection Status or Auth) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </div>
          <button className="text-sm font-medium bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}