import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig, Select2RequestDto } from '../../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { SpinnerService } from '../../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../../core/services/Select2.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FilterArMiscReceiptHeaderDto, FilterArMiscReceiptHeaderByIdDto, ArMiscReceiptHeaderDto, ArMiscReceiptLinesDto, ArMiscReceiptDetailsDto } from '../../../../../core/dtos/FinancialDtos/OperationDtos/ArMiscReceiptHeader.dto';
import { ArMiscReceiptHeaderService } from '../../../../../core/services/Financial/Operation/ArMiscReceiptHeader.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../../shared/generic-data-table/generic-data-table.component';

declare var bootstrap: any;

@Component({
  selector: 'app-ArMiscReceiptHeader',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './ArMiscReceiptHeader.component.html',
  styleUrls: ['./ArMiscReceiptHeader.component.scss']
})

export class ArMiscReceiptHeaderComponent {
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


  searchParams = new FilterArMiscReceiptHeaderDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FilterArMiscReceiptHeaderByIdDto();

  loadgridData: ArMiscReceiptHeaderDto[] = [];
  loadformData: ArMiscReceiptHeaderDto = {} as ArMiscReceiptHeaderDto;
  loadformLineData: ArMiscReceiptLinesDto[] = [];
  loadformDetailsData: ArMiscReceiptDetailsDto[] = [];

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

  projectNameSelect2: SelectdropdownResultResults[] = [];
  loadingprojectName = false;
  projectNamesearchParams = new Select2RequestDto();
  selectedprojectNameSelect2Obj: any = null;
  projectNameSearchInput$ = new Subject<string>();

  benNameSelect2: SelectdropdownResultResults[] = [];
  loadingbenName = false;
  benNamesearchParams = new Select2RequestDto();
  selectedbenNameSelect2Obj: any = null;
  benNameSearchInput$ = new Subject<string>();

