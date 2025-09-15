import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  Validators,
} from '@angular/forms';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import {
  FndLookUpValuesSelect2RequestDto,
  Pagination,
  Select2RequestDto,
  SelectdropdownResult,
  SelectdropdownResultResults,
  reportPrintConfig,
} from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { InvoiceService } from '../../../../core/services/Financial/Operation/invoice.service';
import {
  InvoiceFilter,
  FilterInvoiceByIdDto,
  Invoice,
  InvoiceHeader,
  InvoiceTransaction,
} from '../../../../core/dtos/FinancialDtos/OperationDtos/invoice.models';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { NumberFormatPipe } from '../../../../core/services/number.pipe.service';

declare var bootstrap: any;

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgSelectComponent,
    GenericDataTableComponent,
    NumberFormatPipe,
  ],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit, OnDestroy {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent)
  genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  paginationtrListData = new Pagination();

  columnDefs: ColDef[] = [];
  columnDefstrListData: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];

  searchParams = new InvoiceFilter();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FilterInvoiceByIdDto();

  loadgridData: Invoice[] = [];
  loadformData: InvoiceHeader = {} as InvoiceHeader;
  loadformTrListData: InvoiceTransaction[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  vendorSelect2: SelectdropdownResultResults[] = [];
  loadingvendors = false;
  vendorsearchParams = new Select2RequestDto();
  selectedvendorSelect2Obj: any = null;
  vendorSearchInput$ = new Subject<string>();

  invoiceTypeSelect2: SelectdropdownResultResults[] = [];
  loadinginvoiceType = false;
  invoiceTypesearchParams = new Select2RequestDto();
  selectedinvoiceTypeSelect2Obj: any = null;
  invoiceTypeSearchInput$ = new Subject<string>();

  constructor(
    private apiService: InvoiceService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  ) {
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      {
        label: this.translate.instant('Common.ViewInfo'),
        icon: 'icon-frame-view',
        action: 'onViewInfo',
      },
    ];
    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.vendorSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchApvendorSelect2());

    this.invoiceTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchinvoiceTypeSelect2());

    this.fetchentitySelect2();
    this.fetchApvendorSelect2();
    this.fetchinvoiceTypeSelect2();
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

  loadMorevendors(): void {
    this.vendorsearchParams.skip++;
    this.fetchApvendorSelect2();
  }

  fetchApvendorSelect2(): void {
    this.loadingvendors = true;
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
          this.loadingvendors = false;
        },
        error: () => (this.loadingvendors = false),
      });
  }

  onvendorSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.vendorName = selectedvendor.id;
      this.searchParams.vendorNamestr = selectedvendor.text;
    } else {
      this.searchParams.vendorName = null;
      this.searchParams.vendorNamestr = null;
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.entitySelect2 = [...this.entitySelect2, ...newItems];
          this.loadingentity = false;
        },
        error: () => (this.loadingentity = false),
      });
  }

  onentitySelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.entityId = selectedvendor.id;
      this.searchParams.entityIdstr = selectedvendor.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }

  oninvoiceTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.invoiceTypesearchParams.skip = 0;
    this.invoiceTypesearchParams.searchValue = search;
    this.invoiceTypeSelect2 = [];
    this.invoiceTypeSearchInput$.next(search);
  }

  loadMoreinvoiceType(): void {
    this.invoiceTypesearchParams.skip++;
    this.fetchinvoiceTypeSelect2();
  }

  fetchinvoiceTypeSelect2(): void {
    this.loadinginvoiceType = true;
    const searchVal = this.invoiceTypesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.invoiceTypesearchParams.skip;
    this.searchSelect2Params.take = this.invoiceTypesearchParams.take;
    this.Select2Service.getInvoiceTypeSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.invoiceTypeSelect2 = [...this.invoiceTypeSelect2, ...newItems];
          this.loadinginvoiceType = false;
        },
        error: () => (this.loadinginvoiceType = false),
      });
  }

  oninvoiceTypeSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.type = selectedvendor.id;
      this.searchParams.typestr = selectedvendor.text;
    } else {
      this.searchParams.type = null;
      this.searchParams.typestr = null;
    }
  }

  onSearch(): void {
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    this.getLoadDataGrid({
      pageNumber: event.pageNumber,
      pageSize: event.pageSize,
    });
  }

  onTableSearch(text: string): void {
    this.searchText = text;
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  tr_Id: string = '';
  entitY_ID: string = '';

  onPageChangetrListData(event: {
    pageNumber: number;
    pageSize: number;
  }): void {
    this.paginationtrListData.currentPage = event.pageNumber;
    this.paginationtrListData.take = event.pageSize;
    this.getFormDatabyId(event, this.tr_Id, this.entitY_ID);
  }

  onTableSearchtrListData(text: string): void {
    this.searchText = text;
    this.getFormDatabyId(
      { pageNumber: 1, pageSize: this.paginationtrListData.take },
      this.tr_Id,
      this.entitY_ID
    );
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
    this.searchParams = new InvoiceFilter();
    this.loadgridData = [];
    if (this.filterForm) this.filterForm.resetForm();
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();

    this.apiService
      .getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loadgridData = response || [];
          this.pagination.totalCount = response[0]?.rowsCount || 0;

          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        },
      });
  }

  getFormDatabyId(
    event: { pageNumber: number; pageSize: number },
    tr_Id: string,
    entitY_ID: string
  ): void {
    const params: FilterInvoiceByIdDto = {
      entityId: entitY_ID,
      tr_Id: tr_Id,
    };
    this.spinnerService.show();
    forkJoin({
      invoiceheaderdata: this.apiService.getDetailById(params) as Observable<
        InvoiceHeader | InvoiceHeader[]
      >,
      invoiceTrdata: this.apiService.getTrDetailById(params) as Observable<
        InvoiceTransaction[]
      >,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.loadformTrListData = result.invoiceTrdata ?? [];
          this.loadformData = Array.isArray(result.invoiceheaderdata)
            ? result.invoiceheaderdata[0] ?? ({} as InvoiceHeader)
            : result.invoiceheaderdata;

          this.paginationtrListData.totalCount =
            result?.invoiceTrdata.length || 0;

          const modalElement = document.getElementById('viewdetails');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
          this.spinnerService.hide();
        },
        error: (err) => {
          this.spinnerService.hide();
        },
      });
  }

  public buildColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: this.translate.instant('InvoiceHdResourceName.hD_INNO'),
        field: 'hD_INNO',
        width: 200,
      },
      {
        headerName: this.translate.instant('InvoiceHdResourceName.hD_DATE'),
        field: 'hD_DATEstr',
        width: 200,
      },
      {
        headerName: this.translate.instant(
          'InvoiceHdResourceName.vendoR_NUMBER'
        ),
        field: 'vendoR_NUMBER',
        width: 200,
      },
      {
        headerName: this.translate.instant('InvoiceHdResourceName.vendoR_NAME'),
        field: 'vendoR_NAME',
        width: 200,
      },
      {
        headerName: this.translate.instant(
          'InvoiceHdResourceName.hD_TYPE_DESC'
        ),
        field: 'hD_TYPE_DESC',
        width: 200,
      },
      {
        headerName: this.translate.instant('InvoiceHdResourceName.totalVal'),
        field: 'totalVal',
        width: 200,
        valueFormatter: (params) => {
          if (params.value == null) return '';
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(params.value);
        },
      },
    ];

    this.columnDefstrListData = [
      {
        headerName: this.translate.instant(
          'InvoiceHdResourceName.accountnumber'
        ),
        field: 'accountnumber',
        width: 200,
      },
      {
        headerName: this.translate.instant(
          'InvoiceHdResourceName.accountNameAr'
        ),
        field: 'accountNameAr',
        width: 200,
      },
      {
        headerName: this.translate.instant('InvoiceHdResourceName.tR_ITEM'),
        field: 'tR_ITEM',
        width: 200,
      },
      {
        headerName: this.translate.instant('InvoiceHdResourceName.tR_TOTL'),
        field: 'tR_TOTL',
        width: 200,
      },
      {
        headerName: this.translate.instant('InvoiceHdResourceName.vaT_AMOUNT'),
        field: 'vaT_AMOUNT',
        width: 200,
      },
      {
        headerName: this.translate.instant('InvoiceHdResourceName.totla'),
        field: 'totla',
        width: 200,
      },
    ];
  }

  onTableAction(event: { action: string; row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId(
        { pageNumber: 1, pageSize: this.paginationtrListData.take },
        event.row.hd_id,
        event.row.entitY_ID
      );
    }
  }

  printExcel(): void {
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.apiService
      .getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount =
            initialResponse[0]?.rowsCount || initialResponse?.data?.length || 0;

          this.apiService
            .getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('InvoiceHdResourceName.Title'),
                  reportTitle: this.translate.instant(
                    'InvoiceHdResourceName.Title'
                  ),
                  fileName: `${this.translate.instant(
                    'InvoiceHdResourceName.Title'
                  )}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.EntityId'
                      ),
                      value: this.searchParams.entityIdstr,
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.invoiceNo'
                      ),
                      value: this.searchParams.invoiceNo,
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.invoiceDate'
                      ),
                      value: this.searchParams.invoiceDate,
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.vendorNo'
                      ),
                      value: this.searchParams.vendorNo,
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.vendorName'
                      ),
                      value: this.searchParams.vendorNamestr,
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.type'
                      ),
                      value: this.searchParams.typestr,
                    },
                  ],

                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.hD_INNO'
                      ),
                      key: 'hD_INNO',
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.hD_DATE'
                      ),
                      key: 'hD_DATEstr',
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.vendoR_NUMBER'
                      ),
                      key: 'vendoR_NUMBER',
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.vendoR_NAME'
                      ),
                      key: 'vendoR_NAME',
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.hD_TYPE_DESC'
                      ),
                      key: 'hD_TYPE_DESC',
                    },
                    {
                      label: this.translate.instant(
                        'InvoiceHdResourceName.totalVal'
                      ),
                      key: 'totalValstr',
                    },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1,
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['totalValstr'],
                };

                this.openStandardReportService.openStandardReportExcel(
                  reportConfig
                );
                this.spinnerService.hide();
              },
              error: () => {
                this.spinnerService.hide();
              },
            });
        },
        error: () => {
          this.spinnerService.hide();
        },
      });
  }
}
