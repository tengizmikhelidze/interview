import { TransactionDetailsDto, TransactionStatusDto } from './transactions.dto';

const FAILURE_REASONS = [
  { code: 'CARD_DECLINED', reason: 'Card issuer declined the transaction.' },
  { code: 'INSUFFICIENT_FUNDS', reason: 'Not enough balance on payment instrument.' },
  { code: 'FRAUD_REVIEW', reason: 'Gateway flagged the transaction for manual review.' },
  { code: 'NETWORK_TIMEOUT', reason: 'Acquirer timeout while confirming payment.' }
] as const;

const MERCHANTS = ['Atlas Market', 'Urban Books', 'Nova Health', 'Summit Travel', 'Pixel Lab'] as const;
const CURRENCIES = ['USD', 'EUR', 'GBP'] as const;

function createSeededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function pickStatus(random: () => number): TransactionStatusDto {
  const value = random();
  if (value < 0.58) {
    return 'SUCCESS';
  }

  if (value < 0.8) {
    return 'PENDING';
  }

  return 'FAILED';
}

export function createMockTransactions(total = 160): TransactionDetailsDto[] {
  const random = createSeededRandom(20260216);
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;

  return Array.from({ length: total }, (_, index) => {
    const status = pickStatus(random);
    const amountCents = Math.floor((20 + random() * 1200) * 100);
    const createdAt = new Date(now - Math.floor(random() * 96 * oneHourMs));
    const merchant = MERCHANTS[Math.floor(random() * MERCHANTS.length)] ?? MERCHANTS[0];
    const currency = CURRENCIES[Math.floor(random() * CURRENCIES.length)] ?? CURRENCIES[0];

    const failure =
      status === 'FAILED'
        ? FAILURE_REASONS[Math.floor(random() * FAILURE_REASONS.length)] ?? FAILURE_REASONS[0]
        : null;

    return {
      id: `txn_${(index + 1).toString().padStart(4, '0')}`,
      reference: `PAY-${(100000 + index).toString()}`,
      amountCents,
      currency,
      status,
      createdAt: createdAt.toISOString(),
      customerEmail: `customer${(index % 24) + 1}@example.com`,
      gatewayTraceId: `gw_${Math.floor(random() * 900000 + 100000)}`,
      paymentMethod: status === 'PENDING' ? 'BANK_TRANSFER' : random() > 0.55 ? 'CARD' : 'WALLET',
      failureCode: failure?.code ?? null,
      failureReason: failure?.reason ?? null,
      rawPayload: {
        merchant,
        source: 'payment-console-mock',
        retries: Math.floor(random() * 3),
        processingNode: `node-${Math.floor(random() * 5) + 1}`
      }
    };
  });
}

export const MOCK_TRANSACTIONS = createMockTransactions();
