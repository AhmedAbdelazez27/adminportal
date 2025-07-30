import { Component } from '@angular/core';
import { BarChartComponent } from "../../../../../../shared/charts/bar-chart/bar-chart.component";

@Component({
  selector: 'app-revenue-general',
  standalone: true,
  imports: [BarChartComponent], 
  templateUrl: './revenue-general.component.html',
  styleUrls: ['./revenue-general.component.scss']
})
export class RevenueGeneralComponent {

}
