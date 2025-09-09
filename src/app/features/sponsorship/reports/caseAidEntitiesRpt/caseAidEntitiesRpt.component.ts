import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { caseAidEntitiesRptInputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipInput.dto';
import { caseAidEntitiesRptOutputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipOutput.dto';
import { SponsorshipReportservice } from '../../../../core/services/sponsorship/reports/sponsorshipReport.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-caseAidEntitiesRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './caseAidEntitiesRpt.component.html',
  styleUrls: ['./caseAidEntitiesRpt.component.scss']
})

export class caseAidEntitiesRptComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();
  columnDefs: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];

  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new caseAidEntitiesRptInputDto();
  getAllDataForReports: caseAidEntitiesRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  caseAidSelect2: SelectdropdownResultResults[] = [];
  loadingcaseAid = false;
  caseAidsearchParams = new Select2RequestDto();
  selectedcaseAidSelect2Obj: any = null;
  caseAidSearchInput$ = new Subject<string>();

  constructor(
    private sponsorshipReportService: SponsorshipReportservice,
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

    this.caseAidSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseAidSelect2());

    this.fetchentitySelect2();
    this.fetchcaseAidSelect2();
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
    if (selectedentity == null) {
      this.searchParams.entityId = null;
      this.searchParams.entityName = null;
      return;
    }

    // When bindValue="id", change emits the selected id. Resolve the label for reporting.
    const selectedObj = typeof selectedentity === 'object'
      ? selectedentity
      : this.entitySelect2.find(x => x.id === selectedentity);

    this.searchParams.entityId = selectedObj?.id ?? null;
    this.searchParams.entityName = selectedObj?.text ?? null;
  }


  oncaseAidSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.caseAidsearchParams.skip = 0;
    this.caseAidsearchParams.searchValue = search;
    this.caseAidSelect2 = [];
    this.caseAidSearchInput$.next(search);
  }

  loadMorecaseAid(): void {
    this.caseAidsearchParams.skip++;
    this.fetchcaseAidSelect2();
  }

  fetchcaseAidSelect2(): void {
    this.loadingcaseAid = true;
    const searchVal = this.caseAidsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.caseAidsearchParams.skip;
    this.searchSelect2Params.take = this.caseAidsearchParams.take;

    this.Select2Service.getSpCaseSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.caseAidSelect2 = [...this.caseAidSelect2, ...newItems];
          this.loadingcaseAid = false;
        },
        error: () => this.loadingcaseAid = false
      });
  }

  oncaseAidSelect2Change(selectedcaseAid: any): void {
    if (selectedcaseAid == null) {
      this.searchParams.caseId = null;
      this.searchParams.caseName = null;
      return;
    }

    // With bindValue="id", change emits the id. Resolve object to get text.
    const selectedObj = typeof selectedcaseAid === 'object'
      ? selectedcaseAid
      : this.caseAidSelect2.find(x => x.id === selectedcaseAid);

    this.searchParams.caseId = selectedObj?.id ?? null;
    this.searchParams.caseName = selectedObj?.text ?? null;
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.sponsorshipReportService.getcaseAidEntitiesRptData(this.searchParams)
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
    this.searchParams = new caseAidEntitiesRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  public buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', width: 40, colId: '#' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.entityName'), field: 'entitY_NAME', width: 150 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), field: 'sponceR_CATEGORY_DESC', width: 200 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.startDate'), field: 'startdatestr', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseAmount'), field: 'caseAmountstr', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.haiOffice'), field: 'haI_OFFICE' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseStatusDesc'), field: 'casE_STATUS_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.nameAr'), field: 'namE_AR' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseIdNumber'), field: 'casE_ID_NUMBER' },
    ];
  }

  onTableAction(event: { action: string, row: any }) { }


  printExcel(): void {
    this.spinnerService.show();
    this.searchParams.skip = -1;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.sponsorshipReportService.getcaseAidEntitiesRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const totalCount = response?.totalCount || response?.data?.length || 0;

          const data = response?.data || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('SponsorshipReportResourceName.caseAidEntitiesRpt_Title'),
            reportTitle: this.translate.instant('SponsorshipReportResourceName.caseAidEntitiesRpt_Title'),
            fileName: `${this.translate.instant('SponsorshipReportResourceName.caseAidEntitiesRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityName },
              { label: this.translate.instant('SponsorshipReportResourceName.status'), value: this.searchParams.caseName },
              { label: this.translate.instant('SponsorshipReportResourceName.caseIdNumber'), value: this.searchParams.idNumber }
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('SponsorshipReportResourceName.entityName'), key: 'entitY_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), key: 'sponceR_CATEGORY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.startDate'), key: 'startdate' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseAmount'), key: 'caseAmountstr' },
              { label: this.translate.instant('SponsorshipReportResourceName.haiOffice'), key: 'haI_OFFICE' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseStatusDesc'), key: 'casE_STATUS_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.nameAr'), key: 'namE_AR' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseIdNumber'), key: 'casE_ID_NUMBER' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['caseAmountstr']
          };

          this.openStandardReportService.openStandardReportExcel(reportConfig);
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error('Failed to retrieve data count');
        },

      });
  }

  printPDF(): void {
    this.spinnerService.show();
    this.searchParams.skip = -1;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.sponsorshipReportService.getcaseAidEntitiesRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const totalCount = response?.totalCount || response?.data?.length || 0;

          const data = response?.data || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('SponsorshipReportResourceName.caseAidEntitiesRpt_Title'),
            reportTitle: this.translate.instant('SponsorshipReportResourceName.caseAidEntitiesRpt_Title'),
            fileName: `${this.translate.instant('SponsorshipReportResourceName.caseAidEntitiesRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityName },
              { label: this.translate.instant('SponsorshipReportResourceName.status'), value: this.searchParams.caseName },
              { label: this.translate.instant('SponsorshipReportResourceName.caseIdNumber'), value: this.searchParams.idNumber }
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('SponsorshipReportResourceName.entityName'), key: 'entitY_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), key: 'sponceR_CATEGORY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.startDate'), key: 'startdate' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseAmount'), key: 'caseAmountstr' },
              { label: this.translate.instant('SponsorshipReportResourceName.haiOffice'), key: 'haI_OFFICE' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseStatusDesc'), key: 'casE_STATUS_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.nameAr'), key: 'namE_AR' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseIdNumber'), key: 'casE_ID_NUMBER' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['caseAmountstr']
          };
          this.openStandardReportService.openStandardReportPDF(reportConfig);
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error('Failed to retrieve data count');
        },

      });
  }
}

