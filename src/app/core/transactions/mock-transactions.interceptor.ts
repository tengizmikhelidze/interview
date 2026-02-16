import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, delay, mergeMap, of, throwError, timer } from 'rxjs';
import { MOCK_TRANSACTIONS } from './mock-transactions.data';
import {
  TransactionDetailsDto,
  TransactionStatusDto,
  TransactionSummaryDto,
  TransactionsListResponseDto
} from './transactions.dto';

const LIST_ERROR_RATE = 0.15;
const DETAILS_ERROR_RATE = 0.25;
const MIN_LATENCY_MS = 400;
const MAX_LATENCY_MS = 1200;

export const mockTransactionsApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.startsWith('/api/transactions')) {
    return next(req);
  }

  const path = getPath(req.url);
  const latency = randomLatency();

  if (path === '/api/transactions') {
    return handleListRequest(req, latency);
  }

  const transactionId = getTransactionId(path);
  if (transactionId) {
    return handleDetailsRequest(transactionId, latency);
  }

  return next(req);
};

function handleListRequest(req: HttpRequest<unknown>, latency: number): Observable<HttpEvent<unknown>> {
  if (shouldFail(LIST_ERROR_RATE)) {
    return delayedError(latency, 500, 'List endpoint failed. Please retry.');
  }

  const search = (req.params.get('search') ?? '').trim().toLowerCase();
  const status = normalizeStatus(req.params.get('status'));
  const sort = req.params.get('sort') === 'asc' ? 'asc' : 'desc';

  const filtered = MOCK_TRANSACTIONS.filter((transaction) => {
    if (status && transaction.status !== status) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      transaction.id,
      transaction.reference,
      transaction.customerEmail,
      transaction.gatewayTraceId
    ].some((value) => value.toLowerCase().includes(search));
  }).sort((first, second) => {
    const firstValue = Date.parse(first.createdAt);
    const secondValue = Date.parse(second.createdAt);
    return sort === 'asc' ? firstValue - secondValue : secondValue - firstValue;
  });

  const body: TransactionsListResponseDto = {
    items: filtered.map(mapToSummaryDto),
    total: filtered.length
  };

  return of(new HttpResponse<TransactionsListResponseDto>({ status: 200, body })).pipe(delay(latency));
}

function handleDetailsRequest(transactionId: string, latency: number): Observable<HttpEvent<unknown>> {
  const transaction = MOCK_TRANSACTIONS.find((item) => item.id === transactionId);
  if (!transaction) {
    return delayedError(latency, 404, `Transaction ${transactionId} was not found.`);
  }

  if (shouldFail(DETAILS_ERROR_RATE)) {
    return delayedError(latency, 500, `Details endpoint failed for ${transactionId}.`);
  }

  return of(new HttpResponse<TransactionDetailsDto>({ status: 200, body: transaction })).pipe(delay(latency));
}

function getPath(url: string): string {
  const [path] = url.split('?');
  return path ?? url;
}

function getTransactionId(path: string): string | null {
  const match = /^\/api\/transactions\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function randomLatency(): number {
  return Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1)) + MIN_LATENCY_MS;
}

function shouldFail(rate: number): boolean {
  return Math.random() < rate;
}

function mapToSummaryDto(transaction: TransactionDetailsDto): TransactionSummaryDto {
  return {
    id: transaction.id,
    reference: transaction.reference,
    amountCents: transaction.amountCents,
    currency: transaction.currency,
    status: transaction.status,
    createdAt: transaction.createdAt,
    customerEmail: transaction.customerEmail
  };
}

function normalizeStatus(status: string | null): TransactionStatusDto | null {
  if (!status) {
    return null;
  }

  const value = status.toUpperCase();
  if (value === 'PENDING' || value === 'SUCCESS' || value === 'FAILED') {
    return value;
  }

  return null;
}

function delayedError(latency: number, status: number, message: string): Observable<never> {
  const errorResponse = new HttpErrorResponse({
    status,
    statusText: 'Mock API Error',
    error: { message }
  });

  return timer(latency).pipe(mergeMap(() => throwError(() => errorResponse)));
}
