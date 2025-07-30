import { Component, OnInit } from '@angular/core';
import { BarChartComponent } from "../../../../../../shared/charts/bar-chart/bar-chart.component";
import { Select2Service } from '../../../../../core/services/Select2.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChartsService } from '../../../../../core/services/Financial/charts/charts.service';

@Component({
  selector: 'app-revenue-general',
  standalone: true,
  imports: [BarChartComponent, CommonModule, FormsModule, NgSelectModule],
  templateUrl: './revenue-general.component.html',
  styleUrls: ['./revenue-general.component.scss'],
  providers: [Select2Service]
})
export class RevenueGeneralComponent implements OnInit {
  yearsList: any = [];
  selectedYearId: any = '1';

  chartTypes: any = [];
  selectedChart: string | null = null;
  selectedChart2: string | null = null;

  constructor(private _Select2Service: Select2Service, private _ChartsService: ChartsService) {

  }

  ngOnInit(): void {
    this.getYearList();
    this.getchaertypesList();
  }

  getYearList() {
    this._Select2Service.getGlPeriodYearsSelect2List().subscribe({
      next: (res) => {
        this.yearsList = res.results;
        const currentYear = ((new Date().getFullYear()) - 1).toString();
        const currentYearItem = this.yearsList.find((item: any) => item.text === currentYear);
        this.selectedYearId = currentYearItem.id
        this.onYearChange();
      }, error: (err) => {
        console.log(err);

      }
    })
  }

  getchaertypesList() {
    this._Select2Service.getChartTypeRevenueAndExpenses().subscribe({
      next: (res) => {
        console.log(res);
        this.chartTypes = res
      }, error: (err) => {
        console.log(err);

      }
    })
  }





  onYearChange() {
    if (!this.selectedYearId) return;

    const payload = {
      chartType: 1,
      parameters: {
        language: 'en',
        periodYearId: this.selectedYearId.toString(),
        entityId: '',
        periodId: null,
        departmentId: null,
        countryId: null,
        branchId: null,
        userId: null,
        level: null
      }
    };

    this._ChartsService.getRevenueAndExpensesChart(payload).subscribe({
      next: (res) => {

      },
      error: (err) => console.error(err)
    });
  }

}
