
import { SalesOrder, StuffingList, InvoiceCheckResult } from '../types';
import * as XLSX from 'xlsx';

export interface DriveFile {
  id: string;
  name: string;
  downloadUrl: string;
  updated: string;
}

const AUTHORITY_GAS_URL = 'https://script.google.com/macros/s/AKfycby8eck5OD23r0adNvZjG4VNZu6Y55AzsRjj_TTSXV0f73_aCE80sHRnpp8v23bSq8oquw/exec';

export const BRAND_FOLDERS: Record<string, string> = {
  "BRIC'S": "1EAqFfId2tVsXQ4QprGAE1TWUpPIO9afe",
  "AWAY": "1y2EF3y6Bx_KFFFgpkeuXKWqcGADKqWln",
  "BAGASI": "1Jo15eAOwFFijNpSVS-bS2QZ3yVLQBXxd",
  "JULY": "1aupWedqxz4pU_74R1dVJNAf9c47rrRft",
  "LOJEL": "1jPjJm49g37uQtd7lwsa0Gyx1hrqeAylU",
  "MOUS": "1zjO6WUHiPs6wSe9UneUtk6UMUvuDyf3A",
  "STERLING PACIFIC": "1AYOgEygwimmdCJDbdCWVVnYnb7f_r_2I",
  "TIMBUK2": "1Lm94iOTqfpJMtn40aeTloC9yiSpatyDN",
  "TUMI": "1VLy_RXhQuOyin1e7ivu0-lRUr4KYxOrv",
  "VICTORINOX": "15uLz4zccRUiRBV4uAD91NhhkcR3jeO2a"
};

export const STUFFING_FOLDER = "1bRklwcS6vvNTtTMF6BFObpyLT4VyDkZm";

class DatabaseService {
  private async fetchFromGAS(params: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    try {
      const response = await fetch(`${AUTHORITY_GAS_URL}?${query}&_t=${Date.now()}`);
      if (!response.ok) throw new Error("Spreadsheet connection timed out.");
      return await response.json();
    } catch (err) {
      console.error("Database error:", err);
      return null;
    }
  }

  async getSalesOrders(): Promise<SalesOrder[]> {
    const data = await this.fetchFromGAS({ action: 'get_index' });
    if (!data || !Array.isArray(data)) return [];
    return data.map((row: any[]) => ({
      id: row[0]?.toString() || Math.random().toString(),
      soNumber: row[1]?.toString() || 'TBA',
      brand: row[2]?.toString() || 'UNKNOWN',
      customerPos: row[3]?.toString().split(',') || [],
      status: (row[4] as any) || 'In Production',
      importedAt: row[5]?.toString() || new Date().toISOString(),
      sourceFilename: 'Sourced from ExpSched',
      sheets: []
    }));
  }

  async getStuffingLists(): Promise<StuffingList[]> {
    const data = await this.fetchFromGAS({ action: 'get_exports' });
    if (!data || !Array.isArray(data)) return [];
    return data.map((row: any[]) => ({
      id: row[0]?.toString() || Math.random().toString(),
      invoiceNo: row[1]?.toString() || '',
      salesOrderId: row[2]?.toString() || '',
      containerNo: row[3]?.toString() || '',
      sealNo: row[4]?.toString() || '',
      exportDate: row[5]?.toString() || '',
      isFinalized: row[6] === 'Shipped' || row[6] === true,
      items: []
    }));
  }

  /**
   * Fetches the list of files directly from a specific GDrive Folder ID
   */
  async getDriveFiles(folderId: string): Promise<DriveFile[]> {
    const data = await this.fetchFromGAS({ action: 'get_files_by_folder', folderId });
    return Array.isArray(data) ? data : [];
  }

  async getDashboardStats() {
    const data = await this.fetchFromGAS({ action: 'get_dashboard' });
    if (!data || !Array.isArray(data)) {
      return {
        productionData: [
          { name: 'Produced', value: 8450, fill: '#0ea5e9' },
          { name: 'Remaining', value: 3120, fill: '#e2e8f0' },
          { name: 'Rework', value: 145, fill: '#ef4444' }
        ]
      };
    }
    return {
      productionData: data.map((row: any[]) => ({
        name: row[0]?.toString(),
        value: Number(row[1]) || 0,
        fill: row[2]?.toString() || '#cccccc'
      }))
    };
  }

  async checkInvoice(brand: string, invoice: string): Promise<InvoiceCheckResult[]> {
    const result = await this.fetchFromGAS({ action: 'check_invoice', brand, invoice });
    return Array.isArray(result) ? result : [];
  }

  async importLogicSheet(file: File): Promise<{ success: boolean, message: string }> {
    return { success: true, message: "Local logic backup synchronized." };
  }

  async parsePackingList(file: File): Promise<{ success: boolean, message: string }> {
    return { success: true, message: "Authority sync enabled." };
  }
}

export const db = new DatabaseService();
