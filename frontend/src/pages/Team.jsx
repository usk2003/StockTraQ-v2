import React, { useState } from 'react';
import { Linkedin, Github, Instagram, ArrowLeft, Shield, Rocket, MessageSquare, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContactModal } from '../components/ContactModal';

export const Team = () => {
    const navigate = useNavigate();
    const [showContactModal, setShowContactModal] = useState(false);

    const teamMembers = [
        { name: 'Urlana Suresh Kumar', role: 'Full Stack & AI Engineer', gradient: 'from-blue-500/20 to-cyan-500/20', links: { linkedin: '#', github: '#', insta: '#' } },
        { name: 'Thadakmadla Ramana', role: 'Backend & Data Engineer', gradient: 'from-purple-500/20 to-pink-500/20', links: { linkedin: '#', github: '#', insta: '#' } },
        { name: 'Damarla Sai Sampreeth', role: 'Frontend & UI Designer', gradient: 'from-amber-500/20 to-orange-500/20', links: { linkedin: '#', github: '#', insta: '#' } },
        { name: 'Kuna SaiTeja', role: 'ML Ops & Analytics Engineer', gradient: 'from-green-500/20 to-teal-500/20', links: { linkedin: '#', github: '#', insta: '#' } },
    ];

    return (
        <div className="pt-12 pb-20 px-4 max-w-7xl mx-auto animate-fade-in relative overflow-hidden">
            
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </button>

            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/30 text-primary-700 dark:text-primary-400 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">Our Team</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                    Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Brains</span> Behind StockTraQ
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                    We are a group of passionate engineers applying AI/ML to democratize financial intelligence and eliminate speculative investment risks.
                </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                {teamMembers.map((member, i) => (
                    <div key={i} className="group relative bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col">
                        <div className={`aspect-video bg-gradient-to-br ${member.gradient} flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[1px]"></div>
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-dark-bg flex items-center justify-center shadow-lg border border-gray-100 dark:border-dark-border text-2xl font-black text-gray-800 dark:text-white">
                                {member.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                            </div>
                        </div>
                        <div className="p-6 text-center flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{member.name}</h3>
                                <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mt-1">{member.role}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">VNRVJIET</p>
                            </div>
                            <div className="flex justify-center gap-3 mt-6 border-t border-gray-50 dark:border-dark-border/50 pt-4">
                                <a href={member.links.linkedin} className="p-2 bg-gray-50 dark:bg-dark-bg hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl text-gray-400 hover:text-primary-600 transition-all"><Linkedin className="w-4 h-4" /></a>
                                <a href={member.links.github} className="p-2 bg-gray-50 dark:bg-dark-bg hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl text-gray-400 hover:text-primary-600 transition-all"><Github className="w-4 h-4" /></a>
                                <a href={member.links.insta} className="p-2 bg-gray-50 dark:bg-dark-bg hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl text-gray-400 hover:text-primary-600 transition-all"><Instagram className="w-4 h-4" /></a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Our Story & Progress */}
            <div className="p-12 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-dark-border shadow-sm max-w-4xl mx-auto space-y-8 relative overflow-hidden group">
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Our Story & Vision</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        We were students investing our pocket money in the stock market. Like most beginners, due to limited financial knowledge, we followed social media tips and GMP metrics, leading to an investment loss on an IPO entry.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Realizing the knowledge gap, we adopted traditional analysis structures like breaking down 400+ page DRHP prospectuses. However, studying these manually was extremely time-consuming.
                        This drove us to use our background in <strong>CSE AI & ML</strong> to build <strong>StockTraQ</strong>—an Intelligence ecosystem designed to extract meaningful market insights securely.
                    </p>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-dark-border">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 font-bold">Our Platform Milestones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: 'Secured Framework', desc: 'Added consolidated support inboxes and privacy frames for compliant user assessment workflows.', icon: Shield },
                            { title: 'Live Rendering Optimizations', desc: 'Calculated background latency optimizations for continuous layout sub-second feeding updates.', icon: Rocket },
                            { title: 'Document Intelligence', desc: 'First-stream beta integrations unlocking AI prompts assisting analytical dashboards overviewing listings.', icon: MessageSquare },
                            { title: 'Ensemble ML Prediction', desc: 'Predictive score weightings diagnostics scoring algorithms tracking subscription demand traction.', icon: Eye }
                        ].map((m, i) => (
                            <div key={i} className="flex gap-4 items-start p-4 hover:bg-gray-50 dark:hover:bg-dark-bg/50 rounded-2xl transition-colors duration-200">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl text-primary-600 shrink-0">
                                    {React.createElement(m.icon, { className: 'w-5 h-5' })}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm mb-1">{m.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">{m.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Banner */}
            <div className="mt-20 p-8 bg-gradient-to-br from-primary-600 to-primary-500 rounded-[2.5rem] text-center max-w-4xl mx-auto space-y-4 shadow-xl shadow-primary-500/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Have a Question for the Team?</h3>
                <p className="text-primary-100 font-bold opacity-90 max-w-xl mx-auto text-xs leading-relaxed">We are open for discussions regarding AI integrations, quantitative diagnostics support, or potential security audits workflow suggestions.</p>
                <button 
                    onClick={() => setShowContactModal(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-white/20 mt-2"
                >
                    Write to Us <MessageSquare className="w-4 h-4 pt-0.5" />
                </button>
            </div>

            <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        </div>
    );
};

