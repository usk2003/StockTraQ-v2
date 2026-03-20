import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';

export const ContactModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
            if (token) {
                const name = localStorage.getItem('userName') || '';
                const email = localStorage.getItem('userEmail') || '';
                setFormData(prev => ({ ...prev, name, email }));
            } else {
                setFormData(prev => ({ ...prev, name: '', email: '' }));
            }
        }
    }, [isOpen]);



    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Open user's default email client with pre-filled fields
        const mailtoLink = `mailto:stocktraq@gmail.com?subject=${encodeURIComponent(formData.subject || 'Inquiry')}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
        window.location.href = mailtoLink;

        // Simulate short sending delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSubmitting(false);
        setIsSuccess(true);
        
        // Reset Form
        setFormData({ name: '', email: '', subject: '', message: '' });
        // Auto Close after 2 seconds
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
        }, 2000);
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl max-w-md w-full relative animate-scale-up" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 dark:bg-dark-bg text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                </button>

                {isSuccess ? (
                    <div className="text-center py-12 space-y-4 animate-scale-up">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-green-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Message Sent!</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">We will get back to you shortly at {formData.email || 'your email'}.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 text-primary-600">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest pt-0.5">Contact Us</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Write to Us</h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">We appreciate your feedback and suggestions.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Name</label>
                                <input 
                                    type="text" name="name" value={formData.name} onChange={handleChange} required 
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-medium transition-colors"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</label>
                                <input 
                                    type="email" name="email" value={formData.email} onChange={handleChange} required 
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-medium transition-colors"
                                    placeholder="you@email.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Subject</label>
                                <input 
                                    type="text" name="subject" value={formData.subject} onChange={handleChange} 
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-medium transition-colors"
                                    placeholder="Topic/Issue"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Message</label>
                                <textarea 
                                    name="message" value={formData.message} onChange={handleChange} required rows="4"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-medium transition-colors resize-none"
                                    placeholder="Describe your inquiry..."
                                />
                            </div>

                            <button 
                                type="submit" disabled={isSubmitting}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                                {!isSubmitting && <Send className="w-4 h-4 pt-0.5" />}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
