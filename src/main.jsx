import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log("Clerk Publishable Key detected:", !!PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY} 
            afterSignOutUrl="/"
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: '#8b5cf6',
                    colorBackground: '#0a0a0c',
                    colorText: '#ffffff',
                    colorInputBackground: '#111114',
                    colorInputText: '#ffffff',
                    borderRadius: '12px'
                },
                elements: {
                    card: {
                        background: 'rgba(10, 10, 12, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    },
                    socialButtonsBlockButton: {
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    formFieldInput: {
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }
                }
            }}
        >
            <App />
        </ClerkProvider>
    </React.StrictMode>,
)

