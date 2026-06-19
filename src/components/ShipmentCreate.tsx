/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createNewShipmentInStorage, uploadDocumentInStorage } from '../utils/storage';
import { Shipment, DocumentType } from '../types';
import { Ship, FileIcon, Loader2, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

interface ShipmentCreateProps {
  onShipmentCreated: (shipment: Shipment) => void;
  onCancel: () => void;
}

export default function ShipmentCreate({ onShipmentCreated, onCancel }: ShipmentCreateProps) {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1 Form States
  const [originCountry, setOriginCountry] = useState('China');
  const [destinationPort, setDestinationPort] = useState('Manila (MICP)');
  const [description, setDescription] = useState('');
  const [totalValueUSD, setTotalValueUSD] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [exporterEmail, setExporterEmail] = useState('');
  const [exporterName, setExporterName] = useState('');

  // Step 2 Document Simulation States
  const [documents, setDocuments] = useState<{ [key in DocumentType]?: { name: string; url: string } }>({});
  const [documentUploading, setDocumentUploading] = useState<{ [key in DocumentType]?: boolean }>({});

  const handleDocumentSelect = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Trigger loading status
    setDocumentUploading(prev => ({ ...prev, [type]: true }));

    setTimeout(() => {
      setDocuments(prev => ({
        ...prev,
        [type]: { name: file.name, url: '#' }
      }));
      setDocumentUploading(prev => ({ ...prev, [type]: false }));
    }, 1200);
  };

  const handleNextStep1 = () => {
    setErrorMsg('');
    if (!description.trim()) {
      setErrorMsg('Please enter a realistic cargo description (e.g., specific item numbers or models).');
      return;
    }
    if (!exporterName.trim()) {
      setErrorMsg('Please specify the manufacturing exporter company name.');
      return;
    }
    const val = parseFloat(totalValueUSD);
    if (!totalValueUSD || isNaN(val) || val <= 0) {
      setErrorMsg('Please specify a valid positive value in USD for cargo insurance and escrow.');
      return;
    }
    if (!estimatedArrival) {
      setErrorMsg('Please select a target ETA delivery date.');
      return;
    }
    setStep(2);
  };

  const handleCreateShipment = () => {
    setErrorMsg('');
    try {
      // 1. Save shipment details
      const shipmentData = {
        exporterName,
        exporterEmail: exporterEmail || undefined,
        description,
        originCountry,
        destinationPort,
        totalValueUSD: parseFloat(totalValueUSD),
        escrowAmountUSD: parseFloat(totalValueUSD),
        estimatedArrival: new Date(estimatedArrival).toISOString()
      };

      const created = createNewShipmentInStorage(shipmentData);

      // 2. Upload any documents uploaded in form
      Object.keys(documents).forEach((docTypeKey) => {
        const type = docTypeKey as DocumentType;
        const uploadedDoc = documents[type];
        if (uploadedDoc) {
          uploadDocumentInStorage(created.id, type, uploadedDoc.name, uploadedDoc.url, 'Importer System');
        }
      });

      // 3. Callback
      onShipmentCreated(created);

    } catch (e) {
      setErrorMsg('Failed to compile shipment database rows. Try again.');
    }
  };

  const countries = [
    'China', 'Vietnam', 'Taiwan', 'Japan', 'Thailand', 'Singapore', 'South Korea', 'USA', 'Germany'
  ];

  const ports = [
    'Manila (MICP)', 'Cebu Port Terminal', 'Davao Terminal (Sasa Wharf)', 'Batangas International Port', 'General Santos Port'
  ];

  return (
    <div id="shipment-create-view" className="space-y-8 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-[#E5E3DA] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#001240] tracking-tight">Record International Cargo Shipment</h1>
          <p className="text-xs text-slate-500">Initiate a secure shipping track with Stellar escrow locking.</p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-[#E5E3DA] text-slate-600 hover:bg-[#F2F1EC] rounded-lg text-xs font-semibold transition"
        >
          Cancel & Return
        </button>
      </div>

      {/* Progress tracker */}
      <div className="max-w-xl mx-auto flex items-center justify-between font-mono text-xs uppercase font-bold text-slate-400 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#1A66FF]' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border-2 ${step >= 1 ? 'border-[#1A66FF] bg-[#EEF4FF]' : 'border-slate-300'}`}>1</span>
          <span>Shipment Params</span>
        </div>
        <ChevronRight size={14} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#1A66FF]' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border-2 ${step >= 2 ? 'border-[#1A66FF] bg-[#EEF4FF]' : 'border-slate-300'}`}>2</span>
          <span>Filing paperwork</span>
        </div>
        <ChevronRight size={14} />
        <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#1A66FF]' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border-2 ${step === 3 ? 'border-[#1A66FF] bg-[#EEF4FF]' : 'border-slate-300'}`}>3</span>
          <span>Review Ledger</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-[#FF5C35] text-xs font-semibold rounded-lg p-3.5 max-w-xl mx-auto">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Form Area */}
      <div className="max-w-xl mx-auto bg-white border border-[#E5E3DA] rounded-xl p-8 shadow-sm">
        
        {/* STEP 1: PARAMS */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-800 text-sm border-b border-[#E5E3DA] pb-3 mb-2">Transit & Manifest Parameters</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Origin Country</label>
                <select
                  id="sel-create-origin"
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E3DA] bg-white text-sm"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Destination Port (PH)</label>
                <select
                  id="sel-create-destination"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E3DA] bg-white text-sm font-semibold"
                >
                  {ports.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Exporter / Manufacturer Company</label>
              <input 
                id="inp-create-exporter-name"
                type="text" 
                placeholder="Yantian Heavy Industries Ltd."
                value={exporterName}
                onChange={(e) => setExporterName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Exporter Email (Optional)</label>
                <input 
                  id="inp-create-exporter-email"
                  type="email" 
                  placeholder="sales@exporter.com"
                  value={exporterEmail}
                  onChange={(e) => setExporterEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Cargo Escrow Valuation ($ USD)</label>
                <input 
                  id="inp-create-value"
                  type="number" 
                  placeholder="e.g. 12500"
                  value={totalValueUSD}
                  onChange={(e) => setTotalValueUSD(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm font-semibold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Target Cargo ETA</label>
                <input 
                  id="inp-create-arrival"
                  type="date" 
                  value={estimatedArrival}
                  onChange={(e) => setEstimatedArrival(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm font-mono"
                />
              </div>
              <div className="bg-[#EEF4FF] border border-[#C8DBFF] rounded-lg p-3 text-[11px] text-[#0047E0] leading-normal self-end/center mt-5">
                💡 <strong>Indicative PHP Settle conversion:</strong> ₱{(parseFloat(totalValueUSD || '0') * 56.5).toLocaleString()} PHP locked in multisig.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Detailed Cargo Manifest Description</label>
              <textarea 
                id="inp-create-description"
                placeholder="List specifications, quantity, models, and container dimensions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm"
              />
            </div>

            <div className="pt-4 border-t border-[#E5E3DA] flex justify-end">
              <button
                id="btn-create-step1-next"
                type="button"
                onClick={handleNextStep1}
                className="px-5 py-2.5 rounded-lg bg-[#001240] hover:bg-[#1A66FF] text-white text-sm font-bold transition-all cursor-pointer"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENTS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E5E3DA] pb-3 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Mandatory Legal Customs Paperwork</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-mono">BOC Forms</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed leading-normal">
              Uploading standard invoices and permits beforehand prevents dock/storage clearance holds. Filings are hashed onto cargo records.
            </p>

            {/* Document upload card grid */}
            {[
              { type: DocumentType.COMMERCIAL_INVOICE, title: 'Commercial Invoice (Invoice Document)' },
              { type: DocumentType.PACKING_LIST, title: 'Cargo Packing List (Pallet Info)' },
              { type: DocumentType.BILL_OF_LADING, title: 'Bill of Lading lading certificate' }
            ].map((docDef) => {
              const file = documents[docDef.type];
              const uploading = documentUploading[docDef.type];
              return (
                <div key={docDef.type} className="border border-[#E5E3DA] rounded-xl p-4 bg-[#FAFAF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center shrink-0 mt-0.5">
                      <FileIcon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{docDef.title}</h4>
                      {file ? (
                        <p className="text-[10px] text-[#0BAFB0] font-bold font-mono truncate max-w-[220px]">{file.name}</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 uppercase font-mono">No document attached (Optional now)</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 relative">
                    <input 
                      id={`file-upload-${docDef.type}`}
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleDocumentSelect(docDef.type, e)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {uploading ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono py-1">
                        <Loader2 className="animate-spin text-[#1A66FF]" size={14} />
                        <span>Uploading...</span>
                      </div>
                    ) : file ? (
                      <span className="text-xs text-[#0BAFB0] font-bold border border-[#0BAFB0]/30 px-3 py-1.5 rounded-lg bg-white shadow-sm block">✓ Replace File</span>
                    ) : (
                      <span className="text-xs text-[#1A66FF] font-bold border border-[#1A66FF]/20 px-3 py-1.5 rounded-lg bg-white hover:bg-[#EEF4FF] shadow-sm block">Attach File</span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="bg-[#FFF2EE] border border-[#FF5C35]/20 p-4 rounded-xl flex items-start gap-3 text-[11px] text-[#CC3A1C] leading-normal hover:shadow-xs transition">
              <AlertTriangle className="shrink-0 mt-0.5 text-[#FF5C35]" size={16} />
              <div>
                <strong>Missing paperwork warning:</strong> You can skip attaching files now, but escrow ledger transfers will require verified bills of lading to activate exporter payouts at Cebu or Manila ports.
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E3DA] flex justify-between">
              <button
                id="btn-create-step2-back"
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-[#E5E3DA] text-slate-600 hover:bg-[#F2F1EC] rounded-lg text-xs font-semibold cursor-pointer"
              >
                &lsaquo; Back Params
              </button>
              <div className="flex gap-2">
                <button
                  id="btn-create-step2-skip"
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Skip Papers for Now
                </button>
                <button
                  id="btn-create-step2-next"
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-lg bg-[#001240] hover:bg-[#1A66FF] text-white text-sm font-bold transition-all cursor-pointer"
                >
                  Verify Manifest &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW DETAILS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E5E3DA] pb-3 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Verify Ledger Registrations</h3>
              <span className="text-[10px] bg-[#EEF4FF] text-[#1A66FF] px-2.5 py-0.5 rounded font-bold font-mono">STELLAR REVIEW</span>
            </div>

            <div className="space-y-3 p-4 bg-[#FAFAF7] border border-[#E5E3DA] rounded-xl text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase font-mono">Consignee Importer:</span>
                <strong className="text-slate-800">Luzon General Merchandising</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase font-mono">Exporting Manufacturer:</span>
                <strong className="text-slate-800">{exporterName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase font-mono">Shipping Corridor:</span>
                <strong className="text-[#001240] font-semibold">{originCountry} &rarr; {destinationPort}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase font-mono">Consolidated Escrow Pool:</span>
                <strong className="text-semibold text-[#1A66FF] font-mono">${parseFloat(totalValueUSD).toLocaleString()} USD (approx. ₱{(parseFloat(totalValueUSD) * 56.5).toLocaleString()} PHP)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase font-mono">Target Logistics ETA:</span>
                <strong className="font-mono text-slate-800">{estimatedArrival}</strong>
              </div>
              <div className="border-t border-[#E5E3DA] pt-2 mt-2">
                <span className="block text-slate-400 font-mono text-[10px]">ATTACHED PAPERS LOGS:</span>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px] font-medium text-[#078384] font-mono">
                  {Object.keys(documents).length === 0 ? (
                    <li className="text-[#CC3A1C]">No documents attached. Prepare invoices as soon as possible.</li>
                  ) : (
                    Object.keys(documents).map((dk) => (
                      <li key={dk}>{dk.replace(/_/g, ' ')}: {documents[dk as DocumentType]?.name}</li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-[#EEF4FF] border border-[#C8DBFF] rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center shrink-0">
                <Ship size={18} />
              </div>
              <p className="text-xs text-[#0047E0] leading-normal font-sans">
                Upon creation, the cargo record receives a unique Philippine maritime track code. You will need to lock settlement funds onto Stellar before your forwarder departs origin.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5E3DA] flex justify-between">
              <button
                id="btn-create-step3-back"
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-[#E5E3DA] text-slate-600 hover:bg-[#F2F1EC] rounded-lg text-xs font-semibold cursor-pointer"
              >
                &lsaquo; Back Paperwork
              </button>
              <button
                id="btn-create-submit"
                type="button"
                onClick={handleCreateShipment}
                className="px-6 py-2.5 rounded-lg bg-[#0BAFB0] hover:bg-[#078384] text-white text-sm font-bold transition-all shadow-md cursor-pointer animate-pulse"
              >
                Register Shipment Entry &rarr;
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
