import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BarChartComponent } from '../../../../../shared/charts/bar-chart/bar-chart.component';
import { ChartsService } from '../../../../core/services/Financial/charts/charts.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { EntityService } from '../../../../core/services/entit.service';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { MonthConstants } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ChartSeriesData, ChartUtilsService } from '../../../../../shared/services/chart-utils.service';

@Component({
  selector: 'app-receipts-payments-comparission',
  standalone: true,
  imports: [BarChartComponent, CommonModule, FormsModule, NgSelectModule, TranslateModule, RouterModule],
  templateUrl: './receipts-payments-comparission.component.html',
  styleUrl: './receipts-payments-comparission.component.scss',
  providers: [Select2Service]
})
export class ReceiptsPaymentsComparissionComponent implements OnInit {
  [key: string]: any;
  entities: any[] = [];
  departmentList: any[] = [];
  branchList: any[] = [];
  yearsList: any = [];
  accountList: any = [];

 // monthsList: any[] = [];
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

  selectedMonthId: number | null = null;

  selectedYearId: any[] = [];
  selectedYeartext: string[] = [];
  selectedDepartmentId: any = null;
  selectedBranchId: any = null;
  selectedEntity: any[] = [];
  selectedAccountId: any = null;
  selectedmonthId: any[] = [];
  selectedmonthtext: any[] = [];
  defaultChartType: string = '';
  pageTitle: string = "";

  chartTypes: any = [];
  selectedChart1: string | null = null;
  selectedChart2: string | null = null;

  categoriees: string[] = [];
  seriesData: any[] = [];

  categoriees2: string[] = [];
  seriesData2: any[] = [];
  lang: string | null = null;
  currentLang: string = "en";
  id: string = "";
  typeService: string = "";

