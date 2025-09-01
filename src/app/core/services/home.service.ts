import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../constants/api-endpoints';

export interface HomeKpiApiItem {
  id?: string;
  nameAr?: string;
  nameEn?: string;
  value1?: number;
  value2?: number;
  value3?: number;
  value4?: number;
  value1str?: string;
  value2str?: string;
  value3str?: string;
  value4str?: string;
}

export interface HomeKpiDto {
  receipts: number;
  payments: number;
  revenues: number;
  expenses: number;
  receiptsLabel: string;
  paymentsLabel: string;
  revenuesLabel: string;
  expensesLabel: string;
  year?: number;
  totalRequests?: number;
  completedPercentage?: number;
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.Home.Base}`;

  constructor(private http: HttpClient) {}

  getHomePageKpisData(): Observable<HomeKpiApiItem[]> {
    const url = `${this.BASE_URL}${ApiEndpoints.Home.GetHomePageKpisData}`;
    return this.http.get<HomeKpiApiItem[]>(url); // body فاضي
  }


getHomeChartData() {
  //return this.http.get<any[]>('/api/Home/GetHomeChartData');
  const url = `${this.BASE_URL}${ApiEndpoints.Home.GetHomeChartData}`;
    return this.http.get<HomeKpiApiItem[]>(url); // body فاضي
}


}


