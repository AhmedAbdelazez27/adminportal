import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { spContractsService } from '../../../../core/services/sponsorship/operations/spContracts.service';
import { filterspContractsDto, filterspContractsByIdDto, spContractsDto, spContractsCasesDto } from '../../../../core/dtos/sponsorship/operations/spContracts.dto';

declare var bootstrap: any;

@Component({
  selector: 'app-spContracts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './spContracts.component.html',
  styleUrls: ['./spContracts.component.scss']
})

export class spContractsComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  contractCasespagination = new Pagination();

  columnDefs: ColDef[] = [];
  contractCasescolumnDefs: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];


  searchParams = new filterspContractsDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new filterspContractsByIdDto();

  loadgridData: spContractsDto[] = [];
  loadformData: spContractsDto = {} as spContractsDto;
  loadformDetailsData: spContractsCasesDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  statusSelect2: SelectdropdownResultResults[] = [];
  loadingstatus = false;
  statussearchParams = new Select2RequestDto();
  selectedstatusSelect2Obj: any = null;
  statusSearchInput$ = new Subject<string>();

  contractIdSelect2: SelectdropdownResultResults[] = [];
  loadingcontractId = false;
  contractIdsearchParams = new Select2RequestDto();
  selectedcontractIdSelect2Obj: any = null;
  contractIdSearchInput$ = new Subject<string>();

  paymentMethodSelect2: SelectdropdownResultResults[] = [];
  loadingpaymentMethod = false;
  paymentMethodsearchParams = new Select2RequestDto();
  selectedpaymentMethodSelect2Obj: any = null;
  paymentMethodSearchInput$ = new Subject<string>();

  beneficentIdSelect2: SelectdropdownResultResults[] = [];
  loadingbeneficentId = false;
  beneficentIdsearchParams = new Select2RequestDto();
  selectedbeneficentIdSelect2Obj: any = null;
  beneficentIdSearchInput$ = new Subject<string>();


  bankAccountSelect2: SelectdropdownResultResults[] = [];
  loadingbankAccount = false;
  bankAccountsearchParams = new Select2RequestDto();
  selectedbankAccountSelect2Obj: any = null;
  bankAccountSearchInput$ = new Subject<string>();
  constructor(
    private spContractsService: spContractsService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  )
  {

    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
    ];
    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.statusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchstatusSelect2());

    this.contractIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcontractIdSelect2());

    this.paymentMethodSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchpaymentMethodSelect2());

    this.beneficentIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbeneficentIdSelect2());

    this.bankAccountSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbankAccountSelect2());

    this.fetchentitySelect2();
    this.fetchstatusSelect2();
    this.fetchpaymentMethodSelect2();
    this.fetchbankAccountSelect2();
    this.fetchbeneficentIdSelect2();
    this.fetchcontractIdSelect2();
  }


  onentitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;

    this.entitysearchParams.skip = 0;
    this.entitysearchParams.searchValue = searchVal;
    this.entitySelect2 = [];
    this.entitySearchInput$.next(search);
  }

  loadMoreentity(): void {
    this.entitysearchParams.skip++;
    this.fetchentitySelect2();
  }

  fetchentitySelect2(): void {
    this.loadingentity = true;
    this.searchSelect2Params.searchValue = this.entitysearchParams.searchValue;
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

  onentitySelect2Change(slelectedentity: any): void {
    if (slelectedentity) {
      this.searchParams.entityId = slelectedentity.id;
      this.searchParams.entityIdstr = slelectedentity.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }


  onstatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.statussearchParams.skip = 0;
    this.statussearchParams.searchValue = searchVal;
    this.statusSelect2 = [];
    this.statusSearchInput$.next(search);
  }

  loadMorestatus(): void {
    this.statussearchParams.skip++;
    this.fetchstatusSelect2();
  }

  fetchstatusSelect2(): void {
    this.loadingstatus = true;
    this.searchSelect2Params.searchValue = this.statussearchParams.searchValue;
    this.searchSelect2Params.skip = this.statussearchParams.skip;
    this.searchSelect2Params.take = this.statussearchParams.take;

    this.Select2Service.getContractStatusSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.statusSelect2 = response?.results || [];
          this.loadingstatus = false;
        },
        error: () => this.loadingstatus = false
      });
  }

  onstatusSelect2Change(selectedstatus: any): void {
    if (selectedstatus) {
      this.searchParams.contractStatus = selectedstatus.id;
      this.searchParams.contractStatusstr = selectedstatus.text;
    } else {
      this.searchParams.contractStatus = null;
      this.searchParams.contractStatusstr = null;
    }
  }

  oncontractIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.contractIdsearchParams.skip = 0;
    this.contractIdsearchParams.searchValue = search;
    this.contractIdSelect2 = [];
    this.contractIdSearchInput$.next(search);
  }

  loadMorecontractId(): void {
    this.contractIdsearchParams.skip++;
    this.fetchcontractIdSelect2();
  }

  fetchcontractIdSelect2(): void {
    this.loadingcontractId = true;
    this.searchSelect2Params.searchValue = this.contractIdsearchParams.searchValue;
    this.searchSelect2Params.skip = this.contractIdsearchParams.skip;
    this.searchSelect2Params.take = this.contractIdsearchParams.take;
    this.Select2Service.SpContractsNoSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.contractIdSelect2 = response?.results || [];
          this.loadingcontractId = false;
        },
        error: () => this.loadingcontractId = false
      });
  }

  oncontractIdSelect2Change(selectedcontractId: any): void {
    if (selectedcontractId) {
      this.searchParams.contractId = selectedcontractId.id;
      this.searchParams.contractIdstr = selectedcontractId.text;
    } else {
      this.searchParams.contractId = null;
      this.searchParams.contractIdstr = null;
    }
  }

  onpaymentMethodSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.paymentMethodsearchParams.skip = 0;
    this.paymentMethodsearchParams.searchValue = search;
    this.paymentMethodSelect2 = [];
    this.paymentMethodSearchInput$.next(search);
  }

  loadMorepaymentMethod(): void {
    this.paymentMethodsearchParams.skip++;
    this.fetchpaymentMethodSelect2();
  }

  fetchpaymentMethodSelect2(): void {
    this.loadingpaymentMethod = true;
    this.searchSelect2Params.searchValue = this.paymentMethodsearchParams.searchValue;
    this.searchSelect2Params.skip = this.paymentMethodsearchParams.skip;
    this.searchSelect2Params.take = this.paymentMethodsearchParams.take;

    this.Select2Service.getBenefPaymentTypeSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.paymentMethodSelect2 = response?.results || [];
          this.loadingpaymentMethod = false;
        },
        error: () => this.loadingpaymentMethod = false
      });
  }

  onpaymentMethodSelect2Change(selectpaymentMethod: any): void {
    if (selectpaymentMethod) {
      this.searchParams.paymentMethod = selectpaymentMethod.id;
      this.searchParams.paymentMethodstr = selectpaymentMethod.text;
    } else {
      this.searchParams.paymentMethod = null;
      this.searchParams.paymentMethodstr = null;
    }
  }

  onbeneficentIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
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
    this.searchSelect2Params.searchValue = this.beneficentIdsearchParams.searchValue;
    this.searchSelect2Params.skip = this.beneficentIdsearchParams.skip;
    this.searchSelect2Params.take = this.beneficentIdsearchParams.take;

    this.Select2Service.getBeneficentIdSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.beneficentIdSelect2 = response?.results || [];
          this.loadingbeneficentId = false;
        },
        error: () => this.loadingbeneficentId = false
      });
  }

  onbeneficentIdSelect2Change(selectbeneficentId: any): void {
    if (selectbeneficentId) {
      this.searchParams.beneficentId = selectbeneficentId.id;
      this.searchParams.beneficentIdstr = selectbeneficentId.text;
    } else {
      this.searchParams.beneficentId = null;
      this.searchParams.beneficentIdstr = null;
    }
  }

  onbankAccountSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.bankAccountsearchParams.skip = 0;
    this.bankAccountsearchParams.searchValue = search;
    this.bankAccountSelect2 = [];
    this.bankAccountSearchInput$.next(search);
  }

  loadMorebankAccount(): void {
    this.bankAccountsearchParams.skip++;
    this.fetchbankAccountSelect2();
  }

  fetchbankAccountSelect2(): void {
    this.loadingbankAccount = true;
    this.searchSelect2Params.searchValue = this.bankAccountsearchParams.searchValue;
    this.searchSelect2Params.skip = this.bankAccountsearchParams.skip;
    this.searchSelect2Params.take = this.bankAccountsearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.bankAccountSelect2 = response?.results || [];
          this.loadingbankAccount = false;
        },
        error: () => this.loadingbankAccount = false
      });
  }

  onbankAccountSelect2Change(selectbankAccount: any): void {
    if (selectbankAccount) {
      this.searchParams.bankAccount = selectbankAccount.id;
      this.searchParams.bankAccountstr = selectbankAccount.text;
    } else {
      this.searchParams.bankAccount = null;
      this.searchParams.bankAccountstr = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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



  oncontractCasesPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.contractCasespagination.currentPage = event.pageNumber;
    this.contractCasespagination.take = event.pageSize;
    const contractId = this.searchParamsById.contractId || '';
    const entityId = this.searchParamsById.entityId || '';
    this.getFormDatabyId(event, contractId, entityId);
  }

  oncontractCasesTableSearch(text: string): void {
    this.searchText = text;
    const contractId = this.searchParamsById.contractId || '';
    const entityId = this.searchParamsById.entityId || '';
    this.getFormDatabyId({ pageNumber: 1, pageSize: this.contractCasespagination.take }, contractId, entityId);
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
    this.searchParams = new filterspContractsDto();
    this.loadgridData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }


  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
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
    const skip = (event.pageNumber - 1);
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;

    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();

    this.spContractsService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
          this.loadgridData = response.data || [];
          this.loadgridData.forEach((c) => {
            c.contracT_DATEstr = this.formatDate(c.contracT_DATE);
          });

          this.pagination.totalCount = response.data[0]?.rowsCount || 0;
          this.spinnerService.hide();
      },
        error: (error) => {
          this.spinnerService.hide();;
      }
    });
  }


  getFormDatabyId(event: { pageNumber: number; pageSize: number }, contractId: string, entitY_ID: string): void {

    const params: filterspContractsByIdDto = {
      entityId: entitY_ID,
      contractId: contractId
    };
    this.spinnerService.show();;
    forkJoin({
      headerdata: this.spContractsService.getDetailById(params) as Observable<spContractsDto | spContractsDto[]>,
      detaildata: this.spContractsService.getContractCasesById(params) as Observable<spContractsCasesDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformDetailsData = result.detaildata ?? [];
        this.loadformData = Array.isArray(result.headerdata)
          ? result.headerdata[0] ?? ({} as spContractsDto)
          : result.headerdata;
        this.loadformDetailsData.forEach((c) => {
          c.conT_END_DATEEstr = this.formatDate(c.conT_END_DATE);
        });
        this.loadformDetailsData.forEach((c) => {
          c.startdatEstr = this.formatDate(c.startdate);
        });
        this.loadformData.contracT_DATEstr = this.formatDate(this.loadformData.contracT_DATE);

        this.contractCasespagination.totalCount = result?.detaildata.length || 0;

        const modalElement = document.getElementById('viewdetails');;
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        };
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
     }
    });
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
      { headerName: this.translate.instant('SpContractsResourceName.contracT_NUMBER'), field: 'contracT_NUMBER', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.contracT_DATE'), field: 'contracT_DATEstr', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.beneficentNo'), field: 'beneficenT_NO', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.beneficentname'), field: 'beneficentname', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.contracT_STATUS_DESC'), field: 'contracT_STATUS_DESC', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.paymenT_METHOD_DESC'), field: 'paymenT_METHOD_DESC', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.banK_ACCOUNT_NAME'), field: 'banK_ACCOUNT_NAME', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.caseAmountTotal'), field: 'caseAmountTotal', width: 200 }
    ];

    this.contractCasescolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.contractCasespagination.currentPage - 1) * this.contractCasespagination.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('SpContractsResourceName.sponceR_CATEGORY_DESC'), field: 'sponceR_CATEGORY_DESC', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.casE_CONTRACT_STATUS_DESC'), field: 'casE_CONTRACT_STATUS_DESC', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.casE_NO'), field: 'casE_NO', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.casename'), field: 'casename', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.birthdate'), field: 'birthdatestr', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.gendeR_DESC'), field: 'gendeR_DESC', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.nationalitY_DESC'), field: 'nationalitY_DESC', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.startdate'), field: 'startdatEstr', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.conT_END_DATE'), field: 'conT_END_DATEEstr', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.CaseAmountTotal'), field: 'CaseAmountTotal', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.banK_DESC'), field: 'banK_DESC', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.ownername'), field: 'ownername', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.accounT_NO'), field: 'accounT_NO', width: 200 },
      { headerName: this.translate.instant('SpContractsResourceName.sponS_FOR'), field: 'sponS_FOR', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    var data = event.row.composeKey.split(',');

    var contractId = data[0];
    var entityId = data[1];

   
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId({ pageNumber: 1, pageSize: this.contractCasespagination.take }, contractId, entityId);
    }
  }



  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['SpContractsResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['SpContractsResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
   
    this.spContractsService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse.data[0]?.rowsCount || 0;

          this.spContractsService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SpContractsResourceName.Title'),
                  reportTitle: this.translate.instant('SpContractsResourceName.Title'),
                  fileName: `${this.translate.instant('SpContractsResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('SpContractsResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('SpContractsResourceName.contractStatus'), value: this.searchParams.contractStatusstr },
                    { label: this.translate.instant('SpContractsResourceName.contractId'), value: this.searchParams.contractIdstr },
                    { label: this.translate.instant('SpContractsResourceName.beneficentId'), value: this.searchParams.beneficentIdstr },
                    { label: this.translate.instant('SpContractsResourceName.bankAccount'), value: this.searchParams.bankAccountstr },
                    { label: this.translate.instant('SpContractsResourceName.paymentMethod'), value: this.searchParams.paymentMethodstr },
                    { label: this.translate.instant('SpContractsResourceName.contractDate'), value: this.searchParams.contractDatestr },
                    { label: this.translate.instant('SpContractsResourceName.beneficentNo'), value: this.searchParams.beneficentNo },
                  ],

                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SpContractsResourceName.contracT_NUMBER'), key: 'contracT_NUMBER' },
                    { label: this.translate.instant('SpContractsResourceName.contracT_DATE'), key: 'contracT_DATEstr' },
                    { label: this.translate.instant('SpContractsResourceName.beneficentNo'), key: 'beneficenT_NO' },
                    { label: this.translate.instant('SpContractsResourceName.beneficentname'), key: 'beneficentname' },
                    { label: this.translate.instant('SpContractsResourceName.contracT_STATUS_DESC'), key: 'contracT_STATUS_DESC' },
                    { label: this.translate.instant('SpContractsResourceName.paymenT_METHOD_DESC'), key: 'paymenT_METHOD_DESC' },
                    { label: this.translate.instant('SpContractsResourceName.banK_ACCOUNT_NAME'), key: 'banK_ACCOUNT_NAME' },
                    { label: this.translate.instant('SpContractsResourceName.caseAmountTotal'), key: 'caseAmountTotal' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['caseAmountTotal']
                };

                this.openStandardReportService.openStandardReportExcel(reportConfig);
                this.spinnerService.hide();;
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

