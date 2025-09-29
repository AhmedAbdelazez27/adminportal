import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { casePaymentDto, casePaymentHdrDto, filtercasePaymentByIdDto, filtercasePaymentDto } from '../../../dtos/sponsorship/operations/casePayment.models';

@Injectable({
  providedIn: 'root'
})
export class casePaymentService {
  private readonly BASE_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAll(params: filtercasePaymentDto): Observable<casePaymentDto[]> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SpCasesPayment.Base}${ApiEndpoints.SpCasesPayment.GetAll}`;
    return this.http.post<casePaymentDto[]>(apiUrl, params);
  }

  getDetailById(params: filtercasePaymentByIdDto): Observable<casePaymentDto> {
    if (!params.paymentCode) {
      throw new Error('paymentCode and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SpCasesPayment.Base}${ApiEndpoints.SpCasesPayment.GetById(params.paymentCode)}`;
    return this.http.get<casePaymentDto>(apiUrl);
  }

  getspCasesPaymentHdr(params: filtercasePaymentByIdDto): Observable<casePaymentHdrDto[]> {
    if (!params.paymentCode || !params.entityId) {
      throw new Error('paymentCode and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SpCasesPayment.GetspCasesPaymentHdrBase}${ApiEndpoints.SpCasesPayment.GetspCasesPaymentHdr}`;
    return this.http.post<casePaymentHdrDto[]>(apiUrl, params);
  }
}
