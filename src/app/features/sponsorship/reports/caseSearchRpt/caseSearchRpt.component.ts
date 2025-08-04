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
import { caseSearchRptInputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipInput.dto';
import { caseSearchRptOutputDto } from '../../../../core/dtos/sponsorship/reports/sponsorshipOutput.dto';
import { SponsorshipReportservice } from '../../../../core/services/sponsorship/reports/sponsorshipReport.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-caseSearchRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './caseSearchRpt.component.html',
  styleUrls: ['./caseSearchRpt.component.scss']
})

export class caseSearchRptComponent {
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
  searchParams = new caseSearchRptInputDto();
  getAllDataForReports: caseSearchRptOutputDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  caseNameSelect2: SelectdropdownResultResults[] = [];
  loadingcaseName = false;
  caseNamesearchParams = new Select2RequestDto();
  selectedcaseNameSelect2Obj: any = null;
  caseNameSearchInput$ = new Subject<string>();

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

    this.caseNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseNameSelect2());

    this.fetchentitySelect2();
    this.fetchcaseNameSelect2();
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


  oncaseNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.caseNamesearchParams.skip = 0;
    this.caseNamesearchParams.searchValue = search;
    this.caseNameSelect2 = [];
    this.caseNameSearchInput$.next(search);
  }

  loadMorecaseName(): void {
    this.caseNamesearchParams.skip++;
    this.fetchcaseNameSelect2();
  }

  fetchcaseNameSelect2(): void {
    this.loadingcaseName = true;
    const searchVal = this.caseNamesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.caseNamesearchParams.skip;
    this.searchSelect2Params.take = this.caseNamesearchParams.take;

    this.Select2Service.getSponcerCategorySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.caseNameSelect2 = [...this.caseNameSelect2, ...newItems];
          this.loadingcaseName = false;
        },
        error: () => this.loadingcaseName = false
      });
  }

  oncaseNameSelect2Change(selectedcaseName: any): void {
    if (selectedcaseName) {
      this.searchParams.caseId = selectedcaseName.id;
      this.searchParams.caseName = selectedcaseName.text;
    } else {
      this.searchParams.caseId = null;
      this.searchParams.caseName = null;
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
   
    this.sponsorshipReportService.getcaseSearchRptData(this.searchParams)
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
    this.searchParams = new caseSearchRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }


  private buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: '#', valueGetter: 'node.rowIndex + 1', width: 40, colId: '#' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseNo'), field: 'casE_NO', width: 150 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseName'), field: 'casename', width: 200 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.birthDate'), field: 'birthdatestr', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.birthLocation'), field: 'birthlocation', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.gender'), field: 'gendeR_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), field: 'nationalitY_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.phone'), field: 'phone' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.motherName'), field: 'motheR_NAME' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.fatherMiss'), field: 'fathermiss', width: 150 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.procuratorName'), field: 'procuratoR_NAME', width: 200 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.procuratorRel'), field: 'procuratoR_REL_DESC', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.region'), field: 'region', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.city'), field: 'city' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.schoolStage'), field: 'schoolstagE_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.schoolName'), field: 'schooL_NAME' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.deathReason'), field: 'deatH_REASON' },

      { headerName: this.translate.instant('SponsorshipReportResourceName.fatherDeathdate'), field: 'fatherdeathdatestr', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.caseHealth'), field: 'casE_HEALTH_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.isTreated'), field: 'iS_TREATED_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.diseasType'), field: 'diseaS_TYPE_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.diseasDate'), field: 'diseaS_DATEstr' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.traetStage'), field: 'traeT_STAGE', width: 150 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.treatAmount'), field: 'treaT_AMOUNTstr', width: 200 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.diseasPerscent'), field: 'diseaS_PERCENTstr', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.diseasType'), field: 'diseaS_TYPE_DESC', width: 100 },
      { headerName: this.translate.instant('SponsorshipReportResourceName.noFamily'), field: 'nO_FAMILY' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.houseLegal'), field: 'housE_LEGAL_DESC' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.schoolName'), field: 'schooL_NAME' },
      { headerName: this.translate.instant('SponsorshipReportResourceName.placestatuS_DESC'), field: 'placestatuS_DESC' },
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
    this.sponsorshipReportService.getcaseSearchRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.sponsorshipReportService.getcaseSearchRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
            title: this.translate.instant('SponsorshipReportResourceName.caseSearchRpt_Title'),
            reportTitle: this.translate.instant('SponsorshipReportResourceName.caseSearchRpt_Title'),
            fileName: `${this.translate.instant('SponsorshipReportResourceName.caseSearchRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityId },
              { label: this.translate.instant('SponsorshipReportResourceName.caseName'), value: this.searchParams.caseName },
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },

              { label: this.translate.instant('SponsorshipReportResourceName.caseNo'), key: 'casE_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseName'), key: 'casename' },
              { label: this.translate.instant('SponsorshipReportResourceName.birthDate'), key: 'birthdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.birthLocation'), key: 'birthlocation' },
              { label: this.translate.instant('SponsorshipReportResourceName.gender'), key: 'gendeR_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), key: 'nationalitY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.phone'), key: 'phone' },
              { label: this.translate.instant('SponsorshipReportResourceName.motherName'), key: 'motheR_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.fatherMiss'), key: 'fathermiss' },
              { label: this.translate.instant('SponsorshipReportResourceName.procuratorName'), key: 'procuratoR_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.procuratorRel'), key: 'procuratoR_REL_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.region'), key: 'region' },
              { label: this.translate.instant('SponsorshipReportResourceName.city'), key: 'city' },
              { label: this.translate.instant('SponsorshipReportResourceName.schoolStage'), key: 'schoolstagE_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.schoolName'), key: 'schooL_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.deathReason'), key: 'deatH_REASON' },
              { label: this.translate.instant('SponsorshipReportResourceName.fatherDeathdate'), key: 'fatherdeathdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseHealth'), key: 'casE_HEALTH_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.isTreated'), key: 'iS_TREATED_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasType'), key: 'diseaS_TYPE_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasDate'), key: 'diseaS_DATEstr' },
              { label: this.translate.instant('SponsorshipReportResourceName.traetStage'), key: 'traeT_STAGE' },
              { label: this.translate.instant('SponsorshipReportResourceName.treatAmount'), key: 'treaT_AMOUNT' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasPerscent'), key: 'diseaS_PERCENT' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasType'), key: 'diseaS_TYPE_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.noFamily'), key: 'nO_FAMILY' },
              { label: this.translate.instant('SponsorshipReportResourceName.houseLegal'), key: 'housE_LEGAL_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.schoolName'), key: 'schooL_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.placestatuS_DESC'), key: 'placestatuS_DESC' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['debiT_AMOUNT', 'crediT_AMOUNT']
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
    this.sponsorshipReportService.getcaseSearchRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.sponsorshipReportService.getcaseSearchRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
            title: this.translate.instant('SponsorshipReportResourceName.caseSearchRpt_Title'),
            reportTitle: this.translate.instant('SponsorshipReportResourceName.caseSearchRpt_Title'),
            fileName: `${this.translate.instant('SponsorshipReportResourceName.caseSearchRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('SponsorshipReportResourceName.entityId'), value: this.searchParams.entityId },
              { label: this.translate.instant('SponsorshipReportResourceName.caseName'), value: this.searchParams.caseName },
            ],
            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseNo'), key: 'casE_NO' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseName'), key: 'casename' },
              { label: this.translate.instant('SponsorshipReportResourceName.birthDate'), key: 'birthdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.birthLocation'), key: 'birthlocation' },
              { label: this.translate.instant('SponsorshipReportResourceName.gender'), key: 'gendeR_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.nationalityDesc'), key: 'nationalitY_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.phone'), key: 'phone' },
              { label: this.translate.instant('SponsorshipReportResourceName.motherName'), key: 'motheR_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.fatherMiss'), key: 'fathermiss' },
              { label: this.translate.instant('SponsorshipReportResourceName.procuratorName'), key: 'procuratoR_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.procuratorRel'), key: 'procuratoR_REL_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.region'), key: 'region' },
              { label: this.translate.instant('SponsorshipReportResourceName.city'), key: 'city' },
              { label: this.translate.instant('SponsorshipReportResourceName.schoolStage'), key: 'schoolstagE_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.schoolName'), key: 'schooL_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.deathReason'), key: 'deatH_REASON' },
              { label: this.translate.instant('SponsorshipReportResourceName.fatherDeathdate'), key: 'fatherdeathdatestr' },
              { label: this.translate.instant('SponsorshipReportResourceName.caseHealth'), key: 'casE_HEALTH_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.isTreated'), key: 'iS_TREATED_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasType'), key: 'diseaS_TYPE_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasDate'), key: 'diseaS_DATEstr' },
              { label: this.translate.instant('SponsorshipReportResourceName.traetStage'), key: 'traeT_STAGE' },
              { label: this.translate.instant('SponsorshipReportResourceName.treatAmount'), key: 'treaT_AMOUNT' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasPerscent'), key: 'diseaS_PERCENT' },
              { label: this.translate.instant('SponsorshipReportResourceName.diseasType'), key: 'diseaS_TYPE_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.noFamily'), key: 'nO_FAMILY' },
              { label: this.translate.instant('SponsorshipReportResourceName.houseLegal'), key: 'housE_LEGAL_DESC' },
              { label: this.translate.instant('SponsorshipReportResourceName.schoolName'), key: 'schooL_NAME' },
              { label: this.translate.instant('SponsorshipReportResourceName.placestatuS_DESC'), key: 'placestatuS_DESC' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['debiT_AMOUNT', 'crediT_AMOUNT']
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

