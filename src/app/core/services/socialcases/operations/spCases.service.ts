import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { 
  GetGridDataParametersDto, 
  SpCasesDto, 
  CasesSearchDto, 
  GetParamtersDto,
  SpCasesAidRequestsFilterDto,
  GetAidRequestGridDataParametersDto,
  CAidRequestDto
} from '../../../dtos/socialcases/operations/spCases.dto';
import { aidRequestsDto } from '../../../dtos/socialcases/operations/aidRequests.dto';

@Injectable({
  providedIn: 'root'
})
export class SpCasesService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.SpCases.Base}`;
  private readonly AID_REQUESTS_URL = `${environment.apiBaseUrl}${ApiEndpoints.AidRequest.Base}`;
  
  constructor(private http: HttpClient) { }

  getAllGridData(params: GetGridDataParametersDto): Observable<PagedResult<SpCasesDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SpCases.GetAllGridData}`;
    return this.http.post<PagedResult<SpCasesDto>>(apiUrl, params);
  }

  getCaseDetails(caseId: string, entityId: string): Observable<CasesSearchDto> {
    if (!caseId || !entityId) {
      throw new Error('caseId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SpCases.GetCaseDetails(caseId, entityId)}`;
    return this.http.get<CasesSearchDto>(apiUrl);
  }

  getAidRequestsForCase(params: SpCasesAidRequestsFilterDto): Observable<PagedResult<aidRequestsDto>> {
    const apiUrl = `${this.AID_REQUESTS_URL}${ApiEndpoints.AidRequest.GetAll}`;
    return this.http.post<PagedResult<aidRequestsDto>>(apiUrl, params);
  }

  // New method for AidRequest API
  getAllAidRequestGridData(params: GetAidRequestGridDataParametersDto): Observable<PagedResult<CAidRequestDto>> {
    const apiUrl = `${this.AID_REQUESTS_URL}/GetAllGridData`;
    return this.http.post<PagedResult<CAidRequestDto>>(apiUrl, params);
  }
}



