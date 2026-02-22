import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, CheckCircle, Search, TrendingUp, TrendingDown, ArrowRight, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const IPOCard = ({ ipo, isClosed, onAnalyze, isOngoing }) => {
    const gainColor = isClosed ? (ipo.gain > 0 ? '#10b981' : '#ef4444') : '#f59e0b';

    return (
        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                        {ipo.name}
                    </h3>
                    <p className="text-[10px] font-mono font-medium text-gray-400">({ipo.symbol})</p>
                </div>
                {isClosed && (
                    <div className="text-right ml-2">
                        <div className="text-lg font-black" style={{ color: gainColor }}>
                            {ipo.gain > 0 ? '+' : ''}{ipo.gain}%
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <p className="text-[10px] text-gray-500">
                    {isClosed ? `Listed: ${ipo.listing_date}` : `Opens: ${ipo.date}`}
                </p>
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    <span>Size: ₹{ipo.size_cr || ipo.issue_size} Cr</span>
                    <span>₹{ipo.price_range || ipo.price}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
                {Object.entries(ipo.details).slice(0, 3).map(([key, val]) => (
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

                {isOngoing && (
                    <a
                        href="https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=11"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-all border-dashed"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View DRHP File
                    </a>
                )}
            </div>
        </div>
    );
};

export const Listings = ({ setView, setParams }) => {
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
            qib: parseFloat(details.qib) || 0,
            nii: parseFloat(details.nii) || 0,
            retail: parseFloat(details.retail) || 0,
            total_sub: parseFloat(details.total) || 0,
            issue_size: parseFloat(details.issue_size || ipo.issue_size || ipo.size_cr) || 0,
            pe_ratio: parseFloat(details.pe) || 0,
            revenue: parseFloat(details.revenue) || 0,
            pat: parseFloat(details.pat) || 0,
            roe: parseFloat(details.roe) || 0,
            roce: parseFloat(details.roce) || 0,
            profit_margin: parseFloat(details.margin) || 0,
            revenue_growth: parseFloat(details.growth) || 15.0,
            company_name: ipo.name,
            actual_gain: ipo.gain
        };
        setParams(p);
        setView('analysis');
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center text-primary-600">
            <Activity className="w-12 h-12 animate-spin" />
        </div>
    );

    return (
        <div className="py-24 px-4 max-w-7xl mx-auto space-y-20 animate-fade-in relative">

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
