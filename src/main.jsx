import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ComingSoon from './ComingSoon.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log("Clerk Publishable Key detected:", !!PUBLISHABLE_KEY);
if (PUBLISHABLE_KEY) {
    console.log("Key Header:", PUBLISHABLE_KEY.substring(0, 7));
    console.log("Key Footer:", PUBLISHABLE_KEY.substring(PUBLISHABLE_KEY.length - 4));
}

if (!PUBLISHABLE_KEY) {
    console.error("CRITICAL: Missing VITE_CLERK_PUBLISHABLE_KEY");
    throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ComingSoon />
    </React.StrictMode>,
)
