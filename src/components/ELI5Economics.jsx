import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

const ELI5Economics = () => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);

    const suggestions = [
        "What is Quantitative Easing?",
        "Why does the Fed raise rates?",
        "What causes a Recession?",
        "Explain Inflation simply"
    ];

    const handleAsk = (e, presetQuery = null) => {
        if (e) e.preventDefault();
        const finalQuery = presetQuery || query;
        if (!finalQuery.trim()) return;

        if (presetQuery) setQuery(presetQuery);

        setIsSimulating(true);
        setResponse(null);

        setTimeout(() => {
            let title = "Economic Concept Explained";
            let analogy = "Imagine a giant game of Monopoly where the rules keep changing.";
            let breakdown = [
                "The economy is just millions of people buying and selling things.",
                "Money is the oil that keeps the engine running.",
                "When there's too much oil, things slip (inflation). When there's too little, the engine grinds to a halt (recession)."
            ];
            let tldr = "Economics is just the study of how people use limited resources.";

            const q = finalQuery.toLowerCase();
            if (q.includes('inflation')) {
                title = "Understanding Inflation";
                analogy = "Imagine you love a specific $10 pizza. Next year, that exact same pizza costs $12. The pizza didn't get 20% better; your money just got 20% weaker.";
                breakdown = [
                    "Demand-Pull: Too many people want the pizza, so the shop owner raises the price.",
                    "Cost-Push: The cost of cheese and flour goes up, so the shop owner HAS to raise the price.",
                    "Money Supply: The government prints more money, making each dollar less rare and therefore less valuable."
                ];
                tldr = "Inflation is the invisible tax that makes your money buy less stuff over time.";
            } else if (q.includes('rate') || q.includes('fed')) {
                title = "The Fed & Interest Rates";
                analogy = "Interest rates are the 'price of borrowing money'. The Fed is like the bartender at the economy's party.";
                breakdown = [
                    "Raising Rates: The bartender takes away the punch bowl. Borrowing gets expensive. People buy fewer houses and cars. The economy cools down (fights inflation).",
                    "Lowering Rates: The bartender serves free drinks. Borrowing is cheap! People start businesses and buy things. The economy speeds up.",
                    "The Goal: Keep the party going without letting it turn into a crazy riot (hyperinflation) or putting everyone to sleep (recession)."
                ];
                tldr = "The Fed uses interest rates as a gas pedal and brake for the entire economy.";
            } else if (q.includes('recession')) {
                title = "Decoding Recessions";
                analogy = "A recession is when the economy catches a cold and needs to stay in bed to rest.";
                breakdown = [
                    "It usually starts with a shock: a bank fails, a pandemic hits, or a bubble bursts.",
                    "Fear spreads: People stop spending money because they are worried.",
                    "The cycle: Because people aren't spending, businesses make less money. They fire workers. Those fired workers spend even less.",
                    "Recovery: Eventually, prices drop low enough that it becomes a bargain to buy things again, and the cycle reverses."
                ];
                tldr = "A recession is a temporary shrinking of the economy caused by a domino effect of fear and reduced spending.";
            } else if (q.includes('quantitative easing')) {
                title = "Quantitative Easing (QE)";
                analogy = "Imagine the economy is a dried-up plant. QE is the central bank coming in with a massive watering can to flood the soil.";
                breakdown = [
                    "When lowering interest rates to 0% isn't enough to fix the economy, the Fed uses QE.",
                    "The central bank creates money out of thin air digitally.",
                    "They use this newly created money to buy massive amounts of bonds from banks.",
                    "Now banks have tons of cash, forcing them to lend it to people and businesses to get the economy moving again."
                ];
                tldr = "QE is just a fancy way of saying 'the central bank is printing money and injecting it directly into the financial system'.";
            }

            setResponse({ title, analogy, breakdown, tldr });
            setIsSimulating(false);
        }, 1200);
    };

    return (
        <motion.div
            className="pulse-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                zIndex: 5
            }}
        >
            <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
                    <Bot className="text-accent" size={24} /> Explain Like I'm 5 Economics
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                    Jargon-free translations of complex macroeconomic mechanics.
                </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#71717a', display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>Popular:</span>
                {suggestions.map((sug, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAsk(null, sug)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#a1a1aa',
                            fontSize: '0.8rem',
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                            e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                            e.target.style.color = '#a1a1aa';
                        }}
                    >
                        {sug}
                    </button>
                ))}
            </div>

            <form onSubmit={(e) => handleAsk(e)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type an economic term..."
                    style={{
                        flex: 1,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem 1.2rem',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                    }}
                />
                <button
                    type="submit"
                    disabled={isSimulating}
                    className="btn-shine-primary"
                    style={{
                        borderRadius: '12px',
                        padding: '0 1.5rem',
                        cursor: isSimulating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isSimulating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Simplify
                </button>
            </form>

            <AnimatePresence mode="wait">
                {isSimulating ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-primary)', gap: '1rem' }}
                    >
                        <Loader2 size={24} className="animate-spin" />
                        <span className="typing-indicator" style={{ fontSize: '0.9rem' }}>Translating from Wall Street to Main Street...</span>
                    </motion.div>
                ) : response ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            marginTop: '1rem',
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1.2rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Sparkles size={18} className="text-accent" /> {response.title}
                                </h4>
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', borderLeft: '3px solid var(--accent-primary)', padding: '1rem', borderRadius: '0 8px 8px 0', fontSize: '1rem', color: 'white', fontStyle: 'italic' }}>
                                    "{response.analogy}"
                                </div>
                            </div>

                            <div>
                                <h5 style={{ color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.8rem 0' }}>The Breakdown</h5>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#d4d4d8', fontSize: '0.95rem', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {response.breakdown.map((point, i) => (
                                        <li key={i}>{point}</li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: 'white', color: 'black', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '0.05em' }}>TL;DR</div>
                                <span style={{ color: '#10b981', fontWeight: '500', fontSize: '0.95rem' }}>{response.tldr}</span>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    );
};

export default ELI5Economics;
