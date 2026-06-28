# CDAC C-CAT Mock Test Platform

A production-ready mock test platform for CDAC C-CAT exam preparation with 7000+ questions, 7 test modes, and real-time analytics.

## Features

- **7000+ Questions** across 11 subjects (English, Quant, Reasoning, Computers, C, DSA, C++, OS, Networking, DBMS, Big Data & AI)
- **7 Test Modes:** Full Mock, Section A, Section B, Topic Practice, Previous Mistakes, Daily Challenge, Rapid Revision
- **Real Exam Interface:** Timer, question navigator, mark for review, auto-save
- **Detailed Results:** Score, accuracy, subject-wise analysis, weak/strong topics
- **Performance Dashboard:** Track progress over time
- **Revision Center:** Review mistakes, bookmarks, formula sheet
- **No Backend Required:** Works entirely in browser with localStorage persistence

## Tech Stack

- React 19 + TypeScript
- Vite (with code splitting for question banks)
- Tailwind CSS
- Zustand (state management)
- React Router

## Quick Start

```bash
npm install
npm run dev
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SwamiChaudhari/cdac-mock-test)

Or manually:
1. Push this repo to GitHub
2. Import project in Vercel
3. Framework: Vite (auto-detected)
4. Click Deploy

## Test Modes

| Mode | Questions | Duration |
|------|-----------|----------|
| Full Mock | 100 | 120 min |
| Section A | 50 | 55 min |
| Section B | 50 | 65 min |
| Topic Practice | 20 | 30 min |
| Daily Challenge | 20 | 20 min |
| Rapid Revision | 30 | 45 min |

## Question Distribution (Full Mock)

- English: 15 | Quant: 12 | Reasoning: 12 | Computers: 11
- C Programming: 15 | DSA: 8 | OOP C++: 10 | OS: 5 | Networking: 5 | DBMS: 4 | Big Data & AI: 3
