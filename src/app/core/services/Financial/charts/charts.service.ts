import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  private readonly BASE_URL = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

  getRevenueAndExpensesChart(payload: {
    chartType: number,
    parameters: {
      language?: string,
      periodYearId?: string,
      entityId?: string,
      periodId?: number | null,
      departmentId?: number | null,
      countryId?: number | null,
      branchId?: number | null,
      userId?: number | null,
      level?: number | null
    }
  }): Observable<any> {

    return this.http.post(`${this.BASE_URL}${ApiEndpoints.Charts.Base}${ApiEndpoints.Charts.RevenueAndExpenses}`, payload);
  }
}
