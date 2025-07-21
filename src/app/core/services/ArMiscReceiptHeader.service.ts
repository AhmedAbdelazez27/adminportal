import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FilterArMiscReceiptHeaderByIdDto, FilterArMiscReceiptHeaderDto } from '../dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';
import { FndLookUpValuesSelect2RequestDto, SelectdropdownResult } from '../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ArMiscReceiptDetailsDto, ArMiscReceiptHeaderDto, ArMiscReceiptLinesDto, PagedResult } from '../dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ArMiscReceiptHeaderService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ArMiscReceiptHeader.Base}`;

  constructor(private http: HttpClient) { }

  getAll(params: FilterArMiscReceiptHeaderDto): Observable<PagedResult<ArMiscReceiptHeaderDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ArMiscReceiptHeader.GetAll}`;
    return this.http.post<PagedResult<ArMiscReceiptHeaderDto>>(apiUrl, params);
  }

  getDetailById(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptHeaderDto> {
    if (!params.miscReceiptId || !params.entityId) {
      throw new Error('miscReceiptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ArMiscReceiptHeader.GetById(params.miscReceiptId, params.entityId)}`;
    return this.http.get<ArMiscReceiptHeaderDto>(apiUrl);
  }

  getReceiptDetailsListDataById(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptDetailsDto[]> {
    if (!params.miscReceiptId || !params.entityId) {
      throw new Error('miscReceiptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ArMiscReceiptHeader.GetReceiptDetailsById(params.miscReceiptId, params.entityId)}`;
    return this.http.get<ArMiscReceiptDetailsDto[]>(apiUrl);
  }

  getReceiptLinesListDataById(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptLinesDto[]> {
    if (!params.miscReceiptId || !params.entityId) {
      throw new Error('miscReceiptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ArMiscReceiptHeader.GetReceiptLinesById(params.miscReceiptId, params.entityId)}`;
    return this.http.get<ArMiscReceiptLinesDto[]>(apiUrl);
  }
}
