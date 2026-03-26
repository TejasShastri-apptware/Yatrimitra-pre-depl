import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'

const Dashboard = () => {
    const [diagrams, setDiagrams] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all') // 'all', 'recent'
    const navigate = useNavigate()

    useEffect(() => {
        const savedDiagrams = JSON.parse(localStorage.getItem('diagrams') || '[]')
        setDiagrams(savedDiagrams.sort((a, b) => b.updatedAt - a.updatedAt))
    }, [])

    const handleCreateNew = () => {
        navigate('/editor/new')
    }

    const handleLogout = () => {
        localStorage.removeItem('auth')
        navigate('/login')
    }

    const handleDelete = (id, e) => {
        e.stopPropagation();
        {
            const savedDiagrams = JSON.parse(localStorage.getItem('diagrams') || '[]')
            const filtered = savedDiagrams.filter(d => d.id !== id)
            localStorage.setItem('diagrams', JSON.stringify(filtered))
            setDiagrams(filtered)
        }
    }


    const filteredDiagrams = useMemo(() => {
        let result = diagrams.filter(d =>
            (d.name || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (activeFilter === 'recent') {
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            result = result.filter(d => d.updatedAt > oneWeekAgo);
        }
        return result;
    }, [diagrams, searchQuery, activeFilter]);

    const stats = useMemo(() => {
        return {
            total: diagrams.length,
            cameras: diagrams.reduce((acc, d) => acc + (d.elements?.filter(e => e.type === 'camera').length || 0), 0),
            zones: diagrams.reduce((acc, d) => acc + (d.elements?.filter(e => e.type === 'room').length || 0), 0)
        }
    }, [diagrams]);

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200 font-['Poppins',sans-serif]">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">YatriMitra</span>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                            All Blueprints
                        </button>
                        <button
                            onClick={() => setActiveFilter('recent')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeFilter === 'recent' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                            Recent
                        </button>
                        <button onClick={() => navigate("/lostandfound")} className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                            Lost & Found
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-10 py-6">
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex-1 max-w-2xl relative group">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input
                                type="text"
                                placeholder="Search blueprints..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all outline-hidden"
                            />
                        </div>

                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all duration-200 active:scale-95 shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                            Create New Blueprint
                        </button>
                    </div>
                </header>

                <div className="p-10 space-y-10">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                </div>
                                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Projects</div>
                            </div>
                            <div className="text-4xl font-bold text-white">{stats.total}</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                </div>
                                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Cameras</div>
                            </div>
                            <div className="text-4xl font-bold text-white">{stats.cameras}</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                                </div>
                                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Monitored Zones</div>
                            </div>
                            <div className="text-4xl font-bold text-white">{stats.zones}</div>
                        </div>
                    </div>

                    {/* Project Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white">Project Library</h2>
                            <div className="text-sm text-slate-500">{filteredDiagrams.length} blueprints available</div>
                        </div>

                        {filteredDiagrams.length === 0 ? (
                            <div className="text-center py-24 bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-800/50">
                                <div className="mb-6 text-slate-700 flex justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><circle cx="12" cy="14" r="3" /><path d="M12 11v6" /><path d="M9 14h6" /></svg>
                                </div>
                                <h3 className="text-2xl font-medium text-slate-300 mb-2">No Projects Found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">
                                    {searchQuery ? "Try a different search term or check your spelling." : "Start your architectural journey by creating your first floor plan."}
                                </p>
                                <button
                                    onClick={handleCreateNew}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200"
                                >
                                    {searchQuery ? "Clear Search" : "Create First Design"}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredDiagrams.map((diagram) => {
                                    const camCount = diagram.elements?.filter(e => e.type === 'camera').length || 0;
                                    const zoneCount = diagram.elements?.filter(e => e.type === 'room').length || 0;

                                    return (
                                        <div
                                            key={diagram.id}
                                            onClick={() => navigate(`/post/${diagram.id}`)}
                                            className="group relative bg-slate-900 border border-slate-800 rounded-4xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col h-full shadow-[0_0_50px_rgba(0,0,0,0.3)] hover:shadow-blue-500/10"
                                        >
                                            {/* Preview Container */}
                                            <div className="aspect-16/10 bg-slate-950/80 p-8 flex items-center justify-center border-b border-slate-800/50 group-hover:bg-slate-950/60 transition-colors relative overflow-hidden">
                                                {/* Mini Canvas Mockup*/}
                                                <div className="relative z-10 w-full h-full border border-blue-500/20 rounded-xl bg-slate-900/50 p-4 flex flex-col gap-2 overflow-hidden bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-500/5 to-transparent">
                                                    <div className="w-2/3 h-4 bg-blue-500/10 rounded-full" />
                                                    <div className="w-full h-px bg-slate-800" />
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <div className="h-12 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-center">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                                        </div>
                                                        <div className="h-12 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-center">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Delete Button on Hover */}
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    <button
                                                        onClick={(e) => handleDelete(diagram.id, e)}
                                                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl backdrop-blur-md border border-red-500/20 transition-all duration-200"
                                                        title="Delete Blueprint"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-8 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate pr-4">
                                                        {diagram.name || 'Untitled Project'}
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest shrink-0">
                                                        v1.0
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-slate-800/30 rounded-2xl p-3 border border-slate-800/50">
                                                        <div className="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Cameras</div>
                                                        <div className="text-lg font-bold text-slate-200">{camCount}</div>
                                                    </div>
                                                    <div className="bg-slate-800/30 rounded-2xl p-3 border border-slate-800/50">
                                                        <div className="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Zones</div>
                                                        <div className="text-lg font-bold text-slate-200">{zoneCount}</div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Modified</span>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {new Date(diagram.updatedAt || Date.now()).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 group-hover:text-white"><path d="m9 18 6-6-6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard

