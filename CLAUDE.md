# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (uses webpack)
npm run build     # Production build
npm run start     # Run production server
npm run lint      # Run ESLint
```

No test framework is configured.

## Tech Stack

- **Next.js** (App Router) + **React 19** + **TypeScript** (strict)
- **Firebase** (Firestore + Auth) — browser SDK for client, Admin SDK for API routes
- **Zustand** for state management
- **Tailwind CSS v4** for styling
- **Zod** for schema validation

## Architecture

### Feature Module Pattern

Every feature follows a consistent three-layer structure:

```
app/[feature]/
├── interface/        # TypeScript types
├── services/         # Firebase operations (singleton objects)
├── store/            # Zustand store
├── components/       # Feature UI components
└── page.tsx          # Page component ("use client")
```

### Service Layer

Services are plain objects exposing Firebase operations. Realtime subscriptions return an unsubscribe function:

```typescript
export const PrinterService = {
  subscribeToPrinters(callback, errorCallback) { /* returns unsubscribe */ },
  addPrinter({ printerId, location }),
  updatePrinter(printer),
  deletePrinter(printerId)
}
```

### Store Layer (Zustand)

Each feature has its own store. Stores manage subscription lifecycle — they call `subscribe*` from the service and hold the unsubscribe function for cleanup. No global store exists; all stores are decoupled.

### Firebase Setup

- **Browser client**: `app/utils/firebase.browser.ts` — used in client components and stores
- **Admin SDK**: `app/utils/firebase.admin.ts` — used only in `app/api/` routes
- Credentials come from `.env.local` (not committed)
- See `FIREBASE_SETUP.md` for setup instructions

### Authentication

- Firebase Auth with email/password
- `useAuthStore` subscribes to `onAuthStateChanged` and fetches the user's role from Firestore `/users/{uid}`
- `ClientWrapper` + `ProtectedRoute` components handle auth-aware routing

### Shared Constants

- **Theme colors**: `app/constants/theme.ts` — `COFFEE_PALETTE` object, used via inline styles
- Primary: `#F15F2C`, secondary: `#C7A17A`, background: `#0C243E`

### Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`).

## Key Files

| File | Purpose |
|------|---------|
| `app/components/ClientWrapper.tsx` | Auth-aware root wrapper |
| `app/components/SideBar.tsx` | Navigation |
| `app/store/useAuthStore.ts` | Global auth state |
| `app/utils/firebase.browser.ts` | Firestore/Auth client |
| `app/utils/firebase.admin.ts` | Admin SDK (API routes only) |
| `app/constants/theme.ts` | `COFFEE_PALETTE` color constants |
| `firestore.rules` | Firestore security rules |
