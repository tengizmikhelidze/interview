# Payment Operations Console Interview Starter

This repository is a **starter project** for a Senior Angular Engineer live coding interview.

## What is prebuilt

- Angular `21.1.x` standalone app (strict mode)
- In-memory mock backend via HTTP interceptor
- Typed DTO/domain models and mapping layer
- Starter UI shell and styles
- Starter store with TODO markers

## Mock API contract

- `GET /api/transactions`
- `GET /api/transactions/:id`

Simulation rules:

- Latency: `400-1200ms`
- Error rate: `15%` list, `25%` details

## Interview task to implement

Implement the feature details in `src/app/features/transactions/transactions-console.store.ts` and related UI:

- Transactions list with loading/error/retry states
- Status filter and debounced text search
- Sorting by creation date
- Row selection opens details panel
- Independent request handling for list and details
- Cancel in-flight requests on state change

Constraints:

- Signals for UI state/computed values
- RxJS for orchestration/cancellation
- Control flow syntax (`@if`, `@for`, `@switch`)
- Strict typing from DTO to domain

## Run

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Verify

```bash
npm run build
npm run test -- --watch=false
```

## Useful files

- `src/app/core/transactions/mock-transactions.interceptor.ts`
- `src/app/core/transactions/transactions.api.ts`
- `src/app/core/transactions/transactions.dto.ts`
- `src/app/core/transactions/transactions.model.ts`
- `src/app/core/transactions/transactions.mapper.ts`
- `src/app/features/transactions/transactions-console.store.ts`
