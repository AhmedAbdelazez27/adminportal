import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { filterGljeListHeaderDto, gljeHeaderDto, getgljeByIDDto, GljeDetailsDto } from '../../../dtos/FinancialDtos/OperationDtos/gl-je.models';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ApiEndpoints } from '../../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class gljeService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.GlJeHeader.Base}`;

  constructor(private http: HttpClient) { }

  getAll(params: filterGljeListHeaderDto): Observable<PagedResult<gljeHeaderDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlJeHeader.GetAll}`;
    return this.http.post<PagedResult<gljeHeaderDto>>(apiUrl, params);
  }

  getDetailById(params: getgljeByIDDto): Observable<gljeHeaderDto> {
    if (!params.receiptId || !params.entityId) {
      throw new Error('receiptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlJeHeader.GetById(params.receiptId, params.entityId)}`;

    return this.http.get<gljeHeaderDto>(apiUrl);
  }

  getLineDatabyId(params: getgljeByIDDto): Observable<GljeDetailsDto[]> {
    if (!params.receiptId || !params.entityId) {
      throw new Error('receiptId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlJeHeader.GetLineDetailsById(params.receiptId, params.entityId)}`;

    return this.http.get<GljeDetailsDto[]>(apiUrl);
  }
}
