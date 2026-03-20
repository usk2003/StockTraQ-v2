import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, X, CheckCircle2, User } from 'lucide-react';
import axios from 'axios';
import { NODE_API } from '../config';

export const WaitlistModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
            if (token) {
                const name = localStorage.getItem('userName') || '';
                const email = localStorage.getItem('userEmail') || '';
                setFormData({ name, email });
            } else {
                setFormData({ name: '', email: '' });
            }
        }
    }, [isOpen]);


    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await axios.post(`${NODE_API}/api/waitlist`, formData);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to join waitlist. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">You're on the list!</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">We will notify you on {formData.email} as soon as early access starts.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 text-primary-600">
                                <Mail className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest pt-0.5">Early Access</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Join the Waitlist</h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Lock your spot for predictive intelligence analytics tools priority queue.</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Name</label>
                                <div className="relative">
                                    <input 
                                        type="text" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required 
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-medium transition-colors"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</label>
                                <input 
                                    type="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required 
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-medium transition-colors"
                                    placeholder="you@email.com"
                                />
                            </div>

                            <button 
                                type="submit" disabled={isSubmitting}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscrive'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
