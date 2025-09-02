import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig, Select2RequestDto } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { balanceReviewRptInputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsInput.dto';
import { balanceReviewRptOutputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/Financial/Reports/FinancialReport.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-balanceReviewRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './balanceReviewRpt.component.html',
  styleUrls: ['./balanceReviewRpt.component.scss']
})

export class BalanceReviewRptComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;


  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();

  columnDefs: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];

  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new balanceReviewRptInputDto();
  getAllDataForReports: balanceReviewRptOutputDto[] = [];

  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];

  levelSelect2: any[] = [];
 
  constructor(
    private financialReportService: FinancialReportService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service
  ) {

  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [];

    this.fetchlevelSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchlevelSelect2(): void {
    this.levelSelect2 = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, text: (i + 1).toString() }));
  }
  onlevelSelect2Change(selectedentity: any): void {
    if (selectedentity) {
      this.searchParams.level = selectedentity.id;
    } else {
      this.searchParams.level = null;
    }
  }
  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    const params = new balanceReviewRptInputDto
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.financialReportService.getupdateGlAccountSelection(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response?.data || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: (error) => {
          this.spinnerService.hide();
        }
      });
  }


  getgltrialbalancesRPTData(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    const params = new balanceReviewRptInputDto
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.financialReportService.getgetgltrialbalancesRPTData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response?.data || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: (error) => {
          this.spinnerService.hide();
        }
      });
  }


  getGeneralBalanceSheetRptData(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    const params = new balanceReviewRptInputDto
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.financialReportService.getgetGeneralBalanceSheetRptData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response?.data || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: (error) => {
          this.spinnerService.hide();
        }
      });
  }


  getGeneralProLosRPTData(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    const params = new balanceReviewRptInputDto
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.financialReportService.getgetGeneralProLosRPTData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response?.data || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: (error) => {
          this.spinnerService.hide();
        }
      });
  }



  onSearch(): void {
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    this.getLoadDataGrid({ pageNumber: event.pageNumber, pageSize: event.pageSize });
  }

  onTableSearch(text: string): void {
    this.searchText = text;
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
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
    this.searchParams = new balanceReviewRptInputDto();
    this.getAllDataForReports = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
    this.levelSelect2 = [...this.levelSelect2]; 
    this.searchParams.level = null; 
  }

  public buildColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('FinancialReportResourceName.accountT_CODE'), field: 'accountT_CODE', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.accounT_NAME'), field: 'accounT_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_NAME'), field: 'jE_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_DATE'), field: 'jE_DATEstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), field: 'jE_SOURCE_DESC', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.notes'), field: 'notes', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), field: 'debiT_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), field: 'crediT_AMOUNTstr', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) { }

  printExcel(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.level']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accountT_CODE'), key: 'accountT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
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
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }

  printPDF(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelv']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accountT_CODE'), key: 'accountT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
                };

                this.openStandardReportService.openStandardReportPDF(reportConfig);
                this.spinnerService.hide();
              },
              error: () => {
                this.spinnerService.hide();
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }


  getGeneralBalanceSheetRptDataprintExcel(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.level']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
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
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }

  getGeneralBalanceSheetRptDataprintPDF(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.level']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
                };

                this.openStandardReportService.openStandardReportPDF(reportConfig);
                this.spinnerService.hide();
              },
              error: () => {
                this.spinnerService.hide();
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }


  getGeneralProLosRPTDataprintExcel(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.level']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
                    { label: this.translate.instant('FinancialReportResourceName.oB_Amount'), key: 'oB_Amount' },
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
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }

  getGeneralProLosRPTDataprintPDF(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.level']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
                    { label: this.translate.instant('FinancialReportResourceName.oB_Amount'), key: 'oB_Amount' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
                };

                this.openStandardReportService.openStandardReportPDF(reportConfig);
                this.spinnerService.hide();
              },
              error: () => {
                this.spinnerService.hide();
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }


  getgltrialbalancesRPTDataprintExcel(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.level']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.balance'), key: 'balance' },
                    { label: this.translate.instant('FinancialReportResourceName.debit'), key: 'debit' },
                    { label: this.translate.instant('FinancialReportResourceName.credit'), key: 'credit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_debit'), key: 'ob_debit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_credit'), key: 'ob_credit' },
                    { label: this.translate.instant('FinancialReportResourceName.entity_id'), key: 'entity_id' },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), key: 'user_id' },
                    { label: this.translate.instant('FinancialReportResourceName.rn'), key: 'rn' },
                    { label: this.translate.instant('FinancialReportResourceName.deptOBCalc'), key: 'deptOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.creditOBCalc'), key: 'creditOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.endDept'), key: 'endDept' },
                    { label: this.translate.instant('FinancialReportResourceName.endCredit'), key: 'endCredit' },
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
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }

  getgltrialbalancesRPTDataprintPDF(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.level', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.level']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.level'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_ID'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.balance'), key: 'balance' },
                    { label: this.translate.instant('FinancialReportResourceName.debit'), key: 'debit' },
                    { label: this.translate.instant('FinancialReportResourceName.credit'), key: 'credit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_debit'), key: 'ob_debit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_credit'), key: 'ob_credit' },
                    { label: this.translate.instant('FinancialReportResourceName.entity_id'), key: 'entity_id' },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), key: 'user_id' },
                    { label: this.translate.instant('FinancialReportResourceName.rn'), key: 'rn' },
                    { label: this.translate.instant('FinancialReportResourceName.deptOBCalc'), key: 'deptOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.creditOBCalc'), key: 'creditOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.endDept'), key: 'endDept' },
                    { label: this.translate.instant('FinancialReportResourceName.endCredit'), key: 'endCredit' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
                };

                this.openStandardReportService.openStandardReportPDF(reportConfig);
                this.spinnerService.hide();
              },
              error: () => {
                this.spinnerService.hide();
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }
}
