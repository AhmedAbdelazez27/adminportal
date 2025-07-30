import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { RevenueGeneralComponent } from './revenuesExpenses/revenue-general/revenue-general.component';

export const chartsRoutes: Routes = [
    {
        path: 'revenue-expenses-general', component: RevenueGeneralComponent
        // , canActivate: [authGuard],
        // data: { pagePermission: 'CatchReceiptRpt' }
    },   //Reports/CatchReceipt  // Receipt Voucher
    // {
    //     path: 'generalLJournalRpt', component: generalLJournalRptComponent
    //     , canActivate: [authGuard],
    //     data: { pagePermission: 'GeneralGlJournalRpt' }
    // }, //Reports/GeneralGLJournal  //Balance Sheet
    // {
    //     path: 'receiptRPT', component: receiptRPTComponent
    //     , canActivate: [authGuard],
    //     data: { pagePermission: 'ReceiptRpt' }
    // },  //Reports/Receipt     //Payment Voucher
    // {
    //     path: 'vendorsPayTransRPT', component: vendorsPayTransRPTComponent
    //     , canActivate: [authGuard],
    //     data: { pagePermission: 'VendorsPayRpt' }
    // },  //Reports/VendorsPayTrans // Vendor Balance Sheet
    // {
    //     path: 'getTotlaBenDonationsRPT', component: getTotlaBenDonationsRPTComponent
    //     , canActivate: [authGuard],
    //     data: { pagePermission: 'TotalBenDonationsRpt' }
    // },  //Reports/GetTotlaBenDonations  // Beneficent Total Donation

    // where the final report 
];