# Next Steps

## 1. Install Dependencies

Run this from the `frontend/` directory:

```bash
npm install
```

## 2. Add Placeholder Assets

The following placeholder image files are referenced in `app.json` but need to be created:

- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1284x2778)
- `assets/adaptive-icon.png` (1024x1024, Android)
- `assets/favicon.png` (48x48)

For now, you can create simple placeholder images or use Expo's defaults by running:

```bash
npx expo install
```

## 3. Start Development

```bash
npm start
```

## 4. Test Authentication Flow

1. Ensure backend is running at `http://localhost:8001`
2. Test signup flow (creates new user)
3. Test login flow (authenticates existing user)
4. Verify athlete/coach routing works based on `user_type`

## What's Included

### API Layer
- `/src/api/client.ts` - Axios instance with JWT interceptors
- `/src/api/endpoints.ts` - Typed API functions for auth, athlete, coach

### Authentication
- `/src/hooks/useAuth.tsx` - Auth context with login/signup/logout
- Token storage via Expo SecureStore
- Auto-loading user on app launch

### Navigation
- `/src/navigation/AppNavigator.tsx` - Stack navigator
- Conditional routing based on auth state and user type

### Screens
- `/src/screens/auth/LoginScreen.tsx` - Email/password login
- `/src/screens/auth/SignupScreen.tsx` - User registration with type selection
- `/src/screens/athlete/HomeScreen.tsx` - Athlete home (placeholder)
- `/src/screens/coach/DashboardScreen.tsx` - Coach dashboard (placeholder)

### Design System
Colors match `STYLE_GUIDE.md`:
- Primary: `#B4F000` (lime green)
- Background: `#14181C` (dark)
- Text: `#E6EDF3` (light)
- Secondary: `#5A6572` (gray)

## Known Limitations

- Asset files are not created (use defaults or create manually)
- React Query is installed but not yet used (direct axios calls in screens)
- No error boundaries or loading states
- iOS/Android specific configurations may need tuning
- Localhost API connection won't work on physical devices (use ngrok or similar)
