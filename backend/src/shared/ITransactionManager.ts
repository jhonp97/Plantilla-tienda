import type { PrismaClient, Prisma } from '@prisma/client';

/**
 * Transaction client type that can be used within a transaction
 * This is the client passed to functions that need to execute within a transaction
 */
export type TransactionClient = PrismaClient | Prisma.TransactionClient;

/**
 * Interface for transaction management in the application
 * Allows operations to be wrapped in database transactions for ACID compliance
 */
export interface ITransactionManager {
  /**
   * Execute a function within a transaction
   * @param fn - Function that receives a transaction client and returns a result
   * @returns The result of the function execution
   */
  execute<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T>;
}