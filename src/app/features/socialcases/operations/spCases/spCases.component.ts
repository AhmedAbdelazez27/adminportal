import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { GetGridDataParametersDto, SpCasesDto, CasesSearchDto, GetParamtersDto, SpCasesAidRequestsFilterDto, GetAidRequestGridDataParametersDto, CAidRequestDto } from '../../../../core/dtos/socialcases/operations/spCases.dto';
import { aidRequestsDto, filteraidRequestsByIdDto, aidRequestsShowDetailsDto, aidRequestsStudyDetailsDto } from '../../../../core/dtos/socialcases/operations/aidRequests.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { SpCasesService } from '../../../../core/services/socialcases/operations/spCases.service';
import { aidRequestsService } from '../../../../core/services/socialcases/operations/aidRequests.service';

declare var bootstrap: any;

@Component({
  selector: 'app-spCases',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './spCases.component.html',
  styleUrls: ['./spCases.component.scss']
})
export class SpCasesComponent {
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

  // Main grid data and filters
  searchParams = new GetAidRequestGridDataParametersDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  loadgridData: CAidRequestDto[] = [];

  // Case details popup data
  loadCaseDetailsData: CasesSearchDto = {} as CasesSearchDto;

  // Aid requests grid data for popup
  aidRequestsGridData: aidRequestsDto[] = [];
  aidRequestsSearchParams = new SpCasesAidRequestsFilterDto();
  aidRequestsPagination = new Pagination();
  aidRequestsColumnDefs: ColDef[] = [];
  aidRequestsRowActions: Array<{ label: string, icon?: string, action: string }> = [];
  filteredAidRequestsRowActions: Array<{ label: string, icon?: string, action: string }> = [];
  
  // Separate property specifically for Aid Requests modal to avoid any conflicts
  aidRequestsModalActions: Array<{ label: string, icon?: string, action: string }> = [];

  // Details modals data
  loadformData: aidRequestsShowDetailsDto = {} as aidRequestsShowDetailsDto;
  loadstudydetailformData: aidRequestsStudyDetailsDto = {} as aidRequestsStudyDetailsDto;

  // Entity Select2
  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  // Case Name Select2
  caseNameSelect2: SelectdropdownResultResults[] = [];
  loadingcaseName = false;
  caseNamesearchParams = new Select2RequestDto();
  selectedcaseNameSelect2Obj: any = null;
  caseNameSearchInput$ = new Subject<string>();

  // Nationality Select2
  nationalitySelect2: SelectdropdownResultResults[] = [];
  loadingnationality = false;
  nationalitysearchParams = new Select2RequestDto();
  selectednationalitySelect2Obj: any = null;
  nationalitySearchInput$ = new Subject<string>();

  // City Select2
  citySelect2: SelectdropdownResultResults[] = [];
  loadingcity = false;
  citysearchParams = new Select2RequestDto();
  selectedcitySelect2Obj: any = null;
  citySearchInput$ = new Subject<string>();

  // Gender Select2
  genderSelect2: SelectdropdownResultResults[] = [];
  loadinggender = false;
  gendersearchParams = new Select2RequestDto();
  selectedgenderSelect2Obj: any = null;
  genderSearchInput$ = new Subject<string>();

  // Branch Select2
  branchSelect2: SelectdropdownResultResults[] = [];
  loadingbranch = false;
  branchsearchParams = new Select2RequestDto();
  selectedbranchSelect2Obj: any = null;
  branchSearchInput$ = new Subject<string>();

  // Aid Type Select2
  aidTypeSelect2: SelectdropdownResultResults[] = [];
  loadingaidType = false;
  aidTypesearchParams = new Select2RequestDto();
  selectedaidTypeSelect2Obj: any = null;
  aidTypeSearchInput$ = new Subject<string>();

  // Source Select2
  sourceSelect2: SelectdropdownResultResults[] = [];
  loadingsource = false;
  sourcesearchParams = new Select2RequestDto();
  selectedsourceSelect2Obj: any = null;
  sourceSearchInput$ = new Subject<string>();

