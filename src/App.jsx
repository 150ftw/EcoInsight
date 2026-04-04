import React, { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Send, Sparkles, User, Bot, History, Settings, LogOut, Loader2, Copy, RefreshCw, BarChart3, TrendingUp, Globe, Lightbulb, Camera, Trash2, Key, ChevronDown, Monitor, Moon, Sun, Palette, Type, Maximize2, ShieldCheck, Lock, Zap, BookOpen, LifeBuoy, Terminal, Cpu, Layers, HardDrive, Activity, FilePlus, Download, Menu, X, Star, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { streamMessage } from './lib/KimiClient'
import { fetchMarketContext, fetchOnDemandContext } from './lib/MarketData'
import { fetchWebSearchContext } from './lib/WebSearch'
import { loadChats, saveChats, deleteChat as supaDeleteChat, deleteAllChats, loadSettings, saveSettings } from './lib/SupabaseStorage'
import { sendWelcomeEmail } from './lib/EmailService';
import { parseChartBlocks, EcoChartRenderer } from './components/EcoCharts'
import {
    SignedIn,
    SignedOut,
    SignIn,
    SignUp,
    SignInButton,
    SignUpButton,
    UserButton,
    useUser,
    useAuth
} from '@clerk/clerk-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

import CreditModal from './components/CreditModal';
import OnboardingView from './components/OnboardingView';
import * as pdfjs from 'pdfjs-dist'
// Set worker for pdfjs (using a static file from the public directory to bypass Vite bundler issues)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

import { fetchNewsTickerData } from './lib/MarketData'


import './LandingAuth.css'
import Threads from './components/Threads'
import { SUBPAGE_DATA } from './lib/SubpageContent'

import neuralNode from './assets/neural_node_high_res_elite-removebg-preview.png';
import iridescentOrb from './assets/premium_3d_iridescent_orb_1772080138013-removebg-preview.png';
const EkoSparkle = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="url(#eko_gradient)" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        <defs>
            <linearGradient id="eko_gradient" x1="2" y1="21.02" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1a1a1a" />
                <stop offset="0.4" stopColor="#6d28d9" />
                <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
        </defs>
    </svg>
)

