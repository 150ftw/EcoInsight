import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Sparkles, User, Bot, History, Settings, LogOut, Loader2, Copy, RefreshCw, 
    BarChart3, TrendingUp, Globe, Lightbulb, Camera, Trash2, Key, ChevronDown, 
    Monitor, Laptop, Smartphone, Moon, Sun, Palette, Type, Maximize2, ShieldCheck, 
    Lock, Zap, BookOpen, LifeBuoy, Terminal, Cpu, Layers, HardDrive, Activity, 
    FilePlus, Info, Download, Menu, X, Star, Check, AlertCircle, AlertTriangle, 
    Save, MessageCircle, ExternalLink, PieChart, ArrowLeft 
} from 'lucide-react';
import { useUser, useAuth } from '../context/AuthContext';
import Threads from './Threads';
import UserAccountMenu from './UserAccountMenu';
import MarketTicker from './MarketTicker';

const EkoSparkle = ({ size = 24, className = "", animate = false, cinematic = false }) => {
    const id = useId();
    const gradientId = `eko_gradient_${id.replace(/:/g, '')}`;
    
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id={gradientId} x1="2" y1="21.02" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1a1a1a" />
                    <stop offset="0.4" stopColor="#6d28d9" />
                    <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
            </defs>
            <motion.path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="transparent"
                stroke={cinematic ? `url(#${gradientId})` : "rgba(255,255,255,0.4)"}
                strokeWidth={animate ? (cinematic ? "1" : "0.5") : "0"}
                initial={animate ? { pathLength: 0, opacity: 0 } : {}}
                animate={animate ? { pathLength: 1, opacity: 1 } : {}}
                transition={animate ? { duration: cinematic ? 2.5 : 1.2, ease: "easeInOut" } : {}}
            />
            <motion.path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={`url(#${gradientId})`}
                initial={animate ? { opacity: 0 } : {}}
                animate={animate ? { opacity: 1 } : {}}
                transition={animate ? { duration: 0.8, delay: cinematic ? 2.5 : 0.4, ease: "easeIn" } : {}}
            />
        </svg>
    );
};

const EcoInsightLogo = ({ size = 24, className = "" }) => {
    const id = useId();
    const gradientId = `logoGradientMain-${id.replace(/:/g, '')}`;
    const filterId = `logoGlowEffect-${id.replace(/:/g, '')}`;

    return (
        <div style={{ width: size, height: size }} className={`logo-interactive-container ${className}`}>
            <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-primary)" />
                        <stop offset="100%" stopColor="var(--accent-secondary)" />
                    </linearGradient>
                    <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <rect x="40" y="40" width="432" height="432" rx="80" fill="rgba(10, 10, 12, 0.8)" stroke={`url(#${gradientId})`} strokeWidth="8" opacity="0.8" style={{ filter: `url(#${filterId})` }} />
                {[
                    { x: 120, y: 300, h: 120, op: 0.4 },
                    { x: 170, y: 260, h: 160, op: 0.6 },
                    { x: 220, y: 220, h: 200, op: 0.8 },
                    { x: 270, y: 180, h: 240, op: 1.0 }
                ].map((bar, i) => (
                    <rect key={`bar-${i}`} x={bar.x} y={bar.y} width="30" height={bar.h} rx="4" fill={`url(#${gradientId})`} opacity={bar.op} />
                ))}
                <path d="M120 380 L220 280 L280 320 L400 150 M370 150 L400 150 L400 180" stroke="#fff" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                {[
                    { cx: 200, cy: 180, r: 15 },
                    { cx: 260, cy: 140, r: 22 },
                    { cx: 320, cy: 200, r: 15 },
                    { cx: 240, cy: 220, r: 12 }
                ].map((node, i) => (
                    <circle key={`node-${i}`} cx={node.cx} cy={node.cy} r={node.r} fill="#fff" />
                ))}
                <g stroke="#fff" strokeWidth="4" opacity="0.3">
                    <line x1="200" y1="180" x2="260" y2="140" />
                    <line x1="260" y1="140" x2="320" y2="200" />
                    <line x1="200" y1="180" x2="240" y2="220" />
                    <line x1="260" y1="140" x2="240" y2="220" />
                    <line x1="320" y1="200" x2="240" y2="220" />
                </g>
            </svg>
        </div>
    );
};

const Magnetic = ({ children }) => children;

const useInView = (ref, options) => {
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, options);
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, options]);
    return isInView;
};

