/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, UserCheck, Key, Copy, AlertCircle } from 'lucide-react';

interface SettingsTabProps {
  user: User | null;
  onSave: (user: User) => void;
}

export default function SettingsTab({ user, onSave }: SettingsTabProps) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [tin, setTin] = useState(user?.tinNumber || '');

  const [copiedKey, setCopiedKey] = useState(false);
  const [success, setSuccess] = useState('');

  const submitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser: User = {
      ...user,
      fullName,
      companyName,
      phoneNumber,
      tinNumber: tin
    };

    onSave(updatedUser);
    setSuccess('✓ Profile parameters updated successfully in local storage.');
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleCopySecret = () => {
    if (!user?.stellarSeed) return;
    navigator.clipboard.writeText(user.stellarSeed);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  return (
    <div id="settings-tab" className="space-y-6 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      <div>
        <h1 className="text-2xl font-bold text-[#001240] tracking-tight">Organization Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure company customs accounts, tax details, and Stellar secure wallet addresses.</p>
      </div>

      {success && (
        <div className="bg-blue-50 border border-blue-200 text-[#0047E0] text-xs font-semibold rounded-lg p-3.5 shadow-xs">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: Profile Parameters (7/12 cols) */}
        <form onSubmit={submitSettings} className="lg:col-span-7 bg-white border border-[#E5E3DA] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E3DA] pb-3 mb-2">
            <UserCheck size={16} className="text-[#1A66FF]" />
            <h3 className="font-bold text-slate-800 text-sm">Customs & Registration Profile</h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Corporate Officer Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Company Registered Name</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tax Registration TIN</label>
              <input 
                type="text" 
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm font-mono focus:outline-none"
                placeholder="000-000-000-000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Operations Contact Number</label>
            <input 
              type="text" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#E5E3DA] flex justify-end">
            <button
              id="submit-settings-button"
              type="submit"
              className="px-5 py-2.5 bg-[#001240] hover:bg-[#1A66FF] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Right pane: Wallet Keys (5/12 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5E3DA] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E3DA] pb-3 mb-2">
            <Key size={16} className="text-[#0BAFB0]" />
            <h3 className="font-bold text-slate-800 text-sm">Settlement Wallet Keys</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            These cryptographic keypairs secure your trade contracts on the decentralized Stellar blockchain. Treat secret keys with absolute secrecy.
          </p>

          <div className="space-y-4 p-4 rounded-xl bg-[#FAFAF7] border border-[#E5E3DA] text-xs">
            <div>
              <span className="block text-[10px] uppercase font-mono text-slate-500 font-bold">Public Key (Stellar Address)</span>
              <div className="flex items-center justify-between text-xs font-mono bg-white p-2 border border-[#E5E3DA] rounded-lg mt-1 select-all break-all overflow-x-auto">
                <span>{user?.stellarWallet || 'No address Integrated'}</span>
              </div>
            </div>

            {user?.stellarSeed && (
              <div>
                <span className="block text-[10px] uppercase font-mono text-[#FF5C35] font-bold">Secret Seed (Private Key)</span>
                <div className="flex items-center justify-between text-xs font-mono bg-white p-2 border border-[#E5E3DA] rounded-lg mt-1 select-all break-all overflow-x-auto text-slate-800">
                  <span className="truncate">{user.stellarSeed}</span>
                  <button
                    onClick={handleCopySecret}
                    className="p-1 hover:bg-[#FFF2EE] rounded text-[#FF5C35]"
                    title="Copy Secret Seed"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                {copiedKey && <span className="text-[10px] text-[#0BAFB0] font-bold font-mono mt-1 block">✓ Secret Copied!</span>}
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-[#FF5C35]/10 bg-[#FFF2EE] text-[11px] text-[#CC3A1C] leading-normal flex gap-2.5">
            <AlertCircle className="shrink-0 mt-0.5 text-[#FF5C35]" size={15} />
            <div>
              <strong>Trade Custody warning:</strong> MariTrade maintains deep non-custodial design compliance. Your keys exist locally in sandbox local storage—never cached server side. Lose this secret seed and you permanently lose control over multi-signature fund release thresholds.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
