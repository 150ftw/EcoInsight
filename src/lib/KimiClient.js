const API_URL = '/v1/chat/completions';
const DEFAULT_MODEL = 'meta/llama-3.1-8b-instruct';

export const streamMessage = async (messages, apiKey, onChunk, options = {}) => {
    const maxRetries = 2;
    let attempt = 0;

    const executeStream = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: options.model || DEFAULT_MODEL,
                    messages: messages,
                    temperature: options.temperature ?? 0.5,
                    top_p: 1,
                    max_tokens: options.max_tokens || 1024,
                    stream: true
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Status: ${response.status}`, errorText);
                
                // If we have retries left and it's a transient-looking error (5xx or 429)
                if (attempt < maxRetries && (response.status >= 500 || response.status === 429)) {
                    attempt++;
                    const delay = 1000 * attempt;
                    console.warn(`[AI Resilience] Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                    return executeStream();
                }

                let msg = `Connection Error (${response.status})`;
                try {
                    const data = JSON.parse(errorText);
                    msg = data.error?.message || msg;
                } catch (e) { }
                throw new Error(msg);
            }
            return response;
        } catch (err) {
            if (attempt < maxRetries) {
                attempt++;
                const delay = 1000 * attempt;
                console.warn(`[AI Resilience] Network error. Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                return executeStream();
            }
            throw err;
        }
    };

    try {
        const response = await executeStream();

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;
                    try {
                        const json = JSON.parse(data);
                        const content = json.choices[0]?.delta?.content;
                        if (content) {
                            onChunk(content);
                            // Optimized institutional-grade streaming delay (20ms)
                            await new Promise(resolve => setTimeout(resolve, 20));
                        }
                    } catch (e) {
                        console.error('Error parsing JSON from stream:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in streamMessage:', error);
        throw error;
    }
};

/**
 * Neural Grounding Utility: Prepares market context to be injected into the system prompt.
 * This ensures the AI has real-time awareness of the data fetched from Search-Sync v7.
 */
export const groundMessageWithData = (messages, marketDataArr) => {
    if (!marketDataArr || marketDataArr.length === 0) return messages;

    const contextPrefix = `[NEURAL GROUNDING: SEARCH-SYNC v7 ACTIVE]\n` +
        `Current context-aware market data:\n` +
        marketDataArr.map(d => 
            `- ${d.name || d.symbol}: Price: ${d.price}, Change: ${d.changePercent}%, Vol: ${d.symbol.includes(':') ? 'NSE/BSE' : 'Global'}`
        ).join('\n') + 
        `\nUse this extremely fresh data in your response. Avoid hallucinating older prices.`;

    // Inject as a system-like instruction at the start of the last user message or as a new system message
    const updatedMessages = [...messages];
    const systemIdx = updatedMessages.findIndex(m => m.role === 'system');
    
    if (systemIdx !== -1) {
        updatedMessages[systemIdx].content += `\n\n${contextPrefix}`;
    } else {
        updatedMessages.unshift({
            role: 'system',
            content: contextPrefix
        });
    }

    return updatedMessages;
};

// Deprecated or for non-streaming usage if needed
export const sendMessage = async (messages, apiKey, options = {}) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: options.model || DEFAULT_MODEL,
                messages: messages,
                temperature: options.temperature ?? 0.5,
                top_p: 1,
                max_tokens: options.max_tokens || 1024,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Status: ${response.status}`, errorText);
            let msg = `Connection Error (${response.status})`;
            try {
                const data = JSON.parse(errorText);
                msg = data.error?.message || msg;
            } catch (e) { }
            throw new Error(msg);
        }

        const data = await response.json();
        return data.choices[0].message;
    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
};
