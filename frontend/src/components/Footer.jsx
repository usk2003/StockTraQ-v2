import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { NODE_API } from '../config';
import { TrendingUp, Twitter, Linkedin, Github, Instagram, Mail, Phone, MapPin, ArrowUpRight, Home, Rocket, MessageSquare, BookOpen } from 'lucide-react';


export const Footer = () => {
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [latestVersion, setLatestVersion] = useState('');
    const [versionChanges, setVersionChanges] = useState([]);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [lastClick, setLastClick] = useState(0);
    const navigate = useNavigate();



    useEffect(() => {
        const fetchLatestVersion = async () => {
            try {
                const res = await axios.get(`${NODE_API}/api/version/latest`);
                setLatestVersion(res.data.version);
                setVersionChanges(res.data.changes);
            } catch (err) {
                console.error('Failed to fetch version info', err);
                setLatestVersion('2.2.1');
                setVersionChanges([
                    "Added Intelligence Blogs system with Admin controls",
                    "Added Privacy Policy & Terms of Service frameworks",
                    "Consolidated single support inbox system (stocktraq@gmail.com)",
                    "Implemented real-time layout rendering optimizations"
                ]);
            }
        };
        fetchLatestVersion();
    }, []);

    return (
        <footer className="relative bg-transparent text-gray-900 dark:text-gray-100 py-10 px-4 overflow-hidden">

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-12">
                    
                    {/* Brand Section (5 Columns) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-4">
                            <img src="/logo.svg" alt="Stock TraQ Logo" className="h-10 w-auto hover:scale-105 transition-transform" />
                            <h1 className="text-2xl font-black tracking-tighter">
                                Stock <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">TraQ</span>
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light max-w-sm">
                            Empowering investors with deep machine learning insights and real-time primary market intelligence. Stop guessing, start auditing.
                        </p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: Twitter, link: '#' },
                                { icon: Linkedin, link: '#' },
                                { icon: Instagram, link: '#' },
                                { icon: Github, link: '#' },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.link}
                                    className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all transform hover:-translate-y-1 shadow-sm border border-gray-100/50 dark:border-dark-border/10"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links (3 Columns) */}
                    <div className="lg:col-span-3 lg:border-l border-gray-100 dark:border-dark-border/10 lg:pl-8 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Navigation</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Market Home', path: '/', icon: Home },
                                { name: 'IPO TraQ', path: '/ipo', icon: Rocket },
                                { name: 'Insight TraQ', path: '/insight', icon: MessageSquare },
                                { name: 'Blogs & Insights', path: '/blogs', icon: BookOpen },
                            ].map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group font-medium"
                                    >
                                        <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                        <span>{item.name}</span>
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 translate-y-0.5 group-hover:translate-y-0 transition-all font-bold ml-auto" />
                                    </Link>
                                </li>
                            ))}

                            <li className="pt-2 mt-2">
                                <button onClick={() => setShowTeamModal(true)} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group font-bold focus:outline-none">
                                    Meet Our Team <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-primary-500" />
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info (4 Columns) */}
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Connect</h3>
                        <ul className="space-y-4">
                            <li className="flex">
                                <a href="mailto:stocktraq@gmail.com" className="flex items-center gap-3 group">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 transition-colors border border-gray-100/50 dark:border-dark-border/10">
                                        <Mail className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors font-medium">stocktraq@gmail.com</span>
                                </a>
                            </li>
                            <li className="flex">
                                <a href="tel:+9118008727" className="flex items-center gap-3 group">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 transition-colors border border-gray-100/50 dark:border-dark-border/10">
                                        <Phone className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors font-medium">+91 1800-STOCK-TRAQ</span>
                                </a>
                            </li>
                            <li className="flex">
                                <div className="flex items-start gap-3 group">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl border border-gray-100/50 dark:border-dark-border/10">
                                        <MapPin className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                        Financial District, Gachibowli<br />
                                        Hyderabad - 500032, IN
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Unified Subfooter Bottom */}
                <div className="mt-8 space-y-4 px-4 pb-8">
                    <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[10px] sm:text-xs text-gray-400 font-black uppercase tracking-widest text-center">
                        <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <Link to="/terms" className="hover:text-primary-600 transition-colors">Terms and Conditions</Link>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button onClick={() => setShowVersionModal(true)} className="hover:text-primary-600 transition-colors">
                            Release Notes - Version {latestVersion || '2.2.1'}
                        </button>
                    </div>

                    <div className="flex justify-center text-[10px] sm:text-xs text-gray-400 font-black uppercase tracking-widest">
                        <span 
                            onClick={() => {
                                const now = Date.now();
                                if (now - lastClick < 400) {
                                    const count = clickCount + 1;
                                    setClickCount(count);
                                    if (count >= 3) navigate('/admin');
                                } else {
                                    setClickCount(1);
                                }
                                setLastClick(now);
                            }}
                            className="text-gray-500 dark:text-gray-300 font-bold cursor-default select-none hover:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            StockTraQ 2026 Copyrighted
                        </span>
                    </div>
                </div>

        
            </div>

            {/* Version Changes Modal */}
            {showVersionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowVersionModal(false)}>
                    <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-2xl max-w-sm w-full space-y-5 animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Release Notes</h3>
                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Version {latestVersion || '2.2.1'} Updates</p>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {versionChanges.map((change, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                                    <span className="leading-snug">{change}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowVersionModal(false)} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-500/20">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Team Modal */}
            {showTeamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowTeamModal(false)}>
                    <div className="bg-white dark:bg-dark-bg p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600/20 to-purple-600/20 flex items-center justify-center">
                            <img src="/team_illustration.png" alt="Our Team Illustration" className="h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-90" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">About StockTraQ</h3>
                            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">The Story Behind the Vision</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                We were students investing our pocket money in the stock market. Like most beginners, due to limited financial knowledge, we followed social media tips and GMP metrics, leading to an investment loss on an IPO entry. 
                                Realizing the knowledge gap, we adopted traditional analysis structures like breaking down 400+ page DRHP prospectuses. However, studying these manually was extremely time-consuming. 
                                This drove us to use our background in <strong>CSE AI & ML</strong> to build <strong>StockTraQ</strong>—an Intelligence ecosystem designed to extract meaningful market insights securely.
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Background: B.Tech CSE (AI & ML), VNRVJIET</p>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-dark-border space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Meet Our Team</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'Urlana Suresh Kumar', links: { linkedin: '#', github: '#', insta: '#' } },
                                    { name: 'Thadakmadla Ramana', links: { linkedin: '#', github: '#', insta: '#' } },
                                    { name: 'Damarla Sai Sampreeth', links: { linkedin: '#', github: '#', insta: '#' } },
                                    { name: 'Kuna SaiTeja', links: { linkedin: '#', github: '#', insta: '#' } },
                                ].map((m, i) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{m.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">VNRVJIET</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={m.links.linkedin} className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"><Linkedin className="w-4 h-4" /></a>
                                            <a href={m.links.github} className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"><Github className="w-4 h-4" /></a>
                                            <a href={m.links.insta} className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"><Instagram className="w-4 h-4" /></a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setShowTeamModal(false)} className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-primary-500/20 text-sm">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </footer>

    );
};
