import {computed, inject, Injectable, signal} from '@angular/core';
import {
  DateSortOrder,
  TransactionDetails,
  TransactionFilterStatus,
  TransactionsQuery,
  TransactionSummary
} from '../../core/transactions/transactions.model';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  map,
  shareReplay,
  switchMap,
  tap
} from 'rxjs';
import {TransactionsApi} from '../../core/transactions/transactions.api';
import {toObservable} from '@angular/core/rxjs-interop';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

@Injectable({providedIn: 'root'})
export class TransactionsConsoleStore {
  private readonly transactionsApi = inject(TransactionsApi)
  private readonly retryTransactionsSubject = new BehaviorSubject<void>(undefined);
  private readonly retryDetailsSubject = new BehaviorSubject<void>(undefined);

  readonly statusFilter = signal<TransactionFilterStatus>('all');
  readonly searchTerm = signal('');
  readonly sortOrder = signal<DateSortOrder>('newest');
  readonly selectedTransactionId = signal<string | null>(null);

  readonly listState = signal<AsyncState<TransactionSummary[]>>({
    data: [],
    loading: false,
    error: null
  });

  readonly detailsState = signal<AsyncState<TransactionDetails | null>>({
    data: null,
    loading: false,
    error: null
  });

  readonly failedCount = computed(
    () => this.listState().data.filter((transaction) => transaction.status === 'failed').length
  );

  constructor() {
    // TODO(interview): Implement full reactive orchestration.
    // Required:
    // 1) Build list request pipeline from status + debounced search + sort.
    // 2) Support loading/error/retry states for list.
    // 3) Cancel in-flight list requests when state changes.
    // 4) Build independent details request pipeline with its own loading/error/retry.
    // 5) Cancel in-flight details request on selection change.
    this.getTransactions().subscribe()

    this.getDetails().subscribe()
  }

  getTransactions() {
    return this.retryTransactionsSubject.pipe(
      map(() => {
        this.listState.set({data: [], loading: true, error: null})
        const query: TransactionsQuery = {
          status: this.statusFilter(),
          search: this.searchTerm(),
          sort: this.sortOrder()
        }

        return query
      }),
      switchMap((queryParams) =>
        this.transactionsApi.getTransactions(queryParams)
          .pipe(
            shareReplay(1),
            tap(() => console.log('transactions request')),
            tap(resp => this.listState.set({
              data: resp,
              loading: false,
              error: null
            })),
            catchError(err => {
              console.error(err)
              this.listState.set({data: [], loading: false, error: err.message});
              return EMPTY;
            })
          )
      )
    )
  }

  getDetails() {
    return combineLatest([
      toObservable(this.selectedTransactionId),
      this.retryDetailsSubject
    ]).pipe(
      map(([id]) => id),
      filter(id => id !== null),
      tap(() => this.detailsState.set({data: null, loading: true, error: null})),
      switchMap((filteredId) =>
        this.transactionsApi.getTransactionDetails(filteredId)
          .pipe(
            shareReplay(1),
            tap(() => console.log('details request')),
            tap(resp => this.detailsState.set({
              data: resp,
              loading: false,
              error: null
            })),
            catchError(err => {
              console.error(err)
              this.detailsState.set({data: null, loading: false, error: err.message});
              return EMPTY;
            })
          )
      )
    )
  }

  setStatusFilter(status: TransactionFilterStatus): void {
    this.statusFilter.set(status);
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setSortOrder(sortOrder: DateSortOrder): void {
    this.sortOrder.set(sortOrder);
  }

  selectTransaction(id: string): void {
    this.selectedTransactionId.set(id);
    this.detailsState.set({data: null, loading: false, error: null});
    this.retryDetailsSubject.next();
  }

  clearSelection(): void {
    this.selectedTransactionId.set(null);
    this.detailsState.set({data: null, loading: false, error: null});
  }

  retryList(): void {
    this.retryTransactionsSubject.next();
  }

  retryDetails(): void {
    this.retryDetailsSubject.next();
  }
}
