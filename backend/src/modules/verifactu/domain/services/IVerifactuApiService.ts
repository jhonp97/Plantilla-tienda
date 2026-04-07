import type { VerifactuInvoice } from '../entities/VerifactuInvoice';

export interface VerifactuApiResponse {
  uuid: string;
  qr: string;
  url: string;
}

export interface VerifactuStatusResponse {
  estado: string;
  url?: string;
  qr?: string;
  codigoError?: string;
  mensajeError?: string;
}

export interface IVerifactuApiService {
  createInvoice(invoice: VerifactuInvoice): Promise<VerifactuApiResponse>;
  checkStatus(uuid: string): Promise<VerifactuStatusResponse>;
  healthCheck(): Promise<boolean>;
}