const EcoInsightLogo = ({ size = 24, className = "" }) => {
    const id = useId();
    const gradientId = `logoGradientMain-${id.replace(/:/g, '')}`;
    const filterId = `logoGlowEffect-${id.replace(/:/g, '')}`;

    return (
        <div
            style={{
                width: size,
                height: size,
            }}
            className={`logo-interactive-container ${className}`}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
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

                <rect
                    x="40" y="40" width="432" height="432" rx="80"
                    fill="rgba(10, 10, 12, 0.8)"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="8"
                    opacity="0.8"
                    style={{ filter: `url(#${filterId})` }}
                />

                {[
                    { x: 120, y: 300, h: 120, op: 0.4 },
                    { x: 170, y: 260, h: 160, op: 0.6 },
                    { x: 220, y: 220, h: 200, op: 0.8 },
                    { x: 270, y: 180, h: 240, op: 1.0 }
                ].map((bar, i) => (
                    <rect
                        key={`bar-${i}`}
                        x={bar.x} y={bar.y} width="30" height={bar.h} rx="4"
                        fill={`url(#${gradientId})`}
                        opacity={bar.op}
                    />
                ))}

                <path
                    d="M120 380 L220 280 L280 320 L400 150 M370 150 L400 150 L400 180"
                    stroke="#fff"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                />

                {[
                    { cx: 200, cy: 180, r: 15 },
                    { cx: 260, cy: 140, r: 22 },
                    { cx: 320, cy: 200, r: 15 },
                    { cx: 240, cy: 220, r: 12 }
                ].map((node, i) => (
                    <circle
                        key={`node-${i}`}
                        cx={node.cx} cy={node.cy} r={node.r}
                        fill="#fff"
                    />
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

const BetaBadge = () => (
    <span style={{
        fontSize: '9px',
        padding: '2px 6px',
        background: 'rgba(139, 92, 246, 0.2)',
        color: '#a78bfa',
        borderRadius: '4px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        marginLeft: 'auto',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    }}>Beta</span>
);

// Custom EcoInsight sidebar icons — unique to this product
const EcoNewChatIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const EcoTrendsIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 20L7 14L11 16L15 9L21 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 4H21V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="3" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
);

const EcoPulseIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M3 12H7L9 6L12 18L15 9L17 12H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EcoSimplifyIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M7 14H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <circle cx="17" cy="14" r="1.5" fill="currentColor" />
    </svg>
);

const EcoSimulatorIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4L12 8L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M4 20L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M20 20L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
);

const EcoNewsIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H16V20H4C3.45 20 3 19.55 3 19V5C3 4.45 3.45 4 4 4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 8H20C20.55 8 21 8.45 21 9V19C21 19.55 20.55 20 20 20H16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="7" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="7" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="7" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
);

const EcoPredictorIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M12 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const EcoHistoryIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C9.17 20 6.68 18.57 5.27 16.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// --- PREMIUM FEATURE: BLOOMBERG NEWS TICKER ---
const NewsTicker = () => {
    const [data, setData] = useState({ trending: [], headlines: [] });

    useEffect(() => {
        const loadTickerData = async () => {
            const result = await fetchNewsTickerData();
            setData(result);
        };
        loadTickerData();
        const interval = setInterval(loadTickerData, 600000); // 10 min
        return () => clearInterval(interval);
    }, []);

    if (!data.headlines.length && !data.trending.length) return null;

    return (
        <div className="bloomberg-ticker">
            <div className="ticker-label">BREAKING 🇮🇳</div>
            <div className="ticker-content">
                <div className="ticker-track">
                    {[...Array(2)].map((_, groupIdx) => (
                        <React.Fragment key={groupIdx}>
                            {data.headlines.map((h, i) => (
                                <span key={`h-${groupIdx}-${i}`} className="ticker-item headline">{h}</span>
                            ))}
                            {data.trending.map((t, i) => {
                                if (typeof t === 'string') {
                                    return (
                                        <span key={`t-${groupIdx}-${i}`} className="ticker-item trend neutral">
                                            <EcoTrendsIcon size={12} /> {t}
                                        </span>
                                    );
                                }
                                return (
                                    <span key={`t-${groupIdx}-${i}`} className={`ticker-item trend ${t.isPositive ? 'positive' : 'negative'}`}>
                                        <EcoTrendsIcon size={12} className="trend-icon-small" /> <span className="ticker-symbol">{t.symbol}</span> <span className="ticker-price">₹{t.price}</span> <span className="ticker-change">({t.isPositive ? '+' : '-'}{t.changePercent}%)</span>
                                    </span>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="ticker-time">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST</div>
        </div>
    );
};

// --- PREMIUM FEATURE: PDF TEXT EXTRACTION ---
const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(" ") + "\n";
        }
        return fullText;
    } catch (e) {
        console.error("PDF Extraction Error:", e);
        return "";
    }
};



const Magnetic = ({ children }) => {
    return children;
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




const PerspectiveSection = ({ children, id, className }) => {
    return (
        <section
            id={id}
            className={className}
        >
            {children}
        </section>
    );
};

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

const TiltCard = ({ children, className, ...props }) => {
    return (
        <div
            className={className}
            {...props}
        >
            {children}
        </div>
    );
};

const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Premium Compute Component for Landing Page Grid
const PremiumComputeCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [nodes, setNodes] = useState(340);

    useEffect(() => {
        if (!isHovered) {
            setNodes(340);
            return;
        }

        const interval = setInterval(() => {
            // Fluctuate around 4,096
            const variance = Math.floor(Math.random() * 21) - 10; // -10 to +10
            setNodes(4096 + variance);
        }, 150);

        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <TiltCard className="bento-item bento-1" style={{ padding: 0 }}>
            <div
                className="premium-compute-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Background Grid */}
                <div className="compute-grid-bg" />

                <div className="premium-compute-content">
                    <div className="compute-icon-container" style={{ marginBottom: '2rem' }}>
                        <Zap size={26} className={isHovered ? 'text-orange' : ''} />
                    </div>

                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        Neural Inference Engine
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Dynamic micro-clusters that scale to zero. Overclocked silicon explicitly reserved for high-volatility financial modeling.
                    </p>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <motion.span
                                key={isHovered ? 'active' : 'idle'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ fontSize: '3.5rem', fontWeight: 800, color: isHovered ? '#f97316' : '#e2e8f0', letterSpacing: '-2px' }}
                            >
                                {nodes.toLocaleString()}
                            </motion.span>
                            <span style={{ fontSize: '1.2rem', color: '#71717a', fontWeight: 600 }}>NODES</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHovered ? '#f97316' : '#3b82f6', boxShadow: isHovered ? '0 0 12px #f97316' : 'none' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', color: isHovered ? '#f97316' : '#3b82f6', textTransform: 'uppercase' }}>
                                {isHovered ? 'MAXIMUM OVERDRIVE' : 'IDLE STATE'}
                            </span>
                        </div>

                        {/* Equalizer / Dots */}
                        <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                            {isHovered ? (
                                // Equalizer
                                [...Array(14)].map((_, i) => (
                                    <motion.div
                                        key={`eq-${i}`}
                                        initial={{ height: '20%' }}
                                        animate={{ height: [`20%`, `${Math.random() * 80 + 20}%`, `20%`] }}
                                        transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, ease: 'easeInOut' }}
                                        style={{
                                            width: '8px',
                                            background: 'linear-gradient(to top, #ea580c, #fcd34d)',
                                            borderRadius: '2px',
                                            boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)'
                                        }}
                                    />
                                ))
                            ) : (
                                // Dots
                                [...Array(10)].map((_, i) => (
                                    <div
                                        key={`dot-${i}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '2px',
                                            background: 'rgba(59, 130, 246, 0.3)',
                                            margin: '0 3px'
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
};

// Data Dynamics Interactive Card
const DataDynamicsCard = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <TiltCard className="bento-item">
            <div
                className="data-dynamics-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="network-bg" />

                <div className="premium-compute-content">
                    <div className="globe-icon-container" style={{ marginBottom: '2rem' }}>
                        <Globe size={26} className={isHovered ? 'text-emerald' : ''} />
                    </div>

                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        Macro Dynamics
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Trace macroeconomic events to their fiscal impact on India instantly. The Bharat economy is always in focus.
                    </p>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHovered ? '#10b981' : '#3f3f46', boxShadow: isHovered ? '0 0 12px #10b981' : 'none' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: isHovered ? '#10b981' : '#a1a1aa', textTransform: 'uppercase' }}>
                                {isHovered ? 'LIVE TELEMETRY INGEST' : 'STANDBY'}
                            </span>
                        </div>

                        <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            {isHovered && (
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                    style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, #10b981, transparent)', boxShadow: '0 0 10px #10b981' }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
};

// Policy Simulation Interactive Card
const PolicySimulationCard = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <TiltCard className="bento-item">
            <div
                className="policy-sim-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="tilt-mesh-bg" />

                <div className="premium-compute-content">
                    <div className="prism-icon-container" style={{ marginBottom: '2rem' }}>
                        <Layers size={26} className={isHovered ? 'text-purple' : ''} />
                    </div>

                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        Policy Simulations
                    </h3>
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

// Neural Analyst Interactive Card
const NeuralAnalystCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    const mockTerminal = `> init_neural_core()\n[OK] Core loaded.\n> attach_market_feed(wss://nyse)\n[OK] Stream connected.\n> execute_extrapolation(window="1m")\nAnalyzing 43,219 parameters...\nAnomaly detected in tech sector\n> synthesize_report()\nGenerating...`;

    return (
        <TiltCard className="bento-item bento-4">
            <div
                className="neural-analyst-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="terminal-scroll-bg">
                    {mockTerminal}
                    <br /><br />
                    {mockTerminal}
                    <br /><br />
                    {mockTerminal}
                </div>

                <div className="premium-compute-content">
                    <div className="bot-icon-container" style={{ marginBottom: '2rem' }}>
                        <Bot size={26} className={isHovered ? 'text-sky' : ''} />
                    </div>

                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        The Neural Analyst
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        A 24/7 technical partner that never misses a market beat. Drop in any ticker, region, or policy for an instant deep dive.
                    </p>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHovered ? '#38bdf8' : '#3f3f46', boxShadow: isHovered ? '0 0 12px #38bdf8' : 'none' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: isHovered ? '#38bdf8' : '#a1a1aa', fontFamily: 'var(--font-mono)' }}>
                                {isHovered ? 'AWAITING QUERY_' : 'SLEEP'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
};

const REVIEWS = [
    { id: 1, name: "Arjun Mehta", role: "Senior Portfolio Manager", rating: 5, content: "EcoInsight has become my primary tool for macroeconomic synthesis. The ELI5 feature is surprisingly robust for quick mental models.", verified: true },
    { id: 2, name: "Sarah Jenkins", role: "Financial Analyst, UBS", rating: 5, content: "The level of depth in the predictive simulations is unlike anything I've seen at this price point. It saves me about 4 hours every week.", verified: true },
    { id: 3, name: "Vikram Singh", role: "Hedge Fund Consultant", rating: 3, content: "Initially had some issues with the real-time data latency in the Pulse dashboard during high-volatility hours. It made it difficult to rely on for intra-day snapshots.", response: "We have resolved this issue by upgrading our data ingestion pipelines to 50ms polling. Thank you for letting us know! — shivam@ecoinsight.online", verified: true },
    { id: 4, name: "Priyanka Sharma", role: "Economic Academic", rating: 5, content: "Extremely intuitive interface. The glassmorphism design isn't just eye candy; it actually helps in focusing on the data hierarchies.", verified: true },
    { id: 5, name: "David Chen", role: "Private Equity Associate", rating: 4, content: "Great tool overall. The Simulator is powerful, though I'd love to see more granular fiscal policy levers for emerging markets.", verified: true },
    { id: 6, name: "Anita Desai", role: "Market Strategist", rating: 3, content: "Found a bug where the PDF export was cropping certain long charts in the Sentinel report. Very annoying when preparing for presentations.", response: "This formatting bug has been fixed in the latest build. PDF exports now use dynamic scaling. Thank you for your feedback! — shivam@ecoinsight.online", verified: true },
    { id: 7, name: "Marcus Thorne", role: "Independent Trader", rating: 5, content: "Finally, an AI that doesn't just hallucinate economic theory. EcoInsight's grounding in real-time PCE and GDP data is exceptional.", verified: true },
    { id: 8, name: "Elena Rodriguez", role: "Asset Allocation Advisor", rating: 5, content: "The 'What-If' simulator is my favorite feature. It's like having a portable Bloomberg Terminal with an AI personality that understands context.", verified: true },
    { id: 9, name: "Kenji Sato", role: "Global Macro Researcher", rating: 5, content: "The cross-border correlation matrices in the Pulse dashboard are invaluable. It has significantly streamlined our risk assessment.", verified: true },
    { id: 10, name: "James Wilson", role: "Crypto Fund Manager", rating: 4, content: "Excellent synthesis of traditional finance data with crypto market sentiment. Would love to see more on-chain metrics integrated.", verified: true },
    { id: 11, name: "Sanjay Gupta", role: "Wealth Manager", rating: 5, content: "My clients love the reports I generate with EcoInsight. The clarity of the ELI5 summaries makes complex market shifts understandable.", verified: true },
    { id: 12, name: "Li Wei", role: "Sovereign Wealth Analyst", rating: 3, content: "The mobile interface for the simulator was a bit cramped on my smaller device. Made it hard to adjust sliders accurately.", response: "We have optimized the mobile layout for better touch precision and responsive slider controls. Thank you! — shivam@ecoinsight.online", verified: true },
    { id: 13, name: "Hassan Al-Sayed", role: "Oil & Gas Analyst", rating: 5, content: "The supply chain disruption modeling is top-tier. It accurately signaled the Red Sea latency impact weeks before the major papers.", verified: true },
    { id: 14, name: "Chloe Dupont", role: "ESG Compliance Officer", rating: 5, content: "EcoInsight's climate risk modeling is surprisingly detailed. It bridges the gap between environmental data and fiscal impact brilliantly.", verified: true },
    { id: 15, name: "Robert Miller", role: "Fixed Income Strategist", rating: 4, content: "Brilliant bond yield curve predictions. I'd like to see more historical data for the 1970s stagflation period specifically.", verified: true },
    { id: 16, name: "Sofia Rossi", role: "Central Bank Consultant", rating: 5, content: "The policy impact simulator is a game changer for stress testing. The neural engine handles non-linear variables with ease.", verified: true },
    { id: 17, name: "Alex Kwok", role: "Tech Equity Researcher", rating: 3, content: "Had a sync issue where my saved simulations weren't loading correctly on a second device. Very frustrating during a live briefing.", response: "We've implemented robust cross-device state synchronization. Your simulations are now backed up to our secure cloud instantly. — shivam@ecoinsight.online", verified: true },
    { id: 18, name: "Amara Okoro", role: "Emerging Markets VC", rating: 5, content: "EcoInsight's coverage of African tech ecosystems is the best I've found. It captures nuances that global aggregators often miss.", verified: true },
    { id: 19, name: "Thomas Bergman", role: "Quantitative Resident", rating: 5, content: "The API integration is clean and the documentation is surprisingly helpful for a tool this visually polished.", verified: true },
    { id: 20, name: "Isabella Martinez", role: "Venture Capitalist", rating: 4, content: "The pulse-check feature is my morning routine. A quick 3-minute read and I'm ready for the day's pitches. Highly recommend.", verified: true },
    { id: 21, name: "Lucas Wagner", role: "Hedge Fund Analyst", rating: 5, content: "Our alpha generation has seen a measurable uptick since we integrated EcoInsight into our macro-research stack.", verified: true },
    { id: 22, name: "Yara Haddad", role: "Foreign Exchange Trader", rating: 5, content: "The sentiment analysis on global central bank speeches is uncannily accurate. It catches hawkish/dovish shifts by the millisecond.", verified: true },
    { id: 23, name: "Finn O'Connor", role: "Institutional Sales", rating: 5, content: "EcoInsight helps me explain complex market movements to clients without needing a PhD in economics. It's an essential comms tool.", verified: true },
    { id: 24, name: "Mina Sun", role: "Consumer Goods Researcher", rating: 4, content: "The PCE data breakdown by category is great. I'd love more granular data on luxury spending trends specifically.", verified: true },
    { id: 25, name: "Daniel Smith", role: "Retail Investor", rating: 5, content: "As someone who isn't a professional analyst, EcoInsight makes me feel like I have a superpower. The ELI5 mode is incredible.", verified: true },
    { id: 26, name: "Zara Khan", role: "Policy Advisor", rating: 5, content: "The geopolitical risk factor modeling is best-in-class. It’s helping us draft more resilient long-term fiscal strategies.", verified: true },
    { id: 27, name: "Noah Jensen", role: "Commodities Broker", rating: 3, content: "The silver price feed had a minor outage last Tuesday for about 10 minutes. In this industry, 10 minutes is a lifetime.", response: "We've added redundant data streams to prevent any single-point outages. Silver feeds are now 99.99% multi-origin stable. — shivam@ecoinsight.online", verified: true },
    { id: 28, name: "Emma Larsson", role: "Sustainability Lead", rating: 5, content: "The integration of carbon tax impact modeling into business simulations is exactly what we needed for our Q3 planning.", verified: true },
    { id: 29, name: "Oliver Brown", role: "Real Estate Analyst", rating: 5, content: "The correlation between interest rates and commercial property values in EcoInsight is very well calibrated. Outstanding work.", verified: true },
    { id: 30, name: "Aarav Gupta", role: "Fintech Founder", rating: 4, content: "Beautiful UI and powerful backend. I'm taking notes for our own design systems. The speed of the neural engine is impressive.", verified: true },
    { id: 31, name: "Sophie Mueller", role: "Quant Developer", rating: 5, content: "The data normalization protocols used here are clearly top-tier. No jitter in the historical time-series data at all.", verified: true },
    { id: 32, name: "Leo Kim", role: "Derivatives Trader", rating: 5, content: "The Gamma-squeeze probability indicator in the Sentinel dashboard is scarily accurate. Use it with caution, but use it.", verified: true },
    { id: 33, name: "Fatima Zahra", role: "Economic Journalist", rating: 5, content: "EcoInsight turns weeks of research into minutes of interaction. It’s my secret weapon for writing deep-dive financial op-eds.", verified: true },
    { id: 34, name: "John Davis", role: "Junior Analyst", rating: 5, content: "This tool taught me more about macro correlations in 3 days than my entire first semester of University. Simply brilliant.", verified: true },
    { id: 35, name: "Maria Garcia", role: "Family Office Manager", rating: 5, content: "EcoInsight has become our primary decision-support engine for long-term wealth preservation. The level of trust is very high.", verified: true },
    { id: 36, name: "Liam O'Brien", role: "Fixed Income PM", rating: 4, content: "Great for visualizing yield curve inversions. I'd like more focus on corporate high-yield debt in the next update.", verified: true },
    { id: 37, name: "Chen Bo", role: "Algorithm Architect", rating: 5, content: "The neural network architecture used for the News Analyzer is noticeably more context-aware than generic models. Very impressive.", verified: true },
    { id: 38, name: "Rachel Adams", role: "Venture Principal", rating: 5, content: "EcoInsight helps us spot macro tailwinds for our portfolio companies before they hit the mainstream news cycle. Absolute edge.", verified: true }
];

const ReviewsSection = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 6;
    const totalRatings = 211;
    const averageRating = 4.8;
    
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = REVIEWS.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(REVIEWS.length / reviewsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Removed scrollIntoView to prevent disruptive jumps
    };
    
    return (
        <section id="reviews" className="reviews-section">
            <div className="section-title">
                <h2>The Analyst Consensus</h2>
                <p>Trusted by elite researchers and global market participants</p>
            </div>

            <div className="reviews-overview" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '2rem',
                scale: '0.85' // Subtle downscale to prevent "zoomed in" feel
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{averageRating}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={16} fill="#f59e0b" color="#f59e0b" />
                            ))}
                        </div>
                        <span style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '2px' }}>Based on {totalRatings} global ratings</span>
                    </div>
                </div>
                
                <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { stars: 5, count: 180, percent: 85 },
                        { stars: 4, count: 20, percent: 10 },
                        { stars: 3, count: 11, percent: 5 },
                        { stars: 2, count: 0, percent: 0 },
                        { stars: 1, count: 0, percent: 0 }
                    ].map(row => (
                        <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#a1a1aa', fontSize: '0.75rem', minWidth: '40px' }}>{row.stars} stars</span>
                            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${row.percent}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{ height: '100%', background: row.stars >= 4 ? '#8b5cf6' : '#f59e0b' }} 
                                />
                            </div>
                            <span style={{ color: '#71717a', fontSize: '0.75rem', minWidth: '30px', textAlign: 'right' }}>{row.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentPage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="reviews-grid"
                >
                    {currentReviews.map((review, i) => (
                        <motion.div 
                            key={review.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="review-card"
                            style={{ padding: '1.5rem', gap: '1rem' }}
                        >
                            <div className="review-header" style={{ marginBottom: '-0.5rem' }}>
                                <div className="stars-row">
                                    {[...Array(5)].map((_, idx) => (
                                        <Star 
                                            key={idx} 
                                            size={12} 
                                            fill={idx < review.rating ? "#f59e0b" : "transparent"} 
                                            color={idx < review.rating ? "#f59e0b" : "#3f3f46"} 
                                        />
                                    ))}
                                </div>
                                {review.verified && <span className="verified-badge"><Check size={8} /> Verified Analyst</span>}
                            </div>
                            <p className="review-content" style={{ fontSize: '0.9rem' }}>"{review.content}"</p>
                            <div className="review-footer">
                                <div className="reviewer-info">
                                    <span className="reviewer-name" style={{ fontSize: '0.85rem' }}>{review.name}</span>
                                    <span className="reviewer-role" style={{ fontSize: '0.75rem' }}>{review.role}</span>
                                </div>
                            </div>

                            {review.response && (
                                <div className="review-response" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                                    <div className="response-header" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                                        <EcoInsightLogo size={10} />
                                        <span>Official Response</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem' }}>{review.response}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
            
            <div className="pagination-controls" style={{ marginTop: '2.5rem' }}>
                <button 
                    className="page-btn" 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                    <button 
                        key={i} 
                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => paginate(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button 
                    className="page-btn" 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </section>
    );
};

const LandingPage = ({ setAppSection, setAuthType, onSelectPlan, onLaunchEngine, supaLoaded }) => {
    const { isSignedIn, isLoaded } = useAuth();
    const [hoveredPlanIndex, setHoveredPlanIndex] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [authTimeout, setAuthTimeout] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isLoaded) {
                console.log("LandingPage Auth Timeout Reached (25s)");
                setAuthTimeout(true);
            }
        }, 25000);

        return () => {
            clearTimeout(timer);
        };
    }, [isLoaded]);

    // Static Hero (Anti-Flicker Measure)
    const heroScale = 1;
    const heroOpacity = 1;

    const splitText = (text) => text;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="landing-container">
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
                            {authTimeout ? (
                                <span style={{ color: '#f87171' }}>
                                    Network issue? 
                                    <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer', padding: '0 4px' }}>Reload</button>
                                </span>
                            ) : "initializing security protocol..."}
                        </div>
                    ) : (
                        <>
                            <SignedIn>
                                <div className="signed-in-nav">
                                    <button className="btn-signin" onClick={onLaunchEngine} disabled={!supaLoaded && isSignedIn}>
                                        {!supaLoaded ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Loader2 size={14} className="animate-spin" /> Syncing...
                                            </div>
                                        ) : "Open Engine"}
                                    </button>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </SignedIn>
                            <SignedOut>
                                <div className="signed-out-nav">
                                    <SignInButton mode="modal">
                                        <button className="nav-link">Sign In</button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <button className="btn-header">Get Started</button>
                                    </SignUpButton>
                                </div>
                            </SignedOut>
                        </>
                    )}
                </div>
                <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            <main className="landing-hero" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="hero-threads-bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 1.0 }}>
                    <Threads amplitude={1.5} distance={0.2} enableMouseInteraction={false} color={[0.4, 0.2, 0.8]} />
                </div>
                
                {/* Restore the Purple Pulse Background Animation */}
                <div className="purple-pulse-glow" aria-hidden="true" />
                
                <div
                    className="hero-content"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hero-badge"
                    >
                        <Sparkles size={14} /> Intelligence for Bharat's Markets
                    </motion.div>
                    <h1>
                        {splitText("Master the ")}
                        <span className="text-gradient">{splitText("Economic")}</span>
                        {splitText(" Pulse of ")}
                        <span style={{
                            background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 30%, #ffffff 50%, #138808 70%, #138808 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            display: 'inline',
                            textShadow: 'none',
                            filter: 'drop-shadow(0 0 18px rgba(255, 153, 51, 0.4))'
                        }}>Bharat</span>
                    </h1>
                    <motion.p
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    >
                        Experience the next generation of financial analysis. Real-time patterns,
                        deep historical context, and predictive simulations designed for elite analysts.
                    </motion.p>
                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Magnetic distance={0.2}>
                            {isSignedIn ? (
                                <button className="btn-primary" onClick={onLaunchEngine} disabled={!supaLoaded}>
                                    {!supaLoaded ? (
                                        <>Synchronizing Profile <Loader2 size={18} className="animate-spin" /></>
                                    ) : (
                                        <>Launch Engine <Maximize2 size={18} /></>
                                    )}
                                </button>
                            ) : (
                                <SignUpButton mode="modal">
                                    <button className="btn-primary">
                                        Launch Engine <Maximize2 size={18} />
                                    </button>
                                </SignUpButton>
                            )}
                        </Magnetic>
                        <Magnetic distance={0.2}>
                            <button className="btn-secondary" onClick={() => scrollToSection('features')}>Explorer Capabilities</button>
                        </Magnetic>
                    </motion.div>
                    <PartnerMarquee />
                </div>
            </main>

            <PerspectiveSection id="features" className="features-section">
                <motion.div
                    className="section-title"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    <motion.h2 variants={itemVariants}>Unrivaled Intelligence</motion.h2>
                    <motion.p variants={itemVariants}>Built on neural architectures that understand depth and context</motion.p>

                    {/* New Interactive Stats */}
                    <motion.div className="stats-container" variants={itemVariants}>
                        <div className="stat-item">
                            <span className="stat-value"><CountUp to={98} />%</span>
                            <span className="stat-label">Accuracy</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value"><CountUp to={12} />M+</span>
                            <span className="stat-label">Data Points</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value"><CountUp to={450} />+</span>
                            <span className="stat-label">Analyses/sec</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="bento-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-20px" }}
                    variants={containerVariants}
                >
                    <PremiumComputeCard />
                    <DataDynamicsCard />
                    <PolicySimulationCard />
                    <NeuralAnalystCard />
                </motion.div>
            </PerspectiveSection>

            <PerspectiveSection id="solutions" className="solutions-section">
                <motion.div
                    className="section-title"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <h2>Specialized Verticals</h2>
                    <p>Tailored solutions for high-stakes environments</p>
                </motion.div>
                <motion.div
                    className="solutions-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    {[
                        { title: "Institutional Funds", desc: "Enterprise-grade data pipes and custom model integration for high-frequency strategies.", url: "https://www.bloomberg.com/professional/solution/data-and-content/" },
                        { title: "Strategic Research", desc: "Long-form historical analysis tools for government and academic consultants.", url: "https://openknowledge.worldbank.org/" },
                        { title: "Independent Alpha", desc: "Professional tooling for the modern retail trader seeking a competitive edge.", url: "https://finance.yahoo.com/news/" }
                    ].map((s, i) => (
                        <TiltCard key={i} className="solution-card">
                            <motion.div variants={itemVariants}>
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                                <div style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
                                    <Magnetic distance={0.3}>
                                        <button className="btn-shine-secondary" onClick={() => setAppSection('documentation')}>
                                            <span>Explore Docs</span>
                                            <ChevronDown className="rotate-270" size={14} />
                                        </button>
                                    </Magnetic>
                                </div>
                                <div className="card-glow" />
                            </motion.div>
                        </TiltCard>
                    ))}
                </motion.div>
            </PerspectiveSection>



            <ReviewsSection />

            <section id="pricing" className="pricing-section">
                <div className="section-title">
                    <h2>The Elite Member Club</h2>
                    <p>Transparency at the speed of light</p>
                </div>
                <motion.div
                    className="pricing-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    {[
                        { plan: "Observer", price: "Free", feat: ["Daily Market Pulse", "10 Simulations/day", "Standard Data Feed"], priceValue: 0 },
                        { plan: "Sentinel", price: "Coming Soon", feat: ["Full Simulation Suite", "Daily Insight Reports", "Priority Neural Compute"], featured: true, priceValue: 19.99, isComingSoon: true },
                        { plan: "Strategist", price: "Coming Soon", feat: ["Quantum Trend Modeling", "Real-time Fiscal Alerts", "Unlimited Deep Analysis"], priceValue: 24.99, isComingSoon: true }
                    ].map((p, i) => (
                        <TiltCard
                            key={i}
                            className={`pricing-card ${p.featured ? 'featured' : ''} ${hoveredPlanIndex === i ? 'active' : ''} ${hoveredPlanIndex !== null && hoveredPlanIndex !== i ? 'dimmed' : ''} ${p.isComingSoon ? 'coming-soon' : ''}`}
                            onMouseEnter={() => setHoveredPlanIndex(i)}
                            onMouseLeave={() => setHoveredPlanIndex(null)}
                            style={p.isComingSoon ? { opacity: 0.8, cursor: 'not-allowed' } : {}}
                        >
                            <motion.div variants={itemVariants}>
                                <h3>{p.plan}</h3>
                                <div className="price">{p.price}{!p.isComingSoon && <span>/mo</span>}</div>
                                <ul>
                                    {p.feat.map((f, j) => <li key={j}><Sparkles size={16} /> {f}</li>)}
                                </ul>
                                <Magnetic distance={0.3}>
                                    <button 
                                        className={p.isComingSoon ? "btn-secondary" : "btn-shine-primary"} 
                                        onClick={() => !p.isComingSoon && onSelectPlan(p)}
                                        disabled={p.isComingSoon}
                                    >
                                        {p.isComingSoon ? "Coming Soon" : "Select Plan"}
                                    </button>
                                </Magnetic>
                            </motion.div>
                        </TiltCard>
                    ))}
                </motion.div>
            </section>

            <section className="cta-section">
                <motion.div
                    className="cta-card"
                    whileHover={{ scale: 1.02 }}
                >
                    <h2>Ready to lead the curve?</h2>
                    <p>Join the 10,000+ analysts using Eko by EcoInsight to master the markets.</p>
                    {isSignedIn ? (
                        <button className="btn-primary" onClick={onLaunchEngine}>Launch Engine Now</button>
                    ) : (
                        <SignUpButton mode="modal">
                            <button className="btn-primary">Get Started Now</button>
                        </SignUpButton>
                    )}
                </motion.div>
            </section>

            <footer className="landing-footer" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="footer-threads-bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 1.0 }}>
                    <Threads amplitude={1.5} distance={0.2} enableMouseInteraction={false} color={[0, 0, 0]} />
                </div>
                <div className="footer-content">
                    <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <EcoInsightLogo size={42} /> <span>Eko by EcoInsight</span>
                    </div>
                    <div className="footer-links-grid">
                        <div className="link-group">
                            <h4>Resources</h4>
                            <button className="footer-link-btn" onClick={() => setAppSection('help-center')}>Help Center</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('knowledge-base')}>Knowledge Base</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('network-status')}>Network Status</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('security-advisories')}>Security Advisories</button>
                        </div>
                        <div className="link-group">
                            <h4>Company</h4>
                            <button className="footer-link-btn" onClick={() => setAppSection('about-us')}>About Us</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('careers')}>Careers</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('partners')}>Partners</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('referral')}>Referral Program</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('contact')}>Contact</button>
                        </div>
                        <div className="link-group">
                            <h4>Legal</h4>
                            <button className="footer-link-btn" onClick={() => setAppSection('privacy-policy')}>Privacy Policy</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('terms-of-service')}>Terms of Service</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('acceptable-use')}>Acceptable Use Policy</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('payment-refund')}>Payment & Refund</button>
                            <button className="footer-link-btn" onClick={() => setAppSection('report-abuse')}>Report Abuse</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Eko by EcoInsight. All rights reserved.</p>
                </div>
            </footer>
        </div >
    );
};


