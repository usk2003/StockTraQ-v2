import React from 'react';
import {
    TrendingUp,
    Eye,
    Globe,
    PieChart,
    Zap,
    Milestone,
    ShieldCheck,
    ArrowUpRight,
    Search,
    BarChart3,
    Layers,
    Bot
} from 'lucide-react';

export const Roadmap = () => {
    const features = [
        {
            id: 'stock-traq',
            title: 'Equi TraQ',
            subtitle: 'Experimental Stock Analysis',
            description: 'Advanced analysis based on target price ratings, company fundamentals, and Peer PE comparisons. Real-time valuation auditing for existing listings.',
            icon: TrendingUp,
            color: 'blue',
            tags: ['AI ANALYSIS', 'PEER AUDIT']
        },
        {
            id: 'watch-traq',
            title: 'Watch TraQ',
            subtitle: 'Intelligent Watchlist',
            description: 'Add stocks to your Watchlist and track real-time upside/downside since the day of watchlisting. Validate your analysis with historical performance tracking.',
            icon: Eye,
            color: 'green',
            tags: ['TRACKING', 'UPSIDE CALC']
        },
        {
            id: 'sme-ipo-traq',
            title: 'SME Ipo TraQ',
            subtitle: 'SME Market Scanner',
            description: 'Deep web analysis of SME IPOs. Analyzes company performance and fundamentals across multiple internet sources to give a 360-degree audit.',
            icon: Globe,
            color: 'purple',
            tags: ['SME SEARCH', 'FUNDAMENTALS']
        },
        {
            id: 'fund-traq',
            title: 'Fund TraQ',
            subtitle: 'Mutual Fund Intelligence',
            description: 'Track Mutual Funds and receive intelligent suggestions tailored to your risk appetite and financial capability. Smart asset allocation guardian.',
            icon: PieChart,
            color: 'orange',
            tags: ['MUTUAL FUNDS', 'RISK PROFILING']
        },
        {
            id: 'advanced-bot',
            title: 'Insight TraQ Pro',
            subtitle: 'Global Document Auditor',
            description: 'Expands capabilities to audit all company files, including quarterly results, annual reports, and investor presentations with deep conversational RAG.',
            icon: Bot,
            color: 'red',
            tags: ['RAG v2', 'PDF AUDIT']
        },
        {
            id: 'pro-insights',
            title: 'Pro Insights',
            subtitle: 'Institutional Grade Metrics',
            description: 'Unlocks advanced valuation metrics and sentiment analysis sourced from top institutional research reports and market data feeds.',
            icon: Zap,
            color: 'yellow',
            tags: ['INSIGHTS', 'PREMIUM']
        }
    ];

    const getColorClasses = (color) => {
        const classes = {
            blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/10',
            green: 'bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/10',
            purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20 shadow-purple-500/10',
            orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-orange-500/10',
            red: 'bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/10',
            yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-yellow-500/10',
            cyan: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 shadow-cyan-500/10'
        };
        return classes[color] || classes.blue;
    };

    return (
        <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto animate-fade-in">
            {/* Header Section */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/30 text-primary-700 dark:text-primary-400 mb-6">
                    <Milestone className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Future Development</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
                    Stock TraQ <span className="text-primary-600 italic">Roadmap</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                    We are expanding the boundaries of AI-driven financial auditing. Explore the upcoming modules currently in our experimental pipeline.
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature) => (
                    <div
                        key={feature.id}
                        className="group bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col relative"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-[9px] font-black uppercase text-gray-400">
                                <Activity className="w-3 h-3 text-gray-400 animate-pulse" />
                                In Research
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            {/* Icon & Title */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border ${getColorClasses(feature.color)}`}>
                                <feature.icon className="w-8 h-8" />
                            </div>

                            <div className="mb-4">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1 group-hover:text-primary-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{feature.subtitle}</p>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                                {feature.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-50 dark:border-dark-border/50">
                                {feature.tags.map((tag) => (
                                    <span key={tag} className="text-[9px] font-black px-2 py-1 rounded bg-gray-50 dark:bg-dark-bg text-gray-400 uppercase tracking-widest group-hover:border-primary-500/20 group-hover:bg-primary-500/5 transition-all">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-primary-600 translate-y-full group-hover:translate-y-[calc(100%-4px)] transition-transform duration-500"></div>
                    </div>
                ))}
            </div>

            {/* SaaS Evolution Announcement */}
            <div className="mt-20 p-12 bg-white dark:bg-dark-card rounded-[3rem] border-4 border-dashed border-primary-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform">
                    <Layers className="w-64 h-64 text-primary-600" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 mb-8">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Expansion Announcement</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <div className="max-w-3xl">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
                                Evolution into a <span className="text-primary-600">Full Scalable SaaS</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8">
                                Stock TraQ is evolving. We are building a comprehensive, institutional-grade SaaS ecosystem designed for all types of investors. Our mission is to democratize high-frequency auditing and AI-driven valuation.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                    { plan: 'Monthly', desc: 'Agile & Flexible' },
                                    { plan: 'Quarterly', desc: 'Standard Audit' },
                                    { plan: 'Annual', desc: 'Professional Hub' }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.plan}</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-72 shrink-0">
                            <div className="p-8 bg-primary-600 rounded-[2.5rem] text-white shadow-2xl shadow-primary-500/30">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Early Access</p>
                                <p className="text-2xl font-black leading-none mb-4">Join the Waitlist</p>
                                <button className="w-full py-4 bg-white text-primary-600 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                                    Pre-Register
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-20 p-12 bg-primary-600 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 transform group-hover:rotate-12 transition-transform opacity-10">
                    <Rocket className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Have a Feature Suggestion?</h2>
                        <p className="text-primary-100 font-bold opacity-90">Our roadmap is shaped by the TraQ community. Send us your ideas for the next generation of audit tools.</p>
                    </div>
                    <button className="px-10 py-5 bg-white text-primary-600 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
                        Submit Audit Idea <ArrowUpRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal Activity Icon
const Activity = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

// Internal Rocket Icon
const Rocket = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-1.81" />
        <path d="M10 10l-4.24 4.24" />
        <path d="M12 8l4.24-4.24" />
        <path d="M9 11l-3 3" />
        <path d="M13 7l3-3" />
        <path d="M15 5l-2 2" />
        <path d="M11 9l-2 2" />
        <path d="M22 2l-3 3" />
        <path d="M18 6l-3 3" />
        <path d="M15.5 10.5c1.26 1.5 5 2 5 2s-.5-3.74-2-5c-.71-.71-1.81-.79-1.81-.79" />
    </svg>
);
