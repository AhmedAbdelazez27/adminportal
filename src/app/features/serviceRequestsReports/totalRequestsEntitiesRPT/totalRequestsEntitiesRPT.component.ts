import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { totalRequestsEntitiesRPTInputDto } from '../../../core/dtos/serviceRequests/serviceRequestsReportsInput.dto';
import { totalRequestsEntitiesRPTOutputDto } from '../../../core/dtos/serviceRequests/serviceRequestsReportsOutput.dto';
import { ServiceRequestsReportsService } from '../../../core/services/serviceRequests/serviceRequestsReports.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { Select2Service } from '../../../core/services/Select2.service';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';

@Component({
  selector: 'app-totalRequestsEntitiesRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './totalRequestsEntitiesRPT.component.html',
  styleUrls: ['./totalRequestsEntitiesRPT.component.scss']
})

export class totalRequestsEntitiesRPTComponent {
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
  searchParams = new totalRequestsEntitiesRPTInputDto();
  getAllDataForReports: totalRequestsEntitiesRPTOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  requestTypeSelect2: SelectdropdownResultResults[] = [];
  loadingrequestType = false;
  requestTypesearchParams = new Select2RequestDto();
  selectedrequestTypeSelect2Obj: any = null;
  requestTypeSearchInput$ = new Subject<string>();

  constructor(
    private serviceRequestsReportsService: ServiceRequestsReportsService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [];
    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.requestTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchrequestTypeSelect2());

    this.fetchentitySelect2();
    this.fetchrequestTypeSelect2();
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


  onrequestTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.requestTypesearchParams.skip = 0;
    this.requestTypesearchParams.searchValue = search;
    this.requestTypeSelect2 = [];
    this.requestTypeSearchInput$.next(search);
  }

  loadMorerequestType(): void {
    this.requestTypesearchParams.skip++;
    this.fetchrequestTypeSelect2();
  }

  fetchrequestTypeSelect2(): void {
    this.loadingrequestType = true;
    const searchVal = this.requestTypesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.requestTypesearchParams.skip;
    this.searchSelect2Params.take = this.requestTypesearchParams.take;

    this.Select2Service.getRequestTypeReportSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.requestTypeSelect2 = [...this.requestTypeSelect2, ...newItems];
          this.loadingrequestType = false;
        },
        error: () => this.loadingrequestType = false
      });
  }

  onrequestTypeSelect2Change(selectedrequestType: any): void {
    if (selectedrequestType) {
      this.searchParams.requestTypeId = selectedrequestType.id;
      this.searchParams.requestType = selectedrequestType.text;
    } else {
      this.searchParams.requestTypeId = null;
      this.searchParams.requestType = null;
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

    this.serviceRequestsReportsService.gettotalServiceRequestsRptData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response.data || [];
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
    this.searchParams = new totalRequestsEntitiesRPTInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  private buildColumnDefs(): void {
    this.translate.get([
      'ServiceRequestsReportsResourceName.entity',
      'ServiceRequestsReportsResourceName.requestType',
      'ServiceRequestsReportsResourceName.postedRequestsNo',
      'ServiceRequestsReportsResourceName.rejectedRequestsNo',
    ]).subscribe(translations => {
      this.columnDefs = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['ServiceRequestsReportsResourceName.entity'], field: 'entity', width: 200 },
        { headerName: translations['ServiceRequestsReportsResourceName.requestType'], field: 'requestType', width: 200 },
        { headerName: translations['ServiceRequestsReportsResourceName.postedRequestsNo'], field: 'postedRequestsNo', width: 200 },
        { headerName: translations['ServiceRequestsReportsResourceName.rejectedRequestsNo'], field: 'rejectedRequestsNo', width: 200 },
      ];
    });
  }

  onTableAction(event: { action: string, row: any }) { }


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
    this.serviceRequestsReportsService.gettotalServiceRequestsRptData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.serviceRequestsReportsService.gettotalServiceRequestsRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ServiceRequestsReportsResourceName.totalRequestsEntitiesRPT_Title'),
                  reportTitle: this.translate.instant('ServiceRequestsReportsResourceName.totalRequestsEntitiesRPT_Title'),
                  fileName: `${this.translate.instant('ServiceRequestsReportsResourceName.totalRequestsEntitiesRPT_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.toDate'), value: this.searchParams.toDatestr },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.fromDate'), value: this.searchParams.fromDatestr },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.requestTypeId'), value: this.searchParams.requestType },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.entity'), key: 'entity' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.requestType'), key: 'requestType' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.postedRequestsNo'), key: 'postedRequestsNo' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.rejectedRequestsNo'), key: 'rejectedRequestsNo' },
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
    this.serviceRequestsReportsService.gettotalServiceRequestsRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.serviceRequestsReportsService.gettotalServiceRequestsRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ServiceRequestsReportsResourceName.totalRequestsEntitiesRPT_Title'),
                  reportTitle: this.translate.instant('ServiceRequestsReportsResourceName.totalRequestsEntitiesRPT_Title'),
                  fields: [
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.toDate'), value: this.searchParams.toDatestr },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.fromDate'), value: this.searchParams.fromDatestr },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.requestTypeId'), value: this.searchParams.requestType },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.entity'), key: 'entity' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.requestType'), key: 'requestType' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.postedRequestsNo'), key: 'postedRequestsNo' },
                    { label: this.translate.instant('ServiceRequestsReportsResourceName.rejectedRequestsNo'), key: 'rejectedRequestsNo' },
                  ],
                  data,
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: []
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
}

