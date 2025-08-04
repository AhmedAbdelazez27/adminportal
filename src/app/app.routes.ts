import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home/home.component';
import { authGuard } from './core/guards/auth/auth-guars';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/mainlayout.component';
import { NoPermissionComponent } from './shared/components/no-permission/no-permission.component';
import { ForgetpasswordComponent } from './features/auth/forgetpassword/forgetpassword.component';
import { VerifyotpComponent } from './features/auth/verifyotp/verifyotp.component';
import { ResetpasswordComponent } from './features/auth/resetpassword/resetpassword.component';
import { ApPaymentsTransactionHDRComponent } from './features/finanial/operations/ApPaymentsTransactionHDR/Pages/ApPaymentsTransactionHDR.component';
import { ArMiscReceiptHeaderComponent } from './features/finanial/operations/ArMiscReceiptHeader/Pages/ArMiscReceiptHeader.component';
import { GLJEComponent } from './features/finanial/operations/gl-je/gl-je.component';
import { InvoiceComponent } from './features/finanial/operations/invoice/invoice.component';
import { PaymentVoucherComponent } from './features/finanial/operations/payment-voucher/payment-voucher.component';
import { VendorComponent } from './features/finanial/operations/vendor/vendor.component';
import { catchReceiptRptComponent } from './features/finanial/reports/cachReceiptRpt/catchReceiptRpt.component';
import { generalLJournalRptComponent } from './features/finanial/reports/generalLJournalRpt/generalLJournalRpt.component';
import { getTotlaBenDonationsRPTComponent } from './features/finanial/reports/getTotlaBenDonationsRPT/getTotlaBenDonationsRPT.component';
import { receiptRPTComponent } from './features/finanial/reports/receiptRPT/receiptRPT.component';
import { vendorsPayTransRPTComponent } from './features/finanial/reports/vendorsPayTransRPT/vendorsPayTransRPT.component';
import { projectsComponent } from './features/projects/operations/projects/projects.component';
import { projectCountryListRptComponent } from './features/projects/reports/projectCountryListRpt/projectCountryListRpt.component';
import { projectTypeListRptComponent } from './features/projects/reports/projectTypeListRpt/projectTypeListRpt.component';
import { requestDetailsEntitiesRPTComponent } from './features/serviceRequestsReports/requestDetailsEntitiesRPT/requestDetailsEntitiesRPT.component';
import { aidRequestsComponent } from './features/socialcases/operations/aidRequests/aidRequests.component';
import { caseHelpRptComponent } from './features/socialcases/reports/caseHelpRpt/caseHelpRpt.component';
import { casesEntitiesRptComponent } from './features/socialcases/reports/casesEntitiesRpt/casesEntitiesRpt.component';
import { orderListBranchRptComponent } from './features/socialcases/reports/orderListBranchRpt/orderListBranchRpt.component';
import { ordersListCityRptComponent } from './features/socialcases/reports/ordersListCityRpt/ordersListCityRpt.component';
import { BeneficentComponent } from './features/sponsorship/operations/beneficent/beneficent.component';
import { casePaymentComponent } from './features/sponsorship/operations/casePayment/casePayment.component';
import { caseSearchComponent } from './features/sponsorship/operations/caseSearch/caseSearch.component';
import { spContractsComponent } from './features/sponsorship/operations/contracts/spContracts.component';
import { benifcientTotalRptComponent } from './features/sponsorship/reports/benifcientTotalRpt/benifcientTotalRpt.component';
import { caseAidEntitiesRptComponent } from './features/sponsorship/reports/caseAidEntitiesRpt/caseAidEntitiesRpt.component';
import { caseSearchListRptComponent } from './features/sponsorship/reports/caseSearchListRpt/caseSearchListRpt.component';
import { caseSearchRptComponent } from './features/sponsorship/reports/caseSearchRpt/caseSearchRpt.component';
import { getBeneficentsRptComponent } from './features/sponsorship/reports/getBeneficentsRPT/getBeneficentsRpt.component';
import { totalRequestsEntitiesRPTComponent } from './features/serviceRequestsReports/totalRequestsEntitiesRPT/totalRequestsEntitiesRPT.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgetpasswordComponent },
  { path: 'verify-otp', component: VerifyotpComponent },
  { path: 'reset-password', component: ResetpasswordComponent },
  { path: 'Invoice', component: InvoiceComponent },
  { path: 'GL_JE', component: GLJEComponent },
  { path: 'AP_MISC_PAYMENT', component: PaymentVoucherComponent },
  { path: 'Recieve_Trans', component: ArMiscReceiptHeaderComponent },
  { path: 'Payement_Trans', component: ApPaymentsTransactionHDRComponent },
  { path: 'Vendor', component: VendorComponent },
  { path: 'CatchReceipt', component: catchReceiptRptComponent },
  { path: 'GeneralGLJournal', component: generalLJournalRptComponent },
  { path: 'GetTotlaBenDonations', component: getTotlaBenDonationsRPTComponent },
  { path: 'Receipt', component: receiptRPTComponent },
  { path: 'VendorsPayTrans', component: vendorsPayTransRPTComponent },
  { path: 'Beneficent', component: BeneficentComponent },
  { path: 'CasePayments', component: casePaymentComponent },
  { path: 'Contracts', component: spContractsComponent },
  { path: 'CasesSearch', component: caseSearchComponent },
  { path: 'GetBeneficents', component: getBeneficentsRptComponent },
  { path: 'GetCases', component: caseSearchRptComponent },
  { path: 'BenifcientTotla', component: benifcientTotalRptComponent },
  { path: 'caseSearchListRpt', component: caseSearchListRptComponent },
  { path: 'GetCaseAIDEntities', component: caseAidEntitiesRptComponent },
  { path: 'AidRequests', component: aidRequestsComponent },
  { path: 'BranchOrdersList', component: orderListBranchRptComponent },
  { path: 'EmiratesOrdersList', component: ordersListCityRptComponent },
  { path: 'CasesEntities', component: casesEntitiesRptComponent },
  { path: 'CasesHelp', component: caseHelpRptComponent },
  { path: 'Projects', component: projectsComponent },
  { path: 'CountryProjectList', component: projectCountryListRptComponent },
  { path: 'TypeProjectList', component: projectTypeListRptComponent },
  { path: 'RequestDetailsReport', component: requestDetailsEntitiesRPTComponent },
  { path: 'TotalRequestsReport', component: totalRequestsEntitiesRPTComponent },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'authentication',
        children: [
          { path: '', redirectTo: 'roles', pathMatch: 'full' },
          {
            path: 'roles',
            loadChildren: () =>
              import('./features/roles/roles.routes').then(
                (m) => m.rolesRoutes
              ),
            canActivate: [authGuard],
            data: { permission: 'Role.View' },
          },
          {
            path: 'users',
            loadChildren: () =>
              import('./features/users/users.routes').then(
                (m) => m.usersRoutes
              ),
            canActivate: [authGuard],
            data: { permission: 'User.View' },
          },
          {
            path: 'department',
            loadChildren: () =>
              import(
                './features/Authentication/department/department.routes'
              ).then((m) => m.departmentRoutes),
             canActivate: [authGuard],
            data: { permission: 'Departments.View' },
          },
           {
            path: 'entity',
            loadChildren: () =>
              import('./features/Authentication/entity/entity.routes').then(
                (m) => m.entityRoutes
              ),
           canActivate: [authGuard],
            data: { permission: 'Entity.View' },
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: 'regions',
            loadChildren: () =>
              import(
                './features/UserSetting/setting-regions-component/setting-regions-component.routes'
              ).then((m) => m.settingRegionsRoutes),
            //canActivate: [authGuard],
            data: { permission: 'Settings.View' },
          },
        ],
      },
      {
        path: 'financial',
        children: [
          {
            path: 'operations',
            loadChildren: () =>
              import('./features/finanial/operations/operations.routes').then(
                (m) => m.operationsRoutes
              ),
            // canActivate: [authGuard],
            // data: { permission: 'Financial.View' }
          },
          {
            path: 'reports',
            loadChildren: () =>
              import('./features/finanial/reports/reports.routes').then(
                (m) => m.reportsRoutes
              ),
            // canActivate: [authGuard],
            // data: { permission: 'Financial.View' }
          },{
            path: 'charts',
            loadChildren: () =>
              import('./features/finanial/charts/charts.routes').then(
                (m) => m.chartsRoutes
              ),
            // canActivate: [authGuard],
            // data: { permission: 'Financial.View' }
          },
          
        ],
      },

      {
        path: 'Sponsorship',
        children: [
          {
            path: 'operations',
            loadChildren: () =>
              import('./features/sponsorship/operations/operations.routes').then(
                (m) => m.operationsRoutes
              ),

          },
          {
            path: 'reports',
            loadChildren: () =>
              import('./features/sponsorship/reports/reports.routes').then(
                (m) => m.ReportsRoutes
              ),

          },
        ],
      },

      {
        path: 'SocialCases',
        children: [
          {
            path: 'operations',
            loadChildren: () =>
              import('./features/socialcases/operations/operations.routes').then(
                (m) => m.operationsRoutes
              ),

          },
          {
            path: 'reports',
            loadChildren: () =>
              import('./features/socialcases/reports/reports.routes').then(
                (m) => m.ReportsRoutes
              ),

          },
        ],
      },

      {
        path: 'Projects',
        children: [
          {
            path: 'operations',
            loadChildren: () =>
              import('./features/projects/operations/operations.routes').then(
                (m) => m.operationsRoutes
              ),

          },
          {
            path: 'reports',
            loadChildren: () =>
              import('./features/projects/reports/reports.routes').then(
                (m) => m.reportsRoutes
              ),

          },
        ],
      },
      {
        path: 'ServiceRequests',
        children: [

          {
            path: 'reports',
            loadChildren: () =>
              import('./features/serviceRequestsReports/reports.routes').then(
                (m) => m.reportsRoutes
              ),

          },
        ],
      },


    ],
  },

  { path: 'no-permission', component: NoPermissionComponent },
  { path: '**', component: PageNotFoundComponent },
];
