/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shipment, ShipmentStatus, MilestoneType } from '../types';
import { getStoredShipments } from '../utils/storage';
import { Search, MapPin, Compass, Ship, Anchor, CheckCircle2, HelpCircle } from 'lucide-react';

const milestonePendingHints: Record<string, { nextAction: string; owner: string }> = {
  [MilestoneType.BOOKING_CONFIRMED]: {
    nextAction: "The Exporter needs to confirm booking details with the freight carrier shipping line and secure the reservation space.",
    owner: "Exporter / Shipping Line"
  },
  [MilestoneType.CARGO_RECEIVED_WAREHOUSE]: {
    nextAction: "Transfer the goods to the designated loading warehouse to undergo physical verification and cargo volume dimensions check.",
    owner: "Exporter / Warehouse Hub"
  },
  [MilestoneType.CARGO_PACKED_READY]: {
    nextAction: "Warehouse logicians must secure the cargo pallets into standard containers, apply the high-security door locks, and hand off to drayage.",
    owner: "Warehouse Operators"
  },
  [MilestoneType.VESSEL_DEPARTED]: {
    nextAction: "Wait for the designated maritime cargo vessel to depart the embarkation terminal yard and initiate transit across sea lanes.",
    owner: "Shipping Line / Marine Captain"
  },
  [MilestoneType.CONTAINER_LOADED]: {
    nextAction: "Gantry hoist operators must confirm the physical positioning of the sealed container on the vessel's bay deck map.",
    owner: "Origin Port Terminal Authority"
  },
  [MilestoneType.VESSEL_ARRIVED_DESTINATION]: {
    nextAction: "Vessel safe docking, custom harbor pilot mooring, and bulk container discharge at the destination yard.",
    owner: "Government Port Authority"
  },
  [MilestoneType.CUSTOMS_ENTRY_FILED]: {
    nextAction: "Licensed customs broker must prepare and submit the Single Administrative Document (SAD) with linked bills of lading to the Bureau of Customs.",
    owner: "Customs Broker"
  },
  [MilestoneType.CUSTOMS_CLEARED]: {
    nextAction: "BOC assessors must verify duty deposits, complete product inspections if flagged, and issue the final gate release authorization.",
    owner: "Bureau of Customs (BOC)"
  },
  [MilestoneType.CARGO_PICKED_UP]: {
    nextAction: "A verified local trucker must obtain port entry credentials, pick up the container chassis, and start overland delivery drayage.",
    owner: "Local Trucker Logistical"
  },
  [MilestoneType.DELIVERED]: {
    nextAction: "Unload the container at the importer's terminal warehouse, conduct an audit of physical seal integrity, and sign the official receipt log.",
    owner: "Importer / Receiving Warehousing"
  }
};

interface PublicTrackingProps {
  initialRefCode?: string;
  onNavigateToAuth: () => void;
}

