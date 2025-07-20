import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PaymentVoucherServiceService } from '../../core/services/payment-voucher-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-voucher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-voucher.component.html',
  styleUrls: ['./payment-voucher.component.scss']
})
export class PaymentVoucherComponent implements OnInit {
  // Data lists
  apMiscPaymentList: any[] = [];
  paymentList: any[] = [];
  paymentHeaderData: any = {};
  checkDetailsList: any[] = [];
  beneficiaryList: any[] = [];
  entityList: any[] = [];
  statusList: any[] = [];

  // Filter model
  filterModel = {
    entityId: null as string | null,
    paymentNumber: null as string | null,
    beneficiaryName: null as string | null,
    checkNumber: null as string | null,
    amount: null as number | null,
    status: null as string | null,
    orderByValue: 'MISC_PAYMENT_ID'
  };

  constructor(private readonly apiService: PaymentVoucherServiceService,private toastr: ToastrService) {}

  ngOnInit(): void {
  }


  getApMiscPaymentHeaders(): void {
    const filter = { ...this.filterModel };
      if (!filter.entityId || filter.entityId.trim() === '') {
      this.toastr.warning('Please select an entity before searching.', 'Warning');
      return;
    }
 
    this.apiService.getApMiscPaymentHeaders(filter).subscribe({
      next: (response: any[]) => {
        this.apMiscPaymentList = (response || []).map((item: any) => {
          if (item.misC_PAYMENT_DATE) {
            const date = new Date(item.misC_PAYMENT_DATE);
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            item.misC_PAYMENT_DATE = `${day}-${month}-${year}`;
          }
          return item;
        });
      },
      error: (err) => console.error('API error:', err)
    });
  }


  getMiscPaymentHeaderWithDetails(miscPaymentId: string, entityId: string): void {
    forkJoin({
      header: this.apiService.getMiscPaymentHeaderWithHisDetails(miscPaymentId, entityId),
      paymentList: this.apiService.getPaymentLines(miscPaymentId, entityId),
      checkDetailsList: this.apiService.getPaymentDetails(miscPaymentId, entityId)
    }).subscribe({
      next: (result) => {
        this.paymentHeaderData = Array.isArray(result.header) ? result.header[0] || {} : result.header;
        this.paymentList = result.paymentList || [];
        this.checkDetailsList = result.checkDetailsList || [];
      },
      error: (err) => console.error('Error fetching payment voucher details:', err)
    });
  }

  loadBeneficiary(): void {
    if (this.beneficiaryList.length > 0) return;
    const request = { searchTerm: '', take: 100, skip: 0 };
    this.apiService.getBeneficiary(request).subscribe({
      next: (response: any) => this.beneficiaryList = response?.results || [],
      error: (err) => console.error('Beneficiary list load error', err)
    });
  }

  loadEntities(): void {
    if (this.entityList.length > 0) return;
    this.apiService.getEntities().subscribe({
      next: (response: any) => this.entityList = response?.data || [],
      error: (err) => console.error('Entity load error', err)
    });
  }

  loadStatus(): void {
    if (this.statusList.length > 0) return;
    const request = { searchTerm: '', take: 100, skip: 0 };
    this.apiService.getStatus(request).subscribe({
      next: (response: any) => this.statusList = response?.results || [],
      error: (err) => console.error('Status list load error', err)
    });
  }

 
  applyFilter(): void {
    this.getApMiscPaymentHeaders();
  }


  clearFilter(): void {
    this.filterModel = {
      entityId: null,
      paymentNumber: null,
      beneficiaryName: null,
      checkNumber: null,
      amount: null,
      status: null,
      orderByValue: 'MISC_PAYMENT_ID'
    };
  }
}
