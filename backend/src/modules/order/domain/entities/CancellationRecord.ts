export interface CancellationRecordProps {
  id: string;
  orderId: string;
  reason: string;
  cancelledBy: string; // user ID or 'system' or 'customer'
  cancelledAt: Date;
  createdAt: Date;
}

export interface CreateCancellationRecordInput {
  orderId: string;
  reason: string;
  cancelledBy: string;
}

export class CancellationRecord {
  private constructor(private readonly props: CancellationRecordProps) {}

  static create(input: CreateCancellationRecordInput): CancellationRecord {
    const now = new Date();
    return new CancellationRecord({
      id: crypto.randomUUID(),
      orderId: input.orderId,
      reason: input.reason,
      cancelledBy: input.cancelledBy,
      cancelledAt: now,
      createdAt: now,
    });
  }

  static fromPrisma(props: CancellationRecordProps): CancellationRecord {
    return new CancellationRecord(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get reason(): string {
    return this.props.reason;
  }

  get cancelledBy(): string {
    return this.props.cancelledBy;
  }

  get cancelledAt(): Date {
    return this.props.cancelledAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON(): CancellationRecordProps {
    return { ...this.props };
  }
}