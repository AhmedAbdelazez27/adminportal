import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { receiptRPTInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { receiptRPTOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { CustomTableComponent } from '../../../../../shared/custom-table/custom-table.component';

@Component({
  selector: 'app-receiptRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CustomTableComponent],
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

  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];
  constructor(
    private financialReportService: FinancialReportService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.fetchentitySelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.translatedHeaders$ = combineLatest([
      this.translate.get('FinancialReportResourceName.paymentCategory'),
      this.translate.get('FinancialReportResourceName.paymentNumber'),
      this.translate.get('FinancialReportResourceName.beneficiaryName'),
      this.translate.get('FinancialReportResourceName.paymentDate'),
      this.translate.get('FinancialReportResourceName.paymentType'),
      this.translate.get('FinancialReportResourceName.amount'),
      this.translate.get('FinancialReportResourceName.notes'),
      this.translate.get('FinancialReportResourceName.bankAccount')
    ]).pipe(
      map(translations => translations)
    );

    this.headerKeys = [
      'paymenT_CATEGORY',
      'paymenT_NUMBER',
      'beneficiarY_NAME',
      'paymenT_DATEstr',
      'paymenT_TYPE',
      'trX_TYPE',
      'amounTstr',
      'notes',
      'banK_ACCOUNT'
    ];
  }

  fetchentitySelect2(): void {
    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.entitySelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Entity.', 'Error');
        }
      });
  }

  getLoadDataGrid(page: number, searchValue: string = ''): void {
    this.pagination.currentPage = page;
    const skip = (page - 1) * this.pagination.take;
    this.searchParams.skip = skip;
    this.searchParams.take = this.pagination.take;
    if (!this.searchParams.entityId) return;
    this.spinnerService.show();
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.financialReportService.getreceiptRPTData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response?.data || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: (error) => {
          this.spinnerService.hide();
          this.toastr.error('Error fetching Data.', 'Error');
        }
      });
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
    this.getLoadDataGrid(1);
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
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.financialReportService.getcatchReceiptRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getcatchReceiptRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

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
                    { label: this.translate.instant('FinancialReportResourceName.paymentCategory'), key: 'paymenT_CATEGORY' },
                    { label: this.translate.instant('FinancialReportResourceName.paymentNumber'), key: 'paymenT_NUMBER' },
                    { label: this.translate.instant('FinancialReportResourceName.beneficiaryName'), key: 'beneficiarY_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.paymentDate'), key: 'paymenT_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.paymentType'), key: 'paymenT_TYPE' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amounTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.bankAccount'), key: 'banK_ACCOUNT' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
                };

                this.openStandardReportService.openStandardReportExcel(reportConfig);
                this.spinnerService.hide();
              },
              error: () => {
                this.spinnerService.hide();
                this.toastr.error('Failed to export Excel');
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error('Failed to retrieve data count');
        },

      });
  }

  printPDF(): void {
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.financialReportService.getvendorsPayTransRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getcatchReceiptRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];
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
                    { label: this.translate.instant('FinancialReportResourceName.paymentCategory'), key: 'paymenT_CATEGORY' },
                    { label: this.translate.instant('FinancialReportResourceName.paymentNumber'), key: 'paymenT_NUMBER' },
                    { label: this.translate.instant('FinancialReportResourceName.beneficiaryName'), key: 'beneficiarY_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.paymentDate'), key: 'paymenT_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.paymentType'), key: 'paymenT_TYPE' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amounTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.bankAccount'), key: 'banK_ACCOUNT' },
                  ],
                  data,
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
                };

                this.openStandardReportService.openStandardReportPDF(reportConfig);
              },
              error: () => {
                this.spinnerService.hide();
                this.toastr.error('Failed to export Excel');
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error('Failed to retrieve data count');
        },

      });
  }
}