  constructor(
    private spCasesService: SpCasesService,
    private aidRequestsService: aidRequestsService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  ) {
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.buildAidRequestsColumnDefs();
    
    // Main grid actions (includes Show More)
    this.rowActions = [
      { label: this.translate.instant('Common.Show'), icon: 'icon-frame-view', action: 'onShowMore' }
    ];

    // Aid Requests grid actions - completely separate array (only Show Details and Study Details)
    this.aidRequestsRowActions = [
      { label: 'Show', icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: 'Study Details', icon: 'icon-frame-view', action: 'onViewStudyDetailsInfo' }
    ];
    
    // Create completely separate arrays to ensure no reference issues
    this.filteredAidRequestsRowActions = [
      { label: 'Show', icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: 'Study Details', icon: 'icon-frame-view', action: 'onViewStudyDetailsInfo' }
    ];
    
    this.aidRequestsModalActions = [
      { label: 'Show', icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: 'Study Details', icon: 'icon-frame-view', action: 'onViewStudyDetailsInfo' }
    ];

    // Setup search inputs with debounce
    this.setupSearchInputs();

    // Initialize select2 data
    this.fetchentitySelect2();
    this.fetchcaseNameSelect2();
    this.fetchnationalitySelect2();
    this.fetchcitySelect2();
    this.fetchgenderSelect2();
    this.fetchbranchSelect2();
    this.fetchaidTypeSelect2();
    this.fetchsourceSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchInputs(): void {
    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.caseNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseNameSelect2());

    this.nationalitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchnationalitySelect2());

