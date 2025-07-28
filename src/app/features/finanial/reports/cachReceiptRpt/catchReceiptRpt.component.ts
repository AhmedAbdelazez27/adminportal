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
import { catchReceiptRptInputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsInput.dto';
import { catchReceiptRptOutputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/Financial/Reports/FinancialReport.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-catchReceiptRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './catchReceiptRpt.component.html',
  styleUrls: ['./catchReceiptRpt.component.scss']
})

export class catchReceiptRptComponent {
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
  searchParams = new catchReceiptRptInputDto();
  getAllDataForReports: catchReceiptRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  categorySelect2: SelectdropdownResultResults[] = [];
  loadingcategory = false;
  categorysearchParams = new Select2RequestDto();
  selectedcategorySelect2Obj: any = null;
  categorySearchInput$ = new Subject<string>();

  collectorSelect2: SelectdropdownResultResults[] = [];
  loadingcollector = false;
  collectorsearchParams = new Select2RequestDto();
  selectedcollectorSelect2Obj: any = null;
  collectorSearchInput$ = new Subject<string>();
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
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'fas fa-eye', action: 'onViewInfo' },
      { label: this.translate.instant('Common.Action'), icon: 'fas fa-edit', action: 'edit' },
    ];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.categorySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcategorySelect2());

    this.collectorSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcollectorSelect2());

    this.fetchentitySelect2();
    this.fetchcollectorSelect2();
    this.fetchcategorySelect2();
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


  oncategorySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.categorysearchParams.skip = 0;
    this.categorysearchParams.searchValue = search;
    this.categorySelect2 = [];
    this.categorySearchInput$.next(search);
  }

  loadMorecategory(): void {
    this.categorysearchParams.skip++;
    this.fetchcategorySelect2();
  }

  fetchcategorySelect2(): void {
    this.loadingcategory = true;
    const searchVal = this.categorysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.categorysearchParams.skip;
    this.searchSelect2Params.take = this.categorysearchParams.take;

    this.Select2Service.getCategorySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.categorySelect2 = [...this.categorySelect2, ...newItems];
          this.loadingcategory = false;
        },
        error: () => this.loadingcategory = false
      });
  }

  oncategorySelect2Change(selectedcategory: any): void {
    if (selectedcategory) {
      this.searchParams.type = selectedcategory.id;
      this.searchParams.typestr = selectedcategory.text;
    } else {
      this.searchParams.type = null;
      this.searchParams.typestr = null;
    }
  }


  oncollectorSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.collectorsearchParams.skip = 0;
    this.collectorsearchParams.searchValue = search;
    this.collectorSelect2 = [];
    this.collectorSearchInput$.next(search);
  }

  loadMorecollector(): void {
    this.collectorsearchParams.skip++;
    this.fetchcollectorSelect2();
  }

  fetchcollectorSelect2(): void {
    this.loadingcollector = true;
    const searchVal = this.collectorsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.collectorsearchParams.skip;
    this.searchSelect2Params.take = this.collectorsearchParams.take;

    this.Select2Service.getCollectorSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.collectorSelect2 = [...this.collectorSelect2, ...newItems];
          this.loadingcollector = false;
        },
        error: () => this.loadingcollector = false
      });
  }

  oncollectorSelect2Change(selectedcollector: any): void {
    if (selectedcollector) {
      this.searchParams.collectorName = selectedcollector.id;
      this.searchParams.collectorNamestr = selectedcollector.text;
    } else {
      this.searchParams.collectorName = null;
      this.searchParams.collectorNamestr = null;
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

    this.financialReportService.getcatchReceiptRptData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response || [];
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
    this.searchParams = new catchReceiptRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  private buildColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('FinancialReportResourceName.bankAccountName'), field: 'banK_ACCOUNT_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.beneficiaryName'), field: 'beneficiarY_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.notes'), field: 'notes', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.transactionTypeDesc'), field: 'transactioN_TYPE_DESC', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.receiptNumber'), field: 'receipT_NUMBER', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.miscReceiptDate'), field: 'misC_RECEIPT_DATEstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.receiptAmount'), field: 'receipT_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.chequeAmount'), field: 'chequE_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.cashAmount'), field: 'casH_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.administrativeAmount'), field: 'administrativE_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.collectorName'), field: 'collectoR_NAME', width: 200 },
    ];
  }
  
  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      if (this.genericTable && this.genericTable.onViewInfo) {
        this.genericTable.onViewInfo(event.row);
      }
    }
    if (event.action === 'edit') {
    }
  }


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
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
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

