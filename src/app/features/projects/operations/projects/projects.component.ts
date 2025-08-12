import { Component, ViewChild } from '@angular/core';
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
import { filterprojectsDto, filterprojectsByIdDto, projectsDto, recieptProjectsDetailsDto, projectImplementDto } from '../../../../core/dtos/projects/operations/projects.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { projectsService } from '../../../../core/services/projects/operations/projects.service';

declare var bootstrap: any;

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})

export class projectsComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  paginationLineData = new Pagination();
  paginationDetailsData = new Pagination();

  columnDefs: ColDef[] = [];
  columnDefsLineData: ColDef[] = [];
  columnDefsDetailsData: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];


  searchParams = new filterprojectsDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new filterprojectsByIdDto();

  loadgridData: projectsDto[] = [];
  loadformData: projectsDto = {} as projectsDto;
  loadformLineData: recieptProjectsDetailsDto[] = [];
  loadformDetailsData: projectImplementDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  loadingentity = false;
  entitysearchParams = new Select2RequestDto();
  selectedentitySelect2Obj: any = null;
  entitySearchInput$ = new Subject<string>();

  statusSelect2: SelectdropdownResultResults[] = [];
  loadingstatus = false;
  statussearchParams = new Select2RequestDto();
  selectedstatusSelect2Obj: any = null;
  statusSearchInput$ = new Subject<string>();

  projectNameSelect2: SelectdropdownResultResults[] = [];
  loadingprojectName = false;
  projectNamesearchParams = new Select2RequestDto();
  selectedprojectNameSelect2Obj: any = null;
  projectNameSearchInput$ = new Subject<string>();

  benNameSelect2: SelectdropdownResultResults[] = [];
  loadingbenName = false;
  benNamesearchParams = new Select2RequestDto();
  selectedbenNameSelect2Obj: any = null;
  benNameSearchInput$ = new Subject<string>();

  projecttypeSelect2: SelectdropdownResultResults[] = [];
  loadingprojecttype = false;
  projecttypesearchParams = new Select2RequestDto();
  selectedprojecttypeSelect2Obj: any = null;
  projecttypeSearchInput$ = new Subject<string>();

  countrySelect2: SelectdropdownResultResults[] = [];
  loadingcountry = false;
  countrysearchParams = new Select2RequestDto();
  selectedcountrySelect2Obj: any = null;
  countrySearchInput$ = new Subject<string>();

  constructor(
    private projectsService: projectsService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
    ];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.statusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchstatusSelect2());

    this.projectNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchprojectNameSelect2());

    this.benNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbenNameSelect2());

    this.projecttypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchprojecttypeSelect2());

    this.countrySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcountrySelect2());

    this.fetchentitySelect2();
    this.fetchstatusSelect2();
    this.fetchbenNameSelect2();
    this.fetchprojectNameSelect2();
    this.fetchprojecttypeSelect2();
    this.fetchcountrySelect2();
  }


  onentitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;

    this.entitysearchParams.skip = 0;
    this.entitysearchParams.searchValue = searchVal;
    this.entitySelect2 = [];
    this.entitySearchInput$.next(search);
  }

  loadMoreentity(): void {
    this.entitysearchParams.skip++;
    this.fetchentitySelect2();
  }

  fetchentitySelect2(): void {
    this.loadingentity = true;
    this.searchSelect2Params.searchValue = this.entitysearchParams.searchValue;
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

  onentitySelect2Change(slelectedentity: any): void {
    if (slelectedentity) {
      this.searchParams.entityId = slelectedentity.id;
      this.searchParams.entityIdstr = slelectedentity.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }


  onstatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.statussearchParams.skip = 0;
    this.statussearchParams.searchValue = searchVal;
    this.statusSelect2 = [];
    this.statusSearchInput$.next(search);
  }

  loadMorestatus(): void {
    this.statussearchParams.skip++;
    this.fetchstatusSelect2();
  }

  fetchstatusSelect2(): void {
    this.loadingstatus = true;
    this.searchSelect2Params.searchValue = this.statussearchParams.searchValue;
    this.searchSelect2Params.skip = this.statussearchParams.skip;
    this.searchSelect2Params.take = this.statussearchParams.take;

    this.Select2Service.getArMiscStatusSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.statusSelect2 = response?.results || [];
          this.loadingstatus = false;
        },
        error: () => this.loadingstatus = false
      });
  }

  onstatusSelect2Change(selectedstatus: any): void {
    if (selectedstatus) {
      this.searchParams.status = selectedstatus.id;
      this.searchParams.statusstr = selectedstatus.text;
    } else {
      this.searchParams.status = null;
      this.searchParams.statusstr = null;
    }
  }

  onprojectNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.projectNamesearchParams.skip = 0;
    this.projectNamesearchParams.searchValue = search;
    this.projectNameSelect2 = [];
    this.projectNameSearchInput$.next(search);
  }

  loadMoreprojectName(): void {
    this.projectNamesearchParams.skip++;
    this.fetchprojectNameSelect2();
  }

  fetchprojectNameSelect2(): void {
    this.loadingprojectName = true;
    this.searchSelect2Params.searchValue = this.projectNamesearchParams.searchValue;
    this.searchSelect2Params.skip = this.projectNamesearchParams.skip;
    this.searchSelect2Params.take = this.projectNamesearchParams.take;
    this.Select2Service.getProjectNameSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.projectNameSelect2 = response?.results || [];
          this.loadingprojectName = false;
        },
        error: () => this.loadingprojectName = false
      });
  }

  onprojectNameSelect2Change(selectedprojectName: any): void {
    if (selectedprojectName) {
      this.searchParams.projectName = selectedprojectName.id;
      this.searchParams.projectNamestr = selectedprojectName.text;
    } else {
      this.searchParams.projectName = null;
      this.searchParams.projectNamestr = null;
    }
  }

  onbenNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.benNamesearchParams.skip = 0;
    this.benNamesearchParams.searchValue = search;
    this.benNameSelect2 = [];
    this.benNameSearchInput$.next(search);
  }

  loadMorebenName(): void {
    this.benNamesearchParams.skip++;
    this.fetchbenNameSelect2();
  }

  fetchbenNameSelect2(): void {
    this.loadingbenName = true;
    this.searchSelect2Params.searchValue = this.benNamesearchParams.searchValue;
    this.searchSelect2Params.skip = this.benNamesearchParams.skip;
    this.searchSelect2Params.take = this.benNamesearchParams.take;

    this.Select2Service.getBenNameSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.benNameSelect2 = response?.results || [];
          this.loadingbenName = false;
        },
        error: () => this.loadingbenName = false
      });
  }

  onbenNameSelect2Change(selectbenName: any): void {
    if (selectbenName) {
      this.searchParams.benificentId = selectbenName.id;
      this.searchParams.benificentIdstr = selectbenName.text;
    } else {
      this.searchParams.benificentId = null;
      this.searchParams.benificentIdstr = null;
    }
  }

  onprojecttypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.projecttypesearchParams.skip = 0;
    this.projecttypesearchParams.searchValue = search;
    this.projecttypeSelect2 = [];
    this.projecttypeSearchInput$.next(search);
  }

  loadMoreprojecttype(): void {
    this.projecttypesearchParams.skip++;
    this.fetchprojecttypeSelect2();
  }

  fetchprojecttypeSelect2(): void {
    this.loadingprojecttype = true;
    this.searchSelect2Params.searchValue = this.projecttypesearchParams.searchValue;
    this.searchSelect2Params.skip = this.projecttypesearchParams.skip;
    this.searchSelect2Params.take = this.projecttypesearchParams.take;

    this.Select2Service.getScProjectTypeSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.projecttypeSelect2 = response?.results || [];
          this.loadingprojecttype = false;
        },
        error: () => this.loadingprojecttype = false
      });
  }

  onprojecttypeSelect2Change(selectprojecttype: any): void {
    if (selectprojecttype) {
      this.searchParams.projectTypeDesc = selectprojecttype.id;
      this.searchParams.projectTypeDescstr = selectprojecttype.text;
    } else {
      this.searchParams.projectTypeDesc = null;
      this.searchParams.projectTypeDescstr = null;
    }
  }

  oncountrySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
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
    this.searchSelect2Params.searchValue = this.countrysearchParams.searchValue;
    this.searchSelect2Params.skip = this.countrysearchParams.skip;
    this.searchSelect2Params.take = this.countrysearchParams.take;

    this.Select2Service.getCountrySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.countrySelect2 = response?.results || [];
          this.loadingcountry = false;
        },
        error: () => this.loadingcountry = false
      });
  }

  oncountrySelect2Change(selectcountry: any): void {
    if (selectcountry) {
      this.searchParams.countryCode = selectcountry.id;
      this.searchParams.countryCodestr = selectcountry.text;
    } else {
      this.searchParams.countryCode = null;
      this.searchParams.countryCodestr = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onPageChangeLineData(event: { pageNumber: number; pageSize: number }): void {
    this.paginationLineData.currentPage = event.pageNumber;
    this.paginationLineData.take = event.pageSize;
    this.getLoadDataGrid({ pageNumber: event.pageNumber, pageSize: event.pageSize });
  }

  onTableSearchLineData(text: string): void {
    this.searchText = text;
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.paginationLineData.take });
  }

  onPageChangeDetailsData(event: { pageNumber: number; pageSize: number }): void {
    this.paginationDetailsData.currentPage = event.pageNumber;
    this.paginationDetailsData.take = event.pageSize;
    this.getLoadDataGrid({ pageNumber: event.pageNumber, pageSize: event.pageSize });
  }

  onTableSearchDetailsData(text: string): void {
    this.searchText = text;
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.paginationDetailsData.take });
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
    this.searchParams = new filterprojectsDto();
    this.loadgridData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
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
    const skip = (event.pageNumber - 1);
    this.searchParams.skip = skip;
   
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();

    this.projectsService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
          this.loadgridData = response.data || [];
          this.pagination.totalCount = response.data[0]?.rowsCount || 0;
          this.spinnerService.hide();
      },
        error: (error) => {
          this.spinnerService.hide();;
      }
    });
  }

  getFormDatabyId(projectId: string, entitY_ID: string): void {
    const params: filterprojectsByIdDto = {
      entityId: entitY_ID,
      projectId: projectId
    };
    this.spinnerService.show();;
    forkJoin({
      mischeaderdata: this.projectsService.getDetailById(params) as Observable<projectsDto | projectsDto[]>,
      miscdetaildata: this.projectsService.getProjectImplementDetailById(params) as Observable<projectImplementDto[]>,
      misclinedata: this.projectsService.getRecieptProjectsDetailsId(params) as Observable<recieptProjectsDetailsDto[]>
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformDetailsData = result.miscdetaildata ?? [];
        this.loadformLineData = result.misclinedata ?? [];
        this.loadformData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as projectsDto)
          : result.mischeaderdata;
        const modalElement = document.getElementById('viewdetails');;
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        };
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
     }
    });
  }

  private buildColumnDefs(): void {
    this.translate.get([
      'ProjectsResourceName.projecT_NUMBER',
      'ProjectsResourceName.projecT_NAME',
      'ProjectsResourceName.statuS_DESC',
      'ProjectsResourceName.cost',
      'ProjectsResourceName.applicatioN_DATE',
      'ProjectsResourceName.projecT_TYPE_DESC',
      'ProjectsResourceName.sC_PROJECTS_CATEGORIES_DESC',
      'ProjectsResourceName.arabiC_COUNTRY_NAME',
      'ProjectsResourceName.projecT_DESC',
    ]).subscribe(translations => {
      this.columnDefs = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['ProjectsResourceName.projecT_NUMBER'], field: 'projecT_NUMBER', width: 200 },
        { headerName: translations['ProjectsResourceName.projecT_NAME'], field: 'projecT_NAME', width: 200 },
        { headerName: translations['ProjectsResourceName.statuS_DESC'], field: 'statuS_DESC', width: 200 },
        { headerName: translations['ProjectsResourceName.cost'], field: 'cost', width: 200 },
        { headerName: translations['ProjectsResourceName.applicatioN_DATE'], field: 'applicatioN_DATEstr', width: 200 },
        { headerName: translations['ProjectsResourceName.projecT_TYPE_DESC'], field: 'projecT_TYPE_DESC', width: 200 },
        { headerName: translations['ProjectsResourceName.sC_PROJECTS_CATEGORIES_DESC'], field: 'sC_PROJECTS_CATEGORIES_DESC', width: 200 },
        { headerName: translations['ProjectsResourceName.arabiC_COUNTRY_NAME'], field: 'arabiC_COUNTRY_NAME', width: 200 },
        { headerName: translations['ProjectsResourceName.projecT_DESC'], field: 'projecT_DESC', width: 200 },
      ];
    });

    this.translate.get([
      'ProjectsResourceName.receipT_NUMBER',
      'ProjectsResourceName.misC_RECEIPT_DATE',
      'ProjectsResourceName.misC_RECEIPT_AMOUNT',
      'ProjectsResourceName.beneficiarY_NAME',
      'ProjectsResourceName.notes',
    ]).subscribe(translations => {
      this.columnDefsLineData = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationLineData.currentPage - 1) * this.paginationLineData.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['ProjectsResourceName.receipT_NUMBER'], field: 'receipT_NUMBER', width: 200 },
        { headerName: translations['ProjectsResourceName.misC_RECEIPT_DATE'], field: 'misC_RECEIPT_DATEstr', width: 200 },
        { headerName: translations['ProjectsResourceName.misC_RECEIPT_AMOUNT'], field: 'misC_RECEIPT_AMOUNTstr', width: 200 },
        { headerName: translations['ProjectsResourceName.beneficiarY_NAME'], field: 'beneficiarY_NAME', width: 200 },
        { headerName: translations['ProjectsResourceName.notes'], field: 'notes', width: 200 },
      ];
    });

    this.translate.get([
      'ProjectsResourceName.implemenT_NUM',
      'ProjectsResourceName.implemenT_DATE',
      'ProjectsResourceName.imP_TYPE_DESC',
      'ProjectsResourceName.starT_IMPLEMENT',
      'ProjectsResourceName.finisH_DATE',
      'ProjectsResourceName.implemenT_STATUS_DESC',
    ]).subscribe(translations => {
      this.columnDefsDetailsData = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationDetailsData.currentPage - 1) * this.paginationDetailsData.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['ProjectsResourceName.implemenT_NUM'], field: 'implemenT_NUM', width: 200 },
        { headerName: translations['ProjectsResourceName.implemenT_DATE'], field: 'implemenT_DATEstr', width: 200 },
        { headerName: translations['ProjectsResourceName.imP_TYPE_DESC'], field: 'imP_TYPE_DESC', width: 200 },
        { headerName: translations['ProjectsResourceName.starT_IMPLEMENT'], field: 'starT_IMPLEMENT', width: 200 },
        { headerName: translations['ProjectsResourceName.finisH_DATE'], field: 'finisH_DATEstr', width: 200 },
        { headerName: translations['ProjectsResourceName.implemenT_STATUS_DESC'], field: 'implemenT_STATUS_DESC', width: 200 },
      ];
    });
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId(event.row.projecT_ID, event.row.entitY_ID);
    }
    if (event.action === 'edit') {
    }
  }



  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ProjectsResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ProjectsResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
   
    this.projectsService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.data[0].rowsCount || initialResponse?.data?.length || 0;

          this.projectsService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ProjectsResourceName.Title'),
                  reportTitle: this.translate.instant('ProjectsResourceName.Title'),
                  fileName: `${this.translate.instant('ProjectsResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('ProjectsResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('ProjectsResourceName.projectNumber'), value: this.searchParams.projectNumber },
                    { label: this.translate.instant('ProjectsResourceName.projectName'), value: this.searchParams.projectNamestr },
                    { label: this.translate.instant('ProjectsResourceName.status'), value: this.searchParams.statusstr },
                    { label: this.translate.instant('ProjectsResourceName.benificentId'), value: this.searchParams.benificentIdstr },
                    { label: this.translate.instant('ProjectsResourceName.projectTypeDesc'), value: this.searchParams.projectTypeDescstr },
                    { label: this.translate.instant('ProjectsResourceName.countryCode'), value: this.searchParams.countryCodestr },
                    { label: this.translate.instant('ProjectsResourceName.applicationDate'), value: this.searchParams.applicationDatestr },
                  ],

                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ProjectsResourceName.projecT_NUMBER'), key: 'projecT_NUMBER' },
                    { label: this.translate.instant('ProjectsResourceName.projecT_NAME'), key: 'projecT_NAME' },
                    { label: this.translate.instant('ProjectsResourceName.statuS_DESC'), key: 'statuS_DESC' },
                    { label: this.translate.instant('ProjectsResourceName.cost'), key: 'cost' },
                    { label: this.translate.instant('ProjectsResourceName.applicatioN_DATE'), key: 'applicatioN_DATEstr' },
                    { label: this.translate.instant('ProjectsResourceName.projecT_TYPE_DESC'), key: 'projecT_TYPE_DESC' },
                    { label: this.translate.instant('ProjectsResourceName.sC_PROJECTS_CATEGORIES_DESC'), key: 'sC_PROJECTS_CATEGORIES_DESC' },
                    { label: this.translate.instant('ProjectsResourceName.arabiC_COUNTRY_NAME'), key: 'arabiC_COUNTRY_NAME' },
                    { label: this.translate.instant('ProjectsResourceName.projecT_DESC'), key: 'projecT_DESC' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['cost']
                };

                this.openStandardReportService.openStandardReportExcel(reportConfig);
                this.spinnerService.hide();;
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

