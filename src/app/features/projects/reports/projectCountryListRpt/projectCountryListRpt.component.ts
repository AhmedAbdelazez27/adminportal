import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { projectListRptInputDto } from '../../../../core/dtos/projects/reports/projectReportInput.dto';
import { projectListRptOutputDto } from '../../../../core/dtos/projects/reports/projectReportOutput.dto';
import { ProjectReportservice } from '../../../../core/services/projects/reports/projectReport.service';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';

@Component({
  selector: 'app-projectCountryListRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './projectCountryListRpt.component.html',
  styleUrls: ['./projectCountryListRpt.component.scss']
})

export class projectCountryListRptComponent {
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
  searchParams = new projectListRptInputDto();
  getAllDataForReports: projectListRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  projectTypeSelect2: SelectdropdownResultResults[] = [];
  loadingprojectType = false;
  projectTypesearchParams = new Select2RequestDto();
  selectedprojectTypeSelect2Obj: any = null;
  projectTypeSearchInput$ = new Subject<string>();

  countrySelect2: SelectdropdownResultResults[] = [];
  loadingcountry = false;
  countrysearchParams = new Select2RequestDto();
  selectedcountrySelect2Obj: any = null;
  countrySearchInput$ = new Subject<string>();
  constructor(
    private projectReportservice: ProjectReportservice,
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

    this.projectTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchprojectTypeSelect2());

