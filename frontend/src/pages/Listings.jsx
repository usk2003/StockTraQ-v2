import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Clock, CheckCircle, Search, TrendingUp, TrendingDown, ArrowRight, ExternalLink, AlertTriangle, BookOpen, AlertCircle, MessageSquare, Bot } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const IPOCard = ({ ipo, isClosed, onAnalyze, isOngoing }) => {
    // We map MongoDB schema to UI fallback to old Python format
    const name = ipo.companyName || ipo.name;
    const symbol = ipo.symbol;
    const issueSize = ipo.issueSize || ipo.size_cr || ipo.issue_size;
    const priceRange = ipo.priceBand || ipo.price_range || ipo.price;
    const openDateStr = ipo.openDate ? new Date(ipo.openDate).toLocaleDateString() : ipo.date;
    const closeDateStr = ipo.closeDate ? new Date(ipo.closeDate).toLocaleDateString() : ipo.listing_date;
    
    // For Python backend fallback
    const gain = ipo.gain || 0;
    const gainColor = isClosed ? (gain > 0 ? '#10b981' : '#ef4444') : '#f59e0b';
    
    // Fallback details if coming from our node api
    const details = ipo.details || {
        QIB: ipo.qib,
        NII: ipo.nii,
        Retail: ipo.retail
    };

    return (
        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                        {name}
                    </h3>
                    <p className="text-[10px] font-mono font-medium text-gray-400">({symbol})</p>
                </div>
                {isClosed && (
                    <div className="text-right ml-2">
                        <div className="text-lg font-black" style={{ color: gainColor }}>
                            {gain > 0 ? '+' : ''}{gain}%
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <p className="text-[10px] text-gray-500">
                    {isClosed ? `Close Date: ${closeDateStr}` : `Opens: ${openDateStr}`}
                </p>
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    <span>Size: {issueSize}</span>
                    <span>{priceRange}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
                {Object.entries(details).slice(0, 3).map(([key, val]) => (
                    <span key={key} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        {key}: {val}{typeof val === 'number' && key !== 'pe' ? 'x' : ''}
                    </span>
                ))}
            </div>

            <div className="mt-auto space-y-2">
                <button
                    onClick={() => onAnalyze(ipo)}
                    className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all transform active:scale-95"
                >
                    {isClosed ? <TrendingUp className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                    {isClosed ? 'Re-Analyze' : 'Analyze Now'}
                </button>

                <a
                    href={ipo.drhpUrl || "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=11"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-all border-dashed"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View DRHP File
                </a>
            </div>
        </div>
    );
};

export const Listings = () => {
    const navigate = useNavigate();
    const [ongoing, setOngoing] = useState([]);
    const [closed, setClosed] = useState([]);
    const [bestListed, setBestListed] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ongoingRes, closedRes, bestRes] = await Promise.all([
                    axios.get(`${API_BASE}/ongoing`),
                    axios.get(`${API_BASE}/closed`),
                    axios.get(`${API_BASE}/best-listed`)
                ]);
                setOngoing(ongoingRes.data);
                setClosed(closedRes.data);
                setBestListed(bestRes.data);
            } catch (err) {
                console.error('Fetch failed', err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSearch = async (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q.length > 2) {
            try {
                const res = await axios.get(`${API_BASE}/search?q=${q}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error('Search failed', err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const onAnalyze = (ipo) => {
        const details = ipo.details || {};
        const p = {
            qib: parseFloat(details.qib || ipo.qib) || 0,
            nii: parseFloat(details.nii || ipo.nii) || 0,
            retail: parseFloat(details.retail || ipo.retail) || 0,
            total_sub: parseFloat(details.total_sub) || 0,
            issue_size: parseFloat(details.issue_size || ipo.issue_size || ipo.size_cr) || 0,
            pe_ratio: parseFloat(details.pe_ratio) || 0,
            revenue: parseFloat(details.revenue) || 0,
            pat: parseFloat(details.pat) || 0,
            roe: parseFloat(details.roe) || 0,
            roce: parseFloat(details.roce) || 0,
            profit_margin: parseFloat(details.profit_margin) || 0,
            revenue_growth: parseFloat(details.revenue_growth) || 15.0,
            company_name: ipo.name || ipo.companyName,
            symbol: ipo.symbol,
            bse_code: ipo.bse_code,
            opening_date: ipo.opening_date || (ipo.openDate ? new Date(ipo.openDate).toLocaleDateString() : ''),
            listing_date: ipo.listing_date || (ipo.closeDate ? new Date(ipo.closeDate).toLocaleDateString() : ''),
            actual_gain: ipo.gain || 0,
            actual_listing_price: ipo.actual_listing_price || ipo.listingPrice || 0,
            issue_price: ipo.price || ipo.priceBand || 0
        };
        navigate('/analysis', { state: { params: p } });
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center text-primary-600">
            <Activity className="w-12 h-12 animate-spin" />
        </div>
    );

    return (
        <div className="py-32 px-4 max-w-7xl mx-auto flex flex-col animate-fade-in relative">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary-600 rounded-[2rem] shadow-xl shadow-primary-500/30">
                        <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">IPO TraQ</h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-70">AI-Powered IPO Analytics</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest leading-none">Market Sentiment</p>
                        <p className="text-lg font-black text-green-500 uppercase mt-1">Bullish</p>
                    </div>
                    <div className="w-20 h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-green-500"></div>
                    </div>
                </div>
            </div>

            {/* Educational Header & Disclaimer */}
            <section className="space-y-6 bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-xl relative overflow-hidden mb-10">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <BookOpen className="w-64 h-64 text-primary-600" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/30 text-primary-700 dark:text-primary-400">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">How to Use IPO TraQ</span>
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
                            IPO Intelligency & <span className="text-primary-600 italic">Analytics</span>
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl">
                            An Initial Public Offering (IPO) is when a private company first sells shares of stock to the public.
                            Our predictive model uses deep historical data to simulate listing day performance. Click <strong>"Analyze Now"</strong> on any active or historical IPO to run a full AI audit.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                            <div className="p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" /> Subscription Data
                                </h3>
                                <p className="text-xs text-gray-500">QIB (Qualified Institutions) and NII (Non-Institutional) oversubscriptions are heavy indicators of listing momentum.</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary-500" /> Valuation (PE)
                                </h3>
                                <p className="text-xs text-gray-500">Compare the Price-to-Earnings (PE) ratio with industry peers to see if the company is priced aggressively.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer Alert */}
                <div className="relative z-10 mt-6 p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-900 dark:text-red-300 uppercase tracking-wide text-sm mb-1">Strict Disclaimer</h4>
                        <p className="text-xs text-red-700 dark:text-red-400/80 leading-relaxed font-medium">
                            StockTraQ is an experimental AI tool designed solely for educational and research purposes. We are <strong>NOT</strong> a SEBI Registered Financial Advisor.
                            Any predictions or analytics regarding listing premiums or stock momentum are generated from historical algorithms and should <strong>never</strong> be taken as financial advice. Investments in securities markets are subject to severe market risks.
                        </p>
                    </div>
                </div>
            </section>

            {/* AI Model Explanation Redirect Banner */}
            <div
                onClick={() => navigate('/ipo-model')}
                className="mb-10 p-6 bg-green-600 rounded-[2rem] shadow-xl shadow-green-500/20 cursor-pointer overflow-hidden relative group transform transition-transform hover:scale-[1.01]"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform group-hover:rotate-12 transition-transform duration-500">
                    <Activity className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Curious how our AI predicts listings?</h3>
                            <p className="text-green-100 font-medium">Explore the machine learning pipeline, algorithms, and parameters driving IPO TraQ.</p>
                        </div>
                    </div>

                    <button className="shrink-0 px-6 py-3 bg-white text-green-600 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 group-hover:bg-green-50">
                        View Model Specs <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Section 1: Ongoing */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/20">
                        <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ongoing IPOs</h2>
                        <p className="text-sm text-gray-500 font-medium italic">Active & Upcoming opportunities for 2026</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ongoing.map(ipo => (
                        <IPOCard key={ipo.symbol} ipo={ipo} isClosed={false} isOngoing={true} onAnalyze={onAnalyze} />
                    ))}
                </div>
            </section>

            {/* Section 2: Recently Closed */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/20">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Recently Closed</h2>
                        <p className="text-sm text-gray-500 font-medium italic">Track performance of the newest listings</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {closed.map(ipo => (
                        <IPOCard key={ipo.symbol} ipo={ipo} isClosed={true} onAnalyze={onAnalyze} />
                    ))}
                </div>
            </section>

            {/* Section 3: Search & Re-Analyze */}
            <section className="space-y-8 bg-gray-50/50 dark:bg-dark-card/20 -mx-4 px-4 py-20 border-y border-gray-100 dark:border-dark-border">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-visible">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-900/20">
                                <Search className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Search & Re-Analyze</h2>
                                <p className="text-sm text-gray-500 font-medium italic">Audit over 850+ historical IPOs (2023-2025)</p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search by company name..."
                                className="block w-full pl-10 pr-4 py-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {searchQuery.length > 2 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.length > 0 ? (
                                    searchResults.map((res) => (
                                        <div
                                            key={res._id}
                                            onClick={() => onAnalyze(res)}
                                            className="p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl shadow-sm cursor-pointer hover:border-primary-500 hover:shadow-xl transition-all flex justify-between items-center group"
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 truncate">{res.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Listed: {res.listing_date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-black ${res.gain > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {res.gain > 0 ? '+' : ''}{res.gain}%
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Gain</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-full text-center py-20 text-gray-400 font-medium">No results found for "{searchQuery}"</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-primary-600" />
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Past Best Listed IPOs</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bestListed.map((res) => (
                                        <div
                                            key={res._id}
                                            onClick={() => onAnalyze(res)}
                                            className="p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl shadow-sm cursor-pointer hover:border-primary-500 hover:shadow-xl transition-all flex justify-between items-center group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-2 bg-yellow-400 text-[8px] font-black text-white uppercase rounded-bl-xl tracking-tighter">Top Performer</div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 truncate">{res.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Listed: {res.listing_date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-green-500">
                                                    +{res.gain}%
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Actual Gain</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};
