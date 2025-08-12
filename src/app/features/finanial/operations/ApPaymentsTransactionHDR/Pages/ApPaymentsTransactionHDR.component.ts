import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../../shared/generic-data-table/generic-data-table.component';
import { SpinnerService } from '../../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../../core/services/openStandardReportService.service';
import { FndLookUpValuesSelect2RequestDto, Pagination, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults, reportPrintConfig } from '../../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { Select2Service } from '../../../../../core/services/Select2.service';
import { FilterApPaymentsTransactionHDRDto, FilterApPaymentsTransactionHDRByIdDto, ApPaymentsTransactionHDRDto } from '../../../../../core/dtos/FinancialDtos/OperationDtos/ApPaymentsTransactionHDR.dto';
import { ApPaymentsTransactionHDRService } from '../../../../../core/services/Financial/Operation/ApPaymentsTransactionHDR.service';

declare var bootstrap: any;


@Component({
  selector: 'app-ApPaymentsTransactionHDR',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './ApPaymentsTransactionHDR.component.html',
  styleUrls: ['./ApPaymentsTransactionHDR.component.scss']
})

export class ApPaymentsTransactionHDRComponent {
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


  searchParams = new FilterApPaymentsTransactionHDRDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FilterApPaymentsTransactionHDRByIdDto();

  loadgridData: ApPaymentsTransactionHDRDto[] = [];
  loadformData: ApPaymentsTransactionHDRDto = {} as ApPaymentsTransactionHDRDto;

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

  paymentTypeSelect2: SelectdropdownResultResults[] = [];
  loadingpaymentType = false;
  paymentTypesearchParams = new Select2RequestDto();
  selectpaymentTypeSelect2Obj: any = null;
  paymentTypeSearchInput$ = new Subject<string>();

  constructor(
    private apPaymentsTransactionHDRService: ApPaymentsTransactionHDRService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
    ];

    this.vendorSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchApvendorSelect2());

    this.paymentTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchpaymentTypeSelect2());

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.fetchentitySelect2();
    this.fetchApvendorSelect2();
    this.fetchpaymentTypeSelect2();
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
        error: () => this.loadingvendors = false
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
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.entitySelect2 = [...this.entitySelect2, ...newItems];
          this.loadingentity = false;
        },
        error: () => this.loadingentity = false
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


  onpaymentTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.paymentTypesearchParams.skip = 0;
    this.paymentTypesearchParams.searchValue = search;
    this.paymentTypeSelect2 = [];
    this.paymentTypeSearchInput$.next(search);
  }

  loadMorepaymentType(): void {
    this.paymentTypesearchParams.skip++;
    this.fetchpaymentTypeSelect2();
  }

  fetchpaymentTypeSelect2(): void {
    this.loadingpaymentType = true;
    const searchVal = this.paymentTypesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.paymentTypesearchParams.skip;
    this.searchSelect2Params.take = this.paymentTypesearchParams.take;
    this.Select2Service.getPaymentTypeSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.paymentTypeSelect2 = [...this.paymentTypeSelect2, ...newItems];
          this.loadingpaymentType = false;
        },
        error: () => this.loadingpaymentType = false
      });
  }

  onpaymentTypeSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.paymentTypeDesc = selectedvendor.id;
      this.searchParams.paymentTypeDescstr = selectedvendor.text;
    } else {
      this.searchParams.paymentTypeDesc = null;
      this.searchParams.paymentTypeDescstr = null;
    }
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
    this.searchParams = new FilterApPaymentsTransactionHDRDto();
    this.loadgridData = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
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
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();
    this.apPaymentsTransactionHDRService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response || [];
          this.pagination.totalCount = response[0]?.rowsCount || 0;
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }

  getFormDatabyId(tr_Id: string, entitY_ID: string): void {
    const params: FilterApPaymentsTransactionHDRByIdDto = {
      entityId: entitY_ID,
      paymentId: tr_Id
    };
    this.spinnerService.show();
    forkJoin({
      mischeaderdata: this.apPaymentsTransactionHDRService.getDetailById(params) as Observable<
        ApPaymentsTransactionHDRDto | ApPaymentsTransactionHDRDto[]>,
    })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          this.loadformData = Array.isArray(result.mischeaderdata)
            ? result.mischeaderdata[0] ?? ({} as ApPaymentsTransactionHDRDto)
            : result.mischeaderdata;
          const modalElement = document.getElementById('viewdetails');;
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          };

          this.spinnerService.hide();
        },
        error: (err) => {
          this.spinnerService.hide();
        }
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
      { headerName: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'), field: 'paymenT_NUMBER', width: 200 },
      { headerName: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'), field: 'paymenT_DATEstr', width: 200 },
      { headerName: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'), field: 'paymenT_TYPE_DESC', width: 200 },
      { headerName: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'), field: 'vendoR_NUMBER', width: 200 },
      { headerName: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'), field: 'vendoR_NAME', width: 200 },
      { headerName: this.translate.instant('ApPaymentsTransactionHDRResourceName.Amount'), field: 'paymenT_AMOUNTstr', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId(event.row.paymenT_ID, event.row.entitY_ID);
    }
    if (event.action === 'edit') {
    }
  }


  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.apPaymentsTransactionHDRService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || initialResponse?.data?.length || 0;

          this.apPaymentsTransactionHDRService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ApPaymentsTransactionHDRResourceName.Title'),
                  reportTitle: this.translate.instant('ApPaymentsTransactionHDRResourceName.Title'),
                  fileName: `${this.translate.instant('ApPaymentsTransactionHDRResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.EntityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'), value: this.searchParams.paymentNumber },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'), value: this.searchParams.paymentDate },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'), value: this.searchParams.vendorNumber },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'), value: this.searchParams.vendorNamestr },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'), value: this.searchParams.paymentTypeDescstr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'), key: 'paymenT_NUMBER' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'), key: 'paymenT_DATEstr' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'), key: 'paymenT_TYPE_DESC' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'), key: 'vendoR_NUMBER' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'), key: 'vendoR_NAME' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.Amount'), key: 'paymenT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['paymenT_AMOUNTstr']
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
        }
      });
  }
}

