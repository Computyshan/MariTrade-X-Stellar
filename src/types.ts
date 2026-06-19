/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  IMPORTER = 'IMPORTER',
  EXPORTER = 'EXPORTER',
  FREIGHT_FORWARDER = 'FREIGHT_FORWARDER',
  CUSTOMS_BROKER = 'CUSTOMS_BROKER',
  WAREHOUSE = 'WAREHOUSE',
  SHIPPING_LINE = 'SHIPPING_LINE',
  PORT_AUTHORITY = 'PORT_AUTHORITY',
  TRUCKER = 'TRUCKER',
  ADMIN = 'ADMIN'
}

export enum KycStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  companyName: string;
  phoneNumber: string;
  stellarWallet?: string;
  stellarSeed?: string; // Client-side wallet generation
  kycStatus: KycStatus;
  tinNumber?: string;
  businessRegistration?: string;
  createdAt: string;
};

export enum ShipmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_TRANSIT = 'IN_TRANSIT',
  AT_PORT = 'AT_PORT',
  CUSTOMS_CLEARANCE = 'CUSTOMS_CLEARANCE',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export enum EscrowStatus {
  UNFUNDED = 'UNFUNDED',
  FUNDED = 'FUNDED',
  PARTIALLY_RELEASED = 'PARTIALLY_RELEASED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED'
}

export enum MilestoneType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  CARGO_RECEIVED_WAREHOUSE = 'CARGO_RECEIVED_WAREHOUSE',
  CARGO_PACKED_READY = 'CARGO_PACKED_READY',
  VESSEL_DEPARTED = 'VESSEL_DEPARTED',
  BILL_OF_LADING_ISSUED = 'BILL_OF_LADING_ISSUED',
  CONTAINER_LOADED = 'CONTAINER_LOADED',
  PORT_CLEARED_ORIGIN = 'PORT_CLEARED_ORIGIN',
  VESSEL_ARRIVED_DESTINATION = 'VESSEL_ARRIVED_DESTINATION',
  CONTAINER_OFFLOADED = 'CONTAINER_OFFLOADED',
  CUSTOMS_ENTRY_FILED = 'CUSTOMS_ENTRY_FILED',
  CUSTOMS_CLEARED = 'CUSTOMS_CLEARED',
  CARGO_PICKED_UP = 'CARGO_PICKED_UP',
  DELIVERED = 'DELIVERED'
}

export type MilestoneEvent = {
  id: string;
  shipmentId: string;
  loggedByName: string;
  loggedByRole: UserRole;
  type: MilestoneType;
  description: string;
  evidenceUrl?: string;
  latitude?: number;
  longitude?: number;
  occurredAt: string;
  verified: boolean;
};

export enum DocumentType {
  COMMERCIAL_INVOICE = 'COMMERCIAL_INVOICE',
  PACKING_LIST = 'PACKING_LIST',
  BILL_OF_LADING = 'BILL_OF_LADING',
  CERTIFICATE_OF_ORIGIN = 'CERTIFICATE_OF_ORIGIN',
  CUSTOMS_ENTRY = 'CUSTOMS_ENTRY',
  IMPORT_PERMIT = 'IMPORT_PERMIT',
  INSPECTION_REPORT = 'INSPECTION_REPORT',
  AMENDMENT = 'AMENDMENT'
}

export type ShipmentDocument = {
  id: string;
  shipmentId: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  uploadedByName: string;
  version: number;
  isLatest: boolean;
  createdAt: string;
};

export type Shipment = {
  id: string;
  referenceCode: string;
  importerId: string;
  importerName: string;
  exporterName: string;
  exporterEmail?: string;
  description: string;
  originCountry: string;
  destinationPort: string;
  status: ShipmentStatus;
  totalValueUSD: number;
  escrowStatus: EscrowStatus;
  stellarEscrowId?: string;
  escrowAmountUSD: number;
  estimatedArrival?: string;
  createdAt: string;
  updatedAt: string;
  milestones: MilestoneEvent[];
  documents: ShipmentDocument[];
  assignedPortAuthorityName?: string;
  assignedCustomsBrokerName?: string;
  assignedCarrierName?: string;
  assignedWarehouseName?: string;
  assignedTruckerName?: string;
  assignedInspectorName?: string;
};
