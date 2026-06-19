/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Shipment, UserRole } from './types';
import { getStoredUser, getStoredShipments, saveStoredUser } from './utils/storage';

// Component imports
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import ShipmentCreate from './components/ShipmentCreate';
import ShipmentDetail from './components/ShipmentDetail';
import AIAssistant from './components/AIAssistant';
import PublicTracking from './components/PublicTracking';
import DocumentsTab from './components/DocumentsTab';
import PaymentsTab from './components/PaymentsTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  // Navigation states
  const [activePage, setActivePage] = useState<string>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [trackLookupCode, setTrackLookupCode] = useState<string>('');
  
  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    // 1. Check URL parameters for public tracking queries (e.g. ?track=MT-2026-00142)
    const urlParams = new URLSearchParams(window.location.search);
    const trackingParam = urlParams.get('track');
    if (trackingParam) {
      setTrackLookupCode(trackingParam);
      setActivePage('public-tracking');
      return;
    }

    // 2. Load standard storage
    const storedUser = getStoredUser();
    const storedShipments = getStoredShipments();
    
    if (storedUser) {
      setUser(storedUser);
    }
    setShipments(storedShipments);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.stellarWallet) {
      setActivePage('dashboard');
    } else {
      setActivePage('onboarding');
    }
    // Sync shipments
    setShipments(getStoredShipments());
  };

  const handleOnboardingComplete = (onboardedUser: User) => {
    setUser(onboardedUser);
    setActivePage('dashboard');
  };

  const reloadData = () => {
    setShipments(getStoredShipments());
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  };

  const handleLogout = () => {
    saveStoredUser(null);
    setUser(null);
    setActivePage('landing');
  };

  const handleNavigateTab = (tab: string) => {
    setActiveShipmentId(null);
    if (tab === 'shipments-new') {
      setActiveTab('shipments-new');
    } else {
      setActiveTab(tab);
    }
  };

  // Direct reference tracking query routing from Landing page
  const handleTrackLookup = (code: string) => {
    setTrackLookupCode(code);
    setActivePage('public-tracking');
    // Set url cleanly to make it shareable
    if (window.history.pushState) {
      const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?track=${code}`;
      window.history.pushState({path:newurl}, '', newurl);
    }
  };

  const allowedShipmentsForUser = React.useMemo(() => {
    if (!user) return shipments;
    if (user.role === UserRole.IMPORTER || user.role === UserRole.EXPORTER || user.role === UserRole.ADMIN) {
      return shipments;
    }
    // Logistics chain constraints: scope strictly to assigned shipments
    return shipments.filter(s => {
      const role = user.role;
      if (role === UserRole.PORT_AUTHORITY) return s.assignedPortAuthorityName !== undefined;
      if (role === UserRole.CUSTOMS_BROKER) return s.assignedCustomsBrokerName !== undefined;
      if (role === UserRole.SHIPPING_LINE) return s.assignedCarrierName !== undefined;
      if (role === UserRole.WAREHOUSE) return s.assignedWarehouseName !== undefined;
      if (role === UserRole.TRUCKER) return s.assignedTruckerName !== undefined;
      if (role === UserRole.FREIGHT_FORWARDER) return s.assignedInspectorName !== undefined;
      return false;
    });
  }, [shipments, user]);

  const handleViewShipmentDetail = (id: string) => {
    setActiveShipmentId(id);
    setActiveTab('shipments-detail');
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-slate-900 font-sans">
      
       {/* 1. PUBLIC LANDING VIEW */}
      {activePage === 'landing' && (
        <LandingPage 
          user={user}
          onNavigate={(page) => {
            if (page === 'landing') setActivePage('landing');
            else if (page === 'login') { setActivePage('login'); }
            else if (page === 'register') { setActivePage('register'); }
            else if (page === 'dashboard') { setActivePage('dashboard'); }
            else if (page === 'onboarding') { setActivePage('onboarding'); }
            else if (page === 'logout') { handleLogout(); }
          }} 
          onTrackLookup={handleTrackLookup}
        />
      )}

      {/* 2. AUTH MODULE */}
      {(activePage === 'login' || activePage === 'register') && (
        <Auth 
          initialView={activePage === 'login' ? 'login' : 'register'}
          onNavigate={(page) => {
            if (page === 'landing') setActivePage('landing');
            else if (page === 'login') setActivePage('login');
            else if (page === 'register') setActivePage('register');
            else if (page === 'onboarding') setActivePage('onboarding');
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 3. BUSINESS ONBOARDING WIZARD */}
      {activePage === 'onboarding' && user && (
        <Onboarding 
          user={user} 
          onComplete={handleOnboardingComplete}
          onNavigate={(page) => {
            if (page === 'landing') handleLogout();
            else if (page === 'dashboard') setActivePage('dashboard');
          }}
        />
      )}

      {/* 4. PUBLIC SHIPMENT TRACKER VIEW */}
      {activePage === 'public-tracking' && (
        <PublicTracking 
          initialRefCode={trackLookupCode}
          onNavigateToAuth={() => {
            // Clear track query parameters in browser URL
            if (window.history.pushState) {
              const cleanurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
              window.history.pushState({path:cleanurl}, '', cleanurl);
            }
            setTrackLookupCode('');
            setActivePage('register');
          }}
        />
      )}

      {/* 5. PROTECTED COMPLETED CONSOLE SYSTEM */}
      {activePage === 'dashboard' && (
        <div className="flex h-screen overflow-hidden">
          
          {/* Main Sidebar */}
          <Sidebar 
            user={user} 
            activeTab={activeTab === 'shipments-detail' ? 'shipments' : activeTab === 'shipments-new' ? 'shipments' : activeTab}
            onNavigateTab={handleNavigateTab} 
            onLogout={handleLogout}
          />

          {/* Tab Pages Workspace Router */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAF7]">
            {activeTab === 'dashboard' && (
              <DashboardHome 
                shipments={allowedShipmentsForUser} 
                user={user}
                onViewShipment={handleViewShipmentDetail}
                onNavigateTab={handleNavigateTab}
                onUpdate={reloadData}
              />
            )}

            {activeTab === 'shipments' && (
              <DashboardHome 
                shipments={allowedShipmentsForUser} 
                user={user}
                onViewShipment={handleViewShipmentDetail}
                onNavigateTab={handleNavigateTab}
                onUpdate={reloadData}
              />
            )}

            {activeTab === 'shipments-new' && (
              <ShipmentCreate 
                onShipmentCreated={(newShip) => {
                  reloadData();
                  handleViewShipmentDetail(newShip.id);
                }}
                onCancel={() => handleNavigateTab('dashboard')}
              />
            )}

            {activeTab === 'shipments-detail' && activeShipmentId && (
              <ShipmentDetail 
                shipmentId={activeShipmentId} 
                user={user}
                onBack={() => handleNavigateTab('dashboard')} 
                onUpdate={reloadData}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsTab shipments={allowedShipmentsForUser} />
            )}

            {activeTab === 'payments' && (
              <PaymentsTab 
                shipments={allowedShipmentsForUser} 
                user={user}
                onViewShipment={handleViewShipmentDetail} 
              />
            )}

            {activeTab === 'assistance' && (
              <AIAssistant />
            )}

            {activeTab === 'public-track' && (
              <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <h1 className="text-2xl font-bold text-[#001240] tracking-tight">Public Link Exporter Tool</h1>
                  <p className="text-xs text-slate-500 mt-1">Export high-security read-only public lookup cards to distribution drivers and importers relatives.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shipments.map(s => (
                    <div key={s.id} className="bg-white border border-[#E5E3DA] rounded-xl p-5 space-y-4">
                      <div>
                        <strong className="block text-slate-800 text-sm font-mono">{s.referenceCode}</strong>
                        <p className="text-xs text-slate-500 mt-1 truncate">{s.description}</p>
                      </div>
                      
                      <div className="bg-[#FAFAF7] border border-[#E5E3DA] p-3 rounded-lg text-xs flex justify-between items-center">
                        <span className="text-slate-400 font-mono">Ledger Route:</span>
                        <strong className="text-slate-700">{s.originCountry} &rsaquo; {s.destinationPort}</strong>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/?track=${s.referenceCode}`);
                            alert('✓ Share link copied! Open this in an incognito window or share it with delivery truckers.');
                          }}
                          className="flex-1 py-2 text-center text-xs font-bold border border-[#E5E3DA] bg-white hover:bg-[#F2F1EC] text-slate-700 rounded-lg transition"
                        >
                          Copy Public Link
                        </button>
                        <button
                          onClick={() => handleTrackLookup(s.referenceCode)}
                          className="flex-1 py-2 text-center text-xs font-bold bg-[#001240] hover:bg-[#1A66FF] text-white rounded-lg transition"
                        >
                          Preview Live Track
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsTab user={user} onSave={(updatedUser) => setUser(updatedUser)} />
            )}

          </div>

        </div>
      )}

    </main>
  );
}
