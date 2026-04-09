import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPromptModal } from '../components/LoginPromptModal';
import axios from 'axios';
import { FASTAPI_API } from '../config';
import { Activity, Clock, CheckCircle, Search, TrendingUp, TrendingDown, ArrowRight, ExternalLink, AlertTriangle, BookOpen, AlertCircle, MessageSquare, Bot, Database } from 'lucide-react';

const API_BASE = `${FASTAPI_API}/api/ipos1`;

const IPOCard = ({ ipo, isClosed, onAnalyze, livePrice }) => {
    const name = ipo.name;
    const symbol = ipo.symbol;
    const issueSize = ipo.issue_size;
    const priceRange = ipo.price;
    const closeDateStr = ipo.listing_date;
    
    const gain = ipo.gain || 0;
    const gainColor = gain > 0 ? '#10b981' : '#ef4444';

    // Live Price Calculations
    const currentPrice = livePrice || ipo.live_price;
    const issuePrice = parseFloat(ipo.price || 0);
    const liveGain = currentPrice && issuePrice ? ((currentPrice - issuePrice) / issuePrice * 100).toFixed(2) : null;
    const liveGainColor = liveGain > 0 ? '#10b981' : '#ef4444';
    
    const details = ipo.details || {};

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-[2.5rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 group flex flex-col h-full relative overflow-hidden">
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

            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-bg/50 rounded-3xl mb-6 border border-gray-50 dark:border-dark-border">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price / ROI</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">₹{currentPrice || priceRange}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${liveGain ? (liveGain > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : (gain > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}`}>
                            {liveGain ? (liveGain > 0 ? '+' : '') : (gain > 0 ? '+' : '')}
                            {liveGain || gain}%
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Issue Size</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white leading-none block">₹{issueSize} Cr</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
                {Object.entries(details).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="flex flex-col items-center justify-center py-2 px-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl">
                        <span className="text-[8px] font-black text-gray-400 uppercase mb-0.5">{key}</span>
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                            {val}{typeof val === 'number' && !['pe_ratio', 'price'].includes(key) ? 'x' : ''}
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

            <div className="mt-auto space-y-2">
                <button
                    onClick={() => onAnalyze(ipo)}
                    className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all transform active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
                >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Analyze v1
                </button>
            </div>
        </div>
    );
};

export const Listings1 = () => {
    const navigate = useNavigate();
    const [allIpos, setAllIpos] = useState([]);
    const [filteredIpos, setFilteredIpos] = useState([]);
    const [displayLimit, setDisplayLimit] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [livePrices, setLivePrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Point to the root API for ongoing/closed if needed, 
                // but Listings1 is specifically for the v1 dataset (/api/ipos1)
                const res = await axios.get(API_BASE);
                const data = res.data || [];
                
                // Initial sort: Recent first
                const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                setAllIpos(sorted);
                setFilteredIpos(sorted);

                // Batch fetch live prices for top 15 visible
                const symbolsToFetch = sorted.slice(0, 15).map(i => i.symbol).filter(Boolean);
                const FASTAPI_ROOT = FASTAPI_API; // Root level for live-prices endpoint

                if (symbolsToFetch.length > 0) {
                    axios.post(`${FASTAPI_ROOT}/api/ipos/live-prices`, { symbols: symbolsToFetch })
                        .then(res => setLivePrices(res.data))
                        .catch(err => console.error('Live price v1 fetch failed', err));
                }
            } catch (err) {
                console.error('Fetch failed', err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        let results = [...allIpos];

        // Search filter
        if (searchQuery.length > 1) {
            const lowQuery = searchQuery.toLowerCase();
            results = results.filter(ipo => 
                (ipo.name && ipo.name.toLowerCase().includes(lowQuery)) || 
                (ipo.symbol && ipo.symbol.toLowerCase().includes(lowQuery))
            );
        }

        // Sorting logic
        if (sortBy === 'date_desc') {
            results.sort((a, b) => new Date(b.listing_date) - new Date(a.listing_date));
        } else if (sortBy === 'date_asc') {
            results.sort((a, b) => new Date(a.listing_date) - new Date(b.listing_date));
        } else if (sortBy === 'gain_desc') {
            results.sort((a, b) => (b.gain || 0) - (a.gain || 0));
        } else if (sortBy === 'size_desc') {
            results.sort((a, b) => (b.issue_size || 0) - (a.issue_size || 0));
        } else if (sortBy === 'name_asc') {
            results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        setFilteredIpos(results);
        setDisplayLimit(15); // Reset limit on search/sort
    }, [searchQuery, sortBy, allIpos]);

    const onAnalyze = (ipo) => {
        const isAuth = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        if (!isAuth) {
            setShowLoginModal(true);
            return;
        }

        const details = ipo.details || {};
        
        // Flatten fields for Analysis.jsx consumption
        const p = {
            ...ipo,
            qib: details.qib || 0,
            nii: details.nii || 0,
            retail: details.retail || 0,
            total_sub: details.total_sub || 0,
            pe_ratio: details.pe_ratio || 0,
            revenue: details.revenue || 0,
            pat: details.pat || 0,
            roe: details.roe || 0,
            roce: details.roce || 0,
            profit_margin: details.profit_margin || 0,
            revenue_growth: details.revenue_growth || 15.0,
            company_name: ipo.name,
            issue_price: ipo.price,
            issue_size: ipo.issue_size,
            actual_gain: ipo.gain != null ? ipo.gain : null,
            actual_listing_price: ipo.actual_listing_price || 0
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

            {/* Header & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-purple-600 rounded-[2rem] shadow-xl shadow-purple-500/30">
                        <Database className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">IPO V1</h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-70">Legacy Dataset Analysis</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search legacy IPOs..."
                            className="block w-full pl-10 pr-4 py-3.5 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-500/10 transition-all outline-none dark:text-white font-bold text-sm"
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:w-48 px-4 py-3.5 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-500/10 transition-all outline-none dark:text-white font-bold text-sm cursor-pointer appearance-none"
                    >
                        <option value="date_desc">Recent First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="gain_desc">Highest Gain</option>
                        <option value="size_desc">Largest Size</option>
                        <option value="name_asc">Alphabetical</option>
                    </select>
                </div>
            </div>

            {/* Section: All Records */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Master Dataset v1</h2>
                            <p className="text-sm text-gray-500 font-medium italic">
                                Showing {Math.min(displayLimit, filteredIpos.length)} of {filteredIpos.length} records
                            </p>
                        </div>
                    </div>
                </div>

                {filteredIpos.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredIpos.slice(0, displayLimit).map((ipo, idx) => (
                                <IPOCard key={ipo._id || idx} ipo={ipo} isClosed={true} onAnalyze={onAnalyze} livePrice={livePrices[ipo.symbol]} />
                            ))}
                        </div>
                        
                        {displayLimit < filteredIpos.length && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={() => setDisplayLimit(prev => prev + 15)}
                                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                                >
                                    <Activity className="w-5 h-5" />
                                    Load More Entries
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
            </section>

            <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} featureName="historical analysis" />
        </div>
    );
};
