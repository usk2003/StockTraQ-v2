import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPromptModal } from '../components/LoginPromptModal';
import axios from 'axios';
import { FASTAPI_API } from '../config';
import { ModelEvaluationDashboard } from '../components/ModelEvaluationDashboard';
import { Activity, Clock, Rocket, TrendingUp, DollarSign, BarChart, CheckCircle, Info, HelpCircle, X, Search, ArrowRight, ExternalLink, AlertTriangle, BookOpen, AlertCircle, MessageSquare, Bot, Gauge, Microscope } from 'lucide-react';

const API_BASE = FASTAPI_API;

const IPOCard = ({ ipo, isClosed, onAnalyze, isOngoing, livePrice }) => {
    const name = ipo.companyName || ipo.name;
    const symbol = ipo.symbol;
    const issueSize = ipo.issueSize || ipo.size_cr || ipo.issue_size;
    const priceRange = ipo.priceBand || ipo.price_range || ipo.price;
    const openDateStr = ipo.openDate ? new Date(ipo.openDate).toLocaleDateString() : ipo.opening_date;
    const closeDateStr = ipo.closeDate ? new Date(ipo.closeDate).toLocaleDateString() : ipo.date;
    
    // For Python backend fallback
    const gain = ipo.gain || 0;
    const gainColor = gain > 0 ? '#10b981' : '#ef4444';

    // Live Price Calculations
    const currentPrice = livePrice || ipo.live_price;
    const formattedCurrentPrice = currentPrice ? Number(currentPrice).toFixed(2) : '-';
    
    const issuePriceVal = parseFloat(ipo.price || 0);
    const formattedIssuePrice = issuePriceVal > 0 ? issuePriceVal.toFixed(2) : priceRange;
    
    const listingPriceVal = parseFloat(ipo.actual_listing_price || 0);
    const formattedListingPrice = listingPriceVal > 0 ? listingPriceVal.toFixed(2) : (isOngoing ? 'TBD' : '-');

    const liveGain = currentPrice && issuePriceVal ? ((currentPrice - issuePriceVal) / issuePriceVal * 100).toFixed(2) : null;

    const details = ipo.details || {};
    const totalSub = parseFloat(details.total_sub || details.total || 0);
    const subAmount = (parseFloat(issueSize) || 0) * totalSub;

    return (
        <div 
            onClick={() => onAnalyze(ipo)}
            className="bg-white dark:bg-dark-card p-6 rounded-[2.5rem] border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:border-green-500/30 transition-all duration-500 group flex flex-col h-full relative overflow-hidden cursor-pointer"
        >
            {/* Minimal Live Indicator */}
            {currentPrice && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Live</span>
                </div>
            )}

            <div className="mb-6">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors truncate pr-12">
                        {name}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-black text-gray-400 border border-gray-100 dark:border-dark-border px-2 py-0.5 rounded-lg group-hover:border-primary-500/30 transition-colors">
                        {symbol}
                    </span>
                    {ipo.age_days > 0 && (
                        <span className="text-[10px] font-bold text-gray-400 opacity-60">• {ipo.age_days}d Age</span>
                    )}
                </div>
            </div>

            {/* Price Matrix - Final 2x2 Structure */}
            <div className="p-4 bg-gray-50/50 dark:bg-dark-bg/50 rounded-3xl mb-6 border border-gray-50 dark:border-dark-border space-y-4">
                {/* Hero Price: Live Price */}
                <div className="flex items-center gap-4 border-b border-gray-100 dark:border-dark-border/50 pb-3">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Live Market Price</span>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">₹{formattedCurrentPrice}</span>
                            {liveGain && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${Number(liveGain) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {Number(liveGain) >= 0 ? '+' : ''}{liveGain}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-5">
                    {/* Row 1: Issue Data */}
                    <div className="border-r border-gray-100 dark:border-dark-border/50 pr-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Issue Price</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white leading-none">₹{formattedIssuePrice}</span>
                    </div>
                    <div className="pl-4 text-right">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Issue Size</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white leading-none">₹{issueSize} Cr</span>
                    </div>
                    
                    {/* Row 2: Listing & Subscription with Sub-values */}
                    <div className="border-r border-gray-100 dark:border-dark-border/50 pr-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Listing Price</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white leading-none">₹{formattedListingPrice}</span>
                        {gain !== 0 && !isOngoing && (
                            <span className={`text-[10px] font-black block mt-2 ${gain > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {gain > 0 ? '+' : ''}{Number(gain).toFixed(2)}% ROI
                            </span>
                        )}
                    </div>
                    <div className="pl-4 text-right">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Total Subscribed</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white leading-none">₹{subAmount > 0 ? subAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-'} Cr</span>
                        {totalSub > 0 && (
                            <span className={`text-[10px] font-black block mt-2 uppercase tracking-tight ${totalSub >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                                {totalSub.toFixed(2)}x Multiple
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
                {Object.entries(details).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="flex flex-col items-center justify-center py-2 px-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl">
                        <span className="text-[8px] font-black text-gray-400 uppercase mb-0.5">{key}</span>
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                            {val}{typeof val === 'number' && !['pe_ratio', 'price', 'total_sub', 'total'].includes(key) ? 'x' : ''}
                        </span>
                    </div>
                ))}
            </div>

            {/* Performance Range Track */}
            {ipo.actual_52_high > 0 && (
                <div className="mb-8 px-1">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">52-Week Range</span>
                        <span className="text-[9px] font-black text-gray-900 dark:text-white">High ₹{ipo.actual_52_high}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-dark-bg rounded-full relative overflow-hidden">
                        <div 
                            className="absolute inset-y-0 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000"
                            style={{ 
                                left: '0%', 
                                width: `${Math.min(100, ((currentPrice || priceRange) / ipo.actual_52_high) * 100)}%` 
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="mt-auto grid grid-cols-2 gap-3">
                <button
                    onClick={() => onAnalyze(ipo)}
                    className="py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all transform active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
                >
                    <Activity className="w-3.5 h-3.5" /> Analyze
                </button>

                <a
                    href={ipo.drhpUrl || "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=11"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 bg-gray-50 dark:bg-dark-bg border border-transparent dark:border-dark-border text-gray-900 dark:text-gray-300 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-card transition-all"
                >
                    <ExternalLink className="w-3.5 h-3.5" /> Details
                </a>
            </div>
        </div>
    );
};

export const Listings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('v2');
    
    // V3 state (ongoing + closed)
    const [ongoing, setOngoing] = useState([]);
    const [closed, setClosed] = useState([]);
    const [bestListed, setBestListed] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [v3Filtered, setV3Filtered] = useState([]);
    const [livePrices, setLivePrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // V2 state (legacy dataset)
    const [v2Ipos, setV2Ipos] = useState([]);
    const [v2Filtered, setV2Filtered] = useState([]);
    const [v2Search, setV2Search] = useState('');
    const [v2Sort, setV2Sort] = useState('date_desc');
    const [v2Limit, setV2Limit] = useState(15);
    const [v2LivePrices, setV2LivePrices] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ongoingRes = await axios.get(`${API_BASE}/ongoing`).catch(e => ({ data: [] }));
                const closedRes = await axios.get(`${API_BASE}/closed`).catch(e => ({ data: [] }));
                
                const dataOngoing = ongoingRes.data || [];
                const dataClosed = closedRes.data || [];

                const sortedClosed = dataClosed.sort((a, b) => {
                    const dateA = a.closeDate ? Date.parse(a.closeDate) : 0;
                    const dateB = b.closeDate ? Date.parse(b.closeDate) : 0;
                    return dateB - dateA;
                });

                setOngoing(dataOngoing);
                setClosed(sortedClosed);
                setBestListed(sortedClosed.slice(6, 12));

                // Batch fetch live prices for visible cards (top 15)
                const symbolsToFetch = [
                    ...dataOngoing.map(i => i.symbol),
                    ...sortedClosed.slice(0, 15).map(i => i.symbol)
                ].filter(Boolean);

                if (symbolsToFetch.length > 0) {
                    axios.post(`${API_BASE}/api/ipos/live-prices`, { symbols: symbolsToFetch })
                        .then(res => setLivePrices(res.data))
                        .catch(err => console.error('Live price fetch failed', err));
                }
            } catch (err) {
                console.error('Fetch failed', err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // V2 live price fetch on load and Load More
    useEffect(() => {
        if (activeTab !== 'v2' || v2Filtered.length === 0) return;
        
        const symbols = v2Filtered.slice(0, v2Limit).map(i => i.symbol).filter(s => s && !v2LivePrices[s]);
        if (symbols.length > 0) {
            axios.post(`${API_BASE}/api/ipos/live-prices`, { symbols })
                .then(r => setV2LivePrices(prev => ({ ...prev, ...r.data })))
                .catch(err => console.error('V2 Live price fetch failed', err));
        }
    }, [activeTab, v2Limit, v2Filtered]);

    useEffect(() => {
        if (activeTab !== 'v2') return;
        if (v2Ipos.length > 0) return; // already loaded
        const fetchV2 = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/ipos1`);
                const data = (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setV2Ipos(data);
                setV2Filtered(data);
            } catch (err) { console.error('V2 fetch failed', err); }
        };
        fetchV2();
    }, [activeTab]);

    // V2 search/sort filter
    useEffect(() => {
        let results = [...v2Ipos];
        if (v2Search.length > 1) {
            const q = v2Search.toLowerCase();
            results = results.filter(i => (i.name && i.name.toLowerCase().includes(q)) || (i.symbol && i.symbol.toLowerCase().includes(q)));
        }
        if (v2Sort === 'date_desc') results.sort((a, b) => new Date(b.listing_date) - new Date(a.listing_date));
        else if (v2Sort === 'date_asc') results.sort((a, b) => new Date(a.listing_date) - new Date(b.listing_date));
        else if (v2Sort === 'gain_desc') results.sort((a, b) => (b.gain || 0) - (a.gain || 0));
        else if (v2Sort === 'size_desc') results.sort((a, b) => (b.issue_size || 0) - (a.issue_size || 0));
        else if (v2Sort === 'name_asc') results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setV2Filtered(results);
        setV2Limit(15);
    }, [v2Search, v2Sort, v2Ipos]);

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
        const isAuth = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        if (!isAuth) {
            setShowLoginModal(true);
            return;
        }

        const details = ipo.details || {};

        // Robust helper to skip string "0" or falsy NaN lookups in nested structures
        const getFloat = (val1, val2) => {
            const num1 = parseFloat(val1);
            if (!isNaN(num1) && num1 !== 0) return num1;
            return parseFloat(val2) || 0;
        };

        const qibVal = getFloat(details.qib, ipo.qib);
        const niiVal = getFloat(details.nii, ipo.nii);
        const retailVal = getFloat(details.retail, ipo.retail);
        const totalSubVal = getFloat(details.total_sub, qibVal + niiVal + retailVal);

        const p = {
            qib: qibVal,
            nii: niiVal,
            retail: retailVal,
            total_sub: totalSubVal,
            issue_size: getFloat(details.issue_size, getFloat(ipo.issue_size, getFloat(ipo.size_cr, ipo.issueSize))),
            pe_ratio: getFloat(details.pe_ratio, ipo.pe),
            revenue: getFloat(details.revenue, ipo.revenue),
            pat: getFloat(details.pat, ipo.pat),
            roe: getFloat(details.roe, ipo.roe),
            roce: getFloat(details.roce, ipo.roce),
            profit_margin: getFloat(details.profit_margin, (ipo.revenue && ipo.pat ? (ipo.pat / ipo.revenue) * 100 : 0)),
            revenue_growth: getFloat(details.revenue_growth, 15.0),
            company_name: ipo.companyName || ipo.name,
            symbol: ipo.symbol,
            bse_code: ipo.bse_code,
            opening_date: ipo.opening_date || (ipo.openDate ? new Date(ipo.openDate).toLocaleDateString() : ''),
            listing_date: ipo.listing_date || (ipo.closeDate ? new Date(ipo.closeDate).toLocaleDateString() : ''),
            actual_gain: ipo.gain != null ? ipo.gain : null,
            actual_listing_price: ipo.actual_listing_price || ipo.listingPrice || 0,
            issue_price: ipo.price || ipo.priceBand || 0,
            actual_52_high: ipo.actual_52_high || 0,
            live_price: livePrices[ipo.symbol]
        };
        navigate('/analysis', { state: { params: p } });
    };

    const onAnalyzeV2 = (ipo) => {
        const isAuth = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        if (!isAuth) { setShowLoginModal(true); return; }
        const details = ipo.details || {};
        const p = {
            ...ipo,
            qib: details.qib || 0, nii: details.nii || 0, retail: details.retail || 0,
            total_sub: details.total_sub || 0, pe_ratio: details.pe_ratio || 0,
            revenue: details.revenue || 0, pat: details.pat || 0, roe: details.roe || 0,
            roce: details.roce || 0, profit_margin: details.profit_margin || 0,
            revenue_growth: details.revenue_growth || 15.0,
            company_name: ipo.name, issue_price: ipo.price, issue_size: ipo.issue_size,
            actual_gain: ipo.gain != null ? ipo.gain : null,
            actual_listing_price: ipo.actual_listing_price || 0,
            actual_52_high: ipo.actual_52_high || 0,
            live_price: v2LivePrices[ipo.symbol]
        };
        navigate('/analysis', { state: { params: p } });
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center text-primary-600">
            <Activity className="w-12 h-12 animate-spin" />
        </div>
    );

    return (
        <div className="py-20 px-4 max-w-7xl mx-auto flex flex-col space-y-16 animate-fade-in relative">

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
                    {/* Audit Selection Toggle */}
                    <div className="flex bg-gray-100 dark:bg-dark-card rounded-2xl p-1 border border-gray-200 dark:border-dark-border">
                        <button
                            onClick={() => setActiveTab('v2')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'v2' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Legacy Audit V1
                        </button>
                        <button
                            onClick={() => setActiveTab('v3')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'v3' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Range Audit V2
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden bg-gray-100 dark:bg-dark-card rounded-2xl p-1 border border-gray-200 dark:border-dark-border mb-8">
                <button onClick={() => setActiveTab('v2')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'v2' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500'}`}
                >Legacy Audit V1</button>
                <button onClick={() => setActiveTab('v3')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'v3' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500'}`}
                >Range Audit V2</button>
            </div>

            {/* ═══════════ V3 TAB: Main IPO Data ═══════════ */}
            {activeTab === 'v3' && (
            <>
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
                    {ongoing.map((ipo, idx) => (
                        <IPOCard key={ipo.symbol || idx} ipo={ipo} onAnalyze={onAnalyze} isOngoing={true} livePrice={livePrices[ipo.symbol]} />
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
                    {closed.slice(0, 15).map((ipo, idx) => (
                        <IPOCard key={ipo.symbol || idx} ipo={ipo} isClosed={true} onAnalyze={onAnalyze} livePrice={livePrices[ipo.symbol]} />
                    ))}
                </div>
            </section>

            {/* Section 3: Search & Re-Analyze */}
            <section className="space-y-8">
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
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 truncate">{res.companyName || res.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                    Listed: {res.listing_date || (res.closeDate ? new Date(res.closeDate).toLocaleDateString() : 'N/A')}
                                                </p>
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
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Explore Past IPOs</h3>
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
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 truncate">{res.companyName || res.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                    Listed: {res.listing_date || (res.closeDate ? new Date(res.closeDate).toLocaleDateString() : 'N/A')}
                                                </p>
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
            </>
            )}

            {/* ═══════════ V1 TAB: Legacy Dataset ═══════════ */}
            {activeTab === 'v2' && (
            <>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                        <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Legacy Audit V1</h2>
                        <p className="text-sm text-gray-500 font-medium italic">Historical IPO records (2023-2025) • {v2Filtered.length} entries</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text" value={v2Search} onChange={(e) => setV2Search(e.target.value)}
                            placeholder="Search legacy IPOs..."
                            className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-500/10 transition-all outline-none dark:text-white font-bold text-sm"
                        />
                    </div>
                    <select value={v2Sort} onChange={(e) => setV2Sort(e.target.value)}
                        className="w-full md:w-44 px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm outline-none dark:text-white font-bold text-sm cursor-pointer appearance-none"
                    >
                        <option value="date_desc">Recent First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="gain_desc">Highest Gain</option>
                        <option value="size_desc">Largest Size</option>
                        <option value="name_asc">Alphabetical</option>
                    </select>
                </div>
            </div>

            {v2Filtered.length > 0 ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {v2Filtered.slice(0, v2Limit).map((ipo, idx) => (
                        <IPOCard key={ipo._id || idx} ipo={ipo} isClosed={true} onAnalyze={onAnalyzeV2} livePrice={v2LivePrices[ipo.symbol]} />
                    ))}
                </div>
                {v2Limit < v2Filtered.length && (
                    <div className="flex justify-center mt-12">
                        <button onClick={() => setV2Limit(prev => prev + 15)}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <Activity className="w-5 h-5" /> Load More
                        </button>
                    </div>
                )}
                </>
            ) : (
                <div className="py-20 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest">No matching IPOs found</p>
                </div>
            )}
            </>
            )}

            {/* ═══════════ FOOTER: Research & Model Evaluation ═══════════ */}
            <div className="pt-20 border-t border-gray-100 dark:border-dark-border">
                <div className="bg-gradient-to-br from-primary-900 to-purple-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Microscope className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Gauge className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tight">AI Research & Audit</h2>
                            </div>
                            <p className="text-lg font-medium opacity-80 leading-relaxed max-w-2xl">
                                To ensure maximum prediction reliability, our ensemble models undergo recurring weight optimization. 
                                View the statistical justification, algorithm performance history, and range-hit accuracy reports 
                                formatted for project review.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/research')}
                            className="px-10 py-5 bg-white text-primary-900 rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-3 whitespace-nowrap"
                        >
                            <BarChart className="w-5 h-5" />
                            View Research Metrics
                        </button>
                    </div>
                </div>
            </div>

            <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} featureName="advanced analysis" />
        </div>
    );
};
