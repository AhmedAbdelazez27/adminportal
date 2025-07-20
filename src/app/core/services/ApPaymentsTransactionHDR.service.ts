import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FilterApPaymentsTransactionHDRByIdDto, FilterApPaymentsTransactionHDRDto, ApPaymentsTransactionHDRDto, PagedResult } from '../dtos/ApPaymentsTransactionHDRdtos/ApPaymentsTransactionHDR.dto';
import { FndLookUpValuesSelect2RequestDto, SelectdropdownResult } from '../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Injectable({
  providedIn: 'root'
})
export class ApPaymentsTransactionHDRService {
  constructor(private http: HttpClient) { }

  getEntityList(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/Entity/GetSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getPaymentTypeList(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/Lookup/ApPaymentType`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getApVendorList(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/ApVendor/GetVendorSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getApPaymentsTransactionHDRs(params: FilterApPaymentsTransactionHDRDto): Observable<PagedResult<ApPaymentsTransactionHDRDto>> {
    const apiUrl = `${environment.apiBaseUrl}/ApPaymentTransactionsHdr/GetAll`;
    return this.http.post<PagedResult<ApPaymentsTransactionHDRDto>>(apiUrl, params);
  }

  getApPaymentsTransactionHDRDatabyId(params: FilterApPaymentsTransactionHDRByIdDto): Observable<ApPaymentsTransactionHDRDto> {
    const apiUrl = `${environment.apiBaseUrl}/ApPaymentTransactionsHdr/Get/${params.paymentId ?? ''}/${params.entityId ?? ''}`;
    return this.http.get<ApPaymentsTransactionHDRDto>(apiUrl);
  }
}
