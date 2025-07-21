import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { catchReceiptRptInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { catchReceiptRptOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'

@Component({
  selector: 'app-catchReceiptRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './catchReceiptRpt.component.html',
  styleUrls: ['./catchReceiptRpt.component.scss']
})

export class catchReceiptRptComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];
  categorySelect2: SelectdropdownResultResults[] = [];
  collectorSelect2: SelectdropdownResultResults[] = [];
  
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new catchReceiptRptInputDto();
  getAllDataForReports: catchReceiptRptOutputDto[] = [];

  loading = false;
  selectedentitySelect2Obj: any = null
  selectedcollectorSelect2Obj: any = null;
  selectedcategorySelect2Obj: any = null;

  constructor(
    private financialReportService: FinancialReportService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService : openStandardReportService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.fetchEntitySelect2();
    this.fetchCollectorSelect2();
    this.fetchCategorySelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  fetchEntitySelect2(): void {
    this.financialReportService.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.entitySelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Entity.', 'Error');
        }
      });
  }

  fetchCollectorSelect2(): void {
    this.financialReportService.getCollectorSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.collectorSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load ColloctoName.', 'Error');
        }
      });
  }
  fetchCategorySelect2(): void {
    this.financialReportService.getCategorySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.categorySelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Branch.', 'Error');
        }
      });
  }

  getAllcatchReceiptRpt(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.searchParams.entityId) return;
    this.loading = true;

    this.financialReportService.getcatchReceiptRptData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.calculatePages();
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Error fetching Data.', 'Error');
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
    this.getAllcatchReceiptRpt(event, this.pagination.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.itemsPerPage = perPage;
      this.calculatePages();
      this.getAllcatchReceiptRpt(1, this.pagination.searchValue);
    }
  }

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.entityId = selectedVendor.id;
      this.searchParams.entityIdstr = selectedVendor.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }

  oncollectorSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.collectorName = selectedVendor.id;
      this.searchParams.collectorNamestr = selectedVendor.text;
    } else {
      this.searchParams.collectorName = null;
      this.searchParams.collectorNamestr = null;
    }
  }

  oncategorySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.type = selectedVendor.id;
      this.searchParams.typestr = selectedVendor.text;
    } else {
      this.searchParams.type = null;
      this.searchParams.typestr = null;
    }
  }


  onSearch(): void {
    this.pagination.currentPage = 1;

    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.loading = true;
    this.financialReportService.getcatchReceiptRptData(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.calculatePages();
          this.loading = false;
        },
        error: (error) => {
          this.toastr.error('Error fetching Data.', 'Error');
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
    this.searchParams = new catchReceiptRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }



  printExcel(): void {
    this.loading = true;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.financialReportService.getcatchReceiptRptData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response?.items || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('FinancialReportResourceName.catchReceipt_Title'),
            reportTitle: this.translate.instant('FinancialReportResourceName.catchReceipt_Title'),
            fileName: `${this.translate.instant('FinancialReportResourceName.catchReceipt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
              { label: this.translate.instant('FinancialReportResourceName.collectorName'), value: this.searchParams.collectorNamestr },
              { label: this.translate.instant('FinancialReportResourceName.type'), value: this.searchParams.typestr },
              { label: this.translate.instant('FinancialReportResourceName.fromNo'), value: this.searchParams.fromNo },
              { label: this.translate.instant('FinancialReportResourceName.toNo'), value: this.searchParams.toNo },
              { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
              { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('FinancialReportResourceName.bankAccountName'), key: 'banK_ACCOUNT_NAME' },
              { label: this.translate.instant('FinancialReportResourceName.beneficiaryName'), key: 'beneficiarY_NAME' },
              { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
              { label: this.translate.instant('FinancialReportResourceName.transactionTypeDesc'), key: 'transactioN_TYPE_DESC' },
              { label: this.translate.instant('FinancialReportResourceName.receiptNumber'), key: 'receipT_NUMBER' },
              { label: this.translate.instant('FinancialReportResourceName.miscReceiptDate'), key: 'misC_RECEIPT_DATEstr' },
              { label: this.translate.instant('FinancialReportResourceName.receiptAmount'), key: 'receipT_AMOUNTstr' },
              { label: this.translate.instant('FinancialReportResourceName.chequeAmount'), key: 'chequE_AMOUNTstr' },
              { label: this.translate.instant('FinancialReportResourceName.cashAmount'), key: 'casH_AMOUNTstr' },
              { label: this.translate.instant('FinancialReportResourceName.administrativeAmount'), key: 'administrativE_AMOUNTstr' },
              { label: this.translate.instant('FinancialReportResourceName.collectorName'), key: 'collectoR_NAME' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['receipT_AMOUNTstr', 'chequE_AMOUNTstr', 'casH_AMOUNTstr','administrativE_AMOUNTstr']
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


  printPDF(): void {
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.financialReportService.getcatchReceiptRptData(cleanedFilters).subscribe({
      next: (response: any) => {
        const data = response?.items || response || [];

        const reportConfig: reportPrintConfig = {
          title: this.translate.instant('FinancialReportResourceName.catchReceiptRpt_Title'),
          reportTitle: this.translate.instant('FinancialReportResourceName.catchReceiptRpt_Title'),
          fields: [
            { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
            { label: this.translate.instant('FinancialReportResourceName.collectorName'), value: this.searchParams.collectorNamestr },
            { label: this.translate.instant('FinancialReportResourceName.type'), value: this.searchParams.typestr },
            { label: this.translate.instant('FinancialReportResourceName.fromNo'), value: this.searchParams.fromNo },
            { label: this.translate.instant('FinancialReportResourceName.toNo'), value: this.searchParams.toNo },
            { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
            { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
          ],
          columns: [
            { label: '#', key: 'rowNo', title: '#' },
            { label: this.translate.instant('FinancialReportResourceName.bankAccountName'), key: 'banK_ACCOUNT_NAME' },
            { label: this.translate.instant('FinancialReportResourceName.beneficiaryName'), key: 'beneficiarY_NAME' },
            { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
            { label: this.translate.instant('FinancialReportResourceName.transactionTypeDesc'), key: 'transactioN_TYPE_DESC' },
            { label: this.translate.instant('FinancialReportResourceName.receiptNumber'), key: 'receipT_NUMBER' },
            { label: this.translate.instant('FinancialReportResourceName.miscReceiptDate'), key: 'misC_RECEIPT_DATEstr' },
            { label: this.translate.instant('FinancialReportResourceName.receiptAmount'), key: 'receipT_AMOUNTstr' },
            { label: this.translate.instant('FinancialReportResourceName.chequeAmount'), key: 'chequE_AMOUNTstr' },
            { label: this.translate.instant('FinancialReportResourceName.cashAmount'), key: 'casH_AMOUNTstr' },
            { label: this.translate.instant('FinancialReportResourceName.administrativeAmount'), key: 'administrativE_AMOUNTstr' },
            { label: this.translate.instant('FinancialReportResourceName.collectorName'), key: 'collectoR_NAME' },
          ],
          data,
          totalLabel: this.translate.instant('Common.Total'),
          totalKeys: ['receipT_AMOUNTstr', 'chequE_AMOUNTstr', 'casH_AMOUNTstr', 'administrativE_AMOUNTstr']
        };

        this.openStandardReportService.openStandardReportPDF(reportConfig);
      },
      error: (error) => {
        this.toastr.error('Failed to fetch data for report');
        console.error('Error fetching data for report:', error);
      }
    });
  }
}

