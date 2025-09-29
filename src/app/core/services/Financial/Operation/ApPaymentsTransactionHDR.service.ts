import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { FilterApPaymentsTransactionHDRDto, ApPaymentsTransactionHDRDto, FilterApPaymentsTransactionHDRByIdDto } from '../../../dtos/FinancialDtos/OperationDtos/ApPaymentsTransactionHDR.dto';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Injectable({
  providedIn: 'root'
})
export class ApPaymentsTransactionHDRService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ApMiscPaymentTransactionHDR.Base}`;
  constructor(private http: HttpClient) { }

  getAll(params: FilterApPaymentsTransactionHDRDto): Observable<PagedResult<ApPaymentsTransactionHDRDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApMiscPaymentTransactionHDR.GetAll}`;
    return this.http.post<PagedResult<ApPaymentsTransactionHDRDto>>(apiUrl, params);
  }


  getDetailById(params: FilterApPaymentsTransactionHDRByIdDto): Observable<ApPaymentsTransactionHDRDto> {
    if (!params.paymentId || !params.entityId) {
      throw new Error('paymentId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApMiscPaymentTransactionHDR.GetById}`;
    return this.http.post<ApPaymentsTransactionHDRDto>(apiUrl, params);
  }
}
