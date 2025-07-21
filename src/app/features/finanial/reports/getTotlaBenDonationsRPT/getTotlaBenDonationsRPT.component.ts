import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import * as XLSX from 'xlsx';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { getTotlaBenDonationsRPTInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { getTotlaBenDonationsRPTOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { CustomTableComponent } from '../../../../../shared/custom-table/custom-table.component';

@Component({
  selector: 'app-getTotlaBenDonationsRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CustomTableComponent],
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
    this.fetchbeneficentIdSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.translatedHeaders$ = combineLatest([
      this.translate.get('FinancialReportResourceName.beneficentName'),
      this.translate.get('FinancialReportResourceName.beneficentNo'),
      this.translate.get('FinancialReportResourceName.receiptNumber'),
      this.translate.get('FinancialReportResourceName.miscReceiptDate'),
      this.translate.get('FinancialReportResourceName.receiptTypeDesc'),
      this.translate.get('FinancialReportResourceName.notes'),
      this.translate.get('FinancialReportResourceName.administrative'),
    ]).pipe(
      map(translations => translations)
    );

    this.headerKeys = [
      'beneficentName',
      'beneficenT_NO',
      'receipT_NUMBER',
      'misC_RECEIPT_DATEstr',
      'receipT_TYPE_DESC',
      'notes',
      'misC_RECEIPT_AMOUNTstr',
      'administrativEstr'
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

  fetchbeneficentIdSelect2(): void {
    this.Select2Service.getBeneficentIdSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.beneficentIdSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Beneficent.', 'Error');
        }
      });
  }


  getLoadDataGrid(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.searchParams.entityId) return;
    this.spinnerService.show();

    this.financialReportService.getgetTotlaBenDonationsRPTData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response || [];
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
    this.searchParams = new getTotlaBenDonationsRPTInputDto();
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
    this.financialReportService.getgetTotlaBenDonationsRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetTotlaBenDonationsRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];


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
    this.financialReportService.getgetTotlaBenDonationsRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetTotlaBenDonationsRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

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

