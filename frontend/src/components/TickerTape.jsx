import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NODE_API } from '../config';
import { TrendingUp, TrendingDown, Circle } from 'lucide-react';

export const TickerTape = () => {
    const [items, setItems] = useState([
        { type: 'index', name: 'Nifty 50', value: 'Loading...', change: '0.00%' },
        { type: 'index', name: 'Sensex', value: 'Loading...', change: '0.00%' }
    ]);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await axios.get(`${NODE_API}/api/live-rates`);
                const data = res.data;
                const newItems = [
                    { type: 'index', name: 'Nifty 50', value: data['Nifty 50']?.value || 'N/A', change: data['Nifty 50']?.changePercent || '0%' },
                    { type: 'index', name: 'Sensex', value: data['Sensex']?.value || 'N/A', change: data['Sensex']?.changePercent || '0%' },
                    { type: 'news', text: 'Market Heat: Over 15 IPOs expected this month.' },
                    { type: 'index', name: 'Gold', value: data['Gold']?.value || 'N/A', change: data['Gold']?.changePercent || '0%' },
                    { type: 'index', name: 'Silver', value: data['Silver']?.value || 'N/A', change: data['Silver']?.changePercent || '0%' },
                    { type: 'news', text: 'Global markets react as US Fed hints at steady interest rates.' }
                ];
                setItems(newItems);
            } catch (err) {
                console.error('Failed to fetch live rates for TickerTape', err);
            }
        };
        fetchRates();
        const interval = setInterval(fetchRates, 300000); // 5 mins
        return () => clearInterval(interval);
    }, []);

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
