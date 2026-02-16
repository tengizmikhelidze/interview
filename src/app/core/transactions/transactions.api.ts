import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TransactionDetailsDto, TransactionsListResponseDto } from './transactions.dto';
import { mapTransactionDetailsDto, mapTransactionSummaryDto } from './transactions.mapper';
import { TransactionDetails, TransactionSummary, TransactionsQuery } from './transactions.model';

@Injectable({ providedIn: 'root' })
export class TransactionsApi {
  private readonly http = inject(HttpClient);

  getTransactions(query: TransactionsQuery): Observable<TransactionSummary[]> {
    let params = new HttpParams().set('sort', query.sort === 'oldest' ? 'asc' : 'desc');

    if (query.status !== 'all') {
      params = params.set('status', query.status.toUpperCase());
    }

    const normalizedSearch = query.search.trim();
    if (normalizedSearch.length > 0) {
      params = params.set('search', normalizedSearch);
    }

    return this.http
      .get<TransactionsListResponseDto>('/api/transactions', { params })
      .pipe(map((response) => response.items.map(mapTransactionSummaryDto)));
  }

  getTransactionDetails(id: string): Observable<TransactionDetails> {
    return this.http
      .get<TransactionDetailsDto>(`/api/transactions/${encodeURIComponent(id)}`)
      .pipe(map((response) => mapTransactionDetailsDto(response)));
  }
}
