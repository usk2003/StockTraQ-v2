import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/login', { email, password });
            localStorage.setItem('userToken', res.data.token);
            localStorage.setItem('userName', res.data.user.name);
            navigate('/');
            window.location.reload(); // Force navbar refresh
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50 dark:bg-dark-bg flex items-center justify-center relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-2xl relative z-10 animate-scale-up">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Log in to monitor your Predictive Intelligence</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>

                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-primary-500/20 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Logging in...' : <><LogIn className="w-4 h-4" /> Sign In</>}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary-600 hover:underline">Create Account</Link>
                </div>
            </div>
        </div>
    );
};
