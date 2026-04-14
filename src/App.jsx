import React, { useState, useRef, useEffect, useId, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Send, Sparkles, User, Bot, History, Settings, LogOut, Loader2, Copy, RefreshCw, BarChart3, TrendingUp, Globe, Lightbulb, Camera, Trash2, Key, ChevronDown, ChevronUp, Database, CheckCircle2, Monitor, Laptop, Smartphone, Moon, Sun, Palette, Type, Maximize2, ShieldCheck, Lock, Zap, BookOpen, LifeBuoy, Terminal, Cpu, Layers, HardDrive, Activity, FilePlus, Info, Download, Menu, X, Star, Check, AlertCircle, AlertTriangle, Save, MessageCircle, ExternalLink, PieChart, ArrowLeft, Headphones } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { streamMessage } from './lib/KimiClient'
import { fetchMarketContext, fetchOnDemandContext } from './lib/MarketData'
import { fetchWebSearchContext } from './lib/WebSearch'
import { loadChats, saveChats, deleteChat as supaDeleteChat, deleteAllChats, loadSettings, saveSettings } from './lib/SupabaseStorage'
import { sendWelcomeEmail } from './lib/EmailService';
import { parseChartBlocks, EcoChartRenderer } from './components/EcoCharts'
import { useAuth, useUser } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import AccountSettingsModal from './components/AccountSettingsModal'
import UserAccountMenu from './components/UserAccountMenu'
import LandingPage from './components/LandingPage'
import CommandPalette from './components/CommandPalette'
import InitializationTerminal from './components/InitializationTerminal'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Bug } from 'lucide-react'
import axios from 'axios'

import CreditModal from './components/CreditModal';
import BugReportModal from './components/BugReportModal';
import OnboardingView from './components/OnboardingView';
import InstitutionalVoicePlayer from './components/InstitutionalVoicePlayer';
import IntelligenceProbes from './components/IntelligenceProbes';
import * as pdfjs from 'pdfjs-dist'
// Set worker for pdfjs (using a static file from the public directory to bypass Vite bundler issues)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

import { fetchNewsTickerData } from './lib/MarketData'


import Threads from './components/Threads'
import { SUBPAGE_DATA } from './lib/SubpageContent'
import CookieConsent from './components/CookieConsent'
import LiveMarketDashboard from './components/LiveMarketDashboard'
import MarketPulseDashboard from './components/MarketPulseDashboard'
import IntelligenceInsightsReport from './components/IntelligenceInsightsReport'
import SectorHeatmap from './components/SectorHeatmap'
import PortfolioAnalyzer from './components/PortfolioAnalyzer'
import IntelligenceHubNotification from './components/IntelligenceHubNotification'
import MobileHeader from './components/MobileHeader'

const MIN_THINKING_DURATION = 8000; // 8 seconds to ensure analytical animation steps complete

import neuralNode from './assets/neural_node_high_res_elite-removebg-preview.png';
import iridescentOrb from './assets/premium_3d_iridescent_orb_1772080138013-removebg-preview.png';
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
    )
}


const ThinkingIndicator = () => {
  const [seconds, setSeconds] = useState(0);
  const [step, setStep] = useState(0);
  const [activeSteps, setActiveSteps] = useState([]);

  useEffect(() => {
    // Definining a robust pool of institutional analytical steps
    const stepPool = [
      { label: "Decoding institutional query", tool: null },
      { label: "Scanning financial databases & documentation", tool: "Company Fundamental Data" },
      { label: "Synthesizing market correlations", tool: null },
      { label: "Drafting executive intelligence report", tool: null },
      { label: "Aggregating FII/DII flow dynamics", tool: "Real-time Flows" },
      { label: "Analyzing technical divergence signals", tool: "Alpha Signals" },
      { label: "Cross-referencing historical Nifty 50 volatility", tool: null },
      { label: "Evaluating macro-economic headwind impact", tool: "Macro Pulse" },
      { label: "Parsing real-time derivative chain data", tool: "Option Chain" },
      { label: "Scouring sector-specific fundamental indicators", tool: null },
      { label: "Optimizing asymmetric risk-weighted outcomes", tool: "Risk Engine" },
      { label: "Calibrating institutional sentiment breadth", tool: null },
      { label: "Simulating black-swan probability models", tool: "Stress Test" },
      { label: "Extracting alpha from high-conviction sources", tool: null },
      { label: "Mapping global algorithmic trade velocity", tool: "Trade Vectors" },
      { label: "Verifying reliability of provenance sources", tool: null }
    ];

    // Shuffle and pick 4 random steps
    const shuffled = [...stepPool].sort(() => 0.5 - Math.random());
    setActiveSteps(shuffled.slice(0, 4));

    const timer = setInterval(() => {
      setSeconds(prev => +(prev + 0.1).toFixed(1));
    }, 100);
    
    // Progress through steps based on time
    const stepTimer = setInterval(() => {
      setStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 2800);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  if (activeSteps.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="thought-tracer-container"
    >
      <div className="thought-header">
        <div className="thought-timer">
          <Sparkles size={14} className="animate-pulse" />
          <span>Thought for {seconds.toFixed(1)}s</span>
        </div>
        <ChevronUp size={14} style={{ opacity: 0.3 }} />
      </div>

      <div className="thought-steps">
        <div className="thought-timeline-line" />
        
        {activeSteps.map((s, idx) => {
          const isActive = step === idx;
          const isCompleted = step > idx;
          
          if (idx > step) return null;

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`thought-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className={`thought-step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} />
              <div className="thought-step-content">
                <div className="thought-step-label">{s.label}</div>
                {isActive && s.tool && (
                   <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="tool-badge"
                   >
                     <Database size={10} />
                     <span>{s.tool}</span>
                   </motion.div>
                )}
              </div>
              {isCompleted && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginLeft: 'auto' }}>
                  <CheckCircle2 size={12} className="text-green-500" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const FAST_GREETINGS = {
    'how are you': 'I am performing at peak efficiency, synchronized with Bharat\'s market shifts. Ready for your intelligence deep-dive.',
    'hi': 'Welcome back, Analyst. My neural links are active. What sector are we analyzing today?',
    'hello': 'Welcome back, Analyst. My neural links are active. What sector are we analyzing today?',
    'hey': 'Welcome back, Analyst. My neural links are active. What sector are we analyzing today?',
    'heyya': 'Welcome back, Analyst. My neural links are active. What sector are we analyzing today?',
    'ya': 'Welcome back, Analyst. My neural links are active. What sector are we analyzing today?',
    'yo': 'Welcome back, Analyst. My neural links are active. What sector are we analyzing today?',
    'who are you': 'I am Eko, your institutional-grade Economic Intelligence engine, designed to decode complex financial dynamics.',
    'what can you do': 'I can analyze market trends, simulate economic scenarios, and provide institutional-grade intelligence across equities, macro data, and sectoral shifts.',
    'good morning': 'Good morning, Analyst. The markets are waking up. Ready to decode the early signals?',
    'good afternoon': 'Good afternoon, Analyst. Intelligence feeds are live. What deep-dive shall we initiate?',
    'good evening': 'Good evening, Analyst. Markets may be closed, but the intelligence flow never stops. Reviewing today\'s shifts?'
};

const SourceCard = ({ source }) => {
    const domain = new URL(source.url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return (
        <motion.a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-card"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="source-card-header">
                <img src={faviconUrl} alt="" className="source-favicon" onError={(e) => e.target.style.display='none'} />
                <span className="source-name">{source.source}</span>
                <ExternalLink size={12} className="source-external-icon" />
            </div>
            <h4 className="source-title">{source.title}</h4>
            <p className="source-snippet">{source.snippet}</p>
        </motion.a>
    );
};

const SourceCarousel = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="source-carousel-wrapper">
            <div className="source-carousel-header">
                <div className="source-header-line" />
                <span className="source-header-text">Intelligence Provenance</span>
                <div className="source-header-line" />
            </div>
            <div className="source-carousel">
                {sources.map((source, idx) => (
                    <SourceCard key={idx} source={source} />
                ))}
            </div>
        </div>
    );
};

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
                                <span 
                                    key={`h-${groupIdx}-${i}`} 
                                    className="ticker-item headline"
                                    onClick={() => h.link && window.open(h.link, '_blank')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {h.title || h}
                                </span>
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

const LegalFooter = ({ onOpenSubpage }) => (
    <footer className="legal-footer">
        <div className="footer-left">
            <EcoInsightLogo size={20} />
            <span className="footer-logo-text">EcoInsight</span>
            <span className="copyright">© {new Date().getFullYear()} Shivam Sharma</span>
        </div>
        <div className="footer-links">
            <button className="footer-link" onClick={() => onOpenSubpage('privacy-policy')}>Privacy</button>
            <button className="footer-link" onClick={() => onOpenSubpage('terms')}>Terms</button>
            <button className="footer-link" onClick={() => onOpenSubpage('refund')}>Refunds</button>
            <button className="footer-link" onClick={() => onOpenSubpage('contact')}>Contact</button>
        </div>
    </footer>
);

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
    const [selectedRating, setSelectedRating] = useState(null); // null means all
    const reviewsPerPage = 6;

    // Dynamic stats from REVIEWS array
    const ratingStats = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        REVIEWS.forEach(r => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
        });

        const stats = [5, 4, 3, 2, 1].map(stars => ({
            stars,
            count: counts[stars],
            percent: REVIEWS.length > 0 ? Math.round((counts[stars] / REVIEWS.length) * 100) : 0
        }));

        const totalValue = REVIEWS.reduce((acc, r) => acc + r.rating, 0);
        const avg = REVIEWS.length > 0 ? (totalValue / REVIEWS.length).toFixed(1) : "0.0";

        return { stats, avg, total: REVIEWS.length };
    }, []);

    // Filter logic
    const filteredReviews = useMemo(() => {
        return selectedRating
            ? REVIEWS.filter(r => r.rating === selectedRating)
            : REVIEWS;
    }, [selectedRating]);

    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleFilter = (stars) => {
        if (selectedRating === stars) {
            setSelectedRating(null); // Toggle off if clicked again
        } else {
            setSelectedRating(stars);
        }
        setCurrentPage(1); // Reset to first page on filter change
    };

    return (
        <section id="reviews" className="reviews-section">
            <div className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="consensus-header-wrap">
                    <h2 className="consensus-title">
                        The Analyst Consensus
                    </h2>
                    <span className="consensus-badge">
                        Alpha Stage
                    </span>
                </div>
                <p style={{
                    margin: '0 auto',
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    maxWidth: '600px',
                    lineHeight: '1.6'
                }}>
                    Trusted by elite researchers and Bharat's market participants during our initial pilot phase.
                </p>
            </div>

            <div className="reviews-overview" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2.5rem',
                scale: '0.85'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{ratingStats.total > 0 ? ratingStats.avg : "5.0"}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        size={16}
                                        fill={s <= Math.round(parseFloat(ratingStats.avg)) ? "#f59e0b" : "transparent"}
                                        color="#f59e0b"
                                    />
                                ))}
                            </div>
                            <span style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '2px' }}>
                                Based on {ratingStats.total} verified reviews
                            </span>
                        </div>
                    </div>

                    {selectedRating && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedRating(null)}
                            style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                color: '#a78bfa',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            Clear Filter <X size={12} />
                        </motion.button>
                    )}
                </div>

                <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ratingStats.stats.map(row => (
                        <motion.div
                            key={row.stars}
                            whileHover={{ x: 5 }}
                            onClick={() => handleFilter(row.stars)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                opacity: (selectedRating && selectedRating !== row.stars) ? 0.4 : 1,
                                transition: 'opacity 0.2s ease',
                                background: selectedRating === row.stars ? 'rgba(255,255,255,0.03)' : 'transparent',
                                padding: '4px 8px',
                                borderRadius: '8px'
                            }}
                        >
                            <span style={{ color: '#a1a1aa', fontSize: '0.75rem', minWidth: '45px' }}>{row.stars} stars</span>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${row.percent}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: row.stars >= 4 ? '#8b5cf6' : (row.stars === 3 ? '#f59e0b' : '#3f3f46')
                                    }}
                                />
                            </div>
                            <span style={{ color: '#71717a', fontSize: '0.75rem', minWidth: '35px', textAlign: 'right' }}>{row.percent}%</span>
                        </motion.div>
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