  constructor(
    private arMiscReceiptHeaderService: ArMiscReceiptHeaderService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
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
      { label: this.translate.instant('Common.Action'), icon: 'fas fa-edit', action: 'edit' },
    ];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.statusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchstatusSelect2());

    this.projectNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchprojectNameSelect2());

    this.benNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbenNameSelect2());

    this.fetchentitySelect2();
    this.fetchstatusSelect2();
    this.fetchbenNameSelect2();
    this.fetchprojectNameSelect2();
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

    this.Select2Service.getArMiscStatusSelect2(this.searchSelect2Params)
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

  onprojectNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.projectNamesearchParams.skip = 0;
    this.projectNamesearchParams.searchValue = search;
    this.projectNameSelect2 = [];
    this.projectNameSearchInput$.next(search);
  }

  loadMoreprojectName(): void {
    this.projectNamesearchParams.skip++;
    this.fetchprojectNameSelect2();
  }

  fetchprojectNameSelect2(): void {
    this.loadingprojectName = true;
    this.searchSelect2Params.searchValue = this.projectNamesearchParams.searchValue;
    this.searchSelect2Params.skip = this.projectNamesearchParams.skip;
    this.searchSelect2Params.take = this.projectNamesearchParams.take;
    this.Select2Service.getProjectNameSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.projectNameSelect2 = response?.results || [];
          this.loadingprojectName = false;
        },
        error: () => this.loadingprojectName = false
      });
  }

  onprojectNameSelect2Change(selectedprojectName: any): void {
    if (selectedprojectName) {
      this.searchParams.projectName = selectedprojectName.id;
      this.searchParams.projectNamestr = selectedprojectName.text;
    } else {
      this.searchParams.projectName = null;
      this.searchParams.projectNamestr = null;
    }
  }

  onbenNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.benNamesearchParams.skip = 0;
    this.benNamesearchParams.searchValue = search;
    this.benNameSelect2 = [];
    this.benNameSearchInput$.next(search);
  }

  loadMorebenName(): void {
    this.benNamesearchParams.skip++;
    this.fetchbenNameSelect2();
  }

  fetchbenNameSelect2(): void {
    this.loadingbenName = true;
    this.searchSelect2Params.searchValue = this.benNamesearchParams.searchValue;
    this.searchSelect2Params.skip = this.benNamesearchParams.skip;
    this.searchSelect2Params.take = this.benNamesearchParams.take;

    this.Select2Service.getBenNameSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.benNameSelect2 = response?.results || [];
          this.loadingbenName = false;
        },
        error: () => this.loadingbenName = false
      });
  }

  onbenNameSelect2Change(selectbenName: any): void {
    if (selectbenName) {
      this.searchParams.benName = selectbenName.id;
      this.searchParams.benNamestr = selectbenName.text;
    } else {
      this.searchParams.benName = null;
      this.searchParams.benNamestr = null;
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
    this.searchParams = new FilterArMiscReceiptHeaderDto();
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
   
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();

    this.arMiscReceiptHeaderService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
          this.loadgridData = response || [];
          this.pagination.totalCount = response[0]?.rowsCount || 0;
          this.spinnerService.hide();
      },
        error: (error) => {
          this.spinnerService.hide();;
      }
    });
  }

  getFormDatabyId(tr_Id: string, entitY_ID: string): void {
    const params: FilterArMiscReceiptHeaderByIdDto = {
      entityId: entitY_ID,
      miscReceiptId: tr_Id
    };
    this.spinnerService.show();;
    forkJoin({
      mischeaderdata: this.arMiscReceiptHeaderService.getDetailById(params) as Observable<ArMiscReceiptHeaderDto | ArMiscReceiptHeaderDto[]>,
      miscdetaildata: this.arMiscReceiptHeaderService.getReceiptDetailsListDataById(params) as Observable<ArMiscReceiptDetailsDto[]>,
      misclinedata: this.arMiscReceiptHeaderService.getReceiptLinesListDataById(params) as Observable<ArMiscReceiptLinesDto[]>
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformDetailsData = result.miscdetaildata ?? [];
        this.loadformLineData = result.misclinedata ?? [];
        this.loadformData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ArMiscReceiptHeaderDto)
          : result.mischeaderdata;
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

  private buildColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber'), field: 'receipT_NUMBER', width: 200 },
      { headerName: this.translate.instant('ArMiscReceiptHeaderResourceName.MISC_RECEIPT_DATE'), field: 'misC_RECEIPT_DATEstr', width: 200 },
      { headerName: this.translate.instant('ArMiscReceiptHeaderResourceName.BENEFICIARY_NAME'), field: 'beneficiarY_NAME', width: 200 },
      { headerName: this.translate.instant('ArMiscReceiptHeaderResourceName.AMOUNT'), field: 'amounTstr', width: 200 },
      { headerName: this.translate.instant('ArMiscReceiptHeaderResourceName.Status'), field: 'posted', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId(event.row.misC_RECEIPT_ID, event.row.entitY_ID);
    }
    if (event.action === 'edit') {
    }
  }



  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ArMiscReceiptHeaderResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ArMiscReceiptHeaderResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
   
    this.arMiscReceiptHeaderService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.arMiscReceiptHeaderService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title'),
                  reportTitle: this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title'),
                  fileName: `${this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.EntityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber'), value: this.searchParams.receiptNumber },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.ChequeNo'), value: this.searchParams.checkNumber },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.BeneficiaryName'), value: this.searchParams.benificaryNamestr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Status'), value: this.searchParams.statusstr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.ProjectName'), value: this.searchParams.projectNamestr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Sponsor'), value: this.searchParams.benNamestr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Amount'), value: this.searchParams.amount },
                  ],

                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber'), key: 'receipT_NUMBER' },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.MISC_RECEIPT_DATE'), key: 'misC_RECEIPT_DATEstr' },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.BENEFICIARY_NAME'), key: 'beneficiarY_NAME' },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.AMOUNT'), key: 'amounTstr' },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Status'), key: 'posted' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['receiptAmountstr', 'chequeAmountstr', 'cashAmountstr', 'administrativeAmountstr']
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

