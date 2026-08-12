# NEET Study Companion

Personalized NEET preparation environment. Built with React, TypeScript, Vite, Tailwind CSS v4, React Router, and Vitest.

## Status

Phase 0 — project foundation. No study features implemented yet.

## Stack

- React 19 + TypeScript (strict)
- Vite
- Tailwind CSS v4
- React Router
- Vitest + Testing Library
- ESLint + Prettier

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run test -- --run` | Run test suite once |

## Structure

\`\`\`
src/
  components/   reusable UI
  layouts/      page shells
  lib/          utilities
  pages/        route views
  test/         test setup
  types/        shared TS types
\`\`\`