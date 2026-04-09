import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, TrendingUp, Home, BarChart2, Activity, Search, CheckCircle, Rocket, MessageSquare, Milestone, BookOpen, LayoutDashboard, Database, Plus, FileText, ExternalLink, Microscope } from 'lucide-react';


export const Navbar = ({ toggleTheme, theme }) => {
    const location = useLocation();
    const isAdmin = localStorage.getItem('adminToken');

    const navItems = isAdmin ? [
        { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard?tab=overview' },
        { name: 'Manage', icon: Database, path: '/admin/dashboard?tab=manage_content' },
        { name: 'Add IPO', icon: Plus, path: '/admin/dashboard?tab=add_ipo' },
        { name: 'Add Blog', icon: FileText, path: '/admin/dashboard?tab=add_blog' },
        { name: 'Add FAQ', icon: MessageSquare, path: '/admin/dashboard?tab=add_faq' },
        { name: 'View Site', icon: ExternalLink, path: '/' }
    ] : [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'IPO TraQ', icon: Rocket, path: '/ipo' },
        { name: 'Insight TraQ', icon: MessageSquare, path: '/insight' },
        { name: 'Blogs', icon: BookOpen, path: '/blogs' },
        { name: 'Roadmap', icon: Milestone, path: '/roadmap' }
    ];


    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-border py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 cursor-pointer">
                        <img src="/logo.svg" alt="Stock TraQ" className="h-10 w-auto" />
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
                            Stock <span className="text-primary-600">TraQ</span>
                        </h1>
                    </Link>

                    <div className="hidden md:flex items-center space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname === item.path
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform focus:outline-none"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Auth Buttons */}
                        {localStorage.getItem('adminToken') ? (
                            <Link to="/admin/dashboard" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-sm shadow-lg shadow-purple-500/20 transition-colors">
                                Admin Dashboard
                            </Link>
                        ) : localStorage.getItem('userToken') ? (
                            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/10 text-primary-600 rounded-full font-bold text-sm hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-black">
                                    {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="hidden sm:inline">Hi, {localStorage.getItem('userName')}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold text-sm transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-sm shadow-lg shadow-purple-500/20 transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </nav>
    );
};
