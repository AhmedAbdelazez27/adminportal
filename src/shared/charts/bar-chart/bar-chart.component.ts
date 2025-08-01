import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts, { Options, SeriesColumnOptions } from 'highcharts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptionsBar: Options = {};
  chart: Highcharts.Chart | undefined;

  @Input() categories: string[] = [];
  @Input() seriesData: { name: string; data: number[]; color?: string }[] = [];
  @Input() direction: 'rtl' | 'ltr' = 'rtl';

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.categories );
    
    this.buildChartOptions();
  }
    addComponentRef(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  private buildChartOptions() {
    const isRtl = this.direction === 'rtl';

    this.chartOptionsBar = {
      chart: {
        type: 'column',
        style: {
          direction: isRtl ? 'rtl' : 'ltr' 
        }
      },
      title: { text: '' },
      xAxis: {
        categories: isRtl ? [...this.categories].reverse() : this.categories,
        reversed: isRtl, 
        labels: {
          style: {
            fontSize: '14px',
            color: '#333333',
            textAlign: isRtl ? 'right' : 'left'
          }
        }
      },
      yAxis: {
        min: 0,
        title: { text: '' },
        gridLineWidth: 1,
        gridLineColor: '#ccc',
        labels: {
          style: {
            fontSize: '12px',
            color: '#777'
          }
        }
      },
      series: this.seriesData.map(s => ({
        name: s.name,
        type: 'column',
        data: isRtl ? [...s.data].reverse() : s.data, 
        color: s.color,
        dataLabels: {
          enabled: false,
          color: '#FFFFFF',
          style: {
            fontSize: '12px',
            fontWeight: 'bold'
          }
        }
      })) as SeriesColumnOptions[],
      tooltip: {
        headerFormat: '<span style="font-size: 10px">{point.key}</span><br>',
        pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br>',
        valueSuffix: ' units',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          groupPadding: 0.05,
          pointPadding: 0,
          borderWidth: 0
        },
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                alert('تم النقر على: ' + this.category);
              }
            }
          }
        }
      },
      legend: {
       enabled: false
      },
      credits: { enabled: false }
    };
  }
}
