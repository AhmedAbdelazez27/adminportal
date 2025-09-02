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
import { aidRequestsDto, aidRequestsShowDetailsDto, aidRequestsStudyDetailsDto, filteraidRequestsByIdDto, filteraidRequestsDto } from '../../../../core/dtos/socialcases/operations/aidRequests.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { aidRequestsService } from '../../../../core/services/socialcases/operations/aidRequests.service';

declare var bootstrap: any;


@Component({
  selector: 'app-aidRequests',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './aidRequests.component.html',
  styleUrls: ['./aidRequests.component.scss']
})

export class aidRequestsComponent {
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


  searchParams = new filteraidRequestsDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new filteraidRequestsByIdDto();

  loadgridData: aidRequestsDto[] = [];
  loadformData: aidRequestsShowDetailsDto = {} as aidRequestsShowDetailsDto;
  loadstudydetailformData: aidRequestsStudyDetailsDto = {} as aidRequestsStudyDetailsDto;

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

  branchSelect2: SelectdropdownResultResults[] = [];
  loadingbranch = false;
  branchsearchParams = new Select2RequestDto();
  selectedbranchSelect2Obj: any = null;
  branchSearchInput$ = new Subject<string>();

  aidTypeSelect2: SelectdropdownResultResults[] = [];
  loadingaidType = false;
  aidTypesearchParams = new Select2RequestDto();
  selectedaidTypeSelect2Obj: any = null;
  aidTypeSearchInput$ = new Subject<string>();

  nationalitySelect2: SelectdropdownResultResults[] = [];
  loadingnationality = false;
  nationalitysearchParams = new Select2RequestDto();
  selectednationalitySelect2Obj: any = null;
  nationalitySearchInput$ = new Subject<string>();

  citySelect2: SelectdropdownResultResults[] = [];
  loadingcity = false;
  citysearchParams = new Select2RequestDto();
  selectedcitySelect2Obj: any = null;
  citySearchInput$ = new Subject<string>();

  genderSelect2: SelectdropdownResultResults[] = [];
  loadinggender = false;
  gendersearchParams = new Select2RequestDto();
  selectedgenderSelect2Obj: any = null;
  genderSearchInput$ = new Subject<string>();

  sourceSelect2: SelectdropdownResultResults[] = [];
  loadingsource = false;
  sourcesearchParams = new Select2RequestDto();
  selectedsourceSelect2Obj: any = null;
  sourceSearchInput$ = new Subject<string>();

