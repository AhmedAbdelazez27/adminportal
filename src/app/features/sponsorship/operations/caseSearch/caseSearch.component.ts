import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject, take } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { FndLookUpValuesSelect2RequestDto, Pagination, reportPrintConfig, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { Select2Service } from '../../../../core/services/Select2.service';
import { caseSearchService } from '../../../../core/services/sponsorship/operations/caseSearch.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { caseSearchDto, caseSearchPaymentHdrDto, filtercaseSearchByIdDto, filtercaseSearchDto, getCasesHistoryDto, getSpContractCasesDto, getSpContractDto } from '../../../../core/dtos/sponsorship/operations/caseSearch.dto';

declare var bootstrap: any;
@Component({
  selector: 'app-caseSearch',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectModule],
  templateUrl: './caseSearch.component.html',
  styleUrls: ['./caseSearch.component.scss']
})
export class caseSearchComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  paginationshowDetails = new Pagination();
  paginationcasehistorydetails = new Pagination();
  paginationContractDetails = new Pagination();
  paginationCasePaymentHdr = new Pagination();

  columnDefs: ColDef[] = [];
  columnDefsCaseHistory: ColDef[] = [];
  columnDefsCasePayment: ColDef[] = [];
  columnDefsContract: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];


  searchParams = new filtercaseSearchDto();
  searchSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new filtercaseSearchByIdDto();

  loadgridData: caseSearchDto[] = [];
  loadformData: caseSearchDto = {} as caseSearchDto;
  loadCaseHistoryformData: caseSearchDto = {} as caseSearchDto;
  loadCasePaymentHdrformData: caseSearchDto = {} as caseSearchDto;
  loadContractDetailformData: getSpContractDto = {} as getSpContractDto;

  loadCaseHistoryDetailformData: getCasesHistoryDto[] = [];
  loadCasePaymentHdrDetailformData: caseSearchPaymentHdrDto[] = [];
  loadContractCasesDetailformData: getSpContractCasesDto[] = [];


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

  caseStatusSelect2: SelectdropdownResultResults[] = [];
  loadingcaseStatus = false;
  caseStatussearchParams = new Select2RequestDto();
  selectedcaseStatusSelect2Obj: any = null;
  caseStatusSearchInput$ = new Subject<string>();

  beneficentIdSelect2: SelectdropdownResultResults[] = [];
  loadingbeneficentId = false;
  beneficentIdsearchParams = new Select2RequestDto();
  selectedbeneficentIdSelect2Obj: any = null;
  beneficentIdSearchInput$ = new Subject<string>();

  genderSelect2: SelectdropdownResultResults[] = [];
  loadinggender = false;
  gendersearchParams = new Select2RequestDto();
  selectedgenderSelect2Obj: any = null;
  genderSearchInput$ = new Subject<string>();

  nationalitySelect2: SelectdropdownResultResults[] = [];
  loadingnationality = false;
  nationalitysearchParams = new Select2RequestDto();
  selectednationalitySelect2Obj: any = null;
  nationalitySearchInput$ = new Subject<string>();

  sponsTypeSelect2: SelectdropdownResultResults[] = [];
  loadingsponsType = false;
  sponsTypesearchParams = new Select2RequestDto();
  selectedsponsTypeSelect2Obj: any = null;
  sponsTypeSearchInput$ = new Subject<string>();

  officeIdSelect2: SelectdropdownResultResults[] = [];
  loadingofficeId = false;
  officeIdsearchParams = new Select2RequestDto();
  selectedofficeIdSelect2Obj: any = null;
  officeIdSearchInput$ = new Subject<string>();
  constructor(
    private caseSearchService: caseSearchService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  )
  {

    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: this.translate.instant('Common.ViewHistoryInfo'), icon: 'icon-frame-view', action: 'onViewcasehistorydetailsInfo' },
      { label: this.translate.instant('Common.ViewPaymentInfo'), icon: 'icon-frame-view', action: 'onViewCasePaimentDetailsInfo' },
      { label: this.translate.instant('Common.ViewContractInfo'), icon: 'icon-frame-view', action: 'onViewContractDetailsInfo' },
    ];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentitySelect2());

    this.caseIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseIdSelect2());

    this.caseStatusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchcaseStatusSelect2());

    this.beneficentIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchbeneficentIdSelect2());

    this.nationalitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchnationalitySelect2());

    this.genderSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchgenderSelect2());

    this.sponsTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchsponsTypeSelect2());

    this.officeIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchofficeIdSelect2());

    this.fetchentitySelect2();
    this.fetchcaseIdSelect2();
    this.fetchcaseStatusSelect2();
    this.fetchbeneficentIdSelect2();
    this.fetchnationalitySelect2();
    this.fetchgenderSelect2();
    this.fetchsponsTypeSelect2();
    this.fetchofficeIdSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.searchSelect2RequestDto.searchValue = this.entitysearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.entitysearchParams.skip;
    this.searchSelect2RequestDto.take = this.entitysearchParams.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.entitySelect2 = [...this.entitySelect2, ...newItems];
          this.loadingentity = false;
        },
        error: () => this.loadingentity = false
      });
  }

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.entityId = selectedVendor.id;
      this.searchParams.entityIdstr = selectedVendor.text;

    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }


  oncaseIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.caseIdsearchParams.skip = 0;
    this.caseIdsearchParams.searchValue = searchVal;
    this.caseIdSelect2 = [];
    this.caseIdSearchInput$.next(search);
  }

  loadMorecaseId(): void {
    this.caseIdsearchParams.skip++;
    this.fetchcaseIdSelect2();

  }

  fetchcaseIdSelect2(): void {
    this.loadingcaseId = true;
    this.searchSelect2RequestDto.searchValue = this.caseIdsearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.caseIdsearchParams.skip;
    this.searchSelect2RequestDto.take = this.caseIdsearchParams.take;

    this.Select2Service.getSpCaseSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.caseIdSelect2 = [...this.caseIdSelect2, ...newItems];
          this.loadingcaseId = false;
        },
        error: () => this.loadingcaseId = false
      });
  }

  oncaseIdSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.caseID = selectedVendor.id;
      this.searchParams.caseIDstr = selectedVendor.text;

    } else {
      this.searchParams.caseID = null;
      this.searchParams.caseIDstr = null;
    }
  }


  oncaseStatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.caseStatussearchParams.skip = 0;
    this.caseStatussearchParams.searchValue = searchVal;
    this.caseStatusSelect2 = [];
    this.caseStatusSearchInput$.next(search);
  }

  loadMorecaseStatus(): void {
    this.caseStatussearchParams.skip++;
    this.fetchcaseStatusSelect2();

  }

  fetchcaseStatusSelect2(): void {
    this.loadingcaseStatus = true;
    this.searchSelect2RequestDto.searchValue = this.caseStatussearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.caseStatussearchParams.skip;
    this.searchSelect2RequestDto.take = this.caseStatussearchParams.take;

    this.Select2Service.getCaseStatusSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.caseStatusSelect2 = [...this.caseStatusSelect2, ...newItems];
          this.loadingcaseStatus = false;
        },
        error: () => this.loadingcaseStatus = false
      });
  }

  oncaseStatusSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.caseStatus = selectedVendor.id;
      this.searchParams.caseStatusstr = selectedVendor.text;

    } else {
      this.searchParams.caseStatus = null;
      this.searchParams.caseStatusstr = null;
    }
  }


  onbeneficentIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.beneficentIdsearchParams.skip = 0;
    this.beneficentIdsearchParams.searchValue = searchVal;
    this.beneficentIdSelect2 = [];
    this.beneficentIdSearchInput$.next(search);
  }

  loadMorebeneficentId(): void {
    this.beneficentIdsearchParams.skip++;
    this.fetchbeneficentIdSelect2();

  }

  fetchbeneficentIdSelect2(): void {
    this.loadingbeneficentId = true;
    this.searchSelect2RequestDto.searchValue = this.beneficentIdsearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.beneficentIdsearchParams.skip;
    this.searchSelect2RequestDto.take = this.beneficentIdsearchParams.take;

    this.Select2Service.getBeneficentIdSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.beneficentIdSelect2 = [...this.beneficentIdSelect2, ...newItems];
          this.loadingbeneficentId = false;
        },
        error: () => this.loadingbeneficentId = false
      });
  }

  onbeneficentIdSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.benificientID = selectedVendor.id;
      this.searchParams.benificientIDstr = selectedVendor.text;

    } else {
      this.searchParams.benificientID = null;
      this.searchParams.benificientIDstr = null;
    }
  }


  onnationalitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.nationalitysearchParams.skip = 0;
    this.nationalitysearchParams.searchValue = searchVal;
    this.nationalitySelect2 = [];
    this.nationalitySearchInput$.next(search);
  }

  loadMorenationality(): void {
    this.nationalitysearchParams.skip++;
    this.fetchnationalitySelect2();

  }

  fetchnationalitySelect2(): void {
    this.loadingnationality = true;
    this.searchSelect2RequestDto.searchValue = this.nationalitysearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.nationalitysearchParams.skip;
    this.searchSelect2RequestDto.take = this.nationalitysearchParams.take;

    this.Select2Service.getNationalitySelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.nationalitySelect2 = [...this.nationalitySelect2, ...newItems];
          this.loadingnationality = false;
        },
        error: () => this.loadingnationality = false
      });
  }

  onnationalitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.nationality = selectedVendor.id;
      this.searchParams.nationalitystr = selectedVendor.text;

    } else {
      this.searchParams.nationality = null;
      this.searchParams.nationalitystr = null;
    }
  }


  ongenderSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.gendersearchParams.skip = 0;
    this.gendersearchParams.searchValue = searchVal;
    this.genderSelect2 = [];
    this.genderSearchInput$.next(search);
  }

  loadMoregender(): void {
    this.gendersearchParams.skip++;
    this.fetchgenderSelect2();

  }

  fetchgenderSelect2(): void {
    this.loadinggender = true;
    this.searchSelect2RequestDto.searchValue = this.gendersearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.gendersearchParams.skip;
    this.searchSelect2RequestDto.take = this.gendersearchParams.take;

    this.Select2Service.getGenderSelect2Array(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResultResults[]) => {
          const newItems = response || [];
          this.genderSelect2 = [...this.genderSelect2, ...newItems];

          this.loadinggender = false;
        },
        error: () => this.loadinggender = false
      });
  }

  ongenderSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.gender = selectedVendor.id?.toString() ?? null;
      this.searchParams.genderstr = selectedVendor.text;

    } else {
      this.searchParams.gender = null;
      this.searchParams.genderstr = null;
    }
  }


  onsponsTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.sponsTypesearchParams.skip = 0;
    this.sponsTypesearchParams.searchValue = searchVal;
    this.sponsTypeSelect2 = [];
    this.sponsTypeSearchInput$.next(search);
  }

  loadMoresponsType(): void {
    this.sponsTypesearchParams.skip++;
    this.fetchsponsTypeSelect2();

  }

  fetchsponsTypeSelect2(): void {
    this.loadingsponsType = true;
    this.searchSelect2RequestDto.searchValue = this.sponsTypesearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.sponsTypesearchParams.skip;
    this.searchSelect2RequestDto.take = this.sponsTypesearchParams.take;

    this.Select2Service.getSponcerCategorySelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.sponsTypeSelect2 = [...this.sponsTypeSelect2, ...newItems];
          this.loadingsponsType = false;
        },
        error: () => this.loadingsponsType = false
      });
  }

  onsponsTypeSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.sponcerCat = selectedVendor.id;
      this.searchParams.sponcerCatstr = selectedVendor.text;

    } else {
      this.searchParams.sponcerCat = null;
      this.searchParams.sponcerCatstr = null;
    }
  }

  onofficeIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.officeIdsearchParams.skip = 0;
    this.officeIdsearchParams.searchValue = searchVal;
    this.officeIdSelect2 = [];
    this.officeIdSearchInput$.next(search);
  }

  loadMoreofficeId(): void {
    this.officeIdsearchParams.skip++;
    this.fetchofficeIdSelect2();

  }

  fetchofficeIdSelect2(): void {
    this.loadingofficeId = true;
    this.searchSelect2RequestDto.searchValue = this.officeIdsearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.officeIdsearchParams.skip;
    this.searchSelect2RequestDto.take = this.officeIdsearchParams.take;

    this.Select2Service.getSpOfficesSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.officeIdSelect2 = [...this.officeIdSelect2, ...newItems];
          this.loadingofficeId = false;
        },
        error: () => this.loadingofficeId = false
      });
  }

  onofficeIdSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.officeId = selectedVendor.id;
      this.searchParams.officeIdstr = selectedVendor.text;

    } else {
      this.searchParams.officeId = null;
      this.searchParams.officeIdstr = null;
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

  onPageChangePaymentHdr(event: { pageNumber: number; pageSize: number }): void {
    this.paginationCasePaymentHdr.currentPage = event.pageNumber;
    this.paginationCasePaymentHdr.take = event.pageSize;
    var caseId = this.searchParamsById.caseId || '';
    var entityId = this.searchParamsById.entityId || '';
    this.getCasePaymentFormDatabyId(event, caseId, entityId);
  }

  onTableSearchPaymentHdr(text: string): void {
    this.searchText = text;
    var caseId = this.searchParamsById.caseId || '';
    var entityId = this.searchParamsById.entityId || '';
    this.getCasePaymentFormDatabyId({ pageNumber: 1, pageSize: this.paginationCasePaymentHdr.take }, caseId, entityId);
  }


  onPageChangeCaseHistory(event: { pageNumber: number; pageSize: number }): void {
    this.paginationcasehistorydetails.currentPage = event.pageNumber;
    this.paginationcasehistorydetails.take = event.pageSize;
    var caseId = this.searchParamsById.caseId || '';
    var entityId = this.searchParamsById.entityId || '';
    this.getCaseHistoryFormDatabyId(event, caseId, entityId);
  }

  onTableSearchCaseHistory(text: string): void {
    this.searchText = text;
    var caseId = this.searchParamsById.caseId || '';
    var entityId = this.searchParamsById.entityId || '';
    this.getCaseHistoryFormDatabyId({ pageNumber: 1, pageSize: this.paginationcasehistorydetails.take }, caseId, entityId);
  }


  onPageChangeContract(event: { pageNumber: number; pageSize: number }): void {
    this.paginationContractDetails.currentPage = event.pageNumber;
    this.paginationContractDetails.take = event.pageSize;
    var contractId = this.searchParamsById.contractId || '';
    var entityId = this.searchParamsById.entityId || '';
    this.getContractFormDatabyId(event, contractId, entityId);
  }

  onTableSearchContract(text: string): void {
    this.searchText = text;
    var contractId = this.searchParamsById.contractId || '';
    var entityId = this.searchParamsById.entityId || '';
    this.getContractFormDatabyId({ pageNumber: 1, pageSize: this.paginationContractDetails.take }, contractId, entityId);
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.entityId) {
      this.translate
        .get(['CasePaymentResourceName.entityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${ translations['CasePaymentResourceName.entityId']} ${ translations['Common.Required']}`,
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
    this.caseSearchService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response || [];
          this.pagination.totalCount = response[0]?.rowsCount || 0;
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  };

  getFormDatabyId(event: { pageNumber: number; pageSize: number }, caseId: string, entitY_ID: string): void {
    const params: filtercaseSearchByIdDto = {
      entityId: entitY_ID,
      caseId: caseId,
      contractId: null
    };
    this.spinnerService.show();

    forkJoin({
      headeraderdata: this.caseSearchService.getDetailById(params) as Observable<caseSearchDto | caseSearchDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformData = Array.isArray(result.headeraderdata)
          ? result.headeraderdata[0] ?? ({} as caseSearchDto)
          : result.headeraderdata;

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


  getCaseHistoryFormDatabyId(event: { pageNumber: number; pageSize: number }, caseId: string, entitY_ID: string): void {
    const params: filtercaseSearchByIdDto = {
      entityId: entitY_ID,
      caseId: caseId,
      contractId:null
    };
    this.spinnerService.show();

    forkJoin({
      casehistoryData: this.caseSearchService.getDetailById(params) as Observable<caseSearchDto | caseSearchDto[]>,
      casehistorydetaildata: this.caseSearchService.getCaseHistoryDetailsById(params) as Observable<getCasesHistoryDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadCaseHistoryDetailformData = result.casehistorydetaildata ?? [];
        this.loadCaseHistoryformData = Array.isArray(result.casehistoryData)
          ? result.casehistoryData[0] ?? ({} as caseSearchDto)
          : result.casehistoryData;
        this.paginationcasehistorydetails.totalCount = result.casehistorydetaildata.length || 0;

        const modalElement = document.getElementById('viewcasehistorydetails');;
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



  getCasePaymentFormDatabyId(event: { pageNumber: number; pageSize: number }, caseId: string, entitY_ID: string): void {
    const params: filtercaseSearchByIdDto = {
      entityId: entitY_ID,
      caseId: caseId,
      contractId:null
    };
    this.spinnerService.show();

    forkJoin({
      casepaymentheaderaderdata: this.caseSearchService.getDetailById(params) as Observable<caseSearchDto | caseSearchDto[]>,
      casepaymentheaddetaildata: this.caseSearchService.getCasePaymentHdrDetailsById(params) as Observable<caseSearchPaymentHdrDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadCasePaymentHdrDetailformData = result.casepaymentheaddetaildata ?? [];
        this.loadCasePaymentHdrformData = Array.isArray(result.casepaymentheaderaderdata)
          ? result.casepaymentheaderaderdata[0] ?? ({} as caseSearchDto)
          : result.casepaymentheaderaderdata;
        this.paginationCasePaymentHdr.totalCount = result.casepaymentheaddetaildata.length || 0;

        const modalElement = document.getElementById('viewCasePaymentDetails');;
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



  getContractFormDatabyId(event: { pageNumber: number; pageSize: number }, contractId: string, entityId: string): void {
    const params: filtercaseSearchByIdDto = {
      entityId: entityId,
      caseId: null,
      contractId: contractId
    };
    if (!contractId) {
      this.translate
        .get(['CaseSearchResourceName.NoContract'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['CaseSearchResourceName.NoContract']}`,
            'Warning'
          );
        });
      return;
    }
    this.spinnerService.show();

    forkJoin({
      contractheaderaderdata: this.caseSearchService.getContractDetailsById(params) as Observable<getSpContractDto | getSpContractDto[]>,
      contractcasesdetaildata: this.caseSearchService.getContractCaseDetailsById(params) as Observable<getSpContractCasesDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadContractCasesDetailformData = result.contractcasesdetaildata ?? [];
        this.loadContractDetailformData = Array.isArray(result.contractheaderaderdata)
          ? result.contractheaderaderdata[0] ?? ({} as caseSearchDto)
          : result.contractheaderaderdata;

        this.paginationContractDetails.totalCount = result.contractcasesdetaildata.length || 0;

        const modalElement = document.getElementById('viewContractDetails');;
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
    this.searchParams = new filtercaseSearchDto();
    this.loadgridData = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }



  public buildColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('CaseSearchResourceName.casE_ID'), field: 'casE_ID', width: 200 },
      { headerName: this.translate.instant('CaseSearchResourceName.entitY_ID'), field: 'entitY_ID', width: 200 },
      { headerName: this.translate.instant('CaseSearchResourceName.casename'), field: 'casename', width: 200 },
      { headerName: this.translate.instant('CaseSearchResourceName.casE_STATUS_DESC'), field: 'casE_STATUS_DESC', width: 200 },
      { headerName: this.translate.instant('CaseSearchResourceName.caseamount'), field: 'caseamount', width: 200 },
      { headerName: this.translate.instant('CaseSearchResourceName.startdate'), field: 'startdatestr', width: 200 },
      { headerName: this.translate.instant('CaseSearchResourceName.beneficentname'), field: 'beneficentname', width: 200 },
      { headerName: this.translate.instant('CaseSearchResourceName.sponceR_CATEGORY_DESC'), field: 'sponceR_CATEGORY_DESC', width: 200 },
    ];

  
    this.translate.get([
      'CaseSearchResourceName.paymenT_DESC',
      'CaseSearchResourceName.starT_DATE',
      'CaseSearchResourceName.enD_DATE',
      'CaseSearchResourceName.statuS_DESC',
      'CaseSearchResourceName.sponsoR_CATEGORY_DESC',
      'CaseSearchResourceName.casE_STATUS_DESC',
      'CaseSearchResourceName.kafalA_STATUS_DESC',
      'CaseSearchResourceName.amounT_AED',
      'CaseSearchResourceName.gifT_AMOUNT',
      'CaseSearchResourceName.total',
      'CaseSearchResourceName.receivE_DATE',
      'CaseSearchResourceName.iS_RECEIVED'
    ]).subscribe(translations => {
      this.columnDefsCaseHistory = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['CaseSearchResourceName.paymenT_DESC'], field: 'paymenT_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.starT_DATE'], field: 'starT_DATEstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.enD_DATE'], field: 'enD_DATEstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.statuS_DESC'], field: 'statuS_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.sponsoR_CATEGORY_DESC'], field: 'sponsoR_CATEGORY_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.casE_STATUS_DESC'], field: 'casE_STATUS_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.kafalA_STATUS_DESC'], field: 'kafalA_STATUS_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.amounT_AED'], field: 'amounT_AEDstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.gifT_AMOUNT'], field: 'gifT_AMOUNTstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.total'], field: 'totalstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.receivE_DATE'], field: 'receivE_DATEstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.iS_RECEIVED'], field: 'iS_RECEIVED', width: 200 },
      ];
    });

    this.translate.get([
      'CaseSearchResourceName.sourcE_TYPE_DESC',
      'CaseSearchResourceName.trX_DATE',
      'CaseSearchResourceName.beneficenT_NO',
      'CaseSearchResourceName.beneficentname',
      'CaseSearchResourceName.trX_DESC',
      'CaseSearchResourceName.notes'
    ]).subscribe(translations => {
      this.columnDefsCasePayment = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['CaseSearchResourceName.sourcE_TYPE_DESC'], field: 'sourcE_TYPE_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.trX_DATE'], field: 'trX_DATEstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.beneficenT_NO'], field: 'beneficenT_NO', width: 200 },
        { headerName: translations['CaseSearchResourceName.beneficentname'], field: 'beneficentname', width: 200 },
        { headerName: translations['CaseSearchResourceName.trX_DESC'], field: 'trX_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.notes'], field: 'notes', width: 200 },
      ];
    });


    this.translate.get([
      'CaseSearchResourceName.sponceR_CATEGORY_DESC',
      'CaseSearchResourceName.casE_CONTRACT_STATUS_DESC',
      'CaseSearchResourceName.casE_NO',
      'CaseSearchResourceName.casename',
      'CaseSearchResourceName.birthdate',
      'CaseSearchResourceName.nationalitY_DESC',
      'CaseSearchResourceName.startdate',
      'CaseSearchResourceName.conT_END_DATE',
      'CaseSearchResourceName.caseamount',
      'CaseSearchResourceName.banK_DESC',
      'CaseSearchResourceName.ownername',
      'CaseSearchResourceName.accounT_NO',
      'CaseSearchResourceName.sponS_FOR',
    ]).subscribe(translations => {
      this.columnDefsContract = [
        {
          headerName: '#',
          valueGetter: (params) =>
            (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
          width: 60,
          colId: 'serialNumber'
        },
        { headerName: translations['CaseSearchResourceName.sponceR_CATEGORY_DESC'], field: 'sponceR_CATEGORY_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.casE_CONTRACT_STATUS_DESC'], field: 'casE_CONTRACT_STATUS_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.casE_NO'], field: 'casE_NO', width: 200 },
        { headerName: translations['CaseSearchResourceName.casename'], field: 'casename', width: 200 },
        { headerName: translations['CaseSearchResourceName.birthdate'], field: 'birthdateEstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.nationalitY_DESC'], field: 'nationalitY_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.startdate'], field: 'startdatEstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.conT_END_DATE'], field: 'conT_END_DATEEstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.caseamount'], field: 'caseamountstr', width: 200 },
        { headerName: translations['CaseSearchResourceName.banK_DESC'], field: 'banK_DESC', width: 200 },
        { headerName: translations['CaseSearchResourceName.ownername'], field: 'ownername', width: 200 },
        { headerName: translations['CaseSearchResourceName.accounT_NO'], field: 'accounT_NO', width: 200 },
        { headerName: translations['CaseSearchResourceName.sponS_FOR'], field: 'sponS_FOR', width: 200 },
      ];
    });
  }

  onTableAction(event: { action: string, row: any }) {
    var data = event.row.composeKey.split(',');
    var contractId = null;
    var contract_entityId = null;

    var caseId = data[0];
    var entityId = data[1];

    if (data.Count == 2) {
      contractId = data[0];
      contract_entityId = data[1];
    }
    else {
      contractId = data[2];
      contract_entityId = data[1];
    }

    if (event.action === 'onViewInfo') {
      this.getFormDatabyId({ pageNumber: 1, pageSize: this.paginationshowDetails.take }, caseId, entityId);
    }
    else if (event.action === 'onViewcasehistorydetailsInfo') {
      this.getCaseHistoryFormDatabyId({ pageNumber: 1, pageSize: this.paginationcasehistorydetails.take }, caseId, entityId);
    }
    else if (event.action === 'onViewCasePaimentDetailsInfo') {
      this.getCasePaymentFormDatabyId({ pageNumber: 1, pageSize: this.paginationCasePaymentHdr.take }, caseId, entityId);
    }
    else if (event.action === 'onViewContractDetailsInfo') {
      this.getContractFormDatabyId({ pageNumber: 1, pageSize: this.paginationContractDetails.take }, contractId, contract_entityId);
    }
  }



  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['CaseSearchResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['CaseSearchResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.caseSearchService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || initialResponse?.length || 0;

          this.caseSearchService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('CaseSearchResourceName.Title'),
                  reportTitle: this.translate.instant('CaseSearchResourceName.Title'),
                  fileName: `${this.translate.instant('CaseSearchResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('CaseSearchResourceName.EntityId'), value: this.searchParams.entityIdstr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('CaseSearchResourceName.casE_ID'), key: 'casE_ID' },
                    { label: this.translate.instant('CaseSearchResourceName.entitY_ID'), key: 'entitY_ID' },
                    { label: this.translate.instant('CaseSearchResourceName.casename'), key: 'casename' },
                    { label: this.translate.instant('CaseSearchResourceName.casE_STATUS_DESC'), key: 'casE_STATUS_DESC' },
                    { label: this.translate.instant('CaseSearchResourceName.caseamount'), key: 'caseamount' },
                    { label: this.translate.instant('CaseSearchResourceName.startdate'), key: 'startdatestr' },
                    { label: this.translate.instant('CaseSearchResourceName.beneficentname'), key: 'beneficentname' },
                    { label: this.translate.instant('CaseSearchResourceName.sponceR_CATEGORY_DESC'), key: 'sponceR_CATEGORY_DESC' },
                  ],

                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
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
