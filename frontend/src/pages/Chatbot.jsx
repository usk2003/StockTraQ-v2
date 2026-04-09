import React, { useState, useRef, useEffect } from 'react';
import { LoginPromptModal } from '../components/LoginPromptModal';
import axios from 'axios';
import { FASTAPI_API } from '../config';
import { Send, User, Bot, FileText, MessageSquare, Shield, AlertTriangle, BookOpen, Search, Code, LayoutDashboard, TrendingUp, DollarSign, Target, Activity } from 'lucide-react';

const API_BASE = `${FASTAPI_API}`;

export const Chatbot = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Select a processed IPO Document from the left to view its structured analysis or ask me specific questions based on its DRHP content.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // InsightTraQ State
    const [documents, setDocuments] = useState([]);
    const [activeDocument, setActiveDocument] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'chat'
    const [insightData, setInsightData] = useState(null);

    const chatContainerRef = useRef(null);
    const isInitialMount = useRef(true);

    const scrollToBottom = (behavior = 'smooth') => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: behavior
            });
        }
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchDocuments();
            return;
        }
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, activeTab]);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API_BASE}/insight/documents`);
            setDocuments(res.data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        }
    };

    const handleSelectDocument = async (docId) => {
        const doc = documents.find(d => d.doc_id === docId);
        setActiveDocument(doc);
        setMessages([
            { role: 'bot', content: `You have selected **${doc.filename}**. What would you like to know about it?` }
        ]);
        
        // Fetch detailed JSON
        setInsightData(null);
        try {
            const res = await axios.get(`${API_BASE}/insight/documents/${docId}`);
            setInsightData(res.data.extracted_data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const isAuth = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        if (!isAuth) {
            setShowLoginModal(true);
            return;
        }

        if (!input.trim() || loading || !activeDocument) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/insight/chat`, { 
                doc_id: activeDocument.doc_id,
                query: userMsg 
            });
            setMessages(prev => [...prev, { role: 'bot', content: response.data.answer }]);
        } catch (error) {
            console.error('Query failed', error);
            setMessages(prev => [...prev, { role: 'bot', content: 'I am sorry, but I failed to retrieve an answer. Please check your connection or wait for Vector generation.' }]);
        } finally {
            setLoading(false);
        }
    };

    const renderChat = () => (
        <div className="flex-1 flex flex-col h-[600px] lg:h-[700px] bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-primary-400"></div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar" ref={chatContainerRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        <div className={`flex gap-6 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-xl ${msg.role === 'user' ? 'bg-primary-600' : 'bg-gray-100 dark:bg-dark-bg'}`}>
                                {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-primary-600" />}
                            </div>
                            <div className={`p-6 rounded-[2rem] text-base leading-relaxed shadow-md ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-gray-50 dark:bg-dark-bg/50 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-dark-border rounded-tl-none font-medium'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-dark-bg flex items-center justify-center shadow-lg">
                                <Bot className="w-5 h-5 text-primary-600 animate-pulse" />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-primary-600/40 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary-600/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-primary-600/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8 bg-gray-50/40 dark:bg-dark-bg/10 border-t border-gray-100 dark:border-dark-border">
                <form onSubmit={handleSend} className="relative max-w-5xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={activeDocument ? `Audit ${activeDocument.filename}...` : "Select a document first..."}
                        disabled={loading || !activeDocument}
                        className="w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-[2.5rem] px-10 py-6 pr-24 focus:ring-[12px] focus:ring-primary-500/10 transition-all outline-none dark:text-white font-black text-lg shadow-2xl disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading || !activeDocument}
                        className="absolute right-3.5 top-3.5 bottom-3.5 px-8 bg-primary-600 text-white rounded-[1.75rem] hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg transform active:scale-90"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );

    const renderDashboard = () => {
        if (!activeDocument) {
            return (
                <div className="flex-1 h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl">
                    <FileText className="w-20 h-20 text-gray-200 dark:text-gray-700 mb-6" />
                    <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">No Document Selected</h2>
                    <p className="text-gray-500 mt-4 max-w-sm">Please select a processed DRHP from the left panel to explore its structured financial extraction.</p>
                </div>
            );
        }

        if (!insightData) {
             return (
                 <div className="flex-1 h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl">
                     <Activity className="w-12 h-12 text-primary-500 animate-pulse mb-6" />
                     <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Loading Deep Insights...</h2>
                 </div>
             );
        }

        const stats = [
            { label: 'Issue Size', value: insightData.ipo_details?.issue_size || 'N/A', icon: <DollarSign className="text-green-500" /> },
            { label: 'PAT Margin', value: insightData.financials?.pat_margin || 'N/A', icon: <TrendingUp className="text-blue-500" /> },
            { label: 'Pre-P/E', value: insightData.valuation_metrics?.pre_pe || 'N/A', icon: <Target className="text-purple-500" /> }
        ];

        return (
            <div className="flex-1 h-[600px] lg:h-[700px] overflow-y-auto bg-gray-50 dark:bg-dark-bg rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl p-8 custom-scrollbar space-y-8 animate-fade-in">
                {/* Header Profile */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                     <div>
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                              {insightData.company_info?.sector}
                          </span>
                          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                              {insightData.company_info?.company_name}
                          </h2>
                          <p className="text-sm font-bold text-gray-500 mt-1">{insightData.company_info?.business_model}</p>
                     </div>
                     <div className="flex gap-4">
                          {stats.map((s, i) => (
                              <div key={i} className="text-right p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-dark-border">
                                   <div className="flex justify-end mb-1">{s.icon}</div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                                   <p className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[120px]">{s.value}</p>
                              </div>
                          ))}
                     </div>
                </div>

                {/* Red Flags / Intelligence Alert */}
                {insightData.issue_analysis?.red_flags && insightData.issue_analysis.red_flags.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/50 p-6 rounded-3xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-black text-red-900 dark:text-red-400 uppercase tracking-tight">AI Detected Red Flags</h3>
                        </div>
                        <ul className="space-y-3 relative z-10">
                            {insightData.issue_analysis.red_flags.map((rf, i) => (
                                <li key={i} className="flex gap-3 text-red-800 dark:text-red-300 text-sm font-medium">
                                    <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                    {rf}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Data Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Financials Drop */}
                     <div className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
                          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-dark-border pb-4 mb-6">Financial Extracts</h3>
                          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                              {Object.entries(insightData.financials || {}).map(([key, val]) => (
                                  <div key={key}>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{key.replace('_', ' ')}</p>
                                      <p className="text-sm font-black text-gray-900 dark:text-white capitalize truncate">{val}</p>
                                  </div>
                              ))}
                          </div>
                     </div>

                     <div className="space-y-8">
                         {/* IPO Metrics */}
                         <div className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
                              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-dark-border pb-4 mb-6">IPO Structure</h3>
                              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                  {Object.entries(insightData.ipo_details || {}).map(([key, val]) => (
                                      <div key={key}>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{key.replace('_', ' ')}</p>
                                          <p className="text-sm font-black text-gray-900 dark:text-white capitalize truncate">{val}</p>
                                      </div>
                                  ))}
                              </div>
                         </div>
                         
                         {/* Qualitative summary */}
                         <div className="bg-gradient-to-br from-primary-900 to-black p-8 rounded-3xl border border-primary-800 shadow-sm text-white relative overflow-hidden">
                             <h3 className="text-sm font-black text-primary-400 uppercase tracking-widest border-b border-primary-800 pb-4 mb-6">Qualitative Summary</h3>
                             <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Industry Outlook</p>
                             <p className="text-sm font-medium text-white mb-6 leading-relaxed opacity-90">{insightData.qualitative_insights?.industry_outlook}</p>
                             
                             <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Competitive Stance</p>
                             <p className="text-sm font-medium text-white leading-relaxed opacity-90">{insightData.qualitative_insights?.competitive_position}</p>
                         </div>
                     </div>
                </div>
            </div>
        );
    };

    return (
        <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary-600 rounded-[2rem] shadow-xl shadow-primary-500/30">
                        <Activity className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Insight TraQ</h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-70">AI Document Intelligence Dashboard</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar: DRHP Filings */}
                <div className="w-full lg:w-96 shrink-0 flex flex-col space-y-6">
                    <div className="flex-1 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-dark-border shadow-2xl p-8 flex flex-col overflow-hidden max-h-[700px]">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-dark-border pb-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Processed Filings</h3>
                            <Database className="w-5 h-5 text-primary-600" />
                        </div>

                        {documents.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500 font-medium">No documents processed yet. Admins must upload DRHPs via the Admin Dashboard.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {documents.map((doc, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => handleSelectDocument(doc.doc_id)}
                                        className={`p-5 border rounded-[1.5rem] cursor-pointer transition-all group ${activeDocument?.doc_id === doc.doc_id ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500' : 'bg-gray-50 dark:bg-dark-bg/50 border-transparent hover:border-primary-300'}`}
                                    >
                                        <p className={`text-sm font-black uppercase tracking-tight truncate ${activeDocument?.doc_id === doc.doc_id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200 group-hover:text-primary-600'}`}>
                                            {doc.filename.replace('.pdf', '')}
                                        </p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Shield className="w-3 h-3" /> Encoded
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area */}
                <div className="flex-1 flex flex-col gap-6">
                     {/* Tab Toggles */}
                     {(activeDocument || activeTab === 'dashboard') && (
                         <div className="flex bg-gray-100 dark:bg-dark-card p-2 rounded-full w-max shadow-inner border border-gray-200 dark:border-dark-border">
                              <button 
                                  onClick={() => setActiveTab('dashboard')}
                                  className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-dark-bg text-primary-600 shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                              >
                                   <LayoutDashboard className="w-4 h-4 inline-block mr-2 -mt-1" />
                                   Structured Data
                              </button>
                              <button 
                                  onClick={() => setActiveTab('chat')}
                                  className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-dark-bg text-primary-600 shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                              >
                                   <MessageSquare className="w-4 h-4 inline-block mr-2 -mt-1" />
                                   RAG Chat Interface
                              </button>
                         </div>
                     )}

                     {activeTab === 'dashboard' ? renderDashboard() : renderChat()}
                </div>
            </div>
            <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} featureName="Insight TraQ" />
        </div>
    );
};

// Simple Database icon polyfill since we removed it from import
const Database = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
);
