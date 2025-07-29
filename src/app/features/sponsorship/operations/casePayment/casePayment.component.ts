
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { casePaymentService } from '../../../../core/services/sponsorship/operations/casePayment.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { FndLookUpValuesSelect2RequestDto, Pagination, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { casePaymentDto, casePaymentHdrDto, filtercasePaymentByIdDto, filtercasePaymentDto } from '../../../../core/dtos/sponsorship/operations/casePayment.models';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { NgSelectComponent } from '@ng-select/ng-select';
declare var bootstrap: any;

@Component({
  selector: 'app-casePayment',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './casePayment.component.html',
  styleUrls: ['./casePayment.component.scss']
})
export class casePaymentComponent implements OnInit, OnDestroy {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  paginationPaymentHdr = new Pagination();

  columnDefs: ColDef[] = [];
  columnDefsPaymentHdr: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];
  rowActionsPaymentHdr: Array<{ label: string, icon?: string, action: string }> = [];


  searchParams = new filtercasePaymentDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new filtercasePaymentByIdDto();

  loadgridData: casePaymentDto[] = [];
  loadformData: casePaymentDto = {} as casePaymentDto;
  loadHdrformData: casePaymentHdrDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  spOfficesSelect2: SelectdropdownResultResults[] = [];
  loadingspOffices = false;
  spOfficessearchParams = new Select2RequestDto();
  selectedspOfficesSelect2Obj: any = null;
  spOfficesSearchInput$ = new Subject<string>();

  spCasesPaymentSelect2: SelectdropdownResultResults[] = [];
  loadingspCasesPayment = false;
  spCasesPaymentsearchParams = new Select2RequestDto();
  selectedspCasesPaymentSelect2Obj: any = null;
  spCasesPaymentSearchInput$ = new Subject<string>();


  paymentStatusSelect2: SelectdropdownResultResults[] = [];
  loadingpaymentStatus = false;
  paymentStatussearchParams = new Select2RequestDto();
  selectedpaymentStatusSelect2Obj: any = null;
  paymentStatusSearchInput$ = new Subject<string>();

  constructor(
    private readonly casePaymentService: casePaymentService,
    private readonly toastr: ToastrService,
    private readonly Select2Service: Select2Service,
    private translate: TranslateService,
    private spinnerService: SpinnerService,
    private openStandardReportService: openStandardReportService,
    private fb: FormBuilder
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'fas fa-eye', action: 'onViewInfo' },
    ];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.spOfficesSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchspOfficesSelect2());

    this.paymentStatusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchpaymentStatusSelect2());

    this.spCasesPaymentSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.fetchentitySelect2();
    this.fetchspOfficesSelect2();
    this.fetchspCasesPaymentSelect2();
    this.fetchpaymentStatusSelect2();
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

  onentitySelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.entityId = selectedvendor.id;
      this.searchParams.entityIdstr = selectedvendor.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }

  onspOfficesSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.spOfficessearchParams.skip = 0;
    this.spOfficessearchParams.searchValue = search;
    this.spOfficesSelect2 = [];
    this.spOfficesSearchInput$.next(search);
  }

  loadMorespOffices(): void {
    this.spOfficessearchParams.skip++;
    this.fetchspOfficesSelect2();
  }

  fetchspOfficesSelect2(): void {
    this.loadingspOffices = true;
    const searchVal = this.spOfficessearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.spOfficessearchParams.skip;
    this.searchSelect2Params.take = this.spOfficessearchParams.take;
    this.Select2Service.getSpOfficesSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.spOfficesSelect2 = [...this.spOfficesSelect2, ...newItems];
          this.loadingspOffices = false;
        },
        error: () => this.loadingspOffices = false
      });
  }

  onspOfficesSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.officeid = selectedvendor.id;
      this.searchParams.officeidstr = selectedvendor.text;
    } else {
      this.searchParams.officeidstr = null;
      this.searchParams.officeidstr = null;
    }
  }




  onspCasesPaymentSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.spCasesPaymentsearchParams.skip = 0;
    this.spCasesPaymentsearchParams.searchValue = search;
    this.spCasesPaymentSelect2 = [];
    this.spCasesPaymentSearchInput$.next(search);
  }

  loadMorespCasesPayment(): void {
    this.spCasesPaymentsearchParams.skip++;
    this.fetchspCasesPaymentSelect2();
  }

  fetchspCasesPaymentSelect2(): void {
    this.loadingspCasesPayment = true;
    const searchVal = this.spCasesPaymentsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.spCasesPaymentsearchParams.skip;
    this.searchSelect2Params.take = this.spCasesPaymentsearchParams.take;
    this.Select2Service.getSpCasesPaymentSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.spCasesPaymentSelect2 = [...this.spCasesPaymentSelect2, ...newItems];
          this.loadingspCasesPayment = false;
        },
        error: () => this.loadingspCasesPayment = false
      });
  }

  onspCasesPaymentSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.paymentCode = selectedvendor.id;
      this.searchParams.paymentCodestr = selectedvendor.text;
    } else {
      this.searchParams.paymentCode = null;
      this.searchParams.paymentCodestr = null;
    }
  }

  onpaymentStatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.paymentStatussearchParams.skip = 0;
    this.paymentStatussearchParams.searchValue = search;
    this.paymentStatusSelect2 = [];
    this.paymentStatusSearchInput$.next(search);
  }

  loadMorepaymentStatus(): void {
    this.paymentStatussearchParams.skip++;
    this.fetchpaymentStatusSelect2();
  }

  fetchpaymentStatusSelect2(): void {
    this.loadingpaymentStatus = true;
    const searchVal = this.paymentStatussearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.paymentStatussearchParams.skip;
    this.searchSelect2Params.take = this.paymentStatussearchParams.take;
    this.Select2Service.getPaymentStatusSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.paymentStatusSelect2 = [...this.paymentStatusSelect2, ...newItems];
          this.loadingpaymentStatus = false;
        },
        error: () => this.loadingpaymentStatus = false
      });
  }

  onpaymentStatusSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.paymentStatus = selectedvendor.id;
      this.searchParams.paymentStatusstr = selectedvendor.text;
    } else {
      this.searchParams.paymentStatus = null;
      this.searchParams.paymentStatusstr = null;
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

  composeKey: string = '';
  entitY_ID: string = '';

  onPageChangePaymentHdr(event: { pageNumber: number; pageSize: number }): void {
    this.paginationPaymentHdr.currentPage = event.pageNumber;
    this.paginationPaymentHdr.take = event.pageSize;
    this.getFormDatabyId(event, this.composeKey, this.entitY_ID);
  }

  onTableSearchPaymentHdr(text: string): void {
    this.searchText = text;
    this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationPaymentHdr.take }, this.composeKey, this.entitY_ID);
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
    this.searchParams = new filtercasePaymentDto();
    this.selectedentitySelect2Obj = null;
    this.selectedspOfficesSelect2Obj = null;
    this. selectedpaymentStatusSelect2Obj = null;
    this. selectedspCasesPaymentSelect2Obj = null;

    this.loadgridData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }


  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.entityId) {
      this.translate
        .get(['CasePaymentResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['CasePaymentResourceName.EntityId']} ${translations['Common.Required']}`,
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
    this.casePaymentService.getAll(cleanedFilters)
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

  getFormDatabyId(event: { pageNumber: number; pageSize: number }, composeKey: string, entitY_ID: string): void {
    const params: filtercasePaymentByIdDto = {
      entityId: entitY_ID,
      composeKey: composeKey
    };
    this.spinnerService.show();
 
    forkJoin({
      headeraderdata: this.casePaymentService.getDetailById(params) as Observable<casePaymentDto | casePaymentDto[]>,
      detaildata: this.casePaymentService.getspCasesPaymentHdr(params) as Observable<casePaymentHdrDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadHdrformData = result.detaildata ?? [];
        this.loadformData = Array.isArray(result.headeraderdata)
          ? result.headeraderdata[0] ?? ({} as casePaymentDto)
          : result.headeraderdata;
        this.paginationPaymentHdr.totalCount = result?.detaildata.length || 0;

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

      { headerName: this.translate.instant('CasePaymentResourceName.casE_No'), field: 'casE_NO', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.casE_Name'), field: 'casename', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.sponsoR_CATEGORY_DESC'), field: 'sponsoR_CATEGORY_DESC', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.casE_STATUS_DESC'), field: 'casE_STATUS_DESC', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.kafalA_STATUS_DESC'), field: 'kafalA_STATUS_DESC', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.amounT_AED'), field: 'amounT_AEDstr', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.gifT_AMOUNT'), field: 'gifT_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.totalAmount'), field: 'totalstr', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.receivE_DATE'), field: 'receivE_DATEstr', width: 200 },
    ];

    this.columnDefsPaymentHdr = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationPaymentHdr.currentPage - 1) * this.paginationPaymentHdr.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('CasePaymentResourceName.PaymentNumber'), field: 'paymenT_NUMBER', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.PaymentDate'), field: 'paymenT_DATEstr', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.PaymentTypeDesc'), field: 'paymenT_TYPE_DESC', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.VendorNumber'), field: 'vendoR_NUMBER', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.VendorName'), field: 'vendoR_NAME', width: 200 },
      { headerName: this.translate.instant('CasePaymentResourceName.Amount'), field: 'paymenT_AMOUNTstr', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationPaymentHdr.take }, event.row.composeKey, event.row.entitY_ID);

    }
  }


  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['CasePaymentResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['CasePaymentResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.casePaymentService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.casePaymentService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('CasePaymentResourceName.Title'),
                  reportTitle: this.translate.instant('CasePaymentResourceName.Title'),
                  fileName: `${this.translate.instant('CasePaymentResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('CasePaymentResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('CasePaymentResourceName.paymentCode'), value: this.searchParams.paymentCodestr },
                    { label: this.translate.instant('CasePaymentResourceName.paymentStatus'), value: this.searchParams.paymentStatusstr },
                    { label: this.translate.instant('CasePaymentResourceName.officeid'), value: this.searchParams.officeidstr },
                    { label: this.translate.instant('CasePaymentResourceName.startDateCode'), value: this.searchParams.startDateCode },
                    { label: this.translate.instant('CasePaymentResourceName.endDateCode'), value: this.searchParams.endDateCodestr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('CasePaymentResourceName.paymenT_DESC'), key: 'paymenT_DESC' },
                    { label: this.translate.instant('CasePaymentResourceName.starT_DATE'), key: 'starT_DATEstr' },
                    { label: this.translate.instant('CasePaymentResourceName.enD_DATE'), key: 'enD_DATEstr' },
                    { label: this.translate.instant('CasePaymentResourceName.statuS_CODE_DESC'), key: 'statuS_CODE_DESC' },
                    { label: this.translate.instant('CasePaymentResourceName.amounT_AED'), key: 'amounT_AEDstr' },
                    { label: this.translate.instant('CasePaymentResourceName.gifT_AMOUNT'), key: 'gifT_AMOUNTstr' },
                    { label: this.translate.instant('CasePaymentResourceName.totalAmount'), key: 'totalAmountstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['amounT_AEDstr', 'gifT_AMOUNTstr', 'amounT_AEDstr']
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
