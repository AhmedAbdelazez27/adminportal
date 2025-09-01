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
import { beneficentsRptInputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipInput.dto';
import { beneficentsRptOutputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipOutput.dto';
import { SponsorshipReportservice } from '../../../../core/services/sponsorship/reports/sponsorshipReport.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-getBeneficentsRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './getBeneficentsRpt.component.html',
  styleUrls: ['./getBeneficentsRpt.component.scss']
})

export class getBeneficentsRptComponent {
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
  searchParams = new beneficentsRptInputDto();
  getAllDataForReports: beneficentsRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  beneficentNameSelect2: SelectdropdownResultResults[] = [];
  loadingbeneficentName = false;
  beneficentNamesearchParams = new Select2RequestDto();
  selectedbeneficentNameSelect2Obj: any = null;
  beneficentNameSearchInput$ = new Subject<string>();

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

    this.beneficentNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbeneficentNameSelect2());

    this.fetchentitySelect2();
    this.fetchbeneficentNameSelect2();
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
      this.searchParams.entitY_ID = selectedentity.id;
      this.searchParams.entitY_Name = selectedentity.text;
    } else {
      this.searchParams.entitY_ID = null;
      this.searchParams.entitY_Name = null;
    }
  }


  onbeneficentNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.beneficentNamesearchParams.skip = 0;
    this.beneficentNamesearchParams.searchValue = search;
    this.beneficentNameSelect2 = [];
    this.beneficentNameSearchInput$.next(search);
  }

  loadMorebeneficentName(): void {
    this.beneficentNamesearchParams.skip++;
    this.fetchbeneficentNameSelect2();
  }

  fetchbeneficentNameSelect2(): void {
    this.loadingbeneficentName = true;
    const searchVal = this.beneficentNamesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.beneficentNamesearchParams.skip;
    this.searchSelect2Params.take = this.beneficentNamesearchParams.take;

    this.Select2Service.getBeneficentIdSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.beneficentNameSelect2 = [...this.beneficentNameSelect2, ...newItems];
          this.loadingbeneficentName = false;
        },
        error: () => this.loadingbeneficentName = false
      });
  }

  onbeneficentNameSelect2Change(selectedbeneficentName: any): void {
    if (selectedbeneficentName) {
      this.searchParams.beneficenT_ID = selectedbeneficentName.id;
      this.searchParams.beneficenT_Name = selectedbeneficentName.text;
    } else {
      this.searchParams.beneficenT_ID = null;
      this.searchParams.beneficenT_Name = null;
    }
  }


  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.entitY_ID) {
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

    this.sponsorshipReportService.getbeneficentsRptData(this.searchParams)
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
    this.searchParams = new beneficentsRptInputDto();
    this.getAllDataForReports = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  public buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', width: 40, colId: '#' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.beneficenNo'), field: 'beneficenT_NO', width: 150 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.beneficentName'), field: 'beneficentname', width: 200 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), field: 'sponceR_CATEGORY_DESC', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseNo'), field: 'casE_NO', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseName'), field: 'casename' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.birthDate'), field: 'birthdatestr' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.startDate'), field: 'startdatestr' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseAmount'), field: 'caseamountstr' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.sponsFor'), field: 'sponS_FOR' },
    ];
  }

  onTableAction(event: { action: string, row: any }) { }


  printExcel(): void {
    this.spinnerService.show();
    this.searchParams.skip = -1;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entitY_ID) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.sponsorshipReportService.getbeneficentsRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const totalCount = response?.totalCount || response?.data?.length || 0;

          const data = response?.data || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('SponsorshipReportResourceName.getBeneficentsRpt_Title'),
            reportTitle: this.translate.instant('SponsorshipReportResourceName.getBeneficentsRpt_Title'),
            fileName: `${this.translate.instant('SponsorshipReportResourceName.getBeneficentsRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entitY_Name },
              { label: this.translate.instant('SponsorshipReportResourceName.beneficentId'), value: this.searchParams.beneficenT_Name }
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('SponsorshipReportResourceName.beneficenNo'), key: 'beneficenT_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.beneficentName'), key: 'beneficentname' },
              { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), key: 'sponceR_CATEGORY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseNo'), key: 'casE_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseName'), key: 'casename' },
              { label: this.translate.instant('SponsorshipReportResourceName.birthDate'), key: 'birthdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.startDate'), key: 'startdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseAmount'), key: 'caseamountstr' },
              { label: this.translate.instant('SponsorshipReportResourceName.sponsFor'), key: 'sponS_FOR' },
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
          this.toastr.error('Failed to retrieve data count');
        },

      });
  }

  printPDF(): void {
    this.spinnerService.show();
    this.searchParams.skip = -1;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entitY_ID) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.sponsorshipReportService.getbeneficentsRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.sponsorshipReportService.getbeneficentsRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {

                  title: this.translate.instant('SponsorshipReportResourceName.getBeneficentsRpt_Title'),
                  reportTitle: this.translate.instant('SponsorshipReportResourceName.getBeneficentsRpt_Title'),
                  fileName: `${this.translate.instant('SponsorshipReportResourceName.getBeneficentsRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entitY_Name },
                    { label: this.translate.instant('SponsorshipReportResourceName.beneficentId'), value: this.searchParams.beneficenT_Name }
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('SponsorshipReportResourceName.beneficenNo'), key: 'beneficenT_NO' },
                    { label: this.translate.instant('SponsorshipReportResourceName.beneficentName'), key: 'beneficentname' },
                    { label: this.translate.instant('SponsorshipReportResourceName.sponcerCategory'), key: 'sponceR_CATEGORY_DESC' },
                    { label: this.translate.instant('SponsorshipReportResourceName.caseNo'), key: 'casE_NO' },
                    { label: this.translate.instant('SponsorshipReportResourceName.caseName'), key: 'casename' },
                    { label: this.translate.instant('SponsorshipReportResourceName.birthDate'), key: 'birthdatestr' },
                    { label: this.translate.instant('SponsorshipReportResourceName.startDate'), key: 'startdatestr' },
                    { label: this.translate.instant('SponsorshipReportResourceName.caseAmount'), key: 'caseamountstr' },
                    { label: this.translate.instant('SponsorshipReportResourceName.sponsFor'), key: 'sponS_FOR' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['caseamountstr']
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

