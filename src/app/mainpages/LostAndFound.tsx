import React, { useState, useEffect } from 'react';

const LostAndFound = () => {
  // Configuration for the filters
  const colorOptions = [
    { name: 'Yellow', hex: '#fbbf24' },
    { name: 'Lavender', hex: '#818cf8' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Olive', hex: '#65a30d' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Brown', hex: '#78350f' },
    { name: 'White', hex: '#f8fafc' },
    { name: 'Gray', hex: '#94a3b8' },
    { name: 'Black', hex: '#1e293b' },
  ];

  const [searchFilters, setSearchFilters] = useState({
    torsoColor: '',
    pantsColor: '',
    hasBackpack: false,
    hasGlasses: false,
    ageGroup: 'All',
    gender: 'All',
  });

  // Load from localstorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lostAndFoundFilters');
    if (saved) setSearchFilters(JSON.parse(saved));
  }, []);

  // Save to localstorage on change
  useEffect(() => {
    localStorage.setItem('lostAndFoundFilters', JSON.stringify(searchFilters));
  }, [searchFilters]);

  const toggleAttribute = (key) => {
    setSearchFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-['Poppins',sans-serif]">
      
      {/* Header - Matching Dashboard */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-10 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Lost & Found</h1>
            <p className="text-slate-500 text-sm mt-1">Filter attributes to locate identified individuals or items.</p>
          </div>
          <div className="flex gap-3">
             <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all"
                     onClick={() => setSearchFilters({ torsoColor: '', pantsColor: '', hasBackpack: false, hasGlasses: false, ageGroup: 'All', gender: 'All' })}>
              Reset Filters
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Controls (Reference Image Style) */}
        <aside className="w-80 bg-slate-900/50 border-r border-slate-800 p-8 overflow-y-auto">
          <section className="space-y-8">
            
            {/* Appearance Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Appearance</h3>
              
              {/* Torso Color */}
              <div className="mb-6">
                <label className="flex items-center gap-3 text-sm text-slate-300 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.62 1.96V10a2 2 0 002 2h2v8a2 2 0 002 2h8a2 2 0 002-2v-8h2a2 2 0 002-2V5.42a2 2 0 00-1.62-1.96z"/></svg>
                  Torso Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button 
                      key={color.name}
                      onClick={() => setSearchFilters(prev => ({...prev, torsoColor: color.hex}))}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 ${searchFilters.torsoColor === color.hex ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Pants Color */}
              <div className="mb-6">
                <label className="flex items-center gap-3 text-sm text-slate-300 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 2v20M15 2v20M9 4h6M4 22h16"/></svg>
                  Pants Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button 
                      key={color.name}
                      onClick={() => setSearchFilters(prev => ({...prev, pantsColor: color.hex}))}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 ${searchFilters.pantsColor === color.hex ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Attributes Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Attributes</h3>
              <div className="space-y-2">
                {[
                  { id: 'hasBackpack', label: 'Backpack', icon: '🎒' },
                  { id: 'hasGlasses', label: 'Glasses', icon: '👓' }
                ].map(attr => (
                  <button
                    key={attr.id}
                    onClick={() => toggleAttribute(attr.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      searchFilters[attr.id] 
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-sm font-medium">{attr.label}</span>
                    {searchFilters[attr.id] && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
              </div>
            </div>

            {/* Demographics */}
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Age Group</label>
                  <select 
                    value={searchFilters.ageGroup}
                    onChange={(e) => setSearchFilters(prev => ({...prev, ageGroup: e.target.value}))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option>All</option>
                    <option>Child</option>
                    <option>Adult</option>
                    <option>Senior</option>
                  </select>
               </div>
            </div>
          </section>
        </aside>

        {/* RIGHT PANEL: Results */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Detection Log</h2>
            <div className="text-sm text-slate-500">Showing matches for selected attributes</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                <div className="aspect-square bg-slate-800 relative">
                  <img
                    src={`https://placehold.co/400x400/1e293b/475569?text=CCTV_CAM_${i+1}`}
                    alt="Found target"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-500/20 backdrop-blur-sm">
                    MATCH 88%
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-tighter">Detected at</div>
                  <div className="text-white font-semibold">Zone B - Main Entrance</div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-slate-400">14:20:05 PM</span>
                    <button className="text-blue-400 text-xs font-bold hover:underline">View Clip</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LostAndFound;