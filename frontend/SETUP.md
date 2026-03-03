# Setup Instructions

## Install Dependencies

From the `frontend/` directory:

```bash
npm install
```

This will install:
- Expo SDK (~52.0.0)
- React Navigation (native + native-stack)
- Axios for HTTP requests
- TanStack React Query for data fetching
- Expo Secure Store for token storage

## Run Development Server

```bash
npm start
```

Then scan the QR code with Expo Go app or press `i`/`a` for iOS/Android simulators.

## Backend Connection

The app connects to `http://localhost:8001`. Ensure the backend API is running before testing authentication flows.
