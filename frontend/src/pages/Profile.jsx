import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { NODE_API } from '../config';
import { User, Mail, Calendar, LogOut, ArrowLeft, LoaderCircle, Eye, EyeOff, Shield } from 'lucide-react';

export const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [riskAppetite, setRiskAppetite] = useState('Moderate');
    const [experience, setExperience] = useState('Beginner');
    const [primaryGoal, setPrimaryGoal] = useState('Listing Gains');
    const [horizon, setHorizon] = useState('Short-term');
    const [preferredSectors, setPreferredSectors] = useState([]);
    const [applicationSize, setApplicationSize] = useState('Retail (Min Lot)');
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await axios.get(`${NODE_API}/api/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
                if (res.data.investorProfile) {
                    setRiskAppetite(res.data.investorProfile.riskAppetite || 'Moderate');
                    setExperience(res.data.investorProfile.experience || 'Beginner');
                    setPrimaryGoal(res.data.investorProfile.primaryGoal || 'Listing Gains');
                    setHorizon(res.data.investorProfile.horizon || 'Short-term');
                    setPreferredSectors(res.data.investorProfile.preferredSectors || []);
                    setApplicationSize(res.data.investorProfile.applicationSize || 'Retail (Min Lot)');
                }
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.put(`${NODE_API}/api/user/investor-profile`, 
                { 
                    investorProfile: {
                        riskAppetite,
                        experience,
                        primaryGoal,
                        horizon,
                        preferredSectors,
                        applicationSize
                    }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfileSuccess('Investor profile updated successfully!');
            setTimeout(() => setIsEditingProfile(false), 2000);
            setUser({ ...user, investorProfile: res.data.investorProfile });
        } catch (err) {
            setProfileError(err.response?.data?.error || 'Failed to update profile.');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');

        if (newPassword !== confirmPassword) {
            setPassError('Passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${NODE_API}/api/change-password`, 
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPassSuccess('Password updated successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setShowChangePassword(false), 2000);
        } catch (err) {
            setPassError(err.response?.data?.error || 'Failed to update password.');
        }
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

                <div className="pt-6 border-t border-gray-100 dark:border-dark-border/40 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary-500" /> Investor Profile
                        </h3>
                        <button 
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 focus:outline-none"
                        >
                            {isEditingProfile ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>

                    {profileError && <p className="text-red-500 text-xs font-bold mb-3">{profileError}</p>}
                    {profileSuccess && <p className="text-green-500 text-xs font-bold mb-3">{profileSuccess}</p>}

                    {!isEditingProfile ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-gray-100/50 dark:border-dark-border/10">
                                <p className="text-[10px] text-gray-400 font-black uppercase">Risk Appetite</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-200">{riskAppetite}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-gray-100/50 dark:border-dark-border/10">
                                <p className="text-[10px] text-gray-400 font-black uppercase">Experience</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-200">{experience}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-gray-100/50 dark:border-dark-border/10">
                                <p className="text-[10px] text-gray-400 font-black uppercase">Primary Goal</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-200">{primaryGoal}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-gray-100/50 dark:border-dark-border/10">
                                <p className="text-[10px] text-gray-400 font-black uppercase">Horizon</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-200">{horizon}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-gray-100/50 dark:border-dark-border/10 col-span-2">
                                <p className="text-[10px] text-gray-400 font-black uppercase">Application Size</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-200">{applicationSize}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Risk Appetite</label>
                                <select value={riskAppetite} onChange={(e) => setRiskAppetite(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white">
                                    <option value="Conservative">Conservative</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Aggressive">Aggressive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Experience</label>
                                <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Primary Goal</label>
                                <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white">
                                    <option value="Listing Gains">Listing Gains</option>
                                    <option value="Long-term Growth">Long-term Growth</option>
                                    <option value="Regular Income">Regular Income</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Horizon</label>
                                <select value={horizon} onChange={(e) => setHorizon(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white">
                                    <option value="Short-term">Short-term</option>
                                    <option value="Medium-term">Medium-term</option>
                                    <option value="Long-term">Long-term</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Application Size</label>
                                <select value={applicationSize} onChange={(e) => setApplicationSize(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white">
                                    <option value="Retail (Min Lot)">Retail (Min Lot)</option>
                                    <option value="Small HNI">Small HNI</option>
                                    <option value="Big HNI">Big HNI</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Preferred Sectors</label>
                                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl">
                                    {['Tech', 'Healthcare', 'Finance', 'FMCG', 'Auto', 'Energy'].map(sector => (
                                        <label key={sector} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                            <input 
                                                type="checkbox" 
                                                checked={preferredSectors.includes(sector)} 
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setPreferredSectors([...preferredSectors, sector]);
                                                    } else {
                                                        setPreferredSectors(preferredSectors.filter(s => s !== sector));
                                                    }
                                                }}
                                                className="rounded text-primary-600 focus:ring-primary-500"
                                            />
                                            {sector}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors">Save Details</button>
                        </form>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-dark-border/40 mt-4">
                    <button
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="w-full py-2 text-sm font-bold text-primary-600 hover:text-primary-700 flex justify-center items-center gap-1 focus:outline-none"
                    >
                        {showChangePassword ? "Cancel" : "Change Password"}
                    </button>

                    {showChangePassword && (
                        <form onSubmit={handleChangePassword} className="mt-4 space-y-4 bg-gray-50 dark:bg-dark-bg/50 p-4 rounded-xl border border-gray-100 dark:border-dark-border/10 animate-fade-in">
                            {passError && <p className="text-red-500 text-xs font-bold">{passError}</p>}
                            {passSuccess && <p className="text-green-500 text-xs font-bold">{passSuccess}</p>}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Current Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="w-full pl-3 pr-10 py-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">New Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full pl-3 pr-10 py-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Confirm New Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-3 pr-10 py-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-colors">Update Password</button>
                        </form>
                    )}
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
