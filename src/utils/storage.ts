/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Shipment, ShipmentStatus, EscrowStatus, UserRole, KycStatus, MilestoneType, DocumentType, MilestoneEvent, ShipmentDocument } from '../types';

const INITIAL_USER: User = {
  id: 'usr-importer-1',
  email: 'tyshaunlouissiga@gmail.com',
  fullName: 'Tyshaun Louis Siga',
  role: UserRole.IMPORTER,
  companyName: 'Luzon General Merchandising',
  phoneNumber: '+63 912 345 6789',
  stellarWallet: 'GDKXSXVG3Z5D77D2N2W53U3GRLS7DGL3G2CO3PLD6KUN7UPYLYC53WTR',
  stellarSeed: 'SB6JZ2V5ST3L3M34SLS22U6YLSM7RGL4X4CON3PLDKUN7UPYLYC53SGA',
  kycStatus: KycStatus.VERIFIED,
  tinNumber: '123-456-789-000',
  businessRegistration: 'SEC-REG-2024-88A',
  createdAt: new Date('2026-01-15T08:00:00Z').toISOString()
};

const INITIAL_SHIPMENTS: Shipment[] = [];

export function getStoredUser(): User | null {
  const user = localStorage.getItem('maritrade_user');
  if (!user) {
    // Scaffold default user so the app is immediately beautiful and usable
    localStorage.setItem('maritrade_user', JSON.stringify(INITIAL_USER));
    return INITIAL_USER;
  }
  return JSON.parse(user);
}

export function saveStoredUser(user: User | null): void {
  if (user) {
    localStorage.setItem('maritrade_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('maritrade_user');
  }
}

export function getStoredShipments(): Shipment[] {
  const shipments = localStorage.getItem('maritrade_shipments');
  if (!shipments || shipments.includes('MT-2026-00142') || shipments.includes('MT-2026-00085') || shipments.includes('MT-2025-00210')) {
    localStorage.setItem('maritrade_shipments', JSON.stringify([]));
    return [];
  }
  return JSON.parse(shipments);
}

export function saveStoredShipments(shipments: Shipment[]): void {
  localStorage.setItem('maritrade_shipments', JSON.stringify(shipments));
}

export function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const randomCount = Math.floor(10000 + Math.random() * 90000); // 5 digit random
  return `MT-${year}-${randomCount}`;
}

export function createNewShipmentInStorage(shipmentData: Omit<Shipment, 'id' | 'referenceCode' | 'status' | 'escrowStatus' | 'createdAt' | 'updatedAt' | 'milestones' | 'documents' | 'importerId' | 'importerName'>): Shipment {
  const user = getStoredUser();
  const currentShipments = getStoredShipments();
  
  const newShipment: Shipment = {
    ...shipmentData,
    id: `ship-${Date.now()}`,
    referenceCode: generateReferenceCode(),
    importerId: user?.id || 'usr-guest',
    importerName: user?.companyName || 'Luzon General Merchandising',
    status: ShipmentStatus.PENDING,
    escrowStatus: EscrowStatus.UNFUNDED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: [
      {
        id: `ms-${Date.now()}-1`,
        shipmentId: `ship-${Date.now()}`,
        loggedByName: user?.fullName || 'Importer System',
        loggedByRole: UserRole.IMPORTER,
        type: MilestoneType.BOOKING_CONFIRMED,
        description: `Shipment booked for import route ${shipmentData.originCountry} to ${shipmentData.destinationPort}`,
        occurredAt: new Date().toISOString(),
        verified: true
      }
    ],
    documents: []
  };

  const updated = [newShipment, ...currentShipments];
  saveStoredShipments(updated);
  return newShipment;
}

export function updateShipmentInStorage(shipmentId: string, updates: Partial<Shipment>): null | Shipment {
  const currentShipments = getStoredShipments();
  const index = currentShipments.findIndex((s) => s.id === shipmentId);
  if (index === -1) return null;

  const updatedShipment = {
    ...currentShipments[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  currentShipments[index] = updatedShipment;
  saveStoredShipments(currentShipments);
  return updatedShipment;
}

export function logMilestoneInStorage(shipmentId: string, loggedBy: { name: string; role: UserRole }, type: MilestoneType, description: string, evidenceUrl?: string): null | Shipment {
  const currentShipments = getStoredShipments();
  const index = currentShipments.findIndex((s) => s.id === shipmentId);
  if (index === -1) return null;

  const currentShipment = currentShipments[index];
  
  const newMilestone: MilestoneEvent = {
    id: `ms-add-${Date.now()}`,
    shipmentId,
    loggedByName: loggedBy.name,
    loggedByRole: loggedBy.role,
    type,
    description,
    evidenceUrl,
    occurredAt: new Date().toISOString(),
    verified: true
  };

  // Map milestone creation to realistic Shipment Status updates
  let autoStatus = currentShipment.status;
  if (type === MilestoneType.VESSEL_DEPARTED) {
    autoStatus = ShipmentStatus.IN_TRANSIT;
  } else if (type === MilestoneType.VESSEL_ARRIVED_DESTINATION || type === MilestoneType.CONTAINER_OFFLOADED) {
    autoStatus = ShipmentStatus.AT_PORT;
  } else if (type === MilestoneType.CUSTOMS_ENTRY_FILED || type === MilestoneType.CUSTOMS_CLEARED) {
    autoStatus = ShipmentStatus.CUSTOMS_CLEARANCE;
  } else if (type === MilestoneType.CARGO_PICKED_UP) {
    autoStatus = ShipmentStatus.OUT_FOR_DELIVERY;
  } else if (type === MilestoneType.DELIVERED) {
    autoStatus = ShipmentStatus.DELIVERED;
  } else if (autoStatus === ShipmentStatus.PENDING) {
    autoStatus = ShipmentStatus.CONFIRMED;
  }

  // Update milestones array
  const updatedMilestones = [...currentShipment.milestones, newMilestone];
  
  const updatedShipment = {
    ...currentShipment,
    status: autoStatus,
    milestones: updatedMilestones,
    updatedAt: new Date().toISOString()
  };

  currentShipments[index] = updatedShipment;
  saveStoredShipments(currentShipments);
  return updatedShipment;
}

export function uploadDocumentInStorage(shipmentId: string, type: DocumentType, fileName: string, fileUrl: string, uploadedByName: string): null | Shipment {
  const currentShipments = getStoredShipments();
  const index = currentShipments.findIndex((s) => s.id === shipmentId);
  if (index === -1) return null;

  const currentShipment = currentShipments[index];

  // Increment version if a document of same type already exists
  const existingDocsOfType = currentShipment.documents.filter((d) => d.type === type);
  const version = existingDocsOfType.length + 1;

  // Set previous documents of same type to isLatest = false
  const updatedDocs = currentShipment.documents.map((d) => {
    if (d.type === type) {
      return { ...d, isLatest: false };
    }
    return d;
  });

  const newDoc: ShipmentDocument = {
    id: `doc-add-${Date.now()}`,
    shipmentId,
    type,
    fileUrl,
    fileName,
    uploadedByName,
    version,
    isLatest: true,
    createdAt: new Date().toISOString()
  };

  const finalDocs = [...updatedDocs, newDoc];

  const updatedShipment = {
    ...currentShipment,
    documents: finalDocs,
    updatedAt: new Date().toISOString()
  };

  currentShipments[index] = updatedShipment;
  saveStoredShipments(currentShipments);
  return updatedShipment;
}
