import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  [key: string]: any;
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
      userId?: string | null,
      level?: number | null
    }
  }): Observable<any> {

    return this.http.post(`${this.BASE_URL}${ApiEndpoints.Charts.Base}${ApiEndpoints.Charts.RevenueAndExpenses}`, payload);
  }

  getExpensesRevenuesComparison(payload: {
    chartType: number,
    parameters: {
      language?: string,
      year?: string[],
      entityId?: string[],
      type?: any | null,
      id?: any | null,
      periodId?: string | null
    }
  },typeComparison:string): Observable<any> {
    const endpoint = ApiEndpoints.Charts[typeComparison as keyof typeof ApiEndpoints.Charts];
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.Charts.Base}${endpoint}`, payload);
  }

    getGuaranteesChart(payload: {
    chartType: number,
    parameters: {
      language?: string,
      periodYearId?: string,
      caseStatus?: string | null,
      userId?: string | null,
      entityId?: string | null,
      sponcerCategory?: string | null,
      nationality?: string | null,
      periodId?: any | null,
      haiOffice?: string | null,
      years?: string[],
      comparisonType?: number | null,
      comparisonId?: string | null
    }
  }): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}${ApiEndpoints.Charts.Base}${ApiEndpoints.Charts.GuaranteesCharts}`,
      payload
    );
  }


  getReceiptsandPaymentChart(payload: {
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
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.Charts.Base}${ApiEndpoints.Charts.ReceiptsAndPayments}`;
    return this.http.post(apiUrl, payload);
  }

  getReceiptsandPaymentsComparison(payload: {
    chartType: number,
    parameters: {
      language?: string,
      year?: string[],
      entityId?: string[],
      type?: any | null,
      id?: any | null,
      periodId?: string | null
    }
  }, typeComparison: string): Observable<any> {
    const endpoint = ApiEndpoints.Charts[typeComparison as keyof typeof ApiEndpoints.Charts];
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.Charts.Base}${endpoint}`, payload);
    }

    getSocialCasesChart(payload: {
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
        const apiUrl = `${this.BASE_URL}${ApiEndpoints.Charts.Base}${ApiEndpoints.Charts.GetSocialCasesCharts}`;
        return this.http.post(apiUrl, payload);
    }


    getProjectChart(payload: {
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
        const apiUrl = `${this.BASE_URL}${ApiEndpoints.Charts.Base}${ApiEndpoints.Charts.GetProjectCharts}`;
        return this.http.post(apiUrl, payload);
    }
}
