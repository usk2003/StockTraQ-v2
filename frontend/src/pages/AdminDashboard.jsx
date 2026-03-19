import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { NODE_API } from '../config';
import { LayoutDashboard, LogOut, CheckCircle, AlertTriangle, Plus, FileText, BarChart3, Users, ChevronRight, Trash2, Database, MessageSquare, Pencil, Search } from 'lucide-react';


export const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    const [activeTab, setActiveTab] = useState(tabParam || 'overview');
    const [greeting, setGreeting] = useState('Hi Admin');

    const [ipoData, setIpoData] = useState({
        companyName: '',
        symbol: '',
        issueSize: '',
        priceBand: '',
        openDate: '',
        closeDate: '',
        gmp: '',
        qib: '',
        nii: '',
        retail: '',
        drhpUrl: '',
        listingPrice: '',
        pe: '',
        revenue: '',
        pat: '',
        roe: '',
        roce: ''
    });

    const [blogData, setBlogData] = useState({
        title: '',
        content: '',
        author: '',
        summary: '',
        imageUrl: '',
        tags: ''
    });

    const [versionData, setVersionData] = useState({
        version: '',
        changes: ''
    });

    const [allIpos, setAllIpos] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [faqData, setFaqData] = useState({ question: '', answer: '' });
    const [allFaqs, setAllFaqs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');





    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
        }

        const hour = new Date().getHours();
        const adminName = localStorage.getItem('adminName') || 'Admin';
        if (hour < 12) setGreeting(`Good Morning, ${adminName}`);
        else if (hour < 18) setGreeting(`Good Afternoon, ${adminName}`);
        else setGreeting(`Good Evening, ${adminName}`);

    }, [navigate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tabParam = queryParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        navigate('/admin');
    };

    const handleChange = (e) => {
        setIpoData({ ...ipoData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
            const token = localStorage.getItem('adminToken');
            if (editingId) {
                await axios.put(`${NODE_API}/admin/ipo/${editingId}`, ipoData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMsg('IPO updated successfully!');
                setEditingId(null);
            } else {
                await axios.post(`${NODE_API}/admin/add-ipo`, ipoData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMsg('IPO successfully added to database!');
            }
            setIpoData({
                companyName: '',
                symbol: '',
                issueSize: '',
                priceBand: '',
                openDate: '',
                closeDate: '',
                gmp: '',
                qib: '',
                nii: '',
                retail: '',
                drhpUrl: '',
                listingPrice: '',
                pe: '',
                revenue: '',
                pat: '',
                roe: '',
                roce: ''
            });
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to add IPO. Check fields and try again.');
        } finally {
            setLoading(false);
            window.scrollTo(0, 0);
        }
    };

    const handleBlogSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
            const token = localStorage.getItem('adminToken');
            const formattedData = {
                ...blogData,
                tags: typeof blogData.tags === 'string' ? blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : blogData.tags
            };
            
            if (editingId) {
                await axios.put(`${NODE_API}/admin/blog/${editingId}`, formattedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMsg('Blog updated successfully!');
                setEditingId(null);
            } else {
                await axios.post(`${NODE_API}/admin/add-blog`, formattedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMsg('Blog successfully added to database!');
            }
            setBlogData({ title: '', content: '', author: '', summary: '', imageUrl: '', tags: '' });
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to add Blog. Check fields and try again.');
        } finally {
            setLoading(false);
            window.scrollTo(0, 0);
        }
    };

    const handleVersionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
            const token = localStorage.getItem('adminToken');
            const formattedData = {
                version: versionData.version,
                changes: versionData.changes.split('\n').map(c => c.trim()).filter(c => c !== '')
            };
            
            await axios.post(`${NODE_API}/admin/add-version`, formattedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg('Version notes updated successfully!');
            setVersionData({ version: '', changes: '' });
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to update Version. Check fields.');
        } finally {
            setLoading(false);
            window.scrollTo(0, 0);
        }
    };

    const handleFaqSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
            const token = localStorage.getItem('adminToken');
            if (editingId) {
                await axios.put(`${NODE_API}/admin/faq/${editingId}`, faqData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMsg('FAQ updated successfully!');
                setEditingId(null);
            } else {
                await axios.post(`${NODE_API}/admin/add-faq`, faqData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMsg('FAQ added successfully!');
            }
            setFaqData({ question: '', answer: '' });
            fetchContent(); 
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to add FAQ.');
        } finally {
            setLoading(false);
            window.scrollTo(0, 0);
        }
    };

    const handleDeleteFaq = async (id) => {
        if (!window.confirm('Delete this FAQ?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${NODE_API}/admin/faq/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllFaqs(allFaqs.filter(faq => faq._id !== id));
            setSuccessMsg('FAQ deleted!');
        } catch (err) {
            console.error(err);
        }
    };


    const fetchContent = async () => {
        try {
            const ongoingRes = await axios.get(`${NODE_API}/api/ipos/ongoing`).catch(e => ({ data: [] }));
            const closedRes = await axios.get(`${NODE_API}/api/ipos/closed`).catch(e => ({ data: [] }));
            const blogsRes = await axios.get(`${NODE_API}/api/blogs`).catch(e => ({ data: [] }));
            const faqsRes = await axios.get(`${NODE_API}/api/faqs`).catch(e => ({ data: [] }));

            setAllIpos([...(ongoingRes.data || []), ...(closedRes.data || [])]);
            setAllBlogs(blogsRes.data || []);
            setAllFaqs(faqsRes.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'manage_content' || activeTab === 'overview') {
            fetchContent();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${NODE_API}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'live_traffic' || activeTab === 'overview') {
            fetchUsers();
        }
    }, [activeTab]);


    const handleDeleteIpo = async (id) => {
         if (!window.confirm('Are you sure you want to delete this IPO?')) return;
         try {
             const token = localStorage.getItem('adminToken');
             await axios.delete(`${NODE_API}/admin/ipo/${id}`, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             setSuccessMsg('IPO deleted successfully!');
             fetchContent();
         } catch (err) {
             setErrorMsg(err.response?.data?.error || err.message || 'Failed to delete IPO.');
             console.error(err);
         }

    };

    const handleDeleteBlog = async (id) => {
         if (!window.confirm('Are you sure you want to delete this Blog?')) return;
         try {
             const token = localStorage.getItem('adminToken');
             await axios.delete(`${NODE_API}/admin/blog/${id}`, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             setSuccessMsg('Blog deleted successfully!');
             fetchContent();
         } catch (err) {
             setErrorMsg(err.response?.data?.error || err.message || 'Failed to delete Blog.');
             console.error(err);
         }

    };

    const renderAddIpoForm = () => (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl relative overflow-hidden animate-fade-in">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 border-b border-gray-100 dark:border-dark-border pb-4 flex items-center gap-2">
                {editingId ? <Pencil className="w-5 h-5 text-yellow-500" /> : <Plus className="w-5 h-5 text-primary-500" />} {editingId ? 'Edit IPO Entry' : 'Create New IPO Entry'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {[
                    { label: 'Company Name', name: 'companyName', type: 'text', placeholder: 'e.g. Acme Corp Ltd.' },
                    { label: 'Symbol / ID', name: 'symbol', type: 'text', placeholder: 'e.g. ACMEC' },
                    { label: 'Issue Size', name: 'issueSize', type: 'text', placeholder: 'e.g. ₹ 1,500.00 Cr' },
                    { label: 'Price Band', name: 'priceBand', type: 'text', placeholder: 'e.g. ₹ 90 - ₹ 100' },
                    { label: 'Open Date', name: 'openDate', type: 'date' },
                    { label: 'Close Date', name: 'closeDate', type: 'date' },
                    { label: 'GMP (₹)', name: 'gmp', type: 'number', step: '0.01', placeholder: 'e.g. 25' },
                    { label: 'QIB Subscription (x)', name: 'qib', type: 'number', step: '0.01', placeholder: 'e.g. 15.5' },
                    { label: 'NII Subscription (x)', name: 'nii', type: 'number', step: '0.01', placeholder: 'e.g. 5.2' },
                    { label: 'Retail Subscription (x)', name: 'retail', type: 'number', step: '0.01', placeholder: 'e.g. 2.1' },
                    { label: 'Listing Price (₹)', name: 'listingPrice', type: 'number', step: '0.01', placeholder: 'e.g. 120 (Fill if Closed)' },
                    { label: 'Price to Earnings (P/E)', name: 'pe', type: 'number', step: '0.01', placeholder: 'e.g. 25.4' },
                    { label: 'Revenue (₹ Cr)', name: 'revenue', type: 'number', step: '0.01', placeholder: 'e.g. 500' },
                    { label: 'PAT (Profit After Tax) (₹ Cr)', name: 'pat', type: 'number', step: '0.01', placeholder: 'e.g. 45' },
                    { label: 'ROE (%)', name: 'roe', type: 'number', step: '0.01', placeholder: 'e.g. 15.2' },
                    { label: 'ROCE (%)', name: 'roce', type: 'number', step: '0.01', placeholder: 'e.g. 18.5' },
                    { label: 'DRHP Link URL', name: 'drhpUrl', type: 'url', placeholder: 'https://sebi.gov.in/...' }
                ].map((field, idx) => (
                    <div key={idx} className={field.name === 'drhpUrl' ? 'md:col-span-2' : ''}>
                        <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            name={field.name}
                            value={ipoData[field.name]}
                            onChange={handleChange}
                            step={field.step}
                            placeholder={field.placeholder}
                            required={!['listingPrice', 'pe', 'revenue', 'pat', 'roe', 'roce'].includes(field.name)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                        />
                    </div>
                ))}
                
                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-primary-500/30 flex justify-center items-center"
                    >
                        {loading ? 'Processing...' : editingId ? 'Update IPO Details' : 'Add IPO to Database'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderAddBlogForm = () => (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl relative overflow-hidden animate-fade-in">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 border-b border-gray-100 dark:border-dark-border pb-4 flex items-center gap-2">
                {editingId ? <Pencil className="w-5 h-5 text-yellow-500" /> : <FileText className="w-5 h-5 text-primary-500" />} {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>

            <form onSubmit={handleBlogSubmit} className="grid grid-cols-1 gap-6 relative z-10">
                {[
                    { label: 'Title', name: 'title', type: 'text', placeholder: 'e.g. Getting Started with IPOs' },
                    { label: 'Author', name: 'author', type: 'text', placeholder: 'e.g. Admin / Name' },
                    { label: 'Summary', name: 'summary', type: 'text', placeholder: 'Short preview text for the list view' },
                    { label: 'Image URL', name: 'imageUrl', type: 'url', placeholder: 'https://...' },
                    { label: 'Tags', name: 'tags', type: 'text', placeholder: 'e.g. IPO, Investing, Guide (Comma separated)' }
                ].map((field, idx) => (
                    <div key={idx}>
                        <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            name={field.name}
                            value={blogData[field.name]}
                            onChange={(e) => setBlogData({ ...blogData, [e.target.name]: e.target.value })}
                            placeholder={field.placeholder}
                            required={field.name !== 'imageUrl'}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                        />
                    </div>
                ))}
                
                <div>
                    <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">
                        Content (Supports Markdown)
                    </label>
                    <textarea
                        name="content"
                        value={blogData.content}
                        onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                        placeholder="Write your blog content here..."
                        required
                        rows="10"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                    />
                </div>
                
                <div className="mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-primary-500/30 flex justify-center items-center"
                    >
                        {loading ? 'Processing...' : 'Add Blog to Database'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderAddVersionForm = () => (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl relative overflow-hidden animate-fade-in">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 border-b border-gray-100 dark:border-dark-border pb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-500" /> Update Release Notes
            </h2>

            <form onSubmit={handleVersionSubmit} className="space-y-6 relative z-10">
                <div>
                    <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">
                        Version Number
                    </label>
                    <input
                        type="text"
                        name="version"
                        value={versionData.version}
                        onChange={(e) => setVersionData({ ...versionData, version: e.target.value })}
                        placeholder="e.g. 2.2.1"
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                    />
                </div>
                
                <div>
                    <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2 uppercase">
                        Changes / Bullet Points (One per line)
                    </label>
                    <textarea
                        name="changes"
                        value={versionData.changes}
                        onChange={(e) => setVersionData({ ...versionData, changes: e.target.value })}
                        placeholder="Added new Blogs feature&#10;Updated footer metadata..."
                        required
                        rows="6"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                    />
                </div>
                
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-primary-500/30 flex justify-center items-center"
                    >
                        {loading ? 'Processing...' : 'Publish Version Updates'}
                    </button>
                </div>
            </form>
        </div>
    );



    const renderManageContent = () => {
        const filteredIpos = allIpos.filter(ipo => 
            (ipo.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ipo.symbol || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const filteredBlogs = allBlogs.filter(blog => 
            (blog.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (blog.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (blog.author || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const filteredFaqs = allFaqs.filter(faq => 
            (faq.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (faq.answer || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="space-y-8 animate-fade-in">
                {/* Search Bar */}
                <div className="bg-white dark:bg-dark-card p-5 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl flex items-center gap-3">
                    <Search className="w-6 h-6 text-primary-600" />
                    <input 
                        type="text" 
                        placeholder="Search IPOs, Blogs, or FAQs..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-base text-gray-900 dark:text-white font-bold placeholder-gray-400"
                    />
                </div>
            {/* Manage IPOs */}
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-dark-border pb-4">
                    <BarChart3 className="w-5 h-5 text-primary-500" /> Manage IPO Listings
                </h2>
                {filteredIpos.length === 0 ? (
                    <p className="text-center text-gray-500 font-medium py-8">No IPOs found matching search.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-dark-border text-xs uppercase text-gray-400 font-bold">
                                    <th className="pb-3 pr-4">Company</th>
                                    <th className="pb-3 pr-4">Symbol</th>
                                    <th className="pb-3 pr-4">GMP</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                                {filteredIpos.slice(0, 6).map(ipo => (
                                    <tr key={ipo._id} className="text-sm">
                                        <td className="py-4 font-bold text-gray-900 dark:text-white">{ipo.companyName}</td>
                                        <td className="py-4 text-gray-500">{ipo.symbol}</td>
                                        <td className="py-4 text-green-600 font-bold">₹{ipo.gmp || '0'}</td>
                                        <td className="py-4 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setIpoData({
                                                        companyName: ipo.companyName || '',
                                                        symbol: ipo.symbol || '',
                                                        issueSize: ipo.issueSize || '',
                                                        priceBand: ipo.priceBand || '',
                                                        openDate: ipo.openDate ? new Date(ipo.openDate).toISOString().split('T')[0] : '',
                                                        closeDate: ipo.closeDate ? new Date(ipo.closeDate).toISOString().split('T')[0] : '',
                                                        gmp: ipo.gmp || '',
                                                        qib: ipo.qib || '',
                                                        nii: ipo.nii || '',
                                                        retail: ipo.retail || '',
                                                        drhpUrl: ipo.drhpUrl || '',
                                                        listingPrice: ipo.listingPrice || '',
                                                        pe: ipo.pe || '',
                                                        revenue: ipo.revenue || '',
                                                        pat: ipo.pat || '',
                                                        roe: ipo.roe || '',
                                                        roce: ipo.roce || ''
                                                    });
                                                    setEditingId(ipo._id);
                                                    setActiveTab('add_ipo');
                                                }} 
                                                className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteIpo(ipo._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Manage Blogs */}
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-dark-border pb-4">
                    <FileText className="w-5 h-5 text-purple-500" /> Manage Blog Posts
                </h2>
                {filteredBlogs.length === 0 ? (
                    <p className="text-center text-gray-500 font-medium py-8">No Blogs found matching search.</p>
                ) : (
                    <div className="space-y-4">
                        {filteredBlogs.slice(0, 6).map(blog => (
                            <div key={blog._id} className="flex justify-between items-center bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-gray-100 dark:border-dark-border">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{blog.title}</h3>
                                    <p className="text-xs text-gray-500">By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setBlogData({
                                                title: blog.title || '',
                                                content: blog.content || '',
                                                author: blog.author || '',
                                                summary: blog.summary || '',
                                                imageUrl: blog.imageUrl || '',
                                                tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : ''
                                            });
                                            setEditingId(blog._id);
                                            setActiveTab('add_blog');
                                        }} 
                                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteBlog(blog._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manage FAQs */}
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-dark-border pb-4">
                    <MessageSquare className="w-5 h-5 text-yellow-500" /> Manage FAQs
                </h2>
                {filteredFaqs.length === 0 ? (
                    <p className="text-center text-gray-500 font-medium py-8">No FAQs found matching search.</p>
                ) : (
                    <div className="space-y-4">
                        {filteredFaqs.slice(0, 6).map(faq => (
                            <div key={faq._id} className="flex justify-between items-start bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-gray-100 dark:border-dark-border">
                                <div className="max-w-[85%]">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{faq.question}</h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{faq.answer}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button 
                                        onClick={() => {
                                            setFaqData({
                                                question: faq.question || '',
                                                answer: faq.answer || ''
                                            });
                                            setEditingId(faq._id);
                                            setActiveTab('add_faq');
                                        }} 
                                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteFaq(faq._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        );
    };

    const renderUsersList = () => (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl animate-fade-in">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-dark-border pb-4">
                <Users className="w-5 h-5 text-green-500" /> Registered Users
            </h2>
            {allUsers.length === 0 ? (
                <p className="text-center text-gray-500 font-medium py-8">No users found in database.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-dark-border text-xs uppercase text-gray-400 font-bold">
                                <th className="pb-3 pr-4">Name</th>
                                <th className="pb-3 pr-4">Email</th>
                                <th className="pb-3 text-right">Joined On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                            {allUsers.map(user => (
                                <tr key={user._id} className="text-sm">
                                    <td className="py-4 font-bold text-gray-900 dark:text-white">{user.name}</td>
                                    <td className="py-4 text-gray-500">{user.email}</td>
                                    <td className="py-4 text-right text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Users', value: allUsers.length, icon: <Users className="w-6 h-6" /> },
                    { label: 'Total IPOs', value: allIpos.length, icon: <BarChart3 className="w-6 h-6" /> },
                    { label: 'Blog Posts', value: allBlogs.length, icon: <FileText className="w-6 h-6" /> }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-200 border-t-4 border-t-primary-500">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl text-primary-600">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl h-[300px] flex items-center justify-center text-center">
                 <div>
                      <div className="p-5 bg-green-50 dark:bg-green-900/10 rounded-full inline-flex mb-4">
                           <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">System Operational</h3>
                      <p className="text-gray-500 mt-2 text-sm max-w-sm">All backend services, database synchronizations, and live metric streams are online and healthy.</p>
                 </div>
            </div>
        </div>
    );

    const renderAddFaqForm = () => (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 border-b border-gray-100 dark:border-dark-border pb-6 flex items-center gap-2">
                {editingId ? <Pencil className="w-6 h-6 text-yellow-500" /> : <Plus className="w-6 h-6 text-primary-500" />} {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <form onSubmit={handleFaqSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Question</label>
                    <input 
                        type="text" 
                        name="question" 
                        value={faqData.question} 
                        onChange={(e) => setFaqData({ ...faqData, question: e.target.value })} 
                        required 
                        className="w-full p-4 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:border-primary-500 text-gray-900 dark:text-white font-medium"
                        placeholder="e.g. What is the AI Rating system?"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Answer</label>
                    <textarea 
                        name="answer" 
                        value={faqData.answer} 
                        onChange={(e) => setFaqData({ ...faqData, answer: e.target.value })} 
                        required 
                        rows="4"
                        className="w-full p-4 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:border-primary-500 text-gray-900 dark:text-white font-medium"
                        placeholder="Provide a clear answer..."
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all hover:scale-105"
                    >
                        {loading ? 'Adding...' : 'Add FAQ'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderPlaceholder = (title, icon, message) => (


        <div className="bg-white dark:bg-dark-card p-12 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl flex flex-col items-center justify-center text-center animate-fade-in h-[600px]">
            <div className="p-6 bg-gray-50 dark:bg-dark-bg rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-primary-500/10 rounded-full animate-ping"></div>
                {icon}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                {title}
            </h2>
            <p className="text-gray-500 font-medium max-w-md">
                {message}
            </p>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'manage_content', label: 'Manage Content', icon: <Database className="w-5 h-5" /> },
        { id: 'add_ipo', label: 'Add New IPO', icon: <Plus className="w-5 h-5" /> },
        { id: 'add_blog', label: 'Add New Blog', icon: <FileText className="w-5 h-5" /> },
        { id: 'add_faq', label: 'Add FAQ', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'add_version', label: 'System Versioning', icon: <CheckCircle className="w-5 h-5" /> },

        { id: 'add_drhp', label: 'Add New DRHP File', icon: <FileText className="w-5 h-5" /> },


        { id: 'model_perf', label: 'Model Performance', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'live_traffic', label: 'Live Traffic', icon: <Users className="w-5 h-5" /> }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                            {greeting} <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-black uppercase tracking-widest text-xs rounded-xl transition-colors shrink-0"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>

                {successMsg && (
                    <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400 animate-fade-in">
                        <CheckCircle className="w-6 h-6 shrink-0" />
                        <span className="font-bold">{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-fade-in">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <span className="font-bold">{errorMsg}</span>
                    </div>
                )}


                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl p-4 sticky top-28">
                            <nav className="space-y-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setEditingId(null);
                                            // Reset forms to add-mode defaults
                                            if (tab.id === 'add_ipo') {
                                                setIpoData({
                                                    companyName: '', symbol: '', issueSize: '', priceBand: '',
                                                    openDate: '', closeDate: '', gmp: '', qib: '', nii: '',
                                                    retail: '', drhpUrl: '', listingPrice: '', pe: '',
                                                    revenue: '', pat: '', roe: '', roce: ''
                                                });
                                            } else if (tab.id === 'add_blog') {
                                                setBlogData({ title: '', content: '', author: '', summary: '', imageUrl: '', tags: '' });
                                            } else if (tab.id === 'add_faq') {
                                                setFaqData({ question: '', answer: '' });
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${
                                            activeTab === tab.id 
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-primary-600 dark:hover:text-primary-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {tab.icon}
                                            <span className="text-sm uppercase tracking-wide">{tab.label}</span>
                                        </div>
                                        {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 p-5 bg-gradient-to-br from-gray-900 to-black rounded-2xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <LayoutDashboard className="w-16 h-16" />
                                </div>
                                <h4 className="font-black uppercase tracking-tight text-sm mb-1 relative z-10">System Status</h4>
                                <div className="flex items-center gap-2 text-xs font-bold text-green-400 relative z-10">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Database Online
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'manage_content' && renderManageContent()}
                        {activeTab === 'add_ipo' && renderAddIpoForm()}
                        {activeTab === 'add_blog' && renderAddBlogForm()}
                        {activeTab === 'add_faq' && renderAddFaqForm()}
                        {activeTab === 'add_version' && renderAddVersionForm()}



                        {activeTab === 'add_drhp' && renderPlaceholder(
                            'Upload DRHP Documents',
                            <FileText className="w-16 h-16 text-primary-500" />,
                            'This module allows administrators to securely upload official SEBI Draft Red Herring Prospectus (DRHP) PDF files securely to our robust cloud-storage pipeline independently of the IPO tracking form.'
                        )}
                        {activeTab === 'model_perf' && renderPlaceholder(
                            'AI Evaluation Center',
                            <BarChart3 className="w-16 h-16 text-purple-500" />,
                            'A unified telemetry view mapping StockTraQ\'s predictive model lifecycle hooks. Evaluates real-time XGBoost drift detection, hyperparameter metrics, and real-time accuracy against current unlisted active market sentiment.'
                        )}
                        {activeTab === 'live_traffic' && renderUsersList()}

                    </div>
                </div>
            </div>
        </div>
    );
};
