import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NODE_API } from '../config';
import { ContactModal } from '../components/ContactModal';


import { useNavigate } from 'react-router-dom';
import { Rocket, Target, Shield, PieChart, Users, ArrowRight, TrendingUp, TrendingDown, Globe, AlertTriangle, MessageSquare } from 'lucide-react';



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

export const Home = () => {
    const navigate = useNavigate();
    const [faqs, setFaqs] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);

    const [indices, setIndices] = useState([
        { name: 'Nifty 50', value: 'Loading...', change: '0.00', isPositive: true },
        { name: 'Sensex', value: 'Loading...', change: '0.00', isPositive: true },
        { name: 'Gold (1gm)', value: 'Loading...', change: '0.00', isPositive: true },
        { name: 'Silver (1gm)', value: 'Loading...', change: '0.00', isPositive: true }
    ]);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await axios.get(`${NODE_API}/api/live-rates`);
                const data = res.data;
                const newIndices = [
                    { name: 'Nifty 50', value: data['Nifty 50']?.value || 'N/A', change: data['Nifty 50']?.changePercent?.replace('%', '') || '0.00', isPositive: data['Nifty 50']?.isPositive ?? true },
                    { name: 'Sensex', value: data['Sensex']?.value || 'N/A', change: data['Sensex']?.changePercent?.replace('%', '') || '0.00', isPositive: data['Sensex']?.isPositive ?? true },
                    { name: 'Gold (1gm)', value: data['Gold']?.value || 'N/A', change: data['Gold']?.changePercent?.replace('%', '') || '0.00', isPositive: data['Gold']?.isPositive ?? true },
                    { name: 'Silver (1gm)', value: data['Silver']?.value || 'N/A', change: data['Silver']?.changePercent?.replace('%', '') || '0.00', isPositive: data['Silver']?.isPositive ?? true }
                ];
                setIndices(newIndices);
            } catch (err) {
                console.error('Failed to fetch live rates for Home', err);
            }
        };

        const fetchFaqs = async () => {
            try {
                const res = await axios.get(`${NODE_API}/api/faqs`);
                setFaqs(res.data || []);
            } catch (err) {
                console.error('Failed to fetch faqs for Home', err);
            }
        };

        fetchFaqs();
        fetchRates();
        const interval = setInterval(fetchRates, 300000); // 5 mins
        return () => clearInterval(interval);
    }, []);



    return (
        <div className="animate-fade-in space-y-16">
            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-bold tracking-wide uppercase">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                        </span>
                        Next-Gen Stock Intelligence
                    </div>
                    
                    <div className="flex justify-center -mt-4">
                        <button 
                            onClick={() => document.getElementById('disclaimer')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-500 cursor-pointer inline-flex items-center gap-1 font-medium underline underline-offset-2 transition-colors"
                        >
                            <AlertTriangle className="w-3 h-3 text-yellow-500" /> Read Investment Disclaimer
                        </button>
                    </div>




                    <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
                        {localStorage.getItem('userName') && (
                            <span className="text-xl md:text-3xl text-gray-500 dark:text-gray-400 block mb-3 font-bold tracking-tight uppercase animate-scale-up">
                                Welcome Back, {localStorage.getItem('userName')}
                            </span>
                        )}
                        Predict Stocks <br />
                        With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">AI Precision</span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Stop guessing. Our ensemble machine learning models analyze hundreds of data points to help you identify blockbuster listings.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                        <button
                            onClick={() => navigate('/analysis')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl shadow-primary-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            Start Analysis <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate('/ipo')}
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


                </div>
            </section>

            {/* How It Works Section */}
            <section className="px-4 py-8">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">How StockTraQ Works</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-light text-sm">Make backed investment decisions in 3 easy steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 dark:bg-dark-border -translate-y-1/2 z-0"></div>

                        {[
                            { step: '01', title: 'Explore Listings', desc: 'Browse live, upcoming, and closed IPO indices seamlessly on our dashboard.', icon: Rocket },
                            { step: '02', title: 'Check AI Rating', desc: 'Instantly view a single 1-10 predictive score based on demand physics.', icon: Target },
                            { step: '03', title: 'Invest Confidentially', desc: 'Secure objective analytic metrics eliminating market bias or speculation.', icon: Shield }
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-lg transition-transform hover:-translate-y-1 relative z-10">
                                    <div className="absolute top-4 left-4 text-4xl font-black text-gray-100 dark:text-white/10 pointer-events-none">
                                         {item.step}
                                    </div>
                                    <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl text-primary-600 relative">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{item.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Our Story System / Advantages Section */}
            <section className="px-4 py-12 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-dark-card/10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider">
                             Our Story & Vision
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            From Speculation <br />
                            To <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Calculated Science</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                            StockTraQ was ideated to solve a common investor dilemma: navigating the noisy hype surrounding Initial Public Offerings (IPOs). Traditional investing often relies on subjective Grey Market Premium (GMP) data that overlooks underlying fundamentals or subscriptions.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                            We started with a vision to build a self-contained intelligence engine that aggregates historical outcomes and subscription traction into objective metrics. **Where it’s going now?** It’s evolving into a fully decoupled microservice platform servicing sub-second live analytics safely to reduce risk profiles.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: 'Instant Market Check', desc: 'Access sub-second live demand and analytics so you never miss fast-moving listing windows.', icon: Rocket },
                            { title: 'Actionable Ratings (1-10)', desc: 'Simplified 1 to 10 numeric scores mapped from subscription traction and company health diagnostics.', icon: Target },
                            { title: 'Backtested Precision', desc: 'Aggregates years of historical listings to filter out speculation bias and hype.', icon: PieChart },
                            { title: '100% Unbiased Logic', desc: 'Purely math-driven scoring free from broker recommendations, keeping assesssment impartial.', icon: Shield }
                        ].map((adv, idx) => {
                            const Icon = adv.icon;
                            return (
                                <div key={idx} className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col items-start gap-4 hover:scale-[1.02] transition-transform duration-200">
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-2xl text-primary-600">
                                         <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm mb-1">{adv.title}</h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-400 font-light leading-relaxed">{adv.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Meet the Team Section */}
            <section className="px-4 py-8 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center space-y-4 py-4">

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider">
                         The People Behind the Platform
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                         Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Brains</span> Behind StockTraQ
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto text-sm">
                         We are a group of passionate engineers applying AI/ML to democratize financial intelligence and eliminate speculative investment risks. Discover our story and platform milestones.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => navigate('/team')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary-500/20"
                        >
                            Meet Our Team <ArrowRight className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setShowContactModal(true)}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-800 dark:text-white border border-gray-100 dark:border-dark-border font-bold rounded-xl transition-all hover:scale-105 shadow-sm flex items-center justify-center gap-1"
                        >
                            Contact Us <MessageSquare className="w-4 h-4 text-primary-600" />
                        </button>
                    </div>
                </div>
            </section>


            {/* FAQ Section */}

            <section className="px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-12">
                     <div className="text-center">
                         <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Frequently Asked Questions</h2>
                         <p className="text-gray-500 dark:text-gray-400 mt-2 font-light text-sm">Got questions? We have answers.</p>
                     </div>

                     <div className="space-y-4">
                         {(faqs.length > 0 ? faqs : [
                             { question: 'What is the AI Rating system?', answer: 'Our Rating system scores IPOs from 1 to 10 based on subscription demand from QIB/NII buyers, Grey Market Premium, and underlying company health diagnostics backtested over historical listings datasets.' },
                             { question: 'What does Grey Market Premium (GMP) signify?', answer: 'GMP is the premium investors pay to buy shares in the secondary grey market before listing. While useful, StockTraQ weights it inside composite models rather than relying on it alone to avoid speculative bias.' },
                             { question: 'How often are demand metrics updated?', answer: 'Listing data and live indices update continuously during active market support triggers throughout the day as data feeds synchronise with live tickers.' }
                         ]).map((faq, idx) => (
                             <details key={idx} className="group bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm cursor-pointer open:shadow-md transition-all">
                                 <summary className="flex justify-between items-center font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm list-none select-none">
                                     <span>{faq.question}</span>
                                     <ArrowRight className="w-4 h-4 text-primary-600 transition-transform duration-200 group-open:rotate-90" />
                                 </summary>
                                 <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                     {faq.answer}
                                 </p>
                             </details>
                         ))}
                     </div>
                </div>
            </section>

            {/* Disclaimer Section */}
            <section id="disclaimer" className="px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-700/30 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-yellow-500/5">
                        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-2xl text-yellow-600">
                             <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-tight text-sm">Legal & Risk Disclaimer</h3>
                            <p className="text-xs text-yellow-700 dark:text-yellow-600/80 font-medium leading-relaxed">
                                 All calculated percentages, predictive models, and relative metric indices mapped on StockTraQ are provided for educational assessment and review only. Access does not constitute financial advice. Investors are advised to consult registered SEBI investment advisors making accurate commit actual cash trades.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        </div>
    );
};

