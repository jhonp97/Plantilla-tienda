import { z } from 'zod';

export const CreateVerifactuInvoiceDto = z.object({
  orderId: z.string().uuid(),
});

export type CreateVerifactuInvoiceDtoType = z.infer<typeof CreateVerifactuInvoiceDto>;

export const VerifactuInvoiceResponseDto = z.object({
  id: z.string(),
  orderId: z.string(),
  serie: z.string(),
  numero: z.string(),
  fechaExpedicion: z.string(),
  tipoFactura: z.string(),
  descripcion: z.string(),
  nif: z.string().optional(),
  nombre: z.string(),
  lineas: z.array(z.object({
    baseImponible: z.string(),
    tipoImpositivo: z.string(),
    cuotaRepercutida: z.string(),
    operacionExenta: z.string().optional(),
  })),
  importeTotal: z.string(),
  uuid: z.string().optional(),
  qrCode: z.string().optional(),
  urlVerificacion: z.string().optional(),
  estado: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VerifactuInvoiceResponseDtoType = z.infer<typeof VerifactuInvoiceResponseDto>;

export const VerifactuStatusQueryDto = z.object({
  uuid: z.string().uuid(),
});

export type VerifactuStatusQueryDtoType = z.infer<typeof VerifactuStatusQueryDto>;