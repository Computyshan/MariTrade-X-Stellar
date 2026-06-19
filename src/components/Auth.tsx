/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, KycStatus, User } from '../types';
import { saveStoredUser } from '../utils/storage';
import { ShieldCheck, Mail, Lock, Building2, Phone, Briefcase } from 'lucide-react';

interface AuthProps {
  initialView: 'login' | 'register';
  onNavigate: (page: string) => void;
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ initialView, onNavigate, onLoginSuccess }: AuthProps) {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.IMPORTER);

  // Status logs
  const [errorText, setErrorText] = useState('');
  const [infoText, setInfoText] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email || !password) {
      setErrorText('Please enter your email and password credentials.');
      return;
    }

    // Standard mock user simulation login
    const mockUser: User = {
      id: 'usr-importer-1',
      email: email,
      fullName: fullName || 'Tyshaun Louis Siga',
      role: role || UserRole.IMPORTER,
      companyName: companyName || 'Luzon General Merchandising',
      phoneNumber: phoneNumber || '+63 912 345 6789',
      stellarWallet: 'GDKXSXVG3Z5D77D2N2W53U3GRLS7DGL3G2CO3PLD6KUN7UPYLYC53WTR',
      stellarSeed: 'SB6JZ2V5ST3L3M34SLS22U6YLSM7RGL4X4CON3PLDKUN7UPYLYC53SGA',
      kycStatus: KycStatus.VERIFIED,
      tinNumber: '123-456-789-000',
      businessRegistration: 'SEC-REG-2024-88A',
      createdAt: new Date().toISOString()
    };

    saveStoredUser(mockUser);
    onLoginSuccess(mockUser);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email || !password || !fullName || !companyName || !phoneNumber) {
      setErrorText('Please fill in all registration fields.');
      return;
    }

    if (!phoneNumber.startsWith('+63') && !/^\d+$/.test(phoneNumber)) {
      setErrorText('Phone number must start with +63 and contain valid digits.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      fullName,
      role,
      companyName,
      phoneNumber,
      kycStatus: KycStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    // Save and send user directly to onboarding page!
    saveStoredUser(newUser);
    onLoginSuccess(newUser);
    onNavigate('onboarding');
  };

  const setDemoRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === UserRole.IMPORTER) {
      setCompanyName('Luzon Agro Trading');
      setFullName('Lito Macati');
    } else if (selectedRole === UserRole.EXPORTER) {
      setCompanyName('Vietnam Rice Exports Ltd');
      setFullName('Nguyen Van Minh');
    } else if (selectedRole === UserRole.FREIGHT_FORWARDER) {
      setCompanyName('SGS Inspection Services');
      setFullName('Carlos Delgado');
    } else if (selectedRole === UserRole.CUSTOMS_BROKER) {
      setCompanyName('Vanguard Brokerage Manila');
      setFullName('Atty. Maria Santos');
    } else if (selectedRole === UserRole.SHIPPING_LINE) {
      setCompanyName('Evergreen Shipping Line');
      setFullName('Captain Lawrence');
    } else if (selectedRole === UserRole.WAREHOUSE) {
      setCompanyName('Shenzhen Logistics Hub');
      setFullName('Robert Chen');
    } else if (selectedRole === UserRole.PORT_AUTHORITY) {
      setCompanyName('Manila Port Authority');
      setFullName('Director Arnaldo');
    } else if (selectedRole === UserRole.TRUCKER) {
      setCompanyName('PH Express Trucking');
      setFullName('Driver Danilo');
    }
  };

  return (
    <div id="auth-page" className="min-h-screen bg-[#FAFAF7] font-sans flex items-center justify-center py-12 px-6">
      <div className="absolute top-6 left-6 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="w-8 h-8 rounded bg-[#1A66FF] flex items-center justify-center text-white font-bold text-base shadow-sm">
          M
        </div>
        <span className="font-bold text-lg text-[#001240]">MariTrade</span>
      </div>

      <div className="w-full max-w-md bg-white border border-[#E5E3DA] rounded-2xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Visual Line Accents */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#1A66FF]"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-[#1A66FF]/10 text-[#1A66FF] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-bold text-[#001240]">
            {view === 'login' ? 'Welcome Back Portside' : 'Join MariTrade'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {view === 'login' 
              ? 'Access your secure importer escrow & active shipments' 
              : 'Register your business to start tracking and escrowing payments'
            }
          </p>
        </div>

        {errorText && (
          <div className="bg-red-50 border border-red-200 text-[#FF5C35] text-xs font-medium rounded-lg p-3.5 mb-5 flex gap-2">
            <span>⚠️</span>
            <span>{errorText}</span>
          </div>
        )}

        {view === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  id="inp-login-email"
                  type="email" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  id="inp-login-password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
                />
              </div>
            </div>

            <button 
              id="btn-submit-login"
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white font-bold text-sm transition-colors mt-2 cursor-pointer"
            >
              Log In &rarr;
            </button>

            {/* Quick Presets */}
            <div className="border-t border-[#E5E3DA] pt-4 mt-4">
              <span className="block text-[10px] uppercase font-mono text-center text-slate-400 font-bold mb-3">Instant Demo Account Presets</span>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('tyshaunlouissiga@gmail.com');
                    setPassword('maritrade2026');
                    setCompanyName('Luzon General Merchandising');
                    setFullName('Tyshaun Louis Siga');
                    setRole(UserRole.IMPORTER);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Importer (SME)</span>
                  <span className="text-[9px] text-[#1A66FF] font-semibold">tyshaunlouissiga@gmail.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('vietnam.rice@exports.vn');
                    setPassword('maritrade2026');
                    setCompanyName('Vietnam Rice Exports Ltd');
                    setFullName('Nguyen Van Minh');
                    setRole(UserRole.EXPORTER);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Exporter (Seller)</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">vietnam.rice@exports.vn</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('manila.port@gov.ph');
                    setPassword('maritrade2026');
                    setCompanyName('Manila Port Authority');
                    setFullName('Director Arnaldo');
                    setRole(UserRole.PORT_AUTHORITY);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Port Authority</span>
                  <span className="text-[9px] text-sky-600 font-semibold">manila.port@gov.ph</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('vanguard.brokerage@manila.ph');
                    setPassword('maritrade2026');
                    setCompanyName('Vanguard Brokerage Manila');
                    setFullName('Atty. Maria Santos');
                    setRole(UserRole.CUSTOMS_BROKER);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Customs Broker</span>
                  <span className="text-[9px] text-orange-600 font-semibold">vanguard.brokerage@manila...</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('evergreen.agent@oceanlines.com');
                    setPassword('maritrade2026');
                    setCompanyName('Evergreen Shipping Line');
                    setFullName('Captain Lawrence');
                    setRole(UserRole.SHIPPING_LINE);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Shipping Line</span>
                  <span className="text-[9px] text-purple-600 font-semibold">evergreen.agent@ocean...</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('shenzhen.hub@logistics.com');
                    setPassword('maritrade2026');
                    setCompanyName('Shenzhen Logistics Hub');
                    setFullName('Robert Chen');
                    setRole(UserRole.WAREHOUSE);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Warehouse Yard</span>
                  <span className="text-[9px] text-teal-600 font-semibold">shenzhen.hub@logistics.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('ph.express.trucking@courier.ph');
                    setPassword('maritrade2026');
                    setCompanyName('PH Express Trucking');
                    setFullName('Driver Danilo');
                    setRole(UserRole.TRUCKER);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Local Trucker</span>
                  <span className="text-[9px] text-red-500 font-semibold">ph.express.trucking@couri...</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('sgs.auditor@inspections.com');
                    setPassword('maritrade2026');
                    setCompanyName('SGS Inspection Services');
                    setFullName('Carlos Delgado');
                    setRole(UserRole.FREIGHT_FORWARDER);
                  }}
                  className="p-2 rounded bg-[#FAFAF7] hover:bg-[#EEF4FF] border border-[#E5E3DA] text-left text-[11px] text-slate-700 font-medium flex flex-col justify-between transition"
                >
                  <span className="font-bold text-slate-800">Cargo Inspector</span>
                  <span className="text-[9px] text-indigo-600 font-semibold">sgs.auditor@inspections...</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
              <input 
                id="inp-reg-name"
                type="text" 
                placeholder="Juan dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Business Email</label>
              <input 
                id="inp-reg-email"
                type="email" 
                placeholder="juan@luzonagro.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-2.5 top-1/2 -track-y-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    id="inp-reg-company"
                    type="text" 
                    placeholder="Luzon Agro Co."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone (+63)</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -track-y-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    id="inp-reg-phone"
                    type="text" 
                    placeholder="+63 912 345 6789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Role / Account Type</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  id="sel-reg-role"
                  value={role}
                  onChange={(e) => setDemoRole(e.target.value as UserRole)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF] bg-white text-slate-800 font-medium"
                >
                  <option value={UserRole.IMPORTER}>Importer (SME Buyer)</option>
                  <option value={UserRole.EXPORTER}>Exporter (International Seller)</option>
                  <option value={UserRole.FREIGHT_FORWARDER}>Cargo Inspector / Underwriter</option>
                  <option value={UserRole.CUSTOMS_BROKER}>Customs Broker</option>
                  <option value={UserRole.SHIPPING_LINE}>Shipping Line Operator</option>
                  <option value={UserRole.WAREHOUSE}>Warehouse Management</option>
                  <option value={UserRole.PORT_AUTHORITY}>Government Port Authority</option>
                  <option value={UserRole.TRUCKER}>Local Trucker Logistical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
              <input 
                id="inp-reg-password"
                type="password" 
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E5E3DA] text-sm focus:outline-none focus:border-[#1A66FF]"
              />
            </div>

            <button 
              id="btn-submit-register"
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#1A66FF] hover:bg-[#0047E0] text-white font-bold text-sm transition-colors mt-2 cursor-pointer"
            >
              Create Account &rarr;
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs">
          {view === 'login' ? (
            <p className="text-slate-500">
              Don't have a MariTrade account yet?{' '}
              <button 
                id="btn-toggle-register"
                onClick={() => setView('register')} 
                className="text-[#1A66FF] font-bold hover:underline"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Already have a registered account?{' '}
              <button 
                id="btn-toggle-login"
                onClick={() => setView('login')} 
                className="text-[#1A66FF] font-bold hover:underline"
              >
                Log In Here
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
