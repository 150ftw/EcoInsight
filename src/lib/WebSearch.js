/**
 * Constructs an India-focused search query from the user's message.
 * Appends relevant Indian financial context keywords to get INR results.
 */
const buildSearchQuery = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();

    // EXCEPTION: If the user is asking about a specific global entity or tech feature (like Apple Login)
    // we should NOT force "INR" or "Market" context which might pollute result quality.
    if (lowerMsg.includes('apple') || lowerMsg.includes('login') || lowerMsg.includes('auth')) {
        return userMessage.trim() + ' 2025 updates';
    }

    // Don't add "India" if the message already mentions it
    const hasIndiaContext = /india|indian|inr|₹|rupee|nse|bse|sensex|nifty|rbi|sebi|mcx/i.test(userMessage);

    // Detect if the query is about prices/costs
    const isPriceQuery = /price|cost|rate|value|worth|nav|how much|kitna|kya hai|current|today|latest|live/i.test(userMessage);

    // Detect financial/market topics
    const isFinancialQuery = /stock|share|mutual fund|sip|gold|silver|crypto|bitcoin|ethereum|bond|fd|deposit|loan|emi|interest rate|repo|inflation|gdp|tax|gst|market|invest|trading|ipo|dividend|eps|pe ratio|return/i.test(userMessage);

    let query = userMessage.trim();

    // Add Indian context if not already present
    if (!hasIndiaContext) {
        if (isPriceQuery || isFinancialQuery) {
            query += ' India Market INR';
        } else {
            query += ' India';
        }
    }

    // Refreshness boost - Focus on the current/near-future 2026 landscape
    query += ' latest 2026 analysis';

    // PEER DISCOVERY AUGMENTATION:
    // If the query is about competitors or peers, force the search to find "Active Survivors"
    if (/peer|competitor|rival|market share|landscape|vs|versus/i.test(userMessage)) {
        query += ' active players 2026 landscape';
    }

    return query;
};

/**
 * Determines if a user message would benefit from web search.
 */
const shouldSearch = (userMessage) => {
    if (!userMessage || userMessage.trim().length < 3) return false;
    const lowerMsg = userMessage.toLowerCase().trim();
    const nonFactualStuff = /^(hi|hello|hey|thanks|thank you|ok|okay|bye|goodbye|yes|no|sure|fine)\s*[.!?]*$/i;
    if (nonFactualStuff.test(lowerMsg)) return false;
    return true;
};

/**
 * Fetches web search results and formats them as context for the AI.
 */
export const fetchWebSearchContext = async (userMessage) => {
    if (!shouldSearch(userMessage)) return { context: '', sources: [] };

    try {
        const query = buildSearchQuery(userMessage);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`/api/web-search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) return { context: '', sources: [] };

        const data = await res.json();
        if (!data.results || data.results.length === 0) return { context: '', sources: [] };

        // RELEVANCE FILTERING:
        // Ensure the results share at least ONE significant keyword with the query.
        const queryKeywords = userMessage.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3)
            .map(w => w.replace(/[^a-z]/g, ''));

        const sources = data.results.slice(0, 6).map(r => ({
            title: r.title,
            url: r.url,
            source: r.source || 'Intelligence Link',
            snippet: r.snippet || ''
        })).filter(r => {
            if (queryKeywords.length === 0) return true; // Fallback for very short queries
            const content = (r.title + ' ' + r.snippet).toLowerCase();
            return queryKeywords.some(kw => content.includes(kw));
        });

        if (sources.length === 0) return { context: '', sources: [] };

        // Format results as context for the AI
        let context = '\n\n--- DYNAMIC INTELLIGENCE FEED (Real-time Context) ---';
        context += `\nSearch query: "${query}"`;
        context += `\nEngine: ${data.source || 'Active Web Search'}`;
        context += '\n';

        sources.forEach((result, i) => {
            context += `\n[${i + 1}] ${result.title}`;
            context += `\n    ${result.snippet}`;
            context += `\n    Source: ${result.source}`;
            context += '\n';
        });

        context += '\nINSTRUCTIONS:';
        context += '\n1. Use these dynamic sources to answer precisely. They are highly relevant to the keywords in the query.';
        context += '\n2. Always favor the latest 2025/2026 data from these sources.';
        context += '\n--- END DYNAMIC FEED ---';

        return { context, sources };
    } catch (error) {
        console.warn('Web search pipeline error:', error);
        return { context: '', sources: [] };
    }
};

