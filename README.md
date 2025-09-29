# 🏋️ WorkoutRegister - Mi Entrenamiento

A modern, full-stack workout tracking application built with Next.js 14, TypeScript, and Supabase. Plan your workouts, track your progress, and achieve your fitness goals with detailed statistics and customizable tracking options.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## 📑 Index
- [🌟 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 API Routes](#-api-routes)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [📱 Key Components](#-key-components)
- [🌐 Internationalization (i18n)](#-internationalization-i18n)
- [📦 Installation & Setup](#-installation--setup)
- [🗂️ Project Structure](#️-project-structure)
- [🔄 Data Flow](#-data-flow)
- [🎯 Key Features Implementation](#-key-features-implementation)
- [🚧 Future Enhancements](#-future-enhancements)
- [📄 License](#-license)
- [👤 Author](#-author)

---

## 🌟 Features

### 📅 Workout Planning & Tracking
- **Interactive Calendar View**: Visual calendar interface to plan and track workouts
- **Flexible Workout Creation**: Create custom workouts with multiple exercises
- **Rest Day Management**: Mark days as rest days for proper recovery tracking
- **Workout Postponement**: Postpone individual workouts or entire workout sequences
- **Completion Tracking**: Mark exercises and individual sets as completed

### 💪 Exercise Management
- **Pre-loaded Exercise Library**: 100+ exercises categorized by muscle groups
- **Custom Exercise Creation**: Create and save your own exercises
- **Muscle Group Categorization**: 15 muscle groups including:
  - Chest, Back, Front/Middle/Rear Deltoids
  - Biceps, Triceps, Forearms
  - Quadriceps, Hamstrings, Glutes, Calves
  - Abductors, Abs, Obliques
- **Exercise Details**: Track sets, reps, weight, and rest time for each exercise

### 📊 Advanced Tracking
- **Custom Columns**: Create custom data fields (RIR, RPE, notes, etc.)
- **Flexible Data Types**: Support for text, number, and boolean columns
- **Set-by-Set Recording**: Track individual set performance with custom data
- **Workout State Management**: Save, expand/collapse, and complete exercises

### 📈 Statistics & Analytics
- **Weekly Progress Analysis**: Visual representation of your training week
- **Muscle Group Distribution**: See which muscle groups you're working
- **Training Metrics**:
  - Training days vs rest days
  - Plan compliance percentage
  - Estimated training time
  - Consistency tracking
  - Missed workouts analysis
- **Interactive Charts**: Built with Recharts for clear data visualization

### 🌍 Internationalization
- **Multi-language Support**: Full Spanish and English translations
- **Dynamic Language Switching**: Change language on the fly
- **Localized Content**: All UI elements, exercises, and muscle groups translated

### 🎨 User Experience
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices
- **Smooth Animations**: Polished transitions and interactions
- **Intuitive UI**: Built with shadcn/ui components for consistency

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.7
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts 2.15
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns 4.1
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
  - Email/Password authentication
  - Google OAuth integration
- **API**: Next.js API Routes + Server Actions
- **ORM**: Direct SQL queries (no ORM)
- **Security**: Row Level Security (RLS) policies

### Development Tools
- **Package Manager**: pnpm
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint
- **CSS Processing**: PostCSS + Autoprefixer

## 🚀 API Routes

### Workouts
- `GET /api/workouts` - Fetch all user workouts with exercises
- `POST /api/workouts` - Create or update workout
- `DELETE /api/workouts/[id]` - Delete specific workout
- `POST /api/workouts/[id]/postpone` - Postpone workout(s)
- `PATCH /api/workouts/[id]/completion` - Update completion status
- `PATCH /api/workouts/[id]/custom-data` - Update custom data
- `PATCH /api/workouts/[id]/visible-columns` - Toggle column visibility

### User Exercises
- `GET /api/user-exercises` - Fetch user's custom exercises
- `POST /api/user-exercises` - Create custom exercise
- `PUT /api/user-exercises/[id]` - Update custom exercise
- `DELETE /api/user-exercises/[id]` - Delete custom exercise

### User Columns
- `GET /api/user-columns` - Fetch user's custom columns
- `POST /api/user-columns` - Create custom column
- `DELETE /api/user-columns/[id]` - Delete custom column

### Statistics
- `GET /api/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get workout statistics

### Authentication
- `GET /api/auth/callback` - Supabase OAuth callback
- `POST /api/auth/signout` - Sign out user

## 🔐 Authentication & Authorization

### Authentication Methods
1. **Email/Password**: Traditional email-based authentication
2. **Google OAuth**: One-click Google sign-in

### Middleware Protection
- Automatic redirect to `/auth` for unauthenticated users
- Protected routes: `/` (main app)
- Public routes: `/auth`, `/auth/callback`
- Session refresh on every request

### Security Features
- Server-side session validation
- HTTP-only cookies for session storage
- CSRF protection via Supabase
- Row Level Security on database level

## 📱 Key Components

### Calendar System
- `workout-calendar.tsx` - Main calendar container
- `calendar-day.tsx` - Individual day cell with status indicators
- `day-actions-dialog.tsx` - Workout management modal

### Workout Management
- `workout-form.tsx` - Main workout creation/editing form
- `exercise-selector.tsx` - Exercise selection with search
- `editing-exercise.tsx` - Exercise editing interface
- `saved-exercise.tsx` - Completed exercise display
- `mobile-exercise-card.tsx` - Mobile-optimized exercise card

### Statistics
- `stats-container.tsx` - Statistics page container
- `stats-overview.tsx` - Key metrics cards
- `weekly-progress.tsx` - Weekly calendar visualization
- `volume-chart.tsx` - Muscle group distribution chart

### Configuration
- `exercise-manager.tsx` - Custom exercise CRUD interface
- `column-settings-dialog.tsx` - Custom column management


## 🌐 Internationalization (i18n)

### Implementation
- Context-based translation system
- Language stored in localStorage
- Dynamic language switching without page reload

### Translated Content
- All UI text and labels
- Exercise names (100+ exercises)
- Muscle group names
- Error messages and notifications
- Date and time formatting

### Supported Languages
- Spanish
- English


## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd WorkoutRegister
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL scripts in order from `/scripts` folder:
     - `create-tables.sql` - Base schema
     - `add-*.sql` - Feature additions
     - `fix-*.sql` - Schema updates
   - Enable Google OAuth in Supabase Auth settings (optional)

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials

5. **Run development server**
```bash
pnpm dev
# or
npm run dev
```

6. **Open browser**
   - Navigate to `http://localhost:3000`

### Build for Production
```bash
pnpm build
pnpm start
```

## 🗂️ Project Structure

```
WorkoutRegister/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── stats/               # Statistics endpoints
│   │   ├── user-columns/        # Custom columns CRUD
│   │   ├── user-exercises/      # Custom exercises CRUD
│   │   └── workouts/            # Workout management
│   ├── auth/                     # Authentication pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (calendar)
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── stats/                   # Statistics components
│   ├── workout-calendar/        # Calendar components
│   ├── workout-form/            # Form components
│   └── *.tsx                    # Feature components
├── hooks/                        # Custom React hooks
│   ├── use-workout-data.ts     # Workout data fetching
│   ├── use-exercise-actions.ts # Exercise CRUD operations
│   └── use-mobile.tsx          # Mobile detection
├── lib/                          # Utilities
│   ├── i18n/                    # Internationalization
│   │   ├── translations.ts     # Translation strings
│   │   ├── context.tsx         # Language context
│   │   └── *.ts                # i18n utilities
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Helper functions
├── scripts/                      # Database scripts
│   ├── create-tables.sql       # Initial schema
│   └── *.sql                   # Migrations
├── public/                       # Static assets
├── middleware.ts                # Auth middleware
└── tailwind.config.ts           # Tailwind configuration
```

## 🔄 Data Flow

### Workout Creation Flow
1. User opens workout form for a specific date
2. Selects exercises from library or creates custom ones
3. Configures sets, reps, weight, rest time
4. Adds custom column data (optional)
5. Saves workout → API validates → Database stores
6. Calendar updates with new workout

### Workout Execution Flow
1. User opens saved workout from calendar
2. Expands exercises to see set-by-set tracking
3. Records actual performance for each set
4. Marks sets/exercises as completed
5. Saves progress → Updates database
6. Statistics automatically recalculate

### Statistics Calculation
1. User navigates to Statistics view
2. Frontend requests data for date range
3. API aggregates workout data from database
4. Calculates metrics (compliance, volume, etc.)
5. Returns formatted data
6. Charts render with Recharts

## 🎯 Key Features Implementation

### Custom Columns System
- Users create columns with specific data types
- Columns can be activated/deactivated per workout
- Data stored in normalized `workout_custom_data` table
- Type validation on frontend and backend

### Workout Postponement
- Single workout mode: Moves one workout to new date
- Cascade mode: Shifts all future workouts by X days
- Maintains exercise data and completion status
- Prevents date conflicts with existing workouts

### Set-by-Set Tracking
- Each set stored as individual record
- Tracks reps, weight, and custom data per set
- Completion status per set
- Allows performance comparison over time

### Muscle Group Analytics
- Exercises tagged with muscle groups
- Statistics aggregate sets by muscle group
- Visual distribution chart
- Identifies undertrained muscle groups

## 🚧 Future Enhancements

- [ ] Progressive Web App (PWA) support
- [ ] Exercise video demonstrations
- [ ] Exercise history and PR tracking
- [ ] Rest timer with notifications
- [ ] Export data to CSV/PDF
- [ ] Advanced analytics (volume trends, strength curves)
- [ ] Body measurements tracking

## 📄 License

This project is private and not licensed for public use.

## 👤 Author

Created as a portfolio project to demonstrate full-stack development skills with modern web technologies.
