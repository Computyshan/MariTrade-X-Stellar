/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shipment, ShipmentStatus, EscrowStatus, MilestoneType, DocumentType, UserRole, User } from '../types';
import { 
  logMilestoneInStorage, 
  uploadDocumentInStorage, 
  updateShipmentInStorage,
  canLogMilestone
} from '../utils/storage';
import { 
  Ship, 
  Clock, 
  CheckCircle2, 
  Anchor, 
  Lock, 
  Unlock, 
  FileText, 
  Upload, 
  PlusCircle, 
  Globe, 
  ArrowLeft, 
  HelpCircle,
  Activity,
  UserCheck,
  Compass,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ShipmentDetailProps {
  shipmentId: string;
  user: User | null;
  onBack: () => void;
  onUpdate: () => void; // Trigger list reload
}

export default function ShipmentDetail({ shipmentId, user, onBack, onUpdate }: ShipmentDetailProps) {
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  
  // Modals & Panels toggle
  const [showLogMilestone, setShowLogMilestone] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [showStellarLedger, setShowStellarLedger] = useState(false);
  
  // Forms states
  const [newMilestoneType, setNewMilestoneType] = useState<MilestoneType>(MilestoneType.BOOKING_CONFIRMED);
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>(DocumentType.COMMERCIAL_INVOICE);
  const [newDocName, setNewDocName] = useState('');
  
  // Simulators loading states
  const [fundingEscrow, setFundingEscrow] = useState(false);
  const [releasingEscrow, setReleasingEscrow] = useState(false);
  const [disputingEscrow, setDisputingEscrow] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Fetch from storage
  React.useEffect(() => {
    const raw = localStorage.getItem('maritrade_shipments');
    if (raw) {
      const arr = JSON.parse(raw) as Shipment[];
      const found = arr.find(s => s.id === shipmentId);
      if (found) {
        setActiveShipment(found);
      }
    }
  }, [shipmentId]);

  // Automatically point to the next milestone that needs logging
  React.useEffect(() => {
    if (activeShipment) {
      const sequence = [
        MilestoneType.BOOKING_CONFIRMED,
        MilestoneType.CARGO_RECEIVED_WAREHOUSE,
        MilestoneType.CARGO_PACKED_READY,
        MilestoneType.VESSEL_DEPARTED,
        MilestoneType.CONTAINER_LOADED,
        MilestoneType.VESSEL_ARRIVED_DESTINATION,
        MilestoneType.CUSTOMS_ENTRY_FILED,
        MilestoneType.CUSTOMS_CLEARED,
        MilestoneType.CARGO_PICKED_UP,
        MilestoneType.DELIVERED
      ];
      const nextMilestone = sequence.find(
        m => !activeShipment.milestones.some(logged => logged.type === m)
      ) || MilestoneType.BOOKING_CONFIRMED;
      setNewMilestoneType(nextMilestone);
    }
  }, [activeShipment?.milestones?.length, shipmentId]);

  if (!activeShipment) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        ⚠️ Shipment manifest not found or deleted from storage.
      </div>
    );
  }

  const triggerToast = (text: string, isError = false) => {
    if (isError) {
      setErrorToast(text);
      setTimeout(() => setErrorToast(''), 5000);
    } else {
      setSuccessToast(text);
      setTimeout(() => setSuccessToast(''), 5000);
    }
  };

  const handleFundEscrow = () => {
    setFundingEscrow(true);
    setErrorToast('');
    
    // Simulate Stellar network multisig funding process
    setTimeout(() => {
      const updated = updateShipmentInStorage(activeShipment.id, {
        escrowStatus: EscrowStatus.FUNDED,
        stellarEscrowId: `tx_escrow_${Math.random().toString(16).substring(2, 16)}`,
        status: activeShipment.status === ShipmentStatus.PENDING ? ShipmentStatus.CONFIRMED : activeShipment.status
      });
      if (updated) {
        setActiveShipment(updated);
        onUpdate();
        triggerToast('🔒 Escrow locked! Stellar Account successfully funded in USDC. Hash broadcast to network.');
      }
      setFundingEscrow(false);
    }, 2000);
  };

  const handleReleaseEscrow = () => {
    setReleasingEscrow(true);
    
    // Simulate Stellar final multisig release
    setTimeout(() => {
      const updated = updateShipmentInStorage(activeShipment.id, {
        escrowStatus: EscrowStatus.RELEASED,
        status: ShipmentStatus.DELIVERED
      });
      if (updated) {
        setActiveShipment(updated);
        onUpdate();
        triggerToast('🎉 Escrow released! USDC funds dispatched directly to manufacturing seller account.');
      }
      setReleasingEscrow(false);
    }, 2000);
  };

  const handleDisputeEscrow = () => {
    setDisputingEscrow(true);
    setTimeout(() => {
      const updated = updateShipmentInStorage(activeShipment.id, {
        escrowStatus: EscrowStatus.DISPUTED,
        status: ShipmentStatus.DISPUTED
      });
      if (updated) {
        setActiveShipment(updated);
        onUpdate();
        triggerToast('🚨 Dispute filed! Stellar escrow lock frozen. Platform arbitrators notified.', true);
      }
      setDisputingEscrow(false);
    }, 1500);
  };

  const submitMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneDesc.trim()) {
      triggerToast('Please type a descriptive log for this milestone event.', true);
      return;
    }

    const check = canLogMilestone(activeShipment, newMilestoneType);
    if (!check.allowed && check.reason) {
      triggerToast(check.reason, true);
      return;
    }

    const updated = logMilestoneInStorage(
      activeShipment.id,
      { name: user?.fullName || 'Customs Forwarder Agent', role: user?.role || UserRole.FREIGHT_FORWARDER },
      newMilestoneType,
      newMilestoneDesc
    );

    if (updated) {
      setActiveShipment(updated);
      onUpdate();
      setShowLogMilestone(false);
      setNewMilestoneDesc('');
      triggerToast('🚢 Verified milestone milestone logged and compiled onto shipment journal.');
    }
  };

  const submitDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      triggerToast('Please name the file being compiled.', true);
      return;
    }

    const updated = uploadDocumentInStorage(
      activeShipment.id,
      newDocType,
      newDocName,
      '#',
      user?.fullName || 'Importer System'
    );

    if (updated) {
      setActiveShipment(updated);
      onUpdate();
      setShowUploadDoc(false);
      setNewDocName('');
      triggerToast('📄 Document compiled! File hash locked in shipment document repository.');
    }
  };

  const getStatusBanner = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.PENDING:
        return 'Ready for Stellar funding. Send USDC to lock payment pool.';
      case ShipmentStatus.CONFIRMED:
        return 'Booking confirmed. Exporter preparing factory loading.';
      case ShipmentStatus.IN_TRANSIT:
        return 'Ocean carrier is steaming towards destination. Live monitoring active.';
      case ShipmentStatus.AT_PORT:
        return 'Vessel anchored. Discharging cargo container yard.';
      case ShipmentStatus.CUSTOMS_CLEARANCE:
        return 'Customs Single Administrative Document (SAD) filed with Philippine BOC.';
      case ShipmentStatus.OUT_FOR_DELIVERY:
        return 'Commercial truck dispatched for importer warehouse door-to-door delivery.';
      case ShipmentStatus.DELIVERED:
        return 'Successfully completed loop. Escrow released. Cargo in hand.';
      case ShipmentStatus.DISPUTED:
        return 'Held in active dispute resolution.';
      default:
        return 'Monitor shipping legs below.';
    }
  };

  // Vertical milestone tracker states
  const milestonesOrder = [
    MilestoneType.BOOKING_CONFIRMED,
    MilestoneType.CARGO_RECEIVED_WAREHOUSE,
    MilestoneType.CARGO_PACKED_READY,
    MilestoneType.VESSEL_DEPARTED,
    MilestoneType.CONTAINER_LOADED,
    MilestoneType.VESSEL_ARRIVED_DESTINATION,
    MilestoneType.CUSTOMS_ENTRY_FILED,
    MilestoneType.CUSTOMS_CLEARED,
    MilestoneType.CARGO_PICKED_UP,
    MilestoneType.DELIVERED
  ];

  return (
    <div id="shipment-detail-view" className="space-y-8 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      {/* Header and Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E3DA] pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 border border-[#E5E3DA] hover:bg-[#F2F1EC] text-slate-700 rounded-lg transition shrink-0 cursor-pointer"
            title="Return to List"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-extrabold text-[#001240]">{activeShipment.referenceCode}</span>
              <span className="text-[10px] bg-[#EEF4FF] text-[#1A66FF] px-2 py-0.5 rounded uppercase tracking-wider font-mono font-bold">Maritime Track</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">{activeShipment.description}</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/?track=${activeShipment.referenceCode}`);
              triggerToast('✓ Shareable tracking link copied to clipboard!');
            }}
            className="px-3 py-1.5 border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            Share Public Card
          </button>

          {activeShipment.stellarEscrowId && (
            <button
              onClick={() => setShowStellarLedger(true)}
              className="px-3.5 py-1.5 bg-[#001240] hover:bg-[#1A66FF] text-white rounded-lg text-xs font-bold transition font-mono flex items-center gap-2 cursor-pointer"
            >
              <Globe size={13} />
              <span>Stellar Ledger Info</span>
            </button>
          )}
        </div>
      </div>

      {/* Warnings / Status Banners */}
      <div className="p-4 bg-[#EEF4FF] border border-[#C8DBFF] rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center shrink-0">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider font-mono font-bold text-slate-500">CORRIDOR COMMAND STATUS</span>
            <p className="text-sm font-bold text-[#001240]">{getStatusBanner(activeShipment.status)}</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="block text-slate-500 uppercase font-mono">Target ETA</span>
          <span className="font-mono font-bold text-slate-800">{activeShipment.estimatedArrival ? new Date(activeShipment.estimatedArrival).toLocaleDateString() : 'Pending'}</span>
        </div>
      </div>

      {/* Success / Error notification toasts */}
      {successToast && (
        <div className="bg-[#EEF4FF] border border-[#0BAFB0]/30 text-slate-800 text-xs font-semibold rounded-lg p-3.5 shadow-md flex gap-2 animate-bounce">
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="bg-[#FFF2EE] border border-[#FF5C35]/30 text-[#CC3A1C] text-xs font-semibold rounded-lg p-3.5 shadow-md flex gap-2">
          <span>⚠️</span>
          <span>{errorToast}</span>
        </div>
      )}

      {/* Dual Layout Columns: Left Milestone Timeline, Right Payment Escrow Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: TIMELINE COMMANDS (60% equivalent: 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E3DA] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E5E3DA] pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Maritime Leg Logs</h3>
              <p className="text-xs text-slate-500">Sequential milestone verifications filed by transit forwarders</p>
            </div>
            
            {/* Importers or Portside agents can update transit milestones */}
            <button
              id="btn-trigger-log-milestone"
              onClick={() => setShowLogMilestone(!showLogMilestone)}
              className="text-[#1A66FF] hover:text-[#0047E0] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Log Milestone Update</span>
            </button>
          </div>

          {/* Interactive Milestone logger form */}
          {showLogMilestone && (
            <form onSubmit={submitMilestone} className="p-4 rounded-xl border border-[#C8DBFF] bg-[#EEF4FF]/30 space-y-4 animate-fade-in">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0047E0] font-mono flex items-center gap-1.5">
                <Activity size={12} />
                <span>Log Verified Cargo Port Update</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Port Leg Target</label>
                  <select
                    value={newMilestoneType}
                    onChange={(e) => setNewMilestoneType(e.target.value as MilestoneType)}
                    className="w-full p-2 rounded border border-[#E5E3DA] text-xs bg-white"
                  >
                    {milestonesOrder.map(m => (
                      <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Logging Identity Profile</label>
                  <div className="p-2 rounded border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-600">
                    Logged as: {user?.fullName} ({user?.role})
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Factual Cargo Status Description</label>
                <input
                  type="text"
                  placeholder="e.g. Container WHL-9238 discharged onto Cebu warehouse stack C..."
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  className="w-full p-2 rounded border border-[#E5E3DA] text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold">
                <button type="button" onClick={() => setShowLogMilestone(false)} className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded bg-[#1A66FF] text-white">Broadcast Event update</button>
              </div>
            </form>
          )}

          {/* Milestone timeline display element */}
          <div className="space-y-6 relative pl-6 border-l-2 border-[#E5E3DA]">
            {milestonesOrder.map((mType) => {
              // Check if actual logged milestone matches this type
              const loggedMatches = activeShipment.milestones.filter(m => m.type === mType);
              const isComp = loggedMatches.length > 0;
              
              // Simple logic for "Current active"
              // The current active is the latest completed step, or the next upcoming step if none
              const loggedTypes = activeShipment.milestones.map(m => m.type);
              const currentLegIndex = milestonesOrder.findIndex(mt => !loggedTypes.includes(mt));
              const isCurrent = milestonesOrder[currentLegIndex] === mType;

              return (
                <div key={mType} className="relative group">
                  
                  {/* Circle status mark */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isComp 
                      ? 'bg-[#0BAFB0] border-[#0BAFB0]' 
                      : isCurrent 
                        ? 'bg-white border-[#1A66FF] text-[#1A66FF] shadow shadow-blue-500/30' 
                        : 'bg-white border-[#E5E3DA]'
                  }`}>
                    {isComp && <span className="text-white text-[9px] font-bold">✓</span>}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#1A66FF] animate-pulse"></span>}
                  </div>

                  {/* Body Content */}
                  <div className={`space-y-1.5 p-3 rounded-lg border transition-colors ${
                    isComp 
                      ? 'border-[#0BAFB0]/20 bg-[#F0FAFA]/40' 
                      : isCurrent 
                        ? 'border-[#1A66FF]/30 bg-[#EEF4FF]/10' 
                        : 'border-transparent'
                  }`}>
                    <div className="flex justify-between items-center">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${
                        isComp 
                          ? 'text-[#078384]' 
                          : isCurrent 
                            ? 'text-[#1A66FF]' 
                            : 'text-slate-400'
                      }`}>
                        {mType.replace(/_/g, ' ')}
                      </h4>
                      {isCurrent && (
                        <span className="text-[9px] font-mono bg-[#1A66FF] text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">
                          Command Target
                        </span>
                      )}
                    </div>

                    {isComp ? (
                      <div className="space-y-1.5">
                        {loggedMatches.map((lm) => (
                          <div key={lm.id} className="text-xs text-slate-700 bg-white border border-[#E5E3DA] p-3 rounded-xl space-y-1">
                            <p className="font-semibold">{lm.description}</p>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-50 mt-1">
                              <span>By: {lm.loggedByName} ({lm.loggedByRole.toLowerCase().replace(/_/g, ' ')})</span>
                              <span>{new Date(lm.occurredAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">Verification pending for this shipping leg.</p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: STELLAR ESCROW PANEL (40% equivalent: 5 cols) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          {/* Main Escrow Box */}
          <div className="bg-white border-2 border-[#E5E3DA] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#001240]"></div>

            <div className="flex justify-between items-center border-b border-[#E5E3DA] pb-4">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-[#0BAFB0]" />
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-mono">STELLAR ESCROW REGISTRY</span>
              </div>
              <span className="text-[10px] bg-[#EEF4FF] text-[#1A66FF] px-2 py-0.5 rounded font-mono font-bold">MULTISIG POOL v1.0</span>
            </div>

            <div className="py-6 space-y-4">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-mono">Consolidated Safe Fund</span>
                <span className="text-3xl font-extrabold text-[#001240] block">${activeShipment.totalValueUSD.toLocaleString()} USD</span>
                <span className="text-xs text-[#0BAFB0] font-semibold block mt-0.5">≈ ₱{(activeShipment.totalValueUSD * 56.5).toLocaleString()} PHP (Indicative Price conversion)</span>
              </div>

              {/* Escrow status logs inside visual boxes */}
              <div className="p-4 bg-[#FAFAF7] border border-[#E5E3DA] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-mono text-slate-400 block font-bold">Consolidated Pool Status</span>
                  <span className="text-sm font-bold text-slate-800 uppercase font-mono mt-1 block">
                    {activeShipment.escrowStatus === EscrowStatus.UNFUNDED && '🔴 Unfunded Ledger'}
                    {activeShipment.escrowStatus === EscrowStatus.FUNDED && '🟢 Funded & Locked'}
                    {activeShipment.escrowStatus === EscrowStatus.RELEASED && '🔵 Dispatched to Seller'}
                    {activeShipment.escrowStatus === EscrowStatus.DISPUTED && '🚨 Locked holding dispute'}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activeShipment.escrowStatus === EscrowStatus.FUNDED 
                    ? 'bg-[#0BAFB0]/10 text-[#0BAFB0]' 
                    : activeShipment.escrowStatus === EscrowStatus.RELEASED 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {activeShipment.escrowStatus === EscrowStatus.FUNDED ? <Lock size={18} /> : <Unlock size={18} />}
                </div>
              </div>

              {/* Action buttons depending on client roles and status */}
              <div className="space-y-3.5 pt-3">
                {activeShipment.escrowStatus === EscrowStatus.UNFUNDED && (
                  <div>
                    {user?.role === UserRole.IMPORTER ? (
                      <button
                        id="btn-trigger-fund-escrow"
                        onClick={handleFundEscrow}
                        disabled={fundingEscrow}
                        className="w-full py-3 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] disabled:bg-slate-300 text-white font-bold text-sm transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        {fundingEscrow ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Generating Stellar payload...</span>
                          </>
                        ) : (
                          <>
                            <span>Fund Safe Escrow Ledger</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium text-center italic">
                        🔴 Awaiting Importer to deposit and fund the safety Stellar pool.
                      </div>
                    )}
                  </div>
                )}

                {activeShipment.escrowStatus === EscrowStatus.FUNDED && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#EEF4FF] border border-[#C8DBFF] text-[11px] text-[#0047E0] rounded-lg">
                      🔒 Escrow funds are locked securely under Stellar multisig contracts. Importers seal final verification upon successful trucker arrival to trigger dispatch.
                    </div>
                    
                    {/* Importer role release tool */}
                    {user?.role === UserRole.IMPORTER || user?.role === UserRole.EXPORTER ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          id="btn-dispute-escrow"
                          onClick={handleDisputeEscrow}
                          disabled={disputingEscrow}
                          className="py-2.5 rounded-lg border border-[#FF5C35]/30 hover:bg-[#FFF2EE] text-[#CC3A1C] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          File Dispute
                        </button>
                        <button
                          id="btn-release-escrow"
                          onClick={handleReleaseEscrow}
                          disabled={releasingEscrow}
                          className="py-2.5 rounded-lg bg-[#0BAFB0] hover:bg-[#078384] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-teal-500/10"
                        >
                          {releasingEscrow ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <span>Release Payments ✓</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium text-center italic">
                        Only Trade Parties (Importer/Exporter) have permissions to file disputes or release payments.
                      </div>
                    )}
                  </div>
                )}

                {activeShipment.escrowStatus === EscrowStatus.RELEASED && (
                  <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium text-center">
                    ✓ Transmitted. $ {activeShipment.totalValueUSD.toLocaleString()} USDC settled successfully on Stellar Mainnet ledger ledger index.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white border border-[#E5E3DA] rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-[#E5E3DA] pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Compiled Paperwork Repo</h3>
              <button
                id="btn-trigger-upload-doc"
                onClick={() => setShowUploadDoc(!showUploadDoc)}
                className="text-[#1A66FF] hover:text-[#0047E0] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Upload size={13} />
                <span>Compile New Document</span>
              </button>
            </div>

            {/* Document upload drawer helper */}
            {showUploadDoc && (
              <form onSubmit={submitDocument} className="p-4 rounded-xl border border-[#CCEFEF] bg-[#F0FAFA]/50 space-y-3 animate-fade-in text-xs">
                <h4 className="font-extrabold uppercase tracking-wider text-[#078384] font-mono flex items-center gap-1">
                  <FileText size={12} />
                  <span>Attach Document to Cargo Ledger</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Doc Target Type</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                      className="w-full p-2 border border-[#E5E3DA] rounded bg-white"
                    >
                      {Object.keys(DocumentType).map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Local Filename</label>
                    <input
                      type="text"
                      placeholder="e.g. B_L_EGL_8820.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full p-2 border border-[#E5E3DA] rounded bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 font-bold">
                  <button type="button" onClick={() => setShowUploadDoc(false)} className="px-2.5 py-1 text-slate-500 hover:text-slate-800">Cancel</button>
                  <button type="submit" className="px-3.5 py-1 rounded bg-[#0BAFB0] text-white">Save document</button>
                </div>
              </form>
            )}

            {/* Doc lists */}
            <div className="space-y-3">
              {activeShipment.documents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-mono">
                  No documents compiled. Ensure bills of lading and invoices are uploaded before port transit.
                </div>
              ) : (
                activeShipment.documents.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-lg border border-[#E5E3DA] flex items-center justify-between gap-3 text-xs bg-[#FAFAF7]">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">{doc.type.replace(/_/g, ' ')}</h5>
                        <p className="text-slate-500 truncate max-w-[180px] font-mono text-[10px]" title={doc.fileName}>{doc.fileName}</p>
                        <span className="block text-[9px] text-slate-400 leading-none mt-1">Uploaded by: {doc.uploadedByName}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 font-mono text-[10px]">
                      <span className="bg-[#EEF4FF] text-[#1A66FF] px-2 py-0.5 rounded font-bold font-mono">
                        v{doc.version}
                      </span>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); triggerToast(`✓ Download for ${doc.fileName} triggered simulation.`); }}
                        className="text-[#1A66FF] hover:underline hover:font-bold"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Stellar Ledger detailed Simulator popup/drawer */}
      {showStellarLedger && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-lg bg-[#001240] text-slate-100 border border-white/[0.08] p-6 rounded-2xl space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-[#0BAFB0]">
                <Globe size={18} />
                <h3 className="font-bold text-base font-mono">Simulated Horizon Stellar Explorer</h3>
              </div>
              <button 
                onClick={() => setShowStellarLedger(false)} 
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-2">
                <span className="text-[10px] text-slate-400 block font-bold">STELLAR TRANSACTION HASH</span>
                <span className="text-white text-[11px] block select-all break-all">{activeShipment.stellarEscrowId || 'None'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold">MULTISIG STATUS</span>
                  <span className="text-[#0BAFB0] font-bold block mt-1">SME-Active Threshold 2/3</span>
                </div>
                <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold">ASSET CLASS</span>
                  <span className="text-[#1A66FF] font-bold block mt-1">USDC Stablecoin</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-3">
                <span className="text-[10px] text-slate-400 block font-bold">ESCROW CONSENSUS PARTICIPANTS</span>
                <div className="space-y-2 text-[11px] leading-normal">
                  <div className="flex justify-between">
                    <span className="text-slate-400">1. Importer Buyer:</span>
                    <span className="text-slate-200">GDKXSX...3WTR (Signed ✓)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">2. Exporter Seller:</span>
                    <span className="text-slate-200">GAHT21...8MAQ (Pending release)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">3. MariTrade Platform mediator:</span>
                    <span className="text-[#0BAFB0] font-bold">G_ESCROW_RELEASE v1.0</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center select-none pt-2">
                Ledger synchronized successfully with Horizon API nodes.
              </div>
            </div>

            <button
              onClick={() => setShowStellarLedger(false)}
              className="w-full py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white cursor-pointer"
            >
              Close explorer console
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
