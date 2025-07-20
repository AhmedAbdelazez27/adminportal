import { Routes } from '@angular/router';
import { InvoiceComponent } from './invoice/invoice.component';
import { PaymentVoucherComponent } from './payment-voucher/payment-voucher.component';
import { GLJEComponent } from './gl-je/gl-je.component';
import { ArMiscReceiptHeaderComponent } from './ArMiscReceiptHeader/Pages/ArMiscReceiptHeader.component';
// import { ApPaymentsTransactionHDRComponent } from './ApPaymentsTransactionHDR/Pages/ApPaymentsTransactionHDR.component';
import { VendorComponent } from './vendor/vendor.component';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { ApPaymentsTransactionHDRComponent } from '../../ApPaymentsTransactionHDR/Pages/ApPaymentsTransactionHDR.component';

export const operationsRoutes: Routes = [
    {
        path: 'general-journal', component: GLJEComponent, 
        canActivate: [authGuard],
        data: {pagePermission: 'GlJeHeader' } // GlJeHeader  ,   GlJeHeader.View
    },
    {
        path: 'invoice', component: InvoiceComponent, 
        canActivate: [authGuard],
        data: { pagePermission: 'VwApInvoiceHd' }  //VwApInvoiceHd  , VwApInvoiceHd.View
    },
    {
        path: 'payment-voucher', component: PaymentVoucherComponent, 
        canActivate: [authGuard],
        data: { pagePermission: 'ApMiscPaymentHeader' } // ApMiscPaymentHeader 
    },
    {
        path: 'receipt-voucher', component: ArMiscReceiptHeaderComponent, 
        canActivate: [authGuard],
        data: { pagePermission: 'ArMiscReciptHeader' } //ArMiscReciptHeader   ,   ArMiscReciptHeader.View
    },
    {
        path: 'receipt-operations', component: ApPaymentsTransactionHDRComponent, 
        canActivate: [authGuard],
        data: { pagePermission: 'ApPaymentTransactionsHdr' } // ApPaymentTransactionsHdr ,   ApPaymentTransactionsHdr.View
    },
    { path: 'vendor', component: VendorComponent  ,canActivate: [authGuard],
        data: { pagePermission: 'ApVendor' } //ApVendor   , ApVendor.View
    }
];

// { path: 'invoice', component: InvoiceComponent }, //  invoice
// { path: 'ArMiscReceiptHeader', component: ArMiscReceiptHeaderComponent }, // Receipt voucher
// { path: 'ApPaymentsTransactionHDR', component: ApPaymentsTransactionHDRComponent }, //Receipt operations
// { path: 'payment-voucher', component: PaymentVoucherComponent }, // Payment voucher
// { path: 'GL_JE', component: GLJEComponent }, // General Journal
// { path: 'vendor', component: VendorComponent }, // vendor