/**
 * Institutional Narrative Engine (v1.0)
 * Provides dynamic, data-driven templates for Market Pulse and Intelligence Hub.
 */

export const THEMES = {
    BULLISH: [
        {
            title: "India's Market Alpha: {ticker} Leads Structural Breakout.",
            desc: "Institutional telemetry indicates a high-conviction rotation into {sector} bluechips. With Nifty breath expanding, {ticker} is emerging as the primary alpha vector for this leg of the rally."
        },
        {
            title: "Macro-Resilience Unleashed: Capex Cycle Driving Demand.",
            desc: "The domestic macro-narrative has pivoted toward industrial expansion. Our desks are observing aggressive accumulation in capital goods and base metal proxies."
        },
        {
            title: "Digital Bharat Multiplier: Tech Bluechips Signalling Recovery.",
            desc: "After a period of consolidation, the IT and Digital services vertical is exhibiting positive technical divergence. Relative strength in {ticker} suggests bottoming is complete."
        }
    ],
    BEARISH: [
        {
            title: "Tactical De-Risking: Global Headwinds Forcing Consolidation.",
            desc: "As global rate uncertainty persists, institutional desks are increasing cash levels. We observe a defensive shift toward low-beta consumer staples and pharma."
        },
        {
            title: "Capital Preservation Priority: Nifty Floors Under Pressure.",
            desc: "Technical indicators suggest an over-extended primary trend. We advocate for a 'Wait & Watch' protocol until structural support levels are re-tested."
        },
        {
            title: "Currency Volatility Impact: Importers Under Institutional Surveillance.",
            desc: "The current INR-USD trajectory is creating margin headwinds for specific sectors. Diversification into export-oriented themes is recommended for risk mitigation."
        }
    ],
    NEUTRAL: [
        {
            title: "Sectoral Rotation Phase: Index Flat, Dynamics Aggressive.",
            desc: "While the headline indices remain range-bound, the internal churn is significant. Value-migration is visible from over-heated mid-caps back to large-cap stability."
        },
        {
            title: "Accumulation Zone: Identifying Quality Amidst Market Noise.",
            desc: "Institutional telemetry indicates a healthy 'time-correction.' This phase is historically conducive for building core positions in structural long-term themes."
        }
    ]
};

export const PULSE_ALERTS = [
    "Significant block deal activity detected in Large-cap Banking sector. PCR at {pcr} suggests cautious optimism.",
    "Institutional 'Buy-on-Dips' pattern visible near 20-EMA. Sectoral rotation is accelerating into IT and Auto.",
    "Derivative data suggests a short-covering rally in PSU Banks. Watch Nifty {ticker} for technical confirmation.",
    "Global volatility dampening. Relative strength in India bluechips persists amidst emerging market de-risking."
];

export const VIX_SUMMARIES = {
    LOW: "India VIX is tracking below historical averages, indicating low near-term hedging demand and high market resilience.",
    MID: "India VIX is exhibiting moderate contraction. Market expectation of near-term consolidation is high.",
    HIGH: "High VIX levels detected. Institutional desks are deploying protective put spreads. Capital preservation is priority."
};

export const ANALYST_QUOTES = [
    {
        name: "Arjun Mehta",
        role: "Head of Strategy",
        quote: "We are pivoting our focus toward cash-flow resilient large-caps. The 'growth at any price' era is pausing, making room for value-conscious institutional positioning."
    },
    {
        name: "Sanya Iyer",
        role: "Chief Economist",
        quote: "Domestic macro-indicators remain the anchor of the Indian story. Despite global froth, the credit growth trajectory in Bharat remains fundamentally robust."
    },
    {
        name: "Vikram Sethi",
        role: "Lead Technical Analyst",
        quote: "The current index consolidation is a precursor to a higher-low formation. We are monitoring the 20-day EMA closely for structural trend confirmation."
    },
    {
        name: "Nandini Rao",
        role: "Director, Institutional Desk",
        quote: "Sectoral rotation is the name of the game right now. Don't be fooled by the flat index; the underlying alpha in specific niches is reaching multi-year highs."
    }
];

/**
 * Deterministically picks a theme based on market pulse and day of year.
 */
export const getDynamicNarrative = (pulseScore, dayOfYear, vixScore = 12) => {
    let category = THEMES.NEUTRAL;
    if (pulseScore > 65) category = THEMES.BULLISH;
    if (pulseScore < 40) category = THEMES.BEARISH;

    const themeIndex = dayOfYear % category.length;
    const quoteIndex = dayOfYear % ANALYST_QUOTES.length;
    const alertIndex = dayOfYear % PULSE_ALERTS.length;

    let vixLevel = "LOW";
    if (vixScore > 18) vixLevel = "HIGH";
    else if (vixScore > 15) vixLevel = "MID";

    return {
        hero: category[themeIndex],
        desk: ANALYST_QUOTES[quoteIndex],
        alert: PULSE_ALERTS[alertIndex],
        vixSummary: VIX_SUMMARIES[vixLevel]
    };
};
