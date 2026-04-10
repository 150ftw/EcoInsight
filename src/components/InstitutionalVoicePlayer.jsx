import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Square, X, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const InstitutionalVoicePlayer = ({ messages, activeChat, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [voice, setVoice] = useState(null);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const utteranceRef = useRef(null);

    // Advanced Summary Logic: Extracts the "Bottom Line" for the user
    const summarizeIntelligence = (text) => {
        if (!text) return "";
        
        let cleaned = String(text);
        // 1. Strip Markdown
        cleaned = cleaned.replace(/#+\s/g, ''); 
        cleaned = cleaned.replace(/\*\*/g, ''); 
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
        
        // 2. Formatting standard terms
        cleaned = cleaned.replace(/₹/g, ' Rupees ');
        cleaned = cleaned.replace(/nifty/gi, ' Nifty ');
        cleaned = cleaned.replace(/sensex/gi, ' Sensex ');

        // 3. Extracting High-Impact Summary:
        // Split by sentences. Take first 2 sentences + any sentence containing numbers or percentages
        const sentences = cleaned.split(/(?<=[.!?])\s+/);
        const essential = [];
        
        // Always take the first 2 sentences for context
        essential.push(...sentences.slice(0, 2));
        
        // Look for data-rich sentences in the remainder (limit to 2 more)
        const dataSentences = sentences.slice(2).filter(s => 
            s.includes('%') || 
            /\d+/.test(s) || 
            /target|projection|forecast|risk|growth/i.test(s)
        ).slice(0, 2);
        
        essential.push(...dataSentences);
        
        // 4. Final Clean (trimming conversational filler)
        let finalSummary = essential.join(' ');
        finalSummary = finalSummary.replace(/Certainly!|I've analyzed|I have processed|Based on the data/gi, '');
        
        return finalSummary.trim();
    };

    // Filter to ONLY the LATEST response
    const speechMessages = useMemo(() => {
        if (!messages || !Array.isArray(messages)) return [];
        
        try {
            // Find the VERY LAST assistant message
            const assistantMessages = messages.filter(m => m && (m.role === 'assistant' || m.sender === 'assistant'));
            if (assistantMessages.length === 0) return [];
            
            const latestMsg = assistantMessages[assistantMessages.length - 1];
            const rawText = latestMsg.text || latestMsg.content || '';
            
            const summary = summarizeIntelligence(rawText);
            
            // Split into segments for more natural prosody (small pauses between ideas)
            return summary.split(/(?<=[.!?])\s+/).filter(s => s.length > 5);
        } catch (error) {
            console.error('Speech synthesis preparation failure:', error);
            return [];
        }
    }, [messages]);

    useEffect(() => {
        if (!synth) return;

        const loadVoices = () => {
            try {
                const voices = synth.getVoices();
                if (!voices || voices.length === 0) return;
                
                // PRIORITIZE "Neural" and "Natural" sounding voices for Institutional quality
                const preferred = voices.find(v => 
                    (v.name.includes('Neural') || v.name.includes('Natural') || v.name.includes('Google')) &&
                    (v.lang.startsWith('en-GB') || v.lang.startsWith('en-IN') || v.lang.startsWith('en-US'))
                );
                
                // Fallback to established professional names
                const proFallback = voices.find(v => 
                    v.name.includes('Samantha') || 
                    v.name.includes('Daniel') ||
                    v.name.includes('Microsoft James')
                );

                setVoice(preferred || proFallback || voices[0]);
            } catch (e) {
                console.warn('Voice loading error:', e);
            }
        };

        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
        loadVoices();

        return () => {
            synth.cancel();
        };
    }, [synth]);

    const stop = () => {
        if (synth) synth.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTextIndex(0);
    };

    const speak = (index) => {
        if (!synth || index >= speechMessages.length) {
            stop();
            return;
        }

        const text = speechMessages[index];
        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        
        // MODULATION: Slightly vary rate and pitch for non-robotic flow
        utterance.rate = 1.02; // Institutional speed
        utterance.pitch = 1.0; 
        
        // Add specific emphasis for the very first sentence
        if (index === 0) {
            utterance.pitch = 1.02; 
        }

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
            setCurrentTextIndex(index);
        };

        utterance.onend = () => {
            if (index + 1 < speechMessages.length) {
                // Short organic pause between sentences
                setTimeout(() => speak(index + 1), 250);
            } else {
                stop();
            }
        };

        utterance.onerror = (e) => {
            console.error('Speech Error:', e);
            stop();
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
    };

    const togglePlay = () => {
        if (!synth) return;

        if (isPlaying) {
            if (isPaused) {
                synth.resume();
                setIsPaused(false);
            } else {
                synth.pause();
                setIsPaused(true);
            }
        } else {
            speak(0);
        }
    };

    const hasContent = speechMessages.length > 0;

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="institutional-voice-player"
        >
            <div className="player-blur-bg" />
            
            <div className="player-content">
                <div className="player-info">
                    <div className="live-pill">
                        <span className="pill-dot" />
                        {isPlaying ? 'SUMMARIZING INTEL' : 'NEURAL BRIEFING READY'}
                    </div>
                    <div className="brief-title">
                        {!hasContent ? 'Awaiting Intelligence...' : (activeChat?.title || 'Intelligence Briefing')}
                    </div>
                </div>

                <div className="waveform-container">
                    {[...Array(12)].map((_, i) => (
                        <motion.div 
                            key={i}
                            className="waveform-bar"
                            animate={{
                                height: isPlaying && !isPaused ? [12, 32, 18, 45, 12] : 4,
                                opacity: isPlaying && !isPaused ? 1 : 0.2
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.8,
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </div>

                <div className="player-controls">
                    <button 
                        onClick={togglePlay} 
                        className={`control-btn main ${!hasContent ? 'disabled' : ''}`}
                        disabled={!hasContent}
                    >
                        {isPlaying && !isPaused ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={stop} className="control-btn secondary">
                        <Square size={16} />
                    </button>
                    <button onClick={onClose} className="control-btn close">
                        <X size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default InstitutionalVoicePlayer;
