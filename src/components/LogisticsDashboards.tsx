/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shipment, ShipmentStatus, MilestoneType, DocumentType, UserRole, User } from '../types';
import { logMilestoneInStorage, uploadDocumentInStorage, canLogMilestone } from '../utils/storage';
import { 
  Anchor, Ship, FileText, CheckCircle2, Truck, ClipboardList, ShieldAlert,
  Calendar, MapPin, AlertCircle, RefreshCw, Upload, Eye, Clock, ListFilter,
  Search
} from 'lucide-react';

interface LogisticsDashboardProps {
  shipments: Shipment[];
  user: User;
  onViewShipment: (id: string) => void;
  onUpdate: () => void;
}

// Global helper to filter shipments assigned to the current user's role
function getAssignedShipments(shipments: Shipment[], user: User): Shipment[] {
  const role = user.role;
  return shipments.filter(s => {
    if (role === UserRole.PORT_AUTHORITY) return s.assignedPortAuthorityName !== undefined;
    if (role === UserRole.CUSTOMS_BROKER) return s.assignedCustomsBrokerName !== undefined;
    if (role === UserRole.SHIPPING_LINE) return s.assignedCarrierName !== undefined;
    if (role === UserRole.WAREHOUSE) return s.assignedWarehouseName !== undefined;
    if (role === UserRole.TRUCKER) return s.assignedTruckerName !== undefined;
    if (role === UserRole.FREIGHT_FORWARDER) return s.assignedInspectorName !== undefined;
    return false;
  });
}

function getStatusBadge(status: ShipmentStatus) {
  switch (status) {
    case ShipmentStatus.PENDING:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">PENDING</span>;
    case ShipmentStatus.CONFIRMED:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">CONFIRMED</span>;
    case ShipmentStatus.IN_TRANSIT:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF4FF] text-[#1A66FF] border border-[#C8DBFF] animate-pulse">SHIP SAILING</span>;
    case ShipmentStatus.AT_PORT:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">⚓ IN PORT</span>;
    case ShipmentStatus.CUSTOMS_CLEARANCE:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">CUSTOMS EXAM</span>;
    case ShipmentStatus.OUT_FOR_DELIVERY:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#CCEFEF] text-[#078384] border border-[#0BAFB0]/20">🚚 DISPATCHED</span>;
    case ShipmentStatus.DELIVERED:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">DELIVERED</span>;
    case ShipmentStatus.DISPUTED:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">DISPUTED</span>;
    case ShipmentStatus.CANCELLED:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">CANCELLED</span>;
    default:
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500">UNKNOWN</span>;
  }
}

