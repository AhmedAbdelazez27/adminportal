import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { vendorsPayTransRPTInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { vendorsPayTransRPTOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { CustomTableComponent } from '../../../../../shared/custom-table/custom-table.component';

@Component({
  selector: 'app-vendorsPayTransRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CustomTableComponent],
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
  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];

  constructor(
    private financialReportService: FinancialReportService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service)
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }


  ngOnInit(): void {
    this.fetchentitySelect2();
    this.fetchvendorIdSelect2();

    this.translatedHeaders$ = combineLatest([
      this.translate.get('FinancialReportResourceName.vendorNumber'),
      this.translate.get('FinancialReportResourceName.vendorName'),
      this.translate.get('FinancialReportResourceName.address'),
      this.translate.get('FinancialReportResourceName.workTel'),
      this.translate.get('FinancialReportResourceName.fax'),
      this.translate.get('FinancialReportResourceName.trxType'),
      this.translate.get('FinancialReportResourceName.hdInno'),
      this.translate.get('FinancialReportResourceName.hdComm'),
      this.translate.get('FinancialReportResourceName.hdDate'),
      this.translate.get('FinancialReportResourceName.debitAmount'),
      this.translate.get('FinancialReportResourceName.creditAmount'),
    ]).pipe(
      map(translations => translations)
    );

    this.headerKeys = [
      'vendoR_NAME',
      'vendoR_NUMBER',
      'address',
      'worK_TEL',
      'fax',
      'trX_TYPE',
      'hD_INNO',
      'hD_COMM',
      'hD_DATEstr',
      'debiT_AMOUNTstr',
      'crediT_AMOUNTstr',
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  fetchvendorIdSelect2(): void {
    this.Select2Service.getVendorSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.vendorIdSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Vendor.', 'Error');
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
    this.financialReportService.getvendorsPayTransRPTData(this.searchParams)
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
    this.searchParams = new vendorsPayTransRPTInputDto();
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
    this.financialReportService.getvendorsPayTransRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getvendorsPayTransRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

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

          this.financialReportService.getvendorsPayTransRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];
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

