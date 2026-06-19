/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Ship, 
  FileText, 
  Wallet, 
  Sparkles, 
  MapPin, 
  LogOut, 
  Settings,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  user: User | null;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, onNavigateTab, onLogout }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getNavItems = () => {
    const role = user?.role;
    const isTradeParty = role === UserRole.IMPORTER || role === UserRole.EXPORTER;

    const items: { id: string; label: string; icon: any; tag?: string; }[] = [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard }
    ];

    // Note: 'my shipments' is redundant for logistics users, and it was only pushed for isTradeParty.
    if (isTradeParty) {
      items.push({ id: 'shipments', label: 'My Shipments', icon: Ship });
    }

    // Documents Access: Customs Broker, Carrier, Warehouse, and Inspector/Insurer (mapped as FREIGHT_FORWARDER)
    const hasDocAccess = isTradeParty || 
      role === UserRole.CUSTOMS_BROKER || 
      role === UserRole.SHIPPING_LINE || 
      role === UserRole.WAREHOUSE || 
      role === UserRole.FREIGHT_FORWARDER;

    if (hasDocAccess) {
      items.push({ id: 'documents', label: 'BOC Documents', icon: FileText });
    }

    // Payments Access: Only Exporter and Importer
    if (isTradeParty) {
      items.push({ id: 'payments', label: 'Stellar Payments', icon: Wallet });
    }

    // AI Broker and Public tracking
    items.push({ id: 'assistance', label: 'BOC AI Broker', icon: Sparkles, tag: 'AI' });
    items.push({ id: 'public-track', label: 'Public Explorer', icon: MapPin });

    return items;
  };

  const navItems = getNavItems();

  return (
    <header className="w-full bg-[#001240] text-slate-100 shrink-0 select-none border-b border-white/[0.08] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo (Left) */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateTab('dashboard')}>
            <div className="w-8 h-8 rounded bg-[#1A66FF] flex items-center justify-center text-white font-bold text-base">
              M
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">Mari<span className="text-[#1A66FF]">Trade</span></span>
              <span className="block text-[8px] uppercase tracking-widest text-[#0BAFB0] font-mono leading-none">Pilipinas Portal</span>
            </div>
          </div>

          {/* Navigation Links (Center-Left) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-tab-${item.id}`}
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                    isActive 
                      ? 'bg-[#1A66FF] text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {item.tag && (
                    <span className="text-[8px] uppercase font-bold font-mono px-1 py-0.5 rounded bg-[#FF5C35] text-white">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & controls (Right) */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono font-bold text-[#0BAFB0] border-r border-white/[0.08] pr-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0BAFB0] animate-pulse"></span>
            STELLAR SECURE
          </div>

          {user && (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#1A66FF]/20 border border-[#1A66FF]/40 flex items-center justify-center text-[#1A66FF] font-bold text-xs shrink-0">
                  {user.fullName.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="hidden sm:block min-w-0">
                  <span className="block font-bold text-xs text-white max-w-[120px] truncate leading-tight">{user.fullName}</span>
                  <span className="block text-[9px] text-[#0BAFB0] font-mono truncate uppercase leading-none mt-0.5">{user.companyName}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hover:text-white" />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#E5E3DA] shadow-lg py-1.5 z-50 text-slate-700 animate-fade-in text-xs font-semibold">
                    <div className="px-3.5 py-2 border-b border-[#E5E3DA] bg-[#FAFAF7]">
                      <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">My Account Node</span>
                      <strong className="block text-slate-800 font-mono truncate">{user.role.replace(/_/g, ' ')}</strong>
                    </div>

                    <button
                      id="btn-sidebar-settings"
                      onClick={() => {
                        onNavigateTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-[#FAFAF7] transition text-slate-700 hover:text-slate-900"
                    >
                      <Settings size={14} className="text-slate-500" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      id="btn-sidebar-logout"
                      onClick={() => {
                        onLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition border-t border-[#E5E3DA]"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
