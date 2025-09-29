import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { FilterArMiscReceiptHeaderDto, ArMiscReceiptHeaderDto, FilterArMiscReceiptHeaderByIdDto, ArMiscReceiptDetailsDto, ArMiscReceiptLinesDto } from '../../../dtos/FinancialDtos/OperationDtos/ArMiscReceiptHeader.dto';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

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
    if (!params.miscReciptId || !params.entityId) {
      throw new Error('miscReciptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ArMiscReceiptHeader.GetById}`;
    return this.http.post<ArMiscReceiptHeaderDto>(apiUrl, params);
  }

  getReceiptDetailsListDataById(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptDetailsDto[]> {
    if (!params.miscReciptId || !params.entityId) {
      throw new Error('miscReciptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ArMiscReceiptHeader.GetReceiptDetailsById}`;
    return this.http.post<ArMiscReceiptDetailsDto[]>(apiUrl, params);
  }

  getReceiptLinesListDataById(params: FilterArMiscReceiptHeaderByIdDto): Observable<ArMiscReceiptLinesDto[]> {
    if (!params.miscReciptId || !params.entityId) {
      throw new Error('miscReciptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ArMiscReceiptHeader.GetReceiptLinesById}`;
    return this.http.post<ArMiscReceiptLinesDto[]>(apiUrl, params);
  }
}
