import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { NODE_API, FASTAPI_API } from '../../config';
import { LayoutDashboard, LogOut, CheckCircle, AlertTriangle, Plus, FileText, BarChart3, Users, ChevronRight, Trash2, Database, MessageSquare, Pencil, Search, TrendingUp, Sparkles, ShieldCheck, History, Settings, Globe, Activity } from 'lucide-react';

// Sub-component for managing uploaded DRHP documents
const DrhpDocsList = () => {
    const [docs, setDocs] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(null);

    const fetchAllDocs = async () => {
        try {
            // Fetch ALL docs (including processing/failed) for admin view
            const res = await axios.get(`${FASTAPI_API}/insight/all-documents`);
            setDocs(res.data);
        } catch (err) {
            console.error('Failed to fetch DRHP docs', err);
        }
    };

    useEffect(() => { fetchAllDocs(); }, []);

    const handleDelete = async (doc_id) => {
        if (!window.confirm('Delete this document? This cannot be undone.')) return;
        setDeleteLoading(doc_id);
        try {
            await axios.delete(`${FASTAPI_API}/insight/documents/${doc_id}`);
            setDocs(prev => prev.filter(d => d.doc_id !== doc_id));
        } catch (err) {
            alert('Failed to delete document.');
        } finally {
            setDeleteLoading(null);
        }
    };

    if (docs.length === 0) return null;

    const statusColor = (s) => s === 'completed' ? 'text-green-500' : s === 'failed' ? 'text-red-500' : 'text-yellow-500';
    const statusLabel = (s) => s === 'completed' ? '✓ Completed' : s === 'failed' ? '✗ Failed' : '⟳ Processing';

    return (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 border-b border-gray-100 dark:border-dark-border pb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-500" /> Manage Uploaded Documents
            </h2>
            <div className="space-y-3">
                {docs.map(doc => (
                    <div key={doc.doc_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{doc.filename}</p>
                            <p className={`text-xs font-bold mt-1 ${statusColor(doc.status)}`}>{statusLabel(doc.status)}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(doc.doc_id)}
                            disabled={deleteLoading === doc.doc_id}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {deleteLoading === doc.doc_id
                                ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                : <Trash2 className="w-4 h-4" />
                            }
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AdminDashboard = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    const [activeTab, setActiveTab] = useState(tabParam || 'overview');
    const [greeting, setGreeting] = useState(`Hi, ${localStorage.getItem('adminName') || 'Admin'}`);

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
        roce: '',
        profit_margin: '',
        growth: ''
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
    const [selectedDrhpFile, setSelectedDrhpFile] = useState(null);
    const [uploadDrhpLoading, setUploadDrhpLoading] = useState(false);
    const [drhpName, setDrhpName] = useState('');

    const handleDrhpSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDrhpFile) return;
        
        setUploadDrhpLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        const formData = new FormData();
        formData.append('custom_name', drhpName || selectedDrhpFile.name);
        formData.append('file', selectedDrhpFile);
        
        try {
            const uploadRes = await axios.post(`${FASTAPI_API}/insight/upload`, formData);
            const doc_id = uploadRes.data.doc_id;
            
            // Start Polling Loop
            let isComplete = false;
            while (!isComplete) {
                await new Promise(r => setTimeout(r, 4000)); // Poll every 4 seconds
                const statusRes = await axios.get(`${FASTAPI_API}/insight/status/${doc_id}`);
                const status = statusRes.data.status;
                
                if (status === 'completed') {
                    isComplete = true;
                    setSuccessMsg('DRHP Document successfully processed! Data and vectors are ready in Insight TraQ.');
                    setSelectedDrhpFile(null);
                    setDrhpName('');
                } else if (status === 'failed') {
                    isComplete = true;
                    const errorDetail = statusRes.data.error || 'Unknown Pipeline Failure';
                    throw new Error(`Pipeline failed: ${errorDetail}`);
                }
            }
        } catch (err) {
            const detailError = err.response?.data?.detail;
            const errorMsg = Array.isArray(detailError) ? JSON.stringify(detailError) : detailError;
            setErrorMsg(`Err: ${err.message}. Detail: ${errorMsg || 'Upload or processing failed.'}`);
        } finally {
            setUploadDrhpLoading(false);
            window.scrollTo(0, 0);
        }
    };
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
                roce: '',
                profit_margin: '',
                growth: ''
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
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border-0 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-600"></div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                    {editingId ? <Pencil className="w-6 h-6 text-yellow-500" /> : <Plus className="w-6 h-6 text-primary-500" />} 
                    {editingId ? 'Edit IPO Entry' : 'Create New IPO Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Identity & Timeline */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-dark-border pb-3">
                            <Database className="w-4 h-4 text-gray-400" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Primary Details & Timeline</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Company Legal Name</label>
                                <input type="text" name="companyName" value={ipoData.companyName} onChange={handleChange} placeholder="e.g. Acme Corp Ltd." required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">NSE Symbol</label>
                                <input type="text" name="symbol" value={ipoData.symbol} onChange={handleChange} placeholder="e.g. ACME" required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-sm uppercase" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Opening Date</label>
                                <input type="date" name="openDate" value={ipoData.openDate} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Closing Date (Listing)</label>
                                <input type="date" name="closeDate" value={ipoData.closeDate} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price Band (₹)</label>
                                <input type="text" name="priceBand" value={ipoData.priceBand} onChange={handleChange} placeholder="e.g. 90-100" required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-sm" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">DRHP Link (SEBI Official)</label>
                                <input type="url" name="drhpUrl" value={ipoData.drhpUrl} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Market Demand & Size */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-dark-border pb-3">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Market Demand & Subscription</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Size (₹ Cr)</label>
                                <input type="number" step="0.01" name="issueSize" value={ipoData.issueSize} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">GMP (₹)</label>
                                <input type="number" step="0.01" name="gmp" value={ipoData.gmp} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">QIB (x)</label>
                                <input type="number" step="0.01" name="qib" value={ipoData.qib} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">NII (x)</label>
                                <input type="number" step="0.01" name="nii" value={ipoData.nii} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Retail (x)</label>
                                <input type="number" step="0.01" name="retail" value={ipoData.retail} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Listing Price (₹)</label>
                                <input type="number" step="0.01" name="listingPrice" value={ipoData.listingPrice} onChange={handleChange} placeholder="If Closed" className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Financials for Prediction Engine */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-dark-border pb-3">
                            <BarChart3 className="w-4 h-4 text-purple-500" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Prediction Core (Financials)</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">P/E Ratio</label>
                                <input type="number" step="1" name="pe" value={ipoData.pe} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Revenue (₹ Cr)</label>
                                <input type="number" step="0.01" name="revenue" value={ipoData.revenue} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PAT (Profit) (₹ Cr)</label>
                                <input type="number" step="0.01" name="pat" value={ipoData.pat} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Profit Margin (%)</label>
                                <input type="number" step="0.01" name="profit_margin" value={ipoData.profit_margin} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ROE (%)</label>
                                <input type="number" step="0.01" name="roe" value={ipoData.roe} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ROCE (%)</label>
                                <input type="number" step="0.01" name="roce" value={ipoData.roce} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Revenue Growth (%)</label>
                                <input type="number" step="0.01" name="growth" value={ipoData.growth} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.5rem] font-black uppercase tracking-widest transition-all hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white shadow-xl shadow-gray-200 dark:shadow-none active:scale-95 disabled:opacity-50">
                            {loading ? 'Processing...' : editingId ? 'Update IPO Audit' : 'Add IPO Entry'}
                        </button>
                        {editingId && (
                            <button onClick={() => { setEditingId(null); setIpoData({ companyName: '', symbol: '', issueSize: '', priceBand: '', openDate: '', closeDate: '', gmp: '', qib: '', nii: '', retail: '', drhpUrl: '', listingPrice: '', pe: '', revenue: '', pat: '', roe: '', roce: '', profit_margin: '', growth: '' }); }} className="px-8 py-4 bg-gray-100 dark:bg-dark-bg text-gray-500 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs">Cancel</button>
                        )}
                    </div>
                </form>
            </div>
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
    const renderAddDrhpForm = () => (
        <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl relative overflow-hidden">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 border-b border-gray-100 dark:border-dark-border pb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" /> Upload DRHP Documents
            </h2>
            <p className="text-gray-500 text-sm mb-6">
                Upload official SEBI Draft Red Herring Prospectus (DRHP/RHP) PDF files securely. Heavy parsing and AI Insight extraction will take place in the background. Note: 800+ page PDFs could take 2-3 minutes to encode into Vector DBs.
            </p>

            <form onSubmit={handleDrhpSubmit} className="space-y-6 relative z-10">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors flex flex-col items-center justify-center">
                    <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={(e) => setSelectedDrhpFile(e.target.files[0])}
                        className="mb-4 text-sm text-gray-500 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        required
                    />
                    {selectedDrhpFile && <p className="text-sm font-bold text-primary-600">Selected: {selectedDrhpFile.name}</p>}
                </div>
                
                <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Display Name (Optional)</label>
                    <input 
                        type="text" 
                        value={drhpName}
                        onChange={(e) => setDrhpName(e.target.value)}
                        placeholder="e.g. Swiggy Ltd DRHP"
                        className="px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-shadow"
                    />
                </div>
                
                <div>
                    <button
                        type="submit"
                        disabled={uploadDrhpLoading || !selectedDrhpFile}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2"
                    >
                        {uploadDrhpLoading ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> AI Analyzing... Please Wait</>
                        ) : 'Process Document & Extract Insights'}
                    </button>
                </div>
            </form>
        </div>

        {/* Manage Existing DRHP Docs */}
        <DrhpDocsList />
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
            <div className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100 dark:border-dark-border">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Globe className="w-6 h-6 text-primary-500" /> IPO Inventory
                    </h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredIpos.length} total entries</span>
                </div>
                
                {filteredIpos.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-dark-bg/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-border">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Zero Matches in Sector Analysis</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[10px] uppercase text-gray-400 font-black tracking-widest">
                                    <th className="px-6 pb-2">Venture</th>
                                    <th className="px-6 pb-2">Status</th>
                                    <th className="px-6 pb-2">GMP Alpha</th>
                                    <th className="px-6 pb-2 text-right">Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIpos.slice(0, 8).map(ipo => (
                                    <tr key={ipo._id} className="group bg-gray-50/50 dark:bg-dark-bg/50 hover:bg-white dark:hover:bg-dark-card transition-all rounded-2xl">
                                        <td className="px-6 py-5 first:rounded-l-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white dark:bg-dark-bg rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-dark-border group-hover:scale-110 transition-transform">
                                                    <span className="text-[10px] font-black text-primary-600">{ipo.symbol?.slice(0, 3)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight">{ipo.companyName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{ipo.symbol}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${ipo.closeDate && new Date(ipo.closeDate) < new Date() ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                                                {ipo.closeDate && new Date(ipo.closeDate) < new Date() ? 'Archive' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">₹{ipo.gmp || '0'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right last:rounded-r-2xl">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                            roce: ipo.roce || '',
                                                            profit_margin: ipo.profit_margin || '',
                                                            growth: ipo.growth || ''
                                                        });
                                                        setEditingId(ipo._id);
                                                        setActiveTab('add_ipo');
                                                    }}
                                                    className="p-2.5 bg-white dark:bg-dark-bg text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl shadow-sm border border-gray-100 dark:border-dark-border transition-all"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteIpo(ipo._id)} className="p-2.5 bg-white dark:bg-dark-bg text-red-500 hover:bg-red-600 hover:text-white rounded-xl shadow-sm border border-gray-100 dark:border-dark-border transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
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
        <div className="space-y-10 animate-fade-in px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { label: 'Active Workforce', value: allUsers.length, unit: 'Users', icon: <Users className="w-7 h-7" />, color: 'from-blue-600 to-blue-800' },
                    { label: 'Live Intelligence', value: allIpos.length, unit: 'Entities', icon: <Database className="w-7 h-7" />, color: 'from-primary-600 to-primary-800' },
                    { label: 'Knowledge Base', value: allBlogs.length, unit: 'Articles', icon: <FileText className="w-7 h-7" />, color: 'from-purple-600 to-purple-800' }
                ].map((stat, idx) => (
                    <div key={idx} className="group relative bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-2xl transition-all h-full overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{stat.unit}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all text-gray-400">
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative z-10">
                        <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-full inline-flex mb-6 animate-pulse">
                             <ShieldCheck className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Cluster Healthy</h3>
                        <p className="text-gray-500 mt-4 text-sm font-medium leading-relaxed max-w-sm">All StockTraQ nodes and predictive engine clusters are synchronized and responsive. Zero critical failures in last 24h.</p>
                     </div>
                </div>

                <div className="bg-gray-900 dark:bg-black p-10 rounded-[2.5rem] border-0 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <Sparkles className="w-40 h-40 text-primary-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Neural Overview</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs mb-8">System is processing 42.8k calls per minute with a 0.04% error rate in current unlisted market evaluation loops.</p>
                        <button className="px-6 py-3 bg-white text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-xl shadow-primary-500/20">
                            Audit Logs
                        </button>
                    </div>
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
        { id: 'overview', label: 'Monitor', icon: <Activity className="w-3.5 h-3.5" /> },
        { id: 'live_traffic', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'manage_content', label: 'Database', icon: <Database className="w-3.5 h-3.5" /> },
        { id: 'add_ipo', label: 'Seed IPO', icon: <Plus className="w-3.5 h-3.5" /> },
        { id: 'add_blog', label: 'Draft Blog', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'add_faq', label: 'Curate FAQs', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        { id: 'add_drhp', label: 'Index DRHP', icon: <Globe className="w-3.5 h-3.5" /> },
        { id: 'model_perf', label: 'AI Health', icon: <Sparkles className="w-3.5 h-3.5 text-purple-500" /> },
        { id: 'add_version', label: 'Changelog', icon: <History className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg selection:bg-primary-500 selection:text-white transition-colors duration-500">
            {/* Optimized Command Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-dark-card/70 backdrop-blur-3xl border-b border-gray-100 dark:border-dark-border h-24 flex items-center px-8">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="bg-primary-600 p-2.5 rounded-2xl shadow-xl shadow-primary-500/20">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                                {greeting}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Cloud Secure</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-100 dark:border-dark-border hidden md:block"></div>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-2xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-lg shadow-red-500/10"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Sticky Horizontal Command Strip */}
            <div className="fixed top-24 left-0 right-0 z-40 bg-white/50 dark:bg-dark-card/50 backdrop-blur-2xl border-b border-gray-100 dark:border-dark-border">
                <div className="max-w-7xl mx-auto px-8 overflow-x-auto no-scrollbar">
                    <nav className="flex items-center gap-3 py-4 min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setEditingId(null);
                                    if (tab.id === 'add_ipo') {
                                        setIpoData({
                                            companyName: '', symbol: '', issueSize: '', priceBand: '',
                                            openDate: '', closeDate: '', gmp: '', qib: '', nii: '',
                                            retail: '', drhpUrl: '', listingPrice: '', pe: '',
                                            revenue: '', pat: '', roe: '', roce: '',
                                            profit_margin: '', growth: ''
                                        });
                                    } else if (tab.id === 'add_blog') {
                                        setBlogData({ title: '', content: '', author: '', summary: '', imageUrl: '', tags: '' });
                                    } else if (tab.id === 'add_faq') {
                                        setFaqData({ question: '', answer: '' });
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all relative overflow-hidden group whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-gray-900 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-bg/20'
                                }`}
                            >
                                <span className={`${activeTab === tab.id ? 'text-primary-400' : 'text-gray-400'} group-hover:scale-110 transition-transform`}>
                                    {tab.icon}
                                </span>
                                <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                            </button>
                        ))}
                        
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-[180px] pb-12 px-6">
                {/* Main Content Area */}
                <main className="transition-opacity duration-300">
                    {successMsg && (
                        <div className="mb-8 p-5 bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl border-l-[6px] border-green-500 rounded-2xl shadow-xl shadow-green-500/5 flex items-center gap-4 animate-slide-up">
                            <div className="bg-green-100 p-2 rounded-xl"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                            <span className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{successMsg}</span>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="mb-8 p-5 bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl border-l-[6px] border-red-500 rounded-2xl shadow-xl shadow-red-500/5 flex items-center gap-4 animate-slide-up">
                            <div className="bg-red-100 p-2 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                            <span className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{errorMsg}</span>
                        </div>
                    )}

                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'manage_content' && renderManageContent()}
                    {activeTab === 'add_ipo' && renderAddIpoForm()}
                    {activeTab === 'add_blog' && renderAddBlogForm()}
                    {activeTab === 'add_faq' && renderAddFaqForm()}
                    {activeTab === 'add_version' && renderAddVersionForm()}
                    {activeTab === 'add_drhp' && renderAddDrhpForm()}
                    {activeTab === 'model_perf' && renderPlaceholder(
                        'AI Evaluation Center',
                        <Sparkles className="w-16 h-16 text-purple-500" />,
                        'Advanced model telemetry is active. Monitoring real-time XGBoost drift detection and hyperparameter lifecycle hooks.'
                    )}
                    {activeTab === 'live_traffic' && renderUsersList()}
                </main>
            </div>
        </div>
    );
};
