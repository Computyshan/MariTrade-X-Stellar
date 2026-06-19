/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  BellRing
} from 'lucide-react';

interface SidebarProps {
  user: User | null;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, onNavigateTab, onLogout }: SidebarProps) {
  const getNavItems = () => {
    const role = user?.role;
    const isTradeParty = role === UserRole.IMPORTER || role === UserRole.EXPORTER;

    const items: { id: string; label: string; icon: any; tag?: string; }[] = [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'shipments', label: 'My Shipments', icon: Ship }
    ];

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
    <aside id="dashboard-sidebar" className="w-80 bg-[#001240] text-slate-100 flex flex-col justify-between shrink-0 select-none border-r border-[#001240]/10">
      
      {/* Brand logo */}
      <div className="p-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateTab('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-[#1A66FF] flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block">Mari<span className="text-[#1A66FF]">Trade</span></span>
            <span className="block text-[9px] uppercase tracking-widest text-[#0BAFB0] font-mono leading-none">Pilipinas Portal</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="flex-1 py-6 px-4 overflow-y-auto space-y-7">
        <div>
          <span className="block px-3 text-[10px] font-bold tracking-widest uppercase text-slate-400 font-mono mb-3">MARITIME CONSOLE</span>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-tab-${item.id}`}
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#1A66FF] text-white' 
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className="text-[10px] uppercase font-bold font-mono px-1.5 py-0.5 rounded bg-[#FF5C35] text-white">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Informative widget */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0BAFB0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0BAFB0] animate-pulse"></span>
            STELLAR MAINNET ACTIVE
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Multi-signature smart escrows are working live on decentralized Stellar ledger ledger rails. Gas rate conversion: <strong className="font-mono text-white">₱56.50/USD</strong>.
          </p>
        </div>
      </div>

      {/* User profile section */}
      <div className="p-6 border-t border-white/[0.08] bg-white/[0.01] space-y-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A66FF]/20 border border-[#1A66FF]/40 flex items-center justify-center text-[#1A66FF] font-bold text-sm">
              {user.fullName.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-bold text-sm text-white truncate" title={user.fullName}>{user.fullName}</span>
              <span className="block text-[11px] text-[#0BAFB0] font-mono truncate uppercase">{user.companyName}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            id="btn-sidebar-settings"
            onClick={() => onNavigateTab('settings')}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 font-semibold transition-colors cursor-pointer"
            title="Account Settings"
          >
            <Settings size={13} />
            <span>Settings</span>
          </button>
          
          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-white/[0.04] hover:bg-[#FF5C35]/10 hover:text-[#FF5C35] text-xs text-slate-300 font-semibold transition-colors cursor-pointer"
            title="Log Out Profile"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
