import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Privacy = () => {
    return (
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex items-center gap-4 animate-slide-up">
                <Link to="/" className="p-3 bg-gray-100 dark:bg-dark-card rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors group">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-primary-600 rounded-[1.5rem] shadow-xl shadow-primary-500/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                            Privacy Policy
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            Last Updated: March 16, 2026
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-dark-card p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-600"></div>

                <div className="space-y-8 text-gray-600 dark:text-gray-300">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary-600">
                            <Lock className="w-5 h-5" />
                            <h2 className="text-lg font-black uppercase tracking-wider">1. Introduction</h2>
                        </div>
                        <p className="leading-relaxed">
                            Welcome to Stock TraQ ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary-600">
                            <Eye className="w-5 h-5" />
                            <h2 className="text-lg font-black uppercase tracking-wider">2. Information We Collect</h2>
                        </div>
                        <p className="leading-relaxed">
                            We collect information that you provide directly to us, as well as information collected automatically when you use our platform:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Data:</strong> If you register, we may collect credentials (email, password).</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, and timing of your interactions.</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, operating system, and device information.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary-600">
                            <FileText className="w-5 h-5" />
                            <h2 className="text-lg font-black uppercase tracking-wider">3. How We Use Your Information</h2>
                        </div>
                        <p className="leading-relaxed">
                            We use the collected information to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, operate, and maintain or intelligence platform.</li>
                            <li>Improve and personalize your user experience.</li>
                            <li>Analyze usage patterns and optimize performance.</li>
                            <li>Communicate with you (e.g., updates, support).</li>
                            <li>Detect and prevent fraudulent or unauthorized activity.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary-600">
                            <Shield className="w-5 h-5" />
                            <h2 className="text-lg font-black uppercase tracking-wider">4. Data Security</h2>
                        </div>
                        <p className="leading-relaxed">
                            We implement industry-standard security measures to protect your data. However, please note that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-black text-primary-600 uppercase tracking-wider">5. Updates to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-gray-100 dark:border-dark-border pt-6">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have any questions or concerns about this Privacy Policy, please contact our Data Protection Office at:
                        </p>
                        <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 rounded-2xl border border-gray-100 dark:border-dark-border">
                            <p className="font-bold text-gray-900 dark:text-white">Stock TraQ Intelligence</p>
                            <p className="text-sm">Email: stocktraq@gmail.com</p>

                            <p className="text-sm">Financial District, Gachibowli, Hyderabad</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
