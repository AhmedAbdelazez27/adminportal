import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm } from '@angular/forms';
import { Observable, Subject, debounceTime, forkJoin, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FilterpaymentvoucherDto, FilterpaymentvoucherByIdDto, paymentvoucherDto, paymentvoucherlinesDto, paymentvoucherdetailsDto } from '../../../../core/dtos/FinancialDtos/OperationDtos/payment-voucher.dto';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { PaymentVoucherServiceService } from '../../../../core/services/Financial/Operation/payment-voucher-service.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

declare var bootstrap: any;

@Component({
  selector: 'app-payment-voucher',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './payment-voucher.component.html',
  styleUrls: ['./payment-voucher.component.scss']
})
export class PaymentVoucherComponent implements OnInit {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  paginationDetailData = new Pagination();
  paginationLineData = new Pagination();

  columnDefs: ColDef[] = [];
  columnDefsDetailData: ColDef[] = [];
  columnDefsLineData: ColDef[] = [];

  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];


  searchParams = new FilterpaymentvoucherDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FilterpaymentvoucherByIdDto();

  loadgridData: paymentvoucherDto[] = [];
  loadformData: paymentvoucherDto = {} as paymentvoucherDto;
  loadformDetailData: paymentvoucherdetailsDto[] = [];
  loadformLineData: paymentvoucherlinesDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  beneficiaryNameSelect2: SelectdropdownResultResults[] = [];
  loadingbeneficiaryName = false;
  beneficiaryNamesearchParams = new Select2RequestDto();
  selectedbeneficiaryNameSelect2Obj: any = null;
  beneficiaryNameSearchInput$ = new Subject<string>();

  statusSelect2: SelectdropdownResultResults[] = [];
  loadingstatus = false;
  statussearchParams = new Select2RequestDto();
  selectedstatusSelect2Obj: any = null;
  statusSearchInput$ = new Subject<string>();
  constructor(
    private apiService: PaymentVoucherServiceService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildColumnDefs();
        this.rowActions = [
          { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
        ];
      
    this.beneficiaryNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchApbeneficiaryNameSelect2());

    this.statusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchstatusSelect2());


    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.fetchentitySelect2();
    this.fetchApbeneficiaryNameSelect2();
    this.fetchstatusSelect2();
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


  onbeneficiaryNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.beneficiaryNamesearchParams.skip = 0;
    this.beneficiaryNamesearchParams.searchValue = search;
    this.beneficiaryNameSelect2 = [];
    this.beneficiaryNameSearchInput$.next(search);
  }

  loadMorebeneficiaryNames(): void {
    this.beneficiaryNamesearchParams.skip++;
    this.fetchApbeneficiaryNameSelect2();
  }

  fetchApbeneficiaryNameSelect2(): void {
    this.loadingbeneficiaryName = true;
    const searchVal = this.beneficiaryNamesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.beneficiaryNamesearchParams.skip;
    this.searchSelect2Params.take = this.beneficiaryNamesearchParams.take;

    this.Select2Service.getBeneficentIdSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.beneficiaryNameSelect2 = [...this.beneficiaryNameSelect2, ...newItems];
          this.loadingbeneficiaryName = false;
        },
        error: () => this.loadingbeneficiaryName = false
      });
  }

  onbeneficiaryNameSelect2Change(selectedbeneficiaryName: any): void {
    if (selectedbeneficiaryName) {
      this.searchParams.benifetaryName = selectedbeneficiaryName.id;
      this.searchParams.benifetaryNamestr = selectedbeneficiaryName.text;
    } else {
      this.searchParams.benifetaryName = null;
      this.searchParams.benifetaryNamestr = null;
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

    this.Select2Service.getMiscPaymentStatusSelect2(this.searchSelect2Params)
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
      this.searchParams.status = selectedstatus.id;
      this.searchParams.statusstr = selectedstatus.text;
    } else {
      this.searchParams.status = null;
      this.searchParams.statusstr = null;
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


  onPageChangeDetailData(event: { pageNumber: number; pageSize: number }): void {
    this.paginationDetailData.currentPage = event.pageNumber;
    this.paginationDetailData.take = event.pageSize;
    const paymentId = this.searchParamsById.paymentId || '';
    const entityId = this.searchParamsById.entityId || '';
    this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationDetailData.take }, paymentId, entityId);  }

  onTableSearchDetailData(text: string): void {
    this.searchText = text;
    const paymentId = this.searchParamsById.paymentId || '';
    const entityId = this.searchParamsById.entityId || '';
    this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationDetailData.take }, paymentId, entityId);  }



  onPageChangeLineData(event: { pageNumber: number; pageSize: number }): void {
    this.paginationLineData.currentPage = event.pageNumber;
    this.paginationLineData.take = event.pageSize;
    const paymentId = this.searchParamsById.paymentId || '';
    const entityId = this.searchParamsById.entityId || '';
    this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationLineData.take }, paymentId, entityId);  }

  onTableSearchLineData(text: string): void {
    this.searchText = text;
    const paymentId = this.searchParamsById.paymentId || '';
    const entityId = this.searchParamsById.entityId || '';
    this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationLineData.take }, paymentId, entityId);
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
    this.searchParams = new FilterpaymentvoucherDto();
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
    this.apiService.getAll(cleanedFilters)
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


  getFormDatabyId(event: { pageNumber: number; pageSize: number }, misC_PAYMENT_ID: string, entitY_ID: string): void {

    const params: FilterpaymentvoucherByIdDto = {
      entityId: entitY_ID,
      paymentId: misC_PAYMENT_ID
    };
    this.spinnerService.show();
    forkJoin({
      mischeaderdata: this.apiService.getDetailById(params) as Observable<paymentvoucherDto | paymentvoucherDto[]>,
      miscdetaildata: this.apiService.getPaymentDetailsListDataById(params) as Observable<paymentvoucherdetailsDto[]>,
      misclinedata: this.apiService.getPaymentLinesListDataById(params) as Observable<paymentvoucherlinesDto[]>
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformDetailData = result.miscdetaildata ?? [];
        this.loadformLineData = result.misclinedata ?? [];
        this.loadformData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as paymentvoucherDto)
          : result.mischeaderdata;

        this.paginationDetailData.totalCount = result.miscdetaildata.length || 0;
        this.paginationLineData.totalCount = result.misclinedata.length || 0;

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
      { headerName: this.translate.instant('PaymentVoucherResourceName.paymenT_NUMBER'), field: 'paymenT_NUMBER', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.beneficiarY_NAME'), field: 'beneficiarY_NAME', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.misC_PAYMENT_DATE'), field: 'misC_PAYMENT_DATEstr', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.amount'), field: 'amount', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.status'), field: 'posted', width: 200 },
    ];

    this.columnDefsLineData = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationLineData.currentPage - 1) * this.paginationLineData.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('PaymentVoucherResourceName.accountnumber'), field: 'accountnumber', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.accountNameAr'), field: 'accountNameAr', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.tR_TAX'), field: 'tR_TAX', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.taX_PERCENT'), field: 'taX_PERCENT', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.totaPercent'), field: 'totaPercentstr', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.totalAmount'), field: 'totalAmountstr', width: 200 },
    ];

    this.columnDefsDetailData = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationDetailData.currentPage - 1) * this.paginationDetailData.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('PaymentVoucherResourceName.checK_NUMBER'), field: 'checK_NUMBER', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.maturitY_DATE'), field: 'maturitY_DATE', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.beneficiarY_NAME'), field: 'beneficiarY_NAME', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.notes'), field: 'notes', width: 200 },
      { headerName: this.translate.instant('PaymentVoucherResourceName.amount'), field: 'amounTstr', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationDetailData.take || this.paginationLineData.take }, event.row.misC_PAYMENT_ID, event.row.entitY_ID);
    }
  }


  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['PaymentVoucherResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['PaymentVoucherResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.apiService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || initialResponse?.data?.length || 0;

          this.apiService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('PaymentVoucherResourceName.Title'),
                  reportTitle: this.translate.instant('PaymentVoucherResourceName.Title'),
                  fileName: `${this.translate.instant('PaymentVoucherResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('PaymentVoucherResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('PaymentVoucherResourceName.paymentNumber'), value: this.searchParams.paymentNumber },
                    { label: this.translate.instant('PaymentVoucherResourceName.benifetaryName'), value: this.searchParams.benifetaryNamestr },
                    { label: this.translate.instant('PaymentVoucherResourceName.checkNumber'), value: this.searchParams.checkNumber },
                    { label: this.translate.instant('PaymentVoucherResourceName.amount'), value: this.searchParams.amount },
                    { label: this.translate.instant('PaymentVoucherResourceName.status'), value: this.searchParams.statusstr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('PaymentVoucherResourceName.paymenT_NUMBER'), key: 'paymenT_NUMBER' },
                    { label: this.translate.instant('PaymentVoucherResourceName.beneficiarY_NAME'), key: 'beneficiarY_NAME' },
                    { label: this.translate.instant('PaymentVoucherResourceName.misC_PAYMENT_DATE'), key: 'misC_PAYMENT_DATEstr' },
                    { label: this.translate.instant('PaymentVoucherResourceName.amount'), key: 'amountstr' },
                    { label: this.translate.instant('PaymentVoucherResourceName.status'), key: 'posted' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['amountstr']
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
