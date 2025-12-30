# 🏋️ Liftbase (formerly WorkoutRegister)

> A modern, full-stack Progressive Web App for comprehensive workout tracking with offline support, personal records tracking, and detailed performance analytics.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)
![Tests](https://img.shields.io/badge/tests-34%20passing-success)
![Coverage](https://img.shields.io/badge/coverage-84%25-brightgreen)

**🔗 Live Demo:** [liftbase.vercel.app](https://liftbase.vercel.app) | [workoutregister.vercel.app](https://workoutregister.vercel.app)

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Latest Updates](#-latest-updates-v20)
- [Installation](#-quick-start)
- [Project Structure](#️-project-structure)
- [API Documentation](#-api-routes)
- [Testing](#-testing)
- [Roadmap](#-roadmap)

---

## 🎯 Overview

Liftbase is a comprehensive workout tracking platform designed for serious fitness enthusiasts. It handles **10,000+ workout records** with zero lag, provides intelligent analytics, and works completely offline as a Progressive Web App.

**Key Metrics:**
- ⚡ Handles 10,000+ records without performance degradation
- 📴 Full offline functionality with smart caching
- 🔒 Multi-tenant architecture with Row Level Security
- 🌍 Fully bilingual (Spanish/English)
- 🧪 84% test coverage with 34+ automated tests

---

## 🌟 Key Features

### 💪 Workout Management
- **Interactive Calendar** - Visual planning with status indicators and drag-drop reordering
- **Exercise Library** - 100+ pre-loaded exercises across 15 muscle groups + custom exercise creation
- **Smart Templates** - Save and reuse favorite workouts with one click
- **Flexible Tracking** - Custom columns (RIR, RPE, tempo, notes) with set-by-set recording
- **Intelligent Postponement** - Move workouts individually or cascade entire sequences

### 📊 Performance Analytics
- **Personal Records** - Automatic PR detection for max weight and best reps with historical tracking
- **Exercise History** - Complete performance history with progress charts and last workout comparison
- **Statistics Dashboard** - Weekly progress, muscle group distribution, training time estimates, and compliance metrics
- **Data Export** - Professional PDF reports and CSV exports with bilingual support

### ⏱️ Smart Features
- **Rest Timer** - Background-capable timer with audio/vibration alerts, time adjustments, and auto-progression
- **Offline Mode** - Full PWA with IndexedDB caching, works completely without internet
- **Multi-language** - Complete ES/EN translation including all UI, exercises, and exports
- **Dark Mode** - System-aware theme with smooth transitions

### 🔐 Security & Auth
- **Supabase Auth** - Email/password + Google OAuth integration
- **Row Level Security** - Database-level authorization ensuring data isolation
- **Server-side Validation** - All operations validated server-side for security

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router) + TypeScript 5.7 + React 19
- Tailwind CSS + shadcn/ui (Radix UI)
- Recharts (analytics) + jsPDF (exports)
- Framer Motion (animations)

**Backend & Database**
- Supabase (PostgreSQL) with Row Level Security
- Next.js API Routes + Server Actions
- IndexedDB for offline caching

**PWA & DevOps**
- Service Worker with custom caching strategy
- Vitest + React Testing Library (84% coverage)
- GitHub Actions CI/CD

---

## 🆕 Latest Updates (v2.0)

### Major Features Added

**🎯 Personal Records & History**
- Automatic PR detection (max weight, best reps)
- Exercise history with progress charts
- Last workout comparison
- Visual PR indicators

**⏱️ Advanced Rest Timer**
- Background operation (works with screen off)
- Audio + vibration notifications
- Minimizable overlay with time adjustments
- Auto-progression to next set

**📴 Progressive Web App**
- Full offline functionality
- Smart IndexedDB caching
- Installable on mobile devices
- Optimized cache strategy

**📊 Data Export System**
- Professional PDF reports with charts
- CSV exports (summary + detailed formats)
- Bilingual support
- Customizable sections

**📋 Workout Templates**
- Save workouts as reusable templates
- Template library with search
- Quick workout creation

**🎨 UI/UX Improvements**
- Enhanced mobile layouts
- Improved calendar visualization
- Better dark mode support
- Smoother animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account ([free tier available](https://supabase.com))

### Installation

```bash
# Clone repository
git clone <repository-url>
cd liftbase

# Install dependencies
pnpm install  # or npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Execute SQL scripts from /scripts folder in Supabase SQL Editor

# Start development server
pnpm dev  # or npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### Database Setup

Execute scripts in order from `/scripts` folder:
1. `create-tables.sql` - Base schema with RLS
2. `add-*.sql` - Feature additions
3. `fix-*.sql` - Schema updates

---

## 🗂️ Project Structure

```
liftbase/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── exercises/       # History & PRs
│   │   ├── export/          # PDF/CSV exports
│   │   ├── stats/           # Analytics
│   │   ├── workouts/        # CRUD operations
│   │   └── workout-templates/
│   ├── auth/                 # Authentication
│   └── stats/                # Statistics page
│
├── components/               # React Components
│   ├── ui/                  # shadcn/ui primitives
│   ├── workout-calendar/    # Calendar system
│   ├── workout-form/        # Workout management
│   ├── exercise-history/    # History & PRs
│   └── stats/               # Analytics
│
├── hooks/                    # Custom React Hooks
│   ├── use-workout-data.ts
│   ├── use-exercise-actions.ts
│   └── use-templates.ts
│
├── lib/                      # Utilities
│   ├── i18n/                # Internationalization
│   ├── offline-cache.ts     # IndexedDB
│   └── supabase*.ts         # DB clients
│
├── contexts/                 # React Contexts
│   └── rest-timer-context.tsx
│
├── scripts/                  # Database migrations
├── public/                   # Static assets
└── __tests__/               # Test files
```

---

## 📡 API Routes

### Core Endpoints

**Workouts**
- `GET/POST /api/workouts` - List/create workouts
- `PUT/DELETE /api/workouts/[id]` - Update/delete workout
- `POST /api/workouts/[id]/postpone` - Postpone workout(s)
- `PATCH /api/workouts/[id]/completion` - Update completion

**Exercise History & PRs**
- `GET /api/exercises/[name]/history` - Exercise history (last 10)
- `GET /api/exercises/[name]/records` - Personal records
- `POST /api/exercises/check-pr` - PR validation
- `POST /api/exercises/record-history` - Record performance

**Templates & Config**
- `GET/POST /api/workout-templates` - Template management
- `GET/POST /api/user-exercises` - Custom exercises
- `GET/POST /api/user-columns` - Custom columns

**Analytics & Export**
- `GET /api/stats?startDate&endDate` - Workout statistics
- `GET /api/export/csv` - CSV export
- `GET /api/export/pdf` - PDF report

**Authentication**
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/signout` - Sign out

---

## 🧪 Testing

![Tests](https://img.shields.io/badge/tests-34%20passing-success)
![Coverage](https://img.shields.io/badge/coverage-84%25-brightgreen)

```bash
# Run all tests
npm run test

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui

# Watch mode
npm run test:watch
```

**Test Coverage:**
- 84% overall code coverage
- 100% on utility functions
- 80% on custom hooks
- 34 automated tests

**Testing Stack:**
- Vitest + React Testing Library
- jsdom for DOM environment
- GitHub Actions CI/CD

---

## 🔐 Authentication & Security

### Supported Methods
- **Email/Password** - Traditional authentication
- **Google OAuth** - One-click sign-in

### Security Features
- Server-side session validation
- HTTP-only cookies
- Row Level Security (RLS) in database
- CSRF protection via Supabase
- Middleware-based route protection

---

## 🌐 Internationalization

- **Languages:** Spanish 🇪🇸 | English 🇺🇸
- **Scope:** 500+ UI strings, 100+ exercises, all exports
- **Implementation:** Context-based with localStorage persistence
- **Dynamic:** No page reload required for language switching

---

## 🚧 Roadmap

### ✅ Completed (v2.0)
- Personal Records & History
- Advanced Rest Timer
- PWA with Offline Support
- Data Export (PDF/CSV)
- Workout Templates
- 84% Test Coverage

### 🔄 In Progress
- Account Settings Page
- PWA Background Sync

### 📋 Coming Soon
- AI-powered training suggestions (deload weeks, volume analysis)
- Body measurements tracking (weight, body fat %, measurements)
- Strength standards comparison
- AI Coach with personalized program generation
- Nutrition tracking integration
- Native mobile apps (iOS/Android)

---

## 📊 Performance Metrics

- **Load Time:** <2s (First Contentful Paint)
- **Database Queries:** Optimized with RLS, handles 10k+ records
- **Bundle Size:** Optimized with code splitting
- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices)
- **Offline Support:** Full functionality without internet

---

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome!

**Found a bug?** Open an issue with details
**Have a feature idea?** Share it in discussions
**Want to contribute?** Contact me first

---

## 📄 License

This project is **private** and **not licensed for public use**. All rights reserved.

This is a personal portfolio project demonstrating full-stack development capabilities with modern web technologies.

**Restrictions:**
- No commercial use
- No redistribution  
- No modification for public use

For inquiries, please contact the author.

---

## 👤 Author

**Your Name**
- Portfolio: [[https://seba-medina-portfolio.vercel.app/](https://seba-medina-portfolio.vercel.app/)]
- LinkedIn: [[/in/sebastiangmedina/](https://www.linkedin.com/in/sebastiangmedina/)]
- GitHub: [[@SebaMedina172](https://github.com/SebaMedina172)]

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

---

<div align="center">

**Built with ❤️ and lots of ☕**

*A production-ready workout tracking platform showcasing modern web development*

[⬆ Back to Top](#-liftbase-formerly-workoutregister)

</div>