// 1. PORT AUTHORITY DASHBOARD
export function PortAuthorityDashboard({ shipments, user, onViewShipment, onUpdate }: LogisticsDashboardProps) {
  const assigned = getAssignedShipments(shipments, user);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssigned = assigned.filter(s => 
    s.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.exporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.importerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogArrival = (shipmentId: string) => {
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.VESSEL_ARRIVED_DESTINATION,
        "Vessel docked. Harbour Pilot confirmed successfully. Offloading containers."
      );
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  const handleLogDeparture = (shipmentId: string) => {
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.VESSEL_DEPARTED,
        "Vessel departed from origin port. Shipping lanes logged. AIS transmitter active."
      );
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">My Operating Node:</span>
              <strong className="text-xs text-[#1A66FF] font-mono">{user.companyName} ({user.role.replace(/_/g, ' ')})</strong>
            </div>
            <h3 className="font-bold text-[#001240] text-sm">Dashboard Overview & Booking Finder</h3>
            <p className="text-xs text-slate-500">Quickly find and record logistics actions for active trade bookings assigned to your terminal.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#FAFAF7] text-slate-600 border border-[#E5E3DA] px-2.5 py-1 rounded-full">
              {assigned.length} Assigned {assigned.length === 1 ? 'Job' : 'Jobs'}
            </span>
            {searchTerm && (
              <span className="text-xs font-mono font-bold bg-blue-50 text-[#1A66FF] border border-[#C8DBFF] px-2.5 py-1 rounded-full">
                {filteredAssigned.length} Found
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by reference, description, port, country, exporter, importer or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] bg-[#FAFAF7] hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#1A66FF] focus:border-[#1A66FF] transition text-xs text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E3DA] bg-[#FAFAF7]">
          <h2 className="text-sm font-bold text-slate-800">Harbour Control Ledger</h2>
          <p className="text-xs text-slate-500 mt-1">Sailing manifests and vessel progress tracking for your assigned routes.</p>
        </div>

        <div className="overflow-x-auto">
          {assigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No vessels currently assigned to your authority.</div>
          ) : filteredAssigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No bookings match your search term: "{searchTerm}"</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-3">Corridor / Route</th>
                  <th className="py-3 px-3">Active Status</th>
                  <th className="py-3 px-3">Est. Arrival</th>
                  <th className="py-3 px-3 text-right">Pilot Console Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {filteredAssigned.map((s) => {
                  const checkDep = canLogMilestone(s, MilestoneType.VESSEL_DEPARTED);
                  const checkArr = canLogMilestone(s, MilestoneType.VESSEL_ARRIVED_DESTINATION);
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAF7]/50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold block text-slate-800">{s.referenceCode}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-xs block">{s.description}</span>
                      </td>
                      <td className="py-4 px-3 font-medium text-slate-600">
                        {s.originCountry} &rarr; {s.destinationPort}
                      </td>
                      <td className="py-4 px-3">
                        {getStatusBadge(s.status)}
                      </td>
                      <td className="py-4 px-3 font-mono text-slate-500">
                        {s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-3 text-right space-x-2">
                        {s.status === ShipmentStatus.CONFIRMED && (
                          <button
                            onClick={() => checkDep.allowed && handleLogDeparture(s.id)}
                            disabled={loadingId !== null || !checkDep.allowed}
                            title={checkDep.reason}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              checkDep.allowed 
                                ? 'bg-[#1A66FF] text-white hover:bg-[#0047E0]' 
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            }`}
                          >
                            {checkDep.allowed ? 'Log Departure' : '🔒 Departure Locked'}
                          </button>
                        )}
                        {s.status === ShipmentStatus.IN_TRANSIT && (
                          <button
                            onClick={() => checkArr.allowed && handleLogArrival(s.id)}
                            disabled={loadingId !== null || !checkArr.allowed}
                            title={checkArr.reason}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              checkArr.allowed 
                                ? 'bg-teal-500 text-white hover:bg-teal-600' 
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            }`}
                          >
                            {checkArr.allowed ? 'Log Vessel Arrival' : '🔒 Arrival Locked'}
                          </button>
                        )}
                        <button
                          onClick={() => onViewShipment(s.id)}
                          className="px-3 py-1.5 rounded-lg border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-700 transition text-xs font-semibold"
                        >
                          File Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. CUSTOMS BROKER DASHBOARD
export function CustomsBrokerDashboard({ shipments, user, onViewShipment, onUpdate }: LogisticsDashboardProps) {
  const assigned = getAssignedShipments(shipments, user);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showAmendModal, setShowAmendModal] = useState<string | null>(null);
  const [amendText, setAmendText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssigned = assigned.filter(s => 
    s.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.exporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.importerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearCustoms = (shipmentId: string) => {
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CUSTOMS_CLEARED,
        "Customs Broker filed final tariff codes. Customs Single Administrative Entry and Import Permit cleared by examiner."
      );
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  const handleRequestAmendment = (shipmentId: string) => {
    if (!amendText.trim()) return;
    setLoadingId(shipmentId);
    setTimeout(() => {
      uploadDocumentInStorage(
        shipmentId,
        DocumentType.AMENDMENT,
        `Amendment_Req_${Date.now()}.pdf`,
        '#',
        user.fullName
      );
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CUSTOMS_ENTRY_FILED,
        `Amendment request filed: ${amendText}`
      );
      setLoadingId(null);
      setAmendText('');
      setShowAmendModal(null);
      onUpdate();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">My Operating Node:</span>
              <strong className="text-xs text-[#1A66FF] font-mono">{user.companyName} ({user.role.replace(/_/g, ' ')})</strong>
            </div>
            <h3 className="font-bold text-[#001240] text-sm">Dashboard Overview & Booking Finder</h3>
            <p className="text-xs text-slate-500">Quickly find and record logistics actions for active trade bookings assigned to your terminal.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#FAFAF7] text-slate-600 border border-[#E5E3DA] px-2.5 py-1 rounded-full">
              {assigned.length} Assigned {assigned.length === 1 ? 'Job' : 'Jobs'}
            </span>
            {searchTerm && (
              <span className="text-xs font-mono font-bold bg-blue-50 text-[#1A66FF] border border-[#C8DBFF] px-2.5 py-1 rounded-full">
                {filteredAssigned.length} Found
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by reference, description, port, country, exporter, importer or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] bg-[#FAFAF7] hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#1A66FF] focus:border-[#1A66FF] transition text-xs text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E3DA] bg-[#FAFAF7] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Assigned Import Filings</h2>
            <p className="text-xs text-slate-500 mt-1">Review invoices, attach SAD, and sign-off border clearance status.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {assigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No shipments assigned to your customs brokerage.</div>
          ) : filteredAssigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No bookings match your search term: "{searchTerm}"</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                <tr>
                  <th className="py-3 px-4">Cargo Code</th>
                  <th className="py-3 px-3">Port Corridor</th>
                  <th className="py-3 px-3">Customs Tariff</th>
                  <th className="py-3 px-3">BOC Stage</th>
                  <th className="py-3 px-3 text-right">Broker Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {filteredAssigned.map((s) => {
                  const checkCleared = canLogMilestone(s, MilestoneType.CUSTOMS_CLEARED);
                  const checkEntry = canLogMilestone(s, MilestoneType.CUSTOMS_ENTRY_FILED);
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAF7]/50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold block text-slate-800">{s.referenceCode}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-xs block">{s.description}</span>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-600">{s.destinationPort}</td>
                      <td className="py-4 px-3 text-slate-500 font-mono">
                        VAT / Import Entry Duties Active
                      </td>
                      <td className="py-4 px-3">{getStatusBadge(s.status)}</td>
                      <td className="py-4 px-3 text-right space-x-2">
                        {(s.status === ShipmentStatus.AT_PORT || s.status === ShipmentStatus.CUSTOMS_CLEARANCE) && (
                          <>
                            <button
                              onClick={() => checkCleared.allowed && handleClearCustoms(s.id)}
                              disabled={loadingId !== null || !checkCleared.allowed}
                              title={checkCleared.reason}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                checkCleared.allowed
                                  ? 'bg-[#0BAFB0] hover:bg-[#078384] text-white font-bold'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-medium'
                              }`}
                            >
                              {checkCleared.allowed ? 'Approve Customs Release' : '🔒 Release Locked'}
                            </button>
                            <button
                              onClick={() => checkEntry.allowed && setShowAmendModal(s.id)}
                              disabled={loadingId !== null || !checkEntry.allowed}
                              title={checkEntry.reason}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                checkEntry.allowed
                                  ? 'border border-[#FF5C35] hover:bg-[#FFF2EE] text-[#CC3A1C]'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              }`}
                            >
                              {checkEntry.allowed ? 'Request Amendment' : '🔒 File Locked'}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onViewShipment(s.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-700 transition text-xs font-semibold"
                        >
                          Paperwork
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAmendModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E5E3DA] rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ShieldAlert className="text-[#FF5C35]" size={16} />
              <span>Raise Document Amendment Request</span>
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Flag missing fields or incorrect values (e.g. HS tariff codes, item description errors) to trade parties.
            </p>
            <textarea
              className="w-full text-xs p-3 border border-[#E5E3DA] rounded-xl focus:outline-none focus:border-[#1A66FF]"
              value={amendText}
              onChange={(e) => setAmendText(e.target.value)}
              placeholder="e.g. Request Commercial Invoice amendment to explicitly match packing list weight weights..."
              rows={3}
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowAmendModal(null)}
                className="px-3 py-1.5 border border-[#E5E3DA] rounded-lg text-xs text-slate-600 hover:bg-[#F2F1EC]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestAmendment(showAmendModal)}
                disabled={loadingId !== null || !amendText.trim()}
                className="px-3.5 py-1.5 bg-[#FF5C35] text-white hover:bg-rose-600 rounded-lg text-xs font-bold"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. CARRIER / SHIPPING LINE DASHBOARD
export function CarrierDashboard({ shipments, user, onViewShipment, onUpdate }: LogisticsDashboardProps) {
  const assigned = getAssignedShipments(shipments, user);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [customMilestone, setCustomMilestone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssigned = assigned.filter(s => 
    s.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.exporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.importerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePostTransitLog = (shipmentId: string) => {
    if (!customMilestone.trim()) return;
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CONTAINER_LOADED,
        `Transit Status Update: ${customMilestone}`
      );
      setCustomMilestone('');
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">My Operating Node:</span>
              <strong className="text-xs text-[#1A66FF] font-mono">{user.companyName} ({user.role.replace(/_/g, ' ')})</strong>
            </div>
            <h3 className="font-bold text-[#001240] text-sm">Dashboard Overview & Booking Finder</h3>
            <p className="text-xs text-slate-500">Quickly find and record logistics actions for active trade bookings assigned to your terminal.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#FAFAF7] text-slate-600 border border-[#E5E3DA] px-2.5 py-1 rounded-full">
              {assigned.length} Assigned {assigned.length === 1 ? 'Job' : 'Jobs'}
            </span>
            {searchTerm && (
              <span className="text-xs font-mono font-bold bg-blue-50 text-[#1A66FF] border border-[#C8DBFF] px-2.5 py-1 rounded-full">
                {filteredAssigned.length} Found
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by reference, description, port, country, exporter, importer or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] bg-[#FAFAF7] hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#1A66FF] focus:border-[#1A66FF] transition text-xs text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E3DA] bg-[#FAFAF7]">
          <h2 className="text-sm font-bold text-slate-800">Vessel Logs & Routing Slots</h2>
          <p className="text-xs text-slate-500 mt-1">Publish ocean carrier milestones directly to the trade ledger loggers.</p>
        </div>

        <div className="overflow-x-auto">
          {assigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No shipments assigned to your shipping route.</div>
          ) : filteredAssigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No bookings match your search term: "{searchTerm}"</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                <tr>
                  <th className="py-3 px-4">Shipment Reference</th>
                  <th className="py-3 px-3">Transit Route</th>
                  <th className="py-3 px-3">ETA Date</th>
                  <th className="py-3 px-3">Voyage Stage</th>
                  <th className="py-3 px-3 text-right">Carrier Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {filteredAssigned.map((s) => {
                  const checkLoaded = canLogMilestone(s, MilestoneType.CONTAINER_LOADED);
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAF7]/50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold block text-slate-800">{s.referenceCode}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-xs block">{s.description}</span>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-600">
                        {s.originCountry} &rsaquo; {s.destinationPort}
                      </td>
                      <td className="py-4 px-3 font-mono text-slate-500">
                        {s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-3">{getStatusBadge(s.status)}</td>
                      <td className="py-4 px-3 text-right">
                        {s.status === ShipmentStatus.IN_TRANSIT && (
                          <div className="flex items-center justify-end gap-2 max-w-sm ml-auto">
                            <input
                              type="text"
                              placeholder={checkLoaded.allowed ? "Type in-transit event..." : "🔒 Awaiting previous stage"}
                              disabled={!checkLoaded.allowed}
                              className="bg-white border border-[#E5E3DA] text-[11px] px-2 py-1 rounded-md w-40 focus:outline-none focus:border-[#1A66FF] disabled:bg-slate-50 disabled:text-slate-400"
                              value={customMilestone}
                              onChange={(e) => setCustomMilestone(e.target.value)}
                            />
                            <button
                              onClick={() => checkLoaded.allowed && handlePostTransitLog(s.id)}
                              disabled={loadingId !== null || !customMilestone.trim() || !checkLoaded.allowed}
                              title={checkLoaded.reason}
                              className={`px-2.5 py-1.5 rounded-md font-bold text-[10px] transition ${
                                checkLoaded.allowed
                                  ? 'bg-[#1A66FF] text-white hover:bg-[#0047E0]'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              }`}
                            >
                              {checkLoaded.allowed ? 'Log Transit Status' : '🔒 Locked'}
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => onViewShipment(s.id)}
                          className="px-2.5 py-1.5 ml-2 border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-600 rounded-lg font-bold text-xs"
                        >
                          View BOL
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. WAREHOUSE / TERMINAL OPERATOR DASHBOARD
export function WarehouseDashboard({ shipments, user, onViewShipment, onUpdate }: LogisticsDashboardProps) {
  const assigned = getAssignedShipments(shipments, user);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [hoursInput, setHoursInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssigned = assigned.filter(s => 
    s.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.exporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.importerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmIntake = (shipmentId: string) => {
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CARGO_RECEIVED_WAREHOUSE,
        "Cargo pallets stored securely in warehouse yard. Staging location updated."
      );
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  const handleLogClock = (shipmentId: string) => {
    if (!hoursInput.trim()) return;
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CARGO_RECEIVED_WAREHOUSE,
        `Yard Staging Clock: Cargo stored for ${hoursInput} operating hours. No demurrage fees accrued.`
      );
      setHoursInput('');
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">My Operating Node:</span>
              <strong className="text-xs text-[#1A66FF] font-mono">{user.companyName} ({user.role.replace(/_/g, ' ')})</strong>
            </div>
            <h3 className="font-bold text-[#001240] text-sm">Dashboard Overview & Booking Finder</h3>
            <p className="text-xs text-slate-500">Quickly find and record logistics actions for active trade bookings assigned to your terminal.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#FAFAF7] text-slate-600 border border-[#E5E3DA] px-2.5 py-1 rounded-full">
              {assigned.length} Assigned {assigned.length === 1 ? 'Job' : 'Jobs'}
            </span>
            {searchTerm && (
              <span className="text-xs font-mono font-bold bg-blue-50 text-[#1A66FF] border border-[#C8DBFF] px-2.5 py-1 rounded-full">
                {filteredAssigned.length} Found
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by reference, description, port, country, exporter, importer or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] bg-[#FAFAF7] hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#1A66FF] focus:border-[#1A66FF] transition text-xs text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E3DA] bg-[#FAFAF7]">
          <h2 className="text-sm font-bold text-slate-800">Assigned Staged Cargo</h2>
          <p className="text-xs text-slate-500 mt-1">Accept intake and log demurrage storage clocks with complete transparency.</p>
        </div>

        <div className="overflow-x-auto">
          {assigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No cargo scheduled for your yard facilities.</div>
          ) : filteredAssigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No bookings match your search term: "{searchTerm}"</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                <tr>
                  <th className="py-3 px-4">Container Reference</th>
                  <th className="py-3 px-3">Discharge Station</th>
                  <th className="py-3 px-3">Storage Clock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Intake Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {filteredAssigned.map((s) => {
                  const checkIntake = canLogMilestone(s, MilestoneType.CARGO_RECEIVED_WAREHOUSE);
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAF7]/50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold block text-slate-800">{s.referenceCode}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-xs block">{s.description}</span>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-600">{s.destinationPort}</td>
                      <td className="py-4 px-3 font-mono text-slate-500">
                        Standard terminal rates active
                      </td>
                      <td className="py-4 px-3">{getStatusBadge(s.status)}</td>
                      <td className="py-4 px-3 text-right">
                        {s.status === ShipmentStatus.AT_PORT && (
                          <button
                            onClick={() => checkIntake.allowed && handleConfirmIntake(s.id)}
                            disabled={loadingId !== null || !checkIntake.allowed}
                            title={checkIntake.reason}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold mr-2 transition ${
                              checkIntake.allowed
                                ? 'bg-teal-500 text-white hover:bg-teal-600 font-bold'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-medium'
                            }`}
                          >
                            {checkIntake.allowed ? 'Confirm Intake' : '🔒 Intake Locked'}
                          </button>
                        )}
                        {s.status === ShipmentStatus.CUSTOMS_CLEARANCE && (
                          <div className="inline-flex gap-1">
                            <input
                              type="number"
                              placeholder="Hours..."
                              className="w-16 px-1.5 py-1 text-xs border border-[#E5E3DA] rounded bg-white text-slate-800 focus:outline-none"
                              value={hoursInput}
                              onChange={(e) => setHoursInput(e.target.value)}
                            />
                            <button
                              onClick={() => handleLogClock(s.id)}
                              disabled={loadingId !== null || !hoursInput}
                              className="px-2 py-1 bg-amber-500 text-white font-bold rounded text-[10px]"
                            >
                              Update Clock
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => onViewShipment(s.id)}
                          className="px-2.5 py-1.5 ml-2 border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-600 rounded-lg font-bold text-xs"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// 5. TRUCKER DASHBOARD
export function TruckerDashboard({ shipments, user, onViewShipment, onUpdate }: LogisticsDashboardProps) {
  const assigned = getAssignedShipments(shipments, user);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssigned = assigned.filter(s => 
    s.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.exporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.importerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmPickup = (shipmentId: string) => {
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CARGO_PICKED_UP,
        "Commercial truck loaded. Port Gate clearance validated. Setting course for consignee delivery."
      );
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  const handleConfirmFinalDelivery = (shipmentId: string) => {
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.DELIVERED,
        "Trucker arrived at Importer Terminal. Side-by-side count completed without visual discrepancies."
      );
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">My Operating Node:</span>
              <strong className="text-xs text-[#1A66FF] font-mono">{user.companyName} ({user.role.replace(/_/g, ' ')})</strong>
            </div>
            <h3 className="font-bold text-[#001240] text-sm">Dashboard Overview & Booking Finder</h3>
            <p className="text-xs text-slate-500">Quickly find and record logistics actions for active trade bookings assigned to your terminal.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#FAFAF7] text-slate-600 border border-[#E5E3DA] px-2.5 py-1 rounded-full">
              {assigned.length} Assigned {assigned.length === 1 ? 'Job' : 'Jobs'}
            </span>
            {searchTerm && (
              <span className="text-xs font-mono font-bold bg-blue-50 text-[#1A66FF] border border-[#C8DBFF] px-2.5 py-1 rounded-full">
                {filteredAssigned.length} Found
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by reference, description, port, country, exporter, importer or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] bg-[#FAFAF7] hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#1A66FF] focus:border-[#1A66FF] transition text-xs text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E3DA] bg-[#FAFAF7]">
          <h2 className="text-sm font-bold text-slate-800">Freight Delivery Manifests</h2>
          <p className="text-xs text-slate-500 mt-1">Accept dispatches and confirm delivery signatures live to ledger rails.</p>
        </div>

        <div className="overflow-x-auto">
          {assigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No road dispatches coordinates assigned to your trucking fleet.</div>
          ) : filteredAssigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No bookings match your search term: "{searchTerm}"</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-3">Destination Delivery Address</th>
                  <th className="py-3 px-3">Cargo Content</th>
                  <th className="py-3 px-3">Logistics Status</th>
                  <th className="py-3 px-3 text-right">Fulfillment Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {filteredAssigned.map((s) => {
                  const checkPickup = canLogMilestone(s, MilestoneType.CARGO_PICKED_UP);
                  const checkDelivery = canLogMilestone(s, MilestoneType.DELIVERED);
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAF7]/50">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">{s.referenceCode}</td>
                      <td className="py-4 px-3 font-semibold text-slate-600">{s.importerName} Warehouse Terminal</td>
                      <td className="py-4 px-3 text-slate-500">{s.description}</td>
                      <td className="py-4 px-3">{getStatusBadge(s.status)}</td>
                      <td className="py-4 px-3 text-right space-x-2">
                        {s.status === ShipmentStatus.CUSTOMS_CLEARANCE && (
                          <button
                            onClick={() => checkPickup.allowed && handleConfirmPickup(s.id)}
                            disabled={loadingId !== null || !checkPickup.allowed}
                            title={checkPickup.reason}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                              checkPickup.allowed
                                ? 'bg-[#1A66FF] text-white hover:bg-[#0047E0]'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            }`}
                          >
                            {checkPickup.allowed ? 'Confirm Cargo Pickup' : '🔒 Pickup Locked'}
                          </button>
                        )}
                        {s.status === ShipmentStatus.OUT_FOR_DELIVERY && (
                          <button
                            onClick={() => checkDelivery.allowed && handleConfirmFinalDelivery(s.id)}
                            disabled={loadingId !== null || !checkDelivery.allowed}
                            title={checkDelivery.reason}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition animate-pulse ${
                              checkDelivery.allowed
                                ? 'bg-teal-500 text-white hover:bg-teal-600'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed animate-none'
                            }`}
                          >
                            {checkDelivery.allowed ? 'Confirm Final Delivery' : '🔒 Delivery Locked'}
                          </button>
                        )}
                        <button
                          onClick={() => onViewShipment(s.id)}
                          className="px-2.5 py-1.5 border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-600 rounded-lg font-bold text-xs"
                        >
                          View Routing
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// 6. INSPECTOR / INSURER DASHBOARD (mapped to UserRole.FREIGHT_FORWARDER)
export function InspectorDashboard({ shipments, user, onViewShipment, onUpdate }: LogisticsDashboardProps) {
  const assigned = getAssignedShipments(shipments, user);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssigned = assigned.filter(s => 
    s.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.exporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.importerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePostInspectionReport = (shipmentId: string) => {
    if (!reportText.trim()) return;
    setLoadingId(shipmentId);
    setTimeout(() => {
      uploadDocumentInStorage(
        shipmentId,
        DocumentType.INSPECTION_REPORT,
        `Inspection_Cert_${Date.now()}.pdf`,
        '#',
        user.fullName
      );
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CONTAINER_OFFLOADED,
        `Inspection Verified: ${reportText}`
      );
      setReportText('');
      setShowReportModal(null);
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  const handleDisputeMilestone = (shipmentId: string) => {
    setLoadingId(shipmentId);
    setTimeout(() => {
      logMilestoneInStorage(
        shipmentId,
        { name: user.fullName, role: user.role },
        MilestoneType.CONTAINER_OFFLOADED,
        "🚨 DISCREPANCY DETECTED: Sealed container lock missing. Raising quality audit report to underwriters."
      );
      setLoadingId(null);
      onUpdate();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">My Operating Node:</span>
              <strong className="text-xs text-[#1A66FF] font-mono">{user.companyName} ({user.role.replace(/_/g, ' ')})</strong>
            </div>
            <h3 className="font-bold text-[#001240] text-sm">Dashboard Overview & Booking Finder</h3>
            <p className="text-xs text-slate-500">Quickly find and record logistics actions for active trade bookings assigned to your terminal.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#FAFAF7] text-slate-600 border border-[#E5E3DA] px-2.5 py-1 rounded-full">
              {assigned.length} Assigned {assigned.length === 1 ? 'Job' : 'Jobs'}
            </span>
            {searchTerm && (
              <span className="text-xs font-mono font-bold bg-blue-50 text-[#1A66FF] border border-[#C8DBFF] px-2.5 py-1 rounded-full">
                {filteredAssigned.length} Found
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by reference, description, port, country, exporter, importer or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] bg-[#FAFAF7] hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#1A66FF] focus:border-[#1A66FF] transition text-xs text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E3DA] bg-[#FAFAF7]">
          <h2 className="text-sm font-bold text-slate-800">Independent Quality Audits</h2>
          <p className="text-xs text-slate-500 mt-1">Audit container seals, write quality certificates, and quarantine defective cargoes.</p>
        </div>

        <div className="overflow-x-auto">
          {assigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No audits scheduled for your inspection branch.</div>
          ) : filteredAssigned.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No bookings match your search term: "{searchTerm}"</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] uppercase font-mono tracking-wider font-bold text-slate-500 border-b border-[#E5E3DA]">
                <tr>
                  <th className="py-3 px-4">Container ID</th>
                  <th className="py-3 px-3">Inspected Route</th>
                  <th className="py-3 px-3">Quality Standard</th>
                  <th className="py-3 px-3">Cargo Status</th>
                  <th className="py-3 px-3 text-right">Audit Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {filteredAssigned.map((s) => {
                  const checkOffloaded = canLogMilestone(s, MilestoneType.CONTAINER_OFFLOADED);
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAF7]/50">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">{s.referenceCode}</td>
                      <td className="py-4 px-3 font-semibold text-slate-600">
                        {s.originCountry} &rsaquo; {s.destinationPort}
                      </td>
                    <td className="py-4 px-3 font-semibold text-slate-500 font-mono">ISO-9001 Conformity Audit</td>
                    <td className="py-4 px-3">{getStatusBadge(s.status)}</td>
                      <td className="py-4 px-3 text-right space-x-2">
                        {s.status !== ShipmentStatus.DELIVERED && s.status !== ShipmentStatus.CANCELLED && (
                          <>
                            <button
                              onClick={() => checkOffloaded.allowed && setShowReportModal(s.id)}
                              disabled={loadingId !== null || !checkOffloaded.allowed}
                              title={checkOffloaded.reason}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                checkOffloaded.allowed
                                  ? 'bg-teal-500 hover:bg-teal-600 text-white'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-medium'
                              }`}
                            >
                              {checkOffloaded.allowed ? 'Submit Quality Certificate' : '🔒 Audit Locked'}
                            </button>
                            <button
                              onClick={() => checkOffloaded.allowed && handleDisputeMilestone(s.id)}
                              disabled={loadingId !== null || !checkOffloaded.allowed}
                              title={checkOffloaded.reason}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                                checkOffloaded.allowed
                                  ? 'border-[#FF5C35] hover:bg-red-50 text-[#CC3A1C]'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-slate-400'
                              }`}
                            >
                              {checkOffloaded.allowed ? 'Raise Inspection Hold ⚠️' : '🔒 Hold Locked'}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onViewShipment(s.id)}
                          className="px-2.5 py-1.5 border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-600 rounded-lg font-bold text-xs"
                        >
                          Audit Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E5E3DA] rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ClipboardList className="text-teal-600" size={16} />
              <span>Submit Quality Inspection Report</span>
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              State if the seals are secure, temperature logs match, and any damage to outer shipping cartons.
            </p>
            <textarea
              className="w-full text-xs p-3 border border-[#E5E3DA] rounded-xl focus:outline-none focus:border-[#1A66FF]"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="e.g. Audited. No water water ingress detected in cargo hold. Ocean containers successfully validated."
              rows={3}
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowReportModal(null)}
                className="px-3 py-1.5 border border-[#E5E3DA] rounded-lg text-xs text-slate-600 hover:bg-[#F2F1EC]"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePostInspectionReport(showReportModal)}
                disabled={loadingId !== null || !reportText.trim()}
                className="px-3.5 py-1.5 bg-teal-500 text-white hover:bg-teal-600 rounded-lg text-xs font-bold"
              >
                Publish Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
