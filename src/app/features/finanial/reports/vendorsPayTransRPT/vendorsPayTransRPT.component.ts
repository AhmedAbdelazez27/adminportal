import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { vendorsPayTransRPTInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { vendorsPayTransRPTOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-vendorsPayTransRPT',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule,GenericDataTableComponent],
  templateUrl: './vendorsPayTransRPT.component.html',
  styleUrls: ['./vendorsPayTransRPT.component.scss']
})

export class vendorsPayTransRPTComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];
  vendorIdSelect2: SelectdropdownResultResults[] = [];

  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new vendorsPayTransRPTInputDto();
  getAllDataForReports: vendorsPayTransRPTOutputDto[] = [];

  loading = false;
  selectedentitySelect2Obj: any = null
  selectedvendorIdSelect2Obj: any = null
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
    this.fetchentitySelect2();
    this.fetchvendorIdSelect2();
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'fas fa-eye', action: 'onViewInfo' },
        { label: this.translate.instant('Common.Action'), icon: 'fas fa-edit', action: 'edit' },
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchentitySelect2(): void {
    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.entitySelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Entity.', 'Error');
        }
      });
  }

  fetchvendorIdSelect2(): void {
    this.Select2Service.getVendorSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.vendorIdSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Vendor.', 'Error');
        }
      });
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    if (!this.searchParams.entityId) return;
    this.spinnerService.show();
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
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

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.entityId = selectedVendor.id;
      this.searchParams.entityIdstr = selectedVendor.text;
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
    //backend support search, add to searchParams and fetch
    // this.searchParams.searchText = text;
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
                this.toastr.error('Failed to export Excel');
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error('Failed to retrieve data count');
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
              },
              error: () => {
                this.spinnerService.hide();
                this.toastr.error('Failed to export Excel');
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error('Failed to retrieve data count');
        },

      });
  }

  private buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', width: 40, colId: '#' },
      { headerName: this.translate.instant('FinancialReportResourceName.vendorNumber'), field: 'vendoR_NUMBER', width: 150 },
      { headerName: this.translate.instant('FinancialReportResourceName.vendorName'), field: 'vendoR_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.workTel'), field: 'worK_TEL', width: 100 },
      { headerName: this.translate.instant('FinancialReportResourceName.trxType'), field: 'trX_TYPE', width: 100 },
      { headerName: this.translate.instant('FinancialReportResourceName.DebitAmount'), field: 'debiT_AMOUNT' },
      { headerName: this.translate.instant('FinancialReportResourceName.creditAmount'), field: 'crediT_AMOUNT' },
      { headerName: this.translate.instant('FinancialReportResourceName.DebitAmount'), field: 'debiT_AMOUNTstr' },
      { headerName: this.translate.instant('FinancialReportResourceName.creditAmount'), field: 'crediT_AMOUNTstr' },
    ];
    // Build the columnHeaderMap for the popup
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

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      if (this.genericTable && this.genericTable.onViewInfo) {
        this.genericTable.onViewInfo(event.row);
      }
    }
     if (event.action === 'edit') {
      console.log('edit action')
    }
  }
}

