/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shipment, DocumentType } from '../types';
import { FileIcon, Search, Download, ExternalLink } from 'lucide-react';

interface DocumentsTabProps {
  shipments: Shipment[];
}

export default function DocumentsTab({ shipments }: DocumentsTabProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sieve all documents from all shipments
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

  return (
    <div id="documents-tab" className="space-y-6 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      <div>
        <h1 className="text-2xl font-bold text-[#001240] tracking-tight">Bureau of Customs Document Vault</h1>
        <p className="text-xs text-slate-500 mt-1">Unified repository of cargo invoices, bill of lading, and SPS clearance permits.</p>
      </div>

      {/* Direct actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-[#E5E3DA] rounded-xl shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -track-y-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search by filename or Shipment Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E3DA] rounded-lg text-xs bg-[#FAFAF7] focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="flex gap-1.5 flex-wrap">
          {documentTypesList.slice(0, 5).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider font-mono uppercase transition-all ${
                filterType === t 
                  ? 'bg-[#1A66FF] text-white' 
                  : 'bg-slate-100 hover:bg-[#E5E3DA] text-slate-600'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-slate-400 font-mono">
            No matching legal files found. Check other cargo list consoles to upload paperwork.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white border border-[#E5E3DA] rounded-xl p-5 space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center shrink-0">
                    <FileIcon size={20} />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider font-semibold font-mono text-[#078384] mb-0.5">{doc.type.replace(/_/g, ' ')}</span>
                    <h4 className="font-bold text-slate-800 text-xs truncate max-w-[160px]" title={doc.fileName}>{doc.fileName}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <span className="bg-[#EEF4FF] text-[#1A66FF] text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase">
                  v{doc.version}
                </span>
              </div>

              <div className="p-3 bg-[#FAFAF7] border border-[#E5E3DA] rounded-lg text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Linked Shipment Ref:</span>
                  <span className="font-bold underline text-[#1A66FF] font-mono">{doc.shipmentRef}</span>
                </div>
                <p className="text-slate-500 line-clamp-1 truncate max-w-[200px]">{doc.shipmentDesc}</p>
              </div>

              {/* Download actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E5E3DA]">
                <button
                  onClick={() => alert(`Triggering download simulation for ${doc.fileName}...`)}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E3DA] hover:bg-[#F2F1EC] text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