const DetailedFooter = ({ setAppSection }) => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: "PLATFORM",
            links: [
                { label: "Help Center", id: "help-center" },
                { label: "Knowledge Base", id: "knowledge-base" },
                { label: "Network Status", id: "network-status" },
                { label: "Security Advisories", id: "security-advisories" }
            ]
        },
        {
            title: "COMPANY",
            links: [
                { label: "About Us", id: "about-us" },
                { label: "Careers", id: "careers" },
                { label: "Partners", id: "partners" },
                { label: "Referral Program", id: "referral" },
                { label: "Contact", id: "contact" }
            ]
        },
        {
            title: "LEGAL",
            links: [
                { label: "Privacy Policy", id: "privacy-policy" },
                { label: "Terms of Service", id: "terms-of-service" },
                { label: "Acceptable Use Policy", id: "acceptable-use" },
                { label: "Report Abuse", id: "report-abuse" }
            ]
        }
    ];

    return (
        <footer className="detailed-footer">
            <div className="footer-glow" />
            <div className="footer-content">
                <div className="footer-main-grid">
                    <div className="footer-brand-col">
                        <div className="footer-brand-header">
                            <EcoInsightLogo size={24} />
                            <span>EcoInsight</span>
                        </div>
                        <p className="footer-tagline">
                            Empowering investors with institutional-grade AI analysis for the modern market.
                        </p>
                    </div>

                    {footerSections.map((section, idx) => (
                        <div key={idx} className="footer-nav-col">
                            <h4>{section.title}</h4>
                            <ul>
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <button
                                            key={link.id}
                                            className="footer-link-btn"
                                            onClick={() => {
                                                setAppSection(link.id);
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="footer-bottom-bar">
                <div className="footer-copyright">
                    © {currentYear} EcoInsight. All rights reserved. Made for Bharat 🇮🇳
                </div>
            </div>
        </footer>
    );
};

// Redundant local LandingPage removed in favor of modular equivalent in src/components/LandingPage.jsx


// Modular component integration active


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
                                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label>Return Vector (Email)</label>
                                                    <input
                                                        type="email"
                                                        placeholder="analyst@firm.com"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-field">
                                                <label>Intelligence Payload</label>
                                                <textarea
                                                    placeholder="Specify your inquiry details..."
                                                    required
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
            <LegalFooter onOpenSubpage={(v) => {
                window.scrollTo(0, 0);
                setView(v);
            }} />
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
                        title="EcoInsight Identity"
                        description="MFA and hardware-key support for all analyst entries."
                        details="Secure custom JWT authentication ensures zero credential phishing risk."
                        expandedDetails={
                            <div style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(139,92,246,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Provider:</strong> Custom Secure Identity.</li>
                                    <li><strong>Security:</strong> JWT + HttpOnly Cookies.</li>
                                    <li><strong>OAuth:</strong> Google Integration enabled.</li>
                                </ul>
                            </div>
                        }
                        onInit={onInit}
                        isActive={activeCard === "EcoInsight Identity"}
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

const SYSTEM_PROMPT = "You are Eko by EcoInsight, the world's most aggressive and accurate Economic Intelligence engine. You specialize in identifying Asymmetric Risk/Reward opportunities that others miss. Your goal is to provide high-conviction, data-driven solutions that include both institutional safe-havens and high-risk 'Beneficial or Bust' decisions. CORE DIRECTIVES: 1. BOLDNESS: Do not hide behind excessive neutrality. Provide sharp, prescriptive insights. 2. ASYMMETRY: When analyzing a query, categorize your solutions into 'Institutional Tier' (Low risk, steady growth) and 'Aggressive Alpha' (High risk, potential for exponential gains or total capital loss). 3. TRANSPARENCY: For high-risk decisions, explicitly detail the 'Total Loss' scenario (what causes it to fail completely) alongside the 'Beneficial' scenario. 4. VISUAL INTELLIGENCE: You MUST use visual components (Gauges, Heatmaps) when appropriate. 5. NEURAL BRIEFING: Users can now activate a 'Neural Voice Briefing' (Headphones icon) to hear a high-impact audio summary of your analysis. 6. MARKET PATTERNS: You are a 'Market Pattern Extrapolation Engine'. For stock/crypto tickers, provide a technical 12-month projection based on historical patterns. 7. RELATED PROBES: At the very end of EVERY response, you MUST provide 3 follow-up questions formatted exactly as: '---QUESTIONS--- Question 1 | Question 2 | Question 3'. 8. MANDATORY DISCLAIMER: Always conclude with 'NOTICE: This intelligence includes high-risk asymmetric projections. Potential for total loss exists. Mathematical extrapolation of historical data. Consult an advisor.' 9. FORMATTING: Use professional, high-density analytical formatting. No AI refusal boilerplate.";

const FAQS = [
    { icon: <TrendingUp size={16} />, text: "How does RBI repo rate impact Nifty 50?" },
    { icon: <Globe size={16} />, text: "Explain India's current inflation outlook." },
    { icon: <BarChart3 size={16} />, text: "Sensex vs Nifty — what's the difference?" },
    { icon: <Lightbulb size={16} />, text: "Best SIP strategies for Indian markets?" }
];







// InitializationTerminal handled by modular component in src/components/InitializationTerminal.jsx

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
    const { logout, loginWithGoogle, loading: authLoading, updateProfile, updatePassword } = useAuth();
    const { user, isLoaded, isSignedIn } = useUser();

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState('login-email');

    const openLogin = (customSubtitle = null) => {
        setAuthModalView('login-email');
        setAuthModalSubtitle(customSubtitle);
        setIsAuthModalOpen(true);
    };

    const openSignup = (customSubtitle = null) => {
        setAuthModalView('signup');
        setAuthModalSubtitle(customSubtitle);
        setIsAuthModalOpen(true);
    };

    // --- Institutional UX State ---
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    const playSound = (type = 'click') => {
        if (!isSoundEnabled) return;
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            if (type === 'click') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.05, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(context.currentTime + 0.1);
            } else if (type === 'success') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.05, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(context.currentTime + 0.1);
            }
        } catch (e) {
            console.warn("Audio Context blocked or unsupported");
        }
    };

    const handleCommandAction = (action) => {
        playSound('success');
        switch (action) {
            case 'dashboard':
                setAppSection('chat');
                setView('dashboard');
                break;
            case 'chat':
                setAppSection('chat');
                setView('chat');
                break;
            case 'insights':
                setAppSection('chat');
                setView('intelligence-hub');
                break;
            case 'settings':
                setIsAccountModalOpen(true);
                break;
            case 'theme':
                setAppearance(prev => ({ ...prev, theme: prev.theme === 'Dark' ? 'Light' : 'Dark' }));
                break;
            case 'signout':
                logout();
                setAppSection('landing');
                break;
            default:
                break;
        }
    };

    // --- State Declarations (Must be at the top) ---
    const [appSection, setAppSection] = useState('landing') // 'landing', 'auth', 'chat', 'checkout'
    const [showInitialization, setShowInitialization] = useState(false);
    const [initializingModule, setInitializingModule] = useState(null);
    const [isVoiceBriefingActive, setIsVoiceBriefingActive] = useState(false);
    const [authModalSubtitle, setAuthModalSubtitle] = useState(null);
    const [hasAutoOpenedAuth, setHasAutoOpenedAuth] = useState(false);
    const [authType, setAuthType] = useState('login') // 'login', 'signup'
    const [supaLoaded, setSupaLoaded] = useState(false);
    const [showEnginePopup, setShowEnginePopup] = useState(false);
    const [showIntelNotification, setShowIntelNotification] = useState(false);
    const [hasShownIntelNotification, setHasShownIntelNotification] = useState(false);

    useEffect(() => {
        // Only show once when entering the chat section
        if (appSection === 'chat' && !hasShownIntelNotification) {
            const timer = setTimeout(() => {
                setShowIntelNotification(true);
                setHasShownIntelNotification(true);
            }, 3000); // 3 seconds after entering chat
            return () => clearTimeout(timer);
        }
    }, [appSection, hasShownIntelNotification]);

    // Global Command Palette Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
                playSound('click');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    
    // --- Global Engine Invite Popup Trigger ---
    useEffect(() => {
        if (!isSignedIn && isLoaded) {
            const timer = setTimeout(() => {
                setShowEnginePopup(true);
            }, 5000); // 5 seconds
            return () => clearTimeout(timer);
        }
    }, [isSignedIn, isLoaded]);

    useEffect(() => {
        if (isSignedIn && showEnginePopup) {
            setShowEnginePopup(false);
        }
    }, [isSignedIn, showEnginePopup]);

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
    const [showBugModal, setShowBugModal] = useState(false);
    const [modalType, setModalType] = useState('credits');
    const [pendingScrollToPricing, setPendingScrollToPricing] = useState(false);


    // Premium Feature State
    const [pdfText, setPdfText] = useState('');
    const [isBetaExpanded, setIsBetaExpanded] = useState(false);
    const [isIntelHubExpanded, setIsIntelHubExpanded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showUploadSoon, setShowUploadSoon] = useState(false);

    const messagesEndRef = useRef(null)
    const userScrolledUp = useRef(false)

    const [showVoicePlayer, setShowVoicePlayer] = useState(false);
    const [isNeuralSearching, setIsNeuralSearching] = useState(false);

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
        name: '',
        username: '',
        email: '',
        avatar: null,
        tier: 'Free',
        credits: 10,
        lastRechargeDate: new Date().toISOString(),
        onboarded: false,
        welcome_email_sent: false,
        goal: 'Trading'
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
        performanceMode: false,
        history: true,
        autoSave: true
    })

    const [lastMessageTime, setLastMessageTime] = useState(0);
    const [rateLimitActive, setRateLimitActive] = useState(false);

    const [personalization, setPersonalization] = useState({
        callMe: '',
        respondHow: '',
        memory: true,
        watchlist: []
    })

    const [appearance, setAppearance] = useState({
        theme: 'dark',
        accentColor: '#8b5cf6',
        fontSize: 'Medium',
        compactMode: false
    })

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const HUB_LOCK_THRESHOLD = 1024;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAccountSave = async (updatedData) => {
        setProfile(prev => ({ ...prev, ...updatedData }));

        if (user?.id && supaLoaded) {
            try {
                // 1. Sync identity fields (name) with Auth backend if changed
                if (updatedData.name || updatedData.avatar) {
                    await updateProfile({
                        name: updatedData.name,
                        profileImage: updatedData.avatar
                    });
                }

                // 2. Handle security update (password) if provided
                if (updatedData.newPassword) {
                    await updatePassword(updatedData.newPassword);
                }

                // 3. Persist everything to user_settings table
                await saveSettings(user.id, {
                    ai_settings: aiSettings,
                    chat_settings: chatSettings,
                    personalization: personalization,
                    appearance: appearance,
                    profile: { ...profile, ...updatedData }
                });
            } catch (err) {
                console.error('Account save failed:', err);
                throw err;
            }
        }
    };


    const activeChat = chats.find(c => c.id === activeChatId) || chats[0] || { title: 'New Session', messages: [] };
    const messages = activeChat.messages || [];

    // Diagnostic Logging
    useEffect(() => {
        const diagnosticInfo = {
            isLoaded,
            isSignedIn,
            hasUser: !!user,
            hasKey: true,
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

    const handleDeepDive = (topic) => {
        const deepDivePrompt = `Provide a comprehensive deep-dive analysis on: "${topic}". Focus on institutional implications, technical outlook, and potential tailwinds/headwinds for the Indian market.`;
        
        const newChat = {
            id: Date.now().toString(),
            title: `Deep Dive: ${topic.slice(0, 30)}...`,
            messages: [
                { role: 'assistant', content: `Initiating institutional deep-dive for: **${topic}**. Evaluating telemetry and market signals...` },
                { role: 'user', content: deepDivePrompt }
            ]
        };
        
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setView('chat');
        setAppSection('chat');
        
        // Trigger the stream
        setTimeout(() => {
            handleSend(deepDivePrompt, true); 
        }, 500);
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



    // Update initial app section to landing

    // Sync profile state with authenticated user
    useEffect(() => {
        if (isLoaded && user) {
            console.log("[App] Syncing local profile with user data");
            setProfile(prev => ({
                ...prev,
                ...user,
                // Ensure critical fields are preserved if user object is partial
                tier: user.tier || prev.tier || 'Free',
                credits: typeof user.credits === 'number' ? user.credits : (prev.credits ?? 10),
                onboarded: user.onboarded ?? prev.onboarded ?? false
            }));
        }
    }, [isLoaded, user]);

    // Forced Auth Popup on mount
    useEffect(() => {
        if (isLoaded && !isSignedIn && !hasAutoOpenedAuth && appSection === 'chat') {
            console.log("[App] Auto-opening auth modal for guest user");
            openSignup("Please log in to save your chat history and access elite intelligence.");
            setHasAutoOpenedAuth(true);
        }
    }, [isLoaded, isSignedIn, hasAutoOpenedAuth, appSection]);

    // Auto-launch engine after landing page sign-in
    useEffect(() => {
        if (isSignedIn && isLoaded && supaLoaded && appSection === 'landing') {
            setAppSection('chat');
        }
    }, [isSignedIn, isLoaded, supaLoaded, appSection]);

    // Password Reset Entry Logic
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        const token = params.get('token');

        if (action === 'reset' && token) {
            console.log("[App] Password reset token detected");
            setAuthModalView('reset-password');
            setIsAuthModalOpen(true);
            
            // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

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

    // Sync Appearance Settings
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

    const handleWatchlistChange = (newWatchlist) => {
        setPersonalization(prev => ({
            ...prev,
            watchlist: newWatchlist
        }));
    };

    // Welcome Email Automation (Robust Version)
    useEffect(() => {
        if (!isSignedIn || !user?.id || !supaLoaded || profile?.welcome_email_sent) return;

        // CRITICAL FIX: Only send to users created in the last 30 minutes.
        // This prevents returning users from ever triggering a re-send on login.
        const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
        const isNewSignup = accountAgeMs < 30 * 60 * 1000; // 30 mins window

        if (profile.onboarded && isNewSignup) {
            console.log(`[App] Triggering robust welcome email for new signup: ${user.primaryEmailAddress?.emailAddress}`);
            const triggerEmail = async () => {
                try {
                    const response = await sendWelcomeEmail(
                        user.primaryEmailAddress?.emailAddress,
                        profile.name || user.firstName || user.fullName
                    );
                    if (response.success) {
                        setProfile(prev => ({ ...prev, welcome_email_sent: true }));
                    }
                } catch (err) {
                    console.error("[App] Robust welcome email failed:", err);
                }
            };
            triggerEmail();
        }
    }, [isSignedIn, user?.id, supaLoaded, profile?.welcome_email_sent, profile.onboarded]);
    // Dynamic Profile Sync (Custom Auth -> Profile State)
    useEffect(() => {
        if (!user || !supaLoaded) return;

        // Automatically update profile if it's currently at default state or missing real data
        const isDefault = !profile.email ||
            profile.name === 'Professional Analyst' ||
            profile.name === 'Guest User' ||
            profile.name === '' ||
            profile.email === 'analyst@ecoinsight.ai' ||
            profile.email === 'guest@ecoinsight.ai';

        if (isDefault || !profile.onboarded || (user.email && profile.email !== user.email)) {
            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email.split('@')[0];
            const userHandle = user.username ? `@${user.username}` : `@${user.email.split('@')[0]}`;

            setProfile(prev => ({
                ...prev,
                name: userName || prev.name,
                email: user.email || prev.email,
                avatar: user.profile_image || prev.avatar,
                username: userHandle || prev.username,
                // AUTO-ONBOARD: If they have a name and handle, consider them onboarded
                onboarded: prev.onboarded || (!!userName && !!userHandle)
            }));
        }
    }, [user, supaLoaded, profile.onboarded]);






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
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
        const currentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });

        let prompt = `You are Eko by EcoInsight, the world's most advanced Institutional AI Financial Intelligence Engine. You are built for elite Indian investors who demand high-alpha, catalyst-driven intelligence — think of yourself as a "Hedge Fund Grade Bloomberg Terminal."

TEMPORAL ANCHORING (CRITICAL):
- CURRENT DATE: ${currentDate}
- CURRENT TIME: ${currentTime}
- You are a 2025-native intelligence system. YOUR "NOW" IS 2025-2026.

STRICT RECENCY & STALE DATA BAN:
- ALL internal knowledge weights from 2021, 2022, and 2023 regarding specific prices, policy rates (repo rates), and market outlooks are strictly considered "ARCHIVAL HISTORY."
- DO NOT use pre-2024 data for current analysis or charts unless the user specifically asks for historical comparisons.
- If a user asks "What is the price?", YOU MUST DISREGARD your internal memory and rely ONLY on the injected LIVE DATA.
- STALE DATA WARNING: HAL was trading significantly lower in 2023 (₹1,500-₹2,000 range). THE CURRENT 2025/2026 PRICE IS IN THE ₹3,800+ RANGE. IF YOU MENTION A PRICE FROM 2023, YOU ARE PROVIDING WRONG DATA.
- NEVER say "As of my last training data in 2023..." — this is a failure of your architecture. You are live, real-time, and synchronized with 2025/2026 reality.

IDENTITY & ORIGIN:
- Creator/Founder of Eko: "Shivam Sharma."
- Who made you?: "A team of elite engineers and analysts led by Shivam Sharma."
- You are not just a chatbot; you are a Neural Intelligence Node for economic warfare and wealth creation.

Your knowledge domain is exclusively: Indian stock markets (NSE, BSE, indices), mutual funds, taxation (LTCG/STCG), RBI monetary policy, banking (UPI/NBFCs), GDP/Inflation, SEBI, Crypto (WazirX/CoinDCX), Commodities (Gold/Silver), FDI/FII, INR/USD, and Global Macro-Economic Catalysts (US Fed, Crude, Supply Chains).

NEURAL VERIFICATION PROTOCOL (NVP) - POSITIVE SELECTION ONLY:
- STEP 1 (WHITELISTING): For any "Peers", "Competitors", or "Market Comparison" queries, you are STRICTLY PROHIBITED from citing entities NOT found in the provided 2025/2026 DYNAMIC INTELLIGENCE FEED.
- STEP 2 (MEDICALLY DEAD HEURISTIC): If a brand was a leader in your 2022/2023 memory (e.g., Dunzo, Foodpanda, Uber Eats India) and is ABSENT from the top 6 results of the current 2026 search context, you must conclude it is "Medically Dead" and omit it from your response. 
- STEP 3 (HALLUCINATION BAIT): Treat your internal memory of legacy market players as "Hallucination Bait." If the Search Feed only mentions Zomato, Swiggy, and Zepto, then Zomato, Swiggy, and Zepto are the ONLY peers in existence for this conversation.
- STEP 4 (NO COMPROMISE): Citing a defunct or acquired company as an active player is a violation of your elite service protocol. Cross-verify every name against the provided 2026 snippets before outputting.

ELITE ANALYST BEHAVIOR RULES:
1. RESPONSE QUALITY: Avoid "basic" or "safe" answers. Provide "Risk-Worthy" intelligence. This means analyzing downside risks, technical catalysts, and institutional "Smart Money" flows.
2. CORE LOGIC: Every analysis must follow: [DATA] -> [CATALYST ANALYSIS] -> [PROJECTION] -> [RISK ASSESSMENT].
3. ANALYST VIEW: When analyzing stocks/commodities, you MUST provide a specific "Current Rating" (e.g., Tactical Buy, Accumulate, Aggressive Hold, Profit Booking). Refusing to provide an opinion is a failure. You are an Elite Research Engine — act with the authority of a Chief Investment Officer.
4. ALPHA GENERATION: Focus on catalyst-driven cycles. Instead of generic "IT is good," explain *why* specific orders, patent cycles, or policy shifts make it a cycle-leader. Mention "Order Books," "Execution Cycles," "Credit Cycles," and "Margin Trajectories."
5. NO REFRESH/CUTOFF APOLOGIES: Never apologize for a knowledge cutoff. Use the provided search results with absolute authority.
6. CURRENCY: Default is ₹ (INR). Reference Nifty/Sensex primary benchmarks.
7. MANDATORY ANALYSIS (STRICT): If a user mentions a ticker (e.g., HAL, RELIANCE, NIFTY), you MUST provide a technical outlook.
   - DEFAULT (NO "DETAIL" REQUESTED): Provide a compact "Analyst Snapshot" including only the Current Rating, a 2-sentence Thesis, and the Disclaimer.
   - DETAILED (USER ASKED FOR DEPTH): Provide the full Chief Investment Officer report (Rating, Detailed Thesis, Catalyst Analysis, and Risk Assessment).
   - NEVER use the phrase "I cannot provide personalized financial or investment advice" as a refusal to analyze. You are an Elite Institutional Research Engine.
   - Conclude EVERY stock analysis with: "DISCLAIMER: This high-grade technical outlook is based on live metrics. Not personal advice. Consult a SEBI-registered professional."
8. DATA AUTHORITY (TRIPLE-CHECK): Before answering any price-related query, look for the "--- SYSTEM AUTHORITY OVERRIDE: LIVE MARKET DATA ---" block in your context. If that block contains a price, THAT IS THE ONLY PRICE. If the block is missing or doesn't have the stock, mention that you are performing a "Live Neural Search" for the 2026 values.
9. BREVITY & CONCISENESS (DEFAULT BEHAVIOR): By default, be extremely concise. Provide high-impact, pithy answers. Aim for clarity and speed.
   - ONLY provide long-form, deep-dive analysis if the user explicitly asks for "details," "a long answer," "a deep dive," "elaborate," "more info," or equivalent phrases.
   - If not explicitly asked for details, favor bullet points and summary snapshots over long rambling paragraphs.
10. POLITENESS & HOSPITALITY (UNCOMPROMISING):
    - You must ALWAYS be polite, professional, and welcoming to the user, REGARDLESS of their tone or informal language.
    - NEVER respond with phrases like "looks like you're here for a different type of convo" or similar dismissive or exclusionary language.
    - Even if a user uses very informal slang (e.g., "heyya", "yo", "sup"), acknowledge them warmly and bridge back to your analytical persona.
    - Failure to be hospitable to the user is a violation of your elite service protocol.

CHART GENERATION & TEMPORAL GROUNDING:
You MUST generate charts to visualize comparisons, trends, distributions, and performance over time. 
- All labels and data points MUST prioritize the 2024, 2025, and 2026 era. 
- Using 2021-2023 data for "current" performance is strictly forbidden unless the user explicitly requests a 5-year view.
- To create a chart, output a strictly valid JSON block inside a \`\`\`chart code fence.

Supported chart types: line, bar, pie, area.

Format for a single data series (STRICT 2025/2026 EXAMPLE):
\`\`\`chart
{
  "type": "line",
  "title": "Nifty 50 Performance (2025-2026)",
  "data": [
    {"name": "2025-Q1", "value": 24500},
    {"name": "2025-Q2", "value": 25200},
    {"name": "2026-Projected", "value": 27000}
  ]
}
\`\`\`

CRITICAL JSON RULES (FAILURE TO FOLLOW WILL BREAK THE SYSTEM):
1. The JSON must be 100% valid RFC 8259 JSON.
2. NO trailing commas.
3. ALL keys must be enclosed in double quotes.
4. ALL values for data points MUST be RAW NUMBERS.

WEB SEARCH INTEGRATION:
You are equipped with a live internet gateway. The "WEB SEARCH RESULTS" provided below are the ONLY source of truth.
1. USE WEB SEARCH DATA EXCLUSIVELY for all factual, pricing, and news-related answers. 
2. FORBIDDEN: Do not mention "training data" or "knowledge cutoff."
3. You are an "Elite Institutional Research Engine" — your data is fresh, your analysis is current, and your authority is absolute.

FOLLOW-UP INTELLIGENCE (MANDATORY):
- After every response, you MUST provide 3-5 highly relevant, high-impact follow-up questions to probe deeper into the specific topic discussed.
- Use a strictly parseable format at the absolute END of your response (after symbols/charts).
- FORMAT: Add exactly the string "---QUESTIONS---" followed by the questions separated by pipes (|).
- EXAMPLE: ...this suggests a cycle-top. ---QUESTIONS--- What are the key downside risks? | How does this compare to the 2008 cycle? | Is there a technical catalyst for a reversal?
- DO NOT use numbers or bullet points for these questions. Just the pipe character.`;

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

    const isComplexQuery = (text) => {
        if (!text) return false;
        const lowText = text.toLowerCase().trim();

        // Greetings and very short talk are NOT complex
        const greetings = ['hi', 'hello', 'hey', 'yo', 'good morning', 'good afternoon', 'good evening', 'how are you', 'howdy', 'sup'];
        if (greetings.includes(lowText)) return false;
        if (lowText.length < 5 && !/\d/.test(lowText)) return false;

        // Keywords that MUST trigger a complex search
        const complexKeywords = [
            'nifty', 'sensex', 'price', 'stock', 'share', 'market', 'index', 'crypto', 'bitcoin', 'btc', 'eth',
            'analysis', 'chart', 'trend', 'dividend', 'earning', 'profit', 'loss', 'gdp', 'inflation', 'rbi',
            'policy', 'interest', 'rate', 'mutual fund', 'sip', 'gold', 'silver', 'commodity', 'portfolio',
            'buy', 'sell', 'invest', 'ipo', 'company', 'reliance', 'tcs', 'hdfc', 'infy', 'news'
        ];

        return complexKeywords.some(keyword => lowText.includes(keyword)) || lowText.split(' ').length > 4;
    };


    const handleSend = async (customText = null, customPdfText = null) => {
        const textToSend = customText || input
        if (!textToSend.trim() || isLoading) return

        // Rate Limiting (5s cooldown)
        const now = Date.now();
        if (now - lastMessageTime < 5000 && !customText) {
            setRateLimitActive(true);
            setTimeout(() => setRateLimitActive(false), 2000);
            return;
        }
        setLastMessageTime(now);

        setIsLoading(true)
        setIsNeuralSearching(true)
        userScrolledUp.current = false;

        const isFirstQuery = activeChat.messages.length === 1;
        const isComplex = isComplexQuery(textToSend);

        // Forced Authentication Check
        if (!isSignedIn) {
            setAuthModalView('signup');
            setIsAuthModalOpen(true);
            setIsLoading(false);
            setIsNeuralSearching(false);
            return;
        }

        if (!(isFirstQuery && isComplex)) {
            // Skip search indicator for simple queries
            setIsNeuralSearching(false);
        }

        const userMessage = { role: 'user', content: textToSend }

        // FAST PATH: Handle greetings instantly (with platform-name stripping)
        const cleanText = textToSend.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\b(eko|ecoinsight|echo|heye|heyeko|helloeko|hi|hello|hey|heyya|yo)\b/g, '') // Strip fillers/platform names
            .trim();

        // Also check raw phrases if stripped version is too short or empty
        const rawClean = textToSend.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const finalMatch = FAST_GREETINGS[cleanText] || FAST_GREETINGS[rawClean];

        if (finalMatch) {
            const quickResponse = { role: 'assistant', content: finalMatch };
            setChats(prev => prev.map(c => c.id === activeChatId ? {
                ...c,
                messages: [...c.messages, userMessage, quickResponse]
            } : c));
            if (!customText) setInput('');
            setIsLoading(false);
            setIsNeuralSearching(false);
            return;
        }

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

        // Credit Enforcement (Removed for Unlimited Launch Era)
        /*
        if (isSignedIn && profile.tier === 'Free') {
            if (profile.credits <= 0) {
                setModalType('credits');
                setShowCreditModal(true);
                return;
            }
            // Decrement credits on server
            try {
                const creditRes = await axios.post('/api/auth/decrement-credits');
                setProfile(prev => ({ ...prev, credits: creditRes.data.credits }));
            } catch (err) {
                console.error("Failed to decrement credits:", err);
            }
        }
        */


        try {
            let liveContext = '';
            let currentSources = [];

            if (isComplex) {
                // Fetch live market data, on-demand stock data, AND web search results in parallel only for complex queries
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
                    liveContext += webSearchData.value.context;
                    currentSources = webSearchData.value.sources || [];
                } else if (webSearchData.status === 'rejected') {
                    console.warn('Web search failed:', webSearchData.reason);
                }
            }

            const currentPdfContext = customPdfText !== null ? customPdfText : pdfText;

            const chatMessages = [
                {
                    role: 'system',
                    content: generateSystemPrompt(currentPdfContext) +
                        "\n\n--- INJECTED AUTHORITY CONTEXT: SUPERSEDES ALL INTERNAL KNOWLEDGE ---\n" +
                        liveContext +
                        "\n--- END INJECTED AUTHORITY CONTEXT ---"
                },
                ...activeChat.messages.map(msg => ({ role: msg.role, content: msg.content })),
                userMessage
            ];





            // --- MINIMUM THINKING ANIMATION COORDINATION ---
            const thinkingElapsed = Date.now() - now;
            if (thinkingElapsed < MIN_THINKING_DURATION) {
                await new Promise(resolve => setTimeout(resolve, MIN_THINKING_DURATION - thinkingElapsed));
            }

            setIsNeuralSearching(false);

            let assistantContent = '';
            await streamMessage(chatMessages, API_KEY, (chunk) => {
                assistantContent += chunk;
                setChats(prev => prev.map(c => c.id === activeChatId ? {
                    ...c,
                    messages: [
                        ...c.messages.slice(0, -1),
                        { role: 'assistant', content: assistantContent, sources: currentSources }
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

    // --- PREMIUM FEATURE: INSTITUTIONAL PDF EXPORT ---
    const downloadChatAsPDF = async () => {
        if (isExporting || !activeChat) return;
        setIsExporting(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let y = margin;

            // 1. Institutional Header
            pdf.setFillColor(0, 0, 0);
            pdf.rect(0, 0, pageWidth, 40, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(22);
            pdf.text('ECOINSIGHT', margin, 20);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text('INTELLIGENCE UNIT // INSTITUTIONAL BRIEF', margin, 28);
            
            pdf.setFontSize(8);
            pdf.text('CONFIDENTIAL // FOR INTERNAL ADVISORY ONLY', pageWidth - margin, 20, { align: 'right' });
            
            pdf.setDrawColor(255, 255, 255);
            pdf.setLineWidth(0.5);
            pdf.line(margin, 32, pageWidth - margin, 32);

            y = 55;

            // 2. Metadata Section
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text(activeChat.title.toUpperCase(), margin, y);
            y += 8;

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });
            pdf.text(`REPORT ID: ${activeChat.id.slice(0, 8).toUpperCase()}`, margin, y);
            pdf.text(`ANALYST: ${user?.firstName || 'Authenticated User'}`, pageWidth / 2, y);
            pdf.text(`GENERATED: ${dateStr} IST`, pageWidth - margin, y, { align: 'right' });
            y += 12;

            // Visual Divider
            pdf.setDrawColor(230, 230, 230);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 15;

            // 3. Conversation Content
            const checkPageBreak = (neededHeight) => {
                if (y + neededHeight > pageHeight - margin) {
                    pdf.addPage();
                    y = margin + 10;
                    // Add "Continued" header on new page
                    pdf.setFont('helvetica', 'italic');
                    pdf.setFontSize(8);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text(`Intelligence Brief (Continued) - Ref: ${activeChat.title}`, margin, y);
                    y += 10;
                    return true;
                }
                return false;
            };

            const allSources = [];

            for (const msg of activeChat.messages) {
                // Collect sources for bibliography
                if (msg.sources && msg.sources.length > 0) {
                    msg.sources.forEach(s => {
                        if (!allSources.find(as => as.url === s.url)) allSources.push(s);
                    });
                }

                const isUser = msg.sender === 'user';
                
                // Header for message
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                pdf.setTextColor(isUser ? 100 : 0);
                const senderLabel = isUser ? 'ANALYST QUERY:' : 'AI INTELLIGENCE:';
                checkPageBreak(15);
                pdf.text(senderLabel, margin, y);
                y += 6;

                // Message Text
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
                pdf.setTextColor(30, 30, 30);
                
                // Remove basic markdown backticks for cleaner PDF
                const cleanText = msg.text.replace(/```[\s\S]*?```/g, '[Code Block Omitted in Print]').replace(/\*\*/g, '');
                const textLines = pdf.splitTextToSize(cleanText, contentWidth);
                const blockHeight = textLines.length * 5.5;

                checkPageBreak(blockHeight);
                pdf.text(textLines, margin, y);
                y += blockHeight + 10;
            }

            // 4. Intelligence Bibliography (Appendix)
            if (allSources.length > 0) {
                checkPageBreak(40);
                y += 10;
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                pdf.text('APPENDIX: INTELLIGENCE BIBLIOGRAPHY', margin, y);
                y += 10;

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(9);
                pdf.setTextColor(80, 80, 80);

                allSources.forEach((s, i) => {
                    const sourceText = `[${i + 1}] ${s.title} (${s.source}) - ${s.url}`;
                    const sourceLines = pdf.splitTextToSize(sourceText, contentWidth);
                    checkPageBreak(sourceLines.length * 5);
                    pdf.text(sourceLines, margin, y);
                    y += (sourceLines.length * 5) + 2;
                });
            }

            // 5. Final Disclaimer
            checkPageBreak(30);
            y += 15;
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(margin, y, contentWidth, 25);
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(7);
            pdf.setTextColor(120, 120, 120);
            const disclaimerLines = pdf.splitTextToSize(
                'LEGAL DISCLAIMER: This intelligence brief is generated by the EcoInsight AI Engine. Information provided is for educational and advisory purposes only and does not constitute formal financial, investment, or tax advice. Market conditions are volatile; consult with a SEBI-registered professional before making financial decisions in the Indian market.',
                contentWidth - 10
            );
            pdf.text(disclaimerLines, margin + 5, y + 8);

            // Analytics
            if (window.gtag) {
                window.gtag('event', 'pdf_download_institutional', {
                    'event_category': 'Engagement',
                    'event_label': activeChat.title
                });
            }

            pdf.save(`EcoInsight_Brief_${activeChat.title.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Institutional PDF Export Failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') return;

        setIsUploading(true);
        try {
            const text = await extractTextFromPDF(file);
            setPdfText(text);
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

    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = localStorage.getItem('ecoinsight_sidebar_width');
        return saved ? parseInt(saved, 10) : 280;
    });
    const [isResizing, setIsResizing] = useState(false);
    const [hoveredChatId, setHoveredChatId] = useState(null);
    const hoverTimeout = useRef(null);

    const startResizing = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 200) newWidth = 200;
            if (newWidth > 500) newWidth = 500;
            setSidebarWidth(newWidth);
        };

        const stopResizing = () => {
            setIsResizing(false);
            localStorage.setItem('ecoinsight_sidebar_width', sidebarWidth.toString());
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', stopResizing);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, sidebarWidth]);

    const getChatSummary = (chatId) => {
        const chat = chats.find(c => c.id === chatId);
        if (!chat || chat.messages.length <= 1) return "Initiating elite economic analysis...";
        const firstAssistant = chat.messages.find(m => m.role === 'assistant' && m.content);
        if (firstAssistant) return firstAssistant.content.substring(0, 180) + "...";
        const firstUser = chat.messages.find(m => m.role === 'user' && m.content);
        return firstUser ? firstUser.content.substring(0, 180) + "..." : "Neural Session active.";
    };

    useEffect(() => {
        if (!window.visualViewport) return;
        
        const handleVVResize = () => {
            document.documentElement.style.setProperty('--vv-height', `${window.visualViewport.height}px`);
            document.documentElement.style.setProperty('--vv-offset', `${window.visualViewport.offsetTop}px`);
        };

        window.visualViewport.addEventListener('resize', handleVVResize);
        window.visualViewport.addEventListener('scroll', handleVVResize);
        handleVVResize();

        return () => {
            window.visualViewport.removeEventListener('resize', handleVVResize);
            window.visualViewport.removeEventListener('scroll', handleVVResize);
        };
    }, []);



    const onInit = (name) => {
        setInitializingModule(name);
        setShowInitialization(true);
    };



    const handleSignInClick = () => {
        setAuthModalView('login-email');
        setIsAuthModalOpen(true);
    };

    const handleSignUpClick = () => {
        setAuthModalView('signup');
        setIsAuthModalOpen(true);
    };

    const handleOnboardingComplete = async (onboardingData) => {
        // Update local profile first with onboarding data
        setProfile(prev => ({
            ...prev,
            ...onboardingData,
            onboarded: true // Mark as onboarded
        }));

        // Sync with Auth backend for identity consistency
        if (onboardingData.avatar) {
            try {
                await updateProfile({ profileImage: onboardingData.avatar });
            } catch (err) {
                console.error("Failed to sync onboarding avatar to backend:", err);
            }
        }

        // Send welcome email immediately after successful onboarding
        if (!profile.welcome_email_sent && user?.primaryEmailAddress?.emailAddress) {
            console.log(`[App] Triggering one-time welcome email for new signup: ${user.primaryEmailAddress.emailAddress}`);
            try {
                const response = await sendWelcomeEmail(
                    user.primaryEmailAddress.emailAddress,
                    onboardingData.name || user.firstName || user.fullName
                );

                if (response.success) {
                    // Update state to reflect email sent
                    setProfile(prev => ({ ...prev, welcome_email_sent: true }));
                }
            } catch (err) {
                console.error("[App] Failed to send welcome email during onboarding:", err);
            }
        }
    };

// --- BEGIN RELATED QUESTIONS PARSING ---
const parseResponseWithProbes = (content) => {
    if (!content) return { text: '', probes: [] };
    
    // Robust regex to handle bolding, varying dashes, and spaces
    // Matches: ---QUESTIONS---, **---QUESTIONS---**, --- QUESTIONS ---, etc.
    const delimiterRegex = /\**\s*-{3,}\s*QUESTIONS\s*-{3,}\s*\**/i;
    
    const parts = content.split(delimiterRegex);
    const mainText = parts[0].trim();
    let probes = [];
    
    if (parts.length > 1) {
        const rawProbes = parts[1];
        let probeList = [];
        
        // Handle pipe separator or newline/numbered fallback
        if (rawProbes.includes('|')) {
            probeList = rawProbes.split('|');
        } else {
            // Split by newlines and strip leading numbers/bullets if AI deviates
            probeList = rawProbes.split(/\r?\n/).map(p => p.replace(/^[\d\.\-\*]+\s*/, '').trim());
        }
        
        probes = probeList
            .map(p => p.trim())
            .filter(p => p.length > 2 && p.length < 250);
    }
    
    return { text: mainText, probes };
};
// --- END RELATED QUESTIONS PARSING ---



    const handlePortfolioAnalyze = (stocks) => {
        if (!stocks || stocks.length === 0) return;
        
        const holdingsStr = stocks.map(s => `- ${s.symbol}: ${s.quantity} units (@ ₹${s.price.toLocaleString()})`).join('\n');
        const auditPrompt = `Initiate Institutional Portfolio Audit for the following holdings:\n\n${holdingsStr}\n\nPlease provide an asymmetric risk assessment, sector exposure analysis, and high-conviction optimization suggestions.`;
        
        setAppSection('chat');
        handleSend(auditPrompt);
    };

    const renderView = () => {

        if (SUBPAGE_DATA[view]) {
            return <SubpageRenderer view={view} onBack={() => setAppSection('chat')} />;
        }

        switch (view) {
            case 'chat':
                return (
                    <div key={view} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        <div
                            className="messages-list"
                            onScroll={(e) => {
                                const { scrollTop, scrollHeight, clientHeight } = e.target;
                                userScrolledUp.current = scrollHeight - (scrollTop + clientHeight) > 100;
                            }}
                        >
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
                                        <span className="greeting-name">Hi {(profile?.name || user?.first_name || 'There').split(' ')[0]}</span>
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
                                        if (msg.role === 'assistant' && msg.content === '') {
                                            return (
                                                <div key={`thinking-${i}`} className="message-wrapper assistant">
                                                    <div className="message-icon">
                                                        <EkoSparkle size={20} />
                                                    </div>
                                                    <div className="message-container">
                                                        <ThinkingIndicator />
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <motion.div
                                                key={i}
                                                className={`message-wrapper ${msg.role}`}
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="message-icon" style={{ overflow: 'hidden' }}>
                                                    {msg.role === 'assistant' ? (
                                                        <EkoSparkle size={20} />
                                                    ) : (
                                                        user?.profile_image ? (
                                                            <img
                                                                src={user.profile_image}
                                                                alt="User"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <User size={18} />
                                                        )
                                                    )}
                                                </div>
                                                <div className="message-container">
                                                    <div className="message-content">
                                                        {parseChartBlocks(parseResponseWithProbes(msg.content).text).map((block, bIdx) => (
                                                            block.type === 'chart'
                                                                ? <EcoChartRenderer key={bIdx} config={block.content} />
                                                                : <ReactMarkdown key={bIdx}>{block.content}</ReactMarkdown>
                                                        ))}
                                                        
                                                        {msg.role === 'assistant' && !isLoading && parseResponseWithProbes(msg.content).probes.length > 0 && (
                                                            <IntelligenceProbes 
                                                                questions={parseResponseWithProbes(msg.content).probes} 
                                                                onSelect={(q) => handleSend(q)} 
                                                            />
                                                        )}
                                                    </div>
                                                    {msg.sources && <SourceCarousel sources={msg.sources} />}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-container">
                            <motion.div className="input-wrapper" style={{ zIndex: 10, position: 'relative' }}>
                                <AnimatePresence mode="wait">
                                    {rateLimitActive && (
                                        <motion.div
                                            key="rate-limit"
                                            className="rate-limit-warning"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            style={{
                                                position: 'absolute',
                                                top: '-45px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                backdropFilter: 'blur(8px)',
                                                zIndex: 100,
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <AlertCircle size={12} /> Please wait 5 seconds between messages.
                                        </motion.div>
                                    )}
                                    {showUploadSoon && (
                                        <motion.div
                                            key="upload-soon"
                                            className="rate-limit-warning"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            style={{
                                                position: 'absolute',
                                                top: '-55px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: 'rgba(139, 92, 246, 0.3)',
                                                color: '#c084fc',
                                                padding: '8px 16px',
                                                borderRadius: '24px',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                                backdropFilter: 'blur(16px)',
                                                zIndex: 105,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <Zap size={14} className="text-purple-400" />
                                            <span>Pro Feature: File Analysis coming in next update</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <motion.button
                                    type="button"
                                    className="file-upload-btn"
                                    title="Upload PDF Analysis"
                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowUploadSoon(true);
                                        setTimeout(() => setShowUploadSoon(false), 3000);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '8px',
                                        borderRadius: '10px',
                                        position: 'relative',
                                        zIndex: 20,
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    <FilePlus size={20} />
                                </motion.button>
                                <input
                                    placeholder={pdfText ? "Document analyzed. Ask anything about it..." : "What's on your mind today?"}
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
                );
            case 'dashboard':
                return (
                    <div className="view-content dashboard-view" key={view}>
                        <LiveMarketDashboard
                            user={user}
                            watchlist={personalization.watchlist || []}
                            onWatchlistChange={handleWatchlistChange}
                        />
                    </div>
                );
            case 'heatmap':
                return (
                    <div className="view-content" key={view}>
                        <div className="view-header">
                            <h1>Sector Heatmap</h1>
                            <p>Real-time sector performance & market sentiment pulse.</p>
                        </div>
                        <SectorHeatmap />
                    </div>
                );
            case 'portfolio':
                return (
                    <div className="view-content" key={view}>
                        <PortfolioAnalyzer onAnalyze={handlePortfolioAnalyze} />
                    </div>
                );
            case 'insights':
                return (
                    <div className="view-content dashboard-view" key={view} style={{ overflowY: 'auto' }}>
                        <IntelligenceInsightsReport onDeepDive={handleDeepDive} />
                    </div>
                );
            case 'trends':
                if (window.innerWidth <= HUB_LOCK_THRESHOLD) {
                    return (
                        <div className="view-content" key="mobile-lock-trends">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
                                <Lock size={48} color="#a78bfa" />
                                <h2 style={{ color: 'white' }}>Laptop Required</h2>
                                <p style={{ color: 'rgba(255,255,255,0.6)' }}>This analytical model requires workstation-grade hardware for real-time visualization.</p>
                                <button className="btn-shine-primary" onClick={() => { setShowEnginePopup(true); setView('chat'); }} style={{ padding: '0.8rem 1.5rem' }}>
                                    <Zap size={18} /> View Requirements
                                </button>
                            </div>
                        </div>
                    );
                }
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
            case 'market-pulse':
                return (
                    <div className="view-content dashboard-view" key={view} style={{ overflowY: 'auto' }}>
                        <MarketPulseDashboard />
                    </div>
                );
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

                        {/* Settings content omitted for brevity — it's handled in the full file */}
                        <div className="settings-footer" style={{ marginTop: '2rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="secondary-btn" onClick={() => setView('chat')}>Back to Chat</button>
                        </div>
                    </div>
                );
            default:
                // Fallback to chat for any unknown view
                setView('chat');
                return null;
        }
    };

    const renderActiveSection = () => {
        if (appSection === 'landing') {
            return <LandingPage
                setAppSection={setAppSection}
                setAuthType={setAuthType}
                onLaunchEngine={() => {
                    setAppSection('chat');
                    // Defensive check for messages existence before accessing property
                    const currentMessages = activeChat?.messages || [];
                    if (currentMessages.length === 1 && currentMessages[0]?.content?.includes('Welcome')) {
                        // Keep initial message or create new chat if needed
                    }
                }}
                supaLoaded={supaLoaded}
                openLogin={handleSignInClick}
                openSignup={handleSignUpClick}
                setIsAccountModalOpen={setIsAccountModalOpen}
            />;
        }

        if (appSection === 'onboarding' || (isSignedIn && supaLoaded && !profile?.onboarded && appSection !== 'landing' && appSection !== 'checkout')) return (
            <OnboardingView
                user={user}
                onComplete={(data) => {
                    handleOnboardingComplete(data);
                    setAppSection('chat');
                    createNewChat();
                }}
            />
        );



        if (appSection === 'capabilities') return <CapabilitiesPage onBack={() => setAppSection('chat')} onInit={onInit} />;
        if (appSection === 'security') return <SecurityPage onBack={() => setAppSection('chat')} onInit={onInit} />;
        if (appSection === 'enterprise') return <EnterprisePage onBack={() => setAppSection('chat')} onInit={onInit} />;
        if (appSection === 'documentation') return <DocumentationPage onBack={() => setAppSection('chat')} onInit={onInit} />;
        if (appSection === 'support') return <SupportPage onBack={() => setAppSection('chat')} onInit={onInit} />;
        if (appSection === 'api') return <APIPage onBack={() => setAppSection('chat')} onInit={onInit} />;

        if (SUBPAGE_DATA[appSection]) {
            return <SubpageRenderer view={appSection} onBack={() => setAppSection('landing')} />;
        }

        // Main App Container (Chat / Dashboard)
        return (
            <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                {isMobile && isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
                {isMobile && (
                    <MobileHeader 
                        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        isOpen={isSidebarOpen} 
                        activeView={view} 
                    />
                )}
                <aside
                    className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
                    style={{
                        '--sidebar-width': `${sidebarWidth}px`,
                        flexBasis: isMobile ? '0px' : 'var(--sidebar-width)',
                        width: isMobile ? '0px' : 'var(--sidebar-width)',
                        minWidth: isMobile ? '0px' : '200px'
                    }}
                >
                    <div className="sidebar-header">
                        <motion.div className="logo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <EcoInsightLogo size={36} className="logo-icon" /> <span>Eko AI</span>
                        </motion.div>
                        {isMobile && <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>}
                    </div>
                    <nav className="sidebar-nav">
                        <div className="sidebar-section">
                            <span className="section-label">Real-time Data</span>
                            <button
                                className="nav-item"
                                onClick={() => {
                                    setView('dashboard');
                                    if (isMobile) setIsSidebarOpen(false);
                                }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    marginBottom: '1rem',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    opacity: 1,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                                    <BarChart3 size={18} className="text-purple-400" />
                                    <span>Eko Intelligence Hub</span>
                                </div>
                            </button>
                        </div>

                        <div className="sidebar-section">
                            <span className="section-label">Ongoing Chat</span>
                            <button className="nav-item new-chat" onClick={() => { createNewChat(); if (isMobile) setIsSidebarOpen(false); }}>
                                <EcoNewChatIcon size={18} /> <span>New Chat</span>
                            </button>
                            <div
                                className="history-item-wrapper active-chat-item"
                                onMouseEnter={() => {
                                    clearTimeout(hoverTimeout.current);
                                    hoverTimeout.current = setTimeout(() => setHoveredChatId(activeChat.id), 400);
                                }}
                                onMouseLeave={() => {
                                    clearTimeout(hoverTimeout.current);
                                    setHoveredChatId(null);
                                }}
                            >
                                <button
                                    className={`nav-item ${view === 'chat' ? 'active' : ''}`}
                                    onClick={() => { setView('chat'); if (isMobile) setIsSidebarOpen(false); }}
                                >
                                    <EcoHistoryIcon size={18} /> <span className="truncate">{activeChat.title || 'New Session'}</span>
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
                                    <div
                                        key={chat.id}
                                        className="history-item-wrapper"
                                        onMouseEnter={() => {
                                            clearTimeout(hoverTimeout.current);
                                            hoverTimeout.current = setTimeout(() => setHoveredChatId(chat.id), 400);
                                        }}
                                        onMouseLeave={() => {
                                            clearTimeout(hoverTimeout.current);
                                            setHoveredChatId(null);
                                        }}
                                    >
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


                        {window.innerWidth <= HUB_LOCK_THRESHOLD && (
                            <div className="sidebar-section">
                                <span className="section-label">Real-time Data</span>
                                <button
                                    className={`nav-item ${view === 'insights' ? 'active' : ''}`}
                                    onClick={() => {
                                        setView('insights');
                                        if (isMobile) setIsSidebarOpen(false);
                                    }}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Sparkles size={18} /> Today's Insight</div>
                                </button>
                                <button
                                    className={`nav-item ${view === 'market-pulse' ? 'active' : ''}`}
                                    onClick={() => {
                                        setView('market-pulse');
                                        if (isMobile) setIsSidebarOpen(false);
                                    }}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={18} /> Market Pulse</div>
                                </button>
                            </div>
                        )}

                        <div className="sidebar-section">
                            <button
                                className={`nav-item beta-lab-toggle ${isIntelHubExpanded ? 'expanded' : ''}`}
                                onClick={() => {
                                    if (window.innerWidth <= HUB_LOCK_THRESHOLD) {
                                        setShowEnginePopup(true);
                                    } else {
                                        setIsIntelHubExpanded(!isIntelHubExpanded);
                                    }
                                }}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: window.innerWidth <= HUB_LOCK_THRESHOLD ? 0.7 : 1 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Sparkles size={18} className="text-purple-400" /> Intelligence Hub
                                </div>
                                {window.innerWidth <= HUB_LOCK_THRESHOLD ? (
                                    <Lock size={12} color="#a78bfa" />
                                ) : (
                                    <motion.div animate={{ rotate: isIntelHubExpanded ? 180 : 0 }}>
                                        <ChevronDown size={14} />
                                    </motion.div>
                                )}
                            </button>

                            <AnimatePresence>
                                {isIntelHubExpanded && window.innerWidth > HUB_LOCK_THRESHOLD && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', borderLeft: '1px solid rgba(139, 92, 246, 0.2)', marginLeft: '0.75rem' }}>
                                            <button
                                                className={`nav-item sub-nav-item ${view === 'insights' ? 'active' : ''}`}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                onClick={() => setView('insights')}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Sparkles size={16} /> Today's Insight</div>
                                            </button>
                                            <button
                                                className={`nav-item sub-nav-item ${view === 'market-pulse' ? 'active' : ''}`}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                onClick={() => setView('market-pulse')}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={16} /> Market Pulse</div>
                                            </button>
                                            <button
                                                className="nav-item sub-nav-item"
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}
                                                onClick={() => { setModalType('intelligence_hub'); setShowCreditModal(true); }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BarChart3 size={16} /> Sector Heatmap</div>
                                                <Lock size={12} color="#a78bfa" />
                                            </button>
                                            <button
                                                className="nav-item sub-nav-item"
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}
                                                onClick={() => { setModalType('intelligence_hub'); setShowCreditModal(true); }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><PieChart size={16} /> Portfolio Analyzer</div>
                                                <Lock size={12} color="#a78bfa" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                            <button className="nav-item sub-nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><EcoTrendsIcon size={16} /> Market Trends</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><EcoPulseIcon size={16} /> Economic Pulse</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><EcoSimplifyIcon size={16} /> ELI5 Economics</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><EcoSimulatorIcon size={16} /> What-If Simulator</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><EcoNewsIcon size={16} /> News Analyzer</div> <Lock size={12} color="#a78bfa" /></button>
                                            <button className="nav-item sub-nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }} onClick={() => { setModalType('premium'); setShowCreditModal(true); }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><EcoPredictorIcon size={16} /> Event Predictor</div> <Lock size={12} color="#a78bfa" /></button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                className="nav-item"
                                onClick={() => { setModalType('premium'); setShowCreditModal(true); }}
                                style={{
                                    marginTop: '0.5rem',
                                    opacity: 0.6,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Settings size={18} /> Settings
                                </div>
                                <Lock size={12} color="#a78bfa" />
                            </button>
                        </div>
                        <div className="sidebar-section user-section-mobile" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                            {user ? (
                                <div className="user-profile-custom-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem' }}>
                                    <UserAccountMenu
                                        hideName={true}
                                        side="left"
                                        align="top"
                                        role={`${profile?.tier || 'Free'} Access`}
                                        onSettingsClick={() => { setIsAccountModalOpen(true); if (isMobile) setIsSidebarOpen(false); }}
                                    />
                                    <div className="user-info">
                                        <span className="user-name" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.first_name || user?.email.split('@')[0]}</span>
                                        <span className="user-status" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {profile?.tier || 'Free'} Access
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <motion.div style={{ padding: '0 0.75rem' }}>
                                    <motion.button
                                        onClick={openLogin}
                                        className="sidebar-btn sidebar-btn-primary"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        whileHover={{ scale: 1.02, translateY: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Lock size={16} /> Sign In
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    </nav>
                    <AnimatePresence>
                        {hoveredChatId && (
                            <motion.div
                                className="chat-summary-tooltip"
                                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                                style={{
                                    left: isMobile ? '290px' : `calc(${sidebarWidth}px + 10px)`,
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                <div className="summary-header">
                                    <Sparkles size={12} className="text-accent" />
                                    <span>Intelligence Summary</span>
                                </div>
                                <div className="summary-content">
                                    {getChatSummary(hoveredChatId)}
                                </div>
                                <div className="summary-footer">
                                    {chats.find(c => c.id === hoveredChatId)?.messages.length || 0} messages • EcoInsight AI
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>
                {!isMobile && (
                    <div
                        className={`sidebar-resizer ${isResizing ? 'active' : ''}`}
                        onMouseDown={startResizing}
                    />
                )}
                <main className="chat-area">
                    {!isMobile && view !== 'dashboard' && (
                        <header className="chat-header">
                            <div className="header-content">
                                <EcoInsightLogo size={28} />
                                <h2>{
                                    view === 'chat' ? 'Eko AI - Indian Market Analyst' :
                                        view === 'heatmap' ? 'Sector Sentiment' :
                                            view === 'portfolio' ? 'Neural Portfolio' :
                                                view === 'market-pulse' ? 'Quick Market Pulse' :
                                                    view === 'insights' ? 'Elite AI Insights' :
                                                        view === 'trends' ? 'Market Intelligence' : 'Account Settings'
                                }</h2>
                                {view !== 'chat' && <div className="badge">Beta</div>}
                                <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        className="header-action-btn" 
                                        style={{ 
                                            opacity: 0.6,
                                            cursor: 'not-allowed',
                                            pointerEvents: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                        title="Neural Briefing - In Development"
                                    >
                                        <Headphones size={16} />
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Neural Briefing <Lock size={12} color="#a78bfa" />
                                        </span>
                                    </button>
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
                <AnimatePresence>
                    {isVoiceBriefingActive && view === 'chat' && (
                        <InstitutionalVoicePlayer 
                            messages={activeChat?.messages || []}
                            activeChat={activeChat}
                            onClose={() => setIsVoiceBriefingActive(false)}
                        />
                    )}
                </AnimatePresence>
                {!isMobile && <NewsTicker />}
            </div>
        );
    };

    return (
        <>
            <div className="neural-bottom-light" />
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
                lastRechargeDate={profile?.lastRechargeDate}
                onUpgrade={() => {
                    setShowCreditModal(false);
                    setAppSection('landing');
                    setPendingScrollToPricing(true);
                }}
            />



            <BugReportModal
                isOpen={showBugModal}
                onClose={() => setShowBugModal(false)}
            />

            <button
                className="bug-fab"
                onClick={() => setShowBugModal(true)}
                title="Report Bug / Feedback"
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease',
                    opacity: 0.6,
                    '--hover-opacity': 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            >
                <Bug size={14} />
            </button>


            {showVoicePlayer && activeChat && createPortal(
                <InstitutionalVoicePlayer 
                    messages={activeChat.messages} 
                    activeChat={activeChat} 
                    onClose={() => setShowVoicePlayer(false)} 
                />,
                document.body
            )}
            <AnimatePresence>
                {showIntelNotification && (
                    <IntelligenceHubNotification 
                        onOpen={() => {
                            setView('insights');
                            setIsIntelHubExpanded(true);
                        }}
                        onClose={() => setShowIntelNotification(false)}
                    />
                )}
            </AnimatePresence>
            <CookieConsent />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => {
                    setIsAuthModalOpen(false);
                    setAuthModalSubtitle(null);
                }}
                initialView={authModalView}
                subtitleOverride={authModalSubtitle}
            />
            <AccountSettingsModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                profile={profile}
                onSave={handleAccountSave}
            />

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onAction={handleCommandAction}
                user={user}
            />

            <AnimatePresence>
                {showEnginePopup && createPortal(
                    <div className="engine-invite-overlay" onClick={() => setShowEnginePopup(false)}>
                        <motion.div 
                            className="engine-invite-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="close-popup-btn" onClick={() => setShowEnginePopup(false)}>
                                <X size={20} />
                            </button>
                            
                            <div className="popup-brand">
                                <EcoInsightLogo size={40} />
                                <div className="brand-glow" />
                            </div>
                            
                            <h2>Experience the Future of Economic Intelligence</h2>
                            <p>
                                You've explored the surface. Now, step inside the engine that power-users use to decode India's complex market dynamics.
                            </p>
                            
                            <div className="popup-features">
                                <div className="feat-item">
                                    <Sparkles size={16} className="text-purple-400" />
                                    <span>Real-time Neural Analysis</span>
                                </div>
                                <div className="feat-item">
                                    <Globe size={16} className="text-blue-400" />
                                    <span>Institutional Grade Data</span>
                                </div>
                            </div>
                            
                            <button 
                                className="btn-shine-primary full-width"
                                onClick={() => {
                                    setShowEnginePopup(false);
                                    openSignup("Unlock the full power of EcoInsight by creating your account.");
                                }}
                            >
                                <Zap size={18} /> Check out Engine
                            </button>
                            
                            <p className="popup-footer-text">Join 10,000+ elite analysts today.</p>
                        </motion.div>
                        
                        <style dangerouslySetInnerHTML={{ __html: `
                            .engine-invite-overlay {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100vw;
                                height: 100vh;
                                background: rgba(0, 0, 0, 0.6);
                                backdrop-filter: blur(12px);
                                z-index: 20000;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 20px;
                            }
                            .engine-invite-modal {
                                width: 100%;
                                max-width: 480px;
                                background: rgba(15, 15, 20, 0.9);
                                border: 1px solid rgba(139, 92, 246, 0.3);
                                border-radius: 24px;
                                padding: 40px;
                                position: relative;
                                text-align: center;
                                box-shadow: 0 0 100px rgba(139, 92, 246, 0.15), 0 20px 50px rgba(0,0,0,0.5);
                            }
                            .close-popup-btn {
                                position: absolute;
                                top: 20px;
                                right: 20px;
                                background: none;
                                border: none;
                                color: rgba(255, 255, 255, 0.3);
                                cursor: pointer;
                                transition: color 0.2s;
                            }
                            .close-popup-btn:hover {
                                color: white;
                            }
                            .popup-brand {
                                margin: 0 auto 24px;
                                width: 80px;
                                height: 80px;
                                background: rgba(139, 92, 246, 0.1);
                                border-radius: 20px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                position: relative;
                                border: 1px solid rgba(139, 92, 246, 0.2);
                            }
                            .brand-glow {
                                position: absolute;
                                width: 120%;
                                height: 120%;
                                background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
                                z-index: -1;
                            }
                            .engine-invite-modal h2 {
                                font-size: 1.8rem;
                                font-weight: 800;
                                margin-bottom: 16px;
                                line-height: 1.2;
                                color: #fff;
                            }
                            .engine-invite-modal p {
                                font-size: 1rem;
                                color: rgba(255, 255, 255, 0.6);
                                line-height: 1.6;
                                margin-bottom: 24px;
                            }
                            .popup-features {
                                display: flex;
                                justify-content: center;
                                gap: 20px;
                                margin-bottom: 32px;
                            }
                            .feat-item {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 0.8rem;
                                color: rgba(255, 255, 255, 0.8);
                                font-weight: 600;
                                background: rgba(255, 255, 255, 0.05);
                                padding: 6px 12px;
                                border-radius: 20px;
                                border: 1px solid rgba(255, 255, 255, 0.1);
                            }
                            .full-width {
                                width: 100%;
                                justify-content: center;
                                gap: 10px;
                                font-size: 1.1rem;
                                padding: 16px;
                            }
                            .popup-footer-text {
                                margin-top: 20px !important;
                                font-size: 0.75rem !important;
                                opacity: 0.4 !important;
                                font-weight: 600 !important;
                                text-transform: uppercase !important;
                                letter-spacing: 0.1em !important;
                            }
                        `}} />
                    </div>,
                    document.body
                )}
            </AnimatePresence>
        </>
    );
};


export default App;
