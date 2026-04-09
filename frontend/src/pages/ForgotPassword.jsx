import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { NODE_API } from '../config';
import { Mail, Lock, HelpCircle, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [token, setToken] = useState('');

    const [step, setStep] = useState(1); // 1: Email, 2: Question, 3: Reset
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Verify Email & Get Question
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${NODE_API}/api/user/security-question?email=${email}`);
            setSecurityQuestion(res.data.securityQuestion);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Email not found or error fetching question.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Answer & Get Reset Token
    const handleVerifyAnswer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${NODE_API}/api/forgot-password`, { email, securityAnswer });
            setToken(res.data.token);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Incorrect security answer.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${NODE_API}/api/reset-password`, { token, newPassword });
            setSuccess('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50 dark:bg-dark-bg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl relative z-10 animate-scale-up">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Reset Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {step === 1 && "Enter your email to get started"}
                        {step === 2 && "Answer your security question"}
                        {step === 3 && "Set your new password"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl flex items-start gap-3 text-green-600 dark:text-green-400 text-sm animate-fade-in">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="font-bold">{success}</span>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleVerifyEmail} className="space-y-5">
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
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-none"
                        >
                            {loading ? 'Verifying...' : 'Next'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyAnswer} className="space-y-5">
                        <div>
                            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">Security Question</label>
                            <p className="text-gray-600 dark:text-gray-300 font-medium mb-3 p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-gray-100 dark:border-dark-border flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-primary-500" /> {securityQuestion}
                            </p>
                        </div>
                        <div>
                            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">Your Answer</label>
                            <input
                                type="text"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                placeholder="Enter answer"
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors"
                        >
                            {loading ? 'Verifying...' : 'Verify Answer'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                    Remembered password?{' '}
                    <Link to="/login" className="text-primary-600 hover:underline">Log In</Link>
                </div>
            </div>
        </div>
    );
};
