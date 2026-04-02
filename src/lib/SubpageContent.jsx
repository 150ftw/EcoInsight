import React from 'react';
import { 
    LifeBuoy, BookOpen, Activity, ShieldAlert, 
    Info, Briefcase, Users, Gift, Mail, 
    ShieldCheck, ScrollText, Scale, CreditCard, AlertTriangle 
} from 'lucide-react';

import shivamAvatar from '../assets/founder/shivam.jpg';

export const SUBPAGE_DATA = {
    // Resources
    'help-center': {
        icon: <LifeBuoy size={32} />,
        title: "Help Center",
        description: "Comprehensive support for the Eko by EcoInsight analytic engine.",
        sections: [
            {
                heading: "Getting Started",
                content: "Learn how to initialize your first analytical session, configure your regional parameters, and connect your market data streams for real-time tracking."
            },
            {
                heading: "User Management",
                content: "Manage institutional seats, set permission tiers for junior analysts, and configure SSO integration for enterprise-grade security."
            },
            {
                heading: "Troubleshooting",
                content: "Resolve common initialization errors, API timeout issues, and PDF parsing conflicts. Our automated diagnostic tool can identify 95% of connectivity problems."
            },
            {
                heading: "Knowledge Base Integration",
                content: "Sync your internal research documents with the Eko by EcoInsight engine to create a private knowledge graph for your organization."
            }
        ]
    },
    'knowledge-base': {
        icon: <BookOpen size={32} />,
        title: "Knowledge Base",
        description: "Deep-dive documentation into our macroeconomic models and AI architecture.",
        sections: [
            {
                heading: "Economic Theory Integration",
                content: "How our AI synthesizes Keynesian, Monetarist, and Austrian school models for balanced forecasting. We employ a multi-agent consensus mechanism to minimize ideological bias."
            },
            {
                heading: "Prompt Engineering for Analysts",
                content: "Advanced syntax for querying specific sectoral data, generating high-fidelity reports, and extracting sentiment from unstructured central bank transcripts."
            },
            {
                heading: "Model Transparency",
                content: "Understand the 'Confidence Score' assigned to every prediction. We provide full traceability for every data point used in our neural inference chains."
            },
            {
                heading: "Historical Backtesting",
                content: "Detailed logs of how Eko by EcoInsight models performed during major market events like the 2008 crash, the 2020 pandemic, and recent inflationary spikes."
            }
        ]
    },
    'network-status': {
        icon: <Activity size={32} />,
        title: "Network Status",
        description: "Real-time monitoring of our neural inference nodes and data scrapers.",
        sections: [
            {
                heading: "Global Inference Engine",
                content: "Operational - 99.98% uptime. All 4,096 high-performance compute nodes are operating at peak efficiency across our distributed data centers."
            },
            {
                heading: "Market Data Scrapers",
                content: "Operational - Google Finance, Bloomberg Terminal sync, and Sectoral APIs are responding within 150ms. No data gaps detected in the last 72 hours."
            },
            {
                heading: "API Gateway Stability",
                content: "The main entry point for third-party integrations is healthy. Current load is at 42% capacity, ensuring low-latency response times for all institutional clients."
            },
            {
                heading: "Database Replication",
                content: "Primary and secondary clusters in North America, Europe, and Asia are perfectly synced. Disaster recovery protocols are in 'Standby' mode."
            }
        ]
    },
    'security-advisories': {
        icon: <ShieldAlert size={32} />,
        title: "Security Advisories",
        description: "Updates on data encryption protocols and platform integrity.",
        sections: [
            {
                heading: "Encryption Standard",
                content: "All chat data and uploaded PDFs are encrypted using AES-256 at rest and TLS 1.3 in transit. We have implemented Post-Quantum Cryptography for long-term data sovereignty."
            },
            {
                heading: "Threat Detection",
                content: "Our system utilizes real-time anomaly detection and behavioral analysis to prevent unauthorized analytical access and potential data exfiltration attempts."
            },
            {
                heading: "SOC 2 Type II Compliance",
                content: "Eko by EcoInsight has successfully completed its annual security audit. Full reports are available to Enterprise clients under NDA."
            },
            {
                heading: "Vulnerability Disclosure",
                content: "We run a 24/7 bug bounty program. If you discover a potential exploit, please route it through our 'Report Abuse' portal for prioritized review."
            }
        ]
    },

    // Company
    'about-us': {
        icon: <Info size={32} />,
        title: "About Us",
        description: "The mission behind the world's most advanced economic intelligence platform.",
        sections: [
            {
                heading: "The Vision",
                content: "To democratize elite-level economic intelligence through the power of specialized, transparent AI. We believe clarity is the foundation of global prosperity."
            },
            {
                heading: "Leadership",
                type: "leadership",
                founder: {
                    name: "Shivam Sharma",
                    title: "DIRECTOR & FOUNDER",
                    entity: "EKO BY ECOINSIGHT AI (OPC) PRIVATE LIMITED",
                    avatarText: "S",
                    avatarImg: shivamAvatar
                }
            },
            {
                heading: "Our Origins",
                content: "Founded by a consortium of former central bankers and MIT data scientists, Eko by EcoInsight was built to fill the gap between raw data and actionable wisdom."
            },
            {
                heading: "The Team",
                content: "A global collective of economists, neural network engineers, and product designers dedicated to the pursuit of analytical truth in an era of noise."
            }
        ]
    },
    'careers': {
        icon: <Briefcase size={32} />,
        title: "Careers",
        description: "Join the frontier of economic AI development.",
        sections: [
            {
                heading: "Openings",
                content: "We are currently looking for Senior AI Researchers (Neural Dynamics), Quantitative Economists, and Full-Stack 'Elite' Product Engineers."
            },
            {
                heading: "Culture",
                content: "A high-performance, industrial-grade environment where analytical precision is the highest currency. We value intellectual honesty above all else."
            },
            {
                heading: "Benefits",
                content: "Competitive equity packages, global remote flexibility, and access to the world's most advanced proprietary economic data sets."
            },
            {
                heading: "Internship Program",
                content: "Our 'Future Vision' program invites senior university students to work alongside our core research team on real-world forecasting tasks."
            }
        ]
    },
    'partners': {
        icon: <Users size={32} />,
        title: "Partners",
        description: "Scaling intelligence through strategic global alliances.",
        sections: [
            {
                heading: "Institutional Access",
                content: "Partnering with global banks, sovereign wealth funds, and research institutes for exclusive data pipeline integration and custom model fine-tuning."
            },
            {
                heading: "Technology Partners",
                content: "Collaborating with leading cloud infrastructure providers and hardware manufacturers to optimize neural inference for real-time economic processing."
            },
            {
                heading: "Affiliate Ecosystem",
                content: "Our certified consultants help enterprises integrate Eko by EcoInsight into their existing decision-making workflows. Join our global network of experts."
            },
            {
                heading: "Research Grants",
                content: "We provide funding and compute resources to academic teams investigating the intersection of machine learning and macroeconomic stability."
            }
        ]
    },
    'referral': {
        icon: <Gift size={32} />,
        title: "Referral Program",
        description: "Expand the network of intelligence and earn rewards.",
        sections: [
            {
                heading: "Elite Rewards",
                content: "Refer a pro analyst and receive 3 months of Enterprise Access. When your organization scales, your influence on the network is recognized."
            },
            {
                heading: "Institutional Incentives",
                content: "Banks that onboard multiple departments through our referral network receive priority access to our upcoming 'Quantum Forecasting' beta."
            },
            {
                heading: "Community Growth",
                content: "Top referrers are invited to our annual 'Insight Summit'—an exclusive gathering of the world's leading economic minds."
            }
        ]
    },
    'contact': {
        icon: <Mail size={32} />,
        title: "Contact",
        description: "Direct line to our analyst support and institutional relations teams.",
        isInteractive: true,
        type: 'form',
        sections: [
            {
                heading: "Response Protocol",
                content: "All inquiries are triaged by our automated sorting system. Priority 1 (Enterprise) responses are guaranteed within 2 hours."
            },
            {
                heading: "Global Offices",
                content: "Our physical presence spans across London, New York, Singapore, and Zurich to ensure 24/7 coverage for the global market."
            }
        ]
    },

    // Legal
    'privacy-policy': {
        icon: <ShieldCheck size={32} />,
        title: "Privacy Policy",
        description: "Your data is your intellectual property. Here's how we protect it with absolute transparency.",
        sections: [
            {
                heading: "Data Sovereignty",
                content: "We do not sell, trade, or analyze your personal queries for external advertising. Your data stays within your enterprise container at all times."
            },
            {
                heading: "Zero-Knowledge Architecture",
                content: "Our system is designed so that even we cannot read your specific chat history without your explicit authorization for support purposes."
            },
            {
                heading: "Right to Erasure",
                content: "You retain the right to purge all your interaction history from our primary and secondary clusters at any time with a single click."
            },
            {
                heading: "GDPR & CCPA Compliance",
                content: "We adhere to the world's strictest data protection regulations, ensuring your information is handled with the highest level of care."
            }
        ]
    },
    'terms-of-service': {
        icon: <ScrollText size={32} />,
        title: "Terms of Service",
        description: "The protocols governing your use of the Eko by EcoInsight intelligence engine.",
        sections: [
            {
                heading: "Platform Usage",
                content: "Users must not utilize the engine for illegal financial manipulation, automated spamming of market data, or reverse-engineering our core models."
            },
            {
                heading: "Service Availability",
                content: "While we strive for 100% uptime, institutional clients have specific service-level agreements (SLAs) regarding guaranteed availability."
            },
            {
                heading: "Intellectual Property",
                content: "The Eko by EcoInsight name, logos, and neural architectures are proprietary. Reports generated by the engine belong to the user for internal use."
            },
            {
                heading: "Termination Clauses",
                content: "Violation of our integrity protocols may lead to immediate suspension of services to maintain the stability of the analytical network."
            }
        ]
    },
    'acceptable-use': {
        icon: <Scale size={32} />,
        title: "Acceptable Use Policy",
        description: "Maintaining a standard of professional analytical integrity within the ecosystem.",
        sections: [
            {
                heading: "Prohibited Content",
                content: "Generation of deceptive financial advice, misuse of deep-learning models for social engineering, or toxic interaction patterns is strictly prohibited."
            },
            {
                heading: "System Integrity",
                content: "Users are forbidden from attempting to bypass our rate-limiters or probe our infrastructure for vulnerabilities through automated scripts."
            },
            {
                heading: "Professional Standard",
                content: "Eko by EcoInsight is a tool for professionals. We expect all interactions to reflect the standard of a high-power institutional environment."
            }
        ]
    },
    'payment-refund': {
        icon: <CreditCard size={32} />,
        title: "Payment & Refund",
        description: "Transparent billing protocols for professional and institutional subscriptions.",
        sections: [
            {
                heading: "Billing Cycle",
                content: "Enterprise and Pro plans are billed on a monthly or annual cadence. All transactions are processed through encrypted, SEC-compliant gateways."
            },
            {
                heading: "Refund Protocol",
                content: "Standard subscriptions carry a 14-day no-questions-asked refund policy. Enterprise contracts follow specific negotiated termination terms."
            },
            {
                heading: "Tax Compliance",
                content: "Our system automatically calculates VAT and regional taxes based on your corporate nexus, ensuring seamless fiscal reconciliation."
            }
        ]
    },
    'report-abuse': {
        icon: <AlertTriangle size={32} />,
        title: "Report Abuse",
        description: "System for flagging security breaches, unethical AI patterns, or model deviations.",
        sections: [
            {
                heading: "Integrity Reporting",
                content: "Use this portal to report any system vulnerabilities or deviations from our ethical AI guidelines. Reports are reviewed by our Integrity Board."
            },
            {
                heading: "Bug Bounty",
                content: "Critical security flaws that are responsibly disclosed qualify for our high-tier bug bounty rewards, including platform credits and grants."
            },
            {
                heading: "Model Hallucinations",
                content: "If you detect a significant deviation in model accuracy or a recurring 'hallucination', please flag it here for retraining priority."
            }
        ]
    }
};
