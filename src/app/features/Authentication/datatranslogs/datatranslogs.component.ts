import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTransLogsService } from '../../../core/services/Authentication/datatranslogs.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import {
  GetDataTransLogsDto,
  GetDataTransLogsParameters,
  GetDataTransLogsResponse,
} from '../../../core/dtos/Authentication/DataTransLogs/datatranslogs.dto';
import { ColDef } from 'ag-grid-community';
import { PagedDto, Pagination } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-datatranslogs',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GenericDataTableComponent
  ],
  templateUrl: './datatranslogs.component.html',
  styleUrl: './datatranslogs.component.scss',
})
export class DataTransLogsComponent implements OnInit, OnDestroy {
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;
  
  dataTransLogs: GetDataTransLogsDto[] = [];
  loadgridData: GetDataTransLogsDto[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pages: number[] = [];
  isLoading: boolean = false;
  Math = Math;
  environment = environment;

  // Filter properties
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  // Table configuration
  headers: string[] = [
    'dataTransLogs.headers.serial',
    'dataTransLogs.headers.entity',
    'dataTransLogs.headers.operationDate',
    'dataTransLogs.headers.startTime',
    'dataTransLogs.headers.endTime',
    'dataTransLogs.headers.duration',
    'dataTransLogs.headers.status',
  ];
  headerKeys: string[] = [
    'serial',
    'entitY_NAME',
    'execute_Date',
    'start_Date',
    'end_Date',
    'timePeriod',
    'status',
  ];
  showAction: boolean = false;
  actionTypes: string[] = [];

  searchParams: GetDataTransLogsParameters = {
    skip: 0,
    take: 10,
    DateFrom: undefined,
    DateTo: undefined,
    OrderByValue: 'Execute_Date',
  };
  translatedHeaders: string[] = [];
  pagination = new Pagination();

  columnDefs: ColDef[] = [];
  gridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];
  private langChangeSubscription: any;

  constructor(
    private dataTransLogsService: DataTransLogsService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    this.buildColumnDefs();
    
    // Subscribe to language changes to rebuild column definitions with updated translations
    this.langChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.buildColumnDefs();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
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

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.searchParams.DateFrom = this.dateFrom;
    this.searchParams.DateTo = this.dateTo;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.spinnerService.show();
    this.dataTransLogsService.getAllDataTransLogs(cleanedFilters).subscribe(
      (response: GetDataTransLogsResponse) => {
        this.loadgridData = response.data;
        this.pagination.totalCount = response.totalCount;
        this.spinnerService.hide();
      },
      (error) => {
        this.toastr.error(
          this.translate.instant('ERROR.FETCH_DATA_TRANS_LOGS'),
          this.translate.instant('TOAST.TITLE.ERROR')
        );
        this.spinnerService.hide();
      }
    );
  }

  onSearch(): void {
    this.searchParams.DateFrom = this.dateFrom;
    this.searchParams.DateTo = this.dateTo;
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  clear(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.searchParams.DateFrom = undefined;
    this.searchParams.DateTo = undefined;
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  // Helper methods
  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('ar-SA');
    } catch (error) {
      return '-';
    }
  }

  formatTime(time: string | null): string {
    if (!time) return '-';
    return time;
  }

  getStatusBadgeClass(status: string): string {
    // Use the actual status values from backend since they come in Arabic
    switch (status) {
      case 'تمت العمليه بنجاح':
        return 'badge status-approved';
      case 'حدث خطأ':
        return 'badge status-rejected';
      case 'قيد العمل':
        return 'badge status-waiting';
      default:
        return 'badge status-inactive';
    }
  }

  getTranslatedStatus(status: string): string {
    // Translate Arabic status values to current system language
    switch (status) {
      case 'تمت العمليه بنجاح':
        return this.translate.instant('dataTransLogs.status.success');
      case 'حدث خطأ':
        return this.translate.instant('dataTransLogs.status.error');
      case 'قيد العمل':
        return this.translate.instant('dataTransLogs.status.inProgress');
      default:
        return status || '-';
    }
  }

  getStatusText(status: string): string {
    return status || '-';
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
      { 
        headerName: this.translate.instant('navbarMenu.entity'), 
        field: 'entitY_NAME', 
        width: 250,
        cellRenderer: (params: any) => {
          const status = params.data?.status;
          const isError = status === 'حدث خطأ';
          return `<span class="${isError ? 'text-danger' : ''}">${params.value || '-'}</span>`;
        }
      },
      { 
        headerName: this.translate.instant('dataTransLogs.headers.operationDate'), 
        field: 'execute_Date', 
        width: 120,
        cellRenderer: (params: any) => {
          return this.formatDate(params.value);
        }
      },
      { 
        headerName: this.translate.instant('dataTransLogs.headers.startTime'), 
        field: 'start_Date', 
        width: 120,
        cellRenderer: (params: any) => {
          const status = params.data?.status;
          const isError = status === 'حدث خطأ';
          return `<span class="${isError ? 'text-danger' : ''}">${this.formatTime(params.value)}</span>`;
        }
      },
      { 
        headerName: this.translate.instant('dataTransLogs.headers.endTime'), 
        field: 'end_Date', 
        width: 120,
        cellRenderer: (params: any) => {
          return this.formatTime(params.value);
        }
      },
      { 
        headerName: this.translate.instant('dataTransLogs.headers.duration'), 
        field: 'timePeriod', 
        width: 100,
        cellRenderer: (params: any) => {
          return params.value || '-';
        }
      },
      {
        field: 'status',
        headerName: this.translate.instant('dataTransLogs.headers.status'),
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: any) => {
          const status = params.value;
          const badgeClass = this.getStatusBadgeClass(status);
          const translatedStatus = this.getTranslatedStatus(status);
          return `<span class="${badgeClass}">${translatedStatus}</span>`;
        },
      }
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    // No actions needed for this component
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
}
