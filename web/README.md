# FreeWeight Web Application

A desktop and mobile web application for FreeWeight - the complete strength training platform for athletes and coaches.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with custom theme matching style guide)
- **State Management:** TanStack React Query
- **API Client:** Axios
- **Forms:** React Hook Form
- **Date Utilities:** date-fns

## Project Structure

```
web/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── athlete/            # Athlete dashboard pages
│   ├── coach/              # Coach dashboard pages
│   ├── globals.css         # Global styles + Tailwind
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects)
│   └── providers.tsx       # React Query provider
├── components/
│   ├── AuthGuard.tsx       # Authentication wrapper
│   └── NavBar.tsx          # Navigation bar
├── lib/
│   ├── api-client.ts       # Axios configuration
│   ├── api-endpoints.ts    # API endpoint definitions
│   ├── auth.ts             # Authentication utilities
│   └── utils.ts            # Helper functions
└── package.json
```

## Getting Started

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Environment Setup

Create `.env.local` file (already created):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features Implemented

### ✅ Completed
- Project setup with Next.js 15 + TypeScript
- Tailwind CSS configuration with FreeWeight brand colors
- Authentication system (login/signup)
- API client with JWT token management
- Auth guards for protected routes
- Navigation bar component
- Type-safe API endpoint definitions

### 🚧 In Progress
- Athlete interface pages
- Coach interface pages
- CRUD operations for programs
- Group management UI

### 📋 To Do
- Athlete home page with today's workout
- Athlete workout logging interface
- Athlete progress tracking
- Coach dashboard with stats
- Coach roster management
- Program builder/editor
- Group and subgroup management
- Archive/restore functionality
- Invite code system

## Color Theme (from STYLE_GUIDE.md)

- **Primary:** `#B4F000` - Main actions, buttons, links
- **Secondary:** `#5A6572` - Supporting accents
- **Accent:** `#E6EDF3` - Text, highlights
- **Background:** `#14181C` - Page canvas
- **Text:** `#E6EDF3` - Body text
- **Error:** `#FF4D4F` - Error states

## API Integration

All API endpoints are defined in `/lib/api-endpoints.ts` with full TypeScript support:

- **Authentication:** login, signup, getMe
- **Athlete:** onboarding, maxes, calendar, workouts, logging, progress
- **Coach:** dashboard, roster, athletes, groups, subgroups
- **Programs:** CRUD operations, archiving, assignment

## Development Notes

- Uses localStorage for token storage (client-side only)
- Automatic redirect on 401 responses
- Mobile-first responsive design
- Type-safe API calls throughout

## Next Steps

1. Install dependencies: `npm install`
2. Start backend: `cd ../backend && uv run uvicorn app.main:app --reload`
3. Start web app: `npm run dev`
4. Continue building athlete/coach interfaces
