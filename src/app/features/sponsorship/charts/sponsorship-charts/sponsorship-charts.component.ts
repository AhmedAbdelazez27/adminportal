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
import { FndLookUpValuesSelect2RequestDto, MonthConstants, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filteraidRequestsDto } from '../../../../core/dtos/socialcases/operations/aidRequests.dto';
import { ChartSeriesData, ChartUtilsService } from '../../../../../shared/services/chart-utils.service';

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
  selectedChart3: number | null = null;

  categories: string[] = [];
  seriesData: any[] = [];

  categories2: string[] = [];
  seriesData2: any[] = [];

  categories3: string[] = [];
  seriesData3: any[] = [];
  isComparission: boolean = false;
  monthsList = MonthConstants.monthsList;
  selectedmonthId: any[] = [];
  currentLang: string = "en";
  lang: string | null = null;

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
    private route: ActivatedRoute,
    private chartUtils: ChartUtilsService
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

    this.monthsList = MonthConstants.monthsList;
    this.lang = localStorage.getItem('lang');

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

        this.officesList = res.officeSponsorships?.results;
        this.sponsorshipCategories = res.officeSponsorships?.results;
        this.sponcerOfficesList = res.officeSponsorships?.results;
        this.entities = [{ id: "", text: this.translate.instant('Common.Select')}, ...res.entities?.results];
        this.selectedEntity = "";
        const maxIdItem = res.years.results.reduce((maxItem: any, currentItem: any) => {
          return (parseInt(currentItem.id) > parseInt(maxItem.id)) ? currentItem : maxItem;
        });

        if (this.defaultChartType == 'CasesNumberOrganization') {
          this.pageTitle = "sponsorshipchart.numbersOfSponsorsheader";
          this.selectedChart1 = 4;
          this.selectedChart2 = 1;

        }
        else if (this.defaultChartType == 'CasesNumberBySponsorShip') {
          this.pageTitle = "sponsorshipchart.numbersOfSponsorsheader";
          this.selectedChart1 = 4;
          this.selectedChart2 = 1;
          chartTypeBased = 7

        }
        else if (this.defaultChartType == 'byperiodandtypeofsponsorship') {
          this.pageTitle = "sponsorshipchart.numbersByPeriodAndTypeheader";
          this.selectedChart1 = 4;
          this.selectedChart2 = 1;
          this.selectedChart3 = 5;
          chartTypeBased = 7

        }
        else if (this.defaultChartType == 'bytypeofsponsorshipandnationality') {
          this.pageTitle = "sponsorshipchart.numbersByTypeAndNationalityheader";
          this.selectedChart1 = 1;
          this.selectedChart2 = 3;
          chartTypeBased = 7
        }
        else if (this.defaultChartType == 'Totaldonationsbytypeofsponsorship') {
          this.pageTitle = "sponsorshipchart.totalDonationsByTypeheader";
          this.selectedChart1 = 9;
          this.selectedChart2 = null;
          chartTypeBased = 8
        }
        else if (this.defaultChartType == 'Contractstatisticsbypaymentmethod') {
          this.pageTitle = "sponsorshipchart.contractStatsByPaymentMethodheader";
          this.selectedChart1 = 11;
          this.selectedChart2 = null;
          chartTypeBased = 10
        }
        else if (this.defaultChartType == 'noofsponsorsbyentityandtypeofsponsorship') {
          this.pageTitle = "sponsorshipchart.numbersByEntityAndTypeheader";
          this.selectedChart1 = 5;
          this.selectedChart2 = 1;
          chartTypeBased = 7
        }
        else if (this.defaultChartType == 'nofsponsorsinoutcountry') {
          this.pageTitle = "sponsorshipchart.numbersInOutCountryheader";
          this.selectedChart1 = 6;
          this.selectedChart2 = 1;
          chartTypeBased = 7
        }
        else if (this.defaultChartType == 'comparisonofCasesbytypeofsponsorship') {
          this.pageTitle = `${this.translate.instant('sponsorshipchart.comparisonOfCasesheader')} ${this.translate.instant('sponsorshipchart.byTypeOfSponsorshipheader')}`;
          this.selectedChart1 = 13;
          chartTypeBased = 13
          this.isComparission = true;
          this.comparisonType = 1;
          return;

        }
        else if (this.defaultChartType == 'comparisonofCasesaccordingtonationality') {
          this.pageTitle = `${this.translate.instant('sponsorshipchart.byTypeOfSponsorshipheader')} ${this.translate.instant('sponsorshipchart.byNationalityheader')}`;
          this.selectedChart1 = 13;
          chartTypeBased = 13
          this.isComparission = true;
          this.comparisonType = 2;
          return;
        }
        else if (this.defaultChartType == 'comparisonofCasesbyofficeoftheEntity') {
          this.pageTitle = `${this.translate.instant('sponsorshipchart.byTypeOfSponsorshipheader')} ${this.translate.instant('sponsorshipchart.byEntityOfficeheader')}`;
          this.selectedChart1 = 13;
          chartTypeBased = 13
          this.isComparission = true;
          this.comparisonType = 3;
          return;
        }
        else if (this.defaultChartType == 'casesavailableforsponsorship') {
          this.pageTitle = "sponsorshipchart.casesAvailableForSponsorshipheader";
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
 
    if (typeChange == 'changeEntity') {
      let hasTriggeredRequests = false;
      
      if (this.selectedChart1) {
        hasTriggeredRequests = true;
        this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
      }
      
      if (this.selectedChart2) {
        hasTriggeredRequests = true;
        this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
      }
      
      if (!hasTriggeredRequests) {
        this.spinnerService.forceHide();
      }
      return;
    }

    this.spinnerService.show();
    
    const payload = {
      chartType: chartTypeBased,
      parameters: {
        language: this.currentLang || 'en',
        periodYearId: !Array.isArray(this.selectedYearId) ? this.selectedYearId.toString() : null,
        caseStatus: null,
        userId: null,
        entityId: this.selectedEntity ? this.selectedEntity.toString() : null,
        sponcerCategory: this.selectedsponsorshipCategory || null,
        nationality: this.selectednationalitySelect2Obj || null,
        periodId: this.selectedmonthId && this.selectedmonthId.length > 0 ? this.selectedmonthId.toString() : null,
        haiOffice: this.selectedOffice || null,
        years: Array.isArray(this.selectedYearId) && this.selectedYearId.length > 0 ? this.selectedYearId : [this.selectedYearId.toString()],
        comparisonType: this.comparisonType,
        comparisonId: this.comparisonId
      }
    };

    this._ChartsService.getGuaranteesChart(payload).subscribe({
      next: (res) => {
        this.parseChartData(res, 'categories', 'seriesData');
        
        let additionalRequests = 0;
        
        if (this.selectedChart1) {
          additionalRequests++;
          this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
        }
        
        if (this.selectedChart2) {
          additionalRequests++;
          this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
        }
        
        if (additionalRequests === 0) {
          this.spinnerService.forceHide();
        }
      },
      error: (err) => {
        console.error('Error loading chart data:', err);
        this.spinnerService.forceHide();
        this.toastr.error('Failed to load chart data');
      }
    });
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
        entityId: this.selectedEntity ? this.selectedEntity.toString() : null,
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
    const data = res?.data || [];
    if (data.length === 0) {
      this[categoriesName] = [];
      this[seriesDataName] = [];
      return;
    }
    if (data.length > 0) {
      const result = this.chartUtils.parseChartData(res, this.currentLang, {
        useIndividualSeries: true,
        valueFields: ['value1', 'value2', 'value3', 'value4']
      });

      const mappedSeriesData: ChartSeriesData[] = [];
      result.seriesData.forEach((series, index) => {
        if (index === 0) {
          mappedSeriesData.push({ ...series, name: 'Revenue' });
        } else if (index === 1) {
          mappedSeriesData.push({ ...series, name: 'Expense' });
        }
      });
      this[categoriesName] = result.categories;
      this[seriesDataName] = mappedSeriesData;
    } else {
      this[categoriesName] = [];
      this[seriesDataName] = [];
    }
  }



  setDefaultValues(categoriesName: string, seriesDataName: string) {
    const result = this.chartUtils.parseChartData(null, this.currentLang);
    this[categoriesName] = result.categories;
    this[seriesDataName] = result.seriesData;
  }


  onEntityChange(no: number = 2, ddlName: string) {
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
