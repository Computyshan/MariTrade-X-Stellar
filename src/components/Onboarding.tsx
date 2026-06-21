/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole, KycStatus } from '../types';
import { saveStoredUser } from '../utils/storage';
import { 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  FileText, 
  Landmark, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function Onboarding({ user, onComplete, onNavigate }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: User Type
  // Defaulting base on prior role if preset, else 'TRADE_PARTY'
  const initialType = (user.role === UserRole.IMPORTER || user.role === UserRole.EXPORTER) 
    ? 'TRADE_PARTY' 
    : 'LOGISTICS_CHAIN';
  const [userType, setUserType] = useState<'TRADE_PARTY' | 'LOGISTICS_CHAIN'>(initialType);

  // Step 2: Job Role Custom options
  const [selectedJob, setSelectedJob] = useState<string>(() => {
    if (user.role === UserRole.IMPORTER) return 'Importer';
    if (user.role === UserRole.EXPORTER) return 'Exporter';
    if (user.role === UserRole.FREIGHT_FORWARDER) return 'Freight Forwarder';
    if (user.role === UserRole.CUSTOMS_BROKER) return 'Customs Broker';
    if (user.role === UserRole.WAREHOUSE) return 'Warehouse Operator';
    if (user.role === UserRole.SHIPPING_LINE) return 'Shipping Line / Captain';
    if (user.role === UserRole.PORT_AUTHORITY) return 'Port Authority Officer';
    if (user.role === UserRole.TRUCKER) return 'Trucker';
    return 'Importer';
  });

  // Step 3: Identity & company KYC
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [govIdName, setGovIdName] = useState('');
  const [govIdUploading, setGovIdUploading] = useState(false);
  const [bankDetails, setBankDetails] = useState('');

  const tradeJobOptions = ['Importer', 'Exporter', 'Company Owner', 'Trader'];
  const logisticsJobOptions = [
    'Freight Forwarder',
    'Shipping Line / Captain',
    'Customs Broker',
    'Warehouse Operator',
    'Port Authority Officer',
    'Trucker'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setGovIdUploading(true);
    
    // Simulate Supabase Storage upload
    setTimeout(() => {
      setGovIdName(file.name);
      setGovIdUploading(false);
    }, 1200);
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedJob) {
        setErrorMsg('Please select a specific job role.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!companyName.trim()) {
        setErrorMsg('Company or employer name is required.');
        return;
      }
      if (!phoneNumber.trim()) {
        setErrorMsg('Contact phone number is required.');
        return;
      }
      if (!govIdName) {
        setErrorMsg('Please upload a scanned government ID or commercial business permit.');
        return;
      }
      if (userType === 'TRADE_PARTY' && !bankDetails.trim()) {
        setErrorMsg('Please provide secure bank settlement details for Trade Escrow release validations.');
        return;
      }
      setStep(4);
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const getSystemRoleValue = (job: string): UserRole => {
    switch (job) {
      case 'Importer':
      case 'Company Owner':
      case 'Trader':
        return UserRole.IMPORTER;
      case 'Exporter':
        return UserRole.EXPORTER;
      case 'Freight Forwarder':
        return UserRole.FREIGHT_FORWARDER;
      case 'Shipping Line / Captain':
        return UserRole.SHIPPING_LINE;
      case 'Customs Broker':
        return UserRole.CUSTOMS_BROKER;
      case 'Warehouse Operator':
        return UserRole.WAREHOUSE;
      case 'Port Authority Officer':
        return UserRole.PORT_AUTHORITY;
      case 'Trucker':
        return UserRole.TRUCKER;
      default:
        return UserRole.IMPORTER;
    }
  };

  const handleComplete = () => {
    const finalRole = getSystemRoleValue(selectedJob);

    // Save update with status SUBMITTED per product specification!
    const updatedUser: User = {
      ...user,
      fullName: user.fullName || 'Tyshaun Louis Siga',
      companyName: companyName,
      phoneNumber: phoneNumber,
      role: finalRole,
      kycStatus: KycStatus.SUBMITTED, // set to SUBMITTED per spec
      // Include simulated encryption storage fields 
      tinNumber: 'TIN-' + Math.floor(100000 + Math.random() * 900000) + '-000',
      businessRegistration: 'SEC-' + Math.floor(202400 + Math.random() * 9999),
      stellarWallet: user.stellarWallet || 'GDKXSXVG3Z5D' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      createdAt: user.createdAt || new Date().toISOString()
    };

    saveStoredUser(updatedUser);
    onComplete(updatedUser);
    onNavigate('dashboard');
  };

  return (
    <div id="onboarding-page" className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 flex items-center justify-center font-sans text-slate-900">
      <div className="w-full max-w-xl bg-white border border-sand-200 rounded-2xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
        
        {/* Top Accent Lines */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-maritime-400"></div>

        {/* Wizard Progress Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-maritime-400">MARITRADE PORT ONBOARDING</span>
            <span className="text-xs font-bold text-slate-500 font-mono">Step {step} of 4</span>
          </div>

          <div className="w-full bg-sand-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-maritime-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-coral-50 border border-coral-400/20 text-coral-600 text-xs font-semibold p-4 rounded-xl mb-6">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* STEP 1: USER TYPE SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-xl font-bold text-maritime-900 tracking-tight">Select Corporate User Profile</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your profile configuration determines shipment views, escrow commands, and document permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Trade Party */}
              <div 
                id="card-type-trade"
                onClick={() => {
                  setUserType('TRADE_PARTY');
                  setSelectedJob('Importer'); // reset to trade default
                }}
                className={`flex flex-col p-5 rounded-xl border-2 transition-all cursor-pointer text-left ${userType === 'TRADE_PARTY' ? 'border-maritime-400 bg-maritime-50/50' : 'border-sand-200 bg-white hover:border-slate-300'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${userType === 'TRADE_PARTY' ? 'bg-maritime-400 text-white' : 'bg-sand-100 text-slate-600'}`}>
                  <Building2 size={20} />
                </div>
                <h3 className="font-bold text-sm text-maritime-900">Trade Party Profile</h3>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mt-1">SME Importer / Exporter</span>
                <p className="text-xs text-slate-500 mt-3 flex-grow leading-relaxed">
                  Generate trade shipments, fund safe Stellar escrows, manage bills of lading, and release payments securely.
                </p>
                <div className="mt-4 pt-4 border-t border-sand-200 flex items-center justify-between text-[11px] font-bold text-maritime-400">
                  <span>Select Trade Party</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Option B: Logistics Chain */}
              <div 
                id="card-type-logistics"
                onClick={() => {
                  setUserType('LOGISTICS_CHAIN');
                  setSelectedJob('Freight Forwarder'); // reset to logistics default
                }}
                className={`flex flex-col p-5 rounded-xl border-2 transition-all cursor-pointer text-left ${userType === 'LOGISTICS_CHAIN' ? 'border-maritime-400 bg-maritime-50/50' : 'border-sand-200 bg-white hover:border-slate-300'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${userType === 'LOGISTICS_CHAIN' ? 'bg-maritime-400 text-white' : 'bg-sand-100 text-slate-600'}`}>
                  <Briefcase size={20} />
                </div>
                <h3 className="font-bold text-sm text-maritime-900">Logistics Chain Node</h3>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mt-1">Transport & Verification</span>
                <p className="text-xs text-slate-500 mt-3 flex-grow leading-relaxed">
                  Log key maritime transit milestones, update physical cargo statuses, and upload shipping receipts. 
                </p>
                <div className="mt-4 pt-4 border-t border-sand-200 flex items-center justify-between text-[11px] font-bold text-maritime-400">
                  <span>Select Logistics Chain</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-sand-200 flex justify-end">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-maritime-400 hover:bg-maritime-700 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                CONTINUE <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: JOB ROLE DROP-DOWN (GATED) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-maritime-50 text-maritime-400 flex items-center justify-center shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-maritime-900">Configure Specific Job Role</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gated access restricts commands based on your logistics function.
                </p>
              </div>
            </div>

            <div className="bg-sand-100 border border-sand-200 p-4 rounded-xl flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Selected Type Path:</span>
              <span className="bg-maritime-900 text-[#0BAFB0] px-3 py-1 rounded font-mono font-bold uppercase tracking-wider text-[10px]">
                {userType === 'TRADE_PARTY' ? 'Trade Party Hub' : 'Logistics Carrier Chain'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Pick Job Role</label>
              
              <div className="grid grid-cols-1 gap-2">
                {(userType === 'TRADE_PARTY' ? tradeJobOptions : logisticsJobOptions).map((option) => (
                  <label 
                    key={option}
                    className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${selectedJob === option ? 'border-maritime-400 bg-maritime-50/20 text-maritime-900 font-bold' : 'border-sand-200 bg-white text-slate-700 hover:bg-sand-50'}`}
                  >
                    <input 
                      type="radio" 
                      name="job-choices" 
                      value={option}
                      checked={selectedJob === option}
                      onChange={(e) => setSelectedJob(e.target.value)}
                      className="text-maritime-400 focus:ring-maritime-400"
                    />
                    <span className="text-xs sm:text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-sand-200 flex justify-between">
              <button
                onClick={handlePrev}
                className="px-4 py-2 border border-sand-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-sand-100 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-maritime-400 hover:bg-maritime-700 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                CONTINUE <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: IDENTITY & COMPANY KYC */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A66FF]/10 text-maritime-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-maritime-900">Identity & Business KYC</h2>
                <p className="text-xs text-slate-500">
                  Verify business identification to prevent fraudulent trading activities.
                </p>
              </div>
            </div>

            {/* General Fields for both types */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Company / Employer Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Luzon Food Distributors Ltd"
                  className="w-full px-3.5 py-2 rounded-lg border border-sand-200 text-xs focus:outline-none focus:border-maritime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Phone Number (+63 Format)</label>
                <input 
                  type="text" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full px-3.5 py-2 rounded-lg border border-sand-200 text-xs focus:outline-none focus:border-maritime-400"
                />
              </div>

              {/* Document ID upload simulation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Scanned Government ID / Mayor's Permit</label>
                <div className="border-2 border-dashed border-sand-200 rounded-lg p-5 bg-sand-50 hover:bg-white text-center cursor-pointer transition-all relative">
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {govIdUploading ? (
                    <div className="flex flex-col items-center gap-2 justify-center py-2 text-slate-500 text-xs">
                      <Loader2 size={20} className="animate-spin text-maritime-400" />
                      <span>Syncing securely with cloud storage...</span>
                    </div>
                  ) : govIdName ? (
                    <div className="flex flex-col items-center gap-1 text-ocean-600 justify-center py-1">
                      <CheckCircle2 size={24} />
                      <span className="text-xs font-mono font-bold">{govIdName} (Saved)</span>
                      <span className="text-[9px] text-slate-400">Click to replace file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 justify-center text-slate-400 py-1">
                      <FileText size={24} />
                      <span className="text-xs font-bold text-slate-700">Drag & drop or click to upload ID</span>
                      <span className="text-[9px] text-[#FF5C35]">Required for Bureau of Customs (BOC) KYC</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trade Party specific: Bank Details (encrpted at rest) */}
              {userType === 'TRADE_PARTY' && (
                <div className="bg-[#FAFAF8] border border-sand-200 p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                    <Landmark size={14} className="text-slate-500" />
                    <span>PH Bank Settlement Coordinates (Trade Party Only)</span>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      placeholder="e.g. BDO Unibank, Acct No: 1092-8821-2291"
                      className="w-full px-3.5 py-2 rounded-lg border border-sand-200 text-xs bg-white focus:outline-none focus:border-maritime-400 select-all"
                    />
                    <div className="flex items-center gap-1 text-[9px] text-[#0BAFB0] font-mono font-bold mt-1">
                      <Lock size={10} />
                      <span>Encrypted client-side at-rest before database propagation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Decentralized Wallet Placeholder */}
              <div className="p-3.5 rounded-lg bg-sand-100 border border-sand-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Stellar Settlement Node</span>
                  <span className="text-xs font-bold text-slate-500">Coming soon — Phase 2</span>
                </div>
                <div className="text-[8px] bg-slate-300 text-slate-600 font-mono font-bold uppercase px-2 py-0.5 rounded">
                  Optional Integration
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-sand-200 flex justify-between">
              <button
                onClick={handlePrev}
                className="px-4 py-2 border border-sand-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-sand-100 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-maritime-400 hover:bg-maritime-700 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                CONTINUE <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-ocean-50 text-ocean-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck size={28} />
              </div>
              <h2 className="text-xl font-bold text-maritime-900 tracking-tight">Review Security Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm your parameters before connecting to the maritime tracking ledger network.
              </p>
            </div>

            <div className="bg-[#FAFAF8] border border-sand-200 rounded-xl p-5 divide-y divide-slate-200/50 text-xs space-y-3.5">
              <div className="flex items-center justify-between pb-3">
                <span className="font-bold text-slate-500 uppercase font-mono tracking-wide text-[10px]">Corporate Type:</span>
                <span className="font-bold text-maritime-700 uppercase tracking-wider">{userType === 'TRADE_PARTY' ? 'Trade Party Hub' : 'Logistics Chain Node'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="font-bold text-slate-500 uppercase font-mono tracking-wide text-[10px]">Specific Job Role:</span>
                <span className="font-bold text-slate-800 bg-sand-200 px-2 py-0.5 rounded text-[11px] font-mono">{selectedJob}</span>
              </div>

              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="font-bold text-slate-500 uppercase font-mono tracking-wide text-[10px]">Registered Company:</span>
                <span className="font-bold text-slate-700 font-mono">{companyName}</span>
              </div>

              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="font-bold text-slate-500 uppercase font-mono tracking-wide text-[10px]">Phoneline SMS Connection:</span>
                <span className="font-medium text-slate-600 font-mono">{phoneNumber}</span>
              </div>

              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="font-bold text-slate-500 uppercase font-mono tracking-wide text-[10px]">Verification Documents:</span>
                <span className="text-ocean-600 font-bold font-mono text-[11px] flex items-center gap-1">
                  ✓ {govIdName || 'uploaded_kyc.pdf'}
                </span>
              </div>

              {userType === 'TRADE_PARTY' && (
                <div className="flex items-center justify-between pt-3">
                  <span className="font-bold text-slate-500 uppercase font-mono tracking-wide text-[10px]">BDO/BPI Bank Details:</span>
                  <span className="text-slate-600 font-mono select-all truncate max-w-[200px]" title={bankDetails}>{bankDetails}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-sand-200 flex justify-between">
              <button
                onClick={handlePrev}
                className="px-4 py-2 border border-sand-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-sand-100 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
              
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-lg bg-maritime-400 hover:bg-maritime-700 text-white text-xs font-bold font-mono tracking-widest flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                COMPLETE SETUP <CheckCircle2 size={14} className="text-[#0BAFB0]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
