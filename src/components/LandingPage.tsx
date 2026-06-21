/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ship, Anchor, ShieldCheck, FileText, ArrowRight, Sparkles, MapPin, Search } from 'lucide-react';
import { getStoredShipments } from '../utils/storage';
import { User } from '../types';

interface LandingPageProps {
  user: User | null;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onTrackLookup: (refCode: string) => void;
}

export default function LandingPage({ user, onNavigate, onTrackLookup }: LandingPageProps) {
  const [trackInput, setTrackInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    
    const shipments = getStoredShipments();
    const found = shipments.find(s => s.referenceCode.toUpperCase() === trackInput.trim().toUpperCase());
    
    if (found) {
      onTrackLookup(found.referenceCode);
    } else {
      setErrorMsg('Reference code not found in our maritime ledger. Try "MT-2026-00142" or "MT-2026-00085".');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const tryDemoTrack = (code: string) => {
    setTrackInput(code);
    onTrackLookup(code);
  };

  return (
    <div id="landing-page" className="min-h-screen bg-[#FAFAF7] text-slate-900 font-sans flex flex-col selection:bg-maritime-100 selection:text-maritime-900">
      
      {/* Dynamic Header */}
      <header className="border-b border-[#E5E3DA] bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-10 h-10 rounded-lg bg-[#1A66FF] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/10">
              M
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#001240]">Mari<span className="text-[#1A66FF]">Trade</span></span>
              <span className="block text-[10px] uppercase tracking-widest text-[#0BAFB0] font-mono leading-none">Pilipinas Escrow</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#1A66FF] transition-colors">Key Features</a>
            <a href="#how-it-works" className="hover:text-[#1A66FF] transition-colors">How It Works</a>
            <a href="#demo-section" className="hover:text-[#1A66FF] transition-colors">Live Track Lookup</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-xs text-slate-500 hidden sm:inline-block max-w-[150px] truncate">
                  Logged as: <strong className="text-slate-800">{user.fullName}</strong>
                </span>
                <button 
                  id="btn-dashboard-header"
                  onClick={() => onNavigate(user.stellarWallet ? 'dashboard' : 'onboarding')}
                  className="px-4 py-2 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white text-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  Go to Console &rarr;
                </button>
                <button 
                  id="btn-logout-header"
                  onClick={() => onNavigate('logout')}
                  className="text-sm font-semibold text-rose-600 hover:text-rose-700 px-3 py-2 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  id="btn-login-header"
                  onClick={() => onNavigate('login')}
                  className="text-sm font-semibold text-slate-700 hover:text-[#1A66FF] px-4 py-2 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button 
                  id="btn-register-header"
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:translate-y-[-1px] cursor-pointer"
                >
                  Register Account &rarr;
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden px-6 bg-gradient-to-b from-[#FAFAF7] via-white to-sky-50/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#EEF4FF] border border-[#C8DBFF] text-[#1A66FF] font-mono text-xs px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-[#1A66FF] animate-pulse"></span>
              Stellar Blockchain Escrow Active 🇵🇭
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#001240] tracking-tight leading-tight">
              Your cargo, <br className="hidden sm:block" />
              every step of the way.
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
              MariTrade gives Filipino small business importers real-time shipment milestone tracking 
              and Stellar blockchain-secured payment protection. Built for how Philippine logistics, 
              BOC custom clearing, and international trade actually work.
            </p>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              {user ? (
                <button 
                  id="btn-hero-cta"
                  onClick={() => onNavigate(user.stellarWallet ? 'dashboard' : 'onboarding')}
                  className="px-6 py-4 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white font-semibold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-between gap-3 text-center cursor-pointer"
                >
                  <span>Launch Operations Console</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  id="btn-hero-cta"
                  onClick={() => onNavigate('register')}
                  className="px-6 py-4 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white font-semibold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-between gap-3 text-center cursor-pointer"
                >
                  <span>Start Importing Smarter</span>
                  <ArrowRight size={18} />
                </button>
              )}
              
              <a 
                href="#demo-section" 
                className="px-6 py-4 rounded-lg border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-700 font-semibold text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Track a Shipment
              </a>
            </div>

            {/* Hint / Sample References */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono mt-2">
              <span>Quick demo reference lookups:</span>
              <button 
                onClick={() => tryDemoTrack('MT-2026-00142')}
                className="px-2.5 py-1 rounded bg-[#E5E3DA] hover:bg-[#1A66FF] hover:text-white transition-all text-slate-700 font-semibold font-mono"
              >
                MT-2026-00142 (In Transit)
              </button>
              <button 
                onClick={() => tryDemoTrack('MT-2026-00085')}
                className="px-2.5 py-1 rounded bg-[#E5E3DA] hover:bg-[#1A66FF] hover:text-white transition-all text-slate-700 font-semibold font-mono"
              >
                MT-2026-00085 (Customs)
              </button>
            </div>
          </div>

          {/* Graphical Dashboard Widget Previews */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="absolute inset-0 bg-[#0BAFB0]/5 rounded-3xl blur-3xl transform rotate-6"></div>
            
            <div className="relative bg-white border border-[#E5E3DA] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#E5E3DA] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0BAFB0]"></div>
                  <span className="font-mono text-xs font-semibold text-slate-500">LEDGER ESCROW STATUS</span>
                </div>
                <span className="text-[10px] bg-[#EEF4FF] text-[#1A66FF] px-2 py-0.5 rounded font-mono font-bold">MULTISIG v1.2</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAFAF7] border border-[#E5E3DA] rounded-xl p-4">
                <div>
                  <span className="text-xs text-slate-500 block">Locked Escrow Pool</span>
                  <span className="text-2xl font-bold text-[#001240]">$12,500.00</span>
                  <span className="text-xs text-slate-400 block mt-0.5">≈ ₱706,250.00 PHP</span>
                </div>
                <div className="w-12 h-12 bg-[#0BAFB0]/10 rounded-full flex items-center justify-center text-[#0BAFB0]">
                  <ShieldCheck size={26} />
                </div>
              </div>

              {/* Steps status indicator */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0BAFB0] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Shenzhen Warehouse Clearance</p>
                    <p className="text-[10px] text-slate-500">Verified by Warehouse Ops • June 12</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0BAFB0] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Vessel Departed Origin Port</p>
                    <p className="text-[10px] text-slate-500">Ever Glory v104 Departed • June 15</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-[#1A66FF] flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#1A66FF] animate-pulse"></span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A66FF]">Customs Transit Filing (Manila MICP)</p>
                    <p className="text-[10px] text-indigo-500 font-semibold">Active Milestone Verification Pending</p>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center text-[11px] font-mono text-slate-400">
                Escrow payouts release automatically only when final milestone is verified.
              </div>
            </div>
          </div>

        </div>

        {/* Waves CSS bottom deco */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden h-12 pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-8 text-[#CCEFEF]/40 fill-current animate-pulse">
            <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1300,20 1400,60 L1400,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Philippine-specific local callout banner */}
      <section className="bg-[#001240] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="text-4xl text-white">🇵🇭</span>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Tailored Specifically for Philippine Importers</h3>
              <p className="text-slate-300 text-sm max-w-xl mt-1">
                Supports automatic bureau conversion, Bureau of Customs (BOC) SAD form autofills, 
                Manila, Cebu, and Davao port specific regulations, and local notifications in Tagalog.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('register')}
            className="px-5 py-3 rounded-lg bg-[#FF5C35] hover:bg-[#CC3A1C] text-white font-semibold text-sm transition-all shadow-md shrink-0 cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Features bento-like grid */}
      <section id="features" className="py-24 px-6 bg-white border-y border-[#E5E3DA]">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-[#0BAFB0] font-bold">Uncompromising Quality</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#001240] tracking-tight">
            Designed for secure, stress-free imports.
          </h2>
          <p className="text-slate-600 max-w-xl text-sm md:text-base">
            No more endless WhatsApp calls to forwarders or blind money transfers to exporters. 
            MariTrade integrates payments and tracking.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-8 rounded-xl border border-[#E5E3DA] bg-[#FAFAF7] hover:border-[#1A66FF] transition-all flex flex-col gap-4">
            <div className="w-12 h-14 rounded-lg bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center mb-2">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#001240]">🔒 Escrow Protection</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your payment is held securely in an independent multisig pool on the Stellar blockchain. 
              Funds are automatically released to the exporter only when destination port and logistics 
              agents verify milestone deliveries.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-xl border border-[#E5E3DA] bg-[#FAFAF7] hover:border-[#1A66FF] transition-all flex flex-col gap-4">
            <div className="w-12 h-14 rounded-lg bg-[#0BAFB0]/10 text-[#0BAFB0] flex items-center justify-center mb-2">
              <Ship size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#001240]">📍 Live Cargo Milestones</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Logistics contributors—freight forwarders, warehouse staff, customs brokers, and truckers 
              log milestone actions directly. See exactly where your items are located at every leg of transit.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-xl border border-[#E5E3DA] bg-[#FAFAF7] hover:border-[#1A66FF] transition-all flex flex-col gap-4">
            <div className="w-12 h-14 rounded-lg bg-[#FF5C35]/10 text-[#FF5C35] flex items-center justify-center mb-2">
              <FileText size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#001240]">📄 Smart Customs Filing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Store Bill of Lading, Commercial Invoice, Packing List and SPS permit versions in one secured record. 
              Avoid expensive demurrage and warehouse storage fees due to missing paperwork.
            </p>
          </div>

        </div>
      </section>

      {/* How it works simple flow */}
      <section id="how-it-works" className="py-24 px-6 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-[#1A66FF] font-bold font-mono">FLOW PROTOCOL</span>
          <h2 className="text-3xl font-bold text-[#001240] tracking-tight">The Escrow-Tracking Lifecycle</h2>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          <div className="relative group p-6 bg-white border border-[#E5E3DA] rounded-xl flex flex-col gap-3">
            <span className="absolute -top-4 left-6 bg-[#1A66FF] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm">1</span>
            <h4 className="font-bold text-slate-800 mt-2">Log Cargo Details</h4>
            <p className="text-xs text-slate-500">
              Input shipment origin, destination port, estimated cargo valuation, and import specs in the dashboard.
            </p>
          </div>

          <div className="relative group p-6 bg-white border border-[#E5E3DA] rounded-xl flex flex-col gap-3">
            <span className="absolute -top-4 left-6 bg-[#1A66FF] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm">2</span>
            <h4 className="font-bold text-slate-800 mt-2">Fund Stellar Ledger</h4>
            <p className="text-xs text-slate-500">
              Lock payment in USDC securely inside Stellar ledger. Rate conversions show indicative local Philippine Pesos instantly.
            </p>
          </div>

          <div className="relative group p-6 bg-white border border-[#E5E3DA] rounded-xl flex flex-col gap-3">
            <span className="absolute -top-4 left-6 bg-[#1A66FF] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm">3</span>
            <h4 className="font-bold text-slate-800 mt-2">Verify Milestone Legs</h4>
            <p className="text-xs text-slate-500">
              Forwarders and port customs file updates. Real-time Map and milestones loggers show dynamic updates.
            </p>
          </div>

          <div className="relative group p-6 bg-white border border-[#E5E3DA] rounded-xl flex flex-col gap-3">
            <span className="absolute -top-4 left-6 bg-[#0BAFB0] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm">4</span>
            <h4 className="font-bold text-slate-800 mt-2">Release and Deliver</h4>
            <p className="text-xs text-slate-500">
              Once delivered safely at your local warehouse, escrow registers release commands, triggering payment to the global seller.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive Public Tracker Search Box area */}
      <section id="demo-section" className="py-20 px-6 bg-white border-t border-[#E5E3DA]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="w-12 h-12 bg-[#FF5C35]/10 rounded-full flex items-center justify-center text-[#FF5C35]">
            <MapPin size={24} />
          </div>
          <h2 className="text-3xl font-bold text-[#001240] tracking-tight">Try Live Tracking Lookup</h2>
          <p className="text-slate-600 text-sm max-w-lg mb-2">
            No login required to view. Easily share links with your distribution partners, warehouses, and relatives.
          </p>

          <form onSubmit={handleTrackSubmit} className="w-full flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                id="inp-tracking-landing"
                type="text"
                placeholder="Enter Shipment Reference (e.g. MT-2026-00142)"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-lg border border-[#E5E3DA] bg-[#FAFAF7] font-mono text-sm focus:outline-none focus:border-[#1A66FF] transition-all"
              />
            </div>
            <button 
              id="btn-track-lookup-landing"
              type="submit"
              className="px-6 py-4 rounded-lg bg-[#001240] hover:bg-[#1A66FF] text-white font-semibold text-sm transition-all shrink-0 cursor-pointer"
            >
              Search Registry &rarr;
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs font-semibold text-[#FF5C35] font-mono mt-2 animate-bounce">
              ⚠️ {errorMsg}
            </p>
          )}

          <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500 justify-center">
            <span>Or click simulation presets:</span>
            <button type="button" onClick={() => tryDemoTrack('MT-2026-00142')} className="text-[#1A66FF] hover:underline">China-Manila Active</button>
            <button type="button" onClick={() => tryDemoTrack('MT-2026-00085')} className="text-[#1A66FF] hover:underline">Vietnam-Cebu Customs</button>
            <button type="button" onClick={() => tryDemoTrack('MT-2026-00210')} className="text-[#1A66FF] hover:underline">Taiwan-Davao Completed</button>
          </div>
        </div>
      </section>

      {/* Gorgeous Footer */}
      <footer className="border-t border-[#E5E3DA] bg-[#001240] text-slate-300 py-16 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1A66FF] flex items-center justify-center text-white font-bold text-lg">M</div>
              <span className="font-bold text-lg tracking-tight text-white">MariTrade</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Securing supply chain routes for Filipino SME traders. Backed by verified milestone mechanics and integrated decentralised escrow payment ledgers.
            </p>
            <span className="text-[11px] font-mono text-slate-500">© 2026 MariTrade Technologies Co. Philippines. All rights reserved.</span>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4 font-mono">Platform</h5>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('login')} className="hover:text-white">Sign In Gateway</button></li>
              <li><button onClick={() => onNavigate('register')} className="hover:text-white">Register Account</button></li>
              <li><a href="#demo-section" className="hover:text-white">Public Tracker Search</a></li>
              <li><button onClick={() => onNavigate('register')} className="hover:text-white">Request Broker Demo</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4 font-mono">Philippine Trade Links</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="https://customs.gov.ph" target="_blank" rel="noreferrer" className="hover:text-white">Bureau of Customs (BOC)</a></li>
              <li><a href="https://dti.gov.ph" target="_blank" rel="noreferrer" className="hover:text-white">Department of Trade (DTI)</a></li>
              <li><span className="block text-slate-500">Stellar Stellar Chain Mainnet Active</span></li>
              <li><span className="block text-slate-500 font-mono text-[10px]">v1.2.0-SME-Beta</span></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