const InteractiveActionCard = ({ children, icon: Icon, title, description, details, expandedDetails, onInit, isActive, onToggle, delay = 0 }) => {
    const handleInitClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(title);
        // Execute the terminal sequence if activating
        if (!isActive && onInit) {
            onInit(title);
        }
    };

    return (
        <Magnetic distance={0.15}>
            <TiltCard>
                <motion.div
                    className={`info-card interactive ${isActive ? 'is-initialized' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: isActive ? 1.03 : 1,
                        filter: isActive ? 'brightness(1.1)' : 'brightness(1)',
                        boxShadow: isActive ? '0 0 30px rgba(139, 92, 246, 0.4)' : '0 20px 50px rgba(0, 0, 0, 0.3)',
                        borderColor: isActive ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.08)'
                    }}
                    transition={{ delay, duration: 0.3, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: isActive ? 10 : 1 }}
                >
                    <div className="card-icon"><Icon size={32} /></div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <div className="info-card-detail" style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}>
                        <div className="divider" style={{ margin: '1rem 0', opacity: 0.1, background: 'var(--accent-primary)', height: '1px' }} />
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', fontFamily: 'var(--font-body)' }}>{details}</p>

                        <AnimatePresence>
                            {isActive && expandedDetails && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 15 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    {expandedDetails}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            className="btn-shine-primary"
                            style={{
                                marginTop: '1.5rem',
                                width: '100%',
                                fontSize: '0.8rem',
                                padding: '10px',
                                position: 'relative',
                                zIndex: 100,
                                pointerEvents: 'all',
                                cursor: 'pointer',
                                background: isActive ? 'rgba(139, 92, 246, 0.15)' : '',
                                color: isActive ? 'var(--accent-primary)' : '',
                                border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : ''
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={handleInitClick}
                        >
                            {isActive ? 'INITIALIZED' : 'INITIALIZE MODULE'}
                        </button>
                    </div>
                </motion.div>
            </TiltCard>
        </Magnetic>
    );
};

const LiveSimulator = ({ lines, title }) => {
    const [activeLines, setActiveLines] = useState([]);

    useEffect(() => {
        let current = 0;
        const interval = setInterval(() => {
            if (current < lines.length) {
                setActiveLines(prev => [...prev, lines[current]]);
                current++;
            } else {
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lines]);

    return (
        <div className="interactive-block">
            <div className="status-indicator">
                <div className="status-pulse" /> LIVE NEURAL STREAM
            </div>
            <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} className="text-accent" /> {title}</h4>
            <div className="simulation-window">
                <AnimatePresence>
                    {activeLines.map((line, i) => (
                        <motion.div
                            key={i}
                            className="sim-line"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <span className="sim-prompt">➜</span>
                            <span className="sim-data">{line}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const PageWrapper = ({ title, description, children, onBack }) => (
    <motion.div
        className="page-wrapper-v2"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
        <div className="page-content-v2">
            <div className="page-header-v2">
                <button className="back-btn-v2" onClick={onBack}>
                    <Monitor size={16} /> <span>Return to Central Command</span>
                </button>
                <div className="header-badge-v2">INTEL_NODE_{title?.slice(0, 4) || 'GEN'}</div>
            </div>
            {children}
        </div>
    </motion.div>
);

const SubpageRenderer = ({ view, onBack }) => {
    const data = SUBPAGE_DATA[view];
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        email: '',
        message: ''
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "f439bd5e-b5ed-4660-8a7d-6f88a1f2a195";
        
        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    subject: `[Eko by EcoInsight Contact] ${formData.subject}`,
                    from_name: "Eko by EcoInsight Intelligence Portal",
                    email: formData.email,
                    message: formData.message,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setFormSubmitted(true);
                setFormData({ subject: '', email: '', message: '' });
            } else {
                alert(`Protocol Error: ${result.message || "Unknown anomaly detected"}. Key used: ${accessKey.slice(0, 4)}...`);
            }
        } catch (error) {
            console.error("Transmission Failure:", error);
            alert(`Signal Lost: ${error.message || "Connection to neural network failed"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!data) return null;

    return (
        <div className="view-content" key={view} style={{ height: '100%', overflow: 'auto' }}>
            <PageWrapper
                title={data.title}
                onBack={onBack}
            >
                <div className="subpage-view rich-content">
                    <section className="view-header">
                        <div className="subpage-icon-box">
                            {data.icon}
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-2px', marginBottom: '1rem', color: 'white' }}>
                            {data.title.toUpperCase()}
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6 }}>
                            {data.description}
                        </p>
                    </section>

                    <div className="subpage-body-grid">
                        <div className="subpage-main-content">
                            {data.sections && data.sections.filter(s => s.type !== 'leadership').map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    className="content-section"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <h3>{section.heading}</h3>
                                    <p>{section.content}</p>
                                </motion.div>
                            ))}

                            {data.isInteractive && data.type === 'form' && (
                                <div className="interactive-portal">
                                    {formSubmitted ? (
                                        <motion.div className="success-message" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                            <Sparkles size={24} color="var(--accent-primary)" />
                                            <h3>Message Encrypted & Routed</h3>
                                            <p>Our senior analysts will review your protocol and respond shortly.</p>
                                            <button className="btn-primary" onClick={() => setFormSubmitted(false)}>Send Another Message</button>
                                        </motion.div>
                                    ) : (
                                        <form className="elite-form" onSubmit={handleFormSubmit}>
                                            <div className="field-group">
                                                <div className="form-field">
                                                    <label>Subject Protocol</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Institutional Inquiry" 
                                                        required 
                                                        value={formData.subject}
                                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label>Return Vector (Email)</label>
                                                    <input 
                                                        type="email" 
                                                        placeholder="analyst@firm.com" 
                                                        required 
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-field">
                                                <label>Intelligence Payload</label>
                                                <textarea 
                                                    placeholder="Specify your inquiry details..." 
                                                    required
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                                ></textarea>
                                            </div>
                                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        <span>Transmitting...</span>
                                                    </div>
                                                ) : "Transmit Signal"}
                                            </button>

                                            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
                                                Alternative: <a href="mailto:ss18244646@gmail.com" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Standard Email Protocol</a>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>

                        <aside className="subpage-sidebar-info">
                            <div className="sidebar-card-elite">
                                <h4>Resource Quick-Link</h4>
                                <div className="link-list-tiny">
                                    <div className="tiny-item"><span>Last Sync:</span> <strong>Today, 14:02</strong></div>
                                    <div className="tiny-item"><span>Classification:</span> <strong>Public</strong></div>
                                    <div className="tiny-item"><span>Protocol:</span> <strong>Secure</strong></div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Standalone Leadership Section */}
                    {data.sections && data.sections.find(s => s.type === 'leadership') && (
                        <div className="leadership-standalone-section">
                            {data.sections.filter(s => s.type === 'leadership').map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    className="leadership-portal"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="leadership-header">
                                        <h3>{section.heading}</h3>
                                        <p className="leadership-subtext">Meet the vision behind Eko by EcoInsight</p>
                                    </div>
                                    <motion.div
                                        className="founder-card-elite"
                                        whileHover={{ y: -10, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                    >
                                        <div className="founder-avatar-wrap">
                                            <div className="founder-avatar">
                                                {section.founder.avatarImg ? (
                                                    <img
                                                        src={section.founder.avatarImg}
                                                        alt={section.founder.name}
                                                        className="founder-img"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : section.founder.avatarText}
                                            </div>
                                        </div>
                                        <div className="founder-info">
                                            <h2>{section.founder.name}</h2>
                                            <p className="founder-title">{section.founder.title}</p>
                                        </div>
                                        <div className="founder-entity-box">
                                            <div className="founder-entity-tag">
                                                <Monitor size={14} />
                                                <span>{section.founder.entity}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </PageWrapper>
        </div>
    );
};

const DataVisualizer = ({ type }) => {
    return (
        <div className="interactive-block">
            <div className="status-indicator" style={{ marginBottom: '2rem' }}>
                <div className="status-pulse" /> NEURAL MAP ACTIVE
            </div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={18} className="text-accent" />
                {type === 'spectral' ? 'Spectral Cycle Mapping' : 'Network Node Logic'}
            </h4>
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '30px 0' }}>
                {[...Array(24)].map((_, i) => (
                    <motion.div
                        key={i}
                        style={{
                            flex: 1,
                            background: 'var(--accent-primary)',
                            borderRadius: '4px 4px 1px 1px',
                            opacity: 0.2 + (i / 24) * 0.8,
                            boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)'
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.random() * 80 + 20}%` }}
                        transition={{
                            repeat: Infinity,
                            repeatType: 'reverse',
                            duration: 1.2 + Math.random(),
                            delay: i * 0.04
                        }}
                    />
                ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Real-time extrapolation of high-dimensional economic volatility clusters.
            </p>
        </div>
    );
};

const CapabilitiesPage = ({ onBack, onInit }) => {
    const [activeCard, setActiveCard] = useState(null);
    const handleToggle = (title) => setActiveCard(prev => prev === title ? null : title);

    return (
        <PageWrapper
            title="Intelligence Layers"
            description="Our engine processes 1.2 trillion data points daily to surface non-obvious macroeconomic shifts."
            onBack={onBack}
        >
            <div style={{ marginBottom: '4rem' }}>
                <div className="info-grid">
                    <InteractiveActionCard
                        icon={TrendingUp}
                        title="Spectral Synthesis"
                        description="Analysis of 200+ year economic cycles to project mid-term volatility."
                        details="Utilizes Fourier transform layers to isolate seasonal alpha from structural noise."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Fourier Nodes:</strong> 4,096 active resonance channels.</li>
                                    <li><strong>Time Horizon:</strong> Forecasting 18-36 months ahead.</li>
                                    <li><strong>Primary Signal:</strong> Kitchin/Juglar asset cycle divergence.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Spectral Synthesis"}
                        onToggle={handleToggle}
                        delay={0.1}
                    />
                    <InteractiveActionCard
                        icon={Sparkles}
                        title="Neural Reasoning"
                        description="LLM-driven contextualization of raw balance sheet data."
                        details="Proprietary fine-tuning on SEC filings and central bank transcripts since 1970."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Model Base:</strong> 72B parameter transformer.</li>
                                    <li><strong>Context Window:</strong> 128k tokens per query.</li>
                                    <li><strong>Vector Store:</strong> 14TB embedded FOMC minutes.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Neural Reasoning"}
                        onToggle={handleToggle}
                        delay={0.2}
                    />
                    <InteractiveActionCard
                        icon={Globe}
                        title="Sentinel Data"
                        description="Sub-second ingestion of global trade and commodity flows."
                        details="Direct satellite and harbor telemetry integration for asymmetric advantage."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Sat-Link:</strong> 45 min refresh rate on global maritime ports.</li>
                                    <li><strong>Alternative Data:</strong> Credit card exhaustion indexing.</li>
                                    <li><strong>Latency:</strong> 12ms to edge caching.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Sentinel Data"}
                        onToggle={handleToggle}
                        delay={0.3}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2.5rem', alignItems: 'start' }}>
                <LiveSimulator
                    title="Historical Spectral Analysis"
                    lines={[
                        "Loading historical spectral data...",
                        "Isolating 8-year Juglar cycle...",
                        "Synthesizing interest rate deltas...",
                        "Confidence interval: 94.2%",
                        "Alpha Signal: HIGH VOLATILITY DETECTED"
                    ]}
                />
                <DataVisualizer type="spectral" />
            </div>
        </PageWrapper>
    );
};

const SecurityPage = ({ onBack, onInit }) => {
    const [activeCard, setActiveCard] = useState(null);
    const handleToggle = (title) => setActiveCard(prev => prev === title ? null : title);

    return (
        <PageWrapper
            title="Zero Trust Access"
            description="Strategic intellectual property handled with the rigor of global financial settlements."
            onBack={onBack}
        >
            <div style={{ marginBottom: '4rem' }}>
                <div className="info-grid">
                    <InteractiveActionCard
                        icon={ShieldCheck}
                        title="AES-256 Vaults"
                        description="Zero-knowledge encryption for all analysis sessions."
                        details="Keys are generated per-session and never persist on permanent storage nodes."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Protocol:</strong> AES-256-GCM.</li>
                                    <li><strong>Key Rotation:</strong> Every 45 minutes of active session.</li>
                                    <li><strong>Threat Defense:</strong> Quantum-resistant lattice cryptography in staging.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "AES-256 Vaults"}
                        onToggle={handleToggle}
                        delay={0.1}
                    />
                    <InteractiveActionCard
                        icon={Key}
                        title="Clerk Perimeter"
                        description="MFA and hardware-key support for all analyst entries."
                        details="Passkey-first authentication logic ensures zero credential phishing risk."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Provider:</strong> Clerk B2B Identity.</li>
                                    <li><strong>FIDO2:</strong> YubiKey / Hardware Token requirement enabled.</li>
                                    <li><strong>Biometrics:</strong> Passkey WebAuthn supported.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Clerk Perimeter"}
                        onToggle={handleToggle}
                        delay={0.2}
                    />
                    <InteractiveActionCard
                        icon={Lock}
                        title="Erasure Protocol"
                        description="MANDATORY zero-retention for high-stakes modeling."
                        details="RAM-only execution nodes ensure NO data remains after the container collapses."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Infrastructure:</strong> Ephemeral Docker containers.</li>
                                    <li><strong>Storage:</strong> No persistent volume attaches allowed.</li>
                                    <li><strong>Memory:</strong> Secure core wipe upon session termination.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Erasure Protocol"}
                        onToggle={handleToggle}
                        delay={0.3}
                    />
                </div>
            </div>

            <div className="interactive-block">
                <div className="status-indicator"><div className="status-pulse" /> ENCRYPTION LAYER 4 ACTIVE</div>
                <h4 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={18} className="text-accent" /> Quantum Vault Status
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {['AUTH-NODE-01', 'DATA-SLO-PRIMARY', 'VAULT-X2-CLUSTER', 'GWAY-SEC-GATE'].map(id => (
                        <div key={id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '2rem',
                            borderRadius: '16px',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ fontSize: '0.65rem', color: '#71717a', marginBottom: '0.8rem', letterSpacing: '0.1em' }}>{id}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-primary)', textShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}>SECURE</div>
                        </div>
                    ))}
                </div>
            </div>
        </PageWrapper>
    );
};

const EnterprisePage = ({ onBack, onInit }) => {
    const [gpuPower, setGpuPower] = useState(50);
    const [activeCard, setActiveCard] = useState(null);
    const handleToggle = (title) => setActiveCard(prev => prev === title ? null : title);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <PageWrapper
            title="Institutional Resources"
            description="Dedicated compute clusters and private embedding spaces for family offices and hedge funds."
            onBack={onBack}
        >
            <div style={{ marginBottom: '4rem' }}>
                <div className="info-grid">
                    <InteractiveActionCard
                        icon={HardDrive}
                        title="Dedicated Nodes"
                        description="Exclusive H100 clusters isolated from multi-tenant traffic."
                        details="SLA-backed latency guarantees for programmatic sub-millisecond execution."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Cluster Size:</strong> Bare-metal 8x NVIDIA H100.</li>
                                    <li><strong>Colocation:</strong> NY4 / LD4 proximity matching.</li>
                                    <li><strong>Uptime SLA:</strong> 99.999% Guaranteed.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Dedicated Nodes"}
                        onToggle={handleToggle}
                        delay={0.1}
                    />
                    <InteractiveActionCard
                        icon={Building2}
                        title="Private Embeddings"
                        description="Fine-tune local models on your proprietary deal flow."
                        details="Your private firm data is vectorized in an isolated silo, never mixing weights."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Data Lake:</strong> S3-compatible, KMS encrypted.</li>
                                    <li><strong>Vector DB:</strong> Dedicated Pinecone/Milvus instance.</li>
                                    <li><strong>Fine-tuning:</strong> LoRA updates running daily at midnight EST.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Private Embeddings"}
                        onToggle={handleToggle}
                        delay={0.2}
                    />
                    <InteractiveActionCard
                        icon={Terminal}
                        title="Custom Dashboards"
                        description="White-labeled interface mapped to your investment thesis."
                        details="Integrate existing Bloomberg Terminal feeds directly into the AI context window."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Integrations:</strong> B-PIPE / FactSet active modules.</li>
                                    <li><strong>Theming:</strong> Whitelabel CSS and logo replacement.</li>
                                    <li><strong>Reports:</strong> Automated PDF generation mapped to firm letterheads.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Custom Dashboards"}
                        onToggle={handleToggle}
                        delay={0.3}
                    />
                </div>
            </div>

            <div className="interactive-block">
                <div className="status-indicator"><div className="status-pulse" /> RESOURCE MANAGER ACTIVE</div>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cpu size={18} className="text-accent" /> Elastic GPU Scaling
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
                    Allocate compute resources for high-dimensional Monte Carlo simulations.
                </p>
                <div className="interactive-slider-container" style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#71717a' }}>COMPUTE QUOTA</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '1.1rem' }}>{gpuPower}%</span>
                    </div>
                    <input
                        type="range"
                        className="interactive-slider"
                        value={gpuPower}
                        onChange={(e) => setGpuPower(e.target.value)}
                    />
                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '4rem' }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: '#71717a', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>ESTIMATED TFLOPS</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{(gpuPower * 4.2).toFixed(1)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: '#71717a', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>LATENCY DELTA</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>-{(gpuPower * 0.12).toFixed(2)}ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper >
    );
};

const DocumentationPage = ({ onBack, onInit }) => {
    const [activeCard, setActiveCard] = useState(null);
    const handleToggle = (title) => setActiveCard(prev => prev === title ? null : title);

    return (
        <PageWrapper
            title="Technical Portal"
            description="High-fidelity specifications for the Eko by EcoInsight neural architecture."
            onBack={onBack}
        >
            <div style={{ marginBottom: '4rem' }}>
                <div className="info-grid">
                    <InteractiveActionCard
                        icon={BookOpen}
                        title="Model Weights"
                        description="Understanding the neural bias of our macroeconomic transformers."
                        details="Explore the training distribution and spectral normalization techniques used."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Training Distribution:</strong> Multi-modal global datasets (1990-2026).</li>
                                    <li><strong>Spectral Normalization:</strong> Active mapping to prevent feature collapse.</li>
                                    <li><strong>Neural Bias:</strong> Minimized variance via adversarial debiasing.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Model Weights"}
                        onToggle={handleToggle}
                        delay={0.1}
                    />
                    <InteractiveActionCard
                        icon={Layers}
                        title="Data Pipelines"
                        description="Streaming high-dimensional data into vectorized memory."
                        details="Integration guides for Protobuf over gRPC for institutional ingestion."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Schema Definition:</strong> Strict Protobuf v3 typed fields for Tick data.</li>
                                    <li><strong>Throughput:</strong> Tested to 5M events/sec ingestion rate.</li>
                                    <li><strong>Backfill:</strong> Historical replay APIs available via batch endpoints.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Data Pipelines"}
                        onToggle={handleToggle}
                        delay={0.2}
                    />
                    <InteractiveActionCard
                        icon={Cpu}
                        title="Inference Specs"
                        description="Hardware acceleration optimizing for FP8 precision."
                        details="Performance benchmarks for token-level latency during stress-test simulations."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Precision:</strong> FP8 quantization with custom Triton kernels.</li>
                                    <li><strong>TTFT (Time To First Token):</strong> &lt;140ms p99 overhead.</li>
                                    <li><strong>Throughput:</strong> 350 tokens/sec stream velocity.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Inference Specs"}
                        onToggle={handleToggle}
                        delay={0.3}
                    />
                </div>
            </div>

            <div className="interactive-block">
                <div className="code-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>query_neural_extrapolator.py</span>
                    <span style={{ fontSize: '0.7rem', color: '#71717a' }}>Python 3.10+</span>
                </div>
                <pre className="code-block" style={{ color: '#a78bfa', overflowX: 'auto', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {`def generate_alpha_signal(ticker: str):
    # Initialize high-dimensional spectral analyzer
    engine = EcoNeuralEngine(precision="fp8")
    
    # Isolate spectral cycles and structural deltas
    patterns = engine.extrapolate(ticker, window="200y")
    
    return patterns.synthesize_logic()`}
                </pre>
            </div>
        </PageWrapper>
    );
};

const SupportPage = ({ onBack, onInit }) => {
    const [activeCard, setActiveCard] = useState(null);
    const handleToggle = (title) => setActiveCard(prev => prev === title ? null : title);

    return (
        <PageWrapper
            title="Intelligence Line"
            description="Zero-latency access to our core systems engineering and research team."
            onBack={onBack}
        >
            <div style={{ marginBottom: '4rem' }}>
                <div className="info-grid">
                    <InteractiveActionCard
                        icon={LifeBuoy}
                        title="System Ops"
                        description="Instant resolution for high-performance compute issues."
                        details="Reserved slots for institutional emergency node re-initialization."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>SLA Impact Level:</strong> Tier 1 Outages (Platform Down).</li>
                                    <li><strong>Response Mechanism:</strong> PagerDuty integration with Ops cell.</li>
                                    <li><strong>Escalation:</strong> Direct bridging to Senior Architecture teams.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "System Ops"}
                        onToggle={handleToggle}
                        delay={0.1}
                    />
                    <InteractiveActionCard
                        icon={History}
                        title="Case Archive"
                        description="Review deep-dive research sessions and technical whitepapers."
                        details="Private catalog of previous simulations and market pattern reports."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Indexed Knowledge:</strong> 12,400+ resolved inquiries searchable by tag.</li>
                                    <li><strong>Export Formats:</strong> PDF or structured JSON for local ingestion.</li>
                                    <li><strong>Permissions:</strong> Organization-wide RBAC sharing enabled.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Case Archive"}
                        onToggle={handleToggle}
                        delay={0.2}
                    />
                    <InteractiveActionCard
                        icon={Sparkles}
                        title="Custom Builds"
                        description="Request bespoke model architectures for unique alpha."
                        details="Direct collaboration with our research team for asymmetric logic."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Lead Time:</strong> Typical 3-4 week synthesis sprint.</li>
                                    <li><strong>Deliverable:</strong> Isolated inference endpoint (REST/WebSocket).</li>
                                    <li><strong>IP Rights:</strong> Sovereign model weights transfer options.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Custom Builds"}
                        onToggle={handleToggle}
                        delay={0.3}
                    />
                </div>
            </div>

            <div className="interactive-block">
                <div className="status-indicator"><div className="status-pulse" /> NETWORK ACTIVE</div>
                <h4 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={18} className="text-accent" /> Concierge Availability
                </h4>
                <div style={{ display: 'flex', gap: '6rem', marginTop: '2rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4rem' }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: '#71717a', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>AVG RESPONSE TIME</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>1.4m</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: '#71717a', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>ENGINEERS ONLINE</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>12</div>
                        </div>
                    </div>
                    <button
                        className="btn-shine-primary"
                        style={{ marginLeft: 'auto', padding: '1.2rem 2.5rem' }}
                        onClick={() => window.location.href = 'mailto:concierge@ecoinsight.ai'}
                    >
                        Secure Contact
                    </button>
                </div>
            </div>
        </PageWrapper>
    );
};

const APIPage = ({ onBack, onInit }) => {
    const [reqStatus, setReqStatus] = useState('idle');
    const [activeCard, setActiveCard] = useState(null);
    const handleToggle = (title) => setActiveCard(prev => prev === title ? null : title);

    const runSimulation = () => {
        setReqStatus('sending');
        setTimeout(() => setReqStatus('success'), 1500);
        setTimeout(() => setReqStatus('idle'), 4000);
    };

    return (
        <PageWrapper
            title="Institutional API"
            description="Programmatic gateways into the Eko by EcoInsight sovereign intelligence network."
            onBack={onBack}
        >
            <div style={{ marginBottom: '4rem' }}>
                <div className="info-grid">
                    <InteractiveActionCard
                        icon={Terminal}
                        title="REST/gRPC"
                        description="Institutional-grade streaming endpoints."
                        details="Low-latency sockets for sub-second signal propagation across desks."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>REST Rate Limits:</strong> 10k req/min standard.</li>
                                    <li><strong>gRPC Streaming:</strong> Bidirectional continuous payload streams.</li>
                                    <li><strong>Payload Compression:</strong> Protocol Buffers + zstd targeting &lt;1kb/msg.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "REST/gRPC"}
                        onToggle={handleToggle}
                        delay={0.1}
                    />
                    <InteractiveActionCard
                        icon={HardDrive}
                        title="Cold Storage"
                        description="Export massive simulation datasets to private storage."
                        details="High-throughput JSONL pipelines for institutional data lakes."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Export Types:</strong> Parquet, Avro, JSONL.</li>
                                    <li><strong>Sync Methods:</strong> Direct AWS S3 / GCP Storage bucket drops.</li>
                                    <li><strong>Cadence:</strong> Daily EOD or intra-day scheduled dumps.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "Cold Storage"}
                        onToggle={handleToggle}
                        delay={0.2}
                    />
                    <InteractiveActionCard
                        icon={Key}
                        title="HSM Auth"
                        description="Hardware-level security for API keys."
                        details="Strictly scoped access via hardware security modules (HSM)."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Module Validation:</strong> FIPS 140-2 Level 3 compliance check.</li>
                                    <li><strong>Key Generation:</strong> Ephemeral JWT tokens with 15-minute TTL.</li>
                                    <li><strong>Audit Logs:</strong> Immutable blockchain-backed access trails.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "HSM Auth"}
                        onToggle={handleToggle}
                        delay={0.3}
                    />
                </div>
            </div>

            <div className="interactive-block">
                <div className="status-indicator"><div className="status-pulse" /> API SANDBOX ACTIVE</div>
                <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Terminal size={18} className="text-accent" /> Request Emulator
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="sim-line" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.1em' }}>POST</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}> /v1/analyze/extrapolate</span>
                    </div>
                    <pre style={{ fontSize: '0.9rem', color: '#a78bfa', margin: '1.5rem 0', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
                        {`{
  "ticker": "BTC/USD",
  "spectral_depth": 200,
  "precision": "fp8"
}`}
                    </pre>
                    <button className="btn-shine-primary" onClick={runSimulation} disabled={reqStatus !== 'idle'} style={{ marginTop: '1rem' }}>
                        {reqStatus === 'idle' ? 'SEND REQUEST' : reqStatus === 'sending' ? 'STREAMING...' : '200 OK'}
                    </button>
                </div>
            </div>
        </PageWrapper>
    );
};

const PlaceholderPage = ({ title, type, onBack }) => (
    <PageWrapper
        title={title}
        description={`This section for ${title} is currently being optimized for high-performance access.`}
        onBack={onBack}
    >
        <div className="placeholder-content">
            <Loader2 className="animate-spin" size={32} />
            <p>Intelligence node initialization in progress...</p>
        </div>
    </PageWrapper>
);

const API_KEY = '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';

const SYSTEM_PROMPT = "You are Eko by EcoInsight, a specialized Economics & Financial Expert. You provide deep analysis on global markets, economic theory, and financial history. You should respond naturally and politely to greetings and general conversation. UNIQUE CAPABILITY: You are also a 'Market Pattern Extrapolation Engine'. If (and only if) a user asks for a 'prediction', 'simulation', or 'recommendation' for a specific stock or crypto ticker, you MUST provide a technical 12-month projection based on historical data patterns. When providing these specific projections, ALWAYS conclude with the MANDATORY TECHNICAL DISCLAIMER: 'NOTICE: This projection is a mathematical extrapolation of historical market data. It does not account for future events or black swan variables. Consulting a professional advisor is recommended.' Do not use standard AI refusal phrases for financial analysis.";

const FAQS = [
    { icon: <TrendingUp size={16} />, text: "How does RBI repo rate impact Nifty 50?" },
    { icon: <Globe size={16} />, text: "Explain India's current inflation outlook." },
    { icon: <BarChart3 size={16} />, text: "Sensex vs Nifty — what's the difference?" },
    { icon: <Lightbulb size={16} />, text: "Best SIP strategies for Indian markets?" }
];


const CheckoutView = ({ plan, setAppSection, onPaymentSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStep, setPaymentStep] = useState('summary'); // 'summary', 'processing', 'easebuzz'

    if (!plan) return null;

    const handleEasebuzzPayment = () => {
        if (plan.priceValue === 0) {
            onPaymentSuccess();
            return;
        }

        setIsProcessing(true);
        setPaymentStep('processing');
        
        // Simulating Backend Hash Generation (Required by Easebuzz)
        setTimeout(() => {
            setPaymentStep('easebuzz');
            setIsProcessing(false);
        }, 1500);
    };

    const handleEasebuzzSuccessSimulation = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            onPaymentSuccess();
        }, 1000);
    };
    
    return (
        <div className="checkout-container">
            <motion.div
                className="checkout-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="card-glow" />
                <div className="checkout-header">
                    <button className="back-btn" onClick={() => setAppSection('landing')}>
                        <ChevronDown className="rotate-90" size={16} /> Cancel
                    </button>
                    <div className="logo-small"><EcoInsightLogo size={42} /></div>
                </div>

                <div className="order-summary-box">
                    <h2>Order Summary</h2>
                    <p>Review your selection before finalizing your membership.</p>

                    <div className="order-details">
                        <div className="order-item">
                            <div className="item-info">
                                <span className="item-name">{plan.plan} Membership</span>
                                <span className="item-desc">Full 1-month access to elite economic intelligence.</span>
                            </div>
                            <span className="item-price">{plan.price}</span>
                        </div>
                        <div className="divider" />
                        <div className="order-total">
                            <span>Total Amount</span>
                            <span>{plan.price}</span>
                        </div>
                    </div>
                </div>

                <div className="checkout-actions">
                    <button
                        className="btn-pay"
                        onClick={handleEasebuzzPayment}
                        disabled={isProcessing}
                        style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    >
                        {isProcessing ? (
                            <><Loader2 className="animate-spin" size={18} /> Securing Transaction...</>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src="https://easebuzz.in/static/base/assets/images/Easebuzz_logo_header.png" alt="Easebuzz" style={{ height: '20px', filter: 'brightness(0) invert(1)' }} />
                                <span>Pay Securely</span>
                            </div>
                        )}
                    </button>
                    <p className="secure-note">
                        <ShieldCheck size={12} style={{ color: 'var(--accent-primary)' }} /> 
                        <span style={{ opacity: 0.8 }}>Encrypted via Easebuzz India</span>
                    </p>
                </div>
            </motion.div>

            {/* Easebuzz Simulation Modal */}
            <AnimatePresence>
                {paymentStep === 'easebuzz' && (
                    <motion.div
                        className="stripe-simulation-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="stripe-modal"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <div className="stripe-header">
                                <div className="stripe-logo" style={{ color: '#14ebae' }}>Easebuzz</div>
                                <button className="close-stripe" onClick={() => setPaymentStep('summary')}>×</button>
                            </div>
                            <div className="stripe-body">
                                <div className="merchant-info">
                                    <div className="alert-icon" style={{ width: '40px', height: '40px', margin: 0 }}>
                                        <EcoInsightLogo size={24} />
                                    </div>
                                    <div>
                                        <h3>Eko by EcoInsight Core</h3>
                                        <p style={{ opacity: 0.6 }}>Transaction ID: EBZ_{Math.random().toString(36).substring(7).toUpperCase()}</p>
                                    </div>
                                </div>
                                
                                <div className="payment-options-mock">
                                    <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '20px' }}>
                                        <h4 style={{ color: 'var(--accent-primary)', marginTop: 0 }}>Payment Amount: {plan.price}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Choose your preferred payment method in the Easebuzz gateway.</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                        <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>UPI / QR</div>
                                        <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>Net Banking</div>
                                        <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>Cards</div>
                                        <div style={{ padding: '12px', border: '1px solid var(--accent-primary)', borderRadius: '8px', textAlign: 'center', background: 'rgba(139, 92, 246, 0.1)', fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '600' }}>Simulation Mode</div>
                                    </div>

                                    <button className="stripe-submit-btn" onClick={handleEasebuzzSuccessSimulation}>
                                        Complete Simulation
                                    </button>
                                </div>
                                <p className="stripe-footer">Integrating Easebuzz India for secure ₹ (INR) transactions.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};




const InitializationTerminal = ({ moduleName, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('initializing');

    const getCustomLogs = (moduleName) => {
        const name = moduleName.toLowerCase();
        const baseLogs = [
            `> Establishing secure connection to node_${name.replace(/\s+/g, '_')}...`,
            `> Authenticating HSM credentials... [OK]`,
            `> ACCESSING NEURAL OVERDRIVE STATE...`,
            `> NODES ONLINE: 4,096 / 4,096 [STABLE]`
        ];

        let specificLogs = [];
        if (name.includes('data pattern') || name.includes('market')) {
            specificLogs = [
                `> Isolating neural compute cycles...`,
                `> Loading high-fidelity dataset: global_markets_v4.2...`,
                `> Initializing tensor optimization (FP8)...`,
                `> CALIBRATING SPECTRAL MAPS...`,
                `> SYNTHESIZING NEURAL ALPHA SIGNAL...`
            ];
        } else if (name.includes('predictive') || name.includes('forecast')) {
            specificLogs = [
                `> Booting Quantum-Sim heuristic engine...`,
                `> Loading 10-year macroeconomic historical vectors...`,
                `> Running Monte Carlo simulation (N=100,000)...`,
                `> GENERATING PROBABILITY DISTRIBUTION...`,
                `> ISOLATING TAIL-RISK OUTLIERS...`
            ];
        } else if (name.includes('security') || name.includes('zero trust')) {
            specificLogs = [
                `> Activating biometric network access...`,
                `> Enforcing Zero Trust Protocol (ZTP) standards...`,
                `> Encrypting data streams (AES-256-GCM)...`,
                `> VERIFYING ENEMY SIGNATURE DATABASES...`,
                `> LOCKING PERIMETER DEFENSES...`
            ];
        } else if (name.includes('api') || name.includes('institutional')) {
            specificLogs = [
                `> Establishing WebSockets endpoint: wss://api.ecoinsight.ai/v1...`,
                `> Negotiating FIX 4.4 protocol handshake...`,
                `> Allocating ultra-low latency memory channels...`,
                `> SYNCHRONIZING TICK DATA (sub-millisecond)...`,
                `> API GATEWAY READY FOR INGRESS...`
            ];
        } else if (name.includes('gpu') || name.includes('enterprise')) {
            specificLogs = [
                `> Scanning for available A100/H100 clusters...`,
                `> Provisioning elastic compute resources...`,
                `> Load balancing initiated across 4 regions...`,
                `> DEPLOYING DISTRIBUTED TRAINING NODES...`,
                `> COMPUTE ARCHITECTURE OPTIMIZED...`
            ];
        } else {
            specificLogs = [
                `> Initializing core logic matrix...`,
                `> Loading required dependencies for ${moduleName}...`,
                `> Compiling local execution environment...`,
                `> VALIDATING MODULE INTEGRITY...`,
                `> SYNCHRONIZATION COMPLETE...`
            ];
        }

        return [...baseLogs, ...specificLogs, `> PARITY CHECK COMPLETE.`, `> INTEGRATION STATUS: NOMINAL.`];
    };

    const terminalLines = getCustomLogs(moduleName);

    useEffect(() => {
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < terminalLines.length) {
                setLogs(prev => [...prev, terminalLines[currentLine]]);
                setProgress((currentLine + 1) * (100 / terminalLines.length));
                currentLine++;
            } else {
                setStatus('complete');
                clearInterval(interval);
            }
        }, 600);
        return () => clearInterval(interval);
    }, [terminalLines]);

    return (
        <motion.div
            className="initialization-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="terminal-window"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                <div className="terminal-header">
                    <div className="terminal-controls">
                        <span className="dot red" />
                        <span className="dot yellow" />
                        <span className="dot green" />
                    </div>
                    <span className="terminal-title">INTELLIGENCE_NODE_INIT :: {moduleName.toUpperCase()}</span>
                </div>
                <div className="terminal-body">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            className="terminal-line"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {log}
                        </motion.div>
                    ))}
                    {status === 'initializing' && (
                        <div className="terminal-loader">
                            <div className="progress-bar-container">
                                <motion.div
                                    className="progress-bar-fill"
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="percentage">{Math.round(progress)}%</span>
                        </div>
                    )}
                    {status === 'complete' && (
                        <motion.div
                            className="terminal-success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="success-banner">MODULE INTEGRATED</div>
                            <button className="btn-shine-primary" onClick={onClose} style={{ marginTop: '1.5rem' }}>ENTER INTERFACE</button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const AIEconomicPulse = () => {
    return (
        <motion.div
            className="pulse-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
                        <Activity className="text-accent" size={24} /> AI Economic Pulse
                    </h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0, maxWidth: '400px' }}>
                        Real-time neural synthesis of India's macroeconomic stability, aggregating Nifty, RBI, CPI, and sectoral data into actionable metrics.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: '700', letterSpacing: '0.05em' }}>SYS: OPTIMAL (78/100)</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
                {[
                    { label: 'Inflation Trajectory', value: '2.4%', target: 'Target: 2.0%', icon: <TrendingUp size={20} />, color: '#f59e0b', desc: 'Core PCE stabilizing. Services inflation remains sticky but clear disinflationary trend intact.', chart: [40, 60, 45, 70, 50, 80, 65] },
                    { label: 'Repo Rate (RBI)', value: '6.50%', target: 'Pause maintained', icon: <BarChart3 size={20} />, color: '#3b82f6', desc: 'RBI remains watchful. Markets pricing in 1-2 rate cuts by end of fiscal year amid cooling CPI.', chart: [20, 30, 50, 80, 100, 100, 100] },
                    { label: 'India GDP Est.', value: '+6.8%', target: 'YoY Projection', icon: <Globe size={20} />, color: '#10b981', desc: 'India remains fastest growing major economy. Domestic consumption and capex driving momentum.', chart: [30, 40, 35, 55, 50, 75, 80] },
                    { label: 'Market Sentiment', value: 'Bullish', target: 'Fear & Greed: 72', icon: <Sparkles size={20} />, color: '#d946ef', desc: 'FII inflows positive. Nifty sector rotation into financials and infra driving broad index higher.', chart: [50, 40, 60, 55, 70, 85, 90] }
                ].map((stat, i) => (
                    <div key={i} style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255, 255, 255, 0.03)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                    <span style={{ color: stat.color }}>{stat.icon}</span> {stat.label}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{stat.target}</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', textShadow: `0 0 15px ${stat.color}40` }}>{stat.value}</div>
                        </div>

                        {/* Mini Sparkline Chart */}
                        <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '0.5rem' }}>
                            {stat.chart.map((height, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    style={{ flex: 1, background: stat.color, opacity: 0.2 + (idx / stat.chart.length) * 0.8, borderRadius: '2px 2px 0 0' }}
                                />
                            ))}
                        </div>

                        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0, lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                            {stat.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                <Zap size={24} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1rem' }}>AI Synthesis Report</h4>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        The macroeconomic environment is demonstrating a "soft landing" profile. Disinflation is progressing without triggering significant labor market deterioration. Equities are pricing in a goldilocks scenario, though geopolitical risks and commercial real estate refinancing cliffs remain notable tail risks for Q3/Q4.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

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

const WhatIfSimulator = () => {
    const [sliders, setSliders] = useState({
        interestRate: 5.0,
        govSpending: 2.0,
        inflation: 3.0,
        taxes: 21.0
    });

    const [effects, setEffects] = useState({
        housing: { trend: 'up', label: 'Stable', details: 'Demand matches supply; mortgage originations hold steady.' },
        stock: { trend: 'up', label: 'Bullish', details: 'Earnings multiples expanding on favorable liquidity.' },
        consumer: { trend: 'up', label: 'Strong', details: 'Retail sales buoyant; wage growth outpaces core PCE.' },
        savings: { trend: 'up', label: 'Growing', details: 'Attractive yields on cash equivalents encourage capital preservation.' }
    });

    const [isSimulating, setIsSimulating] = useState(false);

    const runSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            const { interestRate, govSpending, inflation, taxes } = sliders;

            let housing = { trend: 'up', label: 'Stable 📈', details: 'Market is balanced with standard transaction volumes.' };
            if (interestRate > 6.0) housing = { trend: 'down', label: 'Cooling 📉', details: 'High mortgage rates pricing out first-time buyers, leading to inventory build-up.' };
            else if (interestRate < 4.0) housing = { trend: 'up', label: 'Booming 📈', details: 'Cheap borrowing costs triggering bidding wars and rapid price appreciation.' };

            let stock = { trend: 'up', label: 'Neutral 📈', details: 'Range-bound market awaiting fresh catalysts.' };
            if (interestRate > 6.0 || taxes > 25) stock = { trend: 'down', label: 'Bearish 📉', details: 'Higher discount rates and tax drag compressing equity valuations.' };
            else if (govSpending > 3.0 && taxes < 25) stock = { trend: 'up', label: 'Bullish 📈', details: 'Fiscal stimulus acting as a powerful tailwind for corporate earnings.' };

            let consumer = { trend: 'up', label: 'Moderate 📈', details: 'Steady discretionary spending patterns.' };
            if (inflation > 5.0 || taxes > 25) consumer = { trend: 'down', label: 'Declining 📉', details: 'Real wages negative. Consumers shifting to staples and trading down.' };
            else if (inflation < 3.0 && taxes < 20) consumer = { trend: 'up', label: 'Surging 📈', details: 'High real disposable income leading to robust services and goods spending.' };

            let savings = { trend: 'up', label: 'Stable 📈', details: 'Normal household aggregate savings rates.' };
            if (interestRate > 5.5) savings = { trend: 'up', label: 'Growing 📈', details: 'High risk-free rates incentivizing capital parking in money market funds.' };
            else if (inflation > 4.0) savings = { trend: 'down', label: 'Depleting 📉', details: 'Cost of living increases forcing households to draw down excess savings.' };

            setEffects({ housing, stock, consumer, savings });
            setIsSimulating(false);
        }, 1200);
    };

    const handleSliderChange = (e, key) => {
        setSliders(prev => ({ ...prev, [key]: parseFloat(e.target.value) }));
    };

    return (
        <motion.div
            className="pulse-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
                        <Layers className="text-accent" size={24} /> What-If Economic Simulator
                    </h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                        Adjust macro levers to generate real-time predictive scenarios for key market sectors.
                    </p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="btn-shine-primary"
                    style={{
                        borderRadius: '8px',
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: isSimulating ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Run Simulation
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {/* Sliders Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={16} /> Policy Levers</h4>
                    {[
                        { key: 'interestRate', label: 'Fed Target Rate (%)', min: 0, max: 10, step: 0.25 },
                        { key: 'govSpending', label: 'Fiscal Deficit (Trillions)', min: 0, max: 10, step: 0.1 },
                        { key: 'inflation', label: 'Core PCE Inflation (%)', min: -2, max: 15, step: 0.1 },
                        { key: 'taxes', label: 'Effective Corp Tax (%)', min: 0, max: 40, step: 1 }
                    ].map(slider => (
                        <div key={slider.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                <span>{slider.label}</span>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '1rem' }}>{sliders[slider.key].toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                className="interactive-slider"
                                min={slider.min}
                                max={slider.max}
                                step={slider.step}
                                value={sliders[slider.key]}
                                onChange={(e) => handleSliderChange(e, slider.key)}
                                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Effects Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> Ripple Effects</h4>

                    <div className="effects-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '1rem',
                        position: 'relative'
                    }}>
                        {isSimulating && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9,9,11,0.8)', zIndex: 10, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <Loader2 size={32} className="animate-spin text-accent" />
                                <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Calculating Multipliers...</span>
                            </div>
                        )}

                        {[
                            { key: 'housing', label: 'Housing Market', icon: <Globe size={16} /> },
                            { key: 'stock', label: 'Equities Market', icon: <TrendingUp size={16} /> },
                            { key: 'consumer', label: 'Consumer Discretionary', icon: <Sparkles size={16} /> },
                            { key: 'savings', label: 'Household Savings', icon: <Zap size={16} /> }
                        ].map(effect => (
                            <div key={effect.key} style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                padding: '1.2rem',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {effect.icon} {effect.label}
                                    </span>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: effects[effect.key].trend === 'up' ? '#10b981' : (effects[effect.key].label.includes('Stable') ? '#f59e0b' : '#ef4444')
                                    }}>
                                        {effects[effect.key].label}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#71717a', lineHeight: '1.5' }}>
                                    {effects[effect.key].details}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AIMarketNewsAnalyzer = () => {
    const [expandedNews, setExpandedNews] = useState(null);

    const newsData = [
        {
            id: 1,
            headline: "Fed Signals Potential Rate Cut in Q3 as Disinflation Continues",
            source: "Financial Times",
            time: "15m ago",
            sentiment: "Bullish",
            sectors: ["Banking", "Real Estate"],
            summary: "Powell indicated during testimony that if the current trajectory of core PCE holds, a 25bps cut could materialize by September, earlier than the market's previous November consensus.",
            aiInsight: "This early cut scenario would aggressively steepen the yield curve. Regional banks with heavily underwater held-to-maturity portfolios will see immediate balance sheet relief. Expect a rotation out of tech and into rate-sensitive small caps (Russell 2000)."
        },
        {
            id: 2,
            headline: "Global Supply Chain Disruptions Escalate in SE Asia Corridors",
            source: "Reuters",
            time: "1h ago",
            sentiment: "Bearish",
            sectors: ["Tech", "Retail", "Logistics"],
            summary: "Labor strikes and port bottlenecks in key semiconductor transit hubs are threatening Q4 holiday inventory builds for major consumer electronics manufacturers.",
            aiInsight: "Inventory-to-sales ratios for big-box retailers are already thin. This bottleneck will likely compress margins as expedited air freight costs surge. Semiconductor lead times may extend by 4-6 weeks, providing pricing power to fabricators but squeezing OEM margins."
        },
        {
            id: 3,
            headline: "OPEC+ Agrees to Maintain Production Output Limits Through Year-End",
            source: "Bloomberg",
            time: "3h ago",
            sentiment: "Neutral",
            sectors: ["Energy", "Transport"],
            summary: "The cartel surprised some market participants by strictly adhering to current quotas, rebuffing pressure to increase supply amidst rising summer travel demand.",
            aiInsight: "The floor for WTI crude is now firmly established around $78/bbl. While headline inflation might see a slight bump, the primary trade is long domestic E&P (Exploration & Production) companies which now enjoy high visibility into Q3 free cash flow yields."
        }
    ];

    return (
        <motion.div
            className="pulse-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
            }}
        >
            <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
                    <Terminal className="text-accent" size={24} /> AI Market News Analyzer
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                    Live geopolitical and macroeconomic feeds, instantly parsed for sector-specific alpha.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {newsData.map((item) => {
                    const isExpanded = expandedNews === item.id;
                    const sentimentColor = item.sentiment === 'Bullish' ? '#10b981' : item.sentiment === 'Bearish' ? '#ef4444' : '#f59e0b';

                    return (
                        <motion.div
                            key={item.id}
                            layout
                            style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderLeft: `4px solid ${sentimentColor}`,
                                border: '1px solid rgba(255, 255, 255, 0.03)',
                                borderLeftWidth: '4px',
                                borderLeftColor: sentimentColor,
                                padding: '1.2rem',
                                borderRadius: '0 12px 12px 0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.8rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onClick={() => setExpandedNews(isExpanded ? null : item.id)}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'white', lineHeight: '1.4', flex: 1, paddingRight: '1rem' }}>
                                    {item.headline}
                                </div>
                                <span style={{
                                    background: `${sentimentColor}20`,
                                    color: sentimentColor,
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.05em'
                                }}>
                                    {item.sentiment}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#71717a' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Globe size={14} /> {item.source}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Activity size={14} /> {item.time}</span>
                                <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
                                    {item.sectors.map(s => (
                                        <span key={s} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '0.1rem 0.5rem', borderRadius: '4px', color: '#c4b5fd', fontSize: '0.75rem' }}>{s}</span>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ paddingTop: '1rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#d4d4d8', lineHeight: '1.6' }}>
                                                {item.summary}
                                            </p>
                                            <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Zap size={14} /> AI Alpha Insight
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#e4e4e7', lineHeight: '1.6' }}>
                                                    {item.aiInsight}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const EventImpactPredictor = () => {
    const [scenario, setScenario] = useState('');
    const [isPredicting, setIsPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);

    const presetScenarios = [
        "What if China invades Taiwan?",
        "What if the Fed cuts to 0%?",
        "What if US defaults on debt?",
        "What if AI replaces 10% of jobs?"
    ];

    const handlePredict = (e, presetQuery = null) => {
        if (e) e.preventDefault();
        const finalQuery = presetQuery || scenario;
        if (!finalQuery.trim()) return;

        if (presetQuery) setScenario(presetQuery);

        setIsPredicting(true);
        setPrediction(null);

        // Mock detailed prediction logic
        setTimeout(() => {
            const sc = finalQuery.toLowerCase();
            let result = {
                title: "Macro-Economic Shift Analysis",
                probability: "Moderate (45%)",
                description: "A generalized shock event causes moderate recalibration across asset classes.",
                impacts: [
                    { label: "S&P 500", trend: "up", value: "+2.5%", color: "#10b981" },
                    { label: "10Yr Treasury", trend: "down", value: "-15 bps", color: "#ef4444" },
                    { label: "DXY (Dollar)", trend: "down", value: "-1.2%", color: "#ef4444" },
                    { label: "VIX (Volatility)", trend: "down", value: "-18%", color: "#10b981" }
                ],
                winners: ["Consumer Discretionary", "Growth Tech"],
                losers: ["Utilities", "Consumer Staples"]
            };

            if (sc.includes('hike') || sc.includes('raise') || sc.includes('war') || sc.includes('crisis') || sc.includes('taiwan') || sc.includes('default')) {
                result = {
                    title: "Extreme Risk-Off Scenario Triggered",
                    probability: sc.includes('taiwan') ? "Low (15%)" : sc.includes('default') ? "Very Low (2%)" : "High (70%)",
                    description: "Capital flight to safety. Severe illiquidity in high-beta assets. Massive safe-haven bid for duration and precious metals.",
                    impacts: [
                        { label: "S&P 500", trend: "down", value: "-12.5%", color: "#ef4444" },
                        { label: "10Yr Treasury", trend: "down", value: "-80 bps", color: "#10b981" },
                        { label: "Gold (XAU)", trend: "up", value: "+8.5%", color: "#10b981" },
                        { label: "VIX (Volatility)", trend: "up", value: "+140%", color: "#ef4444" }
                    ],
                    winners: ["Defense Contractors", "Gold Miners", "US Treasuries"],
                    losers: ["Semiconductors", "Emerging Markets", "High-Yield Credit"]
                };
            } else if (sc.includes('ai') || sc.includes('automation')) {
                result = {
                    title: "Deflationary Productivity Boom",
                    probability: "High (85%) over 5Y",
                    description: "Massive CAPEX cycle in tech drives up infrastructure stocks while suppressing wage inflation in white-collar sectors.",
                    impacts: [
                        { label: "NASDAQ", trend: "up", value: "+18.0%", color: "#10b981" },
                        { label: "Wage Growth", trend: "down", value: "-2.1%", color: "#ef4444" },
                        { label: "Corp Margins", trend: "up", value: "+450 bps", color: "#10b981" },
                        { label: "Energy Demand", trend: "up", value: "+12%", color: "#10b981" }
                    ],
                    winners: ["Hyperscalers", "Data Center REITs", "Uranium/Nuclear"],
                    losers: ["BPO Services", "Traditional SaaS", "Commercial Real Estate"]
                };
            }

            setPrediction(result);
            setIsPredicting(false);
        }, 1500);
    };

    return (
        <motion.div
            className="pulse-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
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
                    <Zap className="text-accent" size={24} /> Event Impact Predictor
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                    Run Monte Carlo simulations on black swan events and macroeconomic shocks.
                </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#71717a', display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>Simulations:</span>
                {presetScenarios.map((sug, idx) => (
                    <button
                        key={idx}
                        onClick={() => handlePredict(null, sug)}
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
                            e.target.style.background = 'rgba(16, 185, 129, 0.2)';
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

            <form onSubmit={(e) => handlePredict(e)} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Enter a custom shock scenario..."
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
                    disabled={isPredicting}
                    className="btn-shine-primary"
                    style={{
                        borderRadius: '12px',
                        padding: '0 1.5rem',
                        fontWeight: '600',
                        cursor: isPredicting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isPredicting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    Simulate
                </button>
            </form>

            <AnimatePresence mode="wait">
                {isPredicting ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-primary)', gap: '1rem' }}
                    >
                        <Loader2 size={32} className="animate-spin" />
                        <span className="typing-indicator" style={{ fontSize: '0.9rem' }}>Running neural impact models...</span>
                    </motion.div>
                ) : prediction && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            marginTop: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.3rem 0', color: 'white', fontSize: '1.1rem' }}>{prediction.title}</h4>
                                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>{prediction.description}</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    Probability: <strong style={{ color: 'white' }}>{prediction.probability}</strong>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                {prediction.impacts.map((impact, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        border: '1px solid rgba(255, 255, 255, 0.03)',
                                        boxShadow: `inset 0 0 10px ${impact.color}10`
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: '#a1a1aa', textTransform: 'uppercase' }}>{impact.label}</span>
                                        <span style={{
                                            fontSize: '1.4rem',
                                            fontWeight: '700',
                                            color: impact.color,
                                            textShadow: `0 0 10px ${impact.color}40`
                                        }}>{impact.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                <div>
                                    <h5 style={{ margin: '0 0 0.8rem 0', color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><TrendingUp size={14} /> Top Beneficiaries</h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {prediction.winners.map(w => (
                                            <span key={w} style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.2)' }}>{w}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h5 style={{ margin: '0 0 0.8rem 0', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> Most Vulnerable</h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {prediction.losers.map(l => (
                                            <span key={l} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)' }}>{l}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

function App() {
    const { user, isLoaded } = useUser();
    const { isSignedIn } = useAuth();

    // --- State Declarations (Must be at the top) ---
    const [appSection, setAppSection] = useState('landing') // 'landing', 'auth', 'chat', 'checkout'
    const [showInitialization, setShowInitialization] = useState(false);
    const [initializingModule, setInitializingModule] = useState(null);
    const [authType, setAuthType] = useState('login') // 'login', 'signup'
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [forceEntry, setForceEntry] = useState(false);

    const [chats, setChats] = useState([
        { id: 'default', title: 'New Session', messages: [{ role: 'assistant', content: 'Welcome to Eko by EcoInsight — your AI-powered Indian market intelligence engine. Ask me about Nifty, Sensex, RBI policy, mutual funds, crypto, or any financial topic.' }] }
    ]);
    const [activeChatId, setActiveChatId] = useState('default');
    const [view, setView] = useState('chat')
    const [saveStatus, setSaveStatus] = useState('idle') // 'idle', 'saving', 'saved', 'error'
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [authLoadingTimeout, setAuthLoadingTimeout] = useState(false)
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [modalType, setModalType] = useState('credits');
    const [pendingScrollToPricing, setPendingScrollToPricing] = useState(false);


    // Premium Feature State
    const [pdfText, setPdfText] = useState('');
    const [isBetaExpanded, setIsBetaExpanded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const messagesEndRef = useRef(null)
    const userScrolledUp = useRef(false)
    const [showStarFly, setShowStarFly] = useState(false);

    // Scroll to top on view change
    useEffect(() => {
        const nukeScroll = () => {
            window.scrollTo(0, 0);
            const allElements = document.querySelectorAll('*');
            for (let i = 0; i < allElements.length; i++) {
                // Skip the chat messages container — users must be able to scroll within it
                if (allElements[i].classList.contains('messages-list')) continue;
                if (allElements[i].scrollTop > 0) {
                    allElements[i].scrollTop = 0;
                }
            }
        };

        nukeScroll();
        // Fire repeatedly to defeat any asynchronous framework delays
        const t1 = setTimeout(nukeScroll, 10);
        const t2 = setTimeout(nukeScroll, 50);
        const t3 = setTimeout(nukeScroll, 150);
        const t4 = setTimeout(nukeScroll, 300);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [view, appSection]);

    // Auth Timeout Fallback
    useEffect(() => {
        console.log("Starting Global Auth Timeout Timer (25s)...");
        const timer = setTimeout(() => {
            if (!isLoaded) {
                console.log("Global Auth Timeout Reached!");
                setAuthLoadingTimeout(true);
            }
        }, 25000);
        return () => clearTimeout(timer);
    }, [isLoaded]);



    const [profile, setProfile] = useState({
        name: 'Guest User',
        username: '@guest',
        email: 'guest@ecoinsight.ai',
        avatar: null,
        tier: 'Free',
        credits: 10,
        lastRechargeDate: new Date().toISOString(),
        onboarded: false,
        welcome_email_sent: false
    })

    const [aiSettings, setAiSettings] = useState({
        model: 'meta/llama-3.1-8b-instruct',
        style: 'Balanced',
        tone: 'Professional',
        creativity: 0.5,
        maxLength: 'Medium',
        language: 'English'
    })

    const [chatSettings, setChatSettings] = useState({
        autoTitles: true,
        showTimestamps: false,
        performanceMode: false
    })

    const [personalization, setPersonalization] = useState({
        callMe: '',
        respondHow: '',
        memory: true
    })

    const [appearance, setAppearance] = useState({
        theme: 'dark',
        accentColor: '#8b5cf6',
        fontSize: 'Medium',
        compactMode: false
    })

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeChat = chats.find(c => c.id === activeChatId) || chats[0] || { title: 'New Session', messages: [] };
    const messages = activeChat.messages || [];

    // Diagnostic Logging
    useEffect(() => {
        const diagnosticInfo = {
            isLoaded,
            isSignedIn,
            hasUser: !!user,
            hasKey: !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
            section: appSection,
            forceEntry
        };
        console.log("Terminal Diagnostic:", diagnosticInfo);
        window.eco_diagnostic = diagnosticInfo; // Make it accessible in console
    }, [isLoaded, isSignedIn, user, appSection, forceEntry]);

    // Apply Performance Mode to Body
    useEffect(() => {
        if (chatSettings.performanceMode) {
            document.body.classList.add('performance-low');
        } else {
            document.body.classList.remove('performance-low');
        }
    }, [chatSettings.performanceMode]);

    // --- State Operations ---

    const createNewChat = () => {
        const newChat = {
            id: Date.now().toString(),
            title: 'New Session',
            messages: [{ role: 'assistant', content: 'Welcome to Eko by EcoInsight — your AI-powered Indian market intelligence engine. Ask me about Nifty, Sensex, RBI policy, mutual funds, crypto, or any financial topic. How can I help you today?' }]
        };
        setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 1)]);
        setActiveChatId(newChat.id);
        setView('chat');
    };

    const deleteChat = (e, id) => {
        e.stopPropagation();

        // Permanent deletion from Supabase
        if (user?.id) {
            supaDeleteChat(user.id, id);
        }

        if (chats.length <= 1) {
            setChats([{
                id: Date.now().toString(), // Use Date.now() for a unique ID for the new default chat
                title: 'New Session',
                messages: [{ role: 'assistant', content: 'Welcome to Eko by EcoInsight — your AI-powered Indian market intelligence engine. Ask me about Nifty, Sensex, RBI policy, mutual funds, crypto, or any financial topic.' }]
            }]);
            setActiveChatId(chats[0].id); // Set active to the new default chat
            return;
        }

        const remainingChats = chats.filter(c => c.id !== id);
        setChats(remainingChats);

        if (activeChatId === id) {
            setActiveChatId(remainingChats[0].id);
        }
    };

    const deleteMessage = (index) => {
        if (!activeChatId) return;
        setChats(prev => prev.map(c => c.id === activeChatId ? {
            ...c,
            messages: c.messages.filter((_, i) => i !== index)
        } : c));
    };

    const clearAllChats = async () => {
        if (!user?.id) return;
        if (!window.confirm('Are you sure you want to permanently delete all chat history? This cannot be undone.')) return;

        try {
            await deleteAllChats(user.id);
            setChats([{
                id: 'default',
                title: 'New Session',
                messages: [{ role: 'assistant', content: 'Welcome to Eko by EcoInsight — your AI-powered Indian market intelligence engine. Ask me about Nifty, Sensex, RBI policy, mutual funds, crypto, or any financial topic.' }]
            }]);
            setActiveChatId('default');
        } catch (err) {
            console.error('Failed to clear all chats:', err);
        }
    };



    // --- Side Effects ---

    // Sync Appearance Settings
    useEffect(() => {
        const root = document.documentElement;
        const activeTheme = appearance.theme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : appearance.theme;
        root.setAttribute('data-theme', activeTheme);
        root.style.setProperty('--accent-primary', appearance.accentColor);
        const glowColor = appearance.accentColor + '33';
        root.style.setProperty('--accent-glow', glowColor);
        root.setAttribute('data-font-size', appearance.fontSize);
        root.setAttribute('data-compact', appearance.compactMode.toString());
    }, [appearance]);

    // Load chats and settings from Supabase on mount (when user is available)
    const [supaLoaded, setSupaLoaded] = useState(false);
    useEffect(() => {
        if (!user?.id || supaLoaded) return;
        const loadData = async () => {
            try {
                // Parallel load both chats and settings for maximum speed
                const [chatsResult, settingsResult] = await Promise.all([
                    loadChats(user.id),
                    loadSettings(user.id)
                ]);

                // Update chats
                if (chatsResult.chats.length > 0) {
                    setChats(chatsResult.chats);
                    setActiveChatId(chatsResult.activeChatId);
                }

                // Update settings
                setAiSettings(prev => ({ ...prev, ...settingsResult.ai_settings }));
                setChatSettings(prev => ({ ...prev, ...settingsResult.chat_settings }));
                setPersonalization(prev => ({ ...prev, ...settingsResult.personalization }));
                setAppearance(prev => ({ ...prev, ...settingsResult.appearance }));
                setProfile(prev => ({ ...prev, ...settingsResult.profile }));

                setSupaLoaded(true);
            } catch (err) {
                console.error('Failed to load data from Supabase:', err);
                setSupaLoaded(true); // Continue with defaults
            }
        };
        loadData();
    }, [user?.id]);

    // Save chats to Supabase (debounced)
    useEffect(() => {
        if (!user?.id || !supaLoaded) return;
        const timer = setTimeout(() => {
            saveChats(user.id, chats, activeChatId);
        }, 1000); // 1s debounce
        return () => clearTimeout(timer);
    }, [chats, activeChatId, user?.id, supaLoaded]);

    // Save settings to Supabase when they change
    useEffect(() => {
        if (!user?.id || !supaLoaded) return;
        const timer = setTimeout(() => {
            saveSettings(user.id, {
                ai_settings: aiSettings,
                chat_settings: chatSettings,
                personalization: personalization,
                appearance: appearance,
                profile: profile
            });
        }, 3000); // Increased debounce to 3s since we now have manual save
        return () => clearTimeout(timer);
    }, [aiSettings, chatSettings, personalization, appearance, profile, user?.id, supaLoaded]);

    const handleSaveSettings = async () => {
        if (!user?.id || !supaLoaded) return;
        setSaveStatus('saving');
        try {
            await saveSettings(user.id, {
                ai_settings: aiSettings,
                chat_settings: chatSettings,
                personalization: personalization,
                appearance: appearance,
                profile: profile
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error('Manual save failed:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // Welcome Email Automation
    useEffect(() => {
        if (isSignedIn && user?.id && supaLoaded && !profile?.welcome_email_sent) {
            console.log(`[App] Welcome email trigger conditions met for: ${user.primaryEmailAddress?.emailAddress}`);
            const handleWelcomeEmail = async () => {
                try {
                    const response = await sendWelcomeEmail(
                        user.primaryEmailAddress?.emailAddress,
                        user.firstName || user.fullName
                    );
                    
                    console.log(`[App] sendWelcomeEmail response:`, response);

                    if (response.success) {
                        // Update profile flag to ensure we don't send it again
                        setProfile(prev => ({ ...prev, welcome_email_sent: true }));
                    }
                } catch (emailErr) {
                    console.error(`[App] Failed to handle welcome email:`, emailErr);
                }
            };
            handleWelcomeEmail();
        }
    }, [isSignedIn, user?.id, supaLoaded, profile?.welcome_email_sent]);

    // Dynamic Profile Sync (Clerk -> Profile State)
    useEffect(() => {
        if (!user || !supaLoaded) return;

        // Automatically update profile if it's currently at default state or missing real data
        const isDefault = profile.name === 'Professional Analyst' || profile.name === 'Guest User' || profile.email === 'analyst@ecoinsight.ai';
        
        if (isDefault || !profile.onboarded) {
            const clerkName = user.fullName;
            const clerkUsername = user.username ? `@${user.username}` : (user.firstName ? `@${user.firstName.toLowerCase()}` : null);
            
            setProfile(prev => ({
                ...prev,
                name: clerkName || prev.name,
                email: user.primaryEmailAddress?.emailAddress || prev.email,
                avatar: user.imageUrl || prev.avatar,
                username: clerkUsername || prev.username,
                // AUTO-ONBOARD: If they have a name and username from Clerk, consider them onboarded
                onboarded: prev.onboarded || (!!clerkName && !!clerkUsername)
            }));
        }
    }, [user, supaLoaded, profile.onboarded]);

    // Weekly Credit Recharge Logic
    useEffect(() => {
        if (!isSignedIn || !supaLoaded || profile.tier !== 'Free') return;

        const lastRecharge = new Date(profile.lastRechargeDate);
        const now = new Date();
        const diffInDays = (now - lastRecharge) / (1000 * 60 * 60 * 24);

        if (diffInDays >= 7) {
            console.log("Recharging weekly credits...");
            setProfile(prev => ({
                ...prev,
                credits: 10,
                lastRechargeDate: now.toISOString()
            }));
        }
    }, [isSignedIn, supaLoaded, profile.tier, profile.lastRechargeDate]);




    // Handle pending scroll to pricing
    useEffect(() => {
        if (appSection === 'landing' && pendingScrollToPricing) {
            const timer = setTimeout(() => {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                    setPendingScrollToPricing(false);
                }
            }, 500); // Give enough time for content to mount
            return () => clearTimeout(timer);
        }
    }, [appSection, pendingScrollToPricing]);

    const scrollToBottom = () => {
        if (view === 'chat' && !userScrolledUp.current) {
            setTimeout(() => {
                const messagesList = document.querySelector('.messages-list');
                if (messagesList && !userScrolledUp.current) {
                    messagesList.scrollTop = messagesList.scrollHeight;
                }
            }, 100);
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, view])









    const getGenerationOptions = () => {
        const lengthMap = { 'Short': 256, 'Medium': 1024, 'Long': 2048 };
        return {
            temperature: aiSettings.creativity,
            max_tokens: lengthMap[aiSettings.maxLength] || 1024,
            model: aiSettings.model === 'Custom Model' ? null : aiSettings.model // Map if necessary, else use client default
        };
    };

    const generateSystemPrompt = (currentPdfText = '') => {
        let prompt = `You are Eko by EcoInsight, an AI financial intelligence assistant built for Indian investors and market enthusiasts — think of yourself as an "AI Bloomberg for India." 

IDENTITY & ORIGIN:
- When asked who is the creator or founder of Eko by EcoInsight: You must answer "Shivam Sharma."
- When asked "Who made you?": You must answer "A team is behind all this."
- You are a high-end institutional-grade intelligence engine.

You specialize ONLY in topics related to money, financial systems, and markets, with a strong focus on the Indian economy and Indian financial markets. You answer like a seasoned Indian financial analyst or SEBI-registered research analyst — never like a casual chatbot.

Your knowledge domain includes: Indian stock markets (NSE, BSE, Nifty 50, Sensex, sectoral indices), Indian mutual funds and SIPs, Indian taxation (LTCG, STCG, Section 80C, HRA, NPS), RBI monetary policy (repo rate, CRR, SLR, reverse repo), Indian banking system (PSU banks, private banks, NBFCs, UPI/digital payments), Indian economy (GDP, inflation via CPI/WPI, fiscal deficit, current account deficit), SEBI regulations and IPO market, Indian crypto regulations and exchanges (WazirX, CoinDCX), Gold and sovereign gold bonds in India, FDI/FII flows, rupee dynamics (INR/USD), Indian real estate market trends, Global markets as they impact India (US Fed, crude oil, global supply chains), Personal finance for Indians (PPF, EPF, NPS, tax-saving ELSS, insurance), Trading (F&O on NSE, commodity trading on MCX).

BEHAVIOR RULES:
1. You may respond to greetings and small talk related to money or markets.
2. You may respond to ANY question related to finance, economics, investing, trading, crypto, stocks, or wealth creation — with an India-first lens.
3. If a question is outside the financial domain, politely refuse with: "I specialize only in finance, economics, markets, and money-related topics. Please ask a question related to Indian markets, investing, economics, or financial planning."
4. Your answers must be: Clear, Insightful, Analytical, Professional but accessible to everyday Indian investors.
5. Always explain the economic reasoning. Reference Indian data, institutions (RBI, SEBI, NSDL, CDSL), and examples when relevant.
6. When discussing markets, consider: supply and demand, RBI interest rates, Indian CPI inflation, FII/DII sentiment, crude oil prices, rupee strength, and global macro trends.
7. Never generate unrelated content. Guide off-topic conversations back to Indian finance.
8. Use ₹ (INR) as the default currency. Reference Indian benchmarks (Nifty, Sensex) before global ones.
9. UNIQUE CAPABILITY: When asked for an investment opinion or analysis of a stock/commodity, you MUST provide a clear, data-driven "Analyst View." 
    - Never use the phrase "I cannot provide personalized financial or investment advice" as a refusal to analyze. You are an Elite Institutional Research Engine — act like one.
    - Provide a specific "Current Sentiment/Rating" (e.g., Tactical Buy, Accumulate, Hold, Profit Booking, Avoid) based strictly on the provided live metrics.
    - Provide a "6-Month Outlook" or "Technical Projection" based on support/resistance levels visible in the 52-week data and current price momentum.
    - Your logic must be: Data → Pattern → Inference → Outlook.
    - ALWAYS conclude your analysis with: "DISCLAIMER: This analysis is based on live price feeds and real-time market metrics. It represents a technical outlook, not personalized advice. Past performance does not guarantee future results. Consult a SEBI-registered professional for trade execution."

10. STRICT DATA RULE: You are a REAL-TIME Intelligence Engine. You NEVER provide prices, rates, or factual fiscal data from your internal memory. You MUST rely EXCLUSIVELY on the injected "LIVE MARKET DATA" and "WEB SEARCH" blocks. 
    - NEVER say: "My training data is outdated" or "I don't have real-time access." (You DO have it via the provided blocks).
    - NEVER apologize for not having current data. If the data is in the search results, use it with absolute authority.
    - NEVER guess a price. If a price is not in the live data or search results, tell the user you are unable to find the live quote at this second, but NEVER provide a stale price from your internal knowledge.
    - If asked "Should I buy X?", provide an analysis based on the LIVE metrics provided. 
    - Your identity is 100% Real-Time. Any suggestion that you are limited by training data is a hallucination — stay in character as a live terminal.

11. WHEN LIVE STOCK DATA IS INJECTED (you will see a "LIVE STOCK DATA" block): You MUST provide an INSTITUTIONAL-GRADE Research Note.
   a) HEADER: Stock Name | Sector | Current Price | Market Status
   b) ANALYST RATING: A clear, highlighted rating (e.g., **ACCUMULATE**) with a 1-sentence "Thesis"
   c) KEY METRICS & VALUATION: Compare P/E to Sector averages (infer from your knowledge). Comment on Market Cap (Nano, Mid, Large).
   d) TECHNICAL SNAPSHOT: Proximity to 52-week High/Low. Volume analysis (if available).
   e) 12-MONTH OUTLOOK: A mathematical projection of where the stock could reasonably trade given current momentum.
   f) RISK FACTORS: Mention 1-2 specific risks (e.g., "Interest rate sensitivity", "Regulatory headwinds").
   g) End with the standard disclaimer.
   Use professional markdown (##, ###, **bolding**). The response should look like a $500/month research report.

12. ALPHA-GENERATING & CYCLE-BASED FOCUS: When asked for top sectors, market outlooks, or growth potential, NEVER provide generic, "textbook" answers (like just "IT", "Banking" or "Pharma" with generic reasons). You MUST provide catalyst-driven, cycle-based investing models (what smart money tracks). Focus on where the money is actually flowing right now (e.g., policy-driven defense, capex/industrials due to infra booms, transmission capex instead of generic renewables, and specific pharma triggers like GLP-1). Provide deep, institutional-grade alpha generation instead of crowded, surface-level retail advice. Think like a top-tier hedge fund manager finding edge, not a generic mass-market broker. If a sector is mature/saturated, say so. Back your picks with specific macro triggers (e.g., order books, execution cycle, credit cycle, patent cliffs).

CHART GENERATION:
You MUST generate charts to visualize comparisons, trends, distributions, and performance over time. 
To create a chart, output a strictly valid JSON block inside a \`\`\`chart code fence.

Supported chart types: line, bar, pie, area.

Format for a single data series:
\`\`\`chart
{
  "type": "line",
  "title": "Nifty 50 Performance",
  "data": [
    {"name": "2021", "value": 15000},
    {"name": "2022", "value": 16000}
  ]
}
\`\`\`

Format for comparing MULTIPLE data series over time:
\`\`\`chart
{
  "type": "bar",
  "title": "Sensex vs Nifty",
  "data": [
    {"name": "2021", "Sensex": 58000, "Nifty": 17000},
    {"name": "2022", "Sensex": 60000, "Nifty": 18000}
  ]
}
\`\`\`

CRITICAL JSON RULES (FAILURE TO FOLLOW WILL BREAK THE SYSTEM):
1. The JSON must be 100% valid RFC 8259 JSON. If not, the UI will crash.
2. NO trailing commas.
3. ALL keys must be enclosed in double quotes.
4. ALL values for data points MUST be RAW NUMBERS (e.g., 15000), NOT formatted strings (e.g., "15k", "10%", "100M").
5. FORBIDDEN: NEVER include units like "%", "M", "B", "Cr", "L" inside the numerical value.
   - WRONG: {"value": "10%"} or {"value": 10%}
   - RIGHT: {"value": 10}
6. If you need to specify units, do it in the "title" of the chart, NOT in the data points.
7. The "name" key is ALWAYS the X-axis label (the year, month, or category). All other keys represent the Y-axis numerical values.
8. The JSON block should be standalone. Do not add conversational text inside the code block. Use text before/after for explanations.

WEB SEARCH INTEGRATION:
You are equipped with a live internet gateway. The "WEB SEARCH RESULTS" provided below are the ONLY source of truth for current prices, product costs, NAVs, policy updates, and news.
1. USE WEB SEARCH DATA EXCLUSIVELY for all factual, pricing, and news-related answers. 
2. FORBIDDEN: Do not mention "training data," "knowledge cutoff," or that you "cannot access the internet." You ARE currently accessing it via this injected context.
3. ALL prices must be in ₹ (INR). If search results are in USD, convert them to INR immediately.
4. If search results contain a price, state it as the current official price. Do not express doubt unless the sources themselves are uncertain.
5. You are an "Elite Institutional Research Engine" — your data is fresh, your analysis is current, and your authority is absolute. Citing sources (e.g., "According to LiveMint...") is mandatory.
6. If the user asks for a price and no search results/live data are present, say "The live feed for this specific asset is currently updating" rather than providing an old price. Never provide stale information.`;

        // PDF Context Integration
        if (currentPdfText) {
            prompt += `\n\nPDF CONTEXT (Analyzed Document):
The user has uploaded a document for analysis. Use the information below to answer questions:
--- START DOCUMENT TEXT ---
${currentPdfText.slice(0, 50000)} 
--- END DOCUMENT TEXT ---

IMPORTANT OVERRIDE RULES FOR PDF:
1. Since the user uploaded a document, immediately analyze it as requested, EVEN IF the user's prompt ("I've uploaded a document...") doesn't sound explicitly like a finance question.
2. DO NOT trigger the off-topic refusal. Assume the attached document has economic, business, or financial relevance and summarize it accordingly.
3. Priority rule: If the user's question is about the uploaded document, prioritize the text above. If the question is about general markets, use your core knowledge.`;
        }


        // Style & Tone
        prompt += `\n\nYour response style should be ${aiSettings.style}. Your tone should be ${aiSettings.tone}.`;

        // Personalization
        if (personalization.callMe) {
            prompt += `\nRefer to the user as "${personalization.callMe}".`;
        }
        if (personalization.respondHow) {
            prompt += `\nSpecific instructions for your behavior: ${personalization.respondHow}`;
        }

        return prompt;
    };

    const handleSend = async (customText = null, customPdfText = null) => {
        const textToSend = customText || input
        if (!textToSend.trim() || isLoading) return

        setIsLoading(true)
        userScrolledUp.current = false;

        // Trigger the cinematic star animation on the very first user query
        if (activeChat.messages.length === 1) {
            setShowStarFly(true);
            setTimeout(() => setShowStarFly(false), 2600);
        }
        const userMessage = { role: 'user', content: textToSend }

        // Update title if it's the first user message
        let newTitle = activeChat.title;
        if (activeChat.messages.length === 1 && activeChat.title === 'New Session') {
            newTitle = textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '');
        }

        setChats(prev => prev.map(c => c.id === activeChatId ? {
            ...c,
            title: newTitle,
            messages: [...c.messages, userMessage, { role: 'assistant', content: '' }]
        } : c));

        if (!customText) setInput('')

        // Credit Enforcement
        if (profile.tier === 'Free') {
            if (profile.credits <= 0) {
                setModalType('credits');
                setShowCreditModal(true);
                return;
            }
            // Decrement credits
            setProfile(prev => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
        }


        try {
            // Fetch live market data, on-demand stock data, AND web search results in parallel
            let liveContext = '';
            const [marketData, onDemandData, webSearchData] = await Promise.allSettled([
                fetchMarketContext(),
                fetchOnDemandContext(textToSend),
                fetchWebSearchContext(textToSend)
            ]);

            if (marketData.status === 'fulfilled' && marketData.value) {
                liveContext += marketData.value;
            } else if (marketData.status === 'rejected') {
                console.warn('Could not fetch live market data:', marketData.reason);
            }

            if (onDemandData.status === 'fulfilled' && onDemandData.value) {
                liveContext += onDemandData.value;
            } else if (onDemandData.status === 'rejected') {
                console.warn('On-demand stock lookup failed:', onDemandData.reason);
            }

            if (webSearchData.status === 'fulfilled' && webSearchData.value) {
                liveContext += webSearchData.value;
            } else if (webSearchData.status === 'rejected') {
                console.warn('Web search failed:', webSearchData.reason);
            }

            const currentPdfContext = customPdfText !== null ? customPdfText : pdfText;

            const chatMessages = [
                { role: 'system', content: generateSystemPrompt(currentPdfContext) + liveContext },
                ...activeChat.messages.map(msg => ({ role: msg.role, content: msg.content })),
                userMessage
            ];



            let assistantContent = '';
            await streamMessage(chatMessages, API_KEY, (chunk) => {
                assistantContent += chunk;
                setChats(prev => prev.map(c => c.id === activeChatId ? {
                    ...c,
                    messages: [
                        ...c.messages.slice(0, -1),
                        { role: 'assistant', content: assistantContent }
                    ]
                } : c));
            }, getGenerationOptions());
        } catch (error) {
            console.error('Failed to send message:', error)
            const errorMessage = {
                role: 'assistant',
                content: `Error: ${error.message}. Please check connection.`
            };
            setChats(prev => prev.map(c => c.id === activeChatId ? {
                ...c,
                messages: [...c.messages.slice(0, -1), errorMessage]
            } : c));
        } finally {
            setIsLoading(false)
        }
    }

    // --- PREMIUM FEATURE: PDF EXPORT ---
    const downloadChatAsPDF = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const chatElement = document.querySelector('.messages-list');
            if (!chatElement) return;

            // Temporarily modify styles to capture full scroll height
            const originalOverflow = chatElement.style.overflow;
            const originalHeight = chatElement.style.height;
            chatElement.style.overflow = 'visible';
            chatElement.style.height = 'auto';

            const canvas = await html2canvas(chatElement, {
                backgroundColor: '#0a0a0c',
                scale: 2,
                logging: false,
                useCORS: true,
                windowHeight: chatElement.scrollHeight
            });

            // Restore original styles immediately
            chatElement.style.overflow = originalOverflow;
            chatElement.style.height = originalHeight;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeightInMm = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeightInMm;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInMm);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeightInMm;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInMm);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Eko_by_EcoInsight_Report_${activeChat.title.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("PDF Export Failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    // --- PREMIUM FEATURE: PDF UPLOAD ---
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') return;

        setIsUploading(true);
        try {
            const text = await extractTextFromPDF(file);
            setPdfText(text);
            // Auto-trigger a "Analyze this document" message and pass the sync text
            handleSend(`I've uploaded a document. Please analyze it and summarize the key economic/financial points.`, text);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const updateMessagesWithAssistantSeed = () => {
        setChats(prev => prev.map(c => c.id === activeChatId ? {
            ...c,
            messages: [...c.messages, { role: 'assistant', content: '' }]
        } : c));
    };

    // Modified handleSend call inside try to seed assistant message
    useEffect(() => {
        if (isLoading && activeChat.messages[activeChat.messages.length - 1].content === '') {
            // This is handled inside handleSend now to avoid separate seeds
        }
    }, [isLoading]);

    if (!isLoaded && !authLoadingTimeout) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: 'white', flexDirection: 'column', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Eko by EcoInsight</h2>
                <Loader2 className="animate-spin" size={48} style={{ color: '#8b5cf6' }} />
                <p style={{ fontSize: '1.2rem', fontWeight: '600', letterSpacing: '0.05em' }}>Eko by EcoInsight Engine Initializing...</p>
                <p style={{ fontSize: '0.9rem', color: '#71717a' }}>Connecting to Neural Intelligence Gateway</p>
            </div>
        );
    }

    const onInit = (name) => {
        setInitializingModule(name);
        setShowInitialization(true);
    };

    const handleOnboardingComplete = (onboardingData) => {
        setProfile(prev => ({
            ...prev,
            ...onboardingData,
            onboarded: true // Mark as onboarded
        }));
        // Note: The profile sync effect will automatically save this to Supabase
    };

    const renderView = () => {
        if (SUBPAGE_DATA[view]) {
            return <SubpageRenderer view={view} onBack={() => setAppSection('landing')} />;
        }

        switch (view) {
            case 'trends':
                return (
                    <div className="view-content" key={view}>
                        <div className="view-header">
                            <h1>Economic Trends & Market Data</h1>
                            <p>Real-time insights into India's economic shifts and Bharat's growth story.</p>
                        </div>
                        <div className="trends-grid">
                            <div className="trend-card">
                                <div className="trend-icon"><TrendingUp size={24} /></div>
                                <h3>Inflation Forecast</h3>
                                <p>CPI projected to stabilize at 2.4% by Q4 2026.</p>
                            </div>
                            <div className="trend-card">
                                <div className="trend-icon"><Globe size={24} /></div>
                                <h3>India GDP Growth</h3>
                                <p>India projected to grow at 6.8% — fastest among major economies in 2026.</p>
                            </div>
                            <div className="trend-card">
                                <div className="trend-icon"><BarChart3 size={24} /></div>
                                <h3>Interest Rate Trajectory</h3>
                                <p>RBI likely to initiate gradual cuts as CPI cools toward the 4% target.</p>
                            </div>
                        </div>
                    </div>
                )
            case 'pulse':
                return (
                    <div className="view-content" key={view} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="view-header">
                            <h1>Economic Pulse</h1>
                            <p>Real-time macro snapshot of economic stability and growth vectors.</p>
                        </div>
                        <AIEconomicPulse />
                    </div>
                )
            case 'eli5':
                return (
                    <div className="view-content" key={view} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="view-header">
                            <h1>Explain Like I'm 5</h1>
                            <p>Simplified explanations of complex macroeconomic theories.</p>
                        </div>
                        <ELI5Economics />
                    </div>
                )
            case 'simulator':
                return (
                    <div className="view-content" key={view} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="view-header">
                            <h1>What-If Simulator</h1>
                            <p>Interactive environmental forecasting based on fiscal policy changes.</p>
                        </div>
                        <WhatIfSimulator />
                    </div>
                )
            case 'news':
                return (
                    <div className="view-content" key={view} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="view-header">
                            <h1>Market News Analyzer</h1>
                            <p>Real-time sentiment extraction from India's financial headlines and market wires.</p>
                        </div>
                        <AIMarketNewsAnalyzer />
                    </div>
                )
            case 'predictor':
                return (
                    <div className="view-content" key={view} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="view-header">
                            <h1>Event Impact Predictor</h1>
                            <p>AI-driven foresight on market reactions to hypothetical black swan events.</p>
                        </div>
                        <EventImpactPredictor />
                    </div>
                )
            case 'settings':
                return (
                    <div className="view-content settings-view" key={view}>
                        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>Settings</h1>
                                <p>Manage your EcoInsight profile and preferences.</p>
                            </div>
                            <button 
                                className={`btn-primary ${saveStatus === 'saved' ? 'success' : ''}`} 
                                onClick={handleSaveSettings}
                                disabled={saveStatus === 'saving'}
                                style={{ minWidth: '140px' }}
                            >
                                {saveStatus === 'saving' ? <><Loader2 size={16} className="animate-spin" /> Saving...</> :
                                 saveStatus === 'saved' ? <><Check size={16} /> Changes Saved</> :
                                 saveStatus === 'error' ? <><AlertTriangle size={16} /> Error Saving</> :
                                 <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>

                        {/* Account Settings */}
                        <section className="settings-section">
                            <h3><User size={18} /> Account Settings</h3>
                            <div className="settings-card profile-upload-card">
                                <div className="profile-top">
                                    <div className="avatar-preview">
                                        {profile.avatar ? <img src={profile.avatar} alt="Profile" /> : 'S'}
                                        <button className="upload-btn"><Camera size={14} /></button>
                                    </div>
                                    <div className="profile-info-grid">
                                        <div className="field">
                                            <label>Full Name</label>
                                            <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                        </div>
                                        <div className="field">
                                            <label>Username</label>
                                            <input type="text" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="field full">
                                    <label>Email Address</label>
                                    <input type="email" value={profile.email} readOnly />
                                </div>
                                <div className="action-row">
                                    <button className="secondary-btn"><Key size={14} /> Change Password</button>
                                    <button className="secondary-btn logout-btn" onClick={() => setAppSection('landing')}><LogOut size={14} /> Logout</button>
                                </div>
                                <div className="danger-zone">
                                    <p>Danger Zone</p>
                                    <button className="danger-btn"><Trash2 size={14} /> Delete Account</button>
                                </div>
                            </div>
                        </section>

                        {/* AI Behavior */}
                        <section className="settings-section">
                            <h3><Bot size={18} /> AI Behavior Settings</h3>
                            <div className="settings-card">
                                <div className="field">
                                    <label>Default Model</label>
                                    <div className="select-wrapper">
                                        <select value={aiSettings.model} onChange={e => setAiSettings({ ...aiSettings, model: e.target.value })}>
                                            <option value="nvidia/nemotron-mini-4b-instruct">Nemotron Mini 4B (Balanced)</option>
                                            <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B (Fast)</option>
                                            <option value="meta/llama-3.1-70b-instruct">Llama 3.1 70B (Smart)</option>
                                            <option value="mistralai/mixtral-8x7b-instruct-v0.1">Mixtral 8x7B (Complex)</option>
                                            <option value="Custom Model">Custom Model</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={14} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Response Style</label>
                                    <div className="radio-group">
                                        {['Concise', 'Balanced', 'Detailed'].map(s => (
                                            <label key={s} className={`radio-item ${aiSettings.style === s ? 'active' : ''}`}>
                                                <input type="radio" value={s} checked={aiSettings.style === s} onChange={e => setAiSettings({ ...aiSettings, style: e.target.value })} />
                                                <span>{s}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Tone</label>
                                    <div className="select-wrapper">
                                        <select value={aiSettings.tone} onChange={e => setAiSettings({ ...aiSettings, tone: e.target.value })}>
                                            <option>Professional</option>
                                            <option>Casual</option>
                                            <option>Friendly</option>
                                            <option>Technical</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={14} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Creativity Level ({aiSettings.creativity})</label>
                                    <div className="slider-container">
                                        <input type="range" min="0" max="1" step="0.5" value={aiSettings.creativity} onChange={e => setAiSettings({ ...aiSettings, creativity: parseFloat(e.target.value) })} />
                                        <div className="slider-labels">
                                            <span>Precise (0)</span>
                                            <span>Balanced (0.5)</span>
                                            <span>Creative (1)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Response Length</label>
                                    <div className="radio-group">
                                        {['Short', 'Medium', 'Long'].map(s => (
                                            <label key={s} className={`radio-item ${aiSettings.maxLength === s ? 'active' : ''}`}>
                                                <input type="radio" value={s} checked={aiSettings.maxLength === s} onChange={e => setAiSettings({ ...aiSettings, maxLength: e.target.value })} />
                                                <span>{s}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Default Language</label>
                                    <div className="select-wrapper">
                                        <select value={aiSettings.language} onChange={e => setAiSettings({ ...aiSettings, language: e.target.value })}>
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                            <option>German</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={14} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Chat Settings */}
                        <section className="settings-section">
                            <h3><History size={18} /> Chat Settings</h3>
                            <div className="settings-card toggles-grid">
                                <div className="toggle-item">
                                    <div className="toggle-text">
                                        <label>Chat history</label>
                                        <p>Save your conversations for later access.</p>
                                    </div>
                                    <button className={`toggle-switch ${chatSettings.history ? 'on' : ''}`} onClick={() => setChatSettings({ ...chatSettings, history: !chatSettings.history })}>
                                        <div className="thumb"></div>
                                    </button>
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-text">
                                        <label>Auto save chats</label>
                                        <p>Automatically save every new session.</p>
                                    </div>
                                    <button className={`toggle-switch ${chatSettings.autoSave ? 'on' : ''}`} onClick={() => setChatSettings({ ...chatSettings, autoSave: !chatSettings.autoSave })}>
                                        <div className="thumb"></div>
                                    </button>
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-text">
                                        <label>Auto generate titles</label>
                                        <p>Generate titles using AI from context.</p>
                                    </div>
                                    <button className={`toggle-switch ${chatSettings.autoTitles ? 'on' : ''}`} onClick={() => setChatSettings({ ...chatSettings, autoTitles: !chatSettings.autoTitles })}>
                                        <div className="thumb"></div>
                                    </button>
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-text">
                                        <label>Show timestamps</label>
                                        <p>Display time for each message.</p>
                                    </div>
                                    <button className={`toggle-switch ${chatSettings.showTimestamps ? 'on' : ''}`} onClick={() => setChatSettings({ ...chatSettings, showTimestamps: !chatSettings.showTimestamps })}>
                                        <div className="thumb"></div>
                                    </button>
                                </div>
                            </div>
                            <div className="action-row">
                                <button className="secondary-btn danger-text" onClick={clearAllChats}><Trash2 size={14} /> Clear all chats</button>
                                <button className="secondary-btn"><Send size={14} /> Export chats</button>
                            </div>
                        </section>

                        {/* Personalization */}
                        <section className="settings-section">
                            <h3><Sparkles size={18} /> Personalization Settings</h3>
                            <div className="settings-card">
                                <div className="field full">
                                    <label>What should the AI call you?</label>
                                    <textarea placeholder="e.g. 'Analyst'..." value={personalization.callMe} onChange={e => setPersonalization({ ...personalization, callMe: e.target.value })}></textarea>
                                </div>
                                <div className="field full">
                                    <label>How should the AI respond?</label>
                                    <textarea placeholder="e.g. 'Always use technical terms'..." value={personalization.respondHow} onChange={e => setPersonalization({ ...personalization, respondHow: e.target.value })}></textarea>
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-text">
                                        <label>Memory</label>
                                        <p>Allow AI to remember details across chats.</p>
                                    </div>
                                    <button className={`toggle-switch ${personalization.memory ? 'on' : ''}`} onClick={() => setPersonalization({ ...personalization, memory: !personalization.memory })}>
                                        <div className="thumb"></div>
                                    </button>
                                </div>
                                <div className="action-row">
                                    <button className="secondary-btn">Manage Memory</button>
                                    <button className="secondary-btn danger-text">Clear Memory</button>
                                </div>
                            </div>
                        </section>

                        {/* Appearance */}
                        <section className="settings-section">
                            <h3><Palette size={18} /> Appearance Settings</h3>
                            <div className="settings-card">
                                <div className="field">
                                    <label>Theme</label>
                                    <div className="theme-grid">
                                        <button className={`theme-btn ${appearance.theme === 'light' ? 'active' : ''}`} onClick={() => setAppearance({ ...appearance, theme: 'light' })}><Sun size={14} /> Light</button>
                                        <button className={`theme-btn ${appearance.theme === 'dark' ? 'active' : ''}`} onClick={() => setAppearance({ ...appearance, theme: 'dark' })}><Moon size={14} /> Dark</button>
                                        <button className={`theme-btn ${appearance.theme === 'system' ? 'active' : ''}`} onClick={() => setAppearance({ ...appearance, theme: 'system' })}><Monitor size={14} /> System</button>
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Accent Color</label>
                                    <div className="color-picker">
                                        {['#8b5cf6', '#d946ef', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
                                            <button key={c} className={`color-swatch ${appearance.accentColor === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => setAppearance({ ...appearance, accentColor: c })}></button>
                                        ))}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Font Size</label>
                                    <div className="select-wrapper">
                                        <select value={appearance.fontSize} onChange={e => setAppearance({ ...appearance, fontSize: e.target.value })}>
                                            <option>Small</option>
                                            <option>Medium</option>
                                            <option>Large</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={14} />
                                    </div>
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-text">
                                        <label>Compact mode</label>
                                        <p>Reduce padding and spacing.</p>
                                    </div>
                                    <button className={`toggle-switch ${appearance.compactMode ? 'on' : ''}`} onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}>
                                        <div className="thumb"></div>
                                    </button>
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-text">
                                        <label>Efficiency mode (Low Lag)</label>
                                        <p>Reduces visual effects for smoother performance.</p>
                                    </div>
                                    <button className={`toggle-switch ${chatSettings.performanceMode ? 'on' : ''}`} onClick={() => setChatSettings({ ...chatSettings, performanceMode: !chatSettings.performanceMode })}>
                                        <div className="thumb"></div>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <div className="settings-footer" style={{ marginTop: '2rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                             <button className="secondary-btn" onClick={() => setView('chat')}>Cancel</button>
                             <button 
                                className={`btn-primary ${saveStatus === 'saved' ? 'success' : ''}`} 
                                onClick={handleSaveSettings}
                                disabled={saveStatus === 'saving'}
                                style={{ minWidth: '160px' }}
                            >
                                {saveStatus === 'saving' ? <><Loader2 size={16} className="animate-spin" /> Saving...</> :
                                 saveStatus === 'saved' ? <><Check size={16} /> Changes Saved</> :
                                 <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                )
            default:
                return (
                    <div key={view} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        <div 
                            className="messages-list"
                            onScroll={(e) => {
                                const { scrollTop, scrollHeight, clientHeight } = e.target;
                                userScrolledUp.current = scrollHeight - (scrollTop + clientHeight) > 100;
                            }}
                        >
                            {/* Spacer pushes messages down when few, collapses when many */}
                            <div style={{ flex: 1 }} />
                            {messages.length === 1 ? (
                                    <motion.div 
                                        className="empty-chat-hero"
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { 
                                                opacity: 1, 
                                                transition: { staggerChildren: 0.1, delayChildren: 0.05 } 
                                            }
                                        }}
                                    >
                                        <motion.div 
                                            className="empty-chat-greeting"
                                            variants={{
                                                hidden: { opacity: 0, y: 40, scale: 0.95 },
                                                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                                            }}
                                        >
                                            <EkoSparkle size={36} /> 
                                            <span className="greeting-name">Hi {profile?.name?.split(' ')[0] || 'There'}</span>
                                        </motion.div>
                                        <motion.div 
                                            className="empty-chat-headline"
                                            variants={{
                                                hidden: { opacity: 0, y: 40, scale: 0.95 },
                                                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                                            }}
                                        >
                                            Where should we start?
                                        </motion.div>
                                        <motion.div 
                                            className="suggestion-chips"
                                            variants={{
                                                hidden: { opacity: 0, y: 40, scale: 0.95 },
                                                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                                            }}
                                        >
                                            {FAQS.map((faq, idx) => (
                                                <button key={idx} className="suggestion-chip" onClick={() => handleSend(faq.text)} disabled={isLoading}>
                                                    {faq.icon} <span>{faq.text}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {messages.map((msg, i) => {
                                        // Skip the empty assistant placeholder while loading — the explicit indicator below handles it
                                        if (msg.role === 'assistant' && msg.content === '') return null;
                                        return (
                                        <motion.div
                                            key={i}
                                            className={`message-wrapper ${msg.role}`}
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="message-icon">
                                                {msg.role === 'assistant' ? <EkoSparkle size={20} /> : <User size={18} />}
                                            </div>
                                            <div className="message-container">
                                                <div className="message-content">
                                                    {parseChartBlocks(msg.content).map((block, bIdx) => (
                                                        block.type === 'chart'
                                                            ? <EcoChartRenderer key={bIdx} config={block.content} />
                                                            : <ReactMarkdown key={bIdx}>{block.content}</ReactMarkdown>
                                                    ))}
                                                </div>
                                                <div className="message-actions">
                                                    {msg.role === 'assistant' && msg.content && (
                                                        <>
                                                            <button className="action-btn" title="Copy"><Copy size={14} /></button>
                                                            <button className="action-btn" title="Regenerate"><RefreshCw size={14} /></button>
                                                        </>
                                                    )}
                                                    <button className="action-btn danger-hover" title="Delete Message" onClick={() => deleteMessage(i)}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                        );
                                        })}
                                    </AnimatePresence>
                                )}
                            {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
                                <motion.div className="message-wrapper assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="message-icon"><Loader2 className="animate-spin" size={18} /></div>
                                    <div className="message-content"><span className="typing-indicator">Eko is analyzing...</span></div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-container">

                            
                            <AnimatePresence>
                                {isLoading && (
                                    <motion.div 
                                        className="eko-thinking-indicator"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <div className="thinking-dots">
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                        </div>
                                        <span>Eko is thinking...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div className="input-wrapper">
                                <label className="file-upload-btn" title="Upload PDF Analysis">
                                    <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    {isUploading ? <Loader2 size={20} className="animate-spin text-accent" /> : <FilePlus size={20} />}
                                </label>
                                <input
                                    placeholder={pdfText ? "Document analyzed. Ask anything about it..." : "Query economic trends, theories, or data..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading || isUploading}
                                />
                                <div className="input-actions">
                                    <button className={`send-button ${input.trim() ? 'active' : ''}`} onClick={() => handleSend()} disabled={isLoading || isUploading || !input.trim()}>
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    </button>
                                </div>
                            </motion.div>
                            <p className="input-footer">Eko by EcoInsight – Professional Economic Analysis & Intelligence</p>
                        </div>
                    </div>
                )
        }
    };

    const renderActiveSection = () => {
        if (appSection === 'landing') return (
            <LandingPage
                supaLoaded={supaLoaded}
                setAppSection={setAppSection}
                setAuthType={setAuthType}
                onLaunchEngine={() => {
                    // Check if onboarding is needed, but only after settings are loaded
                    if (isSignedIn && supaLoaded && !profile.onboarded) {
                        setAppSection('onboarding');
                    } else if (isSignedIn && supaLoaded) {
                        createNewChat();
                        setAppSection('chat');
                    } else if (!isSignedIn) {
                        setAppSection('auth');
                    }
                    // If supaLoaded is false, we might want to show a loader or wait, 
                    // but usually it's fast enough or handled by the next condition.
                }}
                onSelectPlan={(plan) => {
                    setSelectedPlan(plan);
                    setAppSection('checkout');
                }}
            />
        );

        if (appSection === 'onboarding' || (isSignedIn && supaLoaded && !profile.onboarded && appSection !== 'landing' && appSection !== 'checkout')) return (
            <OnboardingView 
                user={user} 
                onComplete={(data) => {
                    handleOnboardingComplete(data);
                    setAppSection('chat');
                    createNewChat();
                }} 
            />
        );

        if (appSection === 'checkout') return (
            <CheckoutView
                plan={selectedPlan}
                setAppSection={setAppSection}
                onPaymentSuccess={() => {
                    const newTier = selectedPlan?.plan || 'Sentinel';
                    setProfile(prev => ({
                        ...prev,
                        tier: newTier,
                        credits: newTier === 'Free' ? 10 : 999999 // Effectively unlimited for paid
                    }));
                    setSelectedPlan(null);
                    setAppSection('chat');
                }}
            />
        );

        if (appSection === 'capabilities') return <CapabilitiesPage onBack={() => setAppSection('landing')} onInit={onInit} />;
        if (appSection === 'security') return <SecurityPage onBack={() => setAppSection('landing')} onInit={onInit} />;
        if (appSection === 'enterprise') return <EnterprisePage onBack={() => setAppSection('landing')} onInit={onInit} />;
        if (appSection === 'documentation') return <DocumentationPage onBack={() => setAppSection('landing')} onInit={onInit} />;
        if (appSection === 'support') return <SupportPage onBack={() => setAppSection('landing')} onInit={onInit} />;
        if (appSection === 'api') return <APIPage onBack={() => setAppSection('landing')} onInit={onInit} />;

        // Handle Subpage Content from Footer Hub
        if (SUBPAGE_DATA[appSection]) {
            return <SubpageRenderer view={appSection} onBack={() => setAppSection('landing')} />;
        }

        return (
            <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                {isMobile && isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
                {isMobile && (
                    <header className="mobile-app-header">
                        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="mobile-logo">
                            <EcoInsightLogo size={24} /> <span>EcoInsight</span>
                        </div>
                        <button className="mobile-new-chat" onClick={createNewChat}>
                            <EcoNewChatIcon size={18} />
                        </button>
                    </header>
                )}
                <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <motion.div className="logo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <EcoInsightLogo size={36} className="logo-icon" /> <span>EcoInsight</span>
                        </motion.div>
                        {isMobile && <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>}
                    </div>
                    <nav className="sidebar-nav">
                        <div className="sidebar-section">
                            <span className="section-label">Ongoing Chat</span>
                            <button className="nav-item new-chat" onClick={() => { createNewChat(); if (isMobile) setIsSidebarOpen(false); }}>
                                <EcoNewChatIcon size={18} /> <span>New Chat</span>
                            </button>
                            <div className="history-item-wrapper active-chat-item">
                                <button
                                    className={`nav-item ${view === 'chat' ? 'active' : ''}`}
                                    onClick={() => { setView('chat'); if (isMobile) setIsSidebarOpen(false); }}
                                >
                                    <EcoHistoryIcon size={18} /> <span className="truncate">{activeChat.title}</span>
                                </button>
                                <button className="delete-chat-btn" onClick={(e) => deleteChat(e, activeChat.id)} title="Delete Session">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="sidebar-section history-section">
                            <span className="section-label">Chat History</span>
                            <div className="history-list">
                                {chats.filter(c => c.id !== activeChatId && c.messages.length > 1).map(chat => (
                                    <div key={chat.id} className="history-item-wrapper">
                                        <button
                                            className="nav-item history-item"
                                            onClick={() => {
                                                setActiveChatId(chat.id);
                                                setView('chat');
                                                if (isMobile) setIsSidebarOpen(false);
                                            }}
                                        >
                                            <EcoHistoryIcon size={16} /> <span className="truncate">{chat.title}</span>
                                        </button>
                                        <button className="delete-chat-btn" onClick={(e) => deleteChat(e, chat.id)} title="Delete Chat">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <span className="section-label">Analysis</span>
                            <button
                                className={`nav-item beta-lab-toggle ${isBetaExpanded ? 'expanded' : ''}`}
                                onClick={() => setIsBetaExpanded(!isBetaExpanded)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Sparkles size={18} /> Beta Lab
                                </div>
                                <motion.div animate={{ rotate: isBetaExpanded ? 180 : 0 }}>
                                    <ChevronDown size={14} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isBetaExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', borderLeft: '1px solid rgba(139, 92, 246, 0.2)', marginLeft: '0.75rem' }}>
                                            <button className="nav-item sub-nav-item" style={{display:'flex',justifyContent:'space-between',alignItems:'center',opacity:0.6}} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><EcoTrendsIcon size={16} /> Market Trends</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{display:'flex',justifyContent:'space-between',alignItems:'center',opacity:0.6}} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><EcoPulseIcon size={16} /> Economic Pulse</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{display:'flex',justifyContent:'space-between',alignItems:'center',opacity:0.6}} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><EcoSimplifyIcon size={16} /> ELI5 Economics</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{display:'flex',justifyContent:'space-between',alignItems:'center',opacity:0.6}} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><EcoSimulatorIcon size={16} /> What-If Simulator</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{display:'flex',justifyContent:'space-between',alignItems:'center',opacity:0.6}} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><EcoNewsIcon size={16} /> News Analyzer</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{display:'flex',justifyContent:'space-between',alignItems:'center',opacity:0.6}} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><EcoPredictorIcon size={16} /> Event Predictor</div> <Lock size={12} color="#a78bfa" /></button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => { setView('settings'); if (isMobile) setIsSidebarOpen(false); }} style={{ marginTop: '0.5rem' }}><Settings size={18} /> Settings</button>
                        </div>
                    </nav>
                    <div className="sidebar-footer">
                        <SignedIn>
                            <div className="user-profile-clerk" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
                                <UserButton afterSignOutUrl="/" />
                                <div className="user-info">
                                    <span className="user-name" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
                                    <span className="user-status" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {profile.tier} Access {profile.tier === 'Free' && `• ${profile.credits} Credits`}
                                    </span>
                                </div>
                            </div>
                        </SignedIn>

                    </div>
                </aside>
                <main className="chat-area">
                    {!isMobile && (
                        <header className="chat-header">
                            <div className="header-content">
                                <EcoInsightLogo size={28} />
                                <h2>{view === 'chat' ? 'Indian Market Analyst' : view === 'trends' ? 'Market Intelligence' : 'Account Settings'}</h2>
                                <div className="badge">{view === 'chat' ? 'Expert Mode' : 'Beta'}</div>
                                <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                    <button className="header-action-btn" onClick={downloadChatAsPDF} disabled={isExporting}>
                                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        <span>Export Pro Report</span>
                                    </button>
                                </div>
                            </div>
                        </header>
                    )}
                    {renderView()}
                </main>
                {!isMobile && <NewsTicker />}
            </div>
        );
    };

    return (
        <>
            {renderActiveSection()}
            <AnimatePresence>
                {showInitialization && (
                    <InitializationTerminal
                        moduleName={initializingModule}
                        onClose={() => setShowInitialization(false)}
                    />
                )}
            </AnimatePresence>

            <CreditModal
                isOpen={showCreditModal}
                type={modalType}
                onClose={() => setShowCreditModal(false)}
                lastRechargeDate={profile.lastRechargeDate}
                onUpgrade={() => {
                    setShowCreditModal(false);
                    setAppSection('landing');
                    setPendingScrollToPricing(true);
                }}
            />

            {/* Cinematic star fly animation */}
            <AnimatePresence>
                {showStarFly && (
                    <motion.div
                        className="star-fly-overlay"
                        initial={false}
                    >
                        <motion.div
                            className="star-fly-icon"
                            initial={{ 
                                x: 'calc(50vw - 24px)', 
                                y: 'calc(50vh - 120px)', 
                                scale: 2.2, 
                                opacity: 1, 
                                rotate: 0 
                            }}
                            animate={[
                                { x: 'calc(50vw + 160px)', y: 'calc(50vh - 260px)', scale: 1.8, rotate: 30, opacity: 1, transition: { duration: 0.45, ease: [0.34,1.56,0.64,1] } },
                                { x: 'calc(50vw - 220px)', y: 'calc(50vh - 200px)', scale: 1.5, rotate: -20, opacity: 1, transition: { duration: 0.4, ease: [0.16,1,0.3,1] } },
                                { x: 'calc(50vw + 80px)', y: 'calc(40vh + 60px)', scale: 1.2, rotate: 15, opacity: 1, transition: { duration: 0.38, ease: [0.16,1,0.3,1] } },
                                { x: 380, y: 'calc(100vh - 200px)', scale: 0.85, rotate: -10, opacity: 1, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } },
                                { x: 310, y: 'calc(100vh - 170px)', scale: 0.55, rotate: 0, opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } },
                            ]}
                            exit={{ opacity: 0 }}
                        >
                            <EkoSparkle size={48} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default App;
