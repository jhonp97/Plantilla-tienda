// ==========================================
// Verifactu Module
// Spanish Tax Compliance (AEAT)
// ==========================================

// Domain
export { VerifactuInvoice } from './domain/entities';
export type { 
  VerifactuInvoiceProps, 
  VerifactuInvoiceType,
  VerifactuInvoiceStatus,
  VerifactuInvoiceLine,
  CreateVerifactuInvoiceInput 
} from './domain/entities';

export type { IVerifactuApiService, VerifactuApiResponse, VerifactuStatusResponse } from './domain/services';
export type { IVerifactuRepository, VerifactuOrderUpdate } from './domain/repositories';

// Application
export { 
  GenerateInvoiceFromOrder, 
  RegisterInvoiceUseCase, 
  CheckInvoiceStatusUseCase 
} from './application/use-cases';

export { 
  CreateVerifactuInvoiceDto, 
  VerifactuInvoiceResponseDto, 
  VerifactuStatusQueryDto 
} from './application/dto';

export type { 
  CreateVerifactuInvoiceDtoType,
  VerifactuInvoiceResponseDtoType,
  VerifactuStatusQueryDtoType 
} from './application/dto';

// Infrastructure
export { VerifactuController } from './infrastructure/http/VerifactuController';
export { createVerifactuRouter } from './infrastructure/routes/verifactu.routes';
export { VerifactuApiService } from './infrastructure/services/VerifactuApiService';
export { VerifactuRepository } from './infrastructure/persistence/VerifactuRepository';