import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Target, Binary, Cpu, BarChart3, TrendingUp, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FASTAPI_API } from '../config';

export const IpoModel = () => {
    const navigate = useNavigate();
    const [modelsEvaluated, setModelsEvaluated] = useState([]);
    const [loading, setLoading] = useState(true);

    // Scroll to top on load and fetch data
    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchMetrics = async () => {
            try {
                const response = await axios.get(`${FASTAPI_API}/api/model-metrics`);
                setModelsEvaluated(response.data);
            } catch (error) {
                console.error("Error fetching model metrics:", error);
                // Fallback safe data in case backend is down
                setModelsEvaluated([
                    {
                        name: "Backend Unreachable",
                        desc: "Please ensure the StockTraQ FastAPI server is running.",
                        verdict: "Error.",
                        color: "red",
                        metrics: { accuracy: "N/A", precision: "N/A", recall: "N/A", f1: "N/A" }
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const parameters = [
        { title: "Subscription Demand", desc: "QIB, NII, and Retail subscription counts. QIB heavily weights institutional interest." },
        { title: "Issue Size & Price", desc: "Total capital being raised vs target issue price." },
        { title: "Valuation Metrics", desc: "Price-to-Earnings (P/E) ratio compared to industry peers for overvaluation risk." },
        { title: "Financial Health", desc: "Revenue Growth, Profit After Tax (PAT), ROE, and ROCE metrics from the DRHP." },
        { title: "Market Sentiment", desc: "Prevailing bullish/bearish conditions at the exact time of the IPO." }
    ];

    if (loading) {
        return (
            <div className="min-h-screen py-32 flex flex-col items-center justify-center animate-fade-in relative">
                <Activity className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Fetching Model Telemetry...</p>
            </div>
        );
    }

    return (
        <div className="py-32 px-4 max-w-5xl mx-auto flex flex-col animate-fade-in relative">

            {/* Back Navigation */}
            <button
                onClick={() => navigate('/ipo')}
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors self-start"
            >
                <ArrowLeft className="w-4 h-4" /> Back to IPO TraQ
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-purple-600 rounded-[2rem] shadow-xl shadow-purple-500/30">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
                            The Algorithm
                        </h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] md:mt-2 opacity-70">Machine Learning Behind IPO TraQ</p>
                    </div>
                </div>
            </div>

            {/* Introduction */}
            <section className="bg-white dark:bg-dark-card p-8 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-xl mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
                    <Target className="w-48 h-48 text-primary-600" />
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 relative z-10 flex items-center gap-3">
                    <Binary className="w-6 h-6 text-primary-500" /> Goal & Architecture
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 font-medium leading-relaxed relative z-10">
                    <p>
                        Predicting the exact listing premium of an Initial Public Offering is notoriously difficult due to extreme market volatility and irrational exuberance.
                        The objective of IPO TraQ is not to predict a perfect 1-to-1 stock price, but rather to calculate the <strong>probability and magnitude of a positive listing gain</strong>.
                    </p>
                    <p>
                        We built a custom Machine Learning pipeline trained on historical Indian Stock Market IPOs spanning multiple years. The model digests raw financial documentation (DRHP) and real-time subscription pacing to gauge institutional momentum.
                    </p>
                </div>
            </section>

            {/* Technical Parameters */}
            <section className="mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/30 text-primary-700 dark:text-primary-400 mb-6">
                    <Cpu className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Feature Engineering</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">The Input Vectors</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parameters.map((param, idx) => (
                        <div key={idx} className="p-6 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl hover:border-primary-500/50 transition-colors">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                {param.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">{param.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Models Evaluated & The Winner */}
            <section className="mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/30 text-purple-700 dark:text-purple-400 mb-6">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Algorithm Selection</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">Models Evaluated</h2>

                <div className="space-y-4">
                    {modelsEvaluated.map((mod, idx) => (
                        <div key={idx} className={`p-6 rounded-2xl border ${mod.color === 'green'
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 shadow-md shadow-green-500/5'
                            : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border'
                            } flex flex-col gap-6`}>

                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="flex-1">
                                    <h3 className={`text-lg font-black uppercase tracking-tight mb-1 ${mod.color === 'green' ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'
                                        }`}>
                                        {mod.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">{mod.desc}</p>
                                </div>

                                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shrink-0 border ${mod.color === 'green' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                    mod.color === 'red' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                        mod.color === 'yellow' ? 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30' :
                                            'bg-gray-100 text-gray-600 border-gray-200 dark:bg-dark-bg dark:text-gray-400 dark:border-dark-border'
                                    }`}>
                                    {mod.verdict}
                                </div>
                            </div>

                            {/* Evaluation Metrics Grid */}
                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t ${mod.color === 'green' ? 'border-green-200 dark:border-green-800/30' : 'border-gray-100 dark:border-dark-border'}`}>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Accuracy</span>
                                    <span className={`text-xl font-black leading-none ${mod.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{mod.metrics.accuracy}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">F1 Score</span>
                                    <span className={`text-xl font-black leading-none ${mod.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{mod.metrics.f1}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Precision</span>
                                    <span className={`text-xl font-black leading-none ${mod.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{mod.metrics.precision}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Recall</span>
                                    <span className={`text-xl font-black leading-none ${mod.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{mod.metrics.recall}</span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </section>

            {/* Why XGBoost Won */}
            <section className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <TrendingUp className="w-64 h-64 text-green-500" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-400" /> Why XGBoost Won
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300 font-medium leading-relaxed">
                        <div>
                            <p className="mb-4">
                                The Stock Market inherently disobeys linear logic. An IPO with a massive 150x oversubscription from QIBs doesn't necessarily mean it will list exactly 150% higher than an IPO with 1x subscription.
                            </p>
                            <p>
                                Linear Regression failed entirely because it tried to draw straight lines through chaotic human sentiment. Neural Networks required too much historical data and frequently memorized the noise (overfitting), failing catastrophically on unseen SME IPOs.
                            </p>
                        </div>
                        <div>
                            <p className="mb-4 text-green-400 font-bold">
                                XGBoost (Extreme Gradient Boosting) builds an armada of Decision Trees.
                            </p>
                            <p>
                                It looks at the parameters (like PE ratio vs Subscription) and creates rules-based splits. By clustering similar historical IPO profiles together, the Ensemble approach proved significantly more resilient to extreme market outliers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Performance Footer */}
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-bg text-gray-500 text-xs font-bold rounded-lg border border-gray-200 dark:border-dark-border">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>Average Accuracy Rate (Classification of Positive Listed Gains): <strong>~82.4%</strong></span>
                </div>
            </div>

        </div>
    );
};
