import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighchartsChartModule } from "highcharts-angular";
import Highcharts from 'highcharts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, HighchartsChartModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {
  // Define an area chart using highchart 
  Highcharts: typeof Highcharts = Highcharts;

  constructor() { }

  ngOnInit(): void {

  }

  // Bar chart configuration
  chartOptionsBar: Highcharts.Options = {
    chart: {
      // type: 'column', 
      // backgroundColor: '#f4f4f4',
      // borderColor: '#b0b0b0', 
      // borderWidth: 2
    },
    title: {
      text: '',
      // style: {
      //   fontSize: '16px',
      //   fontWeight: 'bold',
      //   color: '#333333'
      // }
    },
    xAxis: {
      categories: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5', 'Category 6'],
      labels: {
        style: {
          fontSize: '14px',
          color: '#333333'
        }
      }
    },
    yAxis: {
      title: {
        text: ''
      },
      min: 0,
      gridLineWidth: 1,
      gridLineColor: '#ccc',
      labels: {
        style: {
          fontSize: '12px',
          color: '#777'
        }
      }
    },
    series: [
      {
        name: 'Category Data',
        type: 'column',
        data: [12, 9, 14, 18, 22, 70],
        color: '#FF5733',
        borderColor: '#b43b3b',
        borderWidth: 1,
        pointPadding: 0.1,
        pointWidth: 30,
        dataLabels: {
          enabled: true,
          color: '#FFFFFF',
          style: {
            fontSize: '12px',
            fontWeight: 'bold'
          }
        }
      },
      {
        name: 'Value 2',
        type: 'column',
        data: [18, 12, 20, 15, 25, 78],
        color: '#33FF57',
        borderColor: '#4CAF50',
        borderWidth: 1,
        pointPadding: 0.1,
        pointWidth: 30,
        dataLabels: {
          enabled: true,
          color: '#FFFFFF',
          style: {
            fontSize: '12px',
            fontWeight: 'bold'
          }
        }
      }
    ],
    credits: {
      enabled: false
    },
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
        pointPadding: .0001,
        borderWidth: 0
      },
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              // alert('clicked ' + this.category);
            }
          }
        }
      }
    },
    legend: {
      align: 'left',
      verticalAlign: 'top',
      layout: 'horizontal',
      symbolWidth: 30,
      symbolHeight: 10,
      borderRadius: 0,
      itemStyle: {
        fontSize: '14px',
        color: '#333333',
        padding: '5px',
        backgroundColor: '#f7f7f7',
        borderRadius: 5,
      },
      itemMarginTop: 15,
      itemMarginBottom: 15,
      itemDistance: 20,
    }
  };

}