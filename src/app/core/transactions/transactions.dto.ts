export type TransactionStatusDto = 'PENDING' | 'SUCCESS' | 'FAILED';

export type PaymentMethodDto = 'CARD' | 'BANK_TRANSFER' | 'WALLET';

export interface TransactionSummaryDto {
  id: string;
  reference: string;
  amountCents: number;
  currency: string;
  status: TransactionStatusDto;
  createdAt: string;
  customerEmail: string;
}

export interface TransactionDetailsDto extends TransactionSummaryDto {
  gatewayTraceId: string;
  paymentMethod: PaymentMethodDto;
  failureCode: string | null;
  failureReason: string | null;
  rawPayload: Record<string, unknown>;
}

export interface TransactionsListResponseDto {
  items: TransactionSummaryDto[];
  total: number;
}
