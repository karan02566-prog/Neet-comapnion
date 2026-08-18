# NEET Companion

A focused, offline-first study system for NEET preparation that connects planning, focused study, practice, mistake tracking, spaced revision, and performance analytics into one continuous learning loop.

[![Live App](https://img.shields.io/badge/Live-App-111827?style=flat&logo=vercel&logoColor=white)](https://neet-nine-xi.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

**[Open the Live App](https://neet-nine-xi.vercel.app/)**

---

## Overview

Most study trackers stop at marking topics as complete. NEET Companion is built around the actual preparation loop:

> **Plan → Focus → Practice → Make Mistakes → Revise → Measure → Improve**

Every module feeds the next. Instead of treating studying, practice, revision, and analytics as separate features, NEET Companion connects them into a single system where the output of one activity becomes the input for the next.

The application is **offline-first and local-first**: study data is stored directly in the browser using IndexedDB, so the core experience does not depend on a backend or an internet connection.

---

## Core Learning Loop


```text

                 ┌──────────────┐

                 │    PLANNER   │

                 │ What to study│

                 └──────┬───────┘

                        │

                        ▼

                 ┌──────────────┐

                 │  FOCUS MODE  │

                 │ Study deeply │

                 └──────┬───────┘

                        │

                        ▼

                 ┌──────────────┐

                 │   PRACTICE   │

                 │ Test recall  │

                 └──────┬───────┘

                        │

                        ▼

                 ┌──────────────┐

                 │   MISTAKES   │

                 │ Find gaps    │

                 └──────┬───────┘

                        │

                        ▼

                 ┌──────────────┐

                 │   REVISION   │

                 │ Review gaps  │

                 └──────┬───────┘

                        │

                        ▼

                 ┌──────────────┐

                 │  PROGRESS    │

                 │ Measure      │

                 └──────┬───────┘

                        │

                        └──────────────► Planner
The system is designed to compound learning rather than simply record activity.

Features
Module	Description
Dashboard	Daily overview of what's due, what's overdue, and current performance
Planner	Structured, phase-based study scheduling
Focus Mode	Distraction-free timed study sessions
Syllabus	Topic-by-topic NEET syllabus tracking
Practice	Question practice sessions with immediate feedback
Import Questions	Import custom question banks into the practice system
Mistakes Tracker	Logs incorrect answers and turns them into future review items
Revision	Spaced-repetition queue for previously studied material
Flashcards	Fast recall practice for facts, terms, and formulas
Notes	Topic-linked note organization
Mock Tests	Full mock-test experience with post-test performance breakdown
Goals	Personal target setting and progress tracking
Progress	Analytics connecting study activity with performance
History	Complete history of study sessions and activity
Connected workflows

Mock Test Results → Mistakes Tracker → Revision Queue → Progress Analytics

Practice Results → Mistakes → Scheduled Revision

Planner → Focus Sessions → History → Progress

The goal is to make every action useful to the next stage of preparation.

Install as an App

NEET Companion is a Progressive Web App (PWA).

Open the live app on a mobile device and use:

Android Chrome: Add to Home Screen
iPhone Safari: Share → Add to Home Screen

The application installs with its own icon and opens as an app without normal browser chrome.

Offline-first by design

Core study data is stored locally in IndexedDB.

This means:

No account is required for the core experience
Study data remains on the user's device
The application can continue working without an active internet connection
No application backend is required for the current architecture

Current architecture: local-first. Cross-device synchronization is planned but not yet implemented.

Product Philosophy

NEET Companion deliberately avoids turning preparation into a game.

The interface is designed around:

Focus over stimulation
Consistency over streaks
Learning over gamification
Reviewing mistakes over simply recording scores
Useful analytics over vanity metrics
A calm study environment over notification-heavy productivity

The application is intended to feel more like a personal study workspace than a conventional productivity dashboard.

Tech Stack
Frontend
React 19 — component-based UI
TypeScript — strict type safety
Vite — development and production tooling
Tailwind CSS v4 — utility-first styling
React Router 7 — application routing
Data & Storage
idb — IndexedDB wrapper
IndexedDB — local-first persistent storage
Repository-based data access per domain
UI & Interaction
Motion — animation and transitions
Lucide React — icon system
Quality & Testing
Vitest
Testing Library
ESLint
Prettier
Deployment
Vercel — production deployment
Architecture

NEET Companion uses a domain-oriented repository architecture over IndexedDB.

Instead of allowing UI components to directly manipulate browser storage, each data domain has its own repository/service layer.

┌───────────────────────────────────────────────┐
│                    React UI                   │
│                                               │
│ Dashboard · Planner · Focus · Practice ·      │
│ Revision · Mistakes · Flashcards · Mock Tests │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              Domain Services                  │
│                                               │
│ Tasks · Sessions · Questions · Mistakes ·     │
│ Revision · Flashcards · Notes · Goals · etc.  │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              Repository Layer                 │
│                                               │
│        Typed data access / CRUD logic         │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                  IndexedDB                    │
│                                               │
│       Persistent local-first application      │
│                    storage                    │
└───────────────────────────────────────────────┘

This separation keeps:

UI logic independent from storage
Data access predictable
Individual domains easier to maintain
Future backend synchronization easier to introduce
Project Structure
src/
├── components/
│   ├── mascot/
│   ├── navigation/
│   └── ui/
│
├── layouts/
│   └── RootLayout.tsx
│
├── lib/
│   └── shared utilities
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Planner.tsx
│   ├── Focus.tsx
│   ├── History.tsx
│   ├── Practice.tsx
│   ├── Syllabus.tsx
│   ├── ImportQuestions.tsx
│   ├── Revision.tsx
│   ├── Flashcards.tsx
│   ├── Notes.tsx
│   ├── Mistakes.tsx
│   ├── MockTests.tsx
│   ├── Goals.tsx
│   └── Progress.tsx
│
├── services/
│   ├── repositories/
│   └── analytics/
│
├── types/
│   └── shared TypeScript types
│
├── test/
│   └── test configuration and utilities
│
├── App.tsx
└── main.tsx

Each major feature domain has its own data-access layer under src/services/, keeping storage concerns isolated from the presentation layer.

Getting Started
Prerequisites
Node.js
npm
Installation
git clone https://github.com/karan02566-prog/Neet-comapnion.git
cd Neet-comapnion
npm install
Start development server
npm run dev

The application runs locally at:

http://localhost:5173
Scripts
Command	Purpose
npm run dev	Start the development server
npm run build	Type-check and create a production build
npm run preview	Preview the production build locally
npm run lint	Run ESLint
npm run test -- --run	Run the test suite once
Deployment

The production application is deployed using Vercel.

Production deployment
npx vercel --prod
Production URL

https://neet-nine-xi.vercel.app/

The project is structured as a standard Vite production application and can also be deployed to other static hosting providers that support client-side React applications.

Development Principles
Type Safety

TypeScript runs in strict mode to catch errors before runtime.

Separation of Concerns

Components handle presentation and interaction while domain repositories handle persistent data access.

Local-First Storage

The application does not require a backend for its current core functionality.

Domain Isolation

Each major feature owns its data-access logic instead of relying on one large global storage layer.

Incremental Architecture

Features are implemented as independent domains so the application can evolve without coupling every module to a single global data layer.

Production Validation

The project includes build, linting, and automated test commands to validate changes before deployment.

Privacy & Data

NEET Companion currently follows a local-first data model.

Study data is stored in the browser's IndexedDB storage rather than being sent to an application backend.

The current version therefore does not require:

User accounts
A database server
Cloud synchronization
Continuous network access for core study data

Important: clearing browser/site storage can remove locally stored application data. Cross-device backup is not currently available.

Roadmap
Planned
 Cross-device synchronization
 Deeper Progress analytics
 Additional question-bank import formats
 Expanded mascot interactions
Future
 Cloud backup and restore
 Multi-device study continuity
 More advanced revision scheduling
 Richer mock-test analytics
 Expanded question-bank management
Current Status

Active development

The core study workflow is implemented and deployed:

Planning
   ↓
Focused Study
   ↓
Practice
   ↓
Mistake Tracking
   ↓
Revision
   ↓
Performance Analysis

The current focus is improving analytics, question-bank workflows, and long-term study-system capabilities.

License

Personal project. Not currently licensed for reuse.

Built with focus, one phase at a time.
