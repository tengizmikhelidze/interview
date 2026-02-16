import { Routes } from '@angular/router';
import { TransactionsConsoleComponent } from './features/transactions/transactions-console.component';

export const routes: Routes = [
  {
    path: '',
    component: TransactionsConsoleComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
