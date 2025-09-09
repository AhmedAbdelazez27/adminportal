import { Component, OnDestroy, OnInit } from '@angular/core';
import { BarChartComponent } from "../../../../../shared/charts/bar-chart/bar-chart.component";
import { Select2Service } from '../../../../core/services/Select2.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChartsService } from '../../../../core/services/Financial/charts/charts.service';
import { debounceTime, forkJoin, Subject, takeUntil } from 'rxjs';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EntityService } from '../../../../core/services/entit.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FndLookUpValuesSelect2RequestDto, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filteraidRequestsDto } from '../../../../core/dtos/socialcases/operations/aidRequests.dto';

@Component({
  selector: 'app-sponsorship-charts',
  imports: [BarChartComponent, CommonModule, FormsModule, NgSelectModule, TranslateModule, RouterModule],
  templateUrl: './sponsorship-charts.component.html',
  styleUrl: './sponsorship-charts.component.scss',
  providers: [Select2Service]
})
export class SponsorshipChartsComponent implements OnInit, OnDestroy {
  [key: string]: any;
  entities: any[] = [];
  yearsList: any = [];
  officesList: any = [];
  sponcerOfficesList: any = [];
  sponsorshipCategories: any = [];
  selectedYearId: any = '1';
  selectedEntity: any;
  selectedOffice: any;
  selectedSponsorOffice: any;
  selectedNationality: any;
  selectedsponsorshipCategory: any;
  defaultChartType: string = '';
  pageTitle: string = "";

  chartTypes: any = [];
  selectedChart1: number | null = null;
  selectedChart2: number | null = null;

  categories: string[] = [];
  seriesData: any[] = [];

  categories2: string[] = [];
  seriesData2: any[] = [];

  categories3: string[] = [];
  seriesData3: any[] = [];
  isComparission: boolean = false;
  monthsList: any = [
    { id: 1, text: 'يناير', textEn: 'January' },
    { id: 2, text: 'فبراير', textEn: 'February' },
    { id: 3, text: 'مارس', textEn: 'March' },
    { id: 4, text: 'أبريل', textEn: 'April' },
    { id: 5, text: 'مايو', textEn: 'May' },
    { id: 6, text: 'يونيو', textEn: 'June' },
    { id: 7, text: 'يوليو', textEn: 'July' },
    { id: 8, text: 'أغسطس', textEn: 'August' },
    { id: 9, text: 'سبتمبر', textEn: 'September' },
    { id: 10, text: 'أكتوبر', textEn: 'October' },
    { id: 11, text: 'نوفمبر', textEn: 'November' },
    { id: 12, text: 'ديسمبر', textEn: 'December' }
  ];
  selectedmonthId: any[] = [];
  currentLang: string = "en";
  comparisonId: any = null;
  comparisonType: any = null;

  nationalitySelect2: SelectdropdownResultResults[] = [];
  loadingnationality = false;
  nationalitysearchParams = new Select2RequestDto();
  selectednationalitySelect2Obj: any = null;
  nationalitySearchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new filteraidRequestsDto();

  constructor(private _Select2Service: Select2Service, private _ChartsService: ChartsService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private entityService: EntityService,
    private route: ActivatedRoute
  ) {
    this.translate.onLangChange.subscribe(lang => {
      this.currentLang = lang.lang;
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {

      this.defaultChartType = params['chartType'] || 'CasesNumberOrganization';
      this.getYearAndChartTypesList();
    });
    // this.getYearAndChartTypesList();
    this.nationalitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchnationalitySelect2());


    this.fetchnationalitySelect2();
  }


