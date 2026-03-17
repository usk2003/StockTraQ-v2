import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

export const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/blogs');
                setBlogs(response.data);
            } catch (err) {
                setError('Failed to load blogs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex items-center gap-4 animate-slide-up">
                <div className="p-4 bg-primary-600 rounded-[1.5rem] shadow-xl shadow-primary-500/20">
                    <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                        Insights & Guides
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        Stay updated with the latest market trends and IPO analysis
                    </p>
                </div>
            </div>

            {loading && (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-bold">Loading insights...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl text-red-600 text-center">
                    {error}
                </div>
            )}

            {!loading && blogs.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl font-bold">No posts available yet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                    <div key={blog._id} className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                        {blog.imageUrl && (
                            <div className="aspect-video rounded-t-[2rem] overflow-hidden">
                                <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        <div className="p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" />
                                        {blog.author}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
                                    {blog.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-6">
                                    {blog.summary}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                <div className="flex gap-2 flex-wrap">
                                    {blog.tags.slice(0, 2).map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <Link to={`/blogs/${blog._id}`} className="text-primary-600 hover:text-primary-700 font-bold text-xs flex items-center gap-1 group/btn">
                                    Read More <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
