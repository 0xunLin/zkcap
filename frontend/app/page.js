"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Menu, X, Moon, Sun } from 'lucide-react';
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [IndiaTime, setIndiaTime] = useState('');

  // Live India Time Sync (Format: HH:MM)
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      setIndiaTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative min-h-[100vh] w-full overflow-x-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#EFEFEF]'}`}>

      {/* ========================================== */}
      {/* BACKGROUND LAYER: ANIMATED SHADER OVERLAY  */}
      {/* ========================================== */}
      <div className={`fixed inset-0 z-10 pointer-events-none w-full h-full transition-opacity duration-500 ${isDarkMode ? 'opacity-30' : 'opacity-100'}`}>
        <Shader>
          <Swirl colorA={isDarkMode ? '#111111' : '#ffffff'} colorB={isDarkMode ? '#0a0a0a' : '#f0f0f0'} detail={1.7} />
          <ChromaFlow
            baseColor={isDarkMode ? '#111111' : '#ffffff'}
            downColor="#ff5f03"
            leftColor="#ff5f03"
            rightColor="#ff5f03"
            upColor="#ff5f03"
            momentum={13}
            radius={3.5}
          />
          <FlutedGlass
            aberration={0.61}
            angle={31}
            frequency={8}
            highlight={0.12}
            highlightSoftness={0}
            lightAngle={-90}
            refraction={4}
            shape="rounded"
            softness={1}
            speed={0.15}
          />
          <FilmGrain strength={isDarkMode ? 0.08 : 0.05} />
        </Shader>
      </div>

      {/* ========================================== */}
      {/* SECTION 1: HERO VIEWPORT CONTAINER         */}
      {/* ========================================== */}
      <section className="relative z-20 min-h-[100dvh] w-full max-w-[1440px] mx-auto flex flex-col justify-between">

        {/* NAVIGATION PILL */}
        <div className="p-2 sm:p-3 w-full">
          <nav className={`w-full rounded-full p-[5px] flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20' : 'bg-white shadow-sm'}`}>

            {/* LEFT: Branding & Links */}
            <div className="flex items-center gap-6 pl-1">
              <Link href="/" className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}>
                <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight ${isDarkMode ? 'text-gray-900' : 'text-white'}`}>ZK</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                {['Terminal', 'Projects', 'Attestations', 'Commits', 'Prover (ZK)'].map((link) => {
                  const path = link === 'Prover (ZK)' ? '/attestations' : `/${link.toLowerCase()}`;
                  return (
                    <Link
                      key={link}
                      href={path}
                      className={`text-[14px] transition-colors duration-300 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-900 hover:text-gray-500'}`}
                    >
                      {link}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Status & CTA */}
            <div className="hidden md:flex items-center gap-6 pr-1">
              <span className={`text-[13px] hidden lg:block transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Securing codebases for startups
              </span>

              <div className={`flex items-center gap-1.5 text-[13px] transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-[14px] h-[14px]" />
                <span>{IndiaTime || '00:00'} in India</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors shadow-sm ${isDarkMode ? 'bg-white/10 border border-white/20 text-yellow-400 hover:bg-white/20' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <Link href="/projects" className={`group flex items-center gap-3 text-[13px] font-medium rounded-full pl-5 pr-2 py-2 transition-all active:scale-[0.98] ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
                  <div className="flex flex-col overflow-hidden h-[20px] relative">
                    <span className="transform group-hover:-translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                      Log In
                    </span>
                    <span className="absolute top-0 left-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                      Log In
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transform group-hover:rotate-[-45deg] transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <ArrowRight className={`w-3.5 h-3.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
                  </div>
                </Link>
              </div>
            </div>

            {/* MOBILE TOGGLE */}
            <div className="flex md:hidden pr-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </div>

        {/* SPACER */}
        <div className="flex-1 min-h-[2rem] sm:min-h-[4rem]" />

        {/* HERO CONTENT */}
        <div className="w-full px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20 flex flex-col items-start">

          <span className={`text-[13px] sm:text-[14px] font-medium tracking-wide mb-5 sm:mb-8 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-900'}`}>
            Verifiable Commit Attestation Protocol
          </span>

          <h1 className={`text-[clamp(1.75rem,7vw,4.2rem)] sm:text-[clamp(2.5rem,5vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] max-w-5xl transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Code Commits. <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Figure It Out Once. <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>After That, It Just Runs.</span>
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed mt-6 max-w-xl transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            zkCAP is a zero-trust commit attestation protocol combining Phala TEE execution vaults, Midnight zero-knowledge provers, and decentralized ledger state to audit, evaluate, and anchor your codebase without exposing sensitive IP.
          </p>

          {/* CTA ROW */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">

            <Link href="/terminal" className="group flex items-center justify-between sm:justify-start gap-4 bg-[#F26522] hover:bg-[#e05a1a] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 transition-all duration-300">
              <div className="flex flex-col overflow-hidden h-[20px] relative">
                <span className="transform group-hover:-translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                  Launch Interactive Terminal
                </span>
                <span className="absolute top-0 left-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                  Launch Interactive Terminal
                </span>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center transform group-hover:rotate-[-45deg] transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                <ArrowRight className="w-4 h-4 text-[#F26522]" />
              </div>
            </Link>

            <div className={`flex items-center justify-between gap-3 px-4 py-2 rounded-[4px] transition-all duration-500 cursor-default ${isDarkMode ? 'bg-white/10 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20' : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-[13px] sm:text-[14px] font-medium transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  TEE & ZK Secured
                </span>
              </div>
              <span className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded transition-colors duration-500 ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
                Active
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* MOBILE MENU OVERLAY BOTTOM SHEET           */}
      {/* ========================================== */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-500 bg-black/60 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
        <div className={`absolute bottom-0 left-0 right-0 mx-3 mb-3 p-6 rounded-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isDarkMode ? 'bg-gray-900 border border-white/10' : 'bg-white'} ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full transition-colors duration-500 ${isDarkMode ? 'text-gray-400 bg-white/10' : 'text-gray-600 bg-gray-100'}`}>
              <Clock className="w-3 h-3" />
              <span>{IndiaTime || '00:00'} India Time</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-5 mb-8">
            {['Terminal', 'Projects', 'Attestations', 'Commits', 'Prover (ZK)'].map((link) => {
              const path = link === 'Prover (ZK)' ? '/attestations' : `/${link.toLowerCase()}`;
              return (
                <Link
                  key={link}
                  href={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-[28px] sm:text-[32px] font-medium transition-colors ${isDarkMode ? 'text-white hover:text-gray-400' : 'text-gray-900 hover:text-gray-500'}`}
                >
                  {link}
                </Link>
              );
            })}
          </div>

          <Link
            href="/terminal"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center justify-between bg-[#F26522] text-white p-4 rounded-xl text-base font-medium"
          >
            <span>Launch Interactive Terminal</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

    </div>
  );
}