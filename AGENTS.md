# AGENTS.md - Context for Jules

Welcome, Jules! This document provides high-level context for development on the **EcoInsight** project.

## Project Overview
EcoInsight is a high-end Economic Intelligence engine built with React and Vite. It features interactive 3D elements (Three.js), modern glassmorphism UI, and integrated AI chat capabilities.

## Tech Stack
- **Frontend**: React (Vite), Framer Motion, Lucide-React.
- **3D Graphics**: Three.js (@react-three/fiber).
- **Authentication**: Clerk (`@clerk/clerk-react`).
- **Styling**: Vanilla CSS with a heavy focus on glassmorphism and futuristic aesthetics.

## Key Architectures
- **`App.jsx`**: contains the core logic, state management (chats, settings, appearance), and the primary routing switch (`renderView`).
- **Authentication**: Managed via `ClerkProvider` in `main.jsx`. We use `useUser` and `useAuth` hooks.
- **AI Integration**: AI logic is routed through `src/lib/KimiClient.js` for streaming responses.

## Current Priorities
- Ensuring Clerk authentication flows are seamless.
- Maintaining the "Elite Analyst" aesthetic in all new components.
- Optimizing Three.js performance for low-end devices.

## Development Patterns
- Use functional components and hooks.
- Maintain the state in `App.jsx` for global concerns (theme, auth, chats).
- Keep CSS variables at the root of `src/index.css`.
