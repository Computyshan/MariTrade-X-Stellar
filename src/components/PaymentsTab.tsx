/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shipment, EscrowStatus, User } from '../types';
import { getAccountBalance } from '../lib/stellar';
import { Wallet, ShieldCheck, HelpCircle, Loader2, Landmark, RefreshCw } from 'lucide-react';

interface PaymentsTabProps {
  shipments: Shipment[];
  user: User | null;
  onViewShipment: (id: string) => void;
}

export default function PaymentsTab({ shipments, user, onViewShipment }: PaymentsTabProps) {
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState<{ xlm: string, usdc: string }>({ xlm: '45.20', usdc: '25,400.00' });

  const activeEscrows = shipments.filter(s => s.escrowStatus === EscrowStatus.FUNDED);
  const releasedEscrows = shipments.filter(s => s.escrowStatus === EscrowStatus.RELEASED);

  const totalLockedUSD = activeEscrows.reduce((sum, s) => sum + s.totalValueUSD, 0);
  const totalSettledUSD = releasedEscrows.reduce((sum, s) => sum + s.totalValueUSD, 0);

  const handleRefreshBalance = () => {
    if (!user?.stellarWallet) return;
    setLoadingBalance(true);
    setTimeout(async () => {
      try {
        const bal = await getAccountBalance(user.stellarWallet as string);
        setBalance(bal);
      } catch (e) {
        // Fallback
      } finally {
        setLoadingBalance(false);
      }
    }, 1200);
  };

  return (
    <div id="payments-tab" className="space-y-6 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      <div>
        <h1 className="text-2xl font-bold text-[#001240] tracking-tight">Stellar Settlement Command Center</h1>
        <p className="text-xs text-slate-500 mt-1">Manage secure multi-signature escrow pools held under stablecoin ledger rails.</p>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wallet Address & XLM */}
        <div className="bg-white border-2 border-[#E5E3DA] rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-[#1A66FF]"></div>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Connected Stellar Address</span>
              <span className="font-mono text-[11px] font-bold text-slate-700 block select-all break-all pr-2 truncate max-w-[200px]">
                {user?.stellarWallet || 'No wallet integrated'}
              </span>
            </div>
            
            <button
              onClick={handleRefreshBalance}
              disabled={loadingBalance}
              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition"
              title="Sync balance from ledger"
            >
              <RefreshCw size={14} className={loadingBalance ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#FAFAF7] p-3 rounded-lg border border-[#E5E3DA]">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">WALLET BASE RESERVATION</span>
              <strong className="text-sm font-mono text-[#1a66ff] block">{balance.xlm} XLM</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">USDC SETTLEMENT BAL</span>
              <strong className="text-sm font-mono text-slate-800 block">${parseInt(balance.usdc).toLocaleString()} USDC</strong>
            </div>
          </div>
        </div>

        {/* Current Active locked Pool */}
        <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 flex items-start justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-mono">Consolidated escrow Pool</span>
            <div className="text-2xl font-black text-[#001240]">${totalLockedUSD.toLocaleString()} USD</div>
            <p className="text-[10px] text-slate-400">Locked held securely in {activeEscrows.length} pending multi-signature contracts</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#0BAFB0]/10 text-[#0BAFB0] flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Lifetime Disbursed settled */}
        <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 flex items-start justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-mono">Disbursed to date</span>
            <div className="text-2xl font-black text-[#078384]">${totalSettledUSD.toLocaleString()} USD</div>
            <p className="text-[10px] text-slate-400">Successfully settled loops with foreign manufacturers</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Landmark size={20} />
          </div>
        </div>

      </div>

      {/* Settle ledger sheet list */}
      <div className="bg-white border border-[#E5E3DA] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E5E3DA] bg-[#FAFAF7]">
          <h3 className="font-bold text-slate-800 text-sm">Escrow Settle Status Sheets</h3>
          <p className="text-xs text-slate-500">Overview of payments registered on blockchain</p>
        </div>

        <div className="overflow-x-auto">
          {shipments.length === 0 ? (
            <p className="p-12 text-center text-xs text-slate-400 font-mono">No payment tracks requested yet.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                <tr>
                  <th className="py-3 px-4">Cargo Track ID</th>
                  <th className="py-3 px-4">Manufacturing Exporter</th>
                  <th className="py-3 px-4">Escrow Pool USD</th>
                  <th className="py-3 px-4">Stellar Tx Index</th>
                  <th className="py-3 px-4">Ledger Status</th>
                  <th className="py-3 px-3 text-right">Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAFAF7]/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#001240]">{s.referenceCode}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{s.exporterName}</td>
                    <td className="py-4 px-4 font-mono font-extrabold text-slate-800">${s.totalValueUSD.toLocaleString()} USD</td>
                    <td className="py-4 px-4 font-mono text-slate-400 truncate max-w-[150px]">{s.stellarEscrowId || 'No active lock'}</td>
                    <td className="py-4 px-4">
                      {s.escrowStatus === EscrowStatus.UNFUNDED && <span className="text-[#CC3A1C] font-mono uppercase text-[10px] font-bold">❌ Unfunded pool</span>}
                      {s.escrowStatus === EscrowStatus.FUNDED && <span className="text-[#078384] font-mono uppercase text-[10px] font-bold animate-pulse">🔒 SECURE LOCKED</span>}
                      {s.escrowStatus === EscrowStatus.RELEASED && <span className="text-green-600 font-mono uppercase text-[10px] font-bold">✓ DISPATCHED</span>}
                      {s.escrowStatus === EscrowStatus.DISPUTED && <span className="text-[#CC3A1C] font-mono uppercase text-[10px] font-bold">⚠️ FROZEN HOLD</span>}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => onViewShipment(s.id)}
                        className="px-2.5 py-1.5 font-bold rounded bg-[#EEF4FF] hover:bg-[#1A66FF] text-[#1A66FF] hover:text-white transition-all text-xs"
                      >
                        Ledger Console
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