const CountUp = ({ to, duration = 2 }) => {
    const [count, setCount] = useState(0);
    const nodeRef = useRef(null);
    const isInView = useInView(nodeRef, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = parseInt(to);
            if (start === end) return;
            let totalMiliseconds = duration * 1000;
            let incrementTime = (totalMiliseconds / end);
            let timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start === end) clearInterval(timer);
            }, incrementTime);
            return () => clearInterval(timer);
        }
    }, [isInView, to, duration]);

    return <span ref={nodeRef}>{count.toLocaleString()}</span>;
};

const PerspectiveSection = ({ children, id, className }) => (
    <section id={id} className={className}>{children}</section>
);

const PartnerMarquee = () => {
    const partners = ["NSE India", "BSE", "SEBI", "Reliance", "Tata Group", "HDFC Bank", "ICICI Bank", "SBI", "NIFTY 50", "Mint", "Moneycontrol", "Bloomberg"];
    return (
        <div className="partner-marquee">
            <div className="marquee-content">
                {[...partners, ...partners].map((p, i) => (
                    <span key={i} className="partner-text">{p}</span>
                ))}
            </div>
        </div>
    );
};

const TiltCard = ({ children, className, ...props }) => (
    <div className={className} {...props}>{children}</div>
);

const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

const PremiumComputeCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [nodes, setNodes] = useState(340);

    useEffect(() => {
        if (!isHovered) {
            setNodes(340);
            return;
        }
        const interval = setInterval(() => {
            const variance = Math.floor(Math.random() * 21) - 10;
            setNodes(4096 + variance);
        }, 150);
        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <TiltCard className="bento-item bento-1" style={{ padding: 0 }}>
            <div className="premium-compute-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div className="compute-grid-bg" />
                <div className="premium-compute-content">
                    <div className="compute-icon-container" style={{ marginBottom: '2rem' }}>
                        <Zap size={26} className={isHovered ? 'text-orange' : ''} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Neural Inference Engine</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Dynamic micro-clusters that scale to zero. Overclocked silicon explicitly reserved for high-volatility financial modeling.
                    </p>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <motion.span key={isHovered ? 'active' : 'idle'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '3.5rem', fontWeight: 800, color: isHovered ? '#f97316' : '#e2e8f0', letterSpacing: '-2px' }}>{nodes.toLocaleString()}</motion.span>
                            <span style={{ fontSize: '1.2rem', color: '#71717a', fontWeight: 600 }}>NODES</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHovered ? '#f97316' : '#3b82f6', boxShadow: isHovered ? '0 0 12px #f97316' : 'none' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', color: isHovered ? '#f97316' : '#3b82f6', textTransform: 'uppercase' }}>{isHovered ? 'MAXIMUM OVERDRIVE' : 'IDLE STATE'}</span>
                        </div>
                        <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                            {isHovered ? (
                                [...Array(14)].map((_, i) => (
                                    <motion.div key={`eq-${i}`} initial={{ height: '20%' }} animate={{ height: [`20%`, `${Math.random() * 80 + 20}%`, `20%`] }} transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, ease: 'easeInOut' }} style={{ width: '8px', background: 'linear-gradient(to top, #ea580c, #fcd34d)', borderRadius: '2px', boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} />
                                ))
                            ) : (
                                [...Array(10)].map((_, i) => (
                                    <div key={`dot-${i}`} style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(59, 130, 246, 0.3)', margin: '0 3px' }} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
};

const DataDynamicsCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <TiltCard className="bento-item">
            <div className="data-dynamics-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div className="network-bg" />
                <div className="premium-compute-content">
                    <div className="globe-icon-container" style={{ marginBottom: '2rem' }}>
                        <Globe size={26} className={isHovered ? 'text-emerald' : ''} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Macro Dynamics</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Trace macroeconomic events to their fiscal impact on India instantly. The Bharat economy is always in focus.
                    </p>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHovered ? '#10b981' : '#3f3f46', boxShadow: isHovered ? '0 0 12px #10b981' : 'none' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: isHovered ? '#10b981' : '#a1a1aa', textTransform: 'uppercase' }}>{isHovered ? 'LIVE TELEMETRY INGEST' : 'STANDBY'}</span>
                        </div>
                        <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            {isHovered && <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, #10b981, transparent)', boxShadow: '0 0 10px #10b981' }} />}
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
};

const PolicySimulationCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <TiltCard className="bento-item">
            <div className="policy-sim-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div className="tilt-mesh-bg" />
                <div className="premium-compute-content">
                    <div className="prism-icon-container" style={{ marginBottom: '2rem' }}>
                        <Layers size={26} className={isHovered ? 'text-purple' : ''} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Policy Simulations</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Model interest rate shifts or tax alterations across diverse portfolios in completely isolated sandbox environments.
                    </p>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#71717a', letterSpacing: '1px', fontWeight: 700 }}>SCENARIOS</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isHovered ? '#a78bfa' : '#e2e8f0', transition: 'color 0.3s' }}>1.4M</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: '#71717a', letterSpacing: '1px', fontWeight: 700 }}>CONFIDENCE</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isHovered ? '#a78bfa' : '#e2e8f0', transition: 'color 0.3s' }}>99.2%</span>
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
};

const NeuralAnalystCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    const mockTerminal = `> init_neural_core()\n[OK] Core loaded.\n> attach_market_feed(wss://nyse)\n[OK] Stream connected.\n> execute_extrapolation(window="1m")\nAnalyzing 43,219 parameters...\nAnomaly detected in tech sector\n> synthesize_report()\nGenerating...`;
    return (
        <TiltCard className="bento-item bento-4">
            <div className="neural-analyst-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div className="terminal-scroll-bg">{mockTerminal}<br /><br />{mockTerminal}<br /><br />{mockTerminal}</div>
                <div className="premium-compute-content">
                    <div className="bot-icon-container" style={{ marginBottom: '2rem' }}>
                        <Bot size={26} className={isHovered ? 'text-sky' : ''} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>The Neural Analyst</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        A 24/7 technical partner that never misses a market beat. Drop in any ticker, region, or policy for an instant deep dive.
                    </p>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHovered ? '#38bdf8' : '#3f3f46', boxShadow: isHovered ? '0 0 12px #38bdf8' : 'none' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: isHovered ? '#38bdf8' : '#a1a1aa', fontFamily: 'var(--font-mono)' }}>{isHovered ? 'AWAITING QUERY_' : 'SLEEP'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
};

const REVIEWS = [
    { id: 1, name: "Arjun Mehta", role: "Senior Portfolio Manager", rating: 5, content: "EcoInsight has become my primary tool for macroeconomic synthesis in the Indian market. The ELI5 feature is surprisingly robust for quick mental models.", verified: true },
    { id: 2, name: "Sneha Kapoor", role: "Financial Analyst, HDFC", rating: 5, content: "The level of depth in the predictive simulations for Nifty 50 is unlike anything I've seen. It saves me about 4 hours every week on sectoral analysis.", verified: true },
    { id: 3, name: "Vikram Singh", role: "Hedge Fund Consultant", rating: 3, content: "Initially had some issues with the real-time data latency in the Pulse dashboard during high-volatility hours on NSE. It made it difficult to rely on for intra-day snapshots.", response: "We have resolved this issue by upgrading our data ingestion pipelines to 50ms polling. Thank you for letting us know! — shivam@ecoinsight.online", verified: true },
    { id: 4, name: "Priyanka Sharma", role: "Economic Academic", rating: 5, content: "Extremely intuitive interface. The glassmorphism design isn't just eye candy; it actually helps in focusing on the Bharat data hierarchies.", verified: true },
    { id: 5, name: "Rahul Varma", role: "Private Equity Associate", rating: 4, content: "Great tool overall. The Simulator is powerful, though I'd love to see more granular fiscal policy levers for the Indian startup ecosystem.", verified: true },
    { id: 6, name: "Anita Desai", role: "Market Strategist", rating: 3, content: "Found a bug where the PDF export was cropping certain long charts in the Sentinel report. Very annoying when preparing for Sensex presentations.", response: "This formatting bug has been fixed in the latest build. PDF exports now use dynamic scaling. Thank you for your feedback! — shivam@ecoinsight.online", verified: true },
    { id: 7, name: "Aman Preet Singh", role: "Independent Trader", rating: 5, content: "Finally, an AI that doesn't just hallucinate economic theory. EcoInsight's grounding in real-time Indian CPI and GDP data is exceptional.", verified: true },
    { id: 8, name: "Ishani Iyer", role: "Asset Allocation Advisor", rating: 5, content: "The 'What-If' simulator is my favorite feature for Bharat-focused portfolios. It's like having a portable Bloomberg Terminal with an AI that understands local context.", verified: true },
    { id: 9, name: "Kavita Reddy", role: "Macro Researcher", rating: 5, content: "The sectoral correlation matrices in the Pulse dashboard are invaluable. It has significantly streamlined our risk assessment for Indian indices.", verified: true },
    { id: 10, name: "Siddharth Mehta", role: "Crypto Wealth Manager", rating: 4, content: "Excellent synthesis of Indian traditional finance data with crypto market sentiment. Would love to see more on-chain metrics for Web3 startups in India.", verified: true },
    { id: 11, name: "Sanjay Gupta", role: "Wealth Manager", rating: 5, content: "My clients love the reports I generate with EcoInsight. The clarity of the ELI5 summaries makes complex Indian market shifts understandable.", verified: true },
    { id: 12, name: "Aditi Rao", role: "Sovereign Wealth Analyst", rating: 3, content: "The mobile interface for the simulator was a bit cramped on my smaller device. Made it hard to adjust RBI repo rate sliders accurately.", response: "We have optimized the mobile layout for better touch precision and responsive slider controls. Thank you! — shivam@ecoinsight.online", verified: true },
    { id: 13, name: "Arjun Kapoor", role: "Logistics Analyst", rating: 5, content: "The supply chain disruption modeling is top-tier. It accurately signaled the Indian Ocean corridor latency impact weeks before the major papers.", verified: true },
    { id: 14, name: "Meera Nair", role: "ESG Compliance Lead", rating: 5, content: "EcoInsight's climate risk modeling for the Indian subcontinent is surprisingly detailed. It bridges the gap between environmental data and fiscal impact brilliantly.", verified: true },
    { id: 15, name: "Rohan Joshi", role: "Fixed Income Strategist", rating: 4, content: "Brilliant Indian bond yield curve predictions. I'd like to see more historical data for the early 90s economic reforms period specifically.", verified: true },
    { id: 16, name: "Anjali Menon", role: "RBI Consultant", rating: 5, content: "The policy impact simulator is a game changer for stress testing Indian fiscal policies. The neural engine handles non-linear variables with ease.", verified: true },
    { id: 17, name: "Harshvardhan Shah", role: "Equity Researcher", rating: 3, content: "Had a sync issue where my saved Nifty simulations weren't loading correctly on a second device. Very frustrating during a live briefing.", response: "We've implemented robust cross-device state synchronization. Your simulations are now backed up to our secure cloud instantly. — shivam@ecoinsight.online", verified: true },
    { id: 18, name: "Jyoti Malhotra", role: "VC Partner - Bharat Tech", rating: 5, content: "EcoInsight's coverage of Bharat's tech ecosystems is the best I've found. It captures nuances that global aggregators often miss.", verified: true },
    { id: 19, name: "Prateek Jain", role: "Quant Researcher", rating: 5, content: "The API integration for NSE data is clean and the documentation is surprisingly helpful for a tool this visually polished.", verified: true },
    { id: 20, name: "Riya Saxena", role: "Venture Capitalist", rating: 4, content: "The pulse-check feature on the Indian economy is my morning routine. A quick 3-minute read and I'm ready for the day's pitches. Highly recommend.", verified: true },
    { id: 21, name: "Devansh Batra", role: "Hedge Fund Analyst", rating: 5, content: "Our alpha generation on Indian small-caps has seen a measurable uptick since we integrated EcoInsight into our macro-research stack.", verified: true },
    { id: 22, name: "Tanvi Goyal", role: "Forex Trader (INR/USD)", rating: 5, content: "The sentiment analysis on RBI speeches is uncannily accurate. It catches hawkish/dovish shifts by the millisecond.", verified: true },
    { id: 23, name: "Manaswi Kulkarni", role: "Institutional Sales", rating: 5, content: "EcoInsight helps me explain complex Sensex movements to clients without needing a PhD in economics. It's an essential comms tool.", verified: true },
    { id: 24, name: "Shruti Agrawal", role: "Consumer Insights", rating: 4, content: "The consumer spending data breakdown by category in India is great. I'd love more granular data on rural spending trends specifically.", verified: true },
    { id: 25, name: "Sameer Bakshi", role: "Retail Investor", rating: 5, content: "As someone who isn't a professional analyst, EcoInsight makes me feel like I have a superpower in the Indian market. The ELI5 mode is incredible.", verified: true },
    { id: 26, name: "Zara Khan", role: "Policy Advisor", rating: 5, content: "The Indian geopolitical risk factor modeling is best-in-class. It’s helping us draft more resilient long-term fiscal strategies for Bharat.", verified: true },
    { id: 27, name: "Kabir Das", role: "Commodities Broker", rating: 3, content: "The MCX gold price feed had a minor outage last Tuesday for about 10 minutes. In this industry, 10 minutes is a lifetime.", response: "We've added redundant data streams to prevent any single-point outages. Gold feeds are now 99.99% multi-origin stable. — shivam@ecoinsight.online", verified: true },
    { id: 28, name: "Pallavi Chauhan", role: "Sustainability Lead", rating: 5, content: "The integration of Indian carbon credit impact modeling into business simulations is exactly what we needed for our Q3 planning.", verified: true },
    { id: 29, name: "Vikramaditya", role: "Real Estate Analyst", rating: 5, content: "The correlation between RBI rates and Indian residential property values in EcoInsight is very well calibrated. Outstanding work.", verified: true },
    { id: 30, name: "Aarav Gupta", role: "Fintech Founder", rating: 4, content: "Beautiful UI and powerful backend for the Bharat market. I'm taking notes for our own design systems. The speed of the neural engine is impressive.", verified: true },
    { id: 31, name: "Neha Gupta", role: "Quant Developer", rating: 5, content: "The data normalization protocols for Indian indices used here are clearly top-tier. No jitter in the historical time-series data at all.", verified: true },
    { id: 32, name: "Rishabh Pandey", role: "Derivatives Trader", rating: 5, content: "The Gamma-squeeze probability indicator for Nifty options is scarily accurate. Use it with caution, but use it.", verified: true },
    { id: 33, name: "Fatima Zahra", role: "Economic Journalist", rating: 5, content: "EcoInsight turns weeks of Bharat research into minutes of interaction. It’s my secret weapon for writing deep-dive Indian financial op-eds.", verified: true },
    { id: 34, name: "Karan Singh", role: "Junior Analyst", rating: 5, content: "This tool taught me more about Indian macro correlations in 3 days than my entire first semester of University in Mumbai. Simply brilliant.", verified: true },
    { id: 35, name: "Sunita Sharma", role: "Family Office Manager", rating: 5, content: "EcoInsight has become our primary decision-support engine for long-term wealth preservation in Bharat. The level of trust is very high.", verified: true },
    { id: 36, name: "Akhil Reddy", role: "Fixed Income PM", rating: 4, content: "Great for visualizing G-Sec yield curve inversions. I'd like more focus on Indian corporate high-yield debt in the next update.", verified: true },
    { id: 37, name: "Abhinav Kumar", role: "Algorithm Architect", rating: 5, content: "The neural network architecture used for the News Analyzer is noticeably more context-aware of Indian market nuances. Very impressive.", verified: true },
    { id: 38, name: "Pooja Bajaj", role: "Venture Principal", rating: 5, content: "EcoInsight helps us spot Bharat macro tailwinds for our portfolio companies before they hit the mainstream news cycle. Absolute edge.", verified: true }
];

