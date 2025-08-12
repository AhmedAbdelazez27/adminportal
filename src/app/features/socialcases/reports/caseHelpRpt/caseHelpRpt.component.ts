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
import { caseHelpRptInputDto } from '../../../../core/dtos/socialcases/reports/socialcasesReporstInput.dto';
import { caseHelpRptOutputDto } from '../../../../core/dtos/socialcases/reports/socialcasesReporstOutput.dto';
import { SocialCasesReportsService } from '../../../../core/services/socialcases/reports/socialcasesreports.service';

@Component({
  selector: 'app-caseHelpRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './caseHelpRpt.component.html',
  styleUrls: ['./caseHelpRpt.component.scss']
})

export class caseHelpRptComponent {
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
  searchParams = new caseHelpRptInputDto();
  getAllDataForReports: caseHelpRptOutputDto[] = [];

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

  constructor(
    private socialCasesReportsService: SocialCasesReportsService,
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

    this.caseIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseIdSelect2());

    this.fetchentitySelect2();
    this.fetchcaseIdSelect2();
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

    this.socialCasesReportsService.getcaseHelpRptData(this.searchParams)
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
    this.searchParams = new caseHelpRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  private buildColumnDefs(): void {
    this.translate.get([
      'SocialCaseReportsResourceName.namE_AR',
      'SocialCaseReportsResourceName.casE_ID_NUMBER',
      'SocialCaseReportsResourceName.wifE_ID',
      'SocialCaseReportsResourceName.sourcE_DESC',
      'SocialCaseReportsResourceName.entitY_NAME',
      'SocialCaseReportsResourceName.comitY_DATE',
      'SocialCaseReportsResourceName.aiD_TYPE',
      'SocialCaseReportsResourceName.statuS_DESC',
    ]).subscribe(translations => {
      this.columnDefs = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['SocialCaseReportsResourceName.namE_AR'], field: 'namE_AR', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.casE_ID_NUMBER'], field: 'casE_ID_NUMBER', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.wifE_ID'], field: 'wifE_ID', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.sourcE_DESC'], field: 'sourcE_DESC', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.entitY_NAME'], field: 'entitY_NAME', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.comitY_DATE'], field: 'comitY_DATEstr', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.aiD_TYPE'], field: 'aiD_TYPE', width: 200 },
        { headerName: translations['SocialCaseReportsResourceName.statuS_DESC'], field: 'statuS_DESC', width: 200 },
      ];
    });
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      if (this.genericTable && this.genericTable.onViewInfo) {
        this.genericTable.onViewInfo(event.row);
      }
    }
    if (event.action === 'edit') {
    }
  }


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
    this.socialCasesReportsService.getcaseHelpRptData(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.socialCasesReportsService.getcaseHelpRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SocialCaseReportsResourceName.caseHelpRptTitle'),
                  reportTitle: this.translate.instant('SocialCaseReportsResourceName.caseHelpRptTitle'),
                  fileName: `${this.translate.instant('SocialCaseReportsResourceName.caseHelpRptTitle')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('SocialCaseReportsResourceName.entityId'), value: this.searchParams.entityName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.collectorName'), value: this.searchParams.caseName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.type'), value: this.searchParams.idNumber },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.namE_AR'), key: 'namE_AR' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.casE_ID_NUMBER'), key: 'casE_ID_NUMBER' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.wifE_ID'), key: 'wifE_ID' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.sourcE_DESC'), key: 'sourcE_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.comitY_DATE'), key: 'comitY_DATEstr' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.aiD_TYPE'), key: 'aiD_TYPE' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.statuS_DESC'), key: 'statuS_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toT_DentitY_NAMEUTIES'), key: 'entitY_NAME' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['toT_INCOMEstr', 'toT_DUTIESstr']
                };
                this.spinnerService.hide();
                this.openStandardReportService.openStandardReportExcel(reportConfig);
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
    this.socialCasesReportsService.getcaseHelpRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.socialCasesReportsService.getcaseHelpRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SocialCaseReportsResourceName.caseHelpRpt_Title'),
                  reportTitle: this.translate.instant('SocialCaseReportsResourceName.caseHelpRpt_Title'),
                  fields: [
                    { label: this.translate.instant('SocialCaseReportsResourceName.entityId'), value: this.searchParams.entityName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.collectorName'), value: this.searchParams.caseName },
                    { label: this.translate.instant('SocialCaseReportsResourceName.type'), value: this.searchParams.idNumber },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.namE_AR'), key: 'namE_AR' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.casE_ID_NUMBER'), key: 'casE_ID_NUMBER' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.wifE_ID'), key: 'wifE_ID' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.sourcE_DESC'), key: 'sourcE_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.comitY_DATE'), key: 'comitY_DATEstr' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.aiD_TYPE'), key: 'aiD_TYPE' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.statuS_DESC'), key: 'statuS_DESC' },
                    { label: this.translate.instant('SocialCaseReportsResourceName.toT_DentitY_NAMEUTIES'), key: 'entitY_NAME' },
                  ],
                  data,
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['toT_INCOMEstr', 'toT_DUTIESstr']
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

