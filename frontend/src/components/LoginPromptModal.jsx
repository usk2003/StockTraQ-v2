import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';

export const LoginPromptModal = ({ isOpen, onClose, featureName = "analysis" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 animate-fade-in" onClick={onClose}>
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 dark:border-dark-border shadow-2xl max-w-sm w-full space-y-6 text-center animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-center flex-col items-center">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-full mb-4">
                        <AlertCircle className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Oops! Login Required</h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    Oops, you didn't login... Please log in or sign up to get deep **{featureName}** and insights!
                </p>

                <div className="space-y-3">
                    <Link to="/login" state={{ from: window.location.pathname }} className="block w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-500/20 text-sm">
                        Login Now
                    </Link>
                    <Link to="/signup" state={{ from: window.location.pathname }} className="block w-full py-3 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-card text-gray-900 dark:text-white font-bold rounded-xl transition-colors text-sm">
                        Sign Up
                    </Link>
                </div>

                <button onClick={onClose} className="text-xs text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-200 transition-colors pt-2 block mx-auto">
                    Close
                </button>
            </div>
        </div>
    );
};
