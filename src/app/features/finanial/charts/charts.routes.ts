import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { RevenueGeneralComponent } from './revenuesExpenses/revenue-general/revenue-general.component';
import { ComparisonsRevenueseExpensesComponent } from './comparisonsRevenueseExpenses/comparisons-revenuese-expenses/comparisons-revenuese-expenses.component';
import { ReceiptsPaymentChartsComponent } from './receipts-paymentcharts/receiptspaymentcharts.component';
import { ReceiptsPaymentsComparissionComponent } from './receipts-payments-comparission/receipts-payments-comparission.component';
import { StatisticsOfBeneficiaryFamiliesComponents } from '../../socialcases/charts/statistics-Benf-Families/statistics-Benf-Families.component';

export const chartsRoutes: Routes = [
  {
    path: 'revenue-expenses/:chartType',
    component: RevenueGeneralComponent,
    // canActivate: [authGuard]
  },// sub routing  : /General , /Period-Dapartment , /Period-Branches , /Branches-Accounts

  {
    path: 'receipt-payment/:chartType',
    component: ReceiptsPaymentChartsComponent,
    // canActivate: [authGuard]
  },

  {
    path: 'comparisons-revenue-expenses/:chartType',
    component: ComparisonsRevenueseExpensesComponent,
    // canActivate: [authGuard]
  }, // sub routing  :  /revenueByEntit  /revenueByDepartment /revenueByBranch   /revenueByAccount
       // sub routing  :  /expensesByEntit  /expensesByBranch  /expensesByDepartment   /expensesByAccount


  {
    path: 'receipts-payments-comparission/:chartType',
    component: ReceiptsPaymentsComparissionComponent,
    // canActivate: [authGuard]
  },


  {
    path: 'statistics-benf-families/:chartType',
    component: StatisticsOfBeneficiaryFamiliesComponents,
    // canActivate: [authGuard]
  },
];
