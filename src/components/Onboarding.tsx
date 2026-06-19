/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, KycStatus } from '../types';
import { saveStoredUser } from '../utils/storage';
import { generateKeypair } from '../lib/stellar';
import { Shield, Sparkles, Key, CheckCircle2, Copy, FileIcon, Loader2 } from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function Onboarding({ user, onComplete, onNavigate }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  
  // Step 2 KYC
  const [tin, setTin] = useState('');
  const [secOrDti, setSecOrDti] = useState('');
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [permitUploading, setPermitUploading] = useState(false);
  const [uploadedPermitName, setUploadedPermitName] = useState('');

  // Step 3 Stellar Wallet
  const [walletOption, setWalletOption] = useState<'create' | 'connect'>('create');
  const [publicKeyInput, setPublicKeyInput] = useState('');
  const [generatedPubKey, setGeneratedPubKey] = useState('');
  const [generatedSecKey, setGeneratedSecKey] = useState('');
  const [copiedSec, setCopiedSec] = useState(false);
  const [generatingWallet, setGeneratingWallet] = useState(false);

  // Status logs
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateWallet = async () => {
    setGeneratingWallet(true);
    setErrorMsg('');
    try {
      const keys = await generateKeypair();
      setGeneratedPubKey(keys.publicKey);
      setGeneratedSecKey(keys.secretKey);
    } catch (e) {
      setErrorMsg('Failed to run cryptographic keypair generator. Try again.');
    } finally {
      setGeneratingWallet(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setPermitFile(file);
    setPermitUploading(true);
    
    // Simulate Supabase Storage upload
    setTimeout(() => {
      setUploadedPermitName(file.name);
      setPermitUploading(false);
    }, 1500);
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!companyName.trim() || !phoneNumber.trim()) {
        setErrorMsg('Please confirm your registered business company details and phone number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!tin.trim() || !secOrDti.trim()) {
        setErrorMsg('Philippine Tax Identification Number (TIN) and SEC/DTI Registry numbers are required for KYC.');
        return;
      }
      if (!uploadedPermitName) {
        setErrorMsg('Please upload a scanned PDF copy or image proof of your Mayor\'s Permit or SEC certificate.');
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(step - 1);
  };

  const handleFinish = () => {
    setErrorMsg('');
    
    let wallet = '';
    let seed = '';

    if (walletOption === 'create') {
      if (!generatedPubKey) {
        setErrorMsg('Please click the "Generate Keypair" secure process code to proceed.');
        return;
      }
      if (!copiedSec) {
        setErrorMsg('CRITICAL: You must click copy and safely back up your stellar secret key seed! MariTrade does not store private keys.');
        return;
      }
      wallet = generatedPubKey;
      seed = generatedSecKey;
    } else {
      if (!publicKeyInput.startsWith('G') || publicKeyInput.length !== 56) {
        setErrorMsg('Stellar Public Key must start with "G" and be exactly 56 characters long.');
        return;
      }
      wallet = publicKeyInput;
    }

    const updatedUser: User = {
      ...user,
      companyName,
      phoneNumber,
      stellarWallet: wallet,
      stellarSeed: seed,
      kycStatus: KycStatus.VERIFIED, // verified automatically in SME demo context
      tinNumber: tin,
      businessRegistration: secOrDti
    };

    saveStoredUser(updatedUser);
    onComplete(updatedUser);
    onNavigate('dashboard');
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(generatedSecKey);
    setCopiedSec(true);
    setTimeout(() => setCopiedSec(false), 3000);
  };

  return (
    <div id="onboarding-page" className="min-h-screen bg-[#FAFAF7] font-sans flex items-center justify-center py-16 px-6">
      
      <div className="w-full max-w-xl bg-white border border-[#E5E3DA] rounded-2xl p-8 shadow-xl">
        
        {/* Progress Bar & Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#0BAFB0] font-bold">PORT INTEGRATION WIZARD</span>
            <span className="text-sm font-semibold text-slate-500">Step {step} of 3</span>
          </div>
          
          <div className="w-full bg-[#E5E3DA] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#1A66FF] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-[#FF5C35] text-xs font-semibold rounded-lg p-3.5 mb-6">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* STEP 1: COMPANY CONFIRMATION */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#001240]">Confirm Business Registration</h3>
                <p className="text-xs text-slate-500">Verify your current company profile for shipping ledger credentials.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Company Trade Name</label>
              <input 
                id="inp-onboard-company"
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
                placeholder="Luzon Agro General Merchandising"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Business Role Profile</label>
              <div className="p-3.5 rounded-lg bg-[#EEF4FF] border border-[#C8DBFF] text-xs font-medium text-[#0047E0] flex justify-between items-center">
                <span>Account Type: <strong className="uppercase font-mono">{user.role}</strong></span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded shadow-sm text-slate-500">Selected during signup</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Primary Phone Number (PH Format)</label>
              <input 
                id="inp-onboard-phone"
                type="text" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
                placeholder="+63 912 345 6789"
              />
            </div>

            <div className="pt-4 border-t border-[#E5E3DA] flex justify-end">
              <button 
                id="btn-onboard-next-1"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-lg bg-[#001240] hover:bg-[#1A66FF] text-white text-sm font-bold transition-all cursor-pointer"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PHILIPPINE BUSINESS KYC */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#0BAFB0]/10 text-[#0BAFB0] flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#001240]">Philippine Business KYC</h3>
                <p className="text-xs text-slate-500">Required by Bureau of Customs (BOC) for import processing.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tax Identification (TIN)</label>
                <input 
                  id="inp-onboard-tin"
                  type="text" 
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  placeholder="XXX-XXX-XXX-000"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">SEC / DTI Registration No.</label>
                <input 
                  id="inp-onboard-sec"
                  type="text" 
                  value={secOrDti}
                  onChange={(e) => setSecOrDti(e.target.value)}
                  placeholder="SEC-REG-YYYY-XXXX"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Simulated file upload to Supabase */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Upload Scanned Mayor's Business Permit</label>
              
              <div className="border-2 border-dashed border-[#E5E3DA] rounded-xl p-6 bg-[#FAFAF7] hover:bg-white text-center cursor-pointer transition-all relative">
                <input 
                  id="file-permit-upload"
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                
                {permitUploading ? (
                  <div className="flex flex-col items-center gap-2 text-slate-500 py-3">
                    <Loader2 className="animate-spin text-[#1A66FF]" size={28} />
                    <span className="text-xs font-mono">Syncing securely with cloud storage...</span>
                  </div>
                ) : uploadedPermitName ? (
                  <div className="flex flex-col items-center gap-2 text-[#0BAFB0] py-3">
                    <CheckCircle2 size={28} />
                    <span className="text-xs font-bold font-mono">{uploadedPermitName} (Uploaded)</span>
                    <span className="text-[10px] text-slate-400">Click or Drag to replace business document certs</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileIcon size={32} />
                    <span className="text-xs font-bold text-slate-700">Drag & drop your scanned permit file</span>
                    <span className="text-[10px] text-slate-400">Supports PDF, PNG, or JPG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E3DA] flex justify-between">
              <button 
                id="btn-onboard-back-2"
                onClick={prevStep}
                className="px-4 py-2 border border-[#E5E3DA] rounded-lg text-slate-600 hover:bg-[#F2F1EC] text-sm font-semibold transition-colors cursor-pointer"
              >
                &lsaquo; Back
              </button>
              <button 
                id="btn-onboard-next-2"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-lg bg-[#001240] hover:bg-[#1A66FF] text-white text-sm font-bold transition-all cursor-pointer"
              >
                Verify & Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: STELLAR WALLET INTEGRATION */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF5C35]/10 text-[#FF5C35] flex items-center justify-center">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#001240]">Set Up Settlement Wallet</h3>
                <p className="text-xs text-slate-500">Stellar wallet addresses are requested to securely power multisig escrows.</p>
              </div>
            </div>

            {/* Option Toggler */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#F2F1EC] rounded-lg">
              <button
                id="btn-wallet-opt-create"
                type="button"
                onClick={() => setWalletOption('create')}
                className={`py-2 text-xs font-bold rounded-md transition-all ${walletOption === 'create' ? 'bg-white text-[#1A66FF] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Create Stellar wallet
              </button>
              <button
                id="btn-wallet-opt-connect"
                type="button"
                onClick={() => setWalletOption('connect')}
                className={`py-2 text-xs font-bold rounded-md transition-all ${walletOption === 'connect' ? 'bg-white text-[#1A66FF] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Connect existing address
              </button>
            </div>

            {walletOption === 'create' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Generate a non-custodial Stellar address instantly. Your keys are created locally using secured WebCrypto algorithms.
                </p>

                {!generatedPubKey ? (
                  <button
                    id="btn-onboard-gen-wallet"
                    type="button"
                    onClick={handleCreateWallet}
                    disabled={generatingWallet}
                    className="w-full py-3.5 rounded-xl border-2 border-dashed border-[#1A66FF] bg-[#EEF4FF] hover:bg-[#C8DBFF] text-[#1A66FF] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {generatingWallet ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Initializing secure ledgers...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate Keypair For Me</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3.5 bg-[#FFF2EE] border border-[#FF5C35]/30 rounded-xl p-4">
                    <div>
                      <span className="block text-[10px] uppercase font-mono text-slate-500 font-bold">STELLAR PUBLIC KEY (SAFE TO SHARE)</span>
                      <div className="flex items-center justify-between text-xs font-mono bg-white p-2 rounded-lg border border-[#E5E3DA] mt-1 overflow-x-auto text-slate-800 break-all select-all">
                        <span>{generatedPubKey}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-mono text-[#FF5C35] font-bold">STELLAR SECRET KEY (NEVER SHARE!)</span>
                      <div className="flex items-center justify-between text-xs font-mono bg-white p-2 rounded-lg border border-[#E5E3DA] mt-1 select-all break-all overflow-x-auto text-slate-800">
                        <span>{generatedSecKey}</span>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="p-1 text-[#FF5C35] hover:bg-[#FFF2EE] rounded"
                          title="Copy Secret"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {copiedSec ? (
                      <p className="text-[10px] font-mono font-bold text-[#0BAFB0] flex items-center gap-1">
                        ✓ Copied to clipboard! Backup stored safely.
                      </p>
                    ) : (
                      <p className="text-[10px] font-mono text-[#CC3A1C] font-semibold">
                        ⚠️ WARNING: MariTrade does not store secret keys. Copy and back up this SB... key, or write it down. If you lose it, cargo payments cannot be signed side-by-side.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Connect your existing Stellar wallet address (e.g. Albedo, LOBSTR, Freighter public keys).
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Stellar Public Key</label>
                  <input 
                    id="inp-onboard-exist-wallet"
                    type="text" 
                    value={publicKeyInput}
                    onChange={(e) => setPublicKeyInput(e.target.value)}
                    placeholder="GDKXSXVG..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E3DA] text-sm font-mono text-slate-800 focus:outline-none focus:border-[#1A66FF]"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">Must be exactly 56 characters starting with G.</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#E5E3DA] flex justify-between">
              <button 
                id="btn-onboard-back-3"
                onClick={prevStep}
                className="px-4 py-2 border border-[#E5E3DA] rounded-lg text-slate-600 hover:bg-[#F2F1EC] text-sm font-semibold transition-colors cursor-pointer"
              >
                &lsaquo; Back
              </button>
              <button 
                id="btn-onboard-finish"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-lg bg-[#0BAFB0] hover:bg-[#078384] text-white text-sm font-bold transition-all cursor-pointer"
              >
                Complete Integration &rarr;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
