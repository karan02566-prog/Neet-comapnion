# NEET Companion

A focused, offline-first study companion built for one purpose: NEET preparation done right. It brings planning, practice, mistake tracking, spaced revision, and performance analytics into a single connected system, so nothing you study gets lost and nothing you get wrong goes unreviewed.

**Live app:** [neet-nine-xi.vercel.app](https://neet-nine-xi.vercel.app)

![Status](https://img.shields.io/badge/status-active--development-brightgreen)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-personal--project-lightgrey)

---

## Overview

Most study trackers stop at "mark topic as done." NEET Companion is built around the actual prep loop that gets results: **plan a topic, practice it, log every mistake, revise it on a schedule, and track whether the score is actually moving.** Every module below feeds the next one.

## Features

| Module | Description |
|---|---|
| Dashboard | Daily overview of what's due, what's overdue, and current stats |
| Planner | Structured, phase-based study schedule |
| Focus Mode | Distraction-free timed study sessions |
| Syllabus | Full topic-by-topic NEET syllabus tracker |
| Practice | Question practice sessions with instant feedback |
| Import Questions | Bring in custom question banks |
| Mistakes Tracker | Every wrong answer logged and queued for review |
| Revision | Spaced-repetition queue for previously studied topics |
| Flashcards | Fast recall drilling for facts, terms, and formulas |
| Notes | Topic-linked note organization |
| Mock Tests | Full mock test mode with a post-test performance breakdown |
| Goals | Personal target setting and tracking |
| Progress | Visual analytics connecting study effort to results |
| History | Complete session history |

Mock test results feed the mistakes tracker. Mistakes feed the revision queue. Revision feeds the progress analytics. The system is designed to compound, not just log.

## Install as an App

NEET Companion is a Progressive Web App. Open the live link on a phone and use **Add to Home Screen** (Android Chrome) or **Share → Add to Home Screen** (iPhone Safari). It installs with its own icon, opens full-screen with no browser chrome, and works offline.

## Tech Stack

- [React 19](https://react.dev/) with TypeScript in strict mode
- [Vite](https://vite.dev/) for build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [React Router 7](https://reactrouter.com/) for routing
- [idb](https://github.com/jakearchibald/idb) — an IndexedDB wrapper powering local-first, offline data storage
- [Motion](https://motion.dev/) for animation
- [Lucide React](https://lucide.dev/) for icons
- Vitest and Testing Library for tests
- ESLint and Prettier for code quality

All study data is stored in IndexedDB directly in the browser — private, offline-capable, and never dependent on a server.

## Getting Started

```bash
git clone https://github.com/karan02566-prog/Neet-comapnion.git
cd Neet-comapnion
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and produce a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test -- --run` | Run the test suite once |

### Deployment

Deployed on [Vercel](https://vercel.com):

```bash
npx vercel --prod
```

## Project Structure

```
src/
├── components/   Reusable UI components (navigation, mascot, primitives)
├── layouts/      Page shells and route layouts
├── lib/          Shared utilities
├── pages/        Route-level views (Dashboard, Planner, Practice, etc.)
├── services/     IndexedDB repositories, one per data domain, plus analytics
├── test/         Test setup
└── types/        Shared TypeScript types
```

Each feature area — mistakes, revision, flashcards, notes, mock tests, goals — has its own dedicated repository under `src/services/`, keeping data access isolated and predictable per domain.

## Roadmap

- Cross-device sync (currently local-only via IndexedDB)
- Deeper analytics on the Progress page
- Additional question bank import formats
- Expanded mascot interactions

## License

Personal project. Not currently licensed for reuse.

---

<p align="center">Built with focus, one phase at a time.</p>
