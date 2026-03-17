import React from 'react';
import { FileText, ShieldAlert, BadgeCheck, Scale, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Terms = () => {
    return (
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex items-center gap-4 animate-slide-up">
                <Link to="/" className="p-3 bg-gray-100 dark:bg-dark-card rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors group">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-primary-600 rounded-[1.5rem] shadow-xl shadow-primary-500/20">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                            Terms & Conditions
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
                            <BadgeCheck className="w-5 h-5" />
                            <h2 className="text-lg font-black uppercase tracking-wider">1. Acceptance of Terms</h2>
                        </div>
                        <p className="leading-relaxed">
                            By accessing or using the Stock TraQ platform (the "Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to all of these Terms, please do not use our Service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary-600">
                            <Scale className="w-5 h-5" />
                            <h2 className="text-lg font-black uppercase tracking-wider">2. Use of Service</h2>
                        </div>
                        <p className="leading-relaxed">
                            You agree to use the Service in compliance with all applicable laws and regulations. You are responsible for maintaining the confidentiality of any credentials and for all activities that occur under your account.
                        </p>
                        <p className="leading-relaxed">
                            <strong>Prohibited Activities:</strong> You may not use the Service to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Engage in any illegal or fraudulent activities.</li>
                            <li>Attempt to gain unauthorized access to our systems.</li>
                            <li>Use automated systems (bots) to scrape data without permission.</li>
                            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary-600">
                            <ShieldAlert className="w-5 h-5" />
                            <h2 className="text-lg font-black uppercase tracking-wider">3. Intellectual Property</h2>
                        </div>
                        <p className="leading-relaxed">
                            All content, features, and functionality (including but not limited to text, displays, images, video, and audio) on this Service are owned by Stock TraQ and are protected by international copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-black text-primary-600 uppercase tracking-wider">4. Disclaimer of Warranties</h2>
                        <p className="leading-relaxed">
                            THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-black text-primary-600 uppercase tracking-wider">5. Limitation of Liability</h2>
                        <p className="leading-relaxed">
                            IN NO EVENT SHALL STOCK TRAQ BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-gray-100 dark:border-dark-border pt-6">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have any questions or concerns about these Terms, please contact our Legal Office at:
                        </p>
                        <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 rounded-2xl border border-gray-100 dark:border-dark-border">
                            <p className="font-bold text-gray-900 dark:text-white">Stock TraQ Legal</p>
                            <p className="text-sm">Email: stocktraq@gmail.com</p>

                            <p className="text-sm">Financial District, Gachibowli, Hyderabad</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