const ReviewsSection = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState(null);
    const reviewsPerPage = 6;
    const ratingStats = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        REVIEWS.forEach(r => { if (counts[r.rating] !== undefined) counts[r.rating]++; });
        const stats = [5, 4, 3, 2, 1].map(stars => ({ stars, count: counts[stars], percent: REVIEWS.length > 0 ? Math.round((counts[stars] / REVIEWS.length) * 100) : 0 }));
        const totalValue = REVIEWS.reduce((acc, r) => acc + r.rating, 0);
        const avg = REVIEWS.length > 0 ? (totalValue / REVIEWS.length).toFixed(1) : "0.0";
        return { stats, avg, total: REVIEWS.length };
    }, []);
    const filteredReviews = useMemo(() => selectedRating ? REVIEWS.filter(r => r.rating === selectedRating) : REVIEWS, [selectedRating]);
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
    const currentReviews = filteredReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleFilter = (stars) => { setSelectedRating(selectedRating === stars ? null : stars); setCurrentPage(1); };
    return (
        <section id="reviews" className="reviews-section">
            <div className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="consensus-header-wrap"><h2 className="consensus-title">The Analyst Consensus</h2><span className="consensus-badge">Alpha Stage</span></div>
                <p style={{ margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', lineHeight: '1.6' }}>Trusted by elite researchers and Bharat's market participants during our initial pilot phase.</p>
            </div>
            <div className="reviews-overview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', scale: '0.85' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{ratingStats.avg}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>{[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill={s <= Math.round(parseFloat(ratingStats.avg)) ? "#f59e0b" : "transparent"} color="#f59e0b" />)}</div>
                            <span style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '2px' }}>Based on {ratingStats.total} verified reviews</span>
                        </div>
                    </div>
                    {selectedRating && <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => setSelectedRating(null)} style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Clear Filter <X size={12} /></motion.button>}
                </div>
                <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ratingStats.stats.map(row => (
                        <motion.div key={row.stars} whileHover={{ x: 5 }} onClick={() => handleFilter(row.stars)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: (selectedRating && selectedRating !== row.stars) ? 0.4 : 1, transition: 'opacity 0.2s ease', background: selectedRating === row.stars ? 'rgba(255,255,255,0.03)' : 'transparent', padding: '4px 8px', borderRadius: '8px' }}>
                            <span style={{ color: '#a1a1aa', fontSize: '0.75rem', minWidth: '45px' }}>{row.stars} stars</span>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}><motion.div initial={{ width: 0 }} animate={{ width: `${row.percent}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: row.stars >= 4 ? '#8b5cf6' : (row.stars === 3 ? '#f59e0b' : '#3f3f46') }} /></div>
                            <span style={{ color: '#71717a', fontSize: '0.75rem', minWidth: '35px', textAlign: 'right' }}>{row.percent}%</span>
                        </motion.div>
                    ))}
                </div>
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="reviews-grid">
                    {currentReviews.map((review, i) => (
                        <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="review-card" style={{ padding: '1.5rem', gap: '1rem' }}>
                            <div className="review-header" style={{ marginBottom: '-0.5rem' }}>
                                <div className="stars-row">{[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill={idx < review.rating ? "#f59e0b" : "transparent"} color={idx < review.rating ? "#f59e0b" : "#3f3f46"} />)}</div>
                                {review.verified && <span className="verified-badge"><Check size={8} /> Verified Analyst</span>}
                            </div>
                            <p className="review-content" style={{ fontSize: '0.9rem' }}>"{review.content}"</p>
                            <div className="review-footer"><div className="reviewer-info"><span className="reviewer-name" style={{ fontSize: '0.85rem' }}>{review.name}</span><span className="reviewer-role" style={{ fontSize: '0.75rem' }}>{review.role}</span></div></div>
                            {review.response && <div className="review-response" style={{ padding: '0.75rem', marginTop: '0.5rem' }}><div className="response-header" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}><EcoInsightLogo size={10} /><span>Official Response</span></div><p style={{ fontSize: '0.8rem' }}>{review.response}</p></div>}
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
            <div className="pagination-controls" style={{ marginTop: '2.5rem' }}>
                <button className="page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => paginate(i + 1)}>{i + 1}</button>)}
                <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
        </section>
    );
};

const DetailedFooter = ({ setAppSection }) => {
    const currentYear = new Date().getFullYear();
    const footerSections = [
        { title: "PLATFORM", links: [{ label: "Help Center", id: "help-center" }, { label: "Knowledge Base", id: "knowledge-base" }, { label: "Network Status", id: "network-status" }, { label: "Security Advisories", id: "security-advisories" }] },
        { title: "COMPANY", links: [{ label: "About Us", id: "about-us" }, { label: "Careers", id: "careers" }, { label: "Partners", id: "partners" }, { label: "Referral Program", id: "referral" }, { label: "Contact", id: "contact" }] },
        { title: "LEGAL", links: [{ label: "Privacy Policy", id: "privacy-policy" }, { label: "Terms of Service", id: "terms-of-service" }, { label: "Acceptable Use Policy", id: "acceptable-use" }, { label: "Report Abuse", id: "report-abuse" }] }
    ];
    return (
        <footer className="detailed-footer">
            <div className="footer-glow" />
            <div className="footer-content">
                <div className="footer-main-grid">
                    <div className="footer-brand-col">
                        <div className="footer-brand-header"><EcoInsightLogo size={24} /><span>EcoInsight</span></div>
                        <p className="footer-tagline">Empowering investors with institutional-grade AI analysis for the modern market.</p>
                    </div>
                    {footerSections.map((section, idx) => (
                        <div key={idx} className="footer-nav-col">
                            <h4>{section.title}</h4>
                            <ul>
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}><button className="footer-link-btn" onClick={() => { setAppSection(link.id); window.scrollTo(0, 0); }}>{link.label}</button></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="footer-bottom-bar"><div className="footer-copyright">© {currentYear} EcoInsight. All rights reserved. Made for Bharat 🇮🇳</div></div>
        </footer>
    );
};

const LandingPage = ({ setAppSection, setAuthType, onSelectPlan, onLaunchEngine, supaLoaded, openLogin, openSignup, setIsAccountModalOpen }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [hoveredPlanIndex, setHoveredPlanIndex] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [authTimeout, setAuthTimeout] = useState(false);

    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
    const threadQuality = useMemo(() => ({
        lineCount: isMobile ? 8 : 18,
        amplitude: isMobile ? 1.2 : 1.5
    }), [isMobile]);

    useEffect(() => {
        const timer = setTimeout(() => { if (!isLoaded) setAuthTimeout(true); }, 25000);
        return () => clearTimeout(timer);
    }, [isLoaded]);

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

    return (
        <div className="landing-container">
            <MarketTicker />
            <header className="landing-header">
                <div className="logo" onClick={() => setAppSection('landing')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <EcoInsightLogo size={48} /> <span>EcoInsight</span>
                </div>
                <div className={`landing-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Magnetic distance={0.3}><button className="nav-link" onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }}>Features</button></Magnetic>
                    <Magnetic distance={0.3}><button className="nav-link" onClick={() => { scrollToSection('solutions'); setIsMobileMenuOpen(false); }}>Solutions</button></Magnetic>
                    <Magnetic distance={0.3}><button className="nav-link" onClick={() => { scrollToSection('pricing'); setIsMobileMenuOpen(false); }}>Pricing</button></Magnetic>
                    {!isLoaded ? (
                        <div className="auth-loading-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, fontSize: '0.9rem' }}>
                            <Loader2 size={14} className="animate-spin" /> 
                            {authTimeout ? <span style={{ color: '#f87171' }}>Network issue? <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer', padding: '0 4px' }}>Reload</button></span> : "initializing security protocol..."}
                        </div>
                    ) : (
                        <>
                            {user ? (
                                <div className="signed-in-nav">
                                    <button className="btn-signin" onClick={onLaunchEngine} disabled={!supaLoaded}>{!supaLoaded ? <><Loader2 size={14} className="animate-spin" /> Syncing...</> : "Open Engine"}</button>
                                    <UserAccountMenu onSettingsClick={() => setIsAccountModalOpen(true)} onSubscriptionClick={() => { setAppSection('chat'); }} />
                                </div>
                            ) : (
                                <div className="signed-out-nav">
                                    <button className="nav-link" onClick={openLogin}>Sign In</button>
                                    <button className="btn-header" onClick={openSignup}>Get Started</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
            </header>

            <main className="landing-hero" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="hero-threads-bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 1.0 }}>
                    <Threads 
                        amplitude={threadQuality.amplitude} 
                        distance={0.2} 
                        enableMouseInteraction={false} 
                        color={[0.4, 0.2, 0.8]} 
                        lineCount={threadQuality.lineCount}
                    />
                </div>
                <div className="purple-pulse-glow" aria-hidden="true" />
                <div className="hero-content">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="hero-badge"><Sparkles size={14} /> Intelligence for Bharat's Markets</motion.div>
                    <h1>Empowering <span className="text-gradient">AI Economic Intelligence</span> for <span style={{ background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 30%, #ffffff 50%, #138808 70%, #138808 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline', textShadow: 'none', filter: 'drop-shadow(0 0 18px rgba(255, 153, 51, 0.4))' }}>Bharat</span></h1>
                    <motion.p initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}>Experience the next generation of financial analysis. Real-time patterns, deep historical context, and predictive simulations designed for elite analysts.</motion.p>
                    <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
                        <Magnetic distance={0.2}>{isSignedIn ? <button className="btn-primary" onClick={onLaunchEngine} disabled={!supaLoaded}>{!supaLoaded ? <>Synchronizing Profile <Loader2 size={18} className="animate-spin" /></> : <>Launch Engine <Maximize2 size={18} /></>}</button> : <button className="btn-primary" onClick={openSignup}>Launch Engine <Maximize2 size={18} /></button>}</Magnetic>
                        <Magnetic distance={0.2}><button className="btn-secondary" onClick={() => scrollToSection('features')}>Explorer Capabilities</button></Magnetic>
                    </motion.div>
                    <PartnerMarquee />
                </div>
            </main>

            <PerspectiveSection id="features" className="features-section">
                <motion.div className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
                    <motion.h2 variants={itemVariants}>Unrivaled Intelligence</motion.h2>
                    <motion.p variants={itemVariants}>Built on neural architectures that understand depth and context</motion.p>
                    <motion.div className="stats-container" variants={itemVariants}>
                        <div className="stat-item"><span className="stat-value"><CountUp to={98} />%</span><span className="stat-label">Accuracy</span></div>
                        <div className="stat-divider" /><div className="stat-item"><span className="stat-value"><CountUp to={12} />M+</span><span className="stat-label">Data Points</span></div>
                        <div className="stat-divider" /><div className="stat-item"><span className="stat-value"><CountUp to={450} />+</span><span className="stat-label">Analyses/sec</span></div>
                    </motion.div>
                </motion.div>
                <motion.div className="bento-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={containerVariants}>
                    <PremiumComputeCard /><DataDynamicsCard /><PolicySimulationCard /><NeuralAnalystCard />
                </motion.div>
            </PerspectiveSection>

            <PerspectiveSection id="solutions" className="solutions-section">
                <motion.div className="section-title" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}><h2>Specialized Verticals</h2><p>Tailored solutions for high-stakes environments</p></motion.div>
                <motion.div className="solutions-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
                    {[
                        { title: "Institutional Funds", desc: "Enterprise-grade data pipes and custom model integration for high-frequency strategies." },
                        { title: "Strategic Research", desc: "Long-form historical analysis tools for government and academic consultants." },
                        { title: "Independent Alpha", desc: "Professional tooling for the modern retail trader seeking a competitive edge." }
                    ].map((s, i) => (
                        <TiltCard key={i} className="solution-card">
                            <motion.div variants={itemVariants}>
                                <h4>{s.title}</h4><p>{s.desc}</p>
                                <Magnetic distance={0.3}><button className="btn-shine-secondary" onClick={() => setAppSection('documentation')}><span>Explore Docs</span><ChevronDown className="rotate-270" size={14} /></button></Magnetic>
                                <div className="card-glow" />
                            </motion.div>
                        </TiltCard>
                    ))}
                </motion.div>
            </PerspectiveSection>

            <ReviewsSection />

            <section id="pricing" className="pricing-section">
                <div className="section-title"><h2>The Elite Member Club</h2><p>Transparency at the speed of light</p></div>
                <motion.div className="pricing-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
                    {[
                        { plan: "Sentinel", price: "Coming Soon", feat: ["Full Simulation Suite", "Daily Insight Reports", "Priority Neural Compute"], priceValue: 19.99, isComingSoon: true },
                        { plan: "Observer", price: "Free", feat: ["Daily Market Pulse", "Unlimited Simulations", "Standard Data Feed"], featured: true, priceValue: 0 },
                        { plan: "Strategist", price: "Coming Soon", feat: ["Quantum Trend Modeling", "Real-time Fiscal Alerts", "Unlimited Deep Analysis"], priceValue: 24.99, isComingSoon: true }
                    ].map((p, i) => (
                        <TiltCard key={i} className={`pricing-card ${p.featured ? 'featured' : ''} ${hoveredPlanIndex === i ? 'active' : ''} ${hoveredPlanIndex !== null && hoveredPlanIndex !== i ? 'dimmed' : ''} ${p.isComingSoon ? 'coming-soon' : ''}`} onMouseEnter={() => setHoveredPlanIndex(i)} onMouseLeave={() => setHoveredPlanIndex(null)} style={p.isComingSoon ? { opacity: 0.8, cursor: 'not-allowed' } : {}}>
                            <motion.div variants={itemVariants}>
                                <h3>{p.plan}</h3><div className="price">{p.price}{!p.isComingSoon && <span>/mo</span>}</div>
                                <ul>{p.feat.map((f, j) => <li key={j}><Sparkles size={16} /> {f}</li>)}</ul>
                                <Magnetic distance={0.3}>
                                    <button 
                                        className={p.isComingSoon ? "btn-secondary" : "btn-shine-primary"} 
                                        onClick={() => !p.isComingSoon && onSelectPlan(p)} 
                                        disabled={p.isComingSoon || (isSignedIn && p.plan === 'Observer')}
                                    >
                                        {p.isComingSoon ? "Coming Soon" : (isSignedIn && p.plan === 'Observer' ? "Selected Plan" : "Select Plan")}
                                    </button>
                                </Magnetic>
                            </motion.div>
                        </TiltCard>
                    ))}
                </motion.div>
            </section>

            <section className="cta-section">
                <motion.div className="cta-card" whileHover={{ scale: 1.02 }}>
                    <h2>Ready to lead the curve?</h2><p>Join the 10,000+ analysts using Eko by EcoInsight to master the markets.</p>
                    {isSignedIn ? <button className="btn-primary" onClick={onLaunchEngine}>Launch Engine Now</button> : <button className="btn-primary" onClick={openSignup}>Get Started Now</button>}
                </motion.div>
            </section>
            
            <DetailedFooter setAppSection={setAppSection} />


        </div>
    );
};

export default LandingPage;
