import type { ITransactionManager, TransactionClient } from './ITransactionManager';
import { prisma } from '@shared/infra/prisma/client';

/**
 * Prisma implementation of ITransactionManager
 * Uses Prisma's $transaction for ACID-compliant operations
 */
export class PrismaTransactionManager implements ITransactionManager {
  /**
   * Execute a function within a Prisma transaction
   * @param fn - Function that receives a transaction client and returns a result
   */
  async execute<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}