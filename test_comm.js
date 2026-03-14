
const fetch = require('node-fetch');

async function testYahoo(symbol) {
    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);
        const data = await res.json();
        const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
        console.log(`Yahoo ${symbol}: ${price}`);
    } catch (e) {
        console.log(`Yahoo ${symbol} failed`);
    }
}

async function testGoogle(symbol) {
    // We can't easily reproduce the scraping in a node script without the full logic, 
    // but we can try to find the page content.
    try {
        const res = await fetch(`https://www.google.com/finance/quote/${symbol}`);
        const text = await res.text();
        // Look for the price in the text (very rough)
        const match = text.match(/data-last-price="([^"]+)"/);
        console.log(`Google ${symbol}: ${match ? match[1] : 'not found'}`);
    } catch (e) {
        console.log(`Google ${symbol} failed`);
    }
}

async function run() {
    console.log("Checking Gold Symbols...");
    await testYahoo('GOLD.MCX');
    await testYahoo('GOLDM.MCX');
    await testYahoo('GOLDBEES.NS');
    await testGoogle('GOLD:MCX');
    await testGoogle('GC=F');
    
    console.log("\nChecking Silver Symbols...");
    await testYahoo('SILVER.MCX');
    await testYahoo('SILVERM.MCX');
    await testGoogle('SILVER:MCX');
    await testGoogle('SI=F');
}

run();
