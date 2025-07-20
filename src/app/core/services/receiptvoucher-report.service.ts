

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReceiptvoucherReportService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getCachReceiptRpt(params: any = {}): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/FinancialReports/GetCachReceiptRpt`, params);
  }
  printCachReceiptRpt(params: any = {}): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/FinancialReports/GetCachReceiptRpt`, params);
  }
  excelCachReceiptRpt(params: any = {}): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/FinancialReports/GetCachReceiptRpt`, params);
  }

  getCollector(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ApMiscPaymentHeader/GetCollectorsSelect2List`, request);
  }

  getEntities(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Entity`);
  }

  getCategory(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Lookup/ReceiptIdentifier`, request);
  }
}
