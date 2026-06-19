/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shipment, ShipmentStatus, EscrowStatus, UserRole } from '../types';
import { Ship, ShieldAlert, CheckCircle2, Clock, MapPin, ArrowRight, Anchor, FileWarning } from 'lucide-react';

interface DashboardHomeProps {
  shipments: Shipment[];
  onViewShipment: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export default function DashboardHome({ shipments, onViewShipment, onNavigateTab }: DashboardHomeProps) {
  
  // Calculate stats
  const activeShipments = shipments.filter(s => 
    s.status !== ShipmentStatus.DELIVERED && 
    s.status !== ShipmentStatus.CANCELLED
  );
  
  const fundsInEscrow = shipments
    .filter(s => s.escrowStatus === EscrowStatus.FUNDED)
    .reduce((sum, s) => sum + (s.escrowAmountUSD || 0), 0);

  const deliveredThisMonth = shipments.filter(s => 
    s.status === ShipmentStatus.DELIVERED
  ).length;

  const pendingMilestones = shipments.reduce((count, s) => {
    // Milestones that are current or might need verification
    return count + (s.status === ShipmentStatus.PENDING ? 1 : 0);
  }, 0);

  // Combine milestones chronologically across all shipments to create an Activity Feed
  const allEvents = shipments.flatMap(s => 
    s.milestones.map(m => ({
      ...m,
      shipmentReference: s.referenceCode,
      shipmentDescription: s.description,
      shipmentId: s.id
    }))
  ).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  // Recent shipments (limit to 5)
  const recentShipments = shipments.slice(0, 5);

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.PENDING:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAFAF7] border border-[#E5E3DA] text-slate-500">PENDING BOOKING</span>;
      case ShipmentStatus.CONFIRMED:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] border border-[#C8DBFF] text-[#1A66FF]">CARGO CONFIRMED</span>;
      case ShipmentStatus.IN_TRANSIT:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] border border-[#C8DBFF] text-[#1A66FF] animate-pulse">🚢 IN TRANSIT</span>;
      case ShipmentStatus.AT_PORT:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">⚓ ARRIVED AT PORT</span>;
      case ShipmentStatus.CUSTOMS_CLEARANCE:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">🛃 CUSTOMS EXAMINATION</span>;
      case ShipmentStatus.OUT_FOR_DELIVERY:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#CCEFEF] border border-[#0BAFB0]/20 text-[#078384]">🚚 OUT FOR DELIVERY</span>;
      case ShipmentStatus.DELIVERED:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#CCEFEF] border border-[#0BAFB0]/20 text-[#078384]">✓ DELIVERED</span>;
      case ShipmentStatus.DISPUTED:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF2EE] border border-[#FF5C35]/20 text-[#CC3A1C]">⚠️ DISPUTED</span>;
      case ShipmentStatus.CANCELLED:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-slate-700">UNKNOWN</span>;
    }
  };

  const getEscrowBadge = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.UNFUNDED:
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-[#FAFAF7] border border-[#E5E3DA] text-slate-500">Unfunded</span>;
      case EscrowStatus.FUNDED:
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-[#CCEFEF]/40 border border-[#0BAFB0]/30 text-[#078384]">🔒 FUNDED SECURE</span>;
      case EscrowStatus.RELEASED:
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-green-50 border border-green-200 text-green-700">Released</span>;
      case EscrowStatus.DISPUTED:
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-[#FFF2EE] border border-[#FF5C35]/30 text-[#CC3A1C]">Disputed hold</span>;
      default:
        return <span className="text-slate-500 font-mono">{status}</span>;
    }
  };

  return (
    <div id="dashboard-home" className="space-y-8 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      {/* Top Banner Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#001240] tracking-tight">Vessel Operations Command</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Hello, Tyshaun Louis Siga. Track Philippine import customs clearances & Stellar multisig payouts.</p>
        </div>
        <button
          id="btn-create-shipment-dash"
          onClick={() => onNavigateTab('shipments-new')}
          className="px-4.5 py-2.5 text-sm font-semibold rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white flex items-center gap-2 self-start md:self-auto shadow-md shadow-blue-500/15 cursor-pointer"
        >
          <Ship size={16} />
          <span>Record New Shipment</span>
        </button>
      </div>

      {/* 4 Core KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active shipments */}
        <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-mono">Active Shipments</span>
            <div className="text-3xl font-extrabold text-[#001240]">{activeShipments.length}</div>
            <p className="text-[10px] text-slate-400">Cargo currently sailing or in port clearance legs</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center">
            <Ship size={20} />
          </div>
        </div>

        {/* Funds in Escrow */}
        <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-mono">Funds in Escrow</span>
            <div className="text-3xl font-extrabold text-[#0047E0]">${fundsInEscrow.toLocaleString()}</div>
            <p className="text-[10px] text-[#0BAFB0] font-semibold">≈ ₱{(fundsInEscrow * 56.5).toLocaleString()} PHP locked</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#0BAFB0]/10 text-[#0BAFB0] flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        {/* Delivered This Month */}
        <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-mono">Completed Imports</span>
            <div className="text-3xl font-extrabold text-[#001240]">{deliveredThisMonth}</div>
            <p className="text-[10px] text-slate-400">Cargo delivered safely to local warehouses</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 text-[#078384] flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Pending confirmations / actions */}
        <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-mono">Pending Escrows</span>
            <div className="text-3xl font-extrabold text-[#001240]">{pendingMilestones}</div>
            <p className="text-[10px] text-slate-400">Shipments awaiting Stellar ledger funding</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FF5C35]/15 text-[#FF5C35] flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
        </div>

      </div>

      {/* Main Content Grid: Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Recent Shipments (8/12 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E5E3DA] rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#E5E3DA] flex justify-between items-center bg-[#FAFAF7]">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Active Portside Milestones</h3>
              <p className="text-xs text-slate-500">Live overview of imports, destinations, and ledger statuses</p>
            </div>
            <button 
              onClick={() => onNavigateTab('shipments')}
              className="text-[#1A66FF] hover:text-[#0047E0] text-xs font-bold flex items-center gap-1.5"
            >
              <span>Manage Shipments</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentShipments.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FAFAF7] text-slate-400 flex items-center justify-center">
                  <Ship size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">No recorded shipments found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">Get started by logging your first maritime shipment parameters.</p>
                </div>
                <button
                  onClick={() => onNavigateTab('shipments-new')}
                  className="px-4 py-2 mt-2 rounded bg-[#1A66FF] text-white font-bold text-xs"
                >
                  Create Shipment Entry
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                  <tr>
                    <th className="py-3 px-4">Reference No.</th>
                    <th className="py-3 px-4">Origin / Route</th>
                    <th className="py-3 px-4">Status & Logistics</th>
                    <th className="py-3 px-4">Stellar Escrow</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DA]">
                  {recentShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAFAF7]/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#001240] block">{s.referenceCode}</span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[150px]">{s.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">{s.originCountry}</span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="font-semibold text-[#001240] truncate max-w-[120px]">{s.destinationPort}</span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">ETA: {s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(s.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getEscrowBadge(s.escrowStatus)}
                          <span className="block font-mono font-bold text-slate-700 text-[10px]">${s.totalValueUSD.toLocaleString()} USD</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          id={`btn-view-shipment-${s.id}`}
                          onClick={() => onViewShipment(s.id)}
                          className="px-3 py-1.5 font-bold rounded bg-[#EEF4FF] hover:bg-[#1A66FF] text-[#1A66FF] hover:text-white transition-all text-xs"
                        >
                          View Console
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Milestone Activity Feed (4/12 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E3DA] rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#E5E3DA] bg-[#FAFAF7]">
            <h3 className="font-bold text-slate-800 text-sm">Real-time Port Loggers</h3>
            <p className="text-xs text-slate-500">Live ledger transaction confirmations and vessel progress reports</p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[380px] space-y-5">
            {allEvents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-mono">No milestone activity reported yet.</p>
            ) : (
              allEvents.slice(0, 7).map((ev) => (
                <div key={ev.id} className="relative flex items-start gap-3.5 group cursor-pointer" onClick={() => onViewShipment(ev.shipmentId)}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A66FF] mt-1.5 ring-4 ring-[#EEF4FF] shrink-0"></div>
                  <div className="min-w-0 space-y-1 bg-[#FAFAF7] hover:bg-[#EEF4FF]/30 p-2.5 rounded-lg border border-[#E5E3DA] w-full transition-colors">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#1A66FF]">{ev.shipmentReference}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{new Date(ev.occurredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{ev.type.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{ev.description}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                      <span>By: {ev.loggedByName}</span>
                      <span className="uppercase tracking-widest text-[#0BAFB0] font-mono font-bold text-[8px]">{ev.loggedByRole}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
