// ==========================================
// VerifactuInvoice Entity
// Spanish Tax Compliance (AEAT)
// ==========================================

export type VerifactuInvoiceType = 'F1' | 'F2' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export type VerifactuInvoiceStatus = 
  | 'PENDIENTE'
  | 'CORRECTO'
  | 'INCORRECTO'
  | 'ACEPTADO_CON_ERRORES'
  | 'ERROR'
  | 'DESCONOCIDO';

export interface VerifactuInvoiceLine {
  baseImponible: string;
  tipoImpositivo: string;
  cuotaRepercutida: string;
  operacionExenta?: string;
}

export interface VerifactuInvoiceProps {
  id: string;
  orderId: string;
  serie: string;
  numero: string;
  fechaExpedicion: string;
  tipoFactura: VerifactuInvoiceType;
  descripcion: string;
  nif?: string;
  nombre: string;
  lineas: VerifactuInvoiceLine[];
  importeTotal: string;
  
  // Response fields
  uuid?: string;
  qrCode?: string;
  urlVerificacion?: string;
  estado?: VerifactuInvoiceStatus;
  codigoError?: string;
  mensajeError?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVerifactuInvoiceInput {
  orderId: string;
  serie: string;
  numero: string;
  fechaExpedicion: string;
  tipoFactura: VerifactuInvoiceType;
  descripcion: string;
  nif?: string;
  nombre: string;
  lineas: VerifactuInvoiceLine[];
  importeTotal: string;
}

export class VerifactuInvoice {
  private constructor(private readonly props: VerifactuInvoiceProps) {}

  static create(input: CreateVerifactuInvoiceInput): VerifactuInvoice {
    const now = new Date();
    
    return new VerifactuInvoice({
      id: crypto.randomUUID(),
      orderId: input.orderId,
      serie: input.serie,
      numero: input.numero,
      fechaExpedicion: input.fechaExpedicion,
      tipoFactura: input.tipoFactura,
      descripcion: input.descripcion,
      nif: input.nif,
      nombre: input.nombre,
      lineas: input.lineas,
      importeTotal: input.importeTotal,
      estado: 'PENDIENTE',
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrisma(props: VerifactuInvoiceProps): VerifactuInvoice {
    return new VerifactuInvoice(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get serie(): string {
    return this.props.serie;
  }

  get numero(): string {
    return this.props.numero;
  }

  get fechaExpedicion(): string {
    return this.props.fechaExpedicion;
  }

  get tipoFactura(): VerifactuInvoiceType {
    return this.props.tipoFactura;
  }

  get descripcion(): string {
    return this.props.descripcion;
  }

  get nif(): string | undefined {
    return this.props.nif;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get lineas(): VerifactuInvoiceLine[] {
    return this.props.lineas;
  }

  get importeTotal(): string {
    return this.props.importeTotal;
  }

  get uuid(): string | undefined {
    return this.props.uuid;
  }

  get qrCode(): string | undefined {
    return this.props.qrCode;
  }

  get urlVerificacion(): string | undefined {
    return this.props.urlVerificacion;
  }

  get estado(): VerifactuInvoiceStatus | undefined {
    return this.props.estado;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  setUuid(uuid: string): void {
    this.props.uuid = uuid;
    this.props.updatedAt = new Date();
  }

  setQrCode(qrCode: string): void {
    this.props.qrCode = qrCode;
    this.props.updatedAt = new Date();
  }

  setUrlVerificacion(url: string): void {
    this.props.urlVerificacion = url;
    this.props.updatedAt = new Date();
  }

  setEstado(estado: VerifactuInvoiceStatus): void {
    this.props.estado = estado;
    this.props.updatedAt = new Date();
  }

  setError(codigo: string, mensaje: string): void {
    this.props.estado = 'ERROR';
    this.props.codigoError = codigo;
    this.props.mensajeError = mensaje;
    this.props.updatedAt = new Date();
  }

  markAsCorrecto(): void {
    this.props.estado = 'CORRECTO';
    this.props.updatedAt = new Date();
  }

  markAsIncorrecto(): void {
    this.props.estado = 'INCORRECTO';
    this.props.updatedAt = new Date();
  }

  markAsAceptadoConErrores(): void {
    this.props.estado = 'ACEPTADO_CON_ERRORES';
    this.props.updatedAt = new Date();
  }

  toJSON(): VerifactuInvoiceProps {
    return { ...this.props };
  }

  toApiPayload(): Record<string, unknown> {
    return {
      serie: this.props.serie,
      numero: this.props.numero,
      fecha_expedicion: this.props.fechaExpedicion,
      tipo_factura: this.props.tipoFactura,
      descripcion: this.props.descripcion,
      nif: this.props.nif,
      nombre: this.props.nombre,
      lineas: this.props.lineas.map(l => ({
        base_imponible: l.baseImponible,
        tipo_impositivo: l.tipoImpositivo,
        cuota_repercutida: l.cuotaRepercutida,
        ...(l.operacionExenta && { operacion_exenta: l.operacionExenta }),
      })),
      importe_total: this.props.importeTotal,
    };
  }
}