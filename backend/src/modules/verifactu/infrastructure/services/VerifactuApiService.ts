// ==========================================
// Verifactu API Service Implementation
// HTTP client for Verifactu API
// ==========================================

import { env } from '@config/env';
import type { VerifactuInvoice } from '../../domain/entities/VerifactuInvoice';
import type { 
  IVerifactuApiService, 
  VerifactuApiResponse, 
  VerifactuStatusResponse 
} from '../../domain/services/IVerifactuApiService';

export class VerifactuApiService implements IVerifactuApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.VERIFACTU_BASE_URL || 'https://api.verifacti.com';
    this.apiKey = process.env.VERIFACTU_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[Verifactu] WARNING: VERIFACTU_API_KEY not configured');
    }
  }

  async createInvoice(invoice: VerifactuInvoice): Promise<VerifactuApiResponse> {
    const payload = invoice.toApiPayload();

    const response = await fetch(`${this.baseUrl}/verifactu/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = { message: errorText };
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(`Verifactu API error: ${JSON.stringify(parsedError)}`);
    }

    const data = await response.json() as { uuid: string; qr: string; url: string };
    
    return {
      uuid: data.uuid,
      qr: data.qr,
      url: data.url,
    };
  }

  async checkStatus(uuid: string): Promise<VerifactuStatusResponse> {
    const response = await fetch(`${this.baseUrl}/verifactu/status?uuid=${uuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = { message: errorText };
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(`Verifactu API error: ${JSON.stringify(parsedError)}`);
    }

    const data = await response.json() as { estado: string; url?: string; qr?: string; codigoError?: string; mensajeError?: string };
    
    return {
      estado: data.estado,
      url: data.url,
      qr: data.qr,
      codigoError: data.codigoError,
      mensajeError: data.mensajeError,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verifactu/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}