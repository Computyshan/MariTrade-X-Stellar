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

const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'ship-1',
    referenceCode: 'MT-2026-00142',
    importerId: 'usr-importer-1',
    importerName: 'Luzon General Merchandising',
    exporterName: 'Yantian Heavy Industries Ltd.',
    exporterEmail: 'sales@yantianheavy.cn',
    description: 'Industrial Air Compressor Units (Model AC-500) and Spare Parts',
    originCountry: 'China',
    destinationPort: 'Manila (MICP)',
    status: ShipmentStatus.IN_TRANSIT,
    totalValueUSD: 12500,
    escrowStatus: EscrowStatus.FUNDED,
    stellarEscrowId: 'tx_escrow_8fa389b2c7e14d',
    escrowAmountUSD: 12500,
    estimatedArrival: '2026-06-28T18:00:00Z',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-15T14:30:00Z',
    assignedPortAuthorityName: 'Manila Port Authority',
    assignedCustomsBrokerName: 'Vanguard Brokerage Manila',
    assignedCarrierName: 'Evergreen Shipping Line',
    assignedWarehouseName: 'Shenzhen Logistics Hub',
    assignedTruckerName: 'PH Express Trucking',
    assignedInspectorName: 'SGS Inspection Services',
    milestones: [
      {
        id: 'ms-1-1',
        shipmentId: 'ship-1',
        loggedByName: 'Yantian Cargo Booking',
        loggedByRole: UserRole.EXPORTER,
        type: MilestoneType.BOOKING_CONFIRMED,
        description: 'Shipping slot booked on container vessel Ever Glory (Vessel v104)',
        occurredAt: '2026-06-10T11:30:00Z',
        verified: true
      },
      {
        id: 'ms-1-2',
        shipmentId: 'ship-1',
        loggedByName: 'Shenzhen Logistics Hub',
        loggedByRole: UserRole.WAREHOUSE,
        type: MilestoneType.CARGO_RECEIVED_WAREHOUSE,
        description: 'Cargo components safely received and inspected at Shenzhen warehouse stack 5B.',
        occurredAt: '2026-06-12T09:15:00Z',
        verified: true
      },
      {
        id: 'ms-1-3',
        shipmentId: 'ship-1',
        loggedByName: 'Port of Yantian Terminal',
        loggedByRole: UserRole.PORT_AUTHORITY,
        type: MilestoneType.CONTAINER_LOADED,
        description: 'Loaded container MSKU923812 onto Ever Glory at Bay 4.',
        occurredAt: '2026-06-14T16:00:00Z',
        verified: true
      },
      {
        id: 'ms-1-4',
        shipmentId: 'ship-1',
        loggedByName: 'Evergreen Shipping Line Group',
        loggedByRole: UserRole.SHIPPING_LINE,
        type: MilestoneType.VESSEL_DEPARTED,
        description: 'Ever Glory departed Shenzhen Port, setting course for Port of Manila (MICP).',
        occurredAt: '2026-06-15T14:30:00Z',
        verified: true
      }
    ],
    documents: [
      {
        id: 'doc-1-1',
        shipmentId: 'ship-1',
        type: DocumentType.COMMERCIAL_INVOICE,
        fileUrl: '#',
        fileName: 'Invoice_YHT_AC500_12500.pdf',
        uploadedByName: 'Yantian Heavy Industries',
        version: 1,
        isLatest: true,
        createdAt: '2026-06-10T10:15:00Z'
      },
      {
        id: 'doc-1-2',
        shipmentId: 'ship-1',
        type: DocumentType.PACKING_LIST,
        fileUrl: '#',
        fileName: 'Packing_List_MSKU923812.pdf',
        uploadedByName: 'Yantian Heavy Industries',
        version: 1,
        isLatest: true,
        createdAt: '2026-06-10T10:20:00Z'
      },
      {
        id: 'doc-1-3',
        shipmentId: 'ship-1',
        type: DocumentType.BILL_OF_LADING,
        fileUrl: '#',
        fileName: 'Bill_of_Lading_EGL_SHZMNL01.pdf',
        uploadedByName: 'Evergreen Shipping Line',
        version: 1,
        isLatest: true,
        createdAt: '2026-06-14T18:00:00Z'
      }
    ]
  },
  {
    id: 'ship-2',
    referenceCode: 'MT-2026-00085',
    importerId: 'usr-importer-1',
    importerName: 'Luzon General Merchandising',
    exporterName: 'Mekong Rice & Agri Exports',
    exporterEmail: 'export@mekongrice.vn',
    description: 'Bulk Premium Jasmine Rice Bags (1,000 Bags x 25kg)',
    originCountry: 'Vietnam',
    destinationPort: 'Cebu Port Terminal',
    status: ShipmentStatus.CUSTOMS_CLEARANCE,
    totalValueUSD: 8400,
    escrowStatus: EscrowStatus.FUNDED,
    stellarEscrowId: 'tx_escrow_412c9bf8083da1',
    escrowAmountUSD: 8400,
    estimatedArrival: '2026-06-18T10:00:00Z',
    createdAt: '2026-06-05T08:00:00Z',
    updatedAt: '2026-06-18T16:45:00Z',
    assignedPortAuthorityName: 'Manila Port Authority',
    assignedCustomsBrokerName: 'Vanguard Brokerage Manila',
    assignedCarrierName: 'Evergreen Shipping Line',
    assignedWarehouseName: 'Shenzhen Logistics Hub',
    assignedTruckerName: 'PH Express Trucking',
    assignedInspectorName: 'SGS Inspection Services',
    milestones: [
      {
        id: 'ms-2-1',
        shipmentId: 'ship-2',
        loggedByName: 'Mekong Agri Booking',
        loggedByRole: UserRole.EXPORTER,
        type: MilestoneType.BOOKING_CONFIRMED,
        description: 'SITC Logistics slot booked for Cebu port direct destination.',
        occurredAt: '2026-06-05T09:00:00Z',
        verified: true
      },
      {
        id: 'ms-2-2',
        shipmentId: 'ship-2',
        loggedByName: 'Mekong Whse 4A',
        loggedByRole: UserRole.WAREHOUSE,
        type: MilestoneType.CARGO_RECEIVED_WAREHOUSE,
        description: 'Jasmine Rice palletized and fumigated. Ready for loading.',
        occurredAt: '2026-06-06T15:30:00Z',
        verified: true
      },
      {
        id: 'ms-2-3',
        shipmentId: 'ship-2',
        loggedByName: 'SITC Shipping Vietnam',
        loggedByRole: UserRole.SHIPPING_LINE,
        type: MilestoneType.VESSEL_DEPARTED,
        description: 'SITC Cebu Express departed Ho Chi Minh Port.',
        occurredAt: '2026-06-08T11:00:00Z',
        verified: true
      },
      {
        id: 'ms-2-4',
        shipmentId: 'ship-2',
        loggedByName: 'Port Authority of Cebu',
        loggedByRole: UserRole.PORT_AUTHORITY,
        type: MilestoneType.VESSEL_ARRIVED_DESTINATION,
        description: 'Vessel docked. Container sitc-ag8831 offloaded at yard sector C.',
        occurredAt: '2026-06-18T10:00:00Z',
        verified: true
      },
      {
        id: 'ms-2-5',
        shipmentId: 'ship-2',
        loggedByName: 'Pascual & Partners Brokerage',
        loggedByRole: UserRole.CUSTOMS_BROKER,
        type: MilestoneType.CUSTOMS_ENTRY_FILED,
        description: 'Single Administrative Document (SAD) entry submitted to Bureau of Customs (BOC).',
        occurredAt: '2026-06-18T16:45:00Z',
        verified: true
      }
    ],
    documents: [
      {
        id: 'doc-2-1',
        shipmentId: 'ship-2',
        type: DocumentType.COMMERCIAL_INVOICE,
        fileUrl: '#',
        fileName: 'Invoice_MekongRice_Agri.pdf',
        uploadedByName: 'Mekong Rice Exports',
        version: 1,
        isLatest: true,
        createdAt: '2026-06-05T08:15:00Z'
      },
      {
        id: 'doc-2-2',
        shipmentId: 'ship-2',
        type: DocumentType.IMPORT_PERMIT,
        fileUrl: '#',
        fileName: 'SPS_IC_JasmineRice_BPI.pdf',
        uploadedByName: 'Luzon General Merchandising',
        version: 1,
        isLatest: true,
        createdAt: '2026-06-05T08:30:00Z'
      }
    ]
  },
  {
    id: 'ship-3',
    referenceCode: 'MT-2026-00210',
    importerId: 'usr-importer-1',
    importerName: 'Luzon General Merchandising',
    exporterName: 'Formosa Plastics Corp.',
    exporterEmail: 'sales@formosaplastics.tw',
    description: 'High-Density Polyethylene Resin Pellets (Eco-Grade, 40 metric tons)',
    originCountry: 'Taiwan',
    destinationPort: 'Davao Terminal (Sasa Wharf)',
    status: ShipmentStatus.DELIVERED,
    totalValueUSD: 18700,
    escrowStatus: EscrowStatus.RELEASED,
    stellarEscrowId: 'tx_escrow_f890288cd3bbaa5',
    escrowAmountUSD: 18700,
    estimatedArrival: '2026-06-12T08:00:00Z',
    createdAt: '2026-05-28T09:00:00Z',
    updatedAt: '2026-06-12T16:00:00Z',
    assignedPortAuthorityName: 'Manila Port Authority',
    assignedCustomsBrokerName: 'Vanguard Brokerage Manila',
    assignedCarrierName: 'Evergreen Shipping Line',
    assignedWarehouseName: 'Shenzhen Logistics Hub',
    assignedTruckerName: 'PH Express Trucking',
    assignedInspectorName: 'SGS Inspection Services',
    milestones: [
      {
        id: 'ms-3-1',
        shipmentId: 'ship-3',
        loggedByName: 'Kaohsiung Logistics',
        loggedByRole: UserRole.EXPORTER,
        type: MilestoneType.BOOKING_CONFIRMED,
        description: 'Sasa Wharf direct booking confirmed with Wan Hai Lines.',
        occurredAt: '2026-05-28T10:00:00Z',
        verified: true
      },
      {
        id: 'ms-3-2',
        shipmentId: 'ship-3',
        loggedByName: 'Wan Hai Harbor Operations',
        loggedByRole: UserRole.SHIPPING_LINE,
        type: MilestoneType.VESSEL_DEPARTED,
        description: 'Vessel departed Kaohsiung port.',
        occurredAt: '2026-05-31T14:00:00Z',
        verified: true
      },
      {
        id: 'ms-3-3',
        shipmentId: 'ship-3',
        loggedByName: 'Davao Sasa Port Authority',
        loggedByRole: UserRole.PORT_AUTHORITY,
        type: MilestoneType.VESSEL_ARRIVED_DESTINATION,
        description: 'Vessel docked. Discharge completed.',
        occurredAt: '2026-06-08T09:00:00Z',
        verified: true
      },
      {
        id: 'ms-3-4',
        shipmentId: 'ship-3',
        loggedByName: 'Mindanao Customs Brokerage',
        loggedByRole: UserRole.CUSTOMS_BROKER,
        type: MilestoneType.CUSTOMS_CLEARED,
        description: 'BOC assessment completed. Duties paid. Green lane clearance release.',
        occurredAt: '2026-06-10T11:00:00Z',
        verified: true
      },
      {
        id: 'ms-3-5',
        shipmentId: 'ship-3',
        loggedByName: 'Davao Trucking Pros',
        loggedByRole: UserRole.TRUCKER,
        type: MilestoneType.DELIVERED,
        description: 'Container delivered to importer warehouse in Sasa, Davao City. Inspected by consignee.',
        occurredAt: '2026-06-12T15:30:00Z',
        verified: true
      }
    ],
    documents: [
      {
        id: 'doc-3-1',
        shipmentId: 'ship-3',
        type: DocumentType.COMMERCIAL_INVOICE,
        fileUrl: '#',
        fileName: 'Formosa_Plastics_INV09230.pdf',
        uploadedByName: 'Formosa Plastics Corp.',
        version: 1,
        isLatest: true,
        createdAt: '2026-05-28T09:15:00Z'
      },
      {
        id: 'doc-3-2',
        shipmentId: 'ship-3',
        type: DocumentType.BILL_OF_LADING,
        fileUrl: '#',
        fileName: 'WHL_Bill_of_Lading_881a293.pdf',
        uploadedByName: 'Wan Hai Lines',
        version: 1,
        isLatest: true,
        createdAt: '2026-05-31T15:00:00Z'
      }
    ]
  }
];

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
  if (!shipments) {
    localStorage.setItem('maritrade_shipments', JSON.stringify(INITIAL_SHIPMENTS));
    return INITIAL_SHIPMENTS;
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
    assignedPortAuthorityName: 'Manila Port Authority',
    assignedCustomsBrokerName: 'Vanguard Brokerage Manila',
    assignedCarrierName: 'Evergreen Shipping Line',
    assignedWarehouseName: 'Shenzhen Logistics Hub',
    assignedTruckerName: 'PH Express Trucking',
    assignedInspectorName: 'SGS Inspection Services',
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

export function getMilestonePrerequisite(targetType: MilestoneType): MilestoneType | null {
  const CHRONOLOGICAL_MILESTONES = [
    MilestoneType.BOOKING_CONFIRMED,
    MilestoneType.CARGO_RECEIVED_WAREHOUSE,
    MilestoneType.CARGO_PACKED_READY,
    MilestoneType.VESSEL_DEPARTED,
    MilestoneType.CONTAINER_LOADED,
    MilestoneType.VESSEL_ARRIVED_DESTINATION,
    MilestoneType.CONTAINER_OFFLOADED,
    MilestoneType.CUSTOMS_ENTRY_FILED,
    MilestoneType.CUSTOMS_CLEARED,
    MilestoneType.CARGO_PICKED_UP,
    MilestoneType.DELIVERED
  ];
  const index = CHRONOLOGICAL_MILESTONES.indexOf(targetType);
  if (index <= 0) return null;
  return CHRONOLOGICAL_MILESTONES[index - 1];
}

export function canLogMilestone(shipment: Shipment, targetType: MilestoneType): { allowed: boolean; reason?: string; missingMilestone?: MilestoneType } {
  const prev = getMilestonePrerequisite(targetType);
  if (!prev) return { allowed: true };

  const isPrevLogged = shipment.milestones.some(m => m.type === prev);
  if (!isPrevLogged) {
    return {
      allowed: false,
      missingMilestone: prev,
      reason: `Cargo has not cleared the previous station: "${prev.replace(/_/g, ' ')}".`
    };
  }
  return { allowed: true };
}

export function logMilestoneInStorage(shipmentId: string, loggedBy: { name: string; role: UserRole }, type: MilestoneType, description: string, evidenceUrl?: string): null | Shipment {
  const currentShipments = getStoredShipments();
  const index = currentShipments.findIndex((s) => s.id === shipmentId);
  if (index === -1) return null;

  const currentShipment = currentShipments[index];
  
  const check = canLogMilestone(currentShipment, type);
  if (!check.allowed) {
    return null;
  }

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

export function deleteDocumentInStorage(shipmentId: string, documentId: string): null | Shipment {
  const currentShipments = getStoredShipments();
  const index = currentShipments.findIndex((s) => s.id === shipmentId);
  if (index === -1) return null;

  const currentShipment = currentShipments[index];
  const finalDocs = currentShipment.documents.filter((d) => d.id !== documentId);

  // Re-evaluate isLatest flag for the remaining documents of each type
  const docTypes = Array.from(new Set(finalDocs.map((d) => d.type)));
  const updatedDocs = finalDocs.map((d) => {
    // For each document, if it is the highest version of its type, mark as isLatest
    const docsOfType = finalDocs.filter((x) => x.type === d.type);
    const maxVersion = Math.max(...docsOfType.map((x) => x.version));
    return { ...d, isLatest: d.version === maxVersion };
  });

  const updatedShipment = {
    ...currentShipment,
    documents: updatedDocs,
    updatedAt: new Date().toISOString()
  };

  currentShipments[index] = updatedShipment;
  saveStoredShipments(currentShipments);
  return updatedShipment;
}

export function deleteShipmentInStorage(shipmentId: string): boolean {
  const currentShipments = getStoredShipments();
  const index = currentShipments.findIndex((s) => s.id === shipmentId);
  if (index === -1) return false;

  currentShipments.splice(index, 1);
  saveStoredShipments(currentShipments);
  return true;
}

