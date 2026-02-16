# Senior Angular Engineer - 1 Hour Live Task

## Business scenario

Build an internal **Payment Operations Console** where support agents monitor transactions,
filter failed payments, and inspect technical details for troubleshooting.

## Functional scope

Implement:

- Transactions list with loading, error and retry states
- Status filter and debounced text search
- Sorting by creation date
- Row selection opens details panel
- Independent request handling for list and details
- Cancel in-flight requests on state changes

## Technical constraints

- Angular latest version, standalone only
- Signals for UI state and computed values
- RxJS for async orchestration and cancellation
- Control flow syntax (`@if`, `@for`, `@switch`)
- Strictly typed DTO to domain mapping

## API contract

- `GET /api/transactions` - filtered/sorted list
- `GET /api/transactions/:id` - transaction details

Backend behavior (already provided in starter):

- Latency `400-1200ms`
- Error rate `15%` list, `25%` details

## Evaluation dimensions

- Architecture and separation of concerns
- Reactive thinking
- State modeling
- Performance awareness
- Error handling and UX
- Type safety
