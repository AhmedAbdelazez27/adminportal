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
import { caseSearchListRptInputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipInput.dto';
import { caseSearchListRptOutputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipOutput.dto';
import { SponsorshipReportservice } from '../../../../core/services/sponsorship/reports/sponsorshipReport.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-caseSearchListRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './caseSearchListRpt.component.html',
  styleUrls: ['./caseSearchListRpt.component.scss']
})

export class caseSearchListRptComponent {
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
  searchParams = new caseSearchListRptInputDto();
  getAllDataForReports: caseSearchListRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  nationalitySelect2: SelectdropdownResultResults[] = [];
  loadingnationality = false;
  nationalitysearchParams = new Select2RequestDto();
  selectednationalitySelect2Obj: any = null;
  nationalitySearchInput$ = new Subject<string>();

  sponsorCatSelect2: SelectdropdownResultResults[] = [];
  loadingsponsorCat = false;
  sponsorCatsearchParams = new Select2RequestDto();
  selectedsponsorCatSelect2Obj: any = null;
  sponsorCatSearchInput$ = new Subject<string>();

  caseStatusSelect2: SelectdropdownResultResults[] = [];
  loadingcaseStatus = false;
  caseStatussearchParams = new Select2RequestDto();
  selectedcaseStatusSelect2Obj: any = null;
  caseStatusSearchInput$ = new Subject<string>();
  constructor(
    private sponsorshipReportService: SponsorshipReportservice,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.buildColumnDefs();
      });
    this.rowActions = [];
    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.nationalitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchnationalitySelect2());

    this.sponsorCatSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchsponsorCatSelect2());

    this.caseStatusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseStatusSelect2());

    this.fetchentitySelect2();
    this.fetchnationalitySelect2();
    this.fetchsponsorCatSelect2();
    this.fetchcaseStatusSelect2();
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


  onnationalitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.nationalitysearchParams.skip = 0;
    this.nationalitysearchParams.searchValue = search;
    this.nationalitySelect2 = [];
    this.nationalitySearchInput$.next(search);
  }

  loadMorenationality(): void {
    this.nationalitysearchParams.skip++;
    this.fetchnationalitySelect2();
  }

  fetchnationalitySelect2(): void {
    this.loadingnationality = true;
    const searchVal = this.nationalitysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.nationalitysearchParams.skip;
    this.searchSelect2Params.take = this.nationalitysearchParams.take;

    this.Select2Service.getSpCaseSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.nationalitySelect2 = [...this.nationalitySelect2, ...newItems];
          this.loadingnationality = false;
        },
        error: () => this.loadingnationality = false
      });
  }

  onnationalitySelect2Change(selectednationality: any): void {
    if (selectednationality) {
      this.searchParams.nationalityDesc = selectednationality.id;
      this.searchParams.nationalityDescName = selectednationality.text;
    } else {
      this.searchParams.nationalityDesc = null;
      this.searchParams.nationalityDescName = null;
    }
  }


  onsponsorCatSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.sponsorCatsearchParams.skip = 0;
    this.sponsorCatsearchParams.searchValue = search;
    this.sponsorCatSelect2 = [];
    this.sponsorCatSearchInput$.next(search);
  }

  loadMoresponsorCat(): void {
    this.sponsorCatsearchParams.skip++;
    this.fetchsponsorCatSelect2();
  }

  fetchsponsorCatSelect2(): void {
    this.loadingsponsorCat = true;
    const searchVal = this.sponsorCatsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.sponsorCatsearchParams.skip;
    this.searchSelect2Params.take = this.sponsorCatsearchParams.take;

    this.Select2Service.getSpCaseSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.sponsorCatSelect2 = [...this.sponsorCatSelect2, ...newItems];
          this.loadingsponsorCat = false;
        },
        error: () => this.loadingsponsorCat = false
      });
  }

  onsponsorCatSelect2Change(selectedsponsorCat: any): void {
    if (selectedsponsorCat) {
      this.searchParams.sponcerCatId = selectedsponsorCat.id;
      this.searchParams.sponcerCatName = selectedsponsorCat.text;
    } else {
      this.searchParams.sponcerCatId = null;
      this.searchParams.sponcerCatName = null;
    }
  }

  oncaseStatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.caseStatussearchParams.skip = 0;
    this.caseStatussearchParams.searchValue = search;
    this.caseStatusSelect2 = [];
    this.caseStatusSearchInput$.next(search);
  }

  loadMorecaseStatus(): void {
    this.caseStatussearchParams.skip++;
    this.fetchcaseStatusSelect2();
  }

  fetchcaseStatusSelect2(): void {
    this.loadingcaseStatus = true;
    const searchVal = this.caseStatussearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.caseStatussearchParams.skip;
    this.searchSelect2Params.take = this.caseStatussearchParams.take;

    this.Select2Service.getSpCaseSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.caseStatusSelect2 = [...this.caseStatusSelect2, ...newItems];
          this.loadingcaseStatus = false;
        },
        error: () => this.loadingcaseStatus = false
      });
  }

  oncaseStatusSelect2Change(selectedcaseStatus: any): void {
    if (selectedcaseStatus) {
      this.searchParams.caseStatusId = selectedcaseStatus.id;
      this.searchParams.caseStatusName = selectedcaseStatus.text;
    } else {
      this.searchParams.caseStatusId = null;
      this.searchParams.caseStatusName = null;
    }
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
   
    this.sponsorshipReportService.getcaseSearchListRptData(this.searchParams)
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
    this.searchParams = new caseSearchListRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  private buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', width: 40, colId: '#' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), field: 'sponceR_CATEGORY_DESC', width: 200 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseNo'), field: 'casE_NO', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseName'), field: 'casename', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), field: 'nationalitY_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseContractStatus'), field: 'casE_CONTRACT_STATUS_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.beneficenNo'), field: 'beneficenT_NO' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.beneficentName'), field: 'beneficentname' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.startDate'), field: 'startdatestr' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseAmount'), field: 'caseamountstr' },
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
    this.sponsorshipReportService.getcaseSearchListRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.sponsorshipReportService.getcaseSearchListRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
            title: this.translate.instant('SponsorshipReportResourceName.caseSearchListRpt_Title'),
            reportTitle: this.translate.instant('SponsorshipReportResourceName.caseSearchListRpt_Title'),
            fileName: `${this.translate.instant('SponsorshipReportResourceName.caseSearchListRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityName },
              { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), value: this.searchParams.nationalityDescName },
              { label: this.translate.instant('SponsorshipReportResourceName.caseStatusDesc'), value: this.searchParams.caseStatusName },
              { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), value: this.searchParams.sponcerCatName }
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('SponsorshipReportResourceName.entityName'), key: 'sponceR_CATEGORY' },
              { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), key: 'sponceR_CATEGORY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseNo'), key: 'casE_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseName'), key: 'casename' },
              { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), key: 'nationalitY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseContractStatus'), key: 'casE_CONTRACT_STATUS_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.beneficenNo'), key: 'beneficenT_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.beneficentName'), key: 'beneficentname' },
              { label: this.translate.instant('SponsorshipReportResourceName.startDate'), key: 'startdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseAmount'), key: 'caseamountstr' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['caseamountstr']
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
    this.spinnerService.show();
    this.searchParams.skip = -1;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.sponsorshipReportService.getcaseSearchListRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.sponsorshipReportService.getcaseSearchListRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
            title: this.translate.instant('SponsorshipReportResourceName.caseSearchListRpt_Title'),
            reportTitle: this.translate.instant('SponsorshipReportResourceName.caseSearchListRpt_Title'),
            fileName: `${this.translate.instant('SponsorshipReportResourceName.caseSearchListRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityName },
              { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), value: this.searchParams.nationalityDescName },
              { label: this.translate.instant('SponsorshipReportResourceName.caseStatusDesc'), value: this.searchParams.caseStatusName },
              { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), value: this.searchParams.sponcerCatName }
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('SponsorshipReportResourceName.entityName'), key: 'sponceR_CATEGORY' },
              { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), key: 'sponceR_CATEGORY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseNo'), key: 'casE_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseName'), key: 'casename' },
              { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), key: 'nationalitY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseContractStatus'), key: 'casE_CONTRACT_STATUS_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.beneficenNo'), key: 'beneficenT_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.beneficentName'), key: 'beneficentname' },
              { label: this.translate.instant('SponsorshipReportResourceName.startDate'), key: 'startdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseAmount'), key: 'caseamountstr' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['caseamountstr']
          };
          this.spinnerService.hide();
          this.openStandardReportService.openStandardReportPDF(reportConfig);
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

