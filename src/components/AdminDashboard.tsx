/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shipment, 
  ShipmentStatus, 
  EscrowStatus, 
  User, 
  DocumentType, 
  MilestoneType, 
  UserRole 
} from '../types';
import { 
  deleteDocumentInStorage, 
  deleteShipmentInStorage, 
  updateShipmentInStorage,
  logMilestoneInStorage 
} from '../utils/storage';
import { 
  Shield, 
  Trash2, 
  Edit3, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ListFilter, 
  Search, 
  Plus, 
  Database, 
  History,
  XCircle,
  TrendingUp,
  FileCheck2,
  Lock
} from 'lucide-react';

interface AdminDashboardProps {
  shipments: Shipment[];
  user: User;
  onViewShipment: (id: string) => void;
  onUpdate: () => void;
}

export default function AdminDashboard({ shipments, user, onViewShipment, onUpdate }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [escrowFilter, setEscrowFilter] = useState<string>('ALL');
  
  // Interactive editing state for specific shipment
  const [editingShipmentId, setEditingShipmentId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<ShipmentStatus>(ShipmentStatus.PENDING);
  const [editEscrow, setEditEscrow] = useState<EscrowStatus>(EscrowStatus.UNFUNDED);
  
  // Interactive milestone logging
  const [milestoneShipmentId, setMilestoneShipmentId] = useState<string | null>(null);
  const [milestoneType, setMilestoneType] = useState<MilestoneType>(MilestoneType.BOOKING_CONFIRMED);
  const [milestoneDesc, setMilestoneDesc] = useState('');

  // Sieve all documents from all shipments
  const allDocuments = React.useMemo(() => {
    return shipments.flatMap(s => 
      s.documents.map(d => ({
        ...d,
        shipmentRef: s.referenceCode,
        shipmentDesc: s.description,
        shipmentId: s.id
      }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [shipments]);

  // Search/Filter shipments
  const filteredShipments = React.useMemo(() => {
    return shipments.filter(s => {
      const matchesSearch = s.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.importerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.exporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesEscrow = escrowFilter === 'ALL' || s.escrowStatus === escrowFilter;
      return matchesSearch && matchesStatus && matchesEscrow;
    });
  }, [shipments, searchQuery, statusFilter, escrowFilter]);

  // Handle shipment update
  const handleUpdateShipmentState = (shipmentId: string) => {
    updateShipmentInStorage(shipmentId, {
      status: editStatus,
      escrowStatus: editEscrow
    });
    
    // Auto add a super admin milestone log
    logMilestoneInStorage(
      shipmentId,
      { name: user.fullName, role: UserRole.ADMIN },
      MilestoneType.BILL_OF_LADING_ISSUED,
      `System Administrator override: Updated status to ${editStatus.replace(/_/g, ' ')} and Escrow state to ${editEscrow.replace(/_/g, ' ')}.`
    );

    setEditingShipmentId(null);
    onUpdate();
  };

  // Add custom milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneShipmentId || !milestoneDesc.trim()) return;

    logMilestoneInStorage(
      milestoneShipmentId,
      { name: user.fullName, role: UserRole.ADMIN },
      milestoneType,
      milestoneDesc.trim()
    );

    setMilestoneShipmentId(null);
    setMilestoneDesc('');
    onUpdate();
  };

  // Delete document
  const handleDeleteDocument = (shipmentId: string, documentId: string, fileName: string) => {
    if (confirm(`ADMIN PRIVILEGE WARNING:\nAre you absolutely sure you want to permanently delete and purge "${fileName}" from the Bureau of Customs secure filing vault?\nThis action will update the decentralized ledger index.`)) {
      deleteDocumentInStorage(shipmentId, documentId);
      onUpdate();
    }
  };

  // Delete shipment
  const handleDeleteShipment = (shipmentId: string, refCode: string) => {
    if (confirm(`CRITICAL SECURITY AUDIT:\nAre you sure you want to delete Shipment entry "${refCode}"?\nThis will completely wipe out its local storage record, milestones, and linked documents.`)) {
      deleteShipmentInStorage(shipmentId);
      onUpdate();
    }
  };

  // Stats
  const totalShipmentValue = shipments.reduce((s, x) => s + x.totalValueUSD, 0);
  const totalEscrowVolume = shipments.reduce((s, x) => s + x.escrowAmountUSD, 0);

  return (
    <div id="admin-dashboard-root" className="space-y-8 animate-fade-in pb-16">
      
      {/* Dynamic Security Ribbon */}
      <div className="bg-[#001240] text-white rounded-xl p-6 border-l-4 border-[#0BAFB0] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white font-mono text-[9px] uppercase font-extrabold px-2 py-0.5 rounded tracking-widest animate-pulse">
              MASTER CONTROL
            </span>
            <span className="text-slate-400 text-xs font-mono">BOC-MARITRADE-SECURE-NODE</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Bureau of Customs Platform Administration Console
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Authenticated as <strong className="text-white font-mono">{user.fullName}</strong>. You hold full system privileges to override shipping history, log milestones, and purge secure file vault records.
          </p>
        </div>
        
        <div className="bg-[#FAFAF7]/5 p-3 rounded-lg border border-white/10 shrink-0 font-mono text-xs space-y-1 text-slate-300">
          <div>Operating Node: <span className="text-[#0BAFB0] font-bold">MANILA_CENTRAL_BOC</span></div>
          <div>Stellar Authority Wallet: <span className="text-white select-all text-[10px]">GDKX...WTR</span></div>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-[#E5E3DA] p-5 rounded-xl shadow-xs flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Platform Cargoes</span>
            <div className="text-2xl font-black text-slate-800">{shipments.length}</div>
            <span className="text-[10px] text-emerald-600 font-bold">100% System Visibility</span>
          </div>
          <div className="w-9 h-9 rounded bg-[#1A66FF]/15 text-[#1A66FF] flex items-center justify-center">
            <Layers size={18} />
          </div>
        </div>

        <div className="bg-white border border-[#E5E3DA] p-5 rounded-xl shadow-xs flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Total Shipping Value</span>
            <div className="text-2xl font-black text-slate-800">${totalShipmentValue.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 font-mono">Platform Currency (USD)</span>
          </div>
          <div className="w-9 h-9 rounded bg-[#0BAFB0]/15 text-[#0BAFB0] flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-white border border-[#E5E3DA] p-5 rounded-xl shadow-xs flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Active Escrow Volume</span>
            <div className="text-2xl font-black text-indigo-700">${totalEscrowVolume.toLocaleString()}</div>
            <span className="text-[10px] text-[#0BAFB0] font-mono">locked via Stellar Multisig</span>
          </div>
          <div className="w-9 h-9 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Lock size={18} />
          </div>
        </div>

        <div className="bg-white border border-[#E5E3DA] p-5 rounded-xl shadow-xs flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Vault Files Arched</span>
            <div className="text-2xl font-black text-slate-800">{allDocuments.length} files</div>
            <span className="text-[10px] text-amber-600 font-bold uppercase">Purgable by ADMIN</span>
          </div>
          <div className="w-9 h-9 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
            <FileCheck2 size={18} />
          </div>
        </div>

      </div>

      {/* Main Admin Management Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Manage Shipping History (List, Edit, Delete) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-xs overflow-hidden">
            
            {/* Header with Search and Filter tools */}
            <div className="p-6 border-b border-[#E5E3DA] bg-[#FAFAF7]/70 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <History size={18} className="text-[#1A66FF]" />
                    Central Shipping Voyage Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Authority overrides to modify shipping states, log regulatory milestones, and delete shipping books.
                  </p>
                </div>
              </div>

              {/* Filtering bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by Reference, Importer, Exporter, Cargo Description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#E5E3DA] rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-[#E5E3DA] rounded-lg text-xs bg-white font-mono select-none"
                  >
                    <option value="ALL">All Statuses</option>
                    {Object.values(ShipmentStatus).map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>

                  <select
                    value={escrowFilter}
                    onChange={(e) => setEscrowFilter(e.target.value)}
                    className="px-3 py-2 border border-[#E5E3DA] rounded-lg text-xs bg-white font-mono select-none"
                  >
                    <option value="ALL">All Escrows</option>
                    {Object.values(EscrowStatus).map(e => (
                      <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Shipments Audit List */}
            <div className="divide-y divide-[#E5E3DA]">
              {filteredShipments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs">
                  No shipments matching search parameters were detected in active memory database.
                </div>
              ) : (
                filteredShipments.map((s) => {
                  const isEditing = editingShipmentId === s.id;
                  
                  return (
                    <div key={s.id} className="p-6 hover:bg-[#FAFAF7]/30 transition-colors space-y-4">
                      
                      {/* Booking meta */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#001240] select-all cursor-pointer hover:underline" onClick={() => onViewShipment(s.id)}>
                              {s.referenceCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">({s.originCountry} to {s.destinationPort})</span>
                          </div>
                          <p className="text-xs text-slate-700 font-semibold">{s.description}</p>
                          
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 font-mono">
                            <span>Importer: <strong className="text-slate-600">{s.importerName}</strong></span>
                            <span>Exporter: <strong className="text-slate-600">{s.exporterName}</strong></span>
                            <span>Value: <strong className="text-indigo-600 font-bold">${s.totalValueUSD.toLocaleString()}</strong></span>
                          </div>
                        </div>

                        {/* Badges / Controls */}
                        <div className="flex flex-wrap gap-2 items-center shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
                            s.status === ShipmentStatus.DELIVERED ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            s.status === ShipmentStatus.CANCELLED ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            s.status === ShipmentStatus.DISPUTED ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            {s.status.replace(/_/g, ' ')}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
                            s.escrowStatus === EscrowStatus.FUNDED ? 'bg-indigo-50 text-[#0047E0] border-indigo-200' :
                            s.escrowStatus === EscrowStatus.RELEASED ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            Locked: {s.escrowStatus}
                          </span>
                        </div>
                      </div>

                      {/* EDIT MODAL / FORM AREA WITHIN TABLE LIST */}
                      {isEditing ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 animate-slide-in">
                          <div className="text-xs font-bold text-[#001240] flex items-center gap-1">
                            <Edit3 size={14} className="text-[#1A66FF]" />
                            Modify Shipping Parameters
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-500">Process Status Leg</label>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as ShipmentStatus)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono"
                              >
                                {Object.values(ShipmentStatus).map(st => (
                                  <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-500">Stellar Escrow State</label>
                              <select
                                value={editEscrow}
                                onChange={(e) => setEditEscrow(e.target.value as EscrowStatus)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono"
                              >
                                {Object.values(EscrowStatus).map(es => (
                                  <option key={es} value={es}>{es}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingShipmentId(null)}
                              className="px-2.5 py-1 w-20 text-[10px] font-bold border border-slate-300 bg-white text-slate-600 rounded cursor-pointer hover:bg-slate-50 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateShipmentState(s.id)}
                              className="px-2.5 py-1 w-28 text-[10px] font-bold bg-[#1A66FF] text-white rounded cursor-pointer hover:bg-blue-700 transition"
                            >
                              Save Overrides
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard Action Triggers */
                        <div className="flex flex-wrap justify-between items-center gap-4 pt-2.5 border-t border-slate-100 text-xs font-mono">
                          
                          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                            <span>Files: <strong>{s.documents.length}</strong></span>
                            <span>•</span>
                            <span>Milestones: <strong>{s.milestones.length}</strong></span>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setEditingShipmentId(s.id);
                                setEditStatus(s.status);
                                setEditEscrow(s.escrowStatus);
                              }}
                              className="px-2.5 py-1 rounded bg-[#FAFAF7] hover:bg-slate-100 border border-[#E5E3DA] text-slate-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                            >
                              <Edit3 size={11} />
                              <span>Override Parameters</span>
                            </button>

                            <button
                              onClick={() => {
                                setMilestoneShipmentId(s.id);
                                setMilestoneDesc(`Bureau of Customs validated Cargo cargo requirements for voyage ${s.referenceCode}.`);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-[#E5E3DA] text-slate-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                            >
                              <Plus size={11} />
                              <span>Log Milestone</span>
                            </button>

                            <button
                              onClick={() => handleDeleteShipment(s.id, s.referenceCode)}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                            >
                              <Trash2 size={11} />
                              <span>Delete Shipment</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Quick interactive log milestone modal when triggered */}
          {milestoneShipmentId && (
            <div className="bg-white border-2 border-indigo-200 p-5 rounded-xl block animate-fade-in space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider text-indigo-700">
                  ⚡ Log Master Milestone
                </span>
                <button onClick={() => setMilestoneShipmentId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <XCircle size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMilestone} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">Select Milestone Type</label>
                    <select
                      value={milestoneType}
                      onChange={(e) => setMilestoneType(e.target.value as MilestoneType)}
                      className="w-full px-3 py-2 border border-[#E5E3DA] rounded-lg bg-[#FAFAF7]"
                    >
                      {Object.values(MilestoneType).map((m) => (
                        <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">Authorizing Entity</label>
                    <input
                      type="text"
                      disabled
                      value={`${user.fullName} (${user.role})`}
                      className="w-full px-3 py-2 border border-[#E5E3DA] rounded-lg bg-slate-100 text-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Milestone Event Log details</label>
                  <textarea
                    rows={2}
                    value={milestoneDesc}
                    onChange={(e) => setMilestoneDesc(e.target.value)}
                    placeholder="Enter precise event description for the shipping history registry ledger..."
                    className="w-full px-3 py-2 border border-[#E5E3DA] rounded-lg bg-[#FAFAF7] font-mono"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMilestoneShipmentId(null)}
                    className="px-3.5 py-1.5 border border-[#E5E3DA] bg-white rounded-lg cursor-pointer text-slate-600 hover:bg-[#FAFAF7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg cursor-pointer hover:bg-indigo-700"
                  >
                    Compile Milestone Log
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Right 1 Column: Permanent Vault Files Cleanup (Authority to Delete Files) */}
        <div className="space-y-6">
          
          <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-xs p-5 space-y-4">
            
            <div className="border-b border-[#E5E3DA] pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <FileText size={16} className="text-red-500" />
                Vault Document Registry
              </h3>
              <p className="text-[11px] text-slate-500">
                Authorized override to delete uploaded custom filing copies, commercial bills, and certificates.
              </p>
            </div>

            <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
              {allDocuments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-[10px]">
                  No compiled files in Platform memory cache database to moderate.
                </div>
              ) : (
                allDocuments.map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-[#FAFAF7] border border-[#E5E3DA] rounded-lg space-y-3 hover:border-slate-300 transition">
                    
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <span className="text-[8px] uppercase font-bold text-[#078384] font-mono tracking-wider">
                          {doc.type.replace(/_/g, ' ')}
                        </span>
                        <h5 className="font-bold text-xs text-slate-800 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h5>
                        <div className="text-[9px] text-slate-400 font-mono">
                          v{doc.version} • {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteDocument(doc.shipmentId, doc.id, doc.fileName)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition cursor-pointer shrink-0"
                        title="Delete Document COPY"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="text-[10px] leading-tight font-mono p-2 bg-white rounded border border-[#E5E3DA] text-slate-500 space-y-0.5">
                      <div className="flex justify-between text-slate-700 font-bold">
                        <span>Voyage Ref:</span>
                        <span className="text-[#1A66FF]">{doc.shipmentRef}</span>
                      </div>
                      <div className="text-[9px]">Uploaded: {doc.uploadedByName}</div>
                    </div>

                  </div>
                ))
              )}
            </div>

            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-normal font-medium flex gap-2">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
              <p>
                Deleting file copies will instantly recompute latest classification tags (e.g. `isLatest: true`) for any preceding legacy revisions.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