    this.citySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcitySelect2());

    this.genderSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchgenderSelect2());

    this.branchSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbranchSelect2());

    this.aidTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchaidTypeSelect2());

    this.sourceSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchsourceSelect2());
  }

  // Entity Select2 Methods
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

  onentitySelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.entityId = selected.id;
    } else {
      this.searchParams.entityId = null;
    }
  }

  // Case Name Select2 Methods
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

    this.Select2Service.getNameSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.caseNameSelect2 = [...this.caseNameSelect2, ...newItems];
          this.loadingcaseName = false;
        },
        error: () => this.loadingcaseName = false
      });
  }

  oncaseNameSelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.caseId = selected.id;
    } else {
      this.searchParams.caseId = null;
    }
  }

  // Nationality Select2 Methods
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

  onnationalitySelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.nationality = selected.id;
    } else {
      this.searchParams.nationality = null;
    }
  }

  // City Select2 Methods
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

  oncitySelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.city = selected.id;
    } else {
      this.searchParams.city = null;
    }
  }

  // Gender Select2 Methods
  ongenderSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.gendersearchParams.skip = 0;
    this.gendersearchParams.searchValue = search;
    this.genderSelect2 = [];
    this.genderSearchInput$.next(search);
  }

  loadMoregender(): void {
    this.gendersearchParams.skip++;
    this.fetchgenderSelect2();
  }

  fetchgenderSelect2(): void {
    this.loadinggender = true;
    const searchVal = this.gendersearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.gendersearchParams.skip;
    this.searchSelect2Params.take = this.gendersearchParams.take;

    this.Select2Service.getGenderSelect2Array(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResultResults[]) => {
          const newItems = response || [];
          this.genderSelect2 = [...this.genderSelect2, ...newItems];
          this.loadinggender = false;
        },
        error: () => this.loadinggender = false
      });
  }

  ongenderSelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.gender = selected.id ? selected.id.toString() : null;
    } else {
      this.searchParams.gender = null;
    }
  }

  // Branch Select2 Methods
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

  onbranchSelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.branch = selected.id;
    } else {
      this.searchParams.branch = null;
    }
  }

  // Aid Type Select2 Methods
  onaidTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.aidTypesearchParams.skip = 0;
    this.aidTypesearchParams.searchValue = search;
    this.aidTypeSelect2 = [];
    this.aidTypeSearchInput$.next(search);
  }

  loadMoreaidType(): void {
    this.aidTypesearchParams.skip++;
    this.fetchaidTypeSelect2();
  }

  fetchaidTypeSelect2(): void {
    this.loadingaidType = true;
    const searchVal = this.aidTypesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.aidTypesearchParams.skip;
    this.searchSelect2Params.take = this.aidTypesearchParams.take;

    this.Select2Service.getRequestTypeSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.aidTypeSelect2 = [...this.aidTypeSelect2, ...newItems];
          this.loadingaidType = false;
        },
        error: () => this.loadingaidType = false
      });
  }

  onaidTypeSelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.aidType = selected.id;
    } else {
      this.searchParams.aidType = null;
    }
  }

  // Source Select2 Methods
  onsourceSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.sourcesearchParams.skip = 0;
    this.sourcesearchParams.searchValue = search;
    this.sourceSelect2 = [];
    this.sourceSearchInput$.next(search);
  }

  loadMoresource(): void {
    this.sourcesearchParams.skip++;
    this.fetchsourceSelect2();
  }

  fetchsourceSelect2(): void {
    this.loadingsource = true;
    const searchVal = this.sourcesearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.sourcesearchParams.skip;
    this.searchSelect2Params.take = this.sourcesearchParams.take;

    this.Select2Service.getAidRequestSourceSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.sourceSelect2 = [...this.sourceSelect2, ...newItems];
          this.loadingsource = false;
        },
        error: () => this.loadingsource = false
      });
  }

  onsourceSelect2Change(selected: any): void {
    if (selected) {
      this.searchParams.source = selected.id;
    } else {
      this.searchParams.source = null;
    }
  }

  // Search and Grid Methods
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
    this.searchParams = new GetAidRequestGridDataParametersDto();
    this.loadgridData = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();
    
    this.spCasesService.getAllAidRequestGridData(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response.data || [];
          this.loadgridData.forEach((c) => {
            c.appDatestr = this.openStandardReportService.formatDate(c.appDate ?? null);
            c.caseBirthDatestr = this.openStandardReportService.formatDate(c.caseBirthDate ?? null);
            c.resdEndDatestr = this.openStandardReportService.formatDate(c.resdEndDate ?? null);
            c.idEndDatestr = this.openStandardReportService.formatDate(c.idEndDate ?? null);
            c.totIncomestr = c.totIncome ? c.totIncome.toString() : null;
            c.totDutiesstr = c.totDuties ? c.totDuties.toString() : null;
          });
          this.pagination.totalCount = response.totalCount || 0;
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }

  // Case Details Methods
  onShowMore(caseId: string, entityId: string): void {
    // Explicitly reset Aid Requests actions to ensure they're correct
    this.setAidRequestsActions();
    // Close any open menu in the main grid to avoid lingering 'Show More' overlay
    if (this.genericTable && typeof (this.genericTable as any).closeActionMenu === 'function') {
      (this.genericTable as any).closeActionMenu();
    }
    
    this.getCaseDetails(caseId, entityId);
    this.loadAidRequestsForCase(entityId, caseId); // Pass caseId as caseName parameter
  }

  // Method to explicitly set Aid Requests actions
  private setAidRequestsActions(): void {
    this.aidRequestsRowActions = [
      { label: 'Show ', icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: 'Study Details', icon: 'icon-frame-view', action: 'onViewStudyDetailsInfo' }
    ];
    
    this.filteredAidRequestsRowActions = [
      { label: 'Show ', icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: 'Study Details', icon: 'icon-frame-view', action: 'onViewStudyDetailsInfo' }
    ];
    
    this.aidRequestsModalActions = [
      { label: 'Show ', icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: 'Study Details', icon: 'icon-frame-view', action: 'onViewStudyDetailsInfo' }
    ];
  }

  getCaseDetails(caseId: string, entityId: string): void {
    this.spinnerService.show();
    
    this.spCasesService.getCaseDetails(caseId, entityId)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (result: CasesSearchDto) => {
          this.loadCaseDetailsData = result;
          
          // Format dates - using the correct field names from API response
          this.loadCaseDetailsData.birthdatEstr = this.openStandardReportService.formatDate(this.loadCaseDetailsData.birthdate ?? null);
          this.loadCaseDetailsData.startdatEstr = this.openStandardReportService.formatDate(this.loadCaseDetailsData.startdate ?? null);
          this.loadCaseDetailsData.conT_END_DATEstr = this.openStandardReportService.formatDate(this.loadCaseDetailsData.conT_END_DATE ?? null);
          this.loadCaseDetailsData.diseaS_DATEstr = this.openStandardReportService.formatDate(this.loadCaseDetailsData.diseaS_DATE ?? null);
          this.loadCaseDetailsData.fatherdeathdatEstr = this.openStandardReportService.formatDate(this.loadCaseDetailsData.fatherdeathdate ?? null);
          this.loadCaseDetailsData.motherdeatHstr = this.openStandardReportService.formatDate(this.loadCaseDetailsData.motherdeath ?? null);
          
          const modalElement = document.getElementById('viewCaseDetails');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
          
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }

  // Aid Requests Grid Methods
  loadAidRequestsForCase(entityId: string, caseName: string | null): void {
    // Create request body with specific structure as required by the API
    const requestBody = {
      aidType: null,
      aidTypestr: null,
      branch: null,
      branchstr: null,
      caseIdNo: null,
      caseIdNostr: null,
      caseName: caseName, // This will be the caseId from the main grid
      caseNamestr: null,
      caseNo: null,
      caseNostr: null,
      city: null,
      citystr: null,
      entityId: entityId,
      entityIdstr: null,
      gender: null,
      genderstr: null,
      nationality: null,
      nationalitystr: null,
      orderByValue: 'details1.CASE_CODE asc',
      phone: null,
      phonestr: null,
      skip: this.aidRequestsSearchParams.skip,
      source: null,
      sourcestr: null,
      take: this.aidRequestsPagination.take
    };
    
    this.spCasesService.getAidRequestsForCase(requestBody)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.aidRequestsGridData = response.data || [];
          this.aidRequestsGridData.forEach((c) => {
            c.comitY_DATEstr = this.openStandardReportService.formatDate(c.comitY_DATE ?? null);
          });
          this.aidRequestsPagination.totalCount = response.data[0]?.rowsCount || 0;
        },
        error: () => {
          // Handle error
        }
      });
  }

  onAidRequestsPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.aidRequestsPagination.currentPage = event.pageNumber;
    this.aidRequestsPagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.aidRequestsSearchParams.skip = skip;
    this.aidRequestsSearchParams.take = event.pageSize;
    
    // Maintain the caseName (which is the caseId) when paginating
    this.loadAidRequestsForCase(this.aidRequestsSearchParams.entityId!, this.aidRequestsSearchParams.caseName);
  }

  // Column Definitions
  public buildColumnDefs(): void {
    this.translate.get([
      // 'SpCasesResourceName.entityName',
      'SpCasesResourceName.caseName',
      'SpCasesResourceName.caseNo',
      'SpCasesResourceName.nationalityDesc',
      'SpCasesResourceName.genderDesc',
      'SpCasesResourceName.birthLocation',
      'SpCasesResourceName.city',
      'SpCasesResourceName.phone',
      // 'SpCasesResourceName.appDate',
      'SpCasesResourceName.branchDesc',
      'SpCasesResourceName.appTypeDesc',
      'SpCasesResourceName.wifeName',
      'SpCasesResourceName.maritalStatusDesc',
      'SpCasesResourceName.healthStatusDesc',
      // 'SpCasesResourceName.jobDesc',
      // 'SpCasesResourceName.requestStatusDesc'
    ]).subscribe(translations => {
      this.columnDefs = [
        // { headerName: translations['SpCasesResourceName.entityName'], field: 'entityId', width: 200 },
        { headerName: translations['SpCasesResourceName.caseName'], field: 'nameAr', width: 200 },
        { headerName: translations['SpCasesResourceName.caseNo'], field: 'caseNo', width: 150 },
        { headerName: translations['SpCasesResourceName.nationalityDesc'], field: 'nationalityDesc', width: 150 },
        { headerName: translations['SpCasesResourceName.genderDesc'], field: 'genderDesc', width: 120 },
        { headerName: translations['SpCasesResourceName.birthLocation'], field: 'regionName', width: 150 },
        { headerName: translations['SpCasesResourceName.city'], field: 'cityDesc', width: 150 },
        { headerName: translations['SpCasesResourceName.phone'], field: 'htel', width: 150 },
        // { headerName: translations['SpCasesResourceName.appDate'], field: 'appDatestr', width: 150 },
        { headerName: translations['SpCasesResourceName.branchDesc'], field: 'branchDesc', width: 150 },
        { headerName: translations['SpCasesResourceName.appTypeDesc'], field: 'appTypeDesc', width: 150 },
        { headerName: translations['SpCasesResourceName.wifeName'], field: 'wifeName', width: 150 },
        { headerName: translations['SpCasesResourceName.maritalStatusDesc'], field: 'maritalStatusDesc', width: 150 },
        { headerName: translations['SpCasesResourceName.healthStatusDesc'], field: 'healthStatusDesc', width: 150 },
        // { headerName: translations['SpCasesResourceName.jobDesc'], field: 'jobDesc', width: 150 },
        // { headerName: translations['SpCasesResourceName.requestStatusDesc'], field: 'requestStatusDesc', width: 150 },
      ];
    });
  }

  // Helper method to get entity name based on current language
  private getEntityDisplayName(entity: any): string {
    if (!entity) return '';
    
    const currentLang = this.translate.currentLang || this.translate.defaultLang;
    
    if (currentLang === 'ar') {
      return entity.entitY_NAME || entity.entitY_NAME_EN || '';
    } else {
      return entity.entitY_NAME_EN || entity.entitY_NAME || '';
    }
  }


  public buildAidRequestsColumnDefs(): void {
    this.translate.get([
      // 'AidRequestsResourceName.entitY_NAME',
      'AidRequestsResourceName.namE_AR',
      'AidRequestsResourceName.source',
      'AidRequestsResourceName.aiD_TYPE',
      'AidRequestsResourceName.comitY_DATE',
      'AidRequestsResourceName.requesT_TYPE_DESC',
      'AidRequestsResourceName.status',
      'AidRequestsResourceName.caseNo',
      'AidRequestsResourceName.amount'
    ]).subscribe(translations => {
      this.aidRequestsColumnDefs = [
        // { headerName: translations['AidRequestsResourceName.entitY_NAME'], field: 'entitY_NAME', width: 200 },
        { headerName: translations['AidRequestsResourceName.namE_AR'], field: 'namE_AR', width: 200 },
        { headerName: translations['AidRequestsResourceName.source'], field: 'sourcE_DESC', width: 200 },
        { headerName: translations['AidRequestsResourceName.aiD_TYPE'], field: 'aiD_TYPE', width: 200 },
        { headerName: translations['AidRequestsResourceName.comitY_DATE'], field: 'comitY_DATEstr', width: 200 },
        { headerName: translations['AidRequestsResourceName.requesT_TYPE_DESC'], field: 'requesT_TYPE_DESC', width: 200 },
        { headerName: translations['AidRequestsResourceName.status'], field: 'statuS_DESC', width: 200 },
        { headerName: translations['AidRequestsResourceName.caseNo'], field: 'casE_NO', width: 200 },
        { headerName: translations['AidRequestsResourceName.amount'], field: 'amount', width: 200 },
      ];
    });
  }

  // Table Actions
  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onShowMore') {
      this.onShowMore(event.row.caseId, event.row.entityId);
    }
  }

  onAidRequestsTableAction(event: { action: string, row: any }) {
    var data = event.row.composeKey.split(',');
    var source = data[0];
    var studyId = data[1];
    var caseCode = data[2];
    var entityId = data[3];
    var caseid = data[4];

    if (event.action === 'onViewInfo') {
      this.getFormDatabyId(caseCode, entityId, caseid);
    }
    if (event.action === 'onViewStudyDetailsInfo') {
      this.getStudyDetailsFormDatabyId(source, entityId, studyId);
    }
  }

  // Aid Requests Detail Methods (copied from aidRequests component)
  getFormDatabyId(caseCode: string, entityId: string, caseid: string): void {
    const params: filteraidRequestsByIdDto = {
      entityId: entityId,
      caseCode: caseCode,
      headerId: null,
      caseId: caseid,
    };

    this.spinnerService.show();
    forkJoin({
      showdetailheaderdata: this.aidRequestsService.getShowDetailById(params) as Observable<aidRequestsShowDetailsDto | aidRequestsShowDetailsDto[]>,
    })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          this.loadformData = Array.isArray(result.showdetailheaderdata)
            ? result.showdetailheaderdata[0] ?? ({} as aidRequestsShowDetailsDto)
            : result.showdetailheaderdata;
          this.loadformData.aiD_REQUEST_DATEstr = this.openStandardReportService.formatDate(this.loadformData.aiD_REQUEST_DATE ?? null);
          this.loadformData.casE_BIRTH_DATEstr = this.openStandardReportService.formatDate(this.loadformData.casE_BIRTH_DATE ?? null);
          this.loadformData.iD_END_DATEstr = this.openStandardReportService.formatDate(this.loadformData.iD_END_DATE ?? null);
          this.loadformData.wifeiD_END_DATEstr = this.openStandardReportService.formatDate(this.loadformData.wifeiD_END_DATE ?? null);
          
          const modalElement = document.getElementById('viewdetails');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
          this.spinnerService.hide();
        },
        error: (err) => {
          this.spinnerService.hide();
        }
      });
  }

  getStudyDetailsFormDatabyId(source: string, entityId: string, studyId: string): void {
    const params: filteraidRequestsByIdDto = {
      entityId: entityId,
      headerId: studyId,
      caseCode: null,
      caseId: null
    };

    this.spinnerService.show();
    
    if (source == '1') {
      forkJoin({
        showstudydetaildata: this.aidRequestsService.getAidRequestsStudyById(params) as Observable<aidRequestsStudyDetailsDto | aidRequestsStudyDetailsDto[]>,
      })
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (result) => {
            this.loadstudydetailformData = Array.isArray(result.showstudydetaildata)
              ? result.showstudydetaildata[0] ?? ({} as aidRequestsStudyDetailsDto)
              : result.showstudydetaildata;

            const modalElement = document.getElementById('viewstudydetails');
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }
            this.spinnerService.hide();
          },
          error: (err) => {
            this.toastr.info(this.translate.instant(err.error.reason));
            this.spinnerService.hide();
          }
        });
    }
    else if (source == '5') {
      forkJoin({
        showstudydetaildata: this.aidRequestsService.getQuotationHeaderDetailById(params) as Observable<aidRequestsStudyDetailsDto | aidRequestsStudyDetailsDto[]>,
      })
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (result) => {
            this.loadstudydetailformData = Array.isArray(result.showstudydetaildata)
              ? result.showstudydetaildata[0] ?? ({} as aidRequestsStudyDetailsDto)
              : result.showstudydetaildata;

            const modalElement = document.getElementById('viewquotationdetails');
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }
            this.spinnerService.hide();
          },
          error: (err) => {
            this.toastr.info(this.translate.instant(err.error.reason));
            this.spinnerService.hide();
          }
        });
    }
    else if (source == '6') {
      forkJoin({
        showstudydetaildata: this.aidRequestsService.getZakatStudyDetailById(params) as Observable<aidRequestsStudyDetailsDto | aidRequestsStudyDetailsDto[]>,
      })
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (result) => {
            this.loadstudydetailformData = Array.isArray(result.showstudydetaildata)
              ? result.showstudydetaildata[0] ?? ({} as aidRequestsStudyDetailsDto)
              : result.showstudydetaildata;

            const modalElement = document.getElementById('viewzakatdetails');
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }
            this.spinnerService.hide();
          },
          error: (err) => {
            this.spinnerService.hide();
          }
        });
    }
    else {
      // Handle unknown source values - hide spinner and show error message
      this.spinnerService.hide();
      this.toastr.error(this.translate.instant('Common.UnknownSource') || 'Unknown source type');
    }
  }

  // Excel Export
  printExcel(): void {
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.spCasesService.getAllAidRequestGridData({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse.totalCount || initialResponse?.data?.length || 0;

          this.spCasesService.getAllAidRequestGridData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('SpCasesResourceName.Title'),
                  reportTitle: this.translate.instant('SpCasesResourceName.Title'),
                  fileName: `${this.translate.instant('SpCasesResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    // { label: this.translate.instant('SpCasesResourceName.entityId'), value: this.searchParams.entityId },
                    { label: this.translate.instant('SpCasesResourceName.caseId'), value: this.searchParams.caseId },
                    { label: this.translate.instant('SpCasesResourceName.caseNo'), value: this.searchParams.caseNo },
                    { label: this.translate.instant('SpCasesResourceName.nationality'), value: this.searchParams.nationality },
                    { label: this.translate.instant('SpCasesResourceName.city'), value: this.searchParams.city },
                    { label: this.translate.instant('SpCasesResourceName.gender'), value: this.searchParams.gender },
                    { label: this.translate.instant('SpCasesResourceName.caseIdNo'), value: this.searchParams.caseIdNo },
                    { label: this.translate.instant('SpCasesResourceName.wifeIdNo'), value: this.searchParams.wifeIdNo },
                    { label: this.translate.instant('SpCasesResourceName.phone'), value: this.searchParams.phone },
                    { label: this.translate.instant('SpCasesResourceName.branch'), value: this.searchParams.branch },
                    { label: this.translate.instant('SpCasesResourceName.aidType'), value: this.searchParams.aidType },
                    { label: this.translate.instant('SpCasesResourceName.source'), value: this.searchParams.source },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    // { label: this.translate.instant('SpCasesResourceName.entityName'), key: 'entityId' },
                    { label: this.translate.instant('SpCasesResourceName.caseName'), key: 'nameAr' },
                    { label: this.translate.instant('SpCasesResourceName.caseNo'), key: 'caseNo' },
                    { label: this.translate.instant('SpCasesResourceName.nationalityDesc'), key: 'nationalityDesc' },
                    { label: this.translate.instant('SpCasesResourceName.genderDesc'), key: 'genderDesc' },
                    { label: this.translate.instant('SpCasesResourceName.birthLocation'), key: 'regionName' },
                    { label: this.translate.instant('SpCasesResourceName.city'), key: 'cityDesc' },
                    { label: this.translate.instant('SpCasesResourceName.phone'), key: 'htel' },
                    // { label: this.translate.instant('SpCasesResourceName.appDate'), key: 'appDatestr' },
                    { label: this.translate.instant('SpCasesResourceName.branchDesc'), key: 'branchDesc' },
                    { label: this.translate.instant('SpCasesResourceName.appTypeDesc'), key: 'appTypeDesc' },
                    { label: this.translate.instant('SpCasesResourceName.wifeName'), key: 'wifeName' },
                    { label: this.translate.instant('SpCasesResourceName.maritalStatusDesc'), key: 'maritalStatusDesc' },
                    { label: this.translate.instant('SpCasesResourceName.healthStatusDesc'), key: 'healthStatusDesc' },
                    // { label: this.translate.instant('SpCasesResourceName.jobDesc'), key: 'jobDesc' },
                    // { label: this.translate.instant('SpCasesResourceName.requestStatusDesc'), key: 'requestStatusDesc' },
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
}