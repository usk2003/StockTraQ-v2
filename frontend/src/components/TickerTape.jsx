import React from 'react';
import { TrendingUp, TrendingDown, Circle } from 'lucide-react';

export const TickerTape = () => {
    // Sample data combining market indices and breaking news
    const items = [
        { type: 'index', name: 'Nifty 50', value: '22,212.70', change: '+0.74%' },
        { type: 'index', name: 'Sensex', value: '73,158.24', change: '+0.71%' },
        { type: 'news', text: 'Market Heat: Over 15 IPOs expected this month.' },
        { type: 'index', name: 'Nifty Bank', value: '47,019.70', change: '+0.45%' },
        { type: 'index', name: 'India VIX', value: '14.97', change: '-3.21%' },
        { type: 'news', text: 'Global markets react as US Fed hints at steady interest rates.' },
        { type: 'index', name: 'Nasdaq', value: '16,041.62', change: '+1.14%' },
        { type: 'news', text: 'Retail subscription hits record highs in recent mid-cap IPOs.' },
        { type: 'index', name: 'S&P 500', value: '5,088.80', change: '+0.80%' },
        { type: 'news', text: 'SEBI outlines new T+0 settlement guidelines.' },
    ];

    const renderItem = (item, idx) => {
        if (item.type === 'index') {
            const isPositive = item.change.startsWith('+');
            return (
                <div key={idx} className="flex items-center gap-2 px-6 whitespace-nowrap">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{item.name}</span>
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{item.value}</span>
                    <span className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {item.change}
                    </span>
                    <Circle className="w-1.5 h-1.5 text-gray-300 dark:text-dark-border ml-6" />
                </div>
            );
        } else {
            return (
                <div key={idx} className="flex items-center gap-2 px-6 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-[10px] font-black uppercase tracking-widest">News</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
                    <Circle className="w-1.5 h-1.5 text-gray-300 dark:text-dark-border ml-6" />
                </div>
            );
        }
    };

    return (
        <div className="w-full bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border overflow-hidden flex items-center h-10 select-none hidden md:flex">
            <div className="flex animate-ticker hover:[animation-play-state:paused] min-w-max">
                {/* 
                  Double the items to create a seamless infinite scroll effect.
                  The animation moves 50% of the total width, so by the time it reaches the end,
                  it visually matches the start and repeats seamlessly.
                */}
                {[...items, ...items].map((item, idx) => renderItem(item, idx))}
            </div>
        </div>
    );
};
