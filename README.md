# Cash Saving — Gamified Personal Savings Tracker

A mobile-first, gamified personal cash savings tracker in Pakistani Rupees (PKR) designed to help you reach a **PKR 100,000** savings goal through competitive gaming ranks, Chess.com-style deposit rewards, daily discipline tracking, 200 progressive Rs. 500 milestones, and a trading-style cash flow chart.

## Live Website

**Live Deployment (GitHub Pages):**  
https://faisalqureshi995.github.io/Cash-Saving-/

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons & Animations:** `lucide-react`, `motion`, `canvas-confetti`
- **CI/CD:** GitHub Actions → GitHub Pages

## Features

- **PKR 100,000 Goal & 9 Gaming Ranks:** Progress from Bronze to Conqueror as your cumulative savings grow.
- **200 Rs. 500 Milestones:** Automatic micro-milestone tracking with celebration confetti whenever a Rs. 500 threshold is crossed.
- **Daily Saving Discipline (Asia/Karachi):** Tracks your Rs. 200 daily target and automatically logs missed-day penalties without duplicates.
- **Trading-Style Chart:** Interactive line and candlestick (K-Line) views showing green upward savings moves and red downward deductions/penalties.
- **Deposit Rewards:** Instant Chess.com-style feedback badges (Good 👍 to Legendary 🚀) for every deposit.
- **Day-by-Day Streak Tracker:** Visual 14-day progression strip and streak milestones.
- **Persistent Local Storage & JSON Backup:** All data stays in browser `localStorage` with JSON export/import support.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run lint
npm run build
```

## Automatic Deployment

Every push to the `main` branch triggers the GitHub Actions workflow at `.github/workflows/deploy.yml`, which installs dependencies, runs the Vite production build (`base: '/Cash-Saving-/'`), and deploys `dist/` to GitHub Pages.
