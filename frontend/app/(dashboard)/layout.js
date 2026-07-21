'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children }) {
  const [isLightMode, setIsLightMode] = useState(false);

  // Generate ASCII-like text for the background texture
  const asciiPattern = `
    .:::.   .:::.   .:::.   .:::.   .:::.   .:::.   .:::.   .:::.   
   ::::::. ::::::. ::::::. ::::::. ::::::. ::::::. ::::::. ::::::.  
  :::::::: :::::::: :::::::: :::::::: :::::::: :::::::: :::::::: :::::::: 
  :::::::: :::::::: :::::::: :::::::: :::::::: :::::::: :::::::: :::::::: 
   '::::'   '::::'   '::::'   '::::'   '::::'   '::::'   '::::'   '::::'  
    '::'     '::'     '::'     '::'     '::'     '::'     '::'     '::'   
      .        .        .        .        .        .        .        .    
  `.repeat(40);

  return (
    <div className={`relative min-h-screen w-full transition-colors duration-500 overflow-hidden font-sans ${isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0a0a] text-white'
      }`}>
      {/* 1. Base Background & Central Light Effect */}
      <div className={`fixed inset-0 z-0 flex items-center justify-center transition-colors duration-500 pointer-events-none ${isLightMode ? 'bg-slate-100' : 'bg-[#050508]'
        }`}>
        <div className={`absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-multiply transition-opacity duration-500 ${isLightMode ? 'bg-orange-200/50 opacity-70' : 'bg-blue-900/30 mix-blend-screen opacity-50'
          }`}></div>
        <div className={`absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] transition-opacity duration-500 ${isLightMode ? 'bg-amber-200/60 opacity-60' : 'bg-cyan-700/25 mix-blend-screen opacity-40'
          }`}></div>
      </div>

      {/* 2. ASCII Art Texture Layer */}
      <div className={`fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden transition-opacity duration-500 ${isLightMode ? 'opacity-[0.05]' : 'opacity-[0.12]'
        }`}>
        <div className={`font-mono text-[6px] md:text-[8px] leading-[1.2] whitespace-pre text-center tracking-widest break-all w-[150%] h-[150%] flex flex-wrap content-start transform rotate-[-5deg] ${isLightMode ? 'text-slate-800' : 'text-gray-300'
          }`}>
          {asciiPattern}
        </div>
      </div>

      {/* 3. Screen-wide Tight Vertical Bars (Louvers) */}
      <div
        className="fixed inset-0 z-10 pointer-events-none transition-all duration-500"
        style={{
          backgroundImage: isLightMode
            ? 'repeating-linear-gradient(to right, rgba(241,245,249,0.7) 0px, rgba(241,245,249,0.7) 5px, rgba(226,232,240,0.15) 5px, rgba(226,232,240,0.15) 7px)'
            : 'repeating-linear-gradient(to right, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.85) 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 7px)'
        }}
      />

      {/* 4. Sidebar */}
      <Sidebar />

      {/* 5. Main Content Area */}
      <main
        className="relative z-20 min-h-screen transition-all duration-300 flex flex-col"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {/* Top Header Bar with Theme Toggle */}
        <header className={`px-8 py-4 border-b flex items-center justify-between backdrop-blur-md sticky top-0 z-20 transition-colors duration-500 ${isLightMode ? 'bg-slate-100/80 border-slate-200' : 'bg-black/30 border-white/10'
          }`}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold">
              SECURE WORKSPACE
            </span>
            <h2 className="text-sm font-semibold opacity-80">Zero-Knowledge Commit Attestation Platform</h2>
          </div>

          {/* <div className="flex items-center gap-4">
            Theme Toggle Button 
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              aria-label="Toggle Light/Dark Theme"
              className={`p-2 rounded-lg border transition-all duration-300 flex items-center gap-2 text-xs font-medium ${isLightMode
                  ? 'bg-slate-200/80 border-slate-300 text-slate-800 hover:bg-slate-300/80 shadow-sm'
                  : 'bg-white/10 border-white/20 text-yellow-400 hover:bg-white/20 backdrop-blur-md'
                }`}
            >
              {isLightMode ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.056-5.056-1.591 1.591M6.536 17.464l-1.591 1.591m12.728 0-1.591-1.591M6.536 6.536 4.945 4.945M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1 shadow-md shadow-orange-500/20"
            >
              Landing Page ↗
            </Link>
          </div> */}
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
