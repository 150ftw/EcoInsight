const API_URL = '/v1/chat/completions';
const DEFAULT_MODEL = 'meta/llama-3.1-8b-instruct';

export const streamMessage = async (messages, apiKey, onChunk, options = {}) => {
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
            let msg = `Connection Error (${response.status})`;
            try {
                const data = JSON.parse(errorText);
                msg = data.error?.message || msg;
            } catch (e) { }
            throw new Error(msg);
        }

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
                        if (content) onChunk(content);
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
