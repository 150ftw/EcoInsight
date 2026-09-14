// SupabaseStorage.js — Data access layer for EcoInsight
// Replaces all localStorage usage with Supabase tables
import { supabase } from './supabase.js';

const DEFAULT_CHAT = {
    id: 'default',
    title: 'New Session',
    messages: [{ role: 'assistant', content: 'Welcome to EcoInsight — your AI-powered Indian market intelligence engine. Ask me about Nifty, Sensex, RBI policy, mutual funds, crypto, or any financial topic.' }]
};

// ============================================================
// CHATS & USER SETTINGS
// ============================================================
// These go through /api/chats and /api/settings (server-side, using the
// authenticated user's JWT cookie) rather than talking to Supabase directly
// from the browser. The RLS policies on these tables were written assuming
// Supabase's own Auth (auth.uid()), which this app doesn't use — it has its
// own JWT cookie auth — so auth.uid() was always null and those policies
// never actually matched anything, leaving the public anon key able to read
// every user's chats and settings. userId is still accepted here to keep the
// existing call sites in App.jsx unchanged, but the server derives the real
// authenticated user from the cookie and ignores it for authorization.

/**
 * Load all chats for a given user. Returns { chats, activeChatId }.
 */
export const loadChats = async (userId) => {
    try {
        const res = await fetch('/api/chats?action=list');
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const { chats, activeChatId } = await res.json();

        if (!chats || chats.length === 0) {
            // No chats found — return defaults
            return { chats: [DEFAULT_CHAT], activeChatId: 'default' };
        }

        return { chats, activeChatId };
    } catch (err) {
        console.error('Failed to load chats:', err);
        return { chats: [DEFAULT_CHAT], activeChatId: 'default' };
    }
};

/**
 * Save all chats for a user (upsert). Marks the active chat.
 */
export const saveChats = async (userId, chats, activeChatId) => {
    try {
        const res = await fetch('/api/chats?action=save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chats, activeChatId })
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    } catch (err) {
        console.error('Failed to save chats:', err);
    }
};

/**
 * Delete a specific chat for a user.
 */
export const deleteChat = async (userId, chatId) => {
    try {
        const res = await fetch('/api/chats?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId })
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    } catch (err) {
        console.error('Failed to delete chat:', err);
    }
};

/**
 * Delete all chats for a user.
 */
export const deleteAllChats = async (userId) => {
    try {
        const res = await fetch('/api/chats?action=delete-all', { method: 'POST' });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    } catch (err) {
        console.error('Failed to clear all chats:', err);
    }
};

// ============================================================
// USER SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
    ai_settings: {
        model: 'openai/gpt-oss-20b',
        style: 'Balanced',
        tone: 'Professional',
        creativity: 0.5,
        maxLength: 'Medium',
        language: 'English'
    },
    chat_settings: {
        history: true,
        autoSave: true,
        autoTitles: true,
        showTimestamps: false
    },
    personalization: {
        callMe: '',
        respondHow: '',
        memory: true,
        watchlist: []
    },
    appearance: {
        theme: 'dark',
        accentColor: '#8b5cf6',
        fontSize: 'Medium',
        compactMode: false
    },
    profile: {
        name: 'Professional Analyst',
        username: '@eco_expert',
        email: 'analyst@ecoinsight.ai',
        avatar: null,
        tier: 'Free',
        onboarded: false,
        welcome_email_sent: false
    }
};

/**
 * Load all settings for a user. Returns the settings object or defaults.
 */
export const loadSettings = async (userId) => {
    try {
        const res = await fetch('/api/settings?action=get');
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const { settings: data } = await res.json();

        if (!data) return { ...DEFAULT_SETTINGS };

        return {
            ai_settings: data.ai_settings || DEFAULT_SETTINGS.ai_settings,
            chat_settings: data.chat_settings || DEFAULT_SETTINGS.chat_settings,
            personalization: data.personalization || DEFAULT_SETTINGS.personalization,
            appearance: data.appearance || DEFAULT_SETTINGS.appearance,
            profile: { ...DEFAULT_SETTINGS.profile, ...(data.profile || {}) },
        };
    } catch (err) {
        console.error('Failed to load settings:', err);
        return { ...DEFAULT_SETTINGS };
    }
};

/**
 * Save all settings for a user (upsert).
 */
export const saveSettings = async (userId, settings) => {
    try {
        const res = await fetch('/api/settings?action=save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ai_settings: settings.ai_settings,
                chat_settings: settings.chat_settings,
                personalization: settings.personalization,
                appearance: settings.appearance,
                profile: settings.profile
            })
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    } catch (err) {
        console.error('Failed to save settings:', err);
    }
};

// ============================================================
// MARKET DATA CACHE
// ============================================================

/**
 * Get cached market data by key. Returns null if expired or not found.
 */
export const getCachedMarketData = async (cacheKey) => {
    try {
        const { data, error } = await supabase
            .from('market_cache')
            .select('data, expires_at')
            .eq('cache_key', cacheKey)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
            return null; // Expired
        }

        return data.data;
    } catch (err) {
        console.error('Failed to read market cache from Supabase:', err);
        return null;
    }
};

/**
 * Get cached market data even if expired (stale fallback).
 */
export const getStaleCachedMarketData = async (cacheKey) => {
    try {
        const { data, error } = await supabase
            .from('market_cache')
            .select('data')
            .eq('cache_key', cacheKey)
            .maybeSingle();

        if (error) throw error;
        return data ? data.data : null;
    } catch (err) {
        return null;
    }
};

/**
 * Set cached market data with a TTL in milliseconds.
 */
export const setCachedMarketData = async (cacheKey, value, ttlMs) => {
    try {
        const expiresAt = new Date(Date.now() + ttlMs).toISOString();

        const { error } = await supabase
            .from('market_cache')
            .upsert({
                cache_key: cacheKey,
                data: value,
                expires_at: expiresAt,
            }, { onConflict: 'cache_key' });

        if (error) throw error;
    } catch (err) {
        console.error('Failed to write market cache to Supabase:', err);
    }
};