export default function PublicTracking({ initialRefCode = '', onNavigateToAuth }: PublicTrackingProps) {
  const [searchInput, setSearchInput] = useState(initialRefCode);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(() => {
    if (initialRefCode) {
      const shipments = getStoredShipments();
      return shipments.find(s => s.referenceCode.toUpperCase() === initialRefCode.toUpperCase()) || null;
    }
    return null;
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setActiveShipment(null);

    if (!searchInput.trim()) return;

    const shipments = getStoredShipments();
    const found = shipments.find(s => s.referenceCode.toUpperCase() === searchInput.trim().toUpperCase());

    if (found) {
      setActiveShipment(found);
    } else {
      setErrorMsg('Referenced shipping tracking ID not found in the public ledger registry. Try searching "MT-2026-00142".');
    }
  };

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
    <div id="public-tracking-view" className="min-h-screen bg-[#FAFAF7] text-slate-800 font-sans flex flex-col items-center justify-between">
      
      {/* Search Header */}
      <div className="w-full bg-white border-b border-[#E5E3DA] py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#1A66FF] text-white flex items-center justify-center font-bold text-lg shadow-sm">M</div>
            <div>
              <span className="font-bold text-base text-[#001240]">MariTrade Public Explorer</span>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-mono">Consignee Ledger</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                id="inp-track-search"
                type="text" 
                placeholder="Lookup Shipment Ref (e.g. MT-2026-00142)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAF7] border border-[#E5E3DA] rounded-lg text-xs font-mono focus:outline-none focus:border-[#1A66FF]"
              />
            </div>
            <button 
              id="btn-public-search-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#001240] hover:bg-[#1A66FF] text-white font-bold text-xs cursor-pointer text-center"
            >
              Trace Cargo
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 w-full max-w-3xl px-6 py-12 space-y-8">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#FF5C35] text-xs font-semibold rounded-xl p-4 text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {activeShipment ? (
          <div className="space-y-6 animate-fade-in">
            {/* Shipment Summary Panel without financial data */}
            <div className="bg-white border border-[#E5E3DA] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Shipment Code</span>
                  <h2 className="text-2xl font-black font-mono text-[#001240] tracking-tight">{activeShipment.referenceCode}</h2>
                  <p className="text-xs text-slate-500 mt-1">{activeShipment.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#0BAFB0]">ETA Delivery</span>
                  <strong className="block text-sm font-mono mt-0.5 text-slate-800">
                    {activeShipment.estimatedArrival ? new Date(activeShipment.estimatedArrival).toLocaleDateString() : 'Pending'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#E5E3DA] pt-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-mono uppercase text-[9px]">Transit Corridor Route</span>
                  <strong className="text-slate-700">{activeShipment.originCountry} &rsaquo; {activeShipment.destinationPort}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-mono uppercase text-[9px]">Consignee SME Importer</span>
                  <strong className="text-slate-700">{activeShipment.importerName}</strong>
                </div>
              </div>
            </div>

            {/* Read-only vertical milestone timeline */}
            <div className="bg-white border border-[#E5E3DA] rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Leg Logistics Journal</h3>
                <p className="text-xs text-slate-500">Public timeline verified by shipping lines and port authorities. Escrow details hidden for trade confidentiality.</p>
              </div>

              <div className="space-y-6 relative pl-6 border-l border-[#E5E3DA] ml-2.5">
                {milestonesOrder.map((mType) => {
                  const loggedMatches = activeShipment.milestones.filter(m => m.type === mType);
                  const isComp = loggedMatches.length > 0;
                  
                  const loggedTypes = activeShipment.milestones.map(m => m.type);
                  const currentLegIndex = milestonesOrder.findIndex(mt => !loggedTypes.includes(mt));
                  const isCurrent = milestonesOrder[currentLegIndex] === mType;

                  return (
                    <div key={mType} className="relative">
                      {/* Circle dot marker */}
                      <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 ${
                        isComp 
                          ? 'bg-[#0BAFB0] border-[#0BAFB0]' 
                          : isCurrent 
                            ? 'bg-white border-[#1A66FF]' 
                            : 'bg-white border-[#E5E3DA]'
                      }`}></div>

                      <div className="space-y-1">
                        <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isComp 
                            ? 'text-[#078384]' 
                            : isCurrent 
                              ? 'text-[#1A66FF]' 
                              : 'text-slate-400'
                        }`}>
                          {mType.replace(/_/g, ' ')}
                        </span>

                        {isComp ? (
                          <div className="space-y-1 pl-1">
                            {loggedMatches.map((lm) => (
                              <div key={lm.id} className="text-xs text-slate-600 bg-[#FAFAF7] border border-[#E5E3DA] p-3 rounded-xl">
                                <p className="font-medium leading-relaxed">{lm.description}</p>
                                <span className="block text-[9px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-200/50">
                                  Verified Update: {new Date(lm.occurredAt).toLocaleDateString()} at {new Date(lm.occurredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 bg-[#FAFAF8] border border-[#E5E3DA]/60 p-3 rounded-lg space-y-1.5 leading-normal">
                            <div className="flex items-center gap-1 font-bold text-amber-700">
                              <HelpCircle size={11} className="shrink-0" />
                              <span>Verification Pending</span>
                            </div>
                            <p className="text-slate-600 font-medium">
                              {milestonePendingHints[mType]?.nextAction || "Pending log arrival at this point."}
                            </p>
                            {milestonePendingHints[mType] && (
                              <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-200/50">
                                <span className="uppercase text-[8px] text-slate-400 font-bold">Scheduled Actor:</span>
                                <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-bold font-mono text-[9px]">{milestonePendingHints[mType].owner}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* Landing query layout */
          <div className="bg-white border border-[#E5E3DA] rounded-2xl p-8 py-14 text-center shadow-xs flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center">
              <Compass size={24} className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Enter shipping track ID to query cargo</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                MariTrade public explorer enables distribution consignees or exporters to monitor oceanic routing status without full access rights.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Signup Banner */}
      <div className="w-full max-w-3xl px-6 pb-12 mt-auto">
        <div className="bg-[#001240] text-slate-100 p-6 rounded-2xl text-center space-y-4 hover:shadow-lg transition">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Importing Products Into The Philippines?</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Get end-to-end milestone tracking, smart BOC form autofills, and safe Stellar multisig escrow protection.
            </p>
          </div>
          <button 
            id="btn-public-cta-register"
            onClick={onNavigateToAuth}
            className="px-5 py-2.5 rounded-lg bg-[#1A66FF] hover:bg-white text-white hover:text-[#001240] font-bold text-xs transition cursor-pointer"
          >
            Create Your Account Free
          </button>
        </div>
      </div>

    </div>
  );
}
