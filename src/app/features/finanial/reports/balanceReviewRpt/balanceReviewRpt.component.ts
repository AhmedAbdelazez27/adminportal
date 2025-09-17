import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig, Select2RequestDto } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { balanceReviewRptInputDto, prepareGlAccountRptRequestDto, updateGlAccountSelectionDto, updateGlAccountSelectiondummyDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsInput.dto';
import { balanceReviewRptOutputDto } from '../../../../core/dtos/FinancialDtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/Financial/Reports/FinancialReport.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { GlAccountSelectionType } from '../../../../core/enum/user-type.enum';
import { param } from 'jquery';
import { formatNumericCell } from '../../../../shared/utils/value-formatters';

@Component({
  selector: 'app-balanceReviewRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectComponent],
  templateUrl: './balanceReviewRpt.component.html',
  styleUrls: ['./balanceReviewRpt.component.scss']
})

export class BalanceReviewRptComponent {
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
  searchParams = new balanceReviewRptInputDto();
  searchParamsprepareData = new prepareGlAccountRptRequestDto();

  getAllDataForReports: balanceReviewRptOutputDto[] = [];

  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];

  levelSelect2: any[] = [];

  entityyesNo?: boolean | null = null;
  countryyesNo?: boolean | null = null;
  branchyesNo?: boolean | null = null;
  accountyesNo?: boolean | null = null;
  departmentyesNo?: boolean | null = null;

  model: {
    entityyesNo?: boolean | null;
    countryyesNo?: boolean | null;
    branchyesNo?: boolean | null;
    accountyesNo?: boolean | null;
    departmentyesNo?: boolean | null;
  } = {
      entityyesNo: null,
      countryyesNo: null,
      branchyesNo: null,
      accountyesNo: null,
      departmentyesNo: null
    };

 

  fromentitySelect2: SelectdropdownResultResults[] = [];
  loadingfromentity = false;
  fromentitysearchParams = new Select2RequestDto();
  selectedfromentitySelect2Obj: any = null;
  fromentitySearchInput$ = new Subject<string>();

  fromdeptSelect2: SelectdropdownResultResults[] = [];
  loadingfromdept = false;
  fromdeptsearchParams = new Select2RequestDto();
  selectedfromdeptSelect2Obj: any = null;
  fromdeptSearchInput$ = new Subject<string>();

  frombranchSelect2: SelectdropdownResultResults[] = [];
  loadingfrombranch = false;
  frombranchsearchParams = new Select2RequestDto();
  selectedfrombranchSelect2Obj: any = null;
  frombranchSearchInput$ = new Subject<string>();

  fromcountrySelect2: SelectdropdownResultResults[] = [];
  loadingfromcountry = false;
  fromcountrysearchParams = new Select2RequestDto();
  selectedfromcountrySelect2Obj: any = null;
  fromcountrySearchInput$ = new Subject<string>();

  fromAccSelect2: SelectdropdownResultResults[] = [];
  loadingfromAcc = false;
  fromAccsearchParams = new Select2RequestDto();
  selectedfromAccSelect2Obj: any = null;
  fromAccSearchInput$ = new Subject<string>();

  fromPeriodIdSelect2: SelectdropdownResultResults[] = [];
  loadingfromPeriodId = false;
  fromPeriodIdsearchParams = new Select2RequestDto();
  selectedfromPeriodIdSelect2Obj: any = null;
  fromPeriodIdSearchInput$ = new Subject<string>();

  toentitySelect2: SelectdropdownResultResults[] = [];
  loadingtoentity = false;
  toentitysearchParams = new Select2RequestDto();
  selectedtoentitySelect2Obj: any = null;
  toentitySearchInput$ = new Subject<string>();

  todeptSelect2: SelectdropdownResultResults[] = [];
  loadingtodept = false;
  todeptsearchParams = new Select2RequestDto();
  selectedtodeptSelect2Obj: any = null;
  todeptSearchInput$ = new Subject<string>();

  tobranchSelect2: SelectdropdownResultResults[] = [];
  loadingtobranch = false;
  tobranchsearchParams = new Select2RequestDto();
  selectedtobranchSelect2Obj: any = null;
  tobranchSearchInput$ = new Subject<string>();

  tocountrySelect2: SelectdropdownResultResults[] = [];
  loadingtocountry = false;
  tocountrysearchParams = new Select2RequestDto();
  selectedtocountrySelect2Obj: any = null;
  tocountrySearchInput$ = new Subject<string>();

  toAccSelect2: SelectdropdownResultResults[] = [];
  loadingtoAcc = false;
  toAccsearchParams = new Select2RequestDto();
  selectedtoAccSelect2Obj: any = null;
  toAccSearchInput$ = new Subject<string>();

  toPeriodIdSelect2: SelectdropdownResultResults[] = [];
  loadingtoPeriodId = false;
  toPeriodIdsearchParams = new Select2RequestDto();
  selectedtoPeriodIdSelect2Obj: any = null;
  toPeriodIdSearchInput$ = new Subject<string>();
  dataPrepared: boolean = false;

  constructor(
    private financialReportService: FinancialReportService,
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

    this.fromentitySearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchfromentitySelect2());

    this.frombranchSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchfrombranchSelect2());

    this.fromcountrySearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchfromcountrySelect2());

    this.fromdeptSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchfromdeptSelect2());

    this.fromAccSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchfromAccSelect2());

    this.fromPeriodIdSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchfromPeriodIdSelect2());

    this.toentitySearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchtoentitySelect2());

    this.tocountrySearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchtocountrySelect2());

    this.tobranchSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchtobranchSelect2());

    this.todeptSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchtodeptSelect2());

    this.toAccSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchtoAccSelect2());


    this.toPeriodIdSearchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.fetchtoPeriodIdSelect2());

    this.fetchfromentitySelect2();
    this.fetchfromcountrySelect2();
    this.fetchfrombranchSelect2();
    this.fetchfromdeptSelect2();
    this.fetchfromAccSelect2();
    this.fetchfromPeriodIdSelect2();

    this.fetchtoentitySelect2();
    this.fetchtocountrySelect2();
    this.fetchtobranchSelect2();
    this.fetchtodeptSelect2();
    this.fetchtoAccSelect2();
    this.fetchtoPeriodIdSelect2();

    this.fetchlevelSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchlevelSelect2(): void {
    this.levelSelect2 = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, text: (i + 1).toString() }));
  }
  onlevelSelect2Change(selectedentity: any): void {
    if (selectedentity) {
      this.searchParams.level = selectedentity.id;
    } else {
      this.searchParams.level = null;
    }
  }

  onfromentitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.fromentitysearchParams.skip = 0;
    this.fromentitysearchParams.searchValue = search;
    this.fromentitySelect2 = [];
    this.fromentitySearchInput$.next(search);
  }

  loadMorefromentity(): void {
    this.fromentitysearchParams.skip++;
    this.fetchfromentitySelect2();
  }

  fetchfromentitySelect2(): void {
    this.loadingfromentity = true;
    const searchVal = this.fromentitysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.fromentitysearchParams.skip;
    this.searchSelect2Params.take = this.fromentitysearchParams.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.fromentitySelect2 = [...this.fromentitySelect2, ...newItems];
          this.loadingfromentity = false;
        },
        error: () => this.loadingfromentity = false
      });
  }

  onfromentitySelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Entity, selected?.id ?? null, null);
  }


  onfromdeptSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.fromdeptsearchParams.skip = 0;
    this.fromdeptsearchParams.searchValue = search;
    this.fromdeptSelect2 = [];
    this.fromdeptSearchInput$.next(search);
  }

  loadMorefromdept(): void {
    this.fromdeptsearchParams.skip++;
    this.fetchfromdeptSelect2();
  }

  fetchfromdeptSelect2(): void {
    this.loadingfromdept = true;
    const searchVal = this.fromdeptsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.fromdeptsearchParams.skip;
    this.searchSelect2Params.take = this.fromdeptsearchParams.take;

    this.Select2Service.getDeptSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.fromdeptSelect2 = [...this.fromdeptSelect2, ...newItems];
          this.loadingfromdept = false;
        },
        error: () => this.loadingfromdept = false
      });
  }

  onfromdeptSelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Department, selected?.id ?? null, null);
}


  onfrombranchSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.frombranchsearchParams.skip = 0;
    this.frombranchsearchParams.searchValue = search;
    this.frombranchSelect2 = [];
    this.frombranchSearchInput$.next(search);
  }

  loadMorefrombranch(): void {
    this.frombranchsearchParams.skip++;
    this.fetchfrombranchSelect2();
  }

  fetchfrombranchSelect2(): void {
    this.loadingfrombranch = true;
    const searchVal = this.frombranchsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.frombranchsearchParams.skip;
    this.searchSelect2Params.take = this.frombranchsearchParams.take;

    this.Select2Service.getBranchSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.frombranchSelect2 = [...this.frombranchSelect2, ...newItems];
          this.loadingfrombranch = false;
        },
        error: () => this.loadingfrombranch = false
      });
  }

  onfrombranchSelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Branch, selected?.id ?? null, null);
  }


  onfromcountrySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.fromcountrysearchParams.skip = 0;
    this.fromcountrysearchParams.searchValue = search;
    this.fromcountrySelect2 = [];
    this.fromcountrySearchInput$.next(search);
  }

  loadMorefromcountry(): void {
    this.fromcountrysearchParams.skip++;
    this.fetchfromcountrySelect2();
  }

  fetchfromcountrySelect2(): void {
    this.loadingfromcountry = true;
    const searchVal = this.fromcountrysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.fromcountrysearchParams.skip;
    this.searchSelect2Params.take = this.fromcountrysearchParams.take;

    this.Select2Service.getCountrySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.fromcountrySelect2 = [...this.fromcountrySelect2, ...newItems];
          this.loadingfromcountry = false;
        },
        error: () => this.loadingfromcountry = false
      });
  }

  onfromcountrySelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Country, selected?.id ?? null, null);
  }


  onfromAccSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.fromAccsearchParams.skip = 0;
    this.fromAccsearchParams.searchValue = search;
    this.fromAccSelect2 = [];
    this.fromAccSearchInput$.next(search);
  }

  loadMorefromAcc(): void {
    this.fromAccsearchParams.skip++;
    this.fetchfromAccSelect2();
  }

  fetchfromAccSelect2(): void {
    this.loadingfromAcc = true;
    const searchVal = this.fromAccsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.fromAccsearchParams.skip;
    this.searchSelect2Params.take = this.fromAccsearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.fromAccSelect2 = [...this.fromAccSelect2, ...newItems];
          this.loadingfromAcc = false;
        },
        error: () => this.loadingfromAcc = false
      });
  }

  onfromAccSelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Account, selected?.id ?? null, null);
  }

  onfromPeriodIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.fromPeriodIdsearchParams.skip = 0;
    this.fromPeriodIdsearchParams.searchValue = search;
    this.fromPeriodIdSelect2 = [];
    this.fromPeriodIdSearchInput$.next(search);
  }

  loadMorefromPeriodId(): void {
    this.fromPeriodIdsearchParams.skip++;
    this.fetchfromPeriodIdSelect2();
  }

  fetchfromPeriodIdSelect2(): void {
    this.loadingfromPeriodId = true;
    const searchVal = this.fromPeriodIdsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.fromPeriodIdsearchParams.skip;
    this.searchSelect2Params.take = this.fromPeriodIdsearchParams.take;

    this.Select2Service.getGlPeriodSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.fromPeriodIdSelect2 = [...this.fromPeriodIdSelect2, ...newItems];
          this.loadingfromPeriodId = false;
        },
        error: () => this.loadingfromPeriodId = false
      });
  }

  onfromPeriodIdSelect2Change(selected: any): void {
    if (selected) {
      this.searchParamsprepareData.fromPeriodId = selected.id;
      this.searchParamsprepareData.fromPeriodId = selected.id;
    } else {
      this.searchParamsprepareData.fromPeriodId = null;
      this.searchParamsprepareData.fromPeriodId = null;
    }
  }

  ontoentitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.toentitysearchParams.skip = 0;
    this.toentitysearchParams.searchValue = search;
    this.toentitySelect2 = [];
    this.toentitySearchInput$.next(search);
  }

  loadMoretoentity(): void {
    this.toentitysearchParams.skip++;
    this.fetchtoentitySelect2();
  }

  fetchtoentitySelect2(): void {
    this.loadingtoentity = true;
    const searchVal = this.toentitysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.toentitysearchParams.skip;
    this.searchSelect2Params.take = this.toentitysearchParams.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.toentitySelect2 = [...this.toentitySelect2, ...newItems];
          this.loadingtoentity = false;
        },
        error: () => this.loadingtoentity = false
      });
  }

  ontoentitySelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Entity, null, selected?.id ?? null);
 }


  ontodeptSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.todeptsearchParams.skip = 0;
    this.todeptsearchParams.searchValue = search;
    this.todeptSelect2 = [];
    this.todeptSearchInput$.next(search);
  }

  loadMoretodept(): void {
    this.todeptsearchParams.skip++;
    this.fetchtodeptSelect2();
  }

  fetchtodeptSelect2(): void {
    this.loadingtodept = true;
    const searchVal = this.todeptsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.todeptsearchParams.skip;
    this.searchSelect2Params.take = this.todeptsearchParams.take;

    this.Select2Service.getDeptSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.todeptSelect2 = [...this.todeptSelect2, ...newItems];
          this.loadingtodept = false;
        },
        error: () => this.loadingtodept = false
      });
  }

  ontodeptSelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Department, null, selected?.id ?? null);
  }


  ontobranchSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.tobranchsearchParams.skip = 0;
    this.tobranchsearchParams.searchValue = search;
    this.tobranchSelect2 = [];
    this.tobranchSearchInput$.next(search);
  }

  loadMoretobranch(): void {
    this.tobranchsearchParams.skip++;
    this.fetchtobranchSelect2();
  }

  fetchtobranchSelect2(): void {
    this.loadingtobranch = true;
    const searchVal = this.tobranchsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.tobranchsearchParams.skip;
    this.searchSelect2Params.take = this.tobranchsearchParams.take;

    this.Select2Service.getBranchSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.tobranchSelect2 = [...this.tobranchSelect2, ...newItems];
          this.loadingtobranch = false;
        },
        error: () => this.loadingtobranch = false
      });
  }

  ontobranchSelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Branch, null, selected?.id ?? null);
  }


  ontocountrySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.tocountrysearchParams.skip = 0;
    this.tocountrysearchParams.searchValue = search;
    this.tocountrySelect2 = [];
    this.tocountrySearchInput$.next(search);
  }

  loadMoretocountry(): void {
    this.tocountrysearchParams.skip++;
    this.fetchtocountrySelect2();
  }

  fetchtocountrySelect2(): void {
    this.loadingtocountry = true;
    const searchVal = this.tocountrysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.tocountrysearchParams.skip;
    this.searchSelect2Params.take = this.tocountrysearchParams.take;

    this.Select2Service.getCountrySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.tocountrySelect2 = [...this.tocountrySelect2, ...newItems];
          this.loadingtocountry = false;
        },
        error: () => this.loadingtocountry = false
      });
  }

  ontocountrySelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Country, null, selected?.id ?? null);
  }

  ontoAccSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.toAccsearchParams.skip = 0;
    this.toAccsearchParams.searchValue = search;
    this.toAccSelect2 = [];
    this.toAccSearchInput$.next(search);
  }

  loadMoretoAcc(): void {
    this.toAccsearchParams.skip++;
    this.fetchtoAccSelect2();
  }

  fetchtoAccSelect2(): void {
    this.loadingtoAcc = true;
    const searchVal = this.toAccsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.toAccsearchParams.skip;
    this.searchSelect2Params.take = this.toAccsearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.toAccSelect2 = [...this.toAccSelect2, ...newItems];
          this.loadingtoAcc = false;
        },
        error: () => this.loadingtoAcc = false
      });
  }

  ontoAccSelect2Change(selected: any): void {
    this.insertEntitySelection(GlAccountSelectionType.Account, null, selected?.id ?? null);
  }

  ontoPeriodIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.toPeriodIdsearchParams.skip = 0;
    this.toPeriodIdsearchParams.searchValue = search;
    this.toPeriodIdSelect2 = [];
    this.toPeriodIdSearchInput$.next(search);
  }

  loadMoretoPeriodId(): void {
    this.toPeriodIdsearchParams.skip++;
    this.fetchtoPeriodIdSelect2();
  }

  fetchtoPeriodIdSelect2(): void {
    this.loadingtoPeriodId = true;
    const searchVal = this.toPeriodIdsearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.toPeriodIdsearchParams.skip;
    this.searchSelect2Params.take = this.toPeriodIdsearchParams.take;

    this.Select2Service.getGlPeriodSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.toPeriodIdSelect2 = [...this.toPeriodIdSelect2, ...newItems];
          this.loadingtoPeriodId = false;
        },
        error: () => this.loadingtoPeriodId = false
      });
  }

  ontoPeriodIdSelect2Change(selected: any): void {
    if (selected) {
      this.searchParamsprepareData.toPeriodId = selected.id;
      this.searchParamsprepareData.toPeriodId = selected.id;
    } else {
      this.searchParamsprepareData.toPeriodId = null;
      this.searchParamsprepareData.toPeriodId = null;
    }
  }

  private insertEntitySelection(
    type: GlAccountSelectionType,
    fromValue?: string | null,
    toValue?: string | null
  ): void {
    const existing = this.searchParamsprepareData.entities.find(e => e.accountSelectionType === type);

    if (existing) {
      existing.fromValue = fromValue ?? existing.fromValue;
      existing.toValue = toValue ?? existing.toValue;
    } else {
      this.searchParamsprepareData.entities.push({
        accountSelectionType: type,
        fromValue: fromValue ?? null,
        toValue: toValue ?? null,
        yesNo: null
      });
    }
  }

  onCheckboxChange(event: Event, field: keyof typeof this.model): void {
    const input = event.target as HTMLInputElement;
    if (this.model[field] === null) {
      this.model[field] = input.checked;
    } else {
      this.model[field] = input.checked;
    }
  }

  prepareData(): void {
    if (!this.searchParamsprepareData.fromPeriodId) {
      this.translate
        .get(['FinancialReportResourceName.fromPeriodId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.fromPeriodId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    if (!this.searchParamsprepareData.toPeriodId) {
      this.translate
        .get(['FinancialReportResourceName.toPeriodId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.toPeriodId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.searchParamsprepareData.entities.forEach(entity => {
      switch (entity.accountSelectionType) {
        case GlAccountSelectionType.Entity:
          entity.yesNo = this.model.entityyesNo === true ? 'Y' :
            this.model.entityyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Account:
          entity.yesNo = this.model.accountyesNo === true ? 'Y' :
            this.model.accountyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Department:
          entity.yesNo = this.model.departmentyesNo === true ? 'Y' :
            this.model.departmentyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Branch:
          entity.yesNo = this.model.branchyesNo === true ? 'Y' :
            this.model.branchyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Country:
          entity.yesNo = this.model.countryyesNo === true ? 'Y' :
            this.model.countryyesNo === false ? 'N' : null;
          break;

        default:
          entity.yesNo = null;
          break;
      }
    });

    const params: prepareGlAccountRptRequestDto = {
      entities: this.searchParamsprepareData.entities,
      fromPeriodId: this.searchParamsprepareData.fromPeriodId,
      toPeriodId: this.searchParamsprepareData.toPeriodId
    };

    this.spinnerService.show();

    this.financialReportService.getupdateGlAccountSelection(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {

          if (response === 'Processed Ok') {  // check the success flag from API
            this.getAllDataForReports = response?.data || [];
            this.pagination.totalCount = response?.totalCount || 0;
            this.dataPrepared = true;  // ✅ mark data as prepared
          } else {
            this.dataPrepared = false;
            this.toastr.error('Failed to process data.');
          }
          this.getAllDataForReports = response?.data || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
          this.dataPrepared = false;
          this.toastr.error('Error while processing data.');
        }
      });
  }

  checkDataPrepared(): boolean {
    if (!this.dataPrepared) {
      this.toastr.warning('Generate Data First');
      return false;
    }
    return true;
  }


  getgltrialbalancesRPTData(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.entityId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.EntityId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    const params = new balanceReviewRptInputDto
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.financialReportService.getgetgltrialbalancesRPTData(this.searchParams)
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

  getGeneralBalanceSheetRptData(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.EntityId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.EntityId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    const params = new balanceReviewRptInputDto
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.financialReportService.getgetGeneralBalanceSheetRptData(this.searchParams)
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

  getGeneralProLosRPTData(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.EntityId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.EntityId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    const params = new balanceReviewRptInputDto
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.spinnerService.show();

    this.financialReportService.getgetGeneralProLosRPTData(this.searchParams)
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

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;

    this.searchParamsprepareData.entities.forEach(entity => {
      switch (entity.accountSelectionType) {
        case GlAccountSelectionType.Entity:
          entity.yesNo = this.model.entityyesNo === true ? 'Y' :
            this.model.entityyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Account:
          entity.yesNo = this.model.accountyesNo === true ? 'Y' :
            this.model.accountyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Department:
          entity.yesNo = this.model.departmentyesNo === true ? 'Y' :
            this.model.departmentyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Branch:
          entity.yesNo = this.model.branchyesNo === true ? 'Y' :
            this.model.branchyesNo === false ? 'N' : null;
          break;

        case GlAccountSelectionType.Country:
          entity.yesNo = this.model.countryyesNo === true ? 'Y' :
            this.model.countryyesNo === false ? 'N' : null;
          break;

        default:
          entity.yesNo = null;
          break;
      }
    });

    const params: prepareGlAccountRptRequestDto = {
      entities: this.searchParamsprepareData.entities,
      fromPeriodId: this.searchParamsprepareData.fromPeriodId,
      toPeriodId: this.searchParamsprepareData.toPeriodId
    };

    this.spinnerService.show();

    this.financialReportService.getupdateGlAccountSelection(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response?.data || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: () => this.spinnerService.hide()
      });
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
    this.searchParams = new balanceReviewRptInputDto();
    this.getAllDataForReports = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
    this.levelSelect2 = [...this.levelSelect2]; 
    this.searchParams.level = null; 
  }

  public buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: this.translate.instant('FinancialReportResourceName.accounT_CODE'), field: 'accounT_CODE', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.accounT_NAME'), field: 'accounT_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_NAME'), field: 'jE_NAME', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_DATE'), field: 'jE_DATEstr', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), field: 'jE_SOURCE_DESC', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.notes'), field: 'notes', width: 200 },
      { headerName: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), field: 'debiT_AMOUNTstr', width: 200,  
      valueFormatter: (params) => formatNumericCell(params.value, 2, 'en-US') },
      { headerName: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), field: 'crediT_AMOUNTstr', width: 200,  
       valueFormatter: (params) => formatNumericCell(params.value, 2, 'en-US') },
    ];
  }

  onTableAction(event: { action: string, row: any }) { }

  printExcel(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_CODE'), key: 'accounT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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
        },

      });
  }

  printPDF(): void {
    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getupdateGlAccountSelection({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_CODE'), key: 'accounT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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


  getGeneralBalanceSheetRptDataprintExcel(): void {
    if (!this.checkDataPrepared()) return;

    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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
        },

      });
  }

  getGeneralBalanceSheetRptDataprintPDF(): void {
    if (!this.checkDataPrepared()) return;

    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralBalanceSheetRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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

  getGeneralProLosRPTDataprintExcel(): void {
    if (!this.checkDataPrepared()) return;

    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
                    { label: this.translate.instant('FinancialReportResourceName.oB_Amount'), key: 'oB_Amount' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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
        },

      });
  }

  getGeneralProLosRPTDataprintPDF(): void {
    if (!this.checkDataPrepared()) return;

    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetGeneralProLosRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.amount'), key: 'amount' },
                    { label: this.translate.instant('FinancialReportResourceName.oB_Amount'), key: 'oB_Amount' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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

  getgltrialbalancesRPTDataprintExcel(): void {
    if (!this.checkDataPrepared()) return;

    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.balance'), key: 'balance' },
                    { label: this.translate.instant('FinancialReportResourceName.debit'), key: 'debit' },
                    { label: this.translate.instant('FinancialReportResourceName.credit'), key: 'credit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_debit'), key: 'ob_debit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_credit'), key: 'ob_credit' },
                    { label: this.translate.instant('FinancialReportResourceName.entity_id'), key: 'entity_id' },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), key: 'user_id' },
                    { label: this.translate.instant('FinancialReportResourceName.rn'), key: 'rn' },
                    { label: this.translate.instant('FinancialReportResourceName.deptOBCalc'), key: 'deptOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.creditOBCalc'), key: 'creditOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.endDept'), key: 'endDept' },
                    { label: this.translate.instant('FinancialReportResourceName.endCredit'), key: 'endCredit' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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
        },

      });
  }

  getgltrialbalancesRPTDataprintPDF(): void {
    if (!this.checkDataPrepared()) return;

    if (!this.searchParams.level) {
      this.translate
        .get(['FinancialReportResourceName.levelId', 'COMMON.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['FinancialReportResourceName.levelId']} ${translations['COMMON.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const params = new balanceReviewRptInputDto()
    {
      params.level = this.searchParams.level;
      params.user_ID = localStorage.getItem('userId');
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(params);
    this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgetgltrialbalancesRPTData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.balanceReview_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.balanceReview_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.levelId'), value: this.searchParams.level },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), value: this.searchParams.user_ID },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.level_desc'), key: 'level_desc' },
                    { label: this.translate.instant('FinancialReportResourceName.acc_code'), key: 'acc_code' },
                    { label: this.translate.instant('FinancialReportResourceName.acC_DESC'), key: 'ACC_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.balance'), key: 'balance' },
                    { label: this.translate.instant('FinancialReportResourceName.debit'), key: 'debit' },
                    { label: this.translate.instant('FinancialReportResourceName.credit'), key: 'credit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_debit'), key: 'ob_debit' },
                    { label: this.translate.instant('FinancialReportResourceName.ob_credit'), key: 'ob_credit' },
                    { label: this.translate.instant('FinancialReportResourceName.entityId'), key: 'entity_id' },
                    { label: this.translate.instant('FinancialReportResourceName.user_id'), key: 'user_id' },
                    { label: this.translate.instant('FinancialReportResourceName.rn'), key: 'rn' },
                    { label: this.translate.instant('FinancialReportResourceName.deptOBCalc'), key: 'deptOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.creditOBCalc'), key: 'creditOBCalc' },
                    { label: this.translate.instant('FinancialReportResourceName.endDept'), key: 'endDept' },
                    { label: this.translate.instant('FinancialReportResourceName.endCredit'), key: 'endCredit' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
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
