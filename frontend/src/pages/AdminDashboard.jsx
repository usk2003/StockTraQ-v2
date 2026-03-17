import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, LogOut, CheckCircle, AlertTriangle, Plus, FileText, BarChart3, Users, ChevronRight, Trash2 } from 'lucide-react';


export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('add_ipo');
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
        drhpUrl: ''
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
            await axios.post('http://localhost:5000/admin/add-ipo', ipoData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccessMsg('IPO successfully added to database!');
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
                drhpUrl: ''
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
                tags: blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };
            
            await axios.post('http://localhost:5000/admin/add-blog', formattedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg('Blog successfully added to database!');
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
            
            await axios.post('http://localhost:5000/admin/add-version', formattedData, {
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


    const fetchContent = async () => {
        try {
            const [ongoingIpos, closedIpos, blogsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/ipos/ongoing'),
                axios.get('http://localhost:5000/api/ipos/closed'),
                axios.get('http://localhost:5000/api/blogs')
            ]);
            setAllIpos([...ongoingIpos.data, ...closedIpos.data]);
            setAllBlogs(blogsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'manage_content') {
            fetchContent();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'live_traffic') {
            fetchUsers();
        }
    }, [activeTab]);


    const handleDeleteIpo = async (id) => {
         if (!window.confirm('Are you sure you want to delete this IPO?')) return;
         try {
             const token = localStorage.getItem('adminToken');
             await axios.delete(`http://localhost:5000/admin/ipo/${id}`, {
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
             await axios.delete(`http://localhost:5000/admin/blog/${id}`, {
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
                <Plus className="w-5 h-5 text-primary-500" /> Create New IPO Entry
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
                            required
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
                        {loading ? 'Processing...' : 'Add IPO to Database'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderAddBlogForm = () => (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl relative overflow-hidden animate-fade-in">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 border-b border-gray-100 dark:border-dark-border pb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" /> Create New Blog Post
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



    const renderManageContent = () => (
        <div className="space-y-8 animate-fade-in">
            {/* Manage IPOs */}
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-xl">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-dark-border pb-4">
                    <BarChart3 className="w-5 h-5 text-primary-500" /> Manage IPO Listings
                </h2>
                {allIpos.length === 0 ? (
                    <p className="text-center text-gray-500 font-medium py-8">No IPOs found in database.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-dark-border text-xs uppercase text-gray-400 font-bold">
                                    <th className="pb-3 pr-4">Company</th>
                                    <th className="pb-3 pr-4">Symbol</th>
                                    <th className="pb-3 pr-4">GMP</th>
                                    <th className="pb-3 text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                                {allIpos.map(ipo => (
                                    <tr key={ipo._id} className="text-sm">
                                        <td className="py-4 font-bold text-gray-900 dark:text-white">{ipo.companyName}</td>
                                        <td className="py-4 text-gray-500">{ipo.symbol}</td>
                                        <td className="py-4 text-green-600 font-bold">₹{ipo.gmp || '0'}</td>
                                        <td className="py-4 text-right">
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
                {allBlogs.length === 0 ? (
                    <p className="text-center text-gray-500 font-medium py-8">No Blogs found in database.</p>
                ) : (
                    <div className="space-y-4">
                        {allBlogs.map(blog => (
                            <div key={blog._id} className="flex justify-between items-center bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-gray-100 dark:border-dark-border">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{blog.title}</h3>
                                    <p className="text-xs text-gray-500">By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => handleDeleteBlog(blog._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

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
        { id: 'manage_content', label: 'Manage Content', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'add_ipo', label: 'Add New IPO', icon: <Plus className="w-5 h-5" /> },
        { id: 'add_blog', label: 'Add New Blog', icon: <FileText className="w-5 h-5" /> },
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
                                        onClick={() => setActiveTab(tab.id)}
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
                        {activeTab === 'manage_content' && renderManageContent()}
                        {activeTab === 'add_ipo' && renderAddIpoForm()}
                        {activeTab === 'add_blog' && renderAddBlogForm()}
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
