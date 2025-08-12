import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts, { Options, SeriesOptionsType } from 'highcharts';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptionsPie: Options = {};
  chart: Highcharts.Chart | undefined;

  @Input() categories: string[] = [];
  @Input() seriesData: { name: string; data: number[]; color?: string }[] = [];
  @Input() direction: 'rtl' | 'ltr' = 'rtl';
  @Input() chartType: 'column' | 'line' | 'pie' = 'column';

  ngOnChanges(_: SimpleChanges): void {
    console.log("categories ", this.categories);
    console.log("seriesData ", this.seriesData);
    this.buildChartOptions();
  }

  addComponentRef(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  private buildChartOptions() {
    const isRtl = this.direction === 'rtl';
    const H = Highcharts;
    const cats = isRtl ? [...this.categories].reverse() : this.categories;
    const NULL_TEXT = null as unknown as string;

    const mapSeries = (arr: typeof this.seriesData): SeriesOptionsType[] =>
      arr.map<SeriesOptionsType>(s => ({
        name: s.name,
        type: this.chartType,
        data: (isRtl ? [...s.data].reverse() : s.data) as any,
        color: s.color,
        dataLabels: {
          enabled: false,
          style: { fontSize: '12px', fontWeight: 'bold' }
        }
      }));

    const axesOptions: Pick<Options, 'xAxis' | 'yAxis' | 'chart'> = {
      chart: {
        type: this.chartType,
        style: { direction: isRtl ? 'rtl' : 'ltr' }
      },
      xAxis: {
        categories: cats,
        reversed: isRtl,
        labels: {
          style: {
            fontSize: '14px',
            color: '#333333',
            textAlign: isRtl ? 'right' : 'left'
          }
        },
        title: { text: NULL_TEXT }
      },
      yAxis: {
        min: undefined,
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: '#ccc',
        labels: {
          formatter: function () {
            return H.numberFormat(Number(this.value), 0, '.', ',');
          },
          style: { fontSize: '12px', color: '#777' }
        }
      }
    };

    this.chartOptionsPie = {
      ...axesOptions,

      title: { text: NULL_TEXT },
      subtitle: { text: NULL_TEXT },

      series: mapSeries(this.seriesData),

      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><br>',
        pointFormatter: function () {
          return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${H.numberFormat(Number(this.y), 0, '.', ',')}</b><br>`;
        },
        shared: true,
        useHTML: true
      },

      plotOptions: {
        column: {
          groupPadding: 0.05,
          pointPadding: 0,
          borderWidth: 0
        },
        line: {
          marker: {
            enabled: true,
            symbol: 'circle'
          }
        },
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                
              }
            }
          }
        }
      },

      legend: {
        enabled: true,
        layout: 'horizontal',
        verticalAlign: 'bottom',
        align: 'center',
        itemMarginTop: 6,
        itemMarginBottom: 6,
        itemDistance: 24,
        symbolRadius: 6,
        useHTML: true,
        labelFormatter: function () {
          return `<span style="font-size:14px;color:#1f2d3d;${isRtl ? 'direction:rtl;' : ''}">${escapeHtml(this.name)}</span>`;
        }
      },

      credits: { enabled: false }
    };
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
