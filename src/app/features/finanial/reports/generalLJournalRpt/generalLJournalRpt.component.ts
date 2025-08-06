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
import { generalLJournalRptInputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsInput.dto';
import { generalLJournalRptOutputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/Financial/Reports/FinancialReport.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-generalLJournalRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './generalLJournalRpt.component.html',
  styleUrls: ['./generalLJournalRpt.component.scss']
})

export class generalLJournalRptComponent {
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
  searchParams = new generalLJournalRptInputDto();
  getAllDataForReports: generalLJournalRptOutputDto[] = [];

  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  deptSelect2: SelectdropdownResultResults[] = [];
  loadingdept = false;
  deptsearchParams = new Select2RequestDto();
  selecteddeptSelect2Obj: any = null;
  deptSearchInput$ = new Subject<string>();

  branchSelect2: SelectdropdownResultResults[] = [];
  loadingbranch = false;
  branchsearchParams = new Select2RequestDto();
  selectedbranchSelect2Obj: any = null;
  branchSearchInput$ = new Subject<string>();

  countrySelect2: SelectdropdownResultResults[] = [];
  loadingcountry = false;
  countrysearchParams = new Select2RequestDto();
  selectedcountrySelect2Obj: any = null;
  countrySearchInput$ = new Subject<string>();

  fromAccSelect2: SelectdropdownResultResults[] = [];
  loadingfromAcc = false;
  fromAccsearchParams = new Select2RequestDto();
  selectedfromAccSelect2Obj: any = null;
  fromAccSearchInput$ = new Subject<string>();

  toAccSelect2: SelectdropdownResultResults[] = [];
  loadingtoAcc = false;
  toAccsearchParams = new Select2RequestDto();
  selectedtoAccSelect2Obj: any = null;
  toAccSearchInput$ = new Subject<string>();
  constructor(
    private financialReportService: FinancialReportService,
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

    this.countrySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcountrySelect2());

