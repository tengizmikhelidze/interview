export type TransactionStatus = 'pending' | 'success' | 'failed';
export type TransactionFilterStatus = 'all' | TransactionStatus;
export type DateSortOrder = 'newest' | 'oldest';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet';

export interface TransactionsQuery {
  status: TransactionFilterStatus;
  search: string;
  sort: DateSortOrder;
}

export interface TransactionSummary {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: Date;
  customerEmail: string;
}

export interface TransactionDetails extends TransactionSummary {
  gatewayTraceId: string;
  paymentMethod: PaymentMethod;
  failureCode: string | null;
  failureReason: string | null;
  rawPayload: Record<string, unknown>;
}
