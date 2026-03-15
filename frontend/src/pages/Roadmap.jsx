import React, { useState } from 'react';
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
    Bot,
    Calendar,
    Newspaper,
    CheckCircle
} from 'lucide-react';

export const Roadmap = () => {
    const features = [
        {
            id: 'legacy-ipo-traq',
            title: 'IPO TraQ',
            subtitle: 'Fundamental Scanner',
            description: 'Launch of IPO TraQ allowing users to track and analyze upcoming Initial Public Offerings with fundamental insight.',
            icon: BarChart3,
            color: 'yellow',
            tags: ['IPO', 'FUNDAMENTALS'],
            releaseDate: 'Q4 2025'
        },
        {
            id: 'legacy-insight-traq',
            title: 'Insight TraQ',
            subtitle: 'Document Intelligence',
            description: 'Launch of the first generation Insight TraQ Chatbot to assist users with semantic RAG queries.',
            icon: Bot,
            color: 'purple',
            tags: ['RAG v1', 'CHATBOT'],
            releaseDate: 'Q1 2026'
        },
        {
            id: 'stock-traq',
            title: 'Equi TraQ',
            subtitle: 'Experimental Stock Analysis',
            description: 'Advanced analysis based on target price ratings, company fundamentals, and Peer PE comparisons. Real-time valuation auditing for existing listings.',
            icon: TrendingUp,
            color: 'blue',
            tags: ['AI ANALYSIS', 'PEER AUDIT'],
            releaseDate: 'Q2 2026'
        },
        {
            id: 'watch-traq',
            title: 'Watch TraQ',
            subtitle: 'Intelligent Watchlist',
            description: 'Add stocks to your Watchlist and track real-time upside/downside since the day of watchlisting. Validate your analysis with historical performance tracking.',
            icon: Eye,
            color: 'green',
            tags: ['TRACKING', 'UPSIDE CALC'],
            releaseDate: 'Q3 2026'
        },
        {
            id: 'sme-ipo-traq',
            title: 'SME Ipo TraQ',
            subtitle: 'SME Market Scanner',
            description: 'Deep web analysis of SME IPOs. Analyzes company performance and fundamentals across multiple internet sources to give a 360-degree audit.',
            icon: Globe,
            color: 'purple',
            tags: ['SME SEARCH', 'FUNDAMENTALS'],
            releaseDate: 'Q4 2026'
        },
        {
            id: 'fund-traq',
            title: 'Fund TraQ',
            subtitle: 'Mutual Fund Intelligence',
            description: 'Track Mutual Funds and receive intelligent suggestions tailored to your risk appetite and financial capability. Smart asset allocation guardian.',
            icon: PieChart,
            color: 'orange',
            tags: ['MUTUAL FUNDS', 'RISK PROFILING'],
            releaseDate: 'Q1 2027'
        },
        {
            id: 'advanced-bot',
            title: 'Insight TraQ Pro',
            subtitle: 'Global Document Auditor',
            description: 'Expands capabilities to audit all company files, including quarterly results, annual reports, and investor presentations with deep conversational RAG.',
            icon: Bot,
            color: 'red',
            tags: ['RAG v2', 'PDF AUDIT'],
            releaseDate: 'Q2 2027'
        },
        {
            id: 'pro-insights',
            title: 'Pro Insights',
            subtitle: 'Institutional Grade Metrics',
            description: 'Unlocks advanced valuation metrics and sentiment analysis sourced from top institutional research reports and market data feeds.',
            icon: Zap,
            color: 'yellow',
            tags: ['INSIGHTS', 'PREMIUM'],
            releaseDate: 'Q3 2027'
        },
        {
            id: 'market-traq',
            title: 'Market TraQ',
            subtitle: 'AI Powered Market News',
            description: 'A dedicated hub for fetching, summarizing, and sentiment-scoring live market news using deep learning, fully integrated with your dashboard.',
            icon: Newspaper,
            color: 'cyan',
            tags: ['NEWS', 'SENTIMENT'],
            releaseDate: 'Q4 2027'
        },
        {
            id: 'vision-2028',
            title: 'Vision 2028',
            subtitle: 'The One Stop Solution',
            description: 'A unified, intelligent ecosystem providing comprehensive Stock Market Insights for all tiers of investors.',
            icon: Milestone,
            color: 'blue',
            tags: ['ECOSYSTEM', 'SCALABILITY'],
            releaseDate: 'End of 2028'
        }
    ];

    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);

    // X/Y coordinates for the 7 features along the SVG path (0-100 percentages)
    // Trends upwards naturally like a stock chart
    const dataPoints = [
        { x: 5, y: 95 },
        { x: 15, y: 88 },
        { x: 25, y: 80 },
        { x: 35, y: 70 },
        { x: 45, y: 65 },
        { x: 55, y: 55 },
        { x: 65, y: 40 },
        { x: 75, y: 25 },
        { x: 85, y: 15 },
        { x: 95, y: 5 }
    ];

    const handleNext = () => {
        if (selectedFeatureIndex !== null && selectedFeatureIndex < features.length - 1) {
            setSelectedFeatureIndex(selectedFeatureIndex + 1);
        }
    };

    const handlePrev = () => {
        if (selectedFeatureIndex !== null && selectedFeatureIndex > 0) {
            setSelectedFeatureIndex(selectedFeatureIndex - 1);
        }
    };

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
                    Click along our growth chart to explore the upcoming milestones in our experimental pipeline.
                </p>
            </div>

            {/* Stock Chart Wrapper */}
            <div className="relative w-full h-[600px] bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-dark-border shadow-2xl p-4 md:p-12 overflow-x-auto custom-scrollbar">

                {/* StockTraQ Watermark Logo */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10 opacity-70 dark:opacity-50 pointer-events-none hidden sm:block">
                    <img src="/logo.svg" alt="StockTraQ Logo" className="h-[4.5rem]" />
                </div>

                {/* The SVG Chart Container (Min-width ensures it doesn't crush on mobile) */}
                <div className="relative h-[calc(100%-60px)] w-[800px] md:w-full min-h-[400px]">

                    {/* SVG Flow Line & Area Underneath */}
                    <svg className="absolute inset-0 w-full h-full min-w-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                            </linearGradient>
                            {/* SVG Filter for Outer Glow line */}
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* The filled Area (Shadow under line) */}
                        <path
                            d="M 5 95 L 15 88 L 25 80 L 35 70 L 45 65 L 55 55 L 65 40 L 75 25 L 85 15 L 95 5 L 95 100 L 5 100 Z"
                            fill="url(#chart-glow)"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* The Actual Line connecting the dots */}
                        <path
                            d="M 5 95 L 15 88 L 25 80 L 35 70 L 45 65 L 55 55 L 65 40 L 75 25 L 85 15 L 95 5"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glow)"
                            className="drop-shadow-lg"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Horizontal Grid Lines */}
                        {[20, 40, 60, 80].map(y => (
                            <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" className="text-gray-100 dark:text-dark-border opacity-50" strokeWidth="1" strokeDasharray="5,5" vectorEffect="non-scaling-stroke" />
                        ))}

                        {/* Vertical Volume Bars */}
                        {dataPoints.map((point, index) => {
                            // Calculate width and starting X to center the rect under the point
                            const barWidth = 3;
                            const startX = point.x - (barWidth / 2);

                            return (
                                <rect
                                    key={`v-${index}`}
                                    x={startX}
                                    y={point.y}
                                    width={barWidth}
                                    height={100 - point.y}
                                    fill="currentColor"
                                    className="text-gray-100 dark:text-gray-800/50 hover:text-gray-200 dark:hover:text-gray-700/50 transition-colors"
                                />
                            );
                        })}

                        {/* Solid X-Axis Line at bottom */}
                        <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" className="text-gray-200 dark:text-dark-border" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    </svg>

                    {/* Chart Plot Points (HTML Elements mapped over coordinates) */}
                    {features.map((feature, index) => {
                        const point = dataPoints[index];
                        const isSelected = selectedFeatureIndex === index;
                        const isPastSelected = selectedFeatureIndex !== null && selectedFeatureIndex > index;

                        // Decide if tooltip goes above or below based on Y position so it doesn't clip
                        const isHighPoint = point.y < 30;

                        return (
                            <div
                                key={feature.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                onClick={() => setSelectedFeatureIndex(index)}
                            >
                                {/* The Plot Dot */}
                                <div className={`w-8 h-8 rounded-full border-[5px] flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-yellow-400 bg-white scale-125 shadow-[0_0_20px_rgba(250,204,21,0.6)]' : 'border-primary-500 bg-dark-bg hover:scale-110 shadow-lg'}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-yellow-400"></div>}
                                    {!isSelected && isPastSelected && <CheckCircle className="w-4 h-4 text-primary-500" />}
                                </div>

                                {/* Persistent Hover Label / Heading */}
                                <div className={`absolute left-1/2 transform -translate-x-1/2 ${isHighPoint ? 'top-10' : 'bottom-10'} flex flex-col items-center pointer-events-none transition-all duration-300 ${isSelected ? 'opacity-0' : 'opacity-100 group-hover:-translate-y-2'}`}>
                                    <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-100 dark:border-dark-border shadow-lg whitespace-nowrap">
                                        <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">{feature.title}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{feature.releaseDate}</p>
                                    </div>
                                    <div className={`w-0 h-0 border-x-4 border-x-transparent ${isHighPoint ? 'border-b-8 border-b-gray-100 dark:border-b-dark-border -order-1 mb-1' : 'border-t-8 border-t-gray-100 dark:border-t-dark-border mt-1'}`}></div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Timeline Headers (Years & X-Axis Markers) */}
                    <div className="absolute top-[100%] left-0 w-full pt-4 pointer-events-none">
                        {/* 2025 Marker */}
                        <div className="absolute left-[5%] transform -translate-x-1/2 flex flex-col items-center">
                            <div className="w-1 h-3 bg-gray-300 dark:bg-dark-border mb-1 rounded-full"></div>
                            <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-bg px-3 py-1 rounded-full border border-gray-200 dark:border-dark-border shadow-sm">2025</span>
                        </div>

                        {/* 2026 Marker */}
                        <div className="absolute left-[15%] transform -translate-x-1/2 flex flex-col items-center">
                            <div className="w-1 h-3 bg-gray-300 dark:bg-dark-border mb-1 rounded-full"></div>
                            <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-bg px-3 py-1 rounded-full border border-gray-200 dark:border-dark-border shadow-sm">2026</span>
                        </div>

                        {/* 2027 Marker */}
                        <div className="absolute left-[55%] transform -translate-x-1/2 flex flex-col items-center">
                            <div className="w-1 h-3 bg-gray-300 dark:bg-dark-border mb-1 rounded-full"></div>
                            <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-bg px-3 py-1 rounded-full border border-gray-200 dark:border-dark-border shadow-sm">2027</span>
                        </div>

                        {/* 2028 Marker */}
                        <div className="absolute left-[95%] transform -translate-x-1/2 flex flex-col items-center">
                            <div className="w-1 h-3 bg-primary-300 dark:bg-primary-900/50 mb-1 rounded-full"></div>
                            <span className="text-sm font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800/30 shadow-sm border-dashed">2028</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Feature Detail Modal Overlay */}
                {selectedFeatureIndex !== null && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in" onClick={(e) => {
                        // Close if clicking the background blur
                        if (e.target === e.currentTarget) setSelectedFeatureIndex(null);
                    }}>
                        <div className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl overflow-hidden flex flex-col relative transform transition-all" onClick={e => e.stopPropagation()}>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedFeatureIndex(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-dark-bg text-gray-400 hover:text-red-500 transition-colors z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            {/* Banner Color */}
                            <div className={`h-2 w-full ${getColorClasses(features[selectedFeatureIndex].color).split(' ')[1].replace('text-', 'bg-')}`}></div>

                            <div className="p-8 md:p-12">
                                <div className="flex items-start justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-lg border shrink-0 ${getColorClasses(features[selectedFeatureIndex].color)}`}>
                                            {React.createElement(features[selectedFeatureIndex].icon, { className: "w-10 h-10" })}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
                                                {features[selectedFeatureIndex].title}
                                            </h2>
                                            <p className="text-sm font-black uppercase tracking-widest text-primary-600">
                                                {features[selectedFeatureIndex].subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <img src="/logo.svg" alt="StockTraQ" className="h-16 w-auto opacity-70 dark:opacity-60 hidden sm:block transition-all" />
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-medium mb-8">
                                    {features[selectedFeatureIndex].description}
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-6 border-t border-gray-100 dark:border-dark-border pt-8">
                                    <div className="flex flex-col gap-3">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Technologies & Focus</span>
                                        <div className="flex flex-wrap gap-2">
                                            {features[selectedFeatureIndex].tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-black px-3 py-1.5 rounded bg-gray-50 dark:bg-dark-bg text-gray-500 uppercase tracking-widest border border-gray-100 dark:border-dark-border">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrival</span>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
                                            <Calendar className="w-5 h-5 text-primary-600" />
                                            <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter leading-none pt-0.5">
                                                {features[selectedFeatureIndex].releaseDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Chart Navigation Controls */}
                            <div className="flex border-t border-gray-100 dark:border-dark-border divide-x divide-gray-100 dark:divide-dark-border">
                                <button
                                    onClick={handlePrev}
                                    disabled={selectedFeatureIndex === 0}
                                    className="flex-1 py-5 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 dark:text-gray-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    Previous Quarter
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={selectedFeatureIndex === features.length - 1}
                                    className="flex-1 py-5 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-primary-600 dark:text-primary-500"
                                >
                                    Next Milestone
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SaaS Evolution Announcement */}
            <div className="mt-32 p-12 bg-white dark:bg-dark-card rounded-[3rem] border-4 border-dashed border-primary-500/20 relative overflow-hidden group">
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
