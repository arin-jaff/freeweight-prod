# NEXT_STEPS

## What was completed in this session

### Athlete frontend
- Migrated Athlete Home data loading to React Query in [`src/screens/athlete/HomeScreen.tsx`](/Users/andreavergara/coding/freeweight/frontend/src/screens/athlete/HomeScreen.tsx):
  - `HomeTab` now uses `useQuery` for `athleteApi.getTodayWorkout` and `athleteApi.getCalendar`.
  - `ProgressTab` now uses `useQuery` for `athleteApi.getProgress` and `useMutation` + `queryClient.invalidateQueries({ queryKey: ['progress'] })` for `athleteApi.updateMax`.
  - Loading/error states are driven by query state (`isLoading`, `error`) instead of manual fetch state.
- Replaced placeholder Athlete Home visual with a real workflow UI in `HomeTab`:
  - Today's workout card includes workout metadata, completed state, flagged state, and start CTA.
  - Week strip displays workout availability/completion by day.
  - Start action still routes to `navigation.navigate('Workout', { workoutId, workoutName })`.

### Workout screen UI
- Redesigned [`src/screens/athlete/WorkoutScreen.tsx`](/Users/andreavergara/coding/freeweight/frontend/src/screens/athlete/WorkoutScreen.tsx) to a full production-style dark/neon UI **without changing logging logic**:
  - New header with back button, exercise index, and progress bar.
  - Exercise detail section with sets/reps/target summary.
  - Video placeholder card rendered when `currentExercise.video_url` exists.
  - Set cards with active/completed visual states.
  - Coach notes surfaced in a dedicated card when `currentExercise.coach_notes` exists.
  - Primary action restyled to `✓ Completed` while preserving `logCurrentSet` flow.

### Auth/session correctness
- Closed auth gap where expired token (401) removed SecureStore token but did not clear in-memory auth user:
  - Added unauthorized event emitter in [`src/api/client.ts`](/Users/andreavergara/coding/freeweight/frontend/src/api/client.ts) via `onUnauthorized(...)`.
  - Response interceptor now emits unauthorized event after deleting `'auth_token'` on 401.
  - `AuthProvider` in [`src/hooks/useAuth.tsx`](/Users/andreavergara/coding/freeweight/frontend/src/hooks/useAuth.tsx) subscribes and calls `setUser(null)`.
  - This now forces the app back to login stack via `AppNavigator` when a 401 occurs.

### Coach frontend
- Added coach logout action to [`src/screens/coach/DashboardScreen.tsx`](/Users/andreavergara/coding/freeweight/frontend/src/screens/coach/DashboardScreen.tsx):
  - `DashboardTab` now accepts `onLogout`.
  - `CoachDashboardScreen` now gets `logout` from `useAuth()` and passes it down.
  - Added a themed `LOGOUT` button in dashboard tab UI.

### Assets/tooling
- Added asset generation script [`scripts/generate-assets.js`](/Users/andreavergara/coding/freeweight/frontend/scripts/generate-assets.js) using `sharp`.
- Installed `sharp` and generated required Expo assets:
  - [`assets/icon.png`](/Users/andreavergara/coding/freeweight/frontend/assets/icon.png) (1024x1024)
  - [`assets/splash.png`](/Users/andreavergara/coding/freeweight/frontend/assets/splash.png) (1284x2778)
  - [`assets/adaptive-icon.png`](/Users/andreavergara/coding/freeweight/frontend/assets/adaptive-icon.png) (1024x1024)
  - [`assets/favicon.png`](/Users/andreavergara/coding/freeweight/frontend/assets/favicon.png) (196x196)

### Validation done
- TypeScript checks were run after each major change: `npx tsc --noEmit` passed.

## Remaining work

### Athlete frontend
- **WorkoutScreen data coverage gaps** in [`src/screens/athlete/WorkoutScreen.tsx`](/Users/andreavergara/coding/freeweight/frontend/src/screens/athlete/WorkoutScreen.tsx):
  - `TodayWorkout.is_flagged` is not surfaced in the workout detail experience.
  - `TodayWorkout.scheduled_date` and `TodayWorkout.name` from fetched payload are largely unused (header uses route param `workoutName`).
  - `Exercise.order` is not used for display/order enforcement in UI.
- **Workout persistence UX**:
  - Logged sets are tracked in local screen state only (`exerciseLogs`) and are not hydrated from server set logs on reload/return.
- **Error UX consistency**:
  - Several flows still use generic `Alert.alert` error handling rather than consistent inline retry/error components.

### Coach frontend
- **Program editing lifecycle is incomplete** in [`src/screens/coach/ProgramBuilderScreen.tsx`](/Users/andreavergara/coding/freeweight/frontend/src/screens/coach/ProgramBuilderScreen.tsx):
  - Add-only builder; no edit/delete/reorder for sessions or exercises once added.
  - No post-create edit screen for existing programs.
- **Assignment surface is limited**:
  - `programsApi.assign` supports `group_id` / `subgroup_id`, but UI only supports single `athlete_id` selection.
  - Programs list in [`src/screens/coach/DashboardScreen.tsx`](/Users/andreavergara/coding/freeweight/frontend/src/screens/coach/DashboardScreen.tsx) has no “assign existing program” action.
- **Exercise authoring fields not fully surfaced**:
  - `programsApi.addExercise` supports `video_url`, but builder UI does not collect it.

### Backend changes needed to unblock frontend features
- **Exercise schema extensions** (not currently present in `Exercise` interface in [`src/api/endpoints.ts`](/Users/andreavergara/coding/freeweight/frontend/src/api/endpoints.ts)) if desired product requires:
  - Rest timer per set/exercise.
  - Rep ranges (`min_reps`/`max_reps`) instead of single `reps` value.
- **Set-log hydration endpoint contract**:
  - Frontend cannot restore per-set logged state unless backend returns set-level log detail in `getWorkout` payload (or separate endpoint).
- **Program detail typing**:
  - `programsApi.get` currently returns `any`; backend contract + typed response model should be finalized for robust editing/detail UI.

### Infrastructure / deployment
- **API base URL strategy**:
  - [`src/api/client.ts`](/Users/andreavergara/coding/freeweight/frontend/src/api/client.ts) uses hardcoded `http://localhost:8001`; physical device builds need environment-based API URL config.
- **Production config hardening**:
  - Add environment switching for dev/staging/prod API hosts.
- **CI quality gates**:
  - Add automated typecheck/lint/test pipeline so regressions are caught before merge.
- **Security/ops follow-up**:
  - `npm audit` currently reports vulnerabilities after install; dependency remediation workflow is still needed.
- **Deep link handling not implemented** — The coach invite flow generates a `freeweight://invite?coach_id=X` link, but the athlete app has no deep link handler to process it. Requires `expo-linking` integration and a deep link handler in `src/navigation/AppNavigator.tsx`.
- **API_URL is hardcoded** — `src/api/client.ts` hardcodes the backend URL to a local IP address. Teammates will need to manually edit this file to match their own machine. Should be moved to an `.env` file using `expo-constants` or `react-native-dotenv`.
- **Backend is localhost-only** — The backend only runs on the local machine, which means the app only works when connected to the same WiFi network as the dev machine. For broader testing or sharing with teammates, the backend needs to be deployed to a service like Railway, Render, or Fly.io.
