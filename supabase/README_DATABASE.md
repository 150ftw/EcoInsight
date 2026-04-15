# EcoInsight Database Setup Guide

This guide explains how to initialize your Supabase instance to support the EcoInsight Economic Intelligence Engine.

## Prerequisites

1.  A [Supabase](https://supabase.com/) project.
2.  Your Supabase **URL**, **Anon Key**, and **Service Role Key** (found in Project Settings > API).

## Initial Setup

### 1. Run the Schema Script
1.  In your Supabase Dashboard, navigate to the **SQL Editor**.
2.  Create a **New Query**.
3.  Copy the contents of [supabase/schema.sql](./schema.sql) and paste them into the editor.
4.  Click **Run**.
5.  Check that the following tables appear in the **Table Editor**:
    - `users`
    - `user_settings`
    - `chats`
    - `market_cache`

### 2. Configure Environment Variables
Ensure your `.env.local` contains the following keys:

```bash
# SUPABASE CONFIG
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # CRITICAL for Search-Sync v7
```

## Security Note (RLS)

The `schema.sql` script enables **Row Level Security (RLS)** by default. 

- **Frontend Access**: When users log in via the app, they use the `Anon Key`. RLS ensures they can only see their own chats and settings.
- **Backend Access**: Our serverless functions (like `api/ticker.js` and `api/auth/[action].js`) use the `Service Role Key`. This key **bypasses RLS**, allowing the backend to manage user records and the global market cache efficiently.

> [!CAUTION]
> NEVER expose the `SUPABASE_SERVICE_ROLE_KEY` in your frontend code (e.g., in a `.env` file that gets bundled with Vite without the `VITE_` prefix). Our architecture keeps it strictly in the `api/` layer for security.

## Troubleshooting

- **Schema Mismatch**: If you update the table structure, remember to update the corresponding models in `src/lib/SupabaseStorage.js`.
- **Role Permissions**: Ensure that the `service_role` has `INSERT/UPDATE` permissions on the `market_cache` table (this is the default in Supabase).
