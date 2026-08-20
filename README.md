# EcoInsight — Institutional-Grade Economic Intelligence Engine

> **Decoding the Pulse of the Global & Indian Economy with Real-Time Neural Grounding and Asymmetric Macro Modeling.**

EcoInsight is a high-performance, institutional-grade Economic Intelligence platform built with React 18, Vite, Three.js, and Supabase PostgreSQL. Designed specifically for financial analysts, economic researchers, fund managers, and investors, EcoInsight combines streaming LLM inference with real-time financial market telemetry (**Search-Sync v7**) to deliver zero-cutoff, zero-hallucination market insights.

---

## 📋 Table of Contents

1. [Executive Summary & Core Value Proposition](#-executive-summary--core-value-proposition)
2. [Key Differentiators vs General LLMs (ChatGPT)](#-key-differentiators-vs-general-llms-chatgpt)
3. [Full Technical Stack](#-full-technical-stack)
4. [Architecture & System Design](#-architecture--system-design)
5. [Real-Time Telemetry: Search-Sync v7](#-real-time-telemetry-search-sync-v7)
6. [Database Schema & Row Level Security (RLS)](#-database-schema--row-level-security-rls)
7. [API Endpoints & Serverless Microservices](#-api-endpoints--serverless-microservices)
8. [Directory & Component Map](#-directory--component-map)
9. [Feature Matrix & Interactive Analytical Modules](#-feature-matrix--interactive-analytical-modules)
10. [Environment Configuration & Variables](#-environment-configuration--variables)
11. [Installation & Development Guide](#-installation--development-guide)
12. [Security & Performance Optimization](#-security--performance-optimization)

---

## 🌐 Executive Summary & Core Value Proposition

General-purpose Large Language Models (LLMs) suffer from fixed knowledge cutoff dates, frequent pricing hallucinations, and lack of specialized domain context for complex financial structures—especially within Indian (Bharat) and global macroeconomic frameworks. 

**EcoInsight** bridges this gap by unifying:
- **Neural Grounding (Search-Sync v7)**: Real-time context injection from live exchange feeds (NSE, BSE, global stock tickers, forex, commodities).
- **Asymmetric Risk Modeling**: Interactive macro simulators, option chain stress-testing, and FII/DII flow breakdown.
- **Elite Analyst UI**: Futuristic glassmorphism aesthetics, dynamic 3D visualizations using Three.js/WebGL, and interactive financial charting.
- **Intelligence Provenance**: Full auditability with inline citations, verified source cards, and structured JSON reporting.

---

## ⚡ Key Differentiators vs General LLMs (ChatGPT)

| Feature | ChatGPT / General LLMs | EcoInsight Engine |
| :--- | :--- | :--- |
| **Market Data Freshness** | Cutoff dependent or slow generic web browsing | **Search-Sync v7**: Sub-second ticker latency for Nifty 50, Sensex & Global quotes |
| **Price Accuracy** | Susceptible to price/numerical hallucinations | **Neural Grounding**: System prompts injected with verified real-time cache data |
| **Regional Depth** | General global knowledge | **Bharat-Centric Focus**: Deep comprehension of Indian taxation, FII/DII, RBI policies |
| **Analytical Tools** | Plain-text chat only | **Integrated Workspace**: Built-in Recharts, Portfolio Stress Testing, What-If Simulators |
| **Audit Provenance** | Unverified source claims | **Source Provenance Cards**: Tracked data origins for institutional accountability |
| **User Interface** | Standard text list interface | **Elite Analyst Canvas**: Glassmorphism UI, 3D WebGL scenes, Command Palette (`Ctrl+K`) |

---

## 🛠️ Full Technical Stack

### Frontend Core
- **Framework**: React 18.3.1 (Vite 5.4.2 build tool)
- **3D / Graphics**: Three.js 0.183.1, `@react-three/fiber` 8.18.0, OGL 1.0.11
- **Animations**: Framer Motion 11.5.4
- **Visualization**: Recharts 3.8.0, HTML2Canvas 1.4.1, JsPDF 4.2.0, PDF.js 3.11.174
- **Icons**: Lucide React 0.439.0
- **Markdown Processing**: React Markdown 10.1.0

### Backend & API Middleware
- **Deployment Platform**: Vercel Serverless Functions (`/api/*` endpoints)
- **Database Client**: `@supabase/supabase-js` 2.99.0 (PostgreSQL engine)
- **Authentication & Security**: Custom JWT (`jsonwebtoken` 9.0.2), `bcryptjs` 2.4.3, Passport Google OAuth2 (`passport-google-oauth20` 2.0.0), Cookie management (`cookie` 0.6.0)
- **Email Dispatch**: Resend SDK (`resend` 6.9.3)
- **HTTP Client**: Axios 1.7.7, Node-Fetch 3.3.2

---

## 🏗️ Architecture & System Design

```
                     ┌──────────────────────────────────────────────┐
                     │          EcoInsight Client (React)           │
                     │  - Custom AuthProvider (State & JWT Sync)    │
                     │  - Glassmorphic UI & Three.js Canvas         │
                     │  - KimiClient (Streaming AI Runner)          │
                     └──────┬────────────────────┬──────────────────┘
                            │                    │
             HTTP / API     │                    │  Direct Proxies / v1
      (Vercel Microservices)│                    │  (Vite Proxy Server)
                            ▼                    ▼
             ┌──────────────────────┐    ┌──────────────────────────────────┐
             │   Serverless API     │    │        API Gateway Proxies       │
             │                      │    │                                  │
             │ - /api/auth          │    │ - /v1 (NVIDIA AI Endpoint)        │
             │ - /api/ticker        │    │ - /yahoo-finance (Stock Telemetry)│
             │ - /api/web-search    │    │ - /google-finance (Quotes)       │
             │ - /api/send-welcome  │    │ - /exchange-rates (Forex API)     │
             └──────────┬───────────┘    └──────────────────────────────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │ Supabase PostgreSQL  │
             │ - RLS Security       │
             │ - Users & Settings   │
             │ - Chats & Telemetry  │
             └──────────────────────┘
```

---

## 📡 Real-Time Telemetry: Search-Sync v7

The **Search-Sync v7** pipeline feeds live context into LLM system prompts prior to generating responses.

1. **Exchange Rates**: `/exchange-rates/v4/latest/USD` fetches live USD/INR, EUR/INR, GBP/INR, USD/JPY currency pairs.
2. **Indian Market Indices**: `/yahoo-finance/v8/finance/chart/^NSEI` and `^BSESN` retrieve Nifty 50 and Sensex quotes.
3. **Commodity Tracking**: Real-time futures pricing for Gold (`GC=F`), Silver (`SI=F`), Crude Oil (`CL=F`), and Natural Gas (`NG=F`).
4. **Header Stripping & Proxy Bypass**: Custom server headers in `vite.config.js` avoid rate-limiting (`429`) by forging browser User-Agents and origin headers.
5. **Fallback Cascade**: Direct symbol mapping falls back to Alpha Vantage API (`VITE_ALPHA_VANTAGE_API_KEY`).

---

## 🗄️ Database Schema & Row Level Security (RLS)

EcoInsight utilizes a Supabase PostgreSQL database structured as follows:

```sql
-- 1. USERS TABLE
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    password_hash TEXT,
    profile_image TEXT,
    provider TEXT DEFAULT 'password', -- 'password', 'google', 'apple'
    provider_id TEXT,
    onboarded BOOLEAN DEFAULT false,
    credits INTEGER DEFAULT 100,
    reset_token TEXT,
    reset_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER SETTINGS TABLE (JSONB Configuration)
CREATE TABLE public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    ai_settings JSONB,      -- Model preference, temperature, tone, style
    chat_settings JSONB,    -- History enable, auto-titles, timestamps
    personalization JSONB,  -- Custom user preferences, watchlists
    appearance JSONB,       -- Theme, accent color, font size
    profile JSONB           -- Email notifications metadata
);

-- 3. CHATS TABLE
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Session',
    messages JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MARKET DATA CACHE TABLE
CREATE TABLE public.market_cache (
    cache_key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security (RLS)
- `users`: Accessible and modifiable only by the authenticated owner (`auth.uid() = id`).
- `chats` & `user_settings`: Restricted via FK cascades to the matching `user_id`.
- `market_cache`: Read access granted to all clients (`true`), write operations restricted to the Supabase Service Role key inside backend handlers.

---

## 🔌 API Endpoints & Serverless Microservices

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth?action=signup` | `POST` | Registers a new user with hashed passwords (`bcryptjs`). |
| `/api/auth?action=login` | `POST` | Validates credentials and returns an HTTP-only JWT auth cookie. |
| `/api/auth?action=me` | `GET` | Decodes JWT cookie to fetch current authenticated user profile. |
| `/api/auth?action=google` | `GET` | Initiates Google OAuth2 authentication flow. |
| `/api/auth?action=logout` | `POST` | Clears authentication cookies and terminates user session. |
| `/api/ticker` | `GET` | Relays real-time stock/index quotes from financial telemetry proxies. |
| `/api/web-search` | `POST` | Serverless web search handler for AI factual verification. |
| `/api/send-welcome` | `POST` | Dispatches HTML onboarding welcome emails via Resend. |

---

## 📁 Directory & Component Map

```
EcoInsight/
├── api/                        # Serverless API Microservices (Node.js/Vercel)
│   ├── auth.js                 # Authentication logic (Signup, Login, OAuth, Passwords)
│   ├── health.js               # API Health Check Endpoint
│   ├── send-welcome.js         # Resend Email Integration
│   ├── ticker.js               # Ticker Relay API
│   ├── web-search.js           # Grounded Web Search Handler
│   └── lib/                    # Shared Backend Utilities
│       ├── auth-util.js        # JWT Sign/Verify Functions
│       └── db.js               # Supabase Service Role Client
├── public/                     # Static Web Assets & Favicons
├── src/                        # Main Application Codebase
│   ├── App.jsx                 # Core State Engine, Router & Primary Layout (~289KB)
│   ├── main.jsx                # Application React Root Entrypoint
│   ├── index.css               # Design Tokens, Glassmorphism & Brutalism CSS (~226KB)
│   ├── components/             # React Component Library (33 Modular Components)
│   │   ├── AIEconomicPulse.jsx          # Live AI sentiment analysis stream
│   │   ├── AccountSettingsModal.jsx     # User settings modal
│   │   ├── AuthModal.jsx                # Login / Signup / OAuth Dialog
│   │   ├── CommandPalette.jsx           # Keyboard shortcut palette (Ctrl+K)
│   │   ├── EcoCharts.jsx                # Financial Recharts visualizer
│   │   ├── ELI5Economics.jsx            # Simplified economic concept explainer
│   │   ├── FiiDiiAnalyzer.jsx           # Foreign/Domestic Institutional Investment tracker
│   │   ├── InitializationTerminal.jsx   # Boot-up visual sequence
│   │   ├── InstitutionalVoicePlayer.jsx # Audio text-to-speech engine
│   │   ├── LandingPage.jsx              # Landing page marketing UI (~50KB)
│   │   ├── LiveMarketDashboard.jsx      # Real-time stock telemetry board (~31KB)
│   │   ├── MarketPulseDashboard.jsx     # Macro pulse indicators
│   │   ├── ModelSelector.jsx            # Performance switcher (Eco vs High Fidelity)
│   │   ├── PortfolioAnalyzer.jsx        # Risk assessment stress testing tool
│   │   ├── SentimentGauge.jsx           # WebGL/Three.js interactive gauge
│   │   ├── SentinelMatrix.jsx           # System monitoring matrix
│   │   └── WhatIfSimulator.jsx          # Policy scenario simulator
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context provider & Clerk-compatibility hook
│   └── lib/
│       ├── DashboardData.js    # Mock financial datasets & metrics
│       ├── EmailService.js     # Client email helper
│       ├── KimiClient.js       # NVIDIA streaming LLM inference client
│       ├── MarketData.js       # Search-Sync v7 multi-source financial fetcher (~39KB)
│       ├── MarketNarratives.js # Automated narrative builder
│       ├── SupabaseStorage.js  # Chat history & settings database storage interface
│       └── supabase.js         # Supabase client instantiation
├── supabase/
│   ├── README_DATABASE.md      # Database setup manual
│   └── schema.sql              # PostgreSQL DDL tables, indexes & RLS policies
├── vercel.json                 # Security headers, rewrites & route configurations
└── vite.config.js              # Custom API proxy middleware & Vite build settings
```

---

## 🎨 Feature Matrix & Interactive Analytical Modules

1. **High Fidelity / Eco Mode Switcher**:
   - *High Fidelity*: Uses full neural synthesis (`meta/llama-3.1-8b-instruct`) for high analytical depth.
   - *Eco Mode*: Fast bypass optimized for low latency queries and lightweight mobile devices.
2. **Interactive Financial Charting (`EcoCharts.jsx`)**:
   - Time-series charts for indices, option chains, volume analysis, and historical stock trends.
3. **What-If Macro Policy Simulator (`WhatIfSimulator.jsx`)**:
   - Models economic outcomes based on interest rate shifts, tax revisions, tariff adjustments, and inflation spikes.
4. **FII / DII Institutional Flow Tracker (`FiiDiiAnalyzer.jsx`)**:
   - Tracks capital inflow/outflow metrics across Indian domestic and foreign institutional investors.
5. **Portfolio Risk Stress-Tester (`PortfolioAnalyzer.jsx`)**:
   - Evaluates portfolio vulnerability against market shocks and sector concentration.
6. **Command Palette (`CommandPalette.jsx`)**:
   - `Ctrl+K` or `Cmd+K` global command search for navigation, switching views, clearing history, and quick metrics lookup.
7. **Institutional Voice Player (`InstitutionalVoicePlayer.jsx`)**:
   - Speech synthesis for executive briefing audio playback.

---

## 🔑 Environment Configuration & Variables

To configure local development or production deployment, set up a `.env.local` file based on `.env.example`:

```bash
# --- SUPABASE CONFIGURATION (Database & Auth) ---
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# --- SEARCH-SYNC v7 API KEYS ---
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

# --- EMAIL DISPATCH (Resend) ---
VITE_RESEND_API_KEY=re_your_resend_api_key

# --- CUSTOM AUTHENTICATION & OAUTH ---
JWT_SECRET=your-32-character-secure-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_ID_CLIENT_ID=com.your.app.bundle

# --- DEPLOYMENT TELEMETRY ---
VITE_APP_URL=http://localhost:5173
VITE_GA_ID=G-XXXXXXXXXX
```

> **Development Mode Note**: On `localhost`, `AuthContext` automatically activates a local development mock user (`dev@ecoinsight.online`), enabling full offline component testing without needing immediate Supabase setup.

---

## 📦 Installation & Development Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/EcoInsight.git
   cd EcoInsight
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5173`. Vite's custom `apiServerPlugin` will automatically route `/api/*` calls locally.

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 🛡️ Security & Performance Optimization

- **Security Headers (`vercel.json`)**: Enforces strict `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **JWT Protection**: Passwords hashed with `bcryptjs` using a salt factor of 10. JWT tokens signed with HMAC SHA-256 and stored in secure cookies.
- **Three.js Graphic Fallbacks**: Canvas rendering gracefully scales down on low-end devices via `ModelSelector`'s performance mode.
- **Proxy Rate-Limit Mitigation**: Header spoofing in Vite dev server and Vercel routing ensures financial API queries return cleanly without CORS or 429 throttle blocks.

---

<p center>
  <b>EcoInsight</b> — Developed by <i>Shivam Sharma</i><br/>
  <i>Decoding the Pulse of the Global Economy.</i>
</p>
