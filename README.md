# Pick It

A real-time multiplayer mini-game platform designed for groups to interact, vote, and play together on the fly.

## Features

- **Real-time Synchronization**: Powered by Supabase for instant updates across all clients.
- **Dynamic Game Sessions**: Create and join game rooms instantly.
- **Responsive Design**: Optimized for both mobile and desktop experiences.

## Games

### Currently Available / In Progress
- **Vote**: A feature-rich voting game.
  - Create custom polls associated with a room.
  - Anonymous voting.
  - Real-time result tracking.
  - (In Progress) Host nicknames, advanced options.

### Planned / Upcoming
- **Ladder**: Classic ladder climbing for fair random selection.
- **Roulette**: Customizable spinning wheel.
- **Bomb**: High-stakes timer game.

## Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Realtime**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn
- A Supabase project

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

## Current Status & Roadmap

- [x] Basic Project Setup (Next.js, Tailwind, Supabase)
- [ ] **Vote Game**
    - [x] Room Creation
    - [x] Basic Voting UI
    - [ ] Host Nicknames
    - [ ] Anonymous Voting Options
    - [ ] Expiration Logic
- [ ] **Other Games** (Ladder, Roulette, Bomb) implementation
- [ ] User Presence & Connection Handling
- [ ] Polish UI/UX & Animations