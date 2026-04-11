# AGENTS.md - Context for Jules

Welcome, Jules! This document provides high-level context for development on the **EcoInsight** project.

## Project Overview
EcoInsight is a high-end Economic Intelligence engine built with React and Vite. It features interactive 3D elements (Three.js), modern glassmorphism UI, and integrated AI chat capabilities.

## Tech Stack
- **Frontend**: React (Vite), Framer Motion, Lucide-React.
- **3D Graphics**: Three.js (@react-three/fiber).
- **Authentication**: Custom JWT-based Authentication with **Supabase** backend. 
- **Database**: Supabase (PostgreSQL).
- **Styling**: Vanilla CSS with a heavy focus on glassmorphism and futuristic aesthetics.

## Key Architectures
- **`App.jsx`**: contains the core logic, state management (chats, settings, appearance), and the primary routing switch (`renderView`).
- **Authentication**: Managed via a custom `AuthProvider` in `src/context/AuthContext.jsx`. We use standard `useUser` and `useAuth` hooks that mimic Clerk-style behavior for compatibility.
- **Backend API**: Serverless functions located in the `api/` directory (Vercel/Node.js).
- **AI Integration**: AI logic is routed through `src/lib/KimiClient.js` for streaming responses.

## Current Priorities
- Ensuring the custom authentication flows (Login, Signup, Google OAuth) are seamless and secure.
- Maintaining the "Elite Analyst" aesthetic in all new components.
- Optimizing Three.js performance for low-end devices.
- Improving real-time market data reliability via the "Search-Sync" architecture.

## Development Patterns
- Use functional components and hooks.
- Maintain global state in `App.jsx` and auth state in `AuthContext.jsx`.
- Keep CSS variables at the root of `src/index.css`.
- All backend-related utilities should be in `api/lib/`.

