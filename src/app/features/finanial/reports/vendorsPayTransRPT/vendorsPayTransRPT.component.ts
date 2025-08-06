import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig, Select2RequestDto } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { vendorsPayTransRPTInputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsInput.dto';
import { vendorsPayTransRPTOutputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/Financial/Reports/FinancialReport.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-vendorsPayTransRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './vendorsPayTransRPT.component.html',
  styleUrls: ['./vendorsPayTransRPT.component.scss']
})

export class vendorsPayTransRPTComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;
  private destroy$ = new Subject<void>();
  searchInput$ = new Subject<string>();

  pagination = new Pagination();


  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new vendorsPayTransRPTInputDto();
  getAllDataForReports: vendorsPayTransRPTOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  vendorSelect2: SelectdropdownResultResults[] = [];
  loadingvendor = false;
  vendorsearchParams = new Select2RequestDto();
  selectedvendorSelect2Obj: any = null;
  vendorSearchInput$ = new Subject<string>();
   
  columnDefs: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];

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
    this.buildColumnDefs();
    this.fetchentitySelect2();
    this.fetchApvendorSelect2();
    this.rowActions = [];

    this.vendorSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchApvendorSelect2());

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.fetchentitySelect2();
    this.fetchApvendorSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onvendorSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.vendorsearchParams.skip = 0;
    this.vendorsearchParams.searchValue = search;
    this.vendorSelect2 = [];
    this.vendorSearchInput$.next(search);
  }

  loadMorevendor(): void {
    this.vendorsearchParams.skip++;
    this.fetchApvendorSelect2();
  }

  fetchApvendorSelect2(): void {
    this.loadingvendor = true;
    const searchVal = this.vendorsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.vendorsearchParams.skip;
    this.searchSelect2Params.take = this.vendorsearchParams.take;

    this.Select2Service.getApVendorSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.vendorSelect2 = [...this.vendorSelect2, ...newItems];
          this.loadingvendor = false;
        },
        error: () => this.loadingvendor = false
      });
  }

  onvendorSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.vendorId = selectedvendor.id;
      this.searchParams.vendorIdstr = selectedvendor.text;
    } else {
      this.searchParams.vendorId = null;
      this.searchParams.vendorIdstr = null;
    }
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

  onvendorIdSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.vendorId = selectedVendor.id;
      this.searchParams.vendorIdstr = selectedVendor.text;
    } else {
      this.searchParams.vendorId = null;
      this.searchParams.vendorIdstr = null;
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
    this.searchParams.fromDatestr = this.financialReportService.formatToYYYYMMDD(this.searchParams.fromDatestr || '');
    this.spinnerService.show();

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
    this.searchParams = new vendorsPayTransRPTInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
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
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
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

  private buildColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('FinancialReportResourceName.vendorNumber'), field: 'vendoR_NUMBER', width: 150 },
      { headerName: this.translate.instant('FinancialReportResourceName.vendorName'), field: 'vendoR_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.workTel'), field: 'worK_TEL', width: 100 },
      { headerName: this.translate.instant('FinancialReportResourceName.trxType'), field: 'trX_TYPE', width: 100 },
      { headerName: this.translate.instant('FinancialReportResourceName.DebitAmount'), field: 'debiT_AMOUNT' },
      { headerName: this.translate.instant('FinancialReportResourceName.creditAmount'), field: 'crediT_AMOUNT' },
      { headerName: this.translate.instant('FinancialReportResourceName.DebitAmount'), field: 'debiT_AMOUNTstr' },
      { headerName: this.translate.instant('FinancialReportResourceName.creditAmount'), field: 'crediT_AMOUNTstr' },
    ];
    this.columnHeaderMap = {
      'vendoR_NUMBER': this.translate.instant('FinancialReportResourceName.vendorNumber'),
      'vendoR_NAME': this.translate.instant('FinancialReportResourceName.vendorName'),
      'address': this.translate.instant('FinancialReportResourceName.address'),
      'worK_TEL': this.translate.instant('FinancialReportResourceName.workTel'),
      'fax': this.translate.instant('FinancialReportResourceName.fax'),
      'trX_TYPE': this.translate.instant('FinancialReportResourceName.trxType'),
      'hD_INNO': this.translate.instant('FinancialReportResourceName.hdInno'),
      'hD_COMM': this.translate.instant('FinancialReportResourceName.hdComm'),
      'hD_DATE': this.translate.instant('FinancialReportResourceName.hdDate'),
      'debiT_AMOUNT': this.translate.instant('FinancialReportResourceName.DebitAmount'),
      'crediT_AMOUNT': this.translate.instant('FinancialReportResourceName.creditAmount'),
      'hD_DATEstr': this.translate.instant('FinancialReportResourceName.hdDate'),
      'debiT_AMOUNTstr': this.translate.instant('FinancialReportResourceName.DebitAmount'),
      'crediT_AMOUNTstr': this.translate.instant('FinancialReportResourceName.creditAmount'),
    };
  }

  onTableAction(event: { action: string, row: any }) {}
}

