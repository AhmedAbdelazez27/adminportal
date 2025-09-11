import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig, Select2RequestDto } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { SocialCasesReportsService } from '../../../../core/services/socialcases/reports/socialcasesreports.service';
import { ordersListRptOutputDto } from '../../../../core/dtos/socialcases/reports/socialcasesReporstOutput.dto';
import { ordersListRptInputDto } from '../../../../core/dtos/socialcases/reports/socialcasesReporstInput.dto';

@Component({
  selector: 'app-orderListBranchRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './orderListBranchRpt.component.html',
  styleUrls: ['./orderListBranchRpt.component.scss']
})

export class orderListBranchRptComponent {
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
  searchParams = new ordersListRptInputDto();
  getAllDataForReports: ordersListRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  caseIdSelect2: SelectdropdownResultResults[] = [];
  loadingcaseId = false;
  caseIdsearchParams = new Select2RequestDto();
  selectedcaseIdSelect2Obj: any = null;
  caseIdSearchInput$ = new Subject<string>();


  branchSelect2: SelectdropdownResultResults[] = [];
  loadingbranch = false;
  branchsearchParams = new Select2RequestDto();
  selectedbranchSelect2Obj: any = null;
  branchSearchInput$ = new Subject<string>();


  citySelect2: SelectdropdownResultResults[] = [];
  loadingcity = false;
  citysearchParams = new Select2RequestDto();
  selectedcitySelect2Obj: any = null;
  citySearchInput$ = new Subject<string>();
  constructor(
    private socialCasesReportsService: SocialCasesReportsService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service
  ) {

  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.caseIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseIdSelect2());

