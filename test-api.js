import fetch from 'node-fetch';

const API_KEY = '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';
const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function testApi() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'moonshotai/kimi-k2.5',
                messages: [{ role: 'user', content: 'Say hello!' }],
                max_tokens: 50
            })
        });

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('API Test Failed:', error);
    }
}

testApi();
