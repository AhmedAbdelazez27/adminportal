import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm } from '@angular/forms';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { FndLookUpValuesSelect2RequestDto, Pagination, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { GljeDetailsDto, filterGljeListHeaderDto, getgljeByIDDto, gljeHeaderDto } from '../../../../core/dtos/FinancialDtos/OperationDtos/gl-je.models';
import { gljeService } from '../../../../core/services/Financial/Operation/gl-je.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

declare var bootstrap: any;

@Component({
  selector: 'app-gl-je',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './gl-je.component.html',
  styleUrls: ['./gl-je.component.scss']
})
export class GLJEComponent implements OnInit {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  paginationlineData = new Pagination();

  columnDefs: ColDef[] = [];
  columnDefslineData: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];

  loadgridData: gljeHeaderDto[] = [];
  loadformData: gljeHeaderDto = {} as gljeHeaderDto;
  loadformdetailsData: GljeDetailsDto[] = [];

  searchParams = new filterGljeListHeaderDto();
  searchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  searchSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();

  selectedstatusSelect2Obj: any = null;
  selectedje_SoureSelect2Obj: any = null;
  selectedje_CurrSelect2Obj: any = null;

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  je_SoureSelect2: SelectdropdownResultResults[] = [];
  loadingJe_Soure = false;
  je_SouresearchParams = new Select2RequestDto();
  selectedJe_SoureSelect2Obj: any = null;
  je_SoureSearchInput$ = new Subject<string>();

  je_CurrSelect2: SelectdropdownResultResults[] = [];
  loadingJe_Curr = false;
  je_CurrsearchParams = new Select2RequestDto();
  selectedJe_CurrSelect2Obj: any = null;
  je_CurrSearchInput$ = new Subject<string>();

  statusSelect2: SelectdropdownResultResults[] = [];
  loadingstatus = false;
  statussearchParams = new Select2RequestDto();
  selectedStatusSelect2Obj: any = null;
  statusSearchInput$ = new Subject<string>();



  constructor(private gljeService: gljeService,
    private toastr: ToastrService,
    private translate: TranslateService,
    public openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'fas fa-eye', action: 'onViewInfo' },
    ];
   
    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.je_CurrSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchje_CurrSelect2());

    this.statusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchstatusSelect2());

    this.je_SoureSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchje_SoureSelect2());


    this.fetchentitySelect2();
    this.fetchje_CurrSelect2();
    this.fetchje_SoureSelect2();
    this.fetchstatusSelect2();
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
    this.searchSelect2RequestDto.searchValue = this.entitysearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.entitysearchParams.skip;
    this.searchSelect2RequestDto.take = this.entitysearchParams.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2RequestDto)
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
    this.searchSelect2RequestDto.searchValue = this.statussearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.statussearchParams.skip;
    this.searchSelect2RequestDto.take = this.statussearchParams.take;

    this.Select2Service.getGljeStatusSelect2(this.searchSelect2RequestDto)
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
      this.searchParams.je_State = selectedstatus.id;
      this.searchParams.statusstr = selectedstatus.text;
    } else {
      this.searchParams.je_State = null;
      this.searchParams.statusstr = null;
    }
  }


  onje_CurrSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.je_CurrsearchParams.skip = 0;
    this.je_CurrsearchParams.searchValue = searchVal;
    this.je_CurrSelect2 = [];
    this.je_CurrSearchInput$.next(search);
  }

  loadMoreje_Curr(): void {
    this.je_CurrsearchParams.skip++;
    this.fetchje_CurrSelect2();
  }

  fetchje_CurrSelect2(): void {
    this.loadingJe_Curr = true;
    this.searchSelect2RequestDto.searchValue = this.je_CurrsearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.je_CurrsearchParams.skip;
    this.searchSelect2RequestDto.take = this.je_CurrsearchParams.take;

    this.Select2Service.getJe_CurrSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.je_CurrSelect2 = [...this.je_CurrSelect2, ...newItems];
          this.loadingJe_Curr = false;
        },
        error: () => this.loadingJe_Curr = false
      });
  }

  onje_CurrSelect2Change(slelectedje_Curr: any): void {
    if (slelectedje_Curr) {
      this.searchParams.je_Curr = slelectedje_Curr.id;
      this.searchParams.je_Currstr = slelectedje_Curr.text;
    } else {
      this.searchParams.je_Curr = null;
      this.searchParams.je_Currstr = null;
    }
  }


  onje_SoureSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.je_SouresearchParams.skip = 0;
    this.je_SouresearchParams.searchValue = searchVal;
    this.je_SoureSelect2 = [];
    this.je_SoureSearchInput$.next(search);
  }

  loadMoreje_Soure(): void {
    this.je_SouresearchParams.skip++;
    this.fetchje_SoureSelect2();
  }

  fetchje_SoureSelect2(): void {
    this.loadingJe_Soure = true;
    this.searchSelect2RequestDto.searchValue = this.je_SouresearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.je_SouresearchParams.skip;
    this.searchSelect2RequestDto.take = this.je_SouresearchParams.take;

    this.Select2Service.getJe_SourceSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.je_SoureSelect2 = response?.results || [];
          this.loadingJe_Soure = false;
        },
        error: () => this.loadingJe_Soure = false
      });
  }

  onje_SoureSelect2Change(selectedje_Soure: any): void {
    if (selectedje_Soure) {
      this.searchParams.je_Soure = selectedje_Soure.id;
      this.searchParams.je_Sourestr = selectedje_Soure.text;
    } else {
      this.searchParams.je_Soure = null;
      this.searchParams.je_Sourestr = null;
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
    this.gljeService.getAll(cleanedFilters)
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


  jE_ID: string = '';
  entitY_ID: string = '';

  onPageChangelineData(event: { pageNumber: number; pageSize: number }): void {
    this.paginationlineData.currentPage = event.pageNumber;
    this.paginationlineData.take = event.pageSize;
    this.getFormDatabyId(event, this.jE_ID, this.entitY_ID);
  }

  onTableSearchlineData(text: string): void {
    this.searchText = text;
    this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationlineData.take }, this.jE_ID, this.entitY_ID);
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
    this.searchParams = new filterGljeListHeaderDto();
    this.loadgridData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }


  getFormDatabyId(event: { pageNumber: number; pageSize: number }, jE_ID: string, entitY_ID: string): void {
    const params: getgljeByIDDto = {
      entityId: entitY_ID,
      receiptId: jE_ID
    };
    this.spinnerService.show();

    forkJoin({
      loadformData: this.gljeService.getDetailById(params) as Observable<gljeHeaderDto | gljeHeaderDto[]>,
      gljedetaildata: this.gljeService.getLineDatabyId(params) as Observable<GljeDetailsDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformdetailsData = result.gljedetaildata ?? [];
        this.loadformData = Array.isArray(result.loadformData)
          ? result.loadformData[0] ?? ({} as gljeHeaderDto)
          : result.loadformData;

        this.paginationlineData.totalCount = result?.gljedetaildata.length || 0;

        const modalElement = document.getElementById('viewdetails');
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
      { headerName: this.translate.instant('glJEResourceName.jvNo'), field: 'attributE10', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.jvName'), field: 'jE_NAME', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.jvDate'), field: 'jE_DATEstr', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.period'), field: 'perioD_ID', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.referenceNo'), field: 'jE_SOURCE_DESC', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.jvStatus'), field: 'jE_STATUS', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.currency'), field: 'jE_CURR_DESC', width: 200 },
    ];

    this.columnDefslineData = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationlineData.currentPage - 1) * this.paginationlineData.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('glJEResourceName.accountNo'), field: 'accountnumber', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.accountName'), field: 'accountNameAr', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.jvDesc'), field: 'sourcE_DESC_DETAILS', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.credit'), field: 'debiT_AMOUNT', width: 200 },
      { headerName: this.translate.instant('glJEResourceName.debit'), field: 'crediT_AMOUNT', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationlineData.take }, event.row.jE_ID, event.row.entitY_ID);
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
    this.searchParams.take = this.pagination.totalCount;
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.gljeService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || 0;

          this.gljeService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {

                  title: this.translate.instant('glJEResourceName.title'),
                  reportTitle: this.translate.instant('glJEResourceName.title'),
                  fileName: `${this.translate.instant('glJEResourceName.title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('glJEResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('glJEResourceName.jvNo'), value: this.searchParams.att10 },
                    { label: this.translate.instant('glJEResourceName.jvName'), value: this.searchParams.jE_NAME },
                    { label: this.translate.instant('glJEResourceName.jvManualNo'), value: this.searchParams.att7 },
                    { label: this.translate.instant('glJEResourceName.value'), value: this.searchParams.att7 },
                    { label: this.translate.instant('glJEResourceName.referenceNo'), value: this.searchParams.je_Soure },
                    { label: this.translate.instant('glJEResourceName.jvStatus'), value: this.searchParams.je_State },
                    { label: this.translate.instant('glJEResourceName.jvDate'), value: this.searchParams.je_Date },
                    { label: this.translate.instant('glJEResourceName.currency'), value: this.searchParams.je_Curr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('glJEResourceName.jvNo'), key: 'attributE10' },
                    { label: this.translate.instant('glJEResourceName.jvName'), key: 'jE_NAME' },
                    { label: this.translate.instant('glJEResourceName.jvDate'), key: 'jE_DATE' },
                    { label: this.translate.instant('glJEResourceName.period'), key: 'perioD_ID' },
                    { label: this.translate.instant('glJEResourceName.referenceNo'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('glJEResourceName.jvStatus'), key: 'jE_STATUS' },
                    { label: this.translate.instant('glJEResourceName.currency'), key: 'jE_CURR_DESC' },
                  ],

                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: []
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
