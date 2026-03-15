import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Upload, Paperclip, X, FileText, Activity, Terminal, MessageSquare, Shield, AlertTriangle, BookOpen, Search, Code } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export const Chatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hello! I am TraQ Bot, your IPO intelligence assistant. Upload a DRHP/RHP file to get started, and I can answer any questions based on its contents.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileLoaded, setFileLoaded] = useState(false);
    const [dragging, setDragging] = useState(false);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
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
            scrollToBottom('auto');
            return;
        }
        scrollToBottom();
    }, [messages]);

    const onFileSelected = async (selectedFile) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        setFile(selectedFile);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post(`${API_BASE}/chatbot/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(prev => [...prev, { role: 'bot', content: `Success! I have analyzed **${selectedFile.name}**. You can now ask me anything about this document.` }]);
            setFileLoaded(true);
        } catch (error) {
            console.error('Upload failed', error);
            setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error while processing the document. Please ensure the backend is running and try again.' }]);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileUpload = (e) => onFileSelected(e.target.files[0]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        onFileSelected(droppedFile);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/chatbot/query`, { query: userMsg });
            setMessages(prev => [...prev, { role: 'bot', content: response.data.answer }]);
        } catch (error) {
            console.error('Query failed', error);
            setMessages(prev => [...prev, { role: 'bot', content: 'I am sorry, but I failed to retrieve an answer. Please check your connection.' }]);
        } finally {
            setLoading(false);
        }
    };

    const drhpFilings = [
        { name: 'Swiggy Limited DRHP', size: '12.4 MB', date: 'Feb 2026' },
        { name: 'Zomato Ltd RHP', size: '8.2 MB', date: 'Jan 2026' },
        { name: 'Ola Electric DRHP', size: '15.7 MB', date: 'Dec 2025' },
        { name: 'Hypnotic Tech RHP', size: '5.4 MB', date: 'Feb 2026' },
    ];

    return (
        <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary-600 rounded-[2rem] shadow-xl shadow-primary-500/30">
                        <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Insight TraQ</h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-70">RAG-Powered Document Auditor</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest leading-none">System Load</p>
                        <p className="text-lg font-black text-primary-600 uppercase mt-1">Optimal</p>
                    </div>
                    <div className="w-20 h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-primary-600"></div>
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
                            <span className="text-[10px] font-black uppercase tracking-widest">How to Use Insight TraQ</span>
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
                            Semantic RAG <span className="text-primary-600 italic">Analysis</span>
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl">
                            Insight TraQ leverages Retrieval-Augmented Generation to securely audit complex financial documents.
                            Select an existing DRHP filing or upload your own <strong>PDF</strong> document. Our AI reads the deeply embedded text to provide contextual answers.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                            <div className="p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <Search className="w-4 h-4 text-primary-500" /> Deep Extraction
                                </h3>
                                <p className="text-xs text-gray-500">Ask the bot to summarize risk factors, tabulate financials, or explain the core business model from hundreds of pages instantly.</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-purple-500" /> Contextual Logic
                                </h3>
                                <p className="text-xs text-gray-500">The AI does not access the internet; it roots every response strictly in the document you provide to prevent bias.</p>
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
                        <h4 className="font-bold text-red-900 dark:text-red-300 uppercase tracking-wide text-sm mb-1">AI Hallucination & Risk Warning</h4>
                        <p className="text-xs text-red-700 dark:text-red-400/80 leading-relaxed font-medium">
                            Insight TraQ is an experimental Language Model tool. Like all generative AI, it is prone to <strong>hallucinations</strong> and may present factually incorrect or miscalculated financial figures with high confidence.
                            Users must <strong>always</strong> independently verify raw data in the original document. We are not liable for any financial decisions made based on this tool.
                        </p>
                    </div>
                </div>
            </section>

            <div className="flex gap-6 h-[600px] lg:h-[800px]">
                {/* Left Sidebar: DRHP Filings */}
                <div className="hidden lg:flex flex-col w-96 shrink-0 space-y-8">
                    <div className="flex-1 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-dark-border shadow-2xl p-8 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">DRHP Filings</h3>
                            <FileText className="w-8 h-8 text-primary-600" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
                            {drhpFilings.map((filing, i) => (
                                <div key={i} className="p-5 bg-gray-50 dark:bg-dark-bg/50 border border-transparent hover:border-primary-500/30 rounded-[1.5rem] cursor-pointer transition-all group">
                                    <p className="text-base font-black text-gray-800 dark:text-gray-200 group-hover:text-primary-600 transition-colors uppercase tracking-tight truncate">{filing.name}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{filing.size}</span>
                                        <span className="text-[11px] font-black text-primary-600 uppercase tracking-widest">{filing.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                            className={`mt-8 p-10 border-2 border-dashed rounded-[2.5rem] transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4
                                ${dragging
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 scale-95'
                                    : 'border-gray-200 dark:border-dark-border hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-dark-bg/50'
                                }`}
                        >
                            <div className={`p-5 rounded-2xl ${dragging ? 'bg-primary-600 text-white' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'}`}>
                                <Upload className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none mb-1">Drop DRHP Here</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">or click to browse</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".pdf"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Area: Chatbot Interface */}
                <div
                    className={`flex-1 bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300
                    ${dragging ? 'ring-4 ring-primary-500/20 scale-[0.99] border-primary-500' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-primary-400"></div>

                    {/* Drag Overlay */}
                    {dragging && (
                        <div className="absolute inset-0 z-50 bg-primary-600/5 backdrop-blur-[4px] flex items-center justify-center pointer-events-none">
                            <div className="bg-white dark:bg-dark-card p-12 rounded-[4rem] shadow-2xl border-4 border-primary-500 flex flex-col items-center gap-6 animate-bounce">
                                <Upload className="w-20 h-20 text-primary-600" />
                                <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Release to Audit</p>
                            </div>
                        </div>
                    )}

                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar"
                    >
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

                    {/* Input Area */}
                    <div className="p-10 bg-gray-50/40 dark:bg-dark-bg/10 border-t border-gray-100 dark:border-dark-border">
                        <form onSubmit={handleSend} className="relative max-w-5xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Audit this document... (e.g., Explain the financial risks)"
                                disabled={loading}
                                className="w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-[2.5rem] px-10 py-6 pr-24 focus:ring-[12px] focus:ring-primary-500/10 transition-all outline-none dark:text-white font-black text-lg shadow-2xl disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-3.5 top-3.5 bottom-3.5 px-8 bg-primary-600 text-white rounded-[1.75rem] hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg transform active:scale-90"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </form>
                        <div className="flex justify-center gap-12 mt-6">
                            <p className="text-[11px] text-gray-400 uppercase tracking-[0.3em] font-black opacity-70 flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-primary-600" /> Secure RAG Pipeline
                            </p>
                            <p className="text-[11px] text-gray-400 uppercase tracking-[0.3em] font-black opacity-70 flex items-center gap-3">
                                <Shield className="w-4 h-4 text-primary-600" /> Financial Privacy Guard
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
