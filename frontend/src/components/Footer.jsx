import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Twitter, Linkedin, Github, Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 py-10 px-4 border-t border-gray-100 dark:border-dark-border">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img src="/logo.svg" alt="Stock TraQ Logo" className="h-10 w-auto" />
                            <h1 className="text-2xl font-extrabold tracking-tighter">
                                Stock <span className="text-primary-600">TraQ</span>
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light max-w-xs">
                            Empowering investors with deep machine learning insights and real-time primary market intelligence. Stop guessing, start auditing.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Twitter, link: '#' },
                                { icon: Linkedin, link: '#' },
                                { icon: Instagram, link: '#' },
                                { icon: Github, link: '#' },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.link}
                                    className="p-2.5 bg-gray-50 dark:bg-dark-card rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all transform hover:-translate-y-1"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Navigation</h3>
                        <ul className="space-y-4">
                            {[
                                { name: 'Market Home', path: '/' },
                                { name: 'IPO TraQ', path: '/ipo' },
                                { name: 'Insight TraQ', path: '/insight' },
                            ].map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group"
                                    >
                                        {item.name}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Connect</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:intelligence@stocktraq.ai" className="flex items-center gap-3 group">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 transition-colors">
                                        <Mail className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors">intelligence@stocktraq.ai</span>
                                </a>
                            </li>
                            <li>
                                <a href="tel:+9118008727" className="flex items-center gap-3 group">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 transition-colors">
                                        <Phone className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors">+91 1800-STOCK-TRAQ</span>
                                </a>
                            </li>
                            <li>
                                <div className="flex items-start gap-3 group">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-lg">
                                        <MapPin className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Financial District, Gachibowli<br />
                                        Hyderabad - 500032, IN
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / Status */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">System Status</h3>
                        <div className="p-6 bg-primary-600 rounded-[2rem] text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-primary-500/20">
                            <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Intelligence</span>
                            </div>
                            <p className="text-xl font-black mb-1">92.4% Accuracy</p>
                            <p className="text-[10px] text-primary-100 uppercase font-bold tracking-widest opacity-80">Hybrid Ensemble Active</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
                        Stock TraQ Intelligence Terminal <span className="mx-4 text-primary-600/30">|</span> v2.4.0
                    </p>
                    <div className="flex items-center gap-8">
                        <a href="#" className="text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-widest transition-colors">Privacy Policy</a>
                        <a href="#" className="text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-widest transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
