import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig, Select2RequestDto } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { receiptRPTInputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsInput.dto';
import { receiptRPTOutputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/Financial/Reports/FinancialReport.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { formatNumericCell } from '../../../../shared/utils/value-formatters';
@Component({
  selector: 'app-receiptRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './receiptRPT.component.html',
  styleUrls: ['./receiptRPT.component.scss']
})

export class receiptRPTComponent {
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
  searchParams = new receiptRPTInputDto();
  getAllDataForReports: receiptRPTOutputDto[] = [];

  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();
  constructor(
    private financialReportService: FinancialReportService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service
  )
  {

  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [];
    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2())

    this.fetchentitySelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

  }

  onentitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.entitysearchParams.skip = 0;
    this.entitysearchParams.searchValue = search;
    this.entitySelect2 = [];
    this.entitySearchInput$.next(search);
  }

  loadMoreentity(): void {
    this.entitysearchParams.skip++;
    this.fetchentitySelect2();
  }

  fetchentitySelect2(): void {
    this.loadingentity = true;
    const searchVal = this.entitysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.entitysearchParams.skip;
    this.searchSelect2Params.take = this.entitysearchParams.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.entitySelect2 = [...this.entitySelect2, ...newItems];
          this.loadingentity = false;
        },
        error: () => this.loadingentity = false
      });
  }

  onentitySelect2Change(selectedentity: any): void {
    if (selectedentity) {
      this.searchParams.entityId = selectedentity.id;
      this.searchParams.entityIdstr = selectedentity.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }


  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.entityId) {
      this.translate
        .get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
   
    this.spinnerService.show();
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
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
    this.searchParams = new receiptRPTInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  public buildColumnDefs(): void {
    this.columnDefs = [

      { headerName: this.translate.instant('FinancialReportResourceName.paymentCategory'), field: 'paymenT_CATEGORY', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.paymentNumber'), field: 'paymenT_NUMBER', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.beneficiaryName'), field: 'beneficiarY_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.paymentDate'), field: 'paymenT_DATEstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.paymentType'), field: 'paymenT_TYPE', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.amount'), field: 'amounTstr', width: 200,   
    valueFormatter: (params) => formatNumericCell(params.value, 2, 'en-US') },
      { headerName: this.translate.instant('FinancialReportResourceName.notes'), field: 'notes', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.bankAccount'), field: 'banK_ACCOUNT', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {}

  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate
        .get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.financialReportService.getreceiptRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getreceiptRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.receiptRpt_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.receiptRpt_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.receiptRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
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
                  totalKeys: ['amounTstr']
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
    if (!this.searchParams.entityId) {
      this.translate
        .get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
  
    this.financialReportService.getreceiptRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getreceiptRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];
                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.receiptRpt_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.receiptRpt_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.receiptRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
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
                  totalKeys: ['amounTstr']
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

