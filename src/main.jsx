import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'

/**
 * INSTITUTIONAL TELEMETRY INITIALIZATION
 * Only triggers in production if VITE_GA_ID is set.
 */
const initializeAnalytics = () => {
    const GA_ID = import.meta.env.VITE_GA_ID;
    if (GA_ID && GA_ID !== 'G-XXXXXXXXXX') {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);
        console.log(`[Telemetry] Institutional tracking active: ${GA_ID}`);
    }
};

const Root = () => {
    useEffect(() => {
        initializeAnalytics();
    }, []);

    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
)
