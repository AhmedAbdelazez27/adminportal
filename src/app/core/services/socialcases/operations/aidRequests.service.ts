import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filteraidRequestsDto, aidRequestsDto, filteraidRequestsByIdDto, aidRequestsShowDetailsDto, aidRequestsStudyDetailsDto } from '../../../dtos/socialcases/operations/aidRequests.dto';

@Injectable({
  providedIn: 'root'
})

export class aidRequestsService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.Base}`;
  private readonly AidRequestsStudiesBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.AidRequestsStudiesBase}`;
  private readonly AidRequestsZakatBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.AidRequestsZakatBase}`;
  private readonly QuotationHeaderBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.QuotationHeaderBase}`;
  constructor(private http: HttpClient) { }



  getAll(params: filteraidRequestsDto): Observable<PagedResult<aidRequestsDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.AidRequest.GetAll}`;
    return this.http.post<PagedResult<aidRequestsDto>>(apiUrl, params);

  }

  getShowDetailById(params: filteraidRequestsByIdDto): Observable<aidRequestsShowDetailsDto> {
    if (!params.caseCode || !params.entityId) {
      throw new Error('caseCode and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.AidRequest.GetShowDetailById(params.caseCode, params.entityId)}`;
    return this.http.get<aidRequestsShowDetailsDto>(apiUrl);
  }

  getAidRequestsStudyById(params: filteraidRequestsByIdDto): Observable<aidRequestsStudyDetailsDto> {
    if (!params.headerId || !params.entityId) {
      throw new Error('headerId and entityId must not be null');
    }
    const apiUrl = `${this.AidRequestsStudiesBASE_URL}${ApiEndpoints.AidRequest.GetAidRequestsStudyDetailById(params.headerId, params.entityId)}`;
    return this.http.get<aidRequestsStudyDetailsDto>(apiUrl);
  }

  getZakatStudyDetailById(params: filteraidRequestsByIdDto): Observable<aidRequestsStudyDetailsDto> {
    if (!params.headerId || !params.entityId) {
      throw new Error('caseCode and entityId must not be null');
    }
    const apiUrl = `${this.AidRequestsZakatBASE_URL}${ApiEndpoints.AidRequest.GetZakatStudyDetailById(params.headerId, params.entityId)}`;
    return this.http.get<aidRequestsStudyDetailsDto>(apiUrl);
  }

  getQuotationHeaderDetailById(params: filteraidRequestsByIdDto): Observable<aidRequestsStudyDetailsDto> {
    if (!params.headerId || !params.entityId) {
      throw new Error('caseCode and entityId must not be null');
    }
    const apiUrl = `${this.QuotationHeaderBASE_URL}${ApiEndpoints.AidRequest.GetQuotationHeaderDetailById(params.headerId, params.entityId)}`;
    return this.http.get<aidRequestsStudyDetailsDto>(apiUrl);
  }
}