  constructor(private _Select2Service: Select2Service,
    private _ChartsService: ChartsService,
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

      this.defaultChartType = params['chartType'] || 'receiptsByEntit';
      this.dynamicPageTitle();
      this.getYearAndChartTypesList();
    });
    this.getYearAndChartTypesList();
  //  this.monthsList = MonthConstants.monthsList;
  this.lang = localStorage.getItem('lang');
  }


  getYearAndChartTypesList() {
    this.spinnerService.show();
    forkJoin({
      years: this._Select2Service.getGlPeriodYearsSelect2List(),
      chartTypes: this._Select2Service.getReceiptsAndPaymentsSelect2(),
      entities: this.entityService.GetSelect2List(0, 6000),
      departments: this._Select2Service.getDeptSelect2({ take: 1000, skip: 0 }),
      accounts: this._Select2Service.getAccountSelect2({ take: 1000, skip: 0 }),
      branches: this._Select2Service.getBranchesSelect2()

    }).subscribe({
      next: (res) => {

        this.yearsList = res.years.results;
        this.chartTypes = res.chartTypes;
        this.departmentList = res.departments?.results;
        this.branchList = res.branches?.results;
        this.accountList = res.accounts?.results;
        this.entities = [{ id: "", text: 'No Select' }, ...res.entities?.results];
        this.spinnerService.forceHide();
      },
      error: (err: any) => {
        this.spinnerService.forceHide();
      }
    });
  }

  onChangemonthSelect2(selected: any[]): void {
    if (selected && selected.length > 0) {
      this.selectedmonthtext = selected.map(s => this.lang == "ar" ? s.text : s.textEn);
    } else {
      this.selectedmonthtext = [];
    }
  }

  onChangeYear(selected: any[]) {
    if (selected && selected.length > 0) {
      this.selectedYearId = selected.map(s => s.id).sort((a, b) => a - b);
    } else {
      this.selectedYearId = [];
    }

    this.onEntityChange(2, 'selectedYearId', this.selectedYearId);
  }

  onYearChange(typeChange: number) {
    if (!(this.selectedYearId.length && this.selectedEntity.length)) return;

    this.spinnerService.show();
    const payload = {
      chartType: typeChange,
      parameters: {
        language: this.currentLang,
        year: this.selectedYearId,
        entityId: this.selectedEntity,
        type: this.id,
        id: this.selectedAccountId || this.selectedBranchId || this.selectedDepartmentId || null, // will send on it ex branch id or account id ...... 
        periodId: typeChange == 2 ? this.selectedmonthId.join(',') : null
      }
    };
    this._ChartsService.getReceiptsandPaymentsComparison(payload, this.typeService).subscribe({
      next: (res) => {
        if (typeChange == 1) {
          this.parseChartData(res, 'categoriees', 'seriesData', this.selectedYeartext,'',);
          // this.onYearChange(2);
        }
        else if (typeChange == 2) {
          this.parseChartData(res, 'categoriees2', 'seriesData2', this.selectedYeartext, this.selectedmonthtext);
        }

        this.spinnerService.forceHide();
      },
      error: (err) => console.error(err)
    });

  }

  transformToChartData(raw: any[], categoriees: string, seriesData: string) {

    if (!raw || raw.length === 0) {
      this[categoriees] = [];
      this[seriesData] = [];
      return;
    }

    const colors = ['#72C5C2', '#114D7D', '#FFA726', '#26A69A', '#FF7043'];
    const valueKeys = Object.keys(raw[0]).filter(key =>
      /^value\d+$/.test(key)
    );

    const categories = raw.map(item => item.nameAr || item.id);

    const data = valueKeys.map((key, index) => {
      const strKey = key + 'str';
      const name = raw[0][strKey] ?? `Series ${index + 1}`;
      return {
        name,
        data: raw.map(item => item[key] ?? 0),
        color: colors[index % colors.length]
      };
    });
    this[categoriees] = categories
    this[seriesData] = data
  }

  parseChartData(res: any, categoriesName: string, seriesDataName: string, yearName: any, monthName: any) {

    const data = res.data || [];
    var chartvalueName : any = null;

    if (
      this.defaultChartType === "receiptsByEntity" ||
      this.defaultChartType === "receiptsByDepartment" ||
      this.defaultChartType === "receiptsByBranch" ||
      this.defaultChartType === "receiptsByAccount"
    ) {
      chartvalueName = this.translate.instant('FinancialCharts.chartvalueNameforreceipts');
    }
    else if (
      this.defaultChartType === "paymentsByEntity" ||
      this.defaultChartType === "paymentsByDepartment" ||
      this.defaultChartType === "paymentsByBranch" ||
      this.defaultChartType === "paymentsByAccount"
    ) {
      chartvalueName = this.translate.instant('FinancialCharts.chartvalueNameforpayments');
    }

    if (this.typeService)
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
        const year = Array.isArray(yearName) ? yearName[index] : yearName;
        const hasValidData = Array.isArray(series.data) && series.data.some(v => v !== null && v !== undefined);
        if (!hasValidData) {
          return;
        }
        if (index === 0) {
          mappedSeriesData.push({ ...series, name: chartvalueName + " " + monthName + " " + year });
        }
        if (index === 1) {
          mappedSeriesData.push({ ...series, name: chartvalueName + " " + monthName + " " + year });
        }
        if (index === 2) {
          mappedSeriesData.push({ ...series, name: this.translate.instant('FinancialCharts.chartvalueNameforRateofdeviation')});
        }
        if (index === 3) {
          mappedSeriesData.push({ ...series, name: this.translate.instant('FinancialCharts.chartvalueNameforRateofdeviation')});
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

  generateRandomValues(count: number): number[] {
    const randomValues: number[] = [];
    for (let i = 0; i < count; i++) {
      randomValues.push(Math.floor(Math.random() * 1001));
    }
    return randomValues;
  };


  onEntityChange(no: number = 2, ddlName: string, selected: any[]) {
    if (selected && selected.length > 0) {
      const sorted = [...selected].sort((a, b) => a.id - b.id);

      this.selectedYearId = selected.map(s => s.id).sort((a, b) => a - b);
      this.selectedYeartext = sorted.map(s => this.lang === "en" ? s.text : s.textEn);
    } else {
      this.selectedYearId = [];

      this.selectedYeartext = [];
    }
    if (this[ddlName].length >= no) {
      this.toastr.warning(`لا تستطيع اختيار أكثر من ${no} عناصر`);
    }
  }


  dynamicPageTitle() {
    switch (this.defaultChartType) {
      case 'receiptsByEntity':
        this.pageTitle = "FinancialCharts.receiptsByEntit_title";
        this.typeService = "GetReceiptsComparison"
        this.id = "1";
        break;

      case 'receiptsByDepartment':
        this.pageTitle = "FinancialCharts.receiptsByDepartment_title";
        this.typeService = "GetReceiptsComparison"
        this.id = "4";
        break;

      case 'receiptsByBranch':
        this.pageTitle = "FinancialCharts.receiptsByBranch_title";
        this.typeService = "GetReceiptsComparison"
        this.id = "3";
        break;

      case 'receiptsByAccount':
        this.pageTitle = "FinancialCharts.receiptsByAccount_title";
        this.typeService = "GetReceiptsComparison"
        this.id = "5";
        break

      case 'paymentsByEntity':
        this.pageTitle = "FinancialCharts.paymentsByEntit_title";
        this.typeService = "GetPaymentsComparison"
        this.id = "1";
        break;

      case 'paymentsByDepartment':
        this.pageTitle = "FinancialCharts.paymentsByDepartment_title";
        this.typeService = "GetPaymentsComparison"
        this.id = "4";
        break;

      case 'paymentsByBranch':
        this.pageTitle = "FinancialCharts.paymentsByBranch_title";
        this.typeService = "GetPaymentsComparison"
        this.id = "3";
        break;

      case 'paymentsByAccount':
        this.pageTitle = "FinancialCharts.paymentsByAccount_title";
        this.typeService = "GetPaymentsComparison"
        this.id = "5";
        break;
    }
  }
}
