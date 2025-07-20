import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { receiptRPTInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { receiptRPTOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';

@Component({
  selector: 'app-receiptRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './receiptRPT.component.html',
  styleUrls: ['./receiptRPT.component.scss']
})

export class receiptRPTComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];

  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new receiptRPTInputDto();
  getAllDataForReports: receiptRPTOutputDto[] = [];

  loading = false;
  selectedentitySelect2Obj: any = null

  constructor(
    private financialReportService: FinancialReportService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.fetchentitySelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchentitySelect2(): void {
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

  getAllreceiptRPT(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.searchParams.entityId) return;
    this.loading = true;

    this.financialReportService.getreceiptRPTData(this.searchParams)
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
    this.getAllreceiptRPT(event, this.pagination.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.itemsPerPage = perPage;
      this.calculatePages();
      this.getAllreceiptRPT(1, this.pagination.searchValue);
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

  onSearch(): void {
    this.pagination.currentPage = 1;

    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.loading = true;
    this.financialReportService.getreceiptRPTData(cleanedFilters)
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
    this.searchParams = new receiptRPTInputDto();
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
    this.financialReportService.getreceiptRPTData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response?.items || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('FinancialReportResourceName.receiptRPT_Title'),
            reportTitle: this.translate.instant('FinancialReportResourceName.receiptRPT_Title'),
            fileName: `${this.translate.instant('FinancialReportResourceName.receiptRPT_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
              { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
              { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
              { label: this.translate.instant('FinancialReportResourceName.fromNo'), value: this.searchParams.fromNo },
              { label: this.translate.instant('FinancialReportResourceName.toNo'), value: this.searchParams.toNo },
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('FinancialReportResourceName.paymentCategory'), key: 'paymentCategory' },
              { label: this.translate.instant('FinancialReportResourceName.paymentNumber'), key: 'paymentNumber' },
              { label: this.translate.instant('FinancialReportResourceName.beneficiaryName'), key: 'beneficiaryName' },
              { label: this.translate.instant('FinancialReportResourceName.paymentDate'), key: 'paymentDatestr' },
              { label: this.translate.instant('FinancialReportResourceName.paymentType'), key: 'paymentType' },
              { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amountstr' },
              { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
              { label: this.translate.instant('FinancialReportResourceName.bankAccount'), key: 'bankAccount' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['amountstr']
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
    this.financialReportService.getreceiptRPTData(cleanedFilters).subscribe({
      next: (response: any) => {
        const data = response?.items || response || [];
        const reportConfig: reportPrintConfig = {
          title: this.translate.instant('FinancialReportResourceName.receiptRPT_Title'),
          reportTitle: this.translate.instant('FinancialReportResourceName.receiptRPT_Title'),
          fields: [
            { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
            { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
            { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
            { label: this.translate.instant('FinancialReportResourceName.fromNo'), value: this.searchParams.fromNo },
            { label: this.translate.instant('FinancialReportResourceName.toNo'), value: this.searchParams.toNo },
          ],
          columns: [
            { label: '#', key: 'rowNo', title: '#' },
            { label: this.translate.instant('FinancialReportResourceName.paymentCategory'), key: 'paymentCategory' },
            { label: this.translate.instant('FinancialReportResourceName.paymentNumber'), key: 'paymentNumber' },
            { label: this.translate.instant('FinancialReportResourceName.beneficiaryName'), key: 'beneficiaryName' },
            { label: this.translate.instant('FinancialReportResourceName.paymentDate'), key: 'paymentDatestr' },
            { label: this.translate.instant('FinancialReportResourceName.paymentType'), key: 'paymentType' },
            { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amountstr' },
            { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
            { label: this.translate.instant('FinancialReportResourceName.bankAccount'), key: 'bankAccount' },
          ],
          data,
          totalLabel: this.translate.instant('Common.Total'),
          totalKeys: ['amountstr']
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

