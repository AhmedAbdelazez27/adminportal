import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as XLSX from 'xlsx';
import { FndLookUpValuesSelect2RequestDto, Pagination, reportPrintConfig, SelectdropdownResult, SelectdropdownResultResults } from './../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ApPaymentsTransactionHDRDto, FilterApPaymentsTransactionHDRByIdDto, FilterApPaymentsTransactionHDRDto } from './../../../core/dtos/ApPaymentsTransactionHDRdtos/ApPaymentsTransactionHDR.dto';
import { ApPaymentsTransactionHDRService } from './../../../core/services/ApPaymentsTransactionHDR.service';
import { openStandardReportService } from './../../../core/services/openStandardReportService.service';

@Component({
  selector: 'app-ApPaymentsTransactionHDR',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ApPaymentsTransactionHDR.component.html',
  styleUrls: ['./ApPaymentsTransactionHDR.component.scss']
})

export class ApPaymentsTransactionHDRComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();
  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];
  paymentTypeSelect2: SelectdropdownResultResults[] = [];
  vendorSelect2: SelectdropdownResultResults[] = [];

  filterApPaymentsTransactionHDRObj = new FilterApPaymentsTransactionHDRDto();
  searchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  filterApPaymentsTransactionHDRByIdObj = new FilterApPaymentsTransactionHDRByIdDto();

  apPaymentsTransactionHDRListData: ApPaymentsTransactionHDRDto[] = [];
  apPaymentsTransactionHDRData: ApPaymentsTransactionHDRDto = {} as ApPaymentsTransactionHDRDto;

  loading = false;
  selectedvendorSelect2Obj: any = null;
  selectedentitySelect2Obj: any = null;
  selectpaymentTypeSelect2Obj: any = null;

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  constructor(
    private apPaymentsTransactionHDRService: ApPaymentsTransactionHDRService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private fb: FormBuilder
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.fetchEntityList();
    this.fetchVendorNameList();
    this.fetchPaymentTypeDescList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchEntityList(): void {
    this.apPaymentsTransactionHDRService.getEntityList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.entitySelect2 = response?.results || [];
      },
      error: (err) => {
        this.toastr.error('Failed to load entity list.', 'Error');
        console.error('Entity list load error', err);
      }
    });
  }

  fetchVendorNameList(): void {
    this.apPaymentsTransactionHDRService.getApVendorList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
          this.vendorSelect2 = response?.results || [];
      },
        error: (err) => {
          this.toastr.error('Failed to load Vendor list.', 'Error');
          console.error('Vendor list load error', err);
      }
    });
  }
  fetchPaymentTypeDescList(): void {
    this.apPaymentsTransactionHDRService.getPaymentTypeList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.paymentTypeSelect2 = response?.results || [];
      },
        error: (err) => {
          this.toastr.error('Failed to load PaymentType list.', 'Error');
          console.error('PaymentType  list load error', err);
      }
    });
  }

  focused(event: any): void {
    const label = event.target.parentElement.querySelector('label');
    if (label && !label.classList.contains('label-over')) {
      label.classList.add('label-over');
    }
  }

  blured(event: FocusEvent, value: string | null): void {
    const target = event.target as HTMLElement;
    const label = target.parentElement?.querySelector('label');
    if (label && label.classList.contains('label-over') && (!value || value === '')) {
      label.classList.remove('label-over');
    }
  }

  getApPaymentsTransactionHDR(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.filterApPaymentsTransactionHDRObj.entityId) return;
    this.loading = true;

    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(this.filterApPaymentsTransactionHDRObj)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.apPaymentsTransactionHDRListData = response || [];
        this.pagination.totalCount = response?.totalCount || 0;
        this.calculatePages();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Error fetching ApPaymentsTransactionHDRs details.', 'Error');
        console.error('Error fetching ApPaymentsTransactionHDRs:', error);
      }
    });
  }

  calculatePages(): void {
    const totalPages = Math.ceil(this.pagination.totalCount / this.pagination.itemsPerPage);
    this.pagination.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(event: any): void {
    if (event < 1) event = 1;
    if (event > this.pagination.pages.length) event = this.pagination.pages.length;
    this.pagination.currentPage = event;
    this.getApPaymentsTransactionHDR(event, this.pagination.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.itemsPerPage = perPage;
      this.calculatePages();
      this.getApPaymentsTransactionHDR(1, this.pagination.searchValue);
    }
  }


  onvendorSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterApPaymentsTransactionHDRObj.vendorName = selectedVendor.id;
      this.filterApPaymentsTransactionHDRObj.vendorNamestr = selectedVendor.text;
    } else {
      this.filterApPaymentsTransactionHDRObj.vendorName = null;
      this.filterApPaymentsTransactionHDRObj.vendorNamestr = null;
    }
  }

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterApPaymentsTransactionHDRObj.entityId = selectedVendor.id;
      this.filterApPaymentsTransactionHDRObj.entityIdstr = selectedVendor.text;
    } else {
      this.filterApPaymentsTransactionHDRObj.entityId = null;
      this.filterApPaymentsTransactionHDRObj.entityIdstr = null;
    }
  }

  onpaymentTypeSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterApPaymentsTransactionHDRObj.paymentTypeDesc = selectedVendor.id;
      this.filterApPaymentsTransactionHDRObj.paymentTypeDescstr = selectedVendor.text;
    } else {
      this.filterApPaymentsTransactionHDRObj.paymentTypeDesc = null;
      this.filterApPaymentsTransactionHDRObj.paymentTypeDescstr = null;
    }
  }


  onSearch(): void {
    this.pagination.currentPage = 1;

    const cleanedFilters = this.cleanFilterObject(this.filterApPaymentsTransactionHDRObj);
    if (!this.filterApPaymentsTransactionHDRObj.entityId) {
      this.toastr.warning('Please Select EntityID', 'Warning');
      return;
    }
    this.loading = true;
    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.apPaymentsTransactionHDRListData = response || [];
        this.pagination.totalCount = response?.totalCount || 0;
          this.calculatePages();
          this.loading = false;
      },
        error: (error) => {
          this.toastr.error('Error fetching ApPaymentsTransactionHDRs details.', 'Error');
        console.error('Error fetching ApPaymentsTransactionHDRs:', error);
      }
    });
  }

  private cleanFilterObject(obj: any): any {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === '') {
        cleaned[key] = null;
      }
    });
    return cleaned;
  }

  clear(): void {
    this.filterApPaymentsTransactionHDRObj = new FilterApPaymentsTransactionHDRDto();
    this.apPaymentsTransactionHDRListData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getApPaymentsTransactionHDRDetailById(tr_Id: string, entitY_ID: string): void {
    const params: FilterApPaymentsTransactionHDRByIdDto = {
      entityId: entitY_ID,
      paymentId: tr_Id
    };
    this.loading = true;
    forkJoin({
      mischeaderdata: this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRDatabyId(params) as Observable<
        ApPaymentsTransactionHDRDto | ApPaymentsTransactionHDRDto[]>,
    })
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.apPaymentsTransactionHDRData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ApPaymentsTransactionHDRDto)
          : result.mischeaderdata;
          this.loading = false;
      },
        error: (err) => {
          this.loading = false;
          this.toastr.error('Error fetching PaymentsTransaction details.', 'Error');
          console.error('Error fetching PaymentsTransaction details:', err);
      }
    });
  }


  printExcel(): void {
    this.loading = true;
    this.filterApPaymentsTransactionHDRObj.take = 999999;
    const cleanedFilters = this.cleanFilterObject(this.filterApPaymentsTransactionHDRObj);

    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response?.items || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('ApPaymentsTransactionHDRResourceName.Title'),
            reportTitle: this.translate.instant('ApPaymentsTransactionHDRResourceName.Title'),
            fileName: `${this.translate.instant('ApPaymentsTransactionHDRResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.EntityId'), value: this.filterApPaymentsTransactionHDRObj.entityIdstr },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'), value: this.filterApPaymentsTransactionHDRObj.paymentNumber },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'), value: this.filterApPaymentsTransactionHDRObj.paymentDate },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'), value: this.filterApPaymentsTransactionHDRObj.vendorNumber },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'), value: this.filterApPaymentsTransactionHDRObj.vendorNamestr },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'), value: this.filterApPaymentsTransactionHDRObj.paymentTypeDescstr },
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'), key: 'paymenT_NUMBER' },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'), key: 'paymenT_DATEstr' },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'), key: 'paymenT_TYPE_DESC' },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'), key: 'vendoR_NUMBER' },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'), key: 'vendoR_NAME' },
              { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.Amount'), key: 'paymenT_AMOUNTstr' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['receiptAmountstr', 'chequeAmountstr', 'cashAmountstr', 'administrativeAmountstr']
          };

          this.openStandardReportService.openStandardReportExcel(reportConfig);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to export Excel');
        }
      });
  }
}