    this.branchSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbranchSelect2());

    this.citySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcitySelect2());

    this.fetchentitySelect2();
    this.fetchcaseIdSelect2();
    this.fetchbranchSelect2();
    this.fetchcitySelect2();
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

  oncaseIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.caseIdsearchParams.skip = 0;
    this.caseIdsearchParams.searchValue = search;
    this.caseIdSelect2 = [];
    this.caseIdSearchInput$.next(search);
  }

  loadMorecaseId(): void {
    this.caseIdsearchParams.skip++;
    this.fetchcaseIdSelect2();
  }

  fetchcaseIdSelect2(): void {
    this.loadingcaseId = true;
    const searchVal = this.caseIdsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.caseIdsearchParams.skip;
    this.searchSelect2Params.take = this.caseIdsearchParams.take;

    this.Select2Service.getSPCasesEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.caseIdSelect2 = [...this.caseIdSelect2, ...newItems];
          this.loadingcaseId = false;
        },
        error: () => this.loadingcaseId = false
      });
  }

  oncaseIdSelect2Change(selectedcaseId: any): void {
    if (selectedcaseId) {
      this.searchParams.caseId = selectedcaseId.id;
      this.searchParams.caseName = selectedcaseId.text;
    } else {
      this.searchParams.caseId = null;
      this.searchParams.caseName = null;
    }
  }

  onbranchSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.branchsearchParams.skip = 0;
    this.branchsearchParams.searchValue = search;
    this.branchSelect2 = [];
    this.branchSearchInput$.next(search);
  }

  loadMorebranch(): void {
    this.branchsearchParams.skip++;
    this.fetchbranchSelect2();
  }

  fetchbranchSelect2(): void {
    this.loadingbranch = true;
    const searchVal = this.branchsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.branchsearchParams.skip;
    this.searchSelect2Params.take = this.branchsearchParams.take;

    this.Select2Service.getCasesBranchSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.branchSelect2 = [...this.branchSelect2, ...newItems];
          this.loadingbranch = false;
        },
        error: () => this.loadingbranch = false
      });
  }

  onbranchSelect2Change(selectedbranch: any): void {
    if (selectedbranch) {
      this.searchParams.brancheCode = selectedbranch.id;
      this.searchParams.brancheName = selectedbranch.text;
    } else {
      this.searchParams.brancheCode = null;
      this.searchParams.brancheName = null;
    }
  }

  oncitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.citysearchParams.skip = 0;
    this.citysearchParams.searchValue = search;
    this.citySelect2 = [];
    this.citySearchInput$.next(search);
  }

  loadMorecity(): void {
    this.citysearchParams.skip++;
    this.fetchcitySelect2();
  }

  fetchcitySelect2(): void {
    this.loadingcity = true;
    const searchVal = this.citysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.citysearchParams.skip;
    this.searchSelect2Params.take = this.citysearchParams.take;

    this.Select2Service.getCitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.citySelect2 = [...this.citySelect2, ...newItems];
          this.loadingcity = false;
        },
        error: () => this.loadingcity = false
      });
  }

  oncitySelect2Change(selectedcity: any): void {
    if (selectedcity) {
      this.searchParams.cityId = selectedcity.id;
      this.searchParams.cityDesc = selectedcity.text;
    } else {
      this.searchParams.cityId = null;
      this.searchParams.cityDesc = null;
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
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.socialCasesReportsService.getordersListRptData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          console.log("response", response);
          this.getAllDataForReports = response?.data || [];
          this.getAllDataForReports.forEach((c) => {
            c.aiD_REQUEST_DATEstr = this.openStandardReportService.formatDate(c.aiD_REQUEST_DATE);
          });
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
    this.searchParams = new ordersListRptInputDto();
    this.getAllDataForReports = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  public buildColumnDefs(): void {
    this.translate.get([
      'SocialCaseReportsResourceName.referencenumber',
      'SocialCaseReportsResourceName.aiD_REQUEST_DATE',
      'SocialCaseReportsResourceName.requesT_TYPE_DESC',
      'SocialCaseReportsResourceName.namE_AR',
      'SocialCaseReportsResourceName.casE_ID_NUMBER',
      'SocialCaseReportsResourceName.familY_PERS_NO',
      'SocialCaseReportsResourceName.toT_INCOME',
      'SocialCaseReportsResourceName.toT_DUTIES',
      'SocialCaseReportsResourceName.statuS_DESC',
      'SocialCaseReportsResourceName.brancH_DESC',
    ]).subscribe(translations => {
      this.columnDefs = [
        { headerName: translations['SocialCaseReportsResourceName.referencenumber'], field: 'referencenumber', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.aiD_REQUEST_DATE'], field: 'aiD_REQUEST_DATEstr', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.requesT_TYPE_DESC'], field: 'requesT_TYPE_DESC', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.namE_AR'], field: 'namE_AR', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.casE_ID_NUMBER'], field: 'casE_ID_NUMBER', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.familY_PERS_NO'], field: 'familY_PERS_NO', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.toT_INCOME'], field: 'toT_INCOME', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.toT_DUTIES'], field: 'toT_DUTIES', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.statuS_DESC'], field: 'statuscodE_DESC', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.brancH_DESC'], field: 'brancH_DESC', width: 200 },
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
    this.socialCasesReportsService.getordersListRptData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.socialCasesReportsService.getordersListRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SocialCaseReportsResourceName.orderListBranchRptTitle'),
                  reportTitle: this.translate.instant('SocialCaseReportsResourceName.orderListBranchRptTitle'),
                  fileName: `${this.translate.instant('SocialCaseReportsResourceName.orderListBranchRptTitle')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('SocialCaseReportsResourceName.entityId'), value: this.searchParams.entityName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.type'), value: this.searchParams.caseName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.collectorName'), value: this.searchParams.brancheName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.fromNo'), value: this.searchParams.cityDesc },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toDate'), value: this.searchParams.toDatestr },
                    { label: this.translate.instant('SocialCaseReportsResourceName.fromDate'), value: this.searchParams.fromDatestr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.referencenumber'), key: 'referencenumber' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.aiD_REQUEST_DATE'), key: 'aiD_REQUEST_DATEstr' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.requesT_TYPE_DESC'), key: 'requesT_TYPE_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.namE_AR'), key: 'namE_AR' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.casE_ID_NUMBER'), key: 'casE_ID_NUMBER' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.familY_PERS_NO'), key: 'familY_PERS_NO' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toT_INCOME'), key: 'toT_INCOME' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toT_DUTIES'), key: 'toT_DUTIES' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.statuS_DESC'), key: 'statuscodE_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.brancH_DESC'), key: 'brancH_DESC' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['toT_INCOME', 'toT_DUTIES']
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
        },

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
    this.socialCasesReportsService.getordersListRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.socialCasesReportsService.getordersListRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SocialCaseReportsResourceName.orderListBranchRpt_Title'),
                  reportTitle: this.translate.instant('SocialCaseReportsResourceName.orderListBranchRpt_Title'),
                  fields: [
                    { label: this.translate.instant('SocialCaseReportsResourceName.entityId'), value: this.searchParams.entityName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.type'), value: this.searchParams.caseName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.collectorName'), value: this.searchParams.brancheName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.fromNo'), value: this.searchParams.cityDesc },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toDate'), value: this.searchParams.toDatestr },
                    { label: this.translate.instant('SocialCaseReportsResourceName.fromDate'), value: this.searchParams.fromDatestr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.referencenumber'), key: 'referencenumber' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.aiD_REQUEST_DATE'), key: 'aiD_REQUEST_DATEstr' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.requesT_TYPE_DESC'), key: 'requesT_TYPE_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.namE_AR'), key: 'namE_AR' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.casE_ID_NUMBER'), key: 'casE_ID_NUMBER' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.familY_PERS_NO'), key: 'familY_PERS_NO' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toT_INCOME'), key: 'toT_INCOME' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toT_DUTIES'), key: 'toT_DUTIES' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.statuS_DESC'), key: 'statuscodE_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.brancH_DESC'), key: 'brancH_DESC' },
                  ],
                  data,
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['toT_INCOME', 'toT_DUTIES']
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

