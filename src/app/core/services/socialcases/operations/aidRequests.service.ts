import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import {
  filteraidRequestsDto,
  aidRequestsDto,
  filteraidRequestsByIdDto,
  aidRequestsShowDetailsDto,
  aidRequestsStudyDetailsDto,
  aidRequestsZakatDto,
} from '../../../dtos/socialcases/operations/aidRequests.dto';

@Injectable({
  providedIn: 'root',
})
export class aidRequestsService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.Base}`;
  private readonly AidRequestsStudiesBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.AidRequestsStudiesBase}`;
  private readonly AidRequestsZakatBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.AidRequestsZakatBase}`;
  private readonly QuotationHeaderBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.QuotationHeaderBase}`;
  constructor(private http: HttpClient) {}

  getAll(
    params: filteraidRequestsDto
  ): Observable<PagedResult<aidRequestsDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.AidRequest.GetAll}`;
    return this.http.post<PagedResult<aidRequestsDto>>(apiUrl, params);
  }

  getShowDetailById(
    params: filteraidRequestsByIdDto
  ): Observable<aidRequestsShowDetailsDto> {
    if (!params.entityId || !params.caseId) {
      throw new Error('caseId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.AidRequest.GetShowDetailById}`;
    return this.http.post<aidRequestsShowDetailsDto>(apiUrl, params);
  }

  getAidRequestsStudyById(
    params: filteraidRequestsByIdDto
  ): Observable<aidRequestsStudyDetailsDto> {
    if (!params.studyId || !params.entityId) {
      throw new Error('studyId and entityId must not be null');
    }
    const apiUrl = `${this.AidRequestsStudiesBASE_URL}${ApiEndpoints.AidRequest.GetAidRequestsStudyDetailById}`;
    return this.http.post<aidRequestsStudyDetailsDto>(apiUrl, params);
  }

  getZakatStudyDetailById(
    params: filteraidRequestsByIdDto
  ): Observable<aidRequestsZakatDto> {
    if (!params.headerId || !params.entityId) {
      throw new Error('headerId and entityId must not be null');
    }
    const apiUrl = `${this.AidRequestsZakatBASE_URL}${ApiEndpoints.AidRequest.GetZakatStudyDetailById}`;
    return this.http.post<aidRequestsZakatDto>(apiUrl, params);
  }

  getQuotationHeaderDetailById(
    params: filteraidRequestsByIdDto
  ): Observable<aidRequestsStudyDetailsDto> {
    if (!params.headerId || !params.entityId) {
      throw new Error('headerId and entityId must not be null');
    }
    const apiUrl = `${this.QuotationHeaderBASE_URL}${ApiEndpoints.AidRequest.GetQuotationHeaderDetailById}`;
    return this.http.post<aidRequestsStudyDetailsDto>(apiUrl, params);
  }
}