  constructor(
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
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: this.translate.instant('Common.StudyDetails'), icon: 'icon-frame-view', action: 'onViewStudyDetailsInfo' },
    ];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.caseNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseNameSelect2());

    this.branchSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbranchSelect2());

    this.aidTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchaidTypeSelect2());

    this.nationalitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchnationalitySelect2());

    this.citySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcitySelect2());

    this.genderSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchgenderSelect2());

    this.sourceSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchsourceSelect2());

    this.fetchentitySelect2();
    this.fetchcaseNameSelect2();
    this.fetchbranchSelect2();
    this.fetchaidTypeSelect2();
    this.fetchnationalitySelect2();
    this.fetchcitySelect2();
    this.fetchgenderSelect2();
    this.fetchsourceSelect2();
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

  onentitySelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.entityId = selectedvendor.id;
      this.searchParams.entityIdstr = selectedvendor.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
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

  oncaseNameSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.caseName = selectedvendor.id;
      this.searchParams.caseNamestr = selectedvendor.text;
    } else {
      this.searchParams.caseName = null;
      this.searchParams.caseNamestr = null;
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

  onbranchSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.branch = selectedvendor.id;
      this.searchParams.branchstr = selectedvendor.text;
    } else {
      this.searchParams.branch = null;
      this.searchParams.branchstr = null;
    }
  }

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

  onaidTypeSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.aidType = selectedvendor.id;
      this.searchParams.aidTypestr = selectedvendor.text;
    } else {
      this.searchParams.aidType = null;
      this.searchParams.aidTypestr = null;
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

  onnationalitySelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.nationality = selectedvendor.id;
      this.searchParams.nationalitystr = selectedvendor.text;
    } else {
      this.searchParams.nationality = null;
      this.searchParams.nationalitystr = null;
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

  oncitySelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.city = selectedvendor.id;
      this.searchParams.citystr = selectedvendor.text;
    } else {
      this.searchParams.city = null;
      this.searchParams.citystr = null;
    }
  }

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

    this.Select2Service.getGenderSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.genderSelect2 = [...this.genderSelect2, ...newItems];
          this.loadinggender = false;
        },
        error: () => this.loadinggender = false
      });
  }

  ongenderSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.gender = selectedvendor.id;
      this.searchParams.genderstr = selectedvendor.text;
    } else {
      this.searchParams.gender = null;
      this.searchParams.genderstr = null;
    }
  }

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

  onsourceSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.source = selectedvendor.id;
      this.searchParams.sourcestr = selectedvendor.text;
    } else {
      this.searchParams.source = null;
      this.searchParams.sourcestr = null;
    }
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
    this.searchParams = new filteraidRequestsDto();
    this.loadgridData = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.entityId) {
      this.translate
        .get(['AidRequestsResourceName.entityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['AidRequestsResourceName.entityId']} ${translations['Common.Required']}`,
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
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();
    this.aidRequestsService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response.data || [];
          this.pagination.totalCount = response.data[0]?.rowsCount || 0;
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }

  getFormDatabyId(caseCode: string, entityId: string, caseid:string): void {
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

          const modalElement = document.getElementById('viewdetails');;
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          };

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
      caseId:null
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

            const modalElement = document.getElementById('viewstudydetails');;
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            };

            this.spinnerService.hide();
          },
          error: (err) => {
            this.toastr.info(this.translate.instant(err.error.reason)); 
            this.spinnerService.hide();
          }
        });
    }

    if (source == '5') {
      forkJoin({
        showstudydetaildata: this.aidRequestsService.getQuotationHeaderDetailById(params) as Observable<aidRequestsStudyDetailsDto | aidRequestsStudyDetailsDto[]>,
      })
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (result) => {
            this.loadstudydetailformData = Array.isArray(result.showstudydetaildata)
              ? result.showstudydetaildata[0] ?? ({} as aidRequestsStudyDetailsDto)
              : result.showstudydetaildata;

            const modalElement = document.getElementById('viewquotationdetails');;
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            };

            this.spinnerService.hide();
          },
          error: (err) => {
            this.spinnerService.hide();
          }
        });
    }

    if (source == '6') {
      forkJoin({
        showstudydetaildata: this.aidRequestsService.getZakatStudyDetailById(params) as Observable<aidRequestsStudyDetailsDto | aidRequestsStudyDetailsDto[]>,
      })
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (result) => {
            this.loadstudydetailformData = Array.isArray(result.showstudydetaildata)
              ? result.showstudydetaildata[0] ?? ({} as aidRequestsStudyDetailsDto)
              : result.showstudydetaildata;

            const modalElement = document.getElementById('viewzakatdetails');;
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            };

            this.spinnerService.hide();
          },
          error: (err) => {
            this.spinnerService.hide();
          }
        });
    }
  }

  public buildColumnDefs(): void {
    this.translate.get([
      'AidRequestsResourceName.entitY_NAME',
      'AidRequestsResourceName.namE_AR',
      'AidRequestsResourceName.gender',
      'AidRequestsResourceName.aiD_TYPE',
      'AidRequestsResourceName.comitY_DATE',
      'AidRequestsResourceName.requesT_TYPE_DESC',
      'AidRequestsResourceName.status',
      'AidRequestsResourceName.caseNo',
      'AidRequestsResourceName.amount'
    ]).subscribe(translations => {
      this.columnDefs = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['AidRequestsResourceName.entitY_NAME'], field: 'entitY_NAME', width: 200 },
        { headerName: translations['AidRequestsResourceName.namE_AR'], field: 'namE_AR', width: 200 },
        { headerName: translations['AidRequestsResourceName.gender'], field: 'sourcE_DESC', width: 200 },
        { headerName: translations['AidRequestsResourceName.aiD_TYPE'], field: 'aiD_TYPE', width: 200 },
        { headerName: translations['AidRequestsResourceName.comitY_DATE'], field: 'comitY_DATEstr', width: 200 },
        { headerName: translations['AidRequestsResourceName.requesT_TYPE_DESC'], field: 'requesT_TYPE_DESC', width: 200 },
        { headerName: translations['AidRequestsResourceName.status'], field: 'statuS_DESC', width: 200 },
        { headerName: translations['AidRequestsResourceName.caseNo'], field: 'casE_NO', width: 200 },
        { headerName: translations['AidRequestsResourceName.amount'], field: 'amountstr', width: 200 },
      ];
    });
  }

  onTableAction(event: { action: string, row: any }) {
    console.log("event", event);
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


  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['AidRequestsResourceName.entityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['AidRequestsResourceName.entityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.aidRequestsService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse.data[0]?.rowsCount || initialResponse?.data?.length || 0;

          this.aidRequestsService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('AidRequestsResourceName.Title'),
                  reportTitle: this.translate.instant('AidRequestsResourceName.Title'),
                  fileName: `${this.translate.instant('AidRequestsResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('AidRequestsResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('AidRequestsResourceName.caseName'), value: this.searchParams.caseNamestr },
                    { label: this.translate.instant('AidRequestsResourceName.branch'), value: this.searchParams.branchstr },
                    { label: this.translate.instant('AidRequestsResourceName.aidType'), value: this.searchParams.aidTypestr },
                    { label: this.translate.instant('AidRequestsResourceName.nationality'), value: this.searchParams.nationalitystr },
                    { label: this.translate.instant('AidRequestsResourceName.city'), value: this.searchParams.citystr },
                    { label: this.translate.instant('AidRequestsResourceName.gender'), value: this.searchParams.genderstr },
                    { label: this.translate.instant('AidRequestsResourceName.source'), value: this.searchParams.sourcestr },
                    { label: this.translate.instant('AidRequestsResourceName.caseIdNo'), value: this.searchParams.caseIdNo },
                    { label: this.translate.instant('AidRequestsResourceName.phone'), value: this.searchParams.phone },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('AidRequestsResourceName.entitY_NAME'), key: 'entitY_NAME' },
                    { label: this.translate.instant('AidRequestsResourceName.namE_AR'), key: 'namE_AR' },
                    { label: this.translate.instant('AidRequestsResourceName.sourcE_DESC'), key: 'sourcE_DESC' },
                    { label: this.translate.instant('AidRequestsResourceName.aiD_TYPE'), key: 'aiD_TYPE' },
                    { label: this.translate.instant('AidRequestsResourceName.comitY_DATE'), key: 'comitY_DATEstr' },
                    { label: this.translate.instant('AidRequestsResourceName.casE_ID_NUMBER'), key: 'casE_ID_NUMBER' },
                    { label: this.translate.instant('AidRequestsResourceName.requesT_TYPE_DESC'), key: 'requesT_TYPE_DESC' },
                    { label: this.translate.instant('AidRequestsResourceName.statuS_DESC'), key: 'statuS_DESC' },
                    { label: this.translate.instant('AidRequestsResourceName.casE_NO'), key: 'casE_NO' },
                    { label: this.translate.instant('AidRequestsResourceName.amount'), key: 'amountstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['amountstr']
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

