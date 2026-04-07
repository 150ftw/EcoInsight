// Real-time web search for EcoInsight chatbot
// Fetches live information from the internet to provide up-to-date answers
// Focuses on Indian market data (₹ INR prices)

/**
 * Constructs an India-focused search query from the user's message.
 * Appends relevant Indian financial context keywords to get INR results.
 */
const buildSearchQuery = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();

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
            query += ' India INR';
        } else {
            query += ' India';
        }
    } else if (isPriceQuery && !/inr|₹|rupee/i.test(userMessage)) {
        // Has India context but no currency specification — add INR
        query += ' INR';
    }

    // Add "2025-2026" or "latest" for freshness for all financial/price queries
    const isTimeSensitive = /current|today|latest|live|now|recent|this week|this month|status/i.test(userMessage);
    
    if ((isPriceQuery || isFinancialQuery) && !isTimeSensitive) {
        query += ' latest 2025 2026 real-time';
    } else if (isTimeSensitive) {
        query += ' real-time 2025';
    }

    return query;
};

/**
 * Determines if a user message would benefit from web search.
 * Returns false for simple greetings, very short messages, or queries
 * that are already well-served by existing stock/market data.
 */
const shouldSearch = (userMessage) => {
    if (!userMessage || userMessage.trim().length < 3) return false;

    const lowerMsg = userMessage.toLowerCase().trim();

    // Skip only the most basic, non-factual greetings and short noise
    const nonFactualStuff = /^(hi|hello|hey|thanks|thank you|ok|okay|bye|goodbye|yes|no|sure|fine)\s*[.!?]*$/i;
    if (nonFactualStuff.test(lowerMsg)) return false;

    // Trigger search for ANY message that isn't just a greeting or short "yes/no"
    // This ensures we always check the web for current facts/prices.
    return true;
};

/**
 * Fetches web search results and formats them as context for the AI.
 * @param {string} userMessage - The user's chat message
 * @returns {string} Formatted context string to inject into the system prompt
 */
export const fetchWebSearchContext = async (userMessage) => {
    if (!shouldSearch(userMessage)) return '';

    try {
        const query = buildSearchQuery(userMessage);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch(`/api/web-search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            console.warn('Web search API returned:', res.status);
            return '';
        }

        const data = await res.json();

        if (!data.results || data.results.length === 0) return '';

        // Format results as context for the AI
        let context = '\n\n--- LIVE WEB SEARCH RESULTS (Real-time Internet Data) ---';
        context += `\nSearch query: "${query}"`;
        context += `\nFetched at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;
        context += '\n';

        for (let i = 0; i < Math.min(data.results.length, 6); i++) {
            const result = data.results[i];
            context += `\n[${i + 1}] ${result.title}`;
            context += `\n    ${result.snippet}`;
            if (result.source) {
                context += `\n    Source: ${result.source}`;
            }
            context += '\n';
        }

        context += '\nCRITICAL INSTRUCTIONS FOR USING WEB SEARCH DATA:';
        context += '\n1. The above search results are LIVE from the internet. Use them as your PRIMARY source of truth for current prices, rates, and facts.';
        context += '\n2. ALWAYS quote prices in ₹ (Indian Rupees). If a source shows USD prices, convert them using the live exchange rate provided in market data, or state "approximately ₹X based on current exchange rates."';
        context += '\n3. NEVER show raw dollar prices without INR conversion. The user is an Indian investor.';
        context += '\n4. Cite the source when referencing specific data points (e.g., "According to [Source Name]...").';
        context += '\n5. If search results conflict with your training data, ALWAYS prefer the search results as they are more recent.';
        context += '\n6. If the search results don\'t directly answer the question, use them as supporting context alongside your knowledge, but clarify what is from live data vs. your training.';
        context += '\n--- END WEB SEARCH RESULTS ---';

        return context;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Web search timed out');
        } else {
            console.warn('Web search failed:', error);
        }
        return '';
    }
};
