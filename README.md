# Pick It

A real-time multiplayer mini-game platform designed for groups to interact, vote, and play together on the fly. Built with a focus on speed, simplicity, and premium aesthetics.

## Features

- **Real-time Synchronization**: Powered by Supabase Realtime for instant updates across all clients.
- **Dynamic Game Sessions**: Create and join game rooms instantly via unique IDs.
- **Persistent Rooms**: Game states are persisted in Supabase, allowing rooms to be rejoined.
- **Premium UI/UX**: Modern design with glassmorphism, smooth animations, and responsive layouts.

## Games

### ✅ Available
- **Vote**: A feature-rich voting game.
  - Create custom polls with multiple options.
  - Host nicknames and anonymous voting.
  - Real-time result tracking with animated progress bars.
  - Automatic expiration logic.
- **Ladder **: Classic random selection game.
  - Support for multiple players and goals.
  - Real-time synchronization of ladder results.
  - Local play and persistent room modes.
  - Smooth SVG-based path animations.

### 🏗️ In Progress / Planned
- **Roulette**: Customizable spinning wheel for quick decisions.
- **Bomb**: High-stakes timer game with random triggers.
- **Tournament**: Bracket-based selection system.

## Technical Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn
- A Supabase project with necessary tables

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/junuiui/pick-it.git
   cd pick-it
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Status & Roadmap

- [x] **Platform Core**: Next.js 15, Tailwind 4, Supabase Integration
- [x] **Vote Game**: Full implementation (Rooms, Voting, Nicknames, Expiration)
- [x] **Ladder Game**: Full implementation (Path generation, Real-time sync, Persistence)
- [ ] **Roulette**: UI Design and Logic implementation
- [ ] **Bomb Game**: Interaction design and Real-time syncing
- [ ] **User Presence**: Visual indicator of who is currently in the room
- [ ] **Global UI Polish**: Consistent glassmorphism and micro-animations across all pages