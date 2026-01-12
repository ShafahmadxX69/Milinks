// --- ENTITIES ---

// 1. Sales Order (Packing List Source)
// Derived from the .xlsx filename and aggregated sheet data
export interface SalesOrder {
  id: string;
  soNumber: string; // Extracted from filename
  brand: string;    // Extracted from filename
  customerPos: string[]; // Aggregated from sheets
  
  // Status is computed dynamically:
  // Soon Produced (No production yet)
  // In Production (Partial production)
  // Finished Produced (Production == Order)
  // Exported (Linked to Finalized Stuffing List)
  status: 'Soon Produced' | 'In Production' | 'Finished Produced' | 'Exported';
  
  sourceFilename: string;
  importedAt: string;
  
  // A Sales Order can have multiple sheets (Customer POs)
  sheets: PackingListSheet[];
}

// Represents one tab in the Packing List Excel
export interface PackingListSheet {
  id: string;
  sheetName: string; // Usually the Customer PO Number
  customerPo: string;
  items: SalesOrderItem[];
}

// Normalized Data Item
export interface SalesOrderItem {
  id: string;
  materialNo: string; // Col B
  nameSpec: string;   // Col C
  pcsPerCtn: number;  // Col D
  totalCtns: number;  // Col E
  color: string;      // Col F
  uliPo: string;      // Col H
  totalQty: number;   // Calculated (pcsPerCtn * totalCtns)
}

// 2. Stuffing List (Export Document)
// Linked to an Invoice and Container
export interface StuffingList {
  id: string;
  invoiceNo: string;
  salesOrderId: string; // Parent SO
  containerNo: string;
  sealNo?: string;
  
  // Data layout specific to stuffing list (can differ from packing list)
  items: StuffingListItem[]; 
  
  isFinalized: boolean;
  exportDate?: string;
}

export interface StuffingListItem extends SalesOrderItem {
  // Stuffing list might have specific container allocation data
  cartonStart?: number;
  cartonEnd?: number;
}

// --- PRODUCTION TRACKING ---

export interface ProductionRecord {
  id: string;
  soItemId: string;
  date: string;
  producedQty: number;
  reworkQty: number;
}

export interface ReworkRecord {
  id: string;
  productionId: string;
  cause: string;
  qty: number;
}

// --- UI HELPERS ---

export interface DashboardStat {
  label: string;
  value: number;
  color: string;
}

export interface ProductionStat {
  name: string;
  value: number;
  fill: string;
}

export interface ReworkCause {
  cause: string;
  count: number;
}

export interface ShippingTrend {
  month: string;
  qty: number;
}

// Updated to match the Google Apps Script API Data Contract
export interface InvoiceCheckResult {
  PO: string;
  TYPE: string;
  COLOR: string;
  SIZE: string;
  QTY: number;
  REWORK: number;
  QTY_STATUS: 'READY' | 'NOT READY';
  INV_STATUS: string;
}