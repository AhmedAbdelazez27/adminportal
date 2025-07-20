import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { getTotlaBenDonationsRPTInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { getTotlaBenDonationsRPTOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'

@Component({
  selector: 'app-getTotlaBenDonationsRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './getTotlaBenDonationsRPT.component.html',
  styleUrls: ['./getTotlaBenDonationsRPT.component.scss']
})

export class getTotlaBenDonationsRPTComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];
  beneficentIdSelect2: SelectdropdownResultResults[] = [];

  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new getTotlaBenDonationsRPTInputDto();
  getAllDataForReports: getTotlaBenDonationsRPTOutputDto[] = [];

  loading = false;
  selectedentitySelect2Obj: any = null
  selectedbeneficentIdSelect2Obj: any = null;

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
    this.fetchbeneficentIdSelect2();
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

  fetchbeneficentIdSelect2(): void {
    this.financialReportService.getBeneficentIdSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.beneficentIdSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Beneficent.', 'Error');
        }
      });
  }


  getAllgetTotlaBenDonationsRPT(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.searchParams.entityId) return;
    this.loading = true;

    this.financialReportService.getgetTotlaBenDonationsRPTData(this.searchParams)
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
    this.getAllgetTotlaBenDonationsRPT(event, this.pagination.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.itemsPerPage = perPage;
      this.calculatePages();
      this.getAllgetTotlaBenDonationsRPT(1, this.pagination.searchValue);
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

  onbeneficentIdSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.beneficenT_ID = selectedVendor.id;
      this.searchParams.beneficentIdstr = selectedVendor.text;
    } else {
      this.searchParams.beneficenT_ID = null;
      this.searchParams.beneficentIdstr = null;
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
    this.financialReportService.getgetTotlaBenDonationsRPTData(cleanedFilters)
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
    this.searchParams = new getTotlaBenDonationsRPTInputDto();
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
    this.financialReportService.getgetTotlaBenDonationsRPTData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response?.items || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('FinancialReportResourceName.totlaBenDonationsRPT_Title'),
            reportTitle: this.translate.instant('FinancialReportResourceName.totlaBenDonationsRPT_Title'),
            fileName: `${this.translate.instant('FinancialReportResourceName.totlaBenDonationsRPT_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
              { label: this.translate.instant('FinancialReportResourceName.beneficentId'), value: this.searchParams.beneficentIdstr },
              { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
              { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('FinancialReportResourceName.beneficentName'), key: 'beneficentName' },
              { label: this.translate.instant('FinancialReportResourceName.beneficentNo'), key: 'beneficenT_NO' },
              { label: this.translate.instant('FinancialReportResourceName.receiptNumber'), key: 'receipT_NUMBER' },
              { label: this.translate.instant('FinancialReportResourceName.miscReceiptDate'), key: 'misC_RECEIPT_DATEstr' },
              { label: this.translate.instant('FinancialReportResourceName.receiptTypeDesc'), key: 'receipT_TYPE_DESC' },
              { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
              { label: this.translate.instant('FinancialReportResourceName.miscReceiptAmount'), key: 'misC_RECEIPT_AMOUNTstr' },
              { label: this.translate.instant('FinancialReportResourceName.administrative'), key: 'administrativEstr' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['miscReceiptAmountstr', 'administrativestr']
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
    this.financialReportService.getgetTotlaBenDonationsRPTData(cleanedFilters).subscribe({
      next: (response: any) => {
        const data = response?.items || response || [];
        const reportConfig: reportPrintConfig = {
          title: this.translate.instant('FinancialReportResourceName.getotlaBenDonationsRPT_Title'),
          reportTitle: this.translate.instant('FinancialReportResourceName.getotlaBenDonationsRPT_Title'),
          fields: [
            { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
            { label: this.translate.instant('FinancialReportResourceName.beneficentId'), value: this.searchParams.beneficentIdstr },
            { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
            { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
          ],
          columns: [
            { label: '#', key: 'rowNo', title: '#' },
            { label: '#', key: 'rowNo', title: '#' },
            { label: this.translate.instant('FinancialReportResourceName.beneficentName'), key: 'beneficentName' },
            { label: this.translate.instant('FinancialReportResourceName.beneficentNo'), key: 'beneficenT_NO' },
            { label: this.translate.instant('FinancialReportResourceName.receiptNumber'), key: 'receipT_NUMBER' },
            { label: this.translate.instant('FinancialReportResourceName.miscReceiptDate'), key: 'misC_RECEIPT_DATEstr' },
            { label: this.translate.instant('FinancialReportResourceName.receiptTypeDesc'), key: 'receipT_TYPE_DESC' },
            { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
            { label: this.translate.instant('FinancialReportResourceName.miscReceiptAmount'), key: 'misC_RECEIPT_AMOUNTstr' },
            { label: this.translate.instant('FinancialReportResourceName.administrative'), key: 'administrativEstr' },
          ],
          data,
          totalLabel: this.translate.instant('Common.Total'),
          totalKeys: ['misC_RECEIPT_AMOUNTstr', 'administrativestr']
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

