import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FilterApPaymentsTransactionHDRByIdDto, FilterApPaymentsTransactionHDRDto, ApPaymentsTransactionHDRDto, PagedResult } from '../dtos/ApPaymentsTransactionHDRdtos/ApPaymentsTransactionHDR.dto';
import { FndLookUpValuesSelect2RequestDto, SelectdropdownResult } from '../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { Select2APIEndpoint } from '../constants/select2api-endpoints';
import { loadBeneficentNameDto } from '../dtos/sponsorship/operations/beneficent.dto';

@Injectable({
  providedIn: 'root'
})
export class Select2Service {

  private readonly BASE_URL = `${environment.apiBaseUrl}`;
  constructor(private http: HttpClient) { }

  getEntitySelect2(params: FndLookUpValuesSelect2RequestDto): Observable<any> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetEntitySelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getPaymentTypeSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetApPymentTypeSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getApVendorSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetApVendorSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getArMiscStatusSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetArMiscStatusSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getBenNameSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetSpBenSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getProjectNameSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetProjectNameSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getCollectorSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetCollectorsSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getCategorySelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.ReceiptIdentifierSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getCountrySelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetFndCountrySelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getBranchSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetBranchSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getDeptSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetDepartmentSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getAccountSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetGlAccountSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getBeneficentIdSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetSpBeneficentsSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getGlPeriodSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetGlPeriodDetailSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getVendorSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetApVendorSelect2List}`
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }
  getBeneficentNamebyEntityID(loadBeneficentNameDto: loadBeneficentNameDto): Observable<SelectdropdownResult> {
   const apiUrl = `${this.BASE_URL}${Select2APIEndpoint.Select2.GetSpBenSelect2ListBYEntityID}`
    return this.http.post<SelectdropdownResult>(apiUrl, loadBeneficentNameDto);
  }

}
