import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Calendar, LogOut, ArrowLeft, LoaderCircle } from 'lucide-react';

export const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await axios.get('http://localhost:5000/api/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                setError('Failed to load profile. Please log in again.');
                localStorage.removeItem('userToken');
                localStorage.removeItem('userName');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        navigate('/');
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <LoaderCircle className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg space-y-4">
                <p className="text-red-600 font-bold">{error}</p>
                <button onClick={() => navigate('/login')} className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">Log In</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50 dark:bg-dark-bg flex items-center justify-center relative overflow-hidden">
            {/* Ambient Backdrops */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-2xl relative z-10 animate-scale-up">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold mb-6 focus:outline-none">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-500/20">
                        <User className="w-10 h-10 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.name}</h2>
                    <p className="text-xs text-primary-600 font-black uppercase tracking-widest mt-1">Investor Profile</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-dark-border/40">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100/50 dark:border-dark-border/10">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Email Address</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100/50 dark:border-dark-border/10">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Joined On</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-black uppercase tracking-widest rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm border border-red-100/50 dark:border-red-900/10"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};
