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
import { getTotlaBenDonationsRPTInputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsInput.dto';
import { getTotlaBenDonationsRPTOutputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/Financial/Reports/FinancialReport.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
@Component({
  selector: 'app-getTotlaBenDonationsRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './getTotlaBenDonationsRPT.component.html',
  styleUrls: ['./getTotlaBenDonationsRPT.component.scss']
})

export class getTotlaBenDonationsRPTComponent {
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
  searchParams = new getTotlaBenDonationsRPTInputDto();
  getAllDataForReports: getTotlaBenDonationsRPTOutputDto[] = [];

  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  beneficentIdSelect2: SelectdropdownResultResults[] = [];
  loadingbeneficentId = false;
  beneficentIdsearchParams = new Select2RequestDto();
  selectedbeneficentIdSelect2Obj: any = null;
  beneficentIdSearchInput$ = new Subject<string>();
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

    this.beneficentIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbeneficentIdSelect2());

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.fetchentitySelect2();
    this.fetchbeneficentIdSelect2();
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


  onbeneficentIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.beneficentIdsearchParams.skip = 0;
    this.beneficentIdsearchParams.searchValue = search;
    this.beneficentIdSelect2 = [];
    this.beneficentIdSearchInput$.next(search);
  }

  loadMorebeneficentId(): void {
    this.beneficentIdsearchParams.skip++;
    this.fetchbeneficentIdSelect2();
  }

  fetchbeneficentIdSelect2(): void {
    this.loadingbeneficentId = true;
    const searchVal = this.beneficentIdsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.beneficentIdsearchParams.skip;
    this.searchSelect2Params.take = this.beneficentIdsearchParams.take;

    this.Select2Service.getBeneficentIdSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.beneficentIdSelect2 = [...this.beneficentIdSelect2, ...newItems];
          this.loadingbeneficentId = false;
        },
        error: () => this.loadingbeneficentId = false
      });
  }

  onbeneficentIdSelect2Change(selectedbeneficentId: any): void {
    if (selectedbeneficentId) {
      this.searchParams.beneficenT_ID = selectedbeneficentId.id;
      this.searchParams.beneficentIdstr = selectedbeneficentId.text;
    } else {
      this.searchParams.beneficenT_ID = null;
      this.searchParams.beneficentIdstr = null;
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

    this.financialReportService.getgetTotlaBenDonationsRPTData(this.searchParams)
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
    this.searchParams = new getTotlaBenDonationsRPTInputDto();
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
      { headerName: this.translate.instant('FinancialReportResourceName.beneficentName'), field: 'beneficentName', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.beneficentNo'), field: 'beneficenT_NO', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.receiptNumber'), field: 'receipT_NUMBER', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.miscReceiptDate'), field: 'misC_RECEIPT_DATEstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.receiptTypeDesc'), field: 'receipT_TYPE_DESC', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.notes'), field: 'notes', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.miscReceiptAmount'), field: 'misC_RECEIPT_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.administrative'), field: 'administrativEstr', width: 200 },
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
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        },

      });
  }
}

