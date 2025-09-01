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
import { benifcientTotalRptInputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipInput.dto';
import { benifcientTotalRptOutputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipOutput.dto';
import { SponsorshipReportservice } from '../../../../core/services/sponsorship/reports/sponsorshipReport.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-benifcientTotalRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './benifcientTotalRpt.component.html',
  styleUrls: ['./benifcientTotalRpt.component.scss']
})

export class benifcientTotalRptComponent {
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
  searchParams = new benifcientTotalRptInputDto();
  getAllDataForReports: benifcientTotalRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  sponsorTypeSelect2: SelectdropdownResultResults[] = [];
  loadingsponsorType = false;
  sponsorTypesearchParams = new Select2RequestDto();
  selectedsponsorTypeSelect2Obj: any = null;
  sponsorTypeSearchInput$ = new Subject<string>();

  nationalitySelect2: SelectdropdownResultResults[] = [];
  loadingnationality = false;
  nationalitysearchParams = new Select2RequestDto();
  selectednationalitySelect2Obj: any = null;
  nationalitySearchInput$ = new Subject<string>();
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

    this.sponsorTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchsponsorTypeSelect2());

    this.nationalitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchnationalitySelect2());

    this.fetchentitySelect2();
    this.fetchsponsorTypeSelect2();
    this.fetchnationalitySelect2();
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


  onsponsorTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.sponsorTypesearchParams.skip = 0;
    this.sponsorTypesearchParams.searchValue = search;
    this.sponsorTypeSelect2 = [];
    this.sponsorTypeSearchInput$.next(search);
  }

  loadMoresponsorType(): void {
    this.sponsorTypesearchParams.skip++;
    this.fetchsponsorTypeSelect2();
  }

  fetchsponsorTypeSelect2(): void {
    this.loadingsponsorType = true;
    const searchVal = this.sponsorTypesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.sponsorTypesearchParams.skip;
    this.searchSelect2Params.take = this.sponsorTypesearchParams.take;

    this.Select2Service.getSponcerCategorySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.sponsorTypeSelect2 = [...this.sponsorTypeSelect2, ...newItems];
          this.loadingsponsorType = false;
        },
        error: () => this.loadingsponsorType = false
      });
  }

  onsponsorTypeSelect2Change(selectedsponsorType: any): void {
    if (selectedsponsorType) {
      this.searchParams.sponcerCatId = selectedsponsorType.id;
      this.searchParams.sponcerCatName = selectedsponsorType.text;
    } else {
      this.searchParams.sponcerCatId = null;
      this.searchParams.sponcerCatName = null;
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

    this.Select2Service.getNationalitySelect2(this.searchSelect2Params)
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
      this.searchParams.nationalityName = selectednationality.text;
    } else {
      this.searchParams.nationalityDesc = null;
      this.searchParams.nationalityName = null;
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

    this.sponsorshipReportService.getbenifcientTotalRptData(this.searchParams)
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
    this.searchParams = new benifcientTotalRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }


  public buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', width: 40, colId: '#' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), field: 'nationalityDesc', width: 150 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.newCase'), field: 'neW_CASE', width: 200 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.neworofficepost'), field: 'neworofficepost', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.posted'), field: 'posted', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.reserved'), field: 'reserved' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.stoped'), field: 'stoped' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.sponsoredCase'), field: 'sponsoreD_CASE' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.cancelCase'), field: 'canceL_CASE' },
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
    this.sponsorshipReportService.getbenifcientTotalRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.sponsorshipReportService.getbenifcientTotalRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SponsorshipReportResourceName.benifcientTotalRpt_Title'),
                  reportTitle: this.translate.instant('SponsorshipReportResourceName.benifcientTotalRpt_Title'),
                  fileName: `${this.translate.instant('SponsorshipReportResourceName.benifcientTotalRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityId },
                    { label: this.translate.instant('SponsorshipReportResourceName.sponcerCatName'), value: this.searchParams.sponcerCatName },
                    { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), value: this.searchParams.nationalityName }
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), key: 'nationalityDesc' },
                    { label: this.translate.instant('SponsorshipReportResourceName.newCase'), key: 'neW_CASE' },
                    { label: this.translate.instant('SponsorshipReportResourceName.neworofficepost'), key: 'neworofficepost' },
                    { label: this.translate.instant('SponsorshipReportResourceName.posted'), key: 'posted' },
                    { label: this.translate.instant('SponsorshipReportResourceName.reserved'), key: 'reserved' },
                    { label: this.translate.instant('SponsorshipReportResourceName.stoped'), key: 'stoped' },
                    { label: this.translate.instant('SponsorshipReportResourceName.sponsoredCase'), key: 'sponsoreD_CASE' },
                    { label: this.translate.instant('SponsorshipReportResourceName.cancelCase'), key: 'canceL_CASE' },
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
    this.spinnerService.show();
    this.searchParams.skip = -1;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.sponsorshipReportService.getbenifcientTotalRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.sponsorshipReportService.getbenifcientTotalRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SponsorshipReportResourceName.benifcientTotalRpt_Title'),
                  reportTitle: this.translate.instant('SponsorshipReportResourceName.benifcientTotalRpt_Title'),
                  fileName: `${this.translate.instant('SponsorshipReportResourceName.benifcientTotalRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityId },
                    { label: this.translate.instant('SponsorshipReportResourceName.sponcerCatName'), value: this.searchParams.sponcerCatName },
                    { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), value: this.searchParams.nationalityName }
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), key: 'nationalityDesc' },
                    { label: this.translate.instant('SponsorshipReportResourceName.newCase'), key: 'neW_CASE' },
                    { label: this.translate.instant('SponsorshipReportResourceName.neworofficepost'), key: 'neworofficepost' },
                    { label: this.translate.instant('SponsorshipReportResourceName.posted'), key: 'posted' },
                    { label: this.translate.instant('SponsorshipReportResourceName.reserved'), key: 'reserved' },
                    { label: this.translate.instant('SponsorshipReportResourceName.stoped'), key: 'stoped' },
                    { label: this.translate.instant('SponsorshipReportResourceName.sponsoredCase'), key: 'sponsoreD_CASE' },
                    { label: this.translate.instant('SponsorshipReportResourceName.cancelCase'), key: 'canceL_CASE' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
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
        }
      });
  }
}

