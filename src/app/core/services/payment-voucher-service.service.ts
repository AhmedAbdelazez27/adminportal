import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentVoucherServiceService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** Get All AP Misc Payment Headers */
  getApMiscPaymentHeaders(params: any = {}): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/ApMiscPaymentHeader/GetAll`, params);
  }

  /** Get Beneficiary List */
  getBeneficiary(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/SpBeneficents/GetSpBeneficentsSelect2List`, request);
  }

  /** Get Entity List */
  getEntities(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Entity`);
  }

  /** Get Status List */
  getStatus(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Lookup/Posted`, request);
  }

  /** Get Misc Payment Header Details by ID */
  getMiscPaymentHeaderWithHisDetails(paymentId: string, entityId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ApMiscPaymentHeader/GetDetailById/${paymentId}/${entityId}`);
  }

  /** Get Payment Lines */
  getPaymentLines(paymentId: string, entityId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ApMiscPaymentHeader/GetPaymentLines/${paymentId}/${entityId}`);
  }

  /** Get Payment Details */
  getPaymentDetails(paymentId: string, entityId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ApMiscPaymentHeader/GetPaymentDetails/${paymentId}/${entityId}`);
  }
}
