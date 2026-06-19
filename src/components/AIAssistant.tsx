/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  MapPin, 
  DollarSign, 
  FileCheck, 
  Loader2, 
  CloudRain, 
  Anchor,
  AlertTriangle
} from 'lucide-react';
import { 
  tagalogAssistant, 
  estimateFreightCost, 
  autofillBOCForm, 
  typhoonRerouting 
} from '../lib/gemini';

export default function AIAssistant() {
  
  // Chat Room States
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { 
      sender: 'ai', 
      text: "Mabuhay! Ako ang iyong MariTrade AI Broker. Matutulungan kita sa Philippine customs regulations, Stellar escrow status, o port handling inquiries. Maaari tayong mag-usap sa Tagalog o English!", 
      time: 'Just now' 
    }
  ]);
  const [chatInp, setChatInp] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Freight Estimator States
  const [origin, setOrigin] = useState('China');
  const [destPort, setDestPort] = useState('Cebu Port Terminal');
  const [weight, setWeight] = useState('500');
  const [cargoType, setCargoType] = useState('Dry General Cargo');
  const [loadingFreight, setLoadingFreight] = useState(false);
  const [freightResult, setFreightResult] = useState<{ usd: number; confidence: string; breakdown: string } | null>(null);

  // Autofill Form States
  const [invoiceText, setInvoiceText] = useState(
    "COMMERCIAL INVOICE #YHT-92801\nExporter: Yantian Corp, Shenzhen\nConsignee: Luzon General Merchandising, Manila\nDescription: Model AC-500 Air Compressors\nFreight: CIF Manila MICP\nTotal: $12,500.00"
  );
  const [loadingAutofill, setLoadingAutofill] = useState(false);
  const [autofillResult, setAutofillResult] = useState<Record<string, string> | null>(null);

  // Typhoon States
  const [loadingTyphoon, setLoadingTyphoon] = useState(false);
  const [typhoonResult, setTyphoonResult] = useState<{Suggested: string, Reason: string} | null>(null);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInp.trim()) return;

    const userMsg = chatInp;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatInp('');
    setSendingChat(true);

    try {
      const response = await tagalogAssistant(userMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: response, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Pasensya na po, nagkaroon ng isyu sa pagkonekta sa aking mainnet channels. Subukan muli mamaya.", time: 'Now' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleRunFreight = async () => {
    setLoadingFreight(true);
    setFreightResult(null);
    try {
      const res = await estimateFreightCost({
        originCountry: origin,
        destinationPort: destPort,
        cargoWeightKg: parseFloat(weight) || 100,
        cargoType: cargoType
      });
      setFreightResult({
        usd: res.estimatedUSD,
        confidence: res.confidence,
        breakdown: res.breakdown
      });
    } catch (e) {
      // Fallback
    } finally {
      setLoadingFreight(false);
    }
  };

  const handleRunAutofill = async () => {
    setLoadingAutofill(true);
    setAutofillResult(null);
    try {
      const res = await autofillBOCForm(invoiceText);
      setAutofillResult(res);
    } catch (e) {
      // Fallback
    } finally {
      setLoadingAutofill(false);
    }
  };

  const handleRunTyphoon = async () => {
    setLoadingTyphoon(true);
    setTyphoonResult(null);
    try {
      const res = await typhoonRerouting({
        currentRoute: `Sailing direct route ${origin} to Port of ${destPort}`,
        weatherData: "Active high pressure trough developing 150km near Balintang Channel. 35-knot crosswinds detected."
      });
      setTyphoonResult({
        Suggested: res.suggestedRoute,
        Reason: res.reason
      });
    } catch (e) {
      // Fallback
    } finally {
      setLoadingTyphoon(false);
    }
  };

  return (
    <div id="ai-assistant-view" className="space-y-8 animate-fade-in p-8 bg-[#FAFAF7] flex-1 overflow-y-auto">
      
      {/* Title */}
      <div className="border-b border-[#E5E3DA] pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#001240] tracking-tight flex items-center gap-2">
            <Sparkles className="text-[#1A66FF] animate-pulse" size={24} />
            <span>MariTrade Customs AI Command Suite</span>
          </h1>
          <p className="text-xs text-slate-500">Autonomous trade intelligence, freight analytics, and local Bureau of Customs assistants.</p>
        </div>
        <div className="bg-[#EEF4FF] border border-[#C8DBFF] text-[11px] font-mono select-none px-3 py-1.5 rounded-full text-[#0047E0] font-bold">
          GEMINI-1.5-PRO COGNITIVE
        </div>
      </div>

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE CHAT (5/12 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5E3DA] rounded-xl overflow-hidden shadow-sm flex flex-col h-[650px]">
          
          <div className="p-4 bg-[#001240] text-slate-100 flex items-center gap-3">
            <Bot size={20} className="text-[#0BAFB0]" />
            <div>
              <h3 className="font-bold text-sm">Portside Copilot Chat</h3>
              <p className="text-[10px] text-slate-400">Tagalog & English Customs Broker Desk</p>
            </div>
          </div>

          {/* Chat scrolling feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAFAF7]/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-xl text-xs space-y-1.5 leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-[#1A66FF] text-white rounded-br-none' 
                    : 'bg-white border border-[#E5E3DA] text-slate-800 rounded-bl-none shadow-xs'
                }`}>
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {sendingChat && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Loader2 className="animate-spin text-[#1A66FF]" size={14} />
                <span>AI is compiling shipping guidelines...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-4 border-t border-[#E5E3DA] bg-white flex gap-2">
            <input
              id="inp-chat-ai"
              type="text"
              placeholder="Ask about Stellar escrows, tax duties, import certs..."
              value={chatInp}
              onChange={(e) => setChatInp(e.target.value)}
              className="flex-1 bg-[#FAFAF7] border border-[#E5E3DA] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A66FF]"
            />
            <button
              id="btn-send-chat"
              type="submit"
              className="p-2 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white transition shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: AI SUITE OPERATIONS (7/12 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Module 1: Intelligent freight Estimator */}
          <div className="bg-white border border-[#E5E3DA] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#E5E3DA] pb-3 mb-2">
              <DollarSign className="text-[#0BAFB0]" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">AI Tariff & International Freight Estimator</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 font-mono uppercase">Origin Location</label>
                <select value={origin} onChange={(e)=>setOrigin(e.target.value)} className="w-full p-2 border border-[#E5E3DA] rounded bg-white">
                  <option value="China">China (Shenzhen)</option>
                  <option value="Vietnam">Vietnam (Ho Chi Minh)</option>
                  <option value="Taiwan">Taiwan (Kaohsiung)</option>
                  <option value="Japan">Japan (Yokohama)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 font-mono uppercase">Target Port</label>
                <select value={destPort} onChange={(e)=>setDestPort(e.target.value)} className="w-full p-2 border border-[#E5E3DA] rounded bg-white">
                  <option value="Manila (MICP)">Manila MICP</option>
                  <option value="Cebu Port Terminal">Cebu Port</option>
                  <option value="Davao Terminal (Sasa Wharf)">Davao Sasa Wharf</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 font-mono uppercase">Cargo Weight (kg)</label>
                <input type="number" value={weight} onChange={(e)=>setWeight(e.target.value)} className="w-full p-2 border border-[#E5E3DA] rounded font-mono" />
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 font-mono uppercase">Action</label>
                <button
                  id="btn-run-freight-ai"
                  onClick={handleRunFreight}
                  disabled={loadingFreight}
                  className="w-full py-2 bg-[#0BAFB0] hover:bg-[#078384] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  {loadingFreight ? <Loader2 className="animate-spin" size={12} /> : <span>Run Forecast</span>}
                </button>
              </div>
            </div>

            {freightResult && (
              <div className="p-4 bg-[#F0FAFA] border border-[#0BAFB0]/20 rounded-xl space-y-2.5 animate-fade-in text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-[#078384] font-bold">Projected Ocean Billing Settle Pool</span>
                    <strong className="text-xl font-bold text-slate-800">${freightResult.usd.toLocaleString()} USD</strong>
                  </div>
                  <span className="text-[9px] uppercase font-mono font-bold bg-[#0BAFB0]/15 text-[#078384] px-2.5 py-1 rounded">
                    {freightResult.confidence}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E5E3DA] font-mono text-[10px] whitespace-pre-line text-slate-600 leading-normal">
                  {freightResult.breakdown}
                </div>
              </div>
            )}
          </div>

          {/* Module 2: Autofill Custom Form */}
          <div className="bg-white border border-[#E5E3DA] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#E5E3DA] pb-3 mb-2">
              <FileCheck className="text-[#1A66FF]" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Philippine BOC Single Administrative Document (SAD) Autofill</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-500 leading-normal">
                Paste raw packing lists, order commercial invoice texts, or forwarder billing sheets. Gemini classifies trade indexes into standard customs declaration structures immediately.
              </p>
              
              <textarea
                id="doc-invoice-input-ai"
                rows={3}
                value={invoiceText}
                onChange={(e) => setInvoiceText(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAF7] border border-[#E5E3DA] rounded-lg font-mono text-[11px]"
              />

              <div className="flex justify-end">
                <button
                  id="btn-run-autofill-ai"
                  onClick={handleRunAutofill}
                  disabled={loadingAutofill}
                  className="px-4 py-2 bg-[#1A66FF] hover:bg-[#0047E0] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {loadingAutofill ? (
                    <span className="flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> Parsing...</span>
                  ) : (
                    <span>Autofill BOC Fields</span>
                  )}
                </button>
              </div>
            </div>

            {autofillResult && (
              <div className="p-4 bg-[#EEF4FF] border border-[#C8DBFF] rounded-xl space-y-3 animate-fade-in text-xs">
                <span className="block text-[10px] uppercase font-mono text-[#0047E0] font-bold">Classified BOC Customs Index Parameters</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white border border-[#C8DBFF]/50 p-3 rounded-lg text-[11px]">
                  {Object.entries(autofillResult).map(([key, value]) => (
                    <div key={key} className="space-y-0.5">
                      <span className="block text-slate-400 capitalize">{key}:</span>
                      <strong className="text-slate-800 block truncate">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Module 3: Typhoon Warning Analyzer */}
          <div className="bg-white border border-[#E5E3DA] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#E5E3DA] pb-3 mb-2">
              <CloudRain className="text-[#FF5C35]" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Typhoon Port & Route Rerouting Suggestion</h3>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-normal">
                Analyze open ocean shipping Lanes against severe tropical depression paths developed under Pagasa warning metrics.
              </p>

              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono font-medium text-slate-500">Querying Pagasa-Luzon High Pressure SW Swells</span>
                <button
                  id="btn-run-typhoon-ai"
                  onClick={handleRunTyphoon}
                  disabled={loadingTyphoon}
                  className="px-4 py-2 border border-[#FF5C35]/30 hover:bg-[#FFF2EE] text-[#CC3A1C] text-xs font-bold rounded-lg cursor-pointer"
                >
                  {loadingTyphoon ? <Loader2 className="animate-spin" size={12} /> : <span>Analyze Oceanic Reroute</span>}
                </button>
              </div>

              {typhoonResult && (
                <div className="p-4 bg-[#FFF2EE] border border-[#FF5C35]/20 rounded-xl space-y-2 animate-fade-in text-[11px] leading-normal font-sans">
                  <div className="flex items-start gap-2 text-[#CC3A1C]">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <strong>Route Advisory Recommendation:</strong>
                  </div>
                  <p className="font-bold text-slate-800">{typhoonResult.Suggested}</p>
                  <p className="text-slate-500 font-mono text-[10px] pt-1 border-t border-[#FF5C35]/10 mt-1">{typhoonResult.Reason}</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