    this.branchSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbranchSelect2());

    this.deptSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchdeptSelect2());

    this.fromAccSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchfromAccSelect2());

    this.toAccSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchtoAccSelect2());


    this.fetchentitySelect2();
    this.fetchcountrySelect2();
    this.fetchbranchSelect2();
    this.fetchdeptSelect2();
    this.fetchfromAccSelect2();
    this.fetchtoAccSelect2();
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


  ondeptSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.deptsearchParams.skip = 0;
    this.deptsearchParams.searchValue = search;
    this.deptSelect2 = [];
    this.deptSearchInput$.next(search);
  }

  loadMoredept(): void {
    this.deptsearchParams.skip++;
    this.fetchdeptSelect2();
  }

  fetchdeptSelect2(): void {
    this.loadingdept = true;
    const searchVal = this.deptsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.deptsearchParams.skip;
    this.searchSelect2Params.take = this.deptsearchParams.take;

    this.Select2Service.getDeptSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.deptSelect2 = [...this.deptSelect2, ...newItems];
          this.loadingdept = false;
        },
        error: () => this.loadingdept = false
      });
  }

  ondeptSelect2Change(selecteddept: any): void {
    if (selecteddept) {
      this.searchParams.att3 = selecteddept.id;
      this.searchParams.att3str = selecteddept.text;
    } else {
      this.searchParams.att3 = null;
      this.searchParams.att3str = null;
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

    this.Select2Service.getBranchSelect2(this.searchSelect2Params)
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
      this.searchParams.att2 = selectedbranch.id;
      this.searchParams.att2str = selectedbranch.text;
    } else {
      this.searchParams.att2 = null;
      this.searchParams.att2str = null;
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
      this.searchParams.att1 = selectedcountry.id;
      this.searchParams.att1str = selectedcountry.text;
    } else {
      this.searchParams.att1 = null;
      this.searchParams.att1str = null;
    }
  }


  onfromAccSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.fromAccsearchParams.skip = 0;
    this.fromAccsearchParams.searchValue = search;
    this.fromAccSelect2 = [];
    this.fromAccSearchInput$.next(search);
  }

  loadMorefromAcc(): void {
    this.fromAccsearchParams.skip++;
    this.fetchfromAccSelect2();
  }

  fetchfromAccSelect2(): void {
    this.loadingfromAcc = true;
    const searchVal = this.fromAccsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.fromAccsearchParams.skip;
    this.searchSelect2Params.take = this.fromAccsearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.fromAccSelect2 = [...this.fromAccSelect2, ...newItems];
          this.loadingfromAcc = false;
        },
        error: () => this.loadingfromAcc = false
      });
  }

  onfromAccSelect2Change(selectedfromAcc: any): void {
    if (selectedfromAcc) {
      this.searchParams.att5From = selectedfromAcc.id;
      this.searchParams.att5Fromstr = selectedfromAcc.text;
    } else {
      this.searchParams.att5From = null;
      this.searchParams.att5Fromstr = null;
    }
  }


  ontoAccSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.toAccsearchParams.skip = 0;
    this.toAccsearchParams.searchValue = search;
    this.toAccSelect2 = [];
    this.toAccSearchInput$.next(search);
  }

  loadMoretoAcc(): void {
    this.toAccsearchParams.skip++;
    this.fetchtoAccSelect2();
  }

  fetchtoAccSelect2(): void {
    this.loadingtoAcc = true;
    const searchVal = this.toAccsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.toAccsearchParams.skip;
    this.searchSelect2Params.take = this.toAccsearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.toAccSelect2 = [...this.toAccSelect2, ...newItems];
          this.loadingtoAcc = false;
        },
        error: () => this.loadingtoAcc = false
      });
  }

  ontoAccSelect2Change(selectedtoAcc: any): void {
    if (selectedtoAcc) {
      this.searchParams.att5To = selectedtoAcc.id;
      this.searchParams.att5Tostr = selectedtoAcc.text;
    } else {
      this.searchParams.att5To = null;
      this.searchParams.att5Tostr = null;
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

    this.financialReportService.getgeneralLJournalRptData(this.searchParams)
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
    this.searchParams = new generalLJournalRptInputDto();
    this.getAllDataForReports = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
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
      { headerName: this.translate.instant('FinancialReportResourceName.accountT_CODE'), field: 'accountT_CODE', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.accounT_NAME'), field: 'accounT_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_NAME'), field: 'jE_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_DATE'), field: 'jE_DATEstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), field: 'jE_SOURCE_DESC', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.notes'), field: 'notes', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), field: 'debiT_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), field: 'crediT_AMOUNTstr', width: 200 },
    ];
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
    this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('FinancialReportResourceName.country'), value: this.searchParams.att1str },
                    { label: this.translate.instant('FinancialReportResourceName.branch'), value: this.searchParams.att2str },
                    { label: this.translate.instant('FinancialReportResourceName.department'), value: this.searchParams.att3str },
                    { label: this.translate.instant('FinancialReportResourceName.fromAccNo'), value: this.searchParams.att5Fromstr },
                    { label: this.translate.instant('FinancialReportResourceName.toAccNo'), value: this.searchParams.att5Tostr },
                    { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
                    { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accountT_CODE'), key: 'accountT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
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
    this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('FinancialReportResourceName.country'), value: this.searchParams.att1str },
                    { label: this.translate.instant('FinancialReportResourceName.branch'), value: this.searchParams.att2str },
                    { label: this.translate.instant('FinancialReportResourceName.department'), value: this.searchParams.att3str },
                    { label: this.translate.instant('FinancialReportResourceName.fromAccNo'), value: this.searchParams.att5Fromstr },
                    { label: this.translate.instant('FinancialReportResourceName.toAccNo'), value: this.searchParams.att5Tostr },
                    { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
                    { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accountT_CODE'), key: 'accountT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNT', 'crediT_AMOUNT']
                };

                this.openStandardReportService.openStandardReportPDF(reportConfig);
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