  getYearAndChartTypesList() {
    // this.spinnerService.show();
    forkJoin({
      years: this._Select2Service.getGlPeriodYearsSelect2List(),
      chartTypes: this._Select2Service.getChartTypeGuarantees(),
      entities: this.entityService.GetSelect2List(0, 6000),
      officeSponsorships: this._Select2Service.getSpOfficesSelect2({ skip: 0, take: 6000 }),
      sponcerCategory: this._Select2Service.getSponcerCategorySelect2({ skip: 0, take: 6000 }),
      sponcerOffices: this._Select2Service.getSpOfficesSelect2({ skip: 0, take: 6000 }),
    }).subscribe({
      next: (res) => {
        let chartTypeBased;
        this.yearsList = res.years.results;
        this.chartTypes = res.chartTypes;
        // console.log("res.officeSponsorships ", res.officeSponsorships);

        this.officesList = res.officeSponsorships?.results;
        this.sponsorshipCategories = res.officeSponsorships?.results;
        this.sponcerOfficesList = res.officeSponsorships?.results;
        this.entities = [{ id: "", text: 'No Select' }, ...res.entities?.results];
        this.selectedEntity = "";
        const maxIdItem = res.years.results.reduce((maxItem: any, currentItem: any) => {
          return (parseInt(currentItem.id) > parseInt(maxItem.id)) ? currentItem : maxItem;
        });

        if (this.defaultChartType == 'CasesNumberOrganization') {
          this.pageTitle = "finanial_charts_general_expenses";
          this.selectedChart1 = 4;
          this.selectedChart2 = 1;

        } else if (this.defaultChartType == 'byperiodandtypeofsponsorship') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 4;
          this.selectedChart2 = 1;
        } else if (this.defaultChartType == 'bytypeofsponsorshipandnationality') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 1;
          this.selectedChart2 = 3;
        } else if (this.defaultChartType == 'Totaldonationsbytypeofsponsorship') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 9;
          this.selectedChart2 = null;
          chartTypeBased = 8
        } else if (this.defaultChartType == 'Contractstatisticsbypaymentmethod') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 11;
          this.selectedChart2 = null;
          chartTypeBased = 10
        }else if (this.defaultChartType == 'noofsponsorsbyentityandtypeofsponsorship') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 5;
          this.selectedChart2 = 1;
          chartTypeBased = 7
        } else if (this.defaultChartType == 'nofsponsorsinoutcountry') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 6;
          this.selectedChart2 = 1;
          chartTypeBased = 7
        } else if (this.defaultChartType == 'comparisonofCasesbytypeofsponsorship') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 13;
          chartTypeBased = 13
          this.isComparission = true;
          this.comparisonType = 1;
          return;

        } else if (this.defaultChartType == 'comparisonofCasesaccordingtonationality') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 13;
          chartTypeBased = 13
          this.isComparission = true;
          this.comparisonType = 2;
          return;
        }else if (this.defaultChartType == 'comparisonofCasesbyofficeoftheEntity') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 13;
          chartTypeBased = 13
          this.isComparission = true;
          this.comparisonType = 3;
          return;
        } else if (this.defaultChartType == 'casesavailableforsponsorship') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 12;
          this.selectedChart2 = null;
          chartTypeBased = 14
        } 

        if (maxIdItem) {
          this.selectedYearId = maxIdItem.id;
          this.onYearChange("", chartTypeBased);
        }

      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }





  onYearChange(typeChange?: string, chartTypeBased: number = 7) {
    if (this.defaultChartType == 'comparisonofCasesbytypeofsponsorship') {
      this.comparisonId = this.selectedsponsorshipCategory;
    } else if (this.defaultChartType == 'comparisonofCasesaccordingtonationality') {
      this.comparisonId = this.selectednationalitySelect2Obj;
    } else if (this.defaultChartType == 'comparisonofCasesbyofficeoftheEntity') {
      this.comparisonId = this.selectedSponsorOffice;
    }

    if (!this.selectedYearId) return;
    this.spinnerService.show();
    const payload = {
      chartType: chartTypeBased,
      parameters: {
        language: '',
        periodYearId: !Array.isArray(this.selectedYearId) ? this.selectedYearId.toString() : null,
        caseStatus: null,
        userId: null,
        entityId: this.selectedEntity.toString(),
        sponcerCategory: this.selectedsponsorshipCategory ? this.selectedsponsorshipCategory : null,
        nationality: null,
        periodId: null,
        haiOffice: null,
        years: Array.isArray(this.selectedYearId) && this.selectedYearId.length > 0 ? this.selectedYearId : [""],
        comparisonType: this.comparisonType,
        comparisonId: this.comparisonId

      }
    };
    // console.log("this.selectedChart1 = ", this.selectedChart1);

    if (typeChange == 'changeEntit') {
      let hasTriggeredRequests = false;
      if (this.selectedChart1) {
        hasTriggeredRequests = true;
        this.spinnerService.show();
        this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
      }
      if (this.selectedChart2) {
        hasTriggeredRequests = true;
        this.spinnerService.show();
        this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
      }
      if (!hasTriggeredRequests) {
        this.spinnerService.forceHide();
      }
      return;
    } else {
      this._ChartsService.getGuaranteesChart(payload).subscribe({
        next: (res) => {
          this.parseChartData(res, 'categories', 'seriesData');
          if (this.selectedChart1) {
            this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
          }
          if (this.selectedChart2) {
            this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
          }
          this.spinnerService.forceHide();
        },
        error: (err) => console.error(err)
      });
    }
  }


  onTypeChange(chartType: any, categoriesName: string, seriesDataName: string) {
    if (!this.selectedYearId) return;
     if (this.defaultChartType == 'comparisonofCasesbytypeofsponsorship') {
      this.comparisonId = this.selectedsponsorshipCategory;
    } else if (this.defaultChartType == 'comparisonofCasesaccordingtonationality') {
      this.comparisonId = this.selectednationalitySelect2Obj;
    }

    const payload = {
      chartType: chartType,
      parameters: {
        language: '',
        periodYearId: !Array.isArray(this.selectedYearId) ? this.selectedYearId.toString() : null,
        caseStatus: null,
        userId: null,
        entityId: this.selectedEntity.toString(),
        sponcerCategory: this.selectedsponsorshipCategory ? this.selectedsponsorshipCategory : null,
        nationality: null,
        periodId: this.selectedmonthId.length > 0 ? this.selectedmonthId.toString() : null,
        haiOffice: this.selectedOffice ? this.selectedOffice : null,
        years: Array.isArray(this.selectedYearId) && this.selectedYearId.length > 0 ? this.selectedYearId : [""],
        comparisonType: this.comparisonType,
        comparisonId: this.comparisonId
      }
    };

    this._ChartsService.getGuaranteesChart(payload).subscribe({
      next: (res) => {
        this.parseChartData(res, categoriesName, seriesDataName);
        this.spinnerService.forceHide();
      },
      error: (err) => {
        console.error(err);
        this.spinnerService.forceHide();
      }
    });
  }

  parseChartData(res: any, categoriesName: string, seriesDataName: string) {
    if (!res || !res.data || res.data.length === 0) {
      this.setDefaultValues(categoriesName, seriesDataName);
    } else {

      this[categoriesName] = res.data.map((item: any) => item.nameEn);


      const seriesAData = res.data.map((item: any) => item.value1);
      const seriesBData = res.data.map((item: any) => item.value2);


      this[seriesDataName] = [
        { name: 'Series A', data: seriesAData, color: '#72C5C2' },
        { name: 'Series B', data: seriesBData, color: '#114D7D' }
      ];
    }
  }


  setDefaultValues(categoriesName: string, seriesDataName: string) {
    this[categoriesName] = ['Cat 1', 'Cat 2', 'Cat 3'];
    this[seriesDataName] = [
      { name: 'Series A', data: this.generateRandomValues(3), color: '#72C5C2' },
      { name: 'Series B', data: this.generateRandomValues(3), color: '#114D7D' }
    ];
  }

  generateRandomValues(count: number): number[] {
    const randomValues: number[] = [];
    for (let i = 0; i < count; i++) {
      randomValues.push(Math.floor(Math.random() * 1001));
    }
    // console.log("randomValues = ", randomValues);

    return randomValues;
  };

  onEntityChange(no: number = 2, ddlName: string) {
    // console.log(this[ddlName]);
    if (this[ddlName].length >= no) {
      this.toastr.warning(`لا تستطيع اختيار أكثر من ${no} عناصر`);
    }
  }

  fetchnationalitySelect2(): void {
    this.loadingnationality = true;
    const searchVal = this.nationalitysearchParams.searchValue?.trim();
    this.searchSelect2Params.searchValue = searchVal === '' ? null : searchVal;
    this.searchSelect2Params.skip = this.nationalitysearchParams.skip;
    this.searchSelect2Params.take = this.nationalitysearchParams.take;

    this._Select2Service.getNationalitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.nationalitySelect2 = [...this.nationalitySelect2, ...newItems];
          this.loadingnationality = false;
        },
        error: () => this.loadingnationality = false
      });
  };
  loadMorenationality(): void {
    this.nationalitysearchParams.skip++;
    this.fetchnationalitySelect2();
  }
  onnationalitySelect2Change(selectedvendor: any): void {
    console.log("selectednationalitySelect2Obj ", this.selectednationalitySelect2Obj);
    if (selectedvendor) {
      this.searchParams.nationality = selectedvendor.id;
      this.searchParams.nationalitystr = selectedvendor.text;
    } else {
      this.searchParams.nationality = null;
      this.searchParams.nationalitystr = null;
    }
  };

  onnationalitySearch(event: { term: string; items: any[] }): void {

    const search = event.term;
    this.nationalitysearchParams.skip = 0;
    this.nationalitysearchParams.searchValue = search;
    this.nationalitySelect2 = [];
    this.nationalitySearchInput$.next(search);
  };


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