    this.countrySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcountrySelect2());

    this.fetchentitySelect2();
    this.fetchcountrySelect2();
    this.fetchprojectTypeSelect2();
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
      this.searchParams.entityName = selectedentity.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityName = null;
    }
  }


  onprojectTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.projectTypesearchParams.skip = 0;
    this.projectTypesearchParams.searchValue = search;
    this.projectTypeSelect2 = [];
    this.projectTypeSearchInput$.next(search);
  }

  loadMoreprojectType(): void {
    this.projectTypesearchParams.skip++;
    this.fetchprojectTypeSelect2();
  }

  fetchprojectTypeSelect2(): void {
    this.loadingprojectType = true;
    const searchVal = this.projectTypesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.projectTypesearchParams.skip;
    this.searchSelect2Params.take = this.projectTypesearchParams.take;

    this.Select2Service.getScProjectTypeSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.projectTypeSelect2 = [...this.projectTypeSelect2, ...newItems];
          this.loadingprojectType = false;
        },
        error: () => this.loadingprojectType = false
      });
  }

  onprojectTypeSelect2Change(selectedprojectType: any): void {
    if (selectedprojectType) {
      this.searchParams.type = selectedprojectType.id;
      this.searchParams.typestr = selectedprojectType.text;
    } else {
      this.searchParams.type = null;
      this.searchParams.typestr = null;
    }
  }


  oncountrySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.countrysearchParams.skip = 0;
    this.countrysearchParams.searchValue = search;
    this.countrySelect2 = [];
    this.countrySearchInput$.next(search);
  }

  loadMorecountry(): void {
    this.countrysearchParams.skip++;
    this.fetchcountrySelect2();
  }

  fetchcountrySelect2(): void {
    this.loadingcountry = true;
    const searchVal = this.countrysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.countrysearchParams.skip;
    this.searchSelect2Params.take = this.countrysearchParams.take;

    this.Select2Service.getCountrySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.countrySelect2 = [...this.countrySelect2, ...newItems];
          this.loadingcountry = false;
        },
        error: () => this.loadingcountry = false
      });
  }

  oncountrySelect2Change(selectedcountry: any): void {
    if (selectedcountry) {
      this.searchParams.countryCode = selectedcountry.id;
      this.searchParams.countryName = selectedcountry.text;
    } else {
      this.searchParams.countryCode = null;
      this.searchParams.countryName = null;
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

    this.projectReportservice.getprojectListRptData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response?.data || [];
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
    this.searchParams = new projectListRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  private buildColumnDefs(): void {
    this.translate.get([
      'ProjectReportResourceName.projecT_NAME',
      'ProjectReportResourceName.projecT_NUMBER',
      'ProjectReportResourceName.applicatioN_DATE',
      'ProjectReportResourceName.countrY_code',
      'ProjectReportResourceName.cost',
      'ProjectReportResourceName.currancY_NAME',
      'ProjectReportResourceName.local_cost',
      'ProjectReportResourceName.misC_RECEIPT_AMOUNT',
      'ProjectReportResourceName.statuS_DESC',
    ]).subscribe(translations => {
      this.columnDefs = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['ProjectReportResourceName.projecT_NAME'], field: 'projecT_NAME', width: 200 },
        { headerName: translations['ProjectReportResourceName.projecT_NUMBER'], field: 'projecT_NUMBER', width: 200 },
        { headerName: translations['ProjectReportResourceName.applicatioN_DATE'], field: 'applicatioN_DATEstr', width: 200 },
        { headerName: translations['ProjectReportResourceName.countrY_code'], field: 'countrY_code', width: 200 },
        { headerName: translations['ProjectReportResourceName.cost'], field: 'coststr', width: 200 },
        { headerName: translations['ProjectReportResourceName.currancY_NAME'], field: 'currancY_NAME', width: 200 },
        { headerName: translations['ProjectReportResourceName.local_cost'], field: 'local_coststr', width: 200 },
        { headerName: translations['ProjectReportResourceName.misC_RECEIPT_AMOUNT'], field: 'misC_RECEIPT_AMOUNTstr', width: 200 },
        { headerName: translations['ProjectReportResourceName.statuS_DESC'], field: 'statuS_DESC', width: 200 },
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
    this.projectReportservice.getprojectListRptData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || 0;

          this.projectReportservice.getprojectListRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ProjectReportResourceName.projectCountryListRpt_Title'),
                  reportTitle: this.translate.instant('ProjectReportResourceName.projectCountryListRpt_Title'),
                  fileName: `${this.translate.instant('ProjectReportResourceName.projectCountryListRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('ProjectReportResourceName.entityId'), value: this.searchParams.entityName },
                    { label: this.translate.instant('ProjectReportResourceName.countryName'), value: this.searchParams.countryName },
                    { label: this.translate.instant('ProjectReportResourceName.type'), value: this.searchParams.typestr },
                    { label: this.translate.instant('ProjectReportResourceName.toDate'), value: this.searchParams.toDatestr },
                    { label: this.translate.instant('ProjectReportResourceName.fromDate'), value: this.searchParams.fromDatestr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ProjectReportResourceName.projecT_NAME'), key: 'projecT_NAME' },
                    { label: this.translate.instant('ProjectReportResourceName.projecT_NUMBER'), key: 'projecT_NUMBER' },
                    { label: this.translate.instant('ProjectReportResourceName.applicatioN_DATE'), key: 'applicatioN_DATEstr' },
                    { label: this.translate.instant('ProjectReportResourceName.countrY_code'), key: 'countrY_code' },
                    { label: this.translate.instant('ProjectReportResourceName.cost'), key: 'coststr' },
                    { label: this.translate.instant('ProjectReportResourceName.currancY_NAME'), key: 'currancY_NAME' },
                    { label: this.translate.instant('ProjectReportResourceName.local_cost'), key: 'local_coststr' },
                    { label: this.translate.instant('ProjectReportResourceName.misC_RECEIPT_AMOUNT'), key: 'misC_RECEIPT_AMOUNTstr' },
                    { label: this.translate.instant('ProjectReportResourceName.statuS_DESC'), key: 'statuS_DESC' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['local_coststr', 'misC_RECEIPT_AMOUNTstr', 'local_coststr']
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
    this.projectReportservice.getprojectListRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.projectReportservice.getprojectListRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ProjectReportResourceName.projectListRpt_Title'),
                  reportTitle: this.translate.instant('ProjectReportResourceName.projectListRpt_Title'),
                  fields: [
                    { label: this.translate.instant('ProjectReportResourceName.entityId'), value: this.searchParams.entityName },
                    { label: this.translate.instant('ProjectReportResourceName.countryName'), value: this.searchParams.countryName },
                    { label: this.translate.instant('ProjectReportResourceName.type'), value: this.searchParams.typestr },
                    { label: this.translate.instant('ProjectReportResourceName.toDate'), value: this.searchParams.toDatestr },
                    { label: this.translate.instant('ProjectReportResourceName.fromDate'), value: this.searchParams.fromDatestr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ProjectReportResourceName.projecT_NAME'), key: 'projecT_NAME' },
                    { label: this.translate.instant('ProjectReportResourceName.projecT_NUMBER'), key: 'projecT_NUMBER' },
                    { label: this.translate.instant('ProjectReportResourceName.applicatioN_DATE'), key: 'applicatioN_DATEstr' },
                    { label: this.translate.instant('ProjectReportResourceName.countrY_code'), key: 'countrY_code' },
                    { label: this.translate.instant('ProjectReportResourceName.cost'), key: 'coststr' },
                    { label: this.translate.instant('ProjectReportResourceName.currancY_NAME'), key: 'currancY_NAME' },
                    { label: this.translate.instant('ProjectReportResourceName.local_cost'), key: 'local_coststr' },
                    { label: this.translate.instant('ProjectReportResourceName.misC_RECEIPT_AMOUNT'), key: 'misC_RECEIPT_AMOUNTstr' },
                    { label: this.translate.instant('ProjectReportResourceName.statuS_DESC'), key: 'statuS_DESC' },
                  ],
                  data,
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['local_coststr', 'misC_RECEIPT_AMOUNTstr', 'local_coststr']
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

