/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shipment, DocumentType, User } from '../types';
import { FileIcon, Search, Download, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadDocumentInStorage } from '../utils/storage';

interface DocumentsTabProps {
  shipments: Shipment[];
  user: User | null;
  onUpdate?: () => void;
}

export default function DocumentsTab({ shipments, user, onUpdate }: DocumentsTabProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sieve all documents from all filtered shipments
  const allDocs = shipments.flatMap(s => 
    s.documents.map(d => ({
      ...d,
      shipmentRef: s.referenceCode,
      shipmentDesc: s.description,
      shipmentId: s.id
    }))
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const documentTypesList = ['ALL', ...Object.keys(DocumentType)];

  const filteredDocs = allDocs.filter(d => {
    const matchesType = filterType === 'ALL' || d.type === filterType;
    const matchesSearch = d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.shipmentRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // State for the Virtual Compiler
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [uploadDocType, setUploadDocType] = useState<DocumentType>(DocumentType.COMMERCIAL_INVOICE);
  const [fileNameInput, setFileNameInput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle document compilation
  const handleCompileDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCompileSuccess(false);

    if (!selectedShipmentId) {
      setErrorMsg('Choose an active shipment voyage block to bind the document to.');
      return;
    }

    if (!fileNameInput.trim()) {
      setErrorMsg('Please specify a filename for the customs filing.');
      return;
    }

    // Ensure valid file extension or auto-append pdf
    let finalFileName = fileNameInput.trim();
    if (!finalFileName.toLowerCase().endsWith('.pdf') && !finalFileName.toLowerCase().endsWith('.png') && !finalFileName.toLowerCase().endsWith('.jpg')) {
      finalFileName += '.pdf';
    }

    setIsCompiling(true);

    setTimeout(() => {
      try {
        const uName = user?.fullName || 'Trade Entity';
        uploadDocumentInStorage(
          selectedShipmentId,
          uploadDocType,
          finalFileName,
          '#', // Simulate secure database storage link
          uName
        );

        setIsCompiling(false);
        setCompileSuccess(true);
        setSelectedShipmentId('');
        setFileNameInput('');
        
        // Trigger parent state update
        if (onUpdate) {
          onUpdate();
        }
      } catch (err) {
        setIsCompiling(false);
        setErrorMsg('Security authorization failed or record conflict occurred.');
      }
    }, 1500);
  };

  const isTradeParty = user?.role === 'IMPORTER' || user?.role === 'EXPORTER' || user?.role === 'CUSTOMS_BROKER';

  return (
    <div id="documents-tab" className="space-y-6 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      {/* Top Banner Details */}
      <div className="bg-[#001240] text-white rounded-xl p-6 shadow-sm border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#0BAFB0] font-mono tracking-wider">SECURE FILING REGISTRY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0BAFB0] animate-pulse"></span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
            Bureau of Customs Document Vault
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Operating Node:</span>
            <strong className="text-white font-mono">{user?.companyName}</strong>
            <span className="text-slate-500">|</span>
            <span>Role:</span>
            <strong className="text-[#0BAFB0] font-mono uppercase bg-white/[0.05] px-2 py-0.5 rounded text-[10px]">{user?.role?.replace(/_/g, ' ')}</strong>
          </div>
        </div>
        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0 justify-between sm:justify-start font-mono">
          <div className="text-center md:text-left">
            <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase">My Cargo Bookings</span>
            <strong className="text-xl font-extrabold text-[#0BAFB0]">{shipments.length}</strong>
          </div>
          <div className="text-center md:text-left pl-4 border-l border-white/10">
            <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase">Compiled Files</span>
            <strong className="text-xl font-extrabold text-white">{allDocs.length}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area: View and Filter Compiled Legal Files (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action and Filter Controls */}
          <div className="bg-white border border-[#E5E3DA] rounded-xl p-4 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
              {/* Search input */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search by filename or Shipment Ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E3DA] rounded-lg text-xs bg-[#FAFAF7] hover:bg-white focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Counter Display */}
              <div className="text-[11px] text-slate-500 font-mono text-right shrink-0">
                Found {filteredDocs.length} of {allDocs.length} total legal logs
              </div>
            </div>

            {/* Document type quick switchers */}
            <div className="flex gap-1.5 flex-wrap border-t border-[#FAFAF7] pt-3">
              {documentTypesList.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider font-mono uppercase transition-all cursor-pointer ${
                    filterType === t 
                      ? 'bg-[#1A66FF] text-white shadow-xs' 
                      : 'bg-[#FAFAF7] hover:bg-[#E5E3DA] text-slate-600 border border-[#E5E3DA]'
                  }`}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

          </div>

          {/* Docs Listing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-[#E5E3DA] rounded-xl p-12 text-center text-xs text-slate-400 font-mono">
                No matching legal filing records found in this vault.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div key={doc.id} className="bg-white border border-[#E5E3DA] rounded-xl p-5 space-y-4 hover:shadow-xs transition flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center shrink-0">
                          <FileIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[8px] uppercase tracking-wider font-bold font-mono text-[#078384] mb-0.5">
                            {doc.type.replace(/_/g, ' ')}
                          </span>
                          <h4 className="font-bold text-slate-800 text-xs truncate max-w-[170px]" title={doc.fileName}>
                            {doc.fileName}
                          </h4>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <span className="bg-[#EEF4FF] text-[#1A66FF] text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                        v{doc.version}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#FAFAF7] border border-[#E5E3DA] rounded-lg text-[10px] space-y-1 font-mono">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">Cargo Voyage Ref:</span>
                        <span className="text-[#1A66FF]">{doc.shipmentRef}</span>
                      </div>
                      <div className="truncate text-slate-500 max-w-[200px]" title={doc.shipmentDesc}>
                        {doc.shipmentDesc}
                      </div>
                      <div className="text-[9px] text-slate-400 pt-0.5 border-t border-[#E5E3DA]/40 mt-1">
                        Issuer: {doc.uploadedByName}
                      </div>
                    </div>
                  </div>

                  {/* Actions summary */}
                  <div className="flex justify-end pt-2.5 border-t border-[#E5E3DA]">
                    <button
                      onClick={() => alert(`Broadcasting and downloading raw network binary: ${doc.fileName}`)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E5E3DA] bg-white hover:bg-[#FAFAF7] text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition"
                    >
                      <Download size={11} />
                      <span>Download</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Area: Interactive Virtual Document Compiler Panel (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E3DA] rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-[#E5E3DA] pb-3.5">
              <h3 className="font-extrabold text-[#001240] text-sm flex items-center gap-2">
                <Plus size={16} className="text-[#1A66FF]" />
                Compile Virtual Filing
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Produce virtual customs documents directly for your verified shipments to compile BOC vaults.
              </p>
            </div>

            {isTradeParty ? (
              <form onSubmit={handleCompileDocument} className="space-y-4 text-xs">
                
                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-700 font-semibold flex items-start gap-1.5 animate-shake">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {compileSuccess && (
                  <div className="p-2.5 bg-green-50 border border-green-100 rounded-lg text-[11px] text-green-700 font-semibold flex items-start gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-green-600" />
                    <span>Document compiled successfully! Added directly to shipment log.</span>
                  </div>
                )}

                {/* Voyage selection */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600">Select Ship Voyage Block</label>
                  {shipments.length === 0 ? (
                    <div className="p-2 bg-slate-50 text-[10px] text-slate-400 font-mono rounded border border-[#E5E3DA]">
                      No active cargo voyages found for your company profile.
                    </div>
                  ) : (
                    <select
                      value={selectedShipmentId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setSelectedShipmentId(sId);
                        const sh = shipments.find(s => s.id === sId);
                        if (sh) {
                          setFileNameInput(`${sh.referenceCode}_${uploadDocType.toLowerCase().replace(/_/g, '_')}.pdf`);
                        }
                      }}
                      className="w-full px-3 py-2 border border-[#E5E3DA] rounded-lg bg-[#FAFAF7] hover:bg-white focus:bg-white outline-none font-mono"
                    >
                      <option value="">-- Choose Shipment --</option>
                      {shipments.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.referenceCode} ({s.description.substring(0, 22)}...)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Doc classification */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600">Filing Classification</label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => {
                      const type = e.target.value as DocumentType;
                      setUploadDocType(type);
                      const sh = shipments.find(s => s.id === selectedShipmentId);
                      if (sh) {
                        setFileNameInput(`${sh.referenceCode}_${type.toLowerCase().replace(/_/g, '_')}.pdf`);
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#E5E3DA] rounded-lg bg-[#FAFAF7] hover:bg-white focus:bg-white outline-none font-mono"
                  >
                    {Object.keys(DocumentType).map((typeKey) => (
                      <option key={typeKey} value={typeKey}>
                        {typeKey.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom filename */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600">Filing Name Target</label>
                  <input
                    type="text"
                    placeholder="e.g. COMMERCIAL_INVOICE_v2"
                    value={fileNameInput}
                    onChange={(e) => setFileNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E3DA] rounded-lg bg-[#FAFAF7] hover:bg-white focus:bg-white outline-none font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCompiling || shipments.length === 0}
                  className="w-full py-2.5 bg-[#1A66FF] hover:bg-blue-700 text-white font-bold rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCompiling ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      <span>Broadcasting Ledger...</span>
                    </>
                  ) : (
                    <span>Compile & Archive Document</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-3.5 text-center text-slate-500 font-semibold space-y-2">
                <AlertCircle className="mx-auto text-amber-500" size={18} />
                <p className="text-[11px]">Submission locked for your role node.</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Only authenticated Importers, Exporters, and Customs Brokers may register official Bureau of Customs documents.
                </p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[10px] text-amber-900 font-medium space-y-1.5">
            <span className="font-bold block text-xs">⚠️ BOC Regulatory Compliance</span>
            <p>
              Any filing compiled and recorded in this vault is automatically mirrored onto Stellar's encrypted decentralized metadata logs. Falsified records trigger instant compliance freezes on the safe escrow contracts.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
