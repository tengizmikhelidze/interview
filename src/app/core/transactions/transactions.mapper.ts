import {
  PaymentMethodDto,
  TransactionDetailsDto,
  TransactionStatusDto,
  TransactionSummaryDto
} from './transactions.dto';
import { PaymentMethod, TransactionDetails, TransactionStatus, TransactionSummary } from './transactions.model';

const STATUS_MAP: Record<TransactionStatusDto, TransactionStatus> = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
};

const PAYMENT_METHOD_MAP: Record<PaymentMethodDto, PaymentMethod> = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  WALLET: 'wallet'
};

export function mapTransactionSummaryDto(dto: TransactionSummaryDto): TransactionSummary {
  return {
    id: dto.id,
    reference: dto.reference,
    amount: dto.amountCents / 100,
    currency: dto.currency,
    status: STATUS_MAP[dto.status],
    createdAt: new Date(dto.createdAt),
    customerEmail: dto.customerEmail
  };
}

export function mapTransactionDetailsDto(dto: TransactionDetailsDto): TransactionDetails {
  return {
    ...mapTransactionSummaryDto(dto),
    gatewayTraceId: dto.gatewayTraceId,
    paymentMethod: PAYMENT_METHOD_MAP[dto.paymentMethod],
    failureCode: dto.failureCode,
    failureReason: dto.failureReason,
    rawPayload: dto.rawPayload
  };
}
