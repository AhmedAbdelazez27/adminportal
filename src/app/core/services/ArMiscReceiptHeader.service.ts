import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FilterArMiscReceiptHeaderByIdDto, FilterArMiscReceiptHeaderDto } from '../dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';
import { FndLookUpValuesSelect2RequestDto, SelectdropdownResult } from '../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ArMiscReceiptDetailsDto, ArMiscReceiptHeaderDto, ArMiscReceiptLinesDto, PagedResult } from '../dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';

@Injectable({
  providedIn: 'root'
})
export class ArMiscReceiptHeaderService {
  constructor(private http: HttpClient) { }

  getEntityList(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/Entity/GetSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getStatusList(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/Lookup/ArMiscPosted`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getBenNameList(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/SpBeneficents/GetSpBeneficentsSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getProjectNameList(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/ScProject/GetScProjectSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getArMiscReceiptHeaders(params: FilterArMiscReceiptHeaderDto): Observable<PagedResult<ArMiscReceiptHeaderDto>> {
    const apiUrl = `${environment.apiBaseUrl}/ArMiscReciptHeader/GetAll`;
    return this.http.post<PagedResult<ArMiscReceiptHeaderDto>>(apiUrl, params);
  }

  getArMiscReceiptHeaderDatabyId(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptHeaderDto> {
    const apiUrl = `${environment.apiBaseUrl}/ArMiscReciptHeader/GetReceiptHeader/${params.miscReceiptId ?? ''}/${params.entityId ?? ''}`;
    return this.http.get<ArMiscReceiptHeaderDto>(apiUrl);
  }

  getArMiscReceiptDetailDatabyId(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptDetailsDto[]> {
    const apiUrl = `${environment.apiBaseUrl}/ArMiscReciptHeader/GetReceiptDetails/${params.miscReceiptId ?? ''}/${params.entityId ?? ''}`;
    return this.http.get<ArMiscReceiptDetailsDto[]>(apiUrl);
  }

  getArMiscReceiptLineDatabyId(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptLinesDto[]> {
    const apiUrl = `${environment.apiBaseUrl}/ArMiscReciptHeader/GetReceiptLines/${params.miscReceiptId ?? ''}/${params.entityId ?? ''}`;
    return this.http.get<ArMiscReceiptLinesDto[]>(apiUrl);
  }
}
