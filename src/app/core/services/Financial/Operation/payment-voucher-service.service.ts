import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { FilterpaymentvoucherDto, paymentvoucherDto, FilterpaymentvoucherByIdDto, paymentvoucherdetailsDto, paymentvoucherlinesDto } from '../../../dtos/FinancialDtos/OperationDtos/payment-voucher.dto';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentVoucherServiceService {
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ApMiscPaymentHeader.Base}`;
  constructor(private http: HttpClient) {}

  getAll(params: FilterpaymentvoucherDto): Observable<PagedResult<paymentvoucherDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApMiscPaymentHeader.GetAll}`;
    return this.http.post<PagedResult<paymentvoucherDto>>(apiUrl, params);
  }

  getDetailById(params: FilterpaymentvoucherByIdDto): Observable<paymentvoucherDto> {
    if (!params.paymentId || !params.entityId) {
      throw new Error('paymentId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApMiscPaymentHeader.GetById(params.paymentId, params.entityId)}`;
    return this.http.get<paymentvoucherDto>(apiUrl);
  }

  getPaymentDetailsListDataById(params: FilterpaymentvoucherByIdDto): Observable<paymentvoucherdetailsDto[]> {
    if (!params.paymentId || !params.entityId) {
      throw new Error('paymentId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApMiscPaymentHeader.GetPaymentDetailsById(params.paymentId, params.entityId)}`;
    return this.http.get<paymentvoucherdetailsDto[]>(apiUrl);
  }

  getPaymentLinesListDataById(params: FilterpaymentvoucherByIdDto): Observable<paymentvoucherlinesDto[]> {
    if (!params.paymentId || !params.entityId) {
      throw new Error('paymentId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApMiscPaymentHeader.GetPaymentLinesById(params.paymentId, params.entityId)}`;
    return this.http.get<paymentvoucherlinesDto[]>(apiUrl);
  }
}
