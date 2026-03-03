# Freeweight - Next Steps

Last updated: March 2, 2026

---

## Current State

### ✅ Completed

1. **Repository Structure**
   - `/landing/` - Marketing site with UI mockups
   - `/backend/` - FastAPI production backend
   - `/mvp_spec.md` - Complete product specification

2. **Backend Infrastructure**
   - FastAPI + PostgreSQL + SQLAlchemy setup
   - Complete database schema (11 tables) matching product spec
   - JWT authentication utilities (passlib + python-jose)
   - Alembic migrations configured and applied
   - Python package management via `uv`
   - Running on `http://localhost:8001`

3. **Database Tables Created**
   - `users` - Athletes and coaches
   - `athlete_maxes` - Recorded lifts per athlete
   - `groups` / `subgroups` - Team organization
   - `programs` - Training programs
   - `program_assignments` - Links programs to athletes/groups/subgroups
   - `workouts` - Individual workout sessions
   - `exercises` - Exercises within workouts
   - `workout_logs` - Athlete's completed workout records
   - `set_logs` - Individual set performance data

4. **Documentation**
   - [CLAUDE.md](CLAUDE.md) - Coding guidelines and architecture
   - [backend/README.md](backend/README.md) - Backend setup and workflows
   - [STYLE_GUIDE.md](STYLE_GUIDE.md) - Design system

---

## Next: Build the Mobile App

### Recommended Approach: React Native (Expo)

**Why:**
- Single codebase for iOS + Android + Web
- Leverage existing React/TypeScript knowledge
- Fast development with hot reload
- Easy to publish and iterate

**Tech Stack:**
- React Native + Expo
- TypeScript
- React Navigation (routing)
- Axios (API calls)
- React Query (data fetching/caching)
- Expo SecureStore (token storage)
- Expo Notifications (daily reminders)

### Setup Commands

```bash
# Create the app
npx create-expo-app@latest frontend --template blank-typescript

# Install core dependencies
cd frontend
npm install @react-navigation/native @react-navigation/native-stack
npm install axios react-hook-form @tanstack/react-query
npx expo install expo-secure-store expo-notifications

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

---

## Next: Build Backend API Endpoints

Before the frontend can work, we need API endpoints. Priority order:

### 1. Authentication Routes (`/api/auth`)
- `POST /api/auth/signup` - Create new user (athlete or coach)
- `POST /api/auth/login` - Email/password login, return JWT
- `GET /api/auth/me` - Get current user profile

### 2. Onboarding Routes
- `POST /api/athletes/onboarding` - Complete athlete onboarding
- `POST /api/coaches/onboarding` - Complete coach onboarding
- `PUT /api/athletes/{id}/maxes` - Set/update athlete maxes

### 3. Coach Routes (`/api/coaches`)
- `GET /api/coaches/dashboard` - Dashboard stats
- `GET /api/coaches/roster` - View all athletes
- `POST /api/coaches/invite` - Generate athlete invite link
- `POST /api/coaches/groups` - Create group
- `POST /api/coaches/groups/{id}/subgroups` - Create subgroup

### 4. Program Builder Routes (`/api/programs`)
- `POST /api/programs` - Create program
- `GET /api/programs/{id}` - View program
- `POST /api/programs/{id}/workouts` - Add workout to program
- `POST /api/workouts/{id}/exercises` - Add exercise to workout
- `POST /api/programs/{id}/assign` - Assign to athlete/group/subgroup

### 5. Athlete Routes (`/api/athletes`)
- `GET /api/athletes/calendar` - View scheduled workouts
- `GET /api/athletes/workouts/today` - Get today's workout
- `POST /api/athletes/workouts/{id}/start` - Start workout
- `POST /api/athletes/workouts/{id}/sets` - Log set performance
- `POST /api/athletes/workouts/{id}/complete` - Complete workout
- `POST /api/athletes/workouts/{id}/flag` - Flag issue/injury

### 6. Progress/History Routes
- `GET /api/athletes/{id}/history` - Workout completion history
- `GET /api/athletes/{id}/progress` - Max strength over time

---

## File Structure for Next Session

### Backend API Routes (to create)

```
backend/app/
├── routes/
│   ├── __init__.py
│   ├── auth.py          # Signup, login, me
│   ├── coaches.py       # Coach dashboard, roster, invites
│   ├── programs.py      # Program builder
│   ├── athletes.py      # Calendar, workouts, logging
│   └── admin.py         # (future) Admin panel
├── schemas/
│   ├── __init__.py
│   ├── user.py          # Pydantic models for users
│   ├── program.py       # Pydantic models for programs
│   ├── workout.py       # Pydantic models for workouts
│   └── auth.py          # Login/signup request/response
└── main.py              # Register all routers
```

### Frontend Structure (to create)

```
frontend/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── athlete/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CalendarScreen.tsx
│   │   │   ├── WorkoutScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── coach/
│   │       ├── DashboardScreen.tsx
│   │       ├── RosterScreen.tsx
│   │       ├── ProgramBuilderScreen.tsx
│   │       └── AthleteDetailScreen.tsx
│   ├── components/
│   │   ├── ExerciseCard.tsx
│   │   ├── SetLogger.tsx
│   │   └── Calendar.tsx
│   ├── api/
│   │   ├── client.ts       # Axios instance
│   │   └── endpoints.ts    # API functions
│   ├── hooks/
│   │   └── useAuth.ts      # Auth context
│   └── navigation/
│       └── AppNavigator.tsx
└── App.tsx
```

---

## Key Decisions Needed

1. **Push notification service** - Expo's built-in or Firebase Cloud Messaging?
2. **Video storage** - S3, Cloudinary, or Firebase Storage for exercise demos and lift videos?
3. **Production database hosting** - Supabase, Railway, or Render?
4. **Production deployment** - Vercel for web, EAS Build for mobile?

---

## Development Workflow

### Running Everything Locally

```bash
# Terminal 1: Backend
cd backend
uv run uvicorn app.main:app --reload --port 8001

# Terminal 2: Frontend (once created)
cd frontend
npx expo start

# Terminal 3: Database (if needed)
psql freeweight
```

### Before Each Session

1. Pull latest changes: `git pull`
2. Check for new migrations: `cd backend && uv run alembic upgrade head`
3. Start backend: `cd backend && uv run uvicorn app.main:app --reload --port 8001`

---

## Reference

- **Product Spec:** [mvp_spec.md](mvp_spec.md)
- **Database Schema:** [backend/app/models.py](backend/app/models.py)
- **API Docs:** http://localhost:8001/docs (when backend is running)
- **Design System:** [STYLE_GUIDE.md](STYLE_GUIDE.md)
