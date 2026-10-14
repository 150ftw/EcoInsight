import fetch from 'node-fetch';
import { supabase } from './lib/db.js';

/**
 * Provisional FII/FPI and DII cash-market activity for the last trading day,
 * as published by NSE. Values are in ₹ crore. NSE updates this once per
 * evening, so a 30-min cache is plenty fresh.
 */

const NSE_URL = 'https://www.nseindia.com/api/fiidiiTradeReact';
const CACHE_KEY = 'v1_fii_dii_flows';
const TTL_MS = 30 * 60 * 1000;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/reports/fii-dii'
};

const toNumber = (v) => {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

async function fetchFromNse() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(NSE_URL, { headers: HEADERS, signal: controller.signal });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows)) return null;

    const pick = (category) => {
      const row = rows.find(r => String(r.category || '').toUpperCase().startsWith(category));
      if (!row) return null;
      return {
        buy: toNumber(row.buyValue),
        sell: toNumber(row.sellValue),
        net: toNumber(row.netValue),
        date: row.date
      };
    };

    const fii = pick('FII');
    const dii = pick('DII');
    if (!fii || !dii || fii.net === null || dii.net === null) return null;

    return { date: fii.date || dii.date, fii, dii, source: 'NSE (provisional)' };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (supabase) {
    try {
      const { data: cached } = await supabase
        .from('market_cache')
        .select('data, expires_at')
        .eq('cache_key', CACHE_KEY)
        .maybeSingle();
      if (cached?.data && new Date(cached.expires_at) > new Date()) {
        return res.status(200).json(cached.data);
      }
    } catch (e) {
      console.warn('[FII/DII API] Cache lookup failed:', e.message);
    }
  }

  const data = await fetchFromNse();
  if (!data) {
    return res.status(502).json({ error: 'FII/DII data unavailable from NSE' });
  }

  if (supabase) {
    try {
      await supabase
        .from('market_cache')
        .upsert({
          cache_key: CACHE_KEY,
          data,
          expires_at: new Date(Date.now() + TTL_MS).toISOString()
        }, { onConflict: 'cache_key' });
    } catch (e) {
      console.warn('[FII/DII API] Cache save failed:', e.message);
    }
  }

  return res.status(200).json(data);
}
