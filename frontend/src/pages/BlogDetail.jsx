import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { NODE_API } from '../config';
import { Calendar, User, ArrowLeft, BookOpen } from 'lucide-react';

export const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`${NODE_API}/api/blogs/${id}`);
                setBlog(response.data);
            } catch (err) {
                setError('Failed to load the blog post.');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    return (
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto animate-fade-in space-y-12">
            {/* Header / Back Link */}
            <div className="flex items-center gap-4 animate-slide-up">
                <Link to="/blogs" className="p-3 bg-gray-100 dark:bg-dark-card rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors group">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-primary-600 rounded-[1.5rem] shadow-xl shadow-primary-500/20">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-primary-600 uppercase tracking-tight leading-none">
                            Insight Detail
                        </h1>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl text-red-600 text-center">
                    {error}
                </div>
            )}

            {blog && (
                <div className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl relative overflow-hidden">
                    {blog.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <div className="p-8 md:p-12 space-y-6">
                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-dark-border pb-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(blog.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {blog.author}
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {blog.title}
                        </h2>

                        <div className="flex gap-2 flex-wrap mb-4">
                            {blog.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/10 text-primary-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <p className="text-base text-gray-500 font-bold italic border-l-4 border-primary-500 pl-4 py-2 bg-gray-50 dark:bg-dark-bg/50 rounded-r-xl">
                            {blog.summary}
                        </p>

                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                            {blog.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
