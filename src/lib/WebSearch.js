/**
 * Constructs an India-focused search query from the user's message.
 * Appends relevant financial context keywords to get clean, up-to-date results.
 */
const buildSearchQuery = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();

    // Global tech or non-financial entity exception
    if (lowerMsg.includes('apple') || lowerMsg.includes('login') || lowerMsg.includes('auth') || lowerMsg.includes('oauth')) {
        return userMessage.trim();
    }

    const hasIndiaContext = /india|indian|inr|₹|rupee|nse|bse|sensex|nifty|rbi|sebi|mcx/i.test(userMessage);
    const isPriceQuery = /price|cost|rate|value|worth|nav|how much|kitna|current|today|latest|live/i.test(userMessage);
    const isFinancialQuery = /stock|share|mutual fund|sip|gold|silver|crypto|bitcoin|bond|inflation|gdp|tax|market|invest|trading|ipo|dividend|eps|pe ratio|pe|p\/e|valuation|earnings|results/i.test(userMessage);

    let query = userMessage.trim();

    // Add Indian context if not already present
    if (!hasIndiaContext && (isPriceQuery || isFinancialQuery)) {
        query += ' India';
    }

    // Refreshness boost for current year
    if (!query.includes('2026') && !query.includes('2025')) {
        query += ' 2026';
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
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`/api/web-search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) return { context: '', sources: [] };

        const data = await res.json();
        if (!data.results || data.results.length === 0) return { context: '', sources: [] };

        // RELEVANCE FILTERING
        const queryKeywords = userMessage.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3)
            .map(w => w.replace(/[^a-z0-9]/g, ''));

        const sources = data.results.slice(0, 6).map(r => ({
            title: r.title,
            url: r.url,
            source: r.source || 'Intelligence Link',
            snippet: r.snippet || ''
        })).filter(r => {
            if (queryKeywords.length === 0) return true;
            const content = (r.title + ' ' + r.snippet).toLowerCase();
            return queryKeywords.some(kw => content.includes(kw));
        });

        if (sources.length === 0) return { context: '', sources: [] };

        // Format results as context for the AI
        let context = '\n\n--- DYNAMIC INTELLIGENCE FEED (Live Web Results) ---';
        context += `\nSearch Query: "${query}"`;
        context += `\nEngine: ${data.source || 'EcoInsight Web Intelligence'}`;
        context += '\n';

        sources.forEach((result, i) => {
            context += `\n[${i + 1}] ${result.title}`;
            if (result.snippet) context += `\n    ${result.snippet}`;
            context += `\n    Source: ${result.source}`;
            context += '\n';
        });

        context += '\nINSTRUCTIONS:';
        context += '\n1. Use these dynamic sources to answer precisely with current data.';
        context += '\n2. Always favor the latest verified metrics from these sources.';
        context += '\n--- END DYNAMIC FEED ---';

        return { context, sources };
    } catch (error) {
        console.warn('Web search pipeline error:', error);
        return { context: '', sources: [] };
    }
};
