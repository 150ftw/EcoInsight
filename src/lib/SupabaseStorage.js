// SupabaseStorage.js — Data access layer for EcoInsight
// Replaces all localStorage usage with Supabase tables
import { supabase } from './supabase';

const DEFAULT_CHAT = {
    id: 'default',
    title: 'New Session',
    messages: [{ role: 'assistant', content: 'Welcome to EcoInsight — your AI-powered Indian market intelligence engine. Ask me about Nifty, Sensex, RBI policy, mutual funds, crypto, or any financial topic.' }]
};

// ============================================================
// CHATS
// ============================================================

/**
 * Load all chats for a given user. Returns { chats, activeChatId }.
 */
export const loadChats = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            // No chats found — return defaults
            return { chats: [DEFAULT_CHAT], activeChatId: 'default' };
        }

        const chats = data.map(row => ({
            id: row.id,
            title: row.title,
            messages: row.messages || []
        }));

        const activeRow = data.find(row => row.is_active);
        const activeChatId = activeRow ? activeRow.id : chats[0].id;

        return { chats, activeChatId };
    } catch (err) {
        console.error('Failed to load chats from Supabase:', err);
        return { chats: [DEFAULT_CHAT], activeChatId: 'default' };
    }
};

/**
 * Save all chats for a user (upsert). Marks the active chat.
 */
export const saveChats = async (userId, chats, activeChatId) => {
    try {
        const rows = chats.map(chat => ({
            id: chat.id,
            user_id: userId,
            title: chat.title,
            messages: chat.messages,
            is_active: chat.id === activeChatId
        }));

        const { error } = await supabase
            .from('chats')
            .upsert(rows, { onConflict: 'id,user_id' });

        if (error) throw error;
    } catch (err) {
        console.error('Failed to save chats to Supabase:', err);
    }
};

/**
 * Delete a specific chat for a user.
 */
export const deleteChat = async (userId, chatId) => {
    try {
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId)
            .eq('user_id', userId);

        if (error) throw error;
    } catch (err) {
        console.error('Failed to delete chat from Supabase:', err);
    }
};

/**
 * Delete all chats for a user.
 */
export const deleteAllChats = async (userId) => {
    try {
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    } catch (err) {
        console.error('Failed to clear all chats from Supabase:', err);
    }
};

// ============================================================
// USER SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
    ai_settings: {
        model: 'meta/llama-3.1-8b-instruct',
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
        memory: true
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
        credits: 5,
        lastRechargeDate: new Date().toISOString()
    }
};

/**
 * Load all settings for a user. Returns the settings object or defaults.
 */
export const loadSettings = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;

        if (!data) return { ...DEFAULT_SETTINGS };

        return {
            ai_settings: data.ai_settings || DEFAULT_SETTINGS.ai_settings,
            chat_settings: data.chat_settings || DEFAULT_SETTINGS.chat_settings,
            personalization: data.personalization || DEFAULT_SETTINGS.personalization,
            appearance: data.appearance || DEFAULT_SETTINGS.appearance,
            profile: { ...DEFAULT_SETTINGS.profile, ...(data.profile || {}) },
        };
    } catch (err) {
        console.error('Failed to load settings from Supabase:', err);
        return { ...DEFAULT_SETTINGS };
    }
};

/**
 * Save all settings for a user (upsert).
 */
export const saveSettings = async (userId, settings) => {
    try {
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                ai_settings: settings.ai_settings,
                chat_settings: settings.chat_settings,
                personalization: settings.personalization,
                appearance: settings.appearance,
                profile: settings.profile,
            }, { onConflict: 'user_id' });

        if (error) throw error;
    } catch (err) {
        console.error('Failed to save settings to Supabase:', err);
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
