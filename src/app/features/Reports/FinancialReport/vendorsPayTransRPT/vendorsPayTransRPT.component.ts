import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { vendorsPayTransRPTInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { vendorsPayTransRPTOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'

@Component({
  selector: 'app-vendorsPayTransRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './vendorsPayTransRPT.component.html',
  styleUrls: ['./vendorsPayTransRPT.component.scss']
})

export class vendorsPayTransRPTComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];
  vendorIdSelect2: SelectdropdownResultResults[] = [];

  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new vendorsPayTransRPTInputDto();
  getAllDataForReports: vendorsPayTransRPTOutputDto[] = [];

  loading = false;
  selectedentitySelect2Obj: any = null
  selectedvendorIdSelect2Obj: any = null

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
    this.fetchvendorIdSelect2();
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

  fetchvendorIdSelect2(): void {
    this.financialReportService.getVendorSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.vendorIdSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Vendor.', 'Error');
        }
      });
  }

  getAllvendorsPayTransRPT(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.searchParams.entityId) return;
    this.loading = true;

    this.financialReportService.getvendorsPayTransRPTData(this.searchParams)
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
    this.getAllvendorsPayTransRPT(event, this.pagination.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.itemsPerPage = perPage;
      this.calculatePages();
      this.getAllvendorsPayTransRPT(1, this.pagination.searchValue);
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
  onvendorIdSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.vendorId = selectedVendor.id;
      this.searchParams.vendorIdstr = selectedVendor.text;
    } else {
      this.searchParams.vendorId = null;
      this.searchParams.vendorIdstr = null;
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
    this.financialReportService.getvendorsPayTransRPTData(cleanedFilters)
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
    this.searchParams = new vendorsPayTransRPTInputDto();
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
    this.financialReportService.getvendorsPayTransRPTData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response?.items || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('FinancialReportResourceName.vendorsPayTransRPT_Title'),
            reportTitle: this.translate.instant('FinancialReportResourceName.vendorsPayTransRPT_Title'),
            fileName: `${this.translate.instant('FinancialReportResourceName.vendorsPayTransRPT_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
              { label: this.translate.instant('FinancialReportResourceName.vendorId'), value: this.searchParams.vendorIdstr },
              { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
              { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('FinancialReportResourceName.vendorNumber'), key: 'vendoR_NUMBER' },
              { label: this.translate.instant('FinancialReportResourceName.vendorName'), key: 'vendoR_NAME' },
              { label: this.translate.instant('FinancialReportResourceName.address'), key: 'address' },
              { label: this.translate.instant('FinancialReportResourceName.workTel'), key: 'worK_TEL' },
              { label: this.translate.instant('FinancialReportResourceName.fax'), key: 'fax' },
              { label: this.translate.instant('FinancialReportResourceName.trxType'), key: 'trX_TYPE' },
              { label: this.translate.instant('FinancialReportResourceName.hdInno'), key: 'hD_INNO' },
              { label: this.translate.instant('FinancialReportResourceName.hdComm'), key: 'hD_COMM' },
              { label: this.translate.instant('FinancialReportResourceName.hdDate'), key: 'hD_DATEstr' },
              { label: this.translate.instant('FinancialReportResourceName.debitAmount'), key: 'debiT_AMOUNTstr' },
              { label: this.translate.instant('FinancialReportResourceName.creditAmount'), key: 'crediT_AMOUNTstr' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['debiT_AMOUNTstr','crediT_AMOUNTstr']
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

    this.financialReportService.getvendorsPayTransRPTData(cleanedFilters).subscribe({
      next: (response: any) => {
        const data = response?.items || response || [];
        const reportConfig: reportPrintConfig = {
          title: this.translate.instant('FinancialReportResourceName.vendorsPayTransRPT_Title'),
          reportTitle: this.translate.instant('FinancialReportResourceName.vendorsPayTransRPT_Title'),
          fileName: `${this.translate.instant('FinancialReportResourceName.vendorsPayTransRPT_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
          fields: [
            { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
            { label: this.translate.instant('FinancialReportResourceName.vendorId'), value: this.searchParams.vendorIdstr },
            { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
            { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
          ],
          columns: [
            { label: '#', key: 'rowNo', title: '#' },
            { label: this.translate.instant('FinancialReportResourceName.vendorNumber'), key: 'vendoR_NUMBER' },
            { label: this.translate.instant('FinancialReportResourceName.vendorName'), key: 'vendoR_NAME' },
            { label: this.translate.instant('FinancialReportResourceName.address'), key: 'address' },
            { label: this.translate.instant('FinancialReportResourceName.workTel'), key: 'worK_TEL' },
            { label: this.translate.instant('FinancialReportResourceName.fax'), key: 'fax' },
            { label: this.translate.instant('FinancialReportResourceName.trxType'), key: 'trX_TYPE' },
            { label: this.translate.instant('FinancialReportResourceName.hdInno'), key: 'hD_INNO' },
            { label: this.translate.instant('FinancialReportResourceName.hdComm'), key: 'hD_COMM' },
            { label: this.translate.instant('FinancialReportResourceName.hdDate'), key: 'hD_DATEstr' },
            { label: this.translate.instant('FinancialReportResourceName.debitAmount'), key: 'debiT_AMOUNTstr' },
            { label: this.translate.instant('FinancialReportResourceName.creditAmount'), key: 'crediT_AMOUNTstr' },
          ],
          data,
          totalLabel: this.translate.instant('Common.Total'),
          totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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

