import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, TrendingUp, Home, BarChart2, Activity, Search, CheckCircle, Rocket, MessageSquare, Milestone } from 'lucide-react';

export const Navbar = ({ toggleTheme, theme }) => {
    const location = useLocation();
    const navItems = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'IPO TraQ', icon: Rocket, path: '/ipo' },
        { name: 'Insight TraQ', icon: MessageSquare, path: '/insight' },
        { name: 'Roadmap', icon: Milestone, path: '/roadmap' },
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

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </nav>
    );
};
