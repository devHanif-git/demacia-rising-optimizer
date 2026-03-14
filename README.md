# Demacia Rising Optimizer

A modern, responsive web application built with **Next.js** and **Tailwind CSS** to help players calculate the most optimal unit composition to defend against incoming enemy attacks in *"Demacia Rising"*.

## Features

- **Dynamic Threat Calculation:** Input the specific enemies you are facing and the optimizer uses a built-in tag-based heuristic system to match them to the perfect defenders.
- **Champion Integration:** Select which Champions you currently have unlocked. The algorithm will dynamically prefer utilizing powerful Champions when they directly counter incoming specific threats.
- **Customizable Training Slots:** Adjus the number of available unit training slots (up to 8) to match your current in-game situation.
- **Smart Recommendations:** Provides two simultaneous recommended build paths:
  1. **Optimal Build (With Champions):** The absolute best setup utilizing your selected champions alongside standard units.
  2. **Standard Build (Units Only):** A solid fallback plan if your champions are currently unavailable or on cooldown.
- **Persistent Storage:** Your configuration—including Max Slots, Unlocked Champions, and your current Incoming Attack wave—is automatically saved to your browser's local storage so you don't lose your data when you refresh.

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS (v4)
- **Language:** TypeScript
- **Icons:** Lucide React
- **Local Storage:** Native browser `localStorage` API

## Data Model & Mechanics

The core logic revolves around translating *Threats* to *Counter-Measures* via cross-referenced tags. 

- **Enemies** generate specific types of threats (e.g. `needs_aoe`, `heavy_armor`).
- **Player Units** and **Champions** have specific capabilities that allow them to handle certain tags.
- The algorithm scores every unit and champion based on the incoming threat volume to mathematically allocate available training slots to the units most capable of mitigating that precise attack. 

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## Built With

Created specifically as a fan tool to improve the Demacia Rising gameplay experience. You can start editing the core calculation logic or visuals heavily by modifying `app/page.tsx`!
