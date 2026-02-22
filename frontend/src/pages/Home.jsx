import React from 'react';
import { Rocket, Target, Shield, PieChart, Users, ArrowRight, TrendingUp, TrendingDown, Globe, Newspaper, Info } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div className={`p-3 rounded-2xl w-fit mb-6 transition-colors duration-300 group-hover:scale-110`} style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-8 h-8" style={{ color: color }} />
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">{description}</p>
    </div>
);

const IndexCard = ({ name, value, change, isPositive }) => (
    <div className="flex flex-col p-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{name}</span>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">{value}</span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change}%
            </span>
        </div>
    </div>
);

export const Home = ({ setView }) => {
    const models = [
        { title: 'Listing Gain', desc: 'Predicts opening day returns based on subscription & GMP.', icon: Rocket, color: '#22c55e' },
        { title: 'Demand Tier', desc: 'Classifies market hype and subscription demand.', icon: Users, color: '#f59e0b' },
        { title: 'Long-Term', desc: 'Forecasts performance over a 6-12 month horizon.', icon: Target, color: '#3b82f6' },
        { title: 'PE Valuation', desc: 'Evaluates pricing efficiency relative to peers.', icon: PieChart, color: '#8b5cf6' },
        { title: 'Fundamentals', desc: 'Scores financial health (Revenue, PAT, ROE).', icon: Shield, color: '#10b981' },
    ];

    const indices = [
        { name: 'Nifty 50', value: '22,212.70', change: '0.74', isPositive: true },
        { name: 'Sensex', value: '73,158.24', change: '0.71', isPositive: true },
        { name: 'Nifty Bank', value: '47,019.70', change: '0.45', isPositive: true },
        { name: 'India VIX', value: '14.97', change: '3.21', isPositive: false },
    ];

    const news = [
        { title: 'Primary Market Heat', desc: 'Over 15 IPOs expected to hit the market in the coming month.', time: '2h ago' },
        { title: 'Fed Policy Impact', desc: 'Global markets react as US Fed hints at steady interest rates.', time: '5h ago' },
        { title: 'Retail Participation', desc: 'Retail subscription hit record highs in recent mid-cap IPOs.', time: '8h ago' },
    ];

    return (
        <div className="animate-fade-in space-y-24">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-bold tracking-wide uppercase">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                        </span>
                        Next-Gen Stock Intelligence
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
                        Predict Stocks <br />
                        With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">AI Precision</span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Stop guessing. Our ensemble machine learning models analyze hundreds of data points to help you identify blockbuster listings.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                        <button
                            onClick={() => setView('analysis')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl shadow-primary-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            Start Analysis <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('explore')}
                            className="px-10 py-5 rounded-full font-bold text-lg border-2 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card transition-all active:scale-95"
                        >
                            IPO TraQ
                        </button>
                    </div>
                </div>
            </section>

            {/* Market Snapshot Section - No borders as requested */}
            <section className="px-4">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-600 rounded-lg">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Market Snapshot</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {indices.map((idx, i) => (
                            <IndexCard key={i} {...idx} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                        {/* News */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Newspaper className="w-5 h-5 text-primary-600" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Latest Intelligence</h3>
                            </div>
                            <div className="space-y-4">
                                {news.map((item, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-snug">{item.title}</h4>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 font-light leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Tip */}
                        <div className="bg-primary-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
                            <Info className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Pro Tip: GMP vs Subscription</h3>
                            <p className="text-primary-100 font-light leading-relaxed mb-6">
                                While Grey Market Premium (GMP) is a strong indicator, our AI emphasizes **Subscription Data** (QIB & NII) as a more reliable predictor of actual listing day momentum.
                            </p>
                            <button
                                onClick={() => setView('chatbot')}
                                className="px-6 py-3 bg-white text-primary-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                            >
                                Ask Insight TraQ
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Models Section - Background and Borders removed for transparency */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Our AI Intelligence Engine</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-light max-w-xl mx-auto">Powered by a Hybrid Ensemble of Random Forest, Gradient Boosting, and Optimized Linear Regression.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {models.map((model, idx) => (
                            <FeatureCard key={idx} {...model} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-gray-100 dark:border-dark-border pt-20">
                    <div className="space-y-2">
                        <div className="text-6xl font-black text-primary-600 tracking-tighter">850+</div>
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Stocks Analyzed</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-6xl font-black text-primary-600 tracking-tighter">92%</div>
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Prediction Accuracy</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-6xl font-black text-primary-600 tracking-tighter">5</div>
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Proprietary Models</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
