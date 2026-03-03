# Freeweight - Next Steps

Last updated: March 3, 2026

---

## Current State

### ✅ Completed

1. **Repository Structure**
   - `/landing/` - Marketing site with UI mockups
   - `/backend/` - FastAPI production backend
   - `/frontend/` - React Native (Expo) mobile app
   - `/mvp_spec.md` - Complete product specification

2. **Backend Infrastructure**
   - FastAPI + PostgreSQL + SQLAlchemy setup
   - Complete database schema (11 tables) matching product spec
   - JWT authentication utilities (passlib + python-jose)
   - Alembic migrations configured and applied
   - Python package management via `uv`
   - Running on `http://localhost:8001`

3. **Backend API - Complete** ✅
   - **Authentication** (`/api/auth`) - Signup, login, get current user
   - **Coach Routes** (`/api/coaches`) - Dashboard, roster, invites, groups
   - **Program Builder** (`/api/programs`) - Create programs, workouts, exercises, assignments
   - **Athlete Routes** (`/api/athletes`) - Onboarding, calendar, workout logging, progress tracking
   - All endpoints functional with proper auth, error handling, validation
   - API docs at http://localhost:8001/docs

4. **Frontend App - Scaffolded** ✅
   - React Native + Expo + TypeScript
   - Navigation configured (React Navigation)
   - Auth context and API client set up
   - Placeholder screens for auth, athlete, and coach views
   - Ready for UI development

5. **Database Tables**
   - `users` - Athletes and coaches
   - `athlete_maxes` - Recorded lifts per athlete
   - `groups` / `subgroups` - Team organization
   - `programs` - Training programs
   - `program_assignments` - Links programs to athletes/groups/subgroups
   - `workouts` - Individual workout sessions
   - `exercises` - Exercises within workouts
   - `workout_logs` - Athlete's completed workout records
   - `set_logs` - Individual set performance data

6. **Documentation**
   - [CLAUDE.md](CLAUDE.md) - Coding guidelines and architecture
   - [backend/README.md](backend/README.md) - Backend setup and workflows
   - [frontend/README.md](frontend/README.md) - Frontend setup instructions
   - [STYLE_GUIDE.md](STYLE_GUIDE.md) - Design system

---

## What Just Happened

Four parallel agents built the entire backend API and scaffolded the frontend in one session:

1. **Auth Agent** - Built signup, login, JWT authentication
2. **Coach Agent** - Built dashboard, roster, program builder, assignments
3. **Athlete Agent** - Built onboarding, calendar, workout logging, progress
4. **Frontend Agent** - Scaffolded React Native app with navigation and API setup

All code follows CLAUDE.md guidelines: minimal, correct, clean, production-ready.

---

## Next: Build the Frontend UI

The backend is complete and tested. Now we need to build out the React Native screens.

### Priority Order

**Phase 1: Authentication Flow**
1. Login screen - Email/password form
2. Signup screen - User type selection + onboarding
3. Onboarding screens - Athlete/coach specific fields

**Phase 2: Athlete Experience**
1. Home screen - Today's workout card + calendar
2. Workout screen - Guided workout with set logging
3. Exercise detail - Video, notes, target weights
4. Progress screen - Max strength charts

**Phase 3: Coach Experience**
1. Dashboard - Completion stats, flagged athletes
2. Roster - Athlete list with groups/subgroups
3. Program builder - Create workouts and exercises
4. Assignment flow - Assign to athletes/groups
5. Athlete detail - View individual progress

**Phase 4: Polish**
1. Loading states and error handling
2. Notifications setup (daily workout reminders)
3. Offline support (cache workouts)
4. Video upload/playback

---

## Development Workflow

### Running Everything Locally

```bash
# Terminal 1: Backend
cd backend
uv run uvicorn app.main:app --reload --port 8001

# Terminal 2: Frontend
cd frontend
npm install        # First time only
npm start          # Starts Expo dev server
# Then press 'i' for iOS or 'a' for Android

# Terminal 3: Database (if needed)
psql freeweight
```

### Before Each Session

1. Pull latest changes: `git pull`
2. Check for new migrations: `cd backend && uv run alembic upgrade head`
3. Install any new dependencies:
   - Backend: `cd backend && uv sync`
   - Frontend: `cd frontend && npm install`
4. Start backend: `cd backend && uv run uvicorn app.main:app --reload --port 8001`

---

## API Endpoints Reference

All endpoints documented at http://localhost:8001/docs

### Auth (`/api/auth`)
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user

### Coach (`/api/coaches`)
- `GET /api/coaches/dashboard` - Stats and flags
- `GET /api/coaches/roster` - All athletes
- `POST /api/coaches/invite` - Generate invite link
- `POST /api/coaches/groups` - Create group
- `POST /api/coaches/groups/{id}/subgroups` - Create subgroup

### Programs (`/api/programs`)
- `POST /api/programs` - Create program
- `GET /api/programs/{id}` - View program
- `POST /api/programs/{id}/workouts` - Add workout
- `POST /api/programs/workouts/{id}/exercises` - Add exercise
- `POST /api/programs/{id}/assign` - Assign to athlete/group

### Athletes (`/api/athletes`)
- `POST /api/athletes/onboarding` - Complete onboarding
- `PUT /api/athletes/maxes` - Update maxes
- `GET /api/athletes/calendar` - View scheduled workouts
- `GET /api/athletes/workouts/today` - Today's workout
- `POST /api/athletes/workouts/{id}/start` - Start workout
- `POST /api/athletes/workouts/{id}/sets` - Log set
- `POST /api/athletes/workouts/{id}/complete` - Complete workout
- `POST /api/athletes/workouts/{id}/flag` - Flag issue
- `GET /api/athletes/history` - Completion history
- `GET /api/athletes/progress` - Max progression

---

## Key Decisions Still Needed

1. **Video storage** - S3, Cloudinary, or Firebase Storage for exercise demos and lift videos?
2. **Push notifications** - Expo's built-in or Firebase Cloud Messaging?
3. **Production database hosting** - Supabase, Railway, or Render?
4. **Production deployment** - Vercel for web, EAS Build for mobile?
5. **Analytics** - Mixpanel, Amplitude, or PostHog for user tracking?

---

## Reference

- **Product Spec:** [mvp_spec.md](mvp_spec.md)
- **Database Schema:** [backend/app/models.py](backend/app/models.py)
- **API Routes:** [backend/app/routes/](backend/app/routes/)
- **API Docs:** http://localhost:8001/docs (when backend is running)
- **Design System:** [STYLE_GUIDE.md](STYLE_GUIDE.md)
- **Frontend Code:** [frontend/src/](frontend/src/)
