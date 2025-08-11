import { Component, OnInit } from '@angular/core';
import { BarChartComponent } from "../../../../../shared/charts/bar-chart/bar-chart.component";
import { Select2Service } from '../../../../core/services/Select2.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChartsService } from '../../../../core/services/Financial/charts/charts.service';
import { forkJoin } from 'rxjs';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EntityService } from '../../../../core/services/entit.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sponsorship-charts',
  imports: [BarChartComponent, CommonModule, FormsModule, NgSelectModule, TranslateModule, RouterModule],
  templateUrl: './sponsorship-charts.component.html',
  styleUrl: './sponsorship-charts.component.scss',
  providers: [Select2Service]
})
export class SponsorshipChartsComponent {
  [key: string]: any;
  entities: any[] = [];
  yearsList: any = [];
  officesList: any = [];
  selectedYearId: any = '1';
  selectedEntity: any;
  selectedOffice: any;
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

  constructor(private _Select2Service: Select2Service, private _ChartsService: ChartsService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private entityService: EntityService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {

      this.defaultChartType = params['chartType'] || 'CasesNumberOrganization';
      this.getYearAndChartTypesList();
    });
    // this.getYearAndChartTypesList();
  }


  getYearAndChartTypesList() {
    // this.spinnerService.show();
    forkJoin({
      years: this._Select2Service.getGlPeriodYearsSelect2List(),
      chartTypes: this._Select2Service.getChartTypeGuarantees(),
      entities: this.entityService.GetSelect2List(0, 6000),
      officeSponsorships: this._Select2Service.getSpOfficesSelect2({skip:0,take:6000})
    }).subscribe({
      next: (res) => {
        let chartTypeBased;
        this.yearsList = res.years.results;
        this.chartTypes = res.chartTypes;
        console.log("res.officeSponsorships ",res.officeSponsorships);
        
        this.officesList = res.officeSponsorships?.results;
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
        } else if (this.defaultChartType == 'noofsponsorsbyentityandtypeofsponsorship') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 5;
          this.selectedChart2 = 1;
          chartTypeBased = 7
        } else if (this.defaultChartType == 'nofsponsorsinoutcountry') {
          this.pageTitle = "finanial_charts_periods_Department";
          this.selectedChart1 = 6;
          this.selectedChart2 = 1;
          chartTypeBased = 7
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
    if (!this.selectedYearId) return;
    this.spinnerService.show();
    const payload = {
      chartType: chartTypeBased,
      parameters: {
        language: '',
        periodYearId: this.selectedYearId.toString(),
        caseStatus: null,
        userId: null,
        entityId: null,
        sponcerCategory: null,
        nationality: null,
        periodId: null,
        haiOffice: null,
        years: [""],
        comparisonType: 1,
        comparisonId: null
      }
    };
    console.log("this.selectedChart1 = ", this.selectedChart1);

    if (typeChange == 'changeEntit') {
      this.spinnerService.show();
      // this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
      // this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
      if (this.selectedChart1) {
        this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
      }
      if (this.selectedChart2) {
        this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
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
    console.log("chart type = ", chartType);

    const payload = {
      chartType: chartType,
      parameters: {
        language: '',
        periodYearId: this.selectedYearId.toString(),
        caseStatus: null,
        userId: null,
        entityId: null,
        sponcerCategory: null,
        nationality: null,
        periodId: null,
        haiOffice: this.selectedOffice ? this.selectedOffice : null,
        years: [""],
        comparisonType: 1,
        comparisonId: null
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
    console.log("randomValues = ", randomValues);

    return randomValues;
  }
}
