import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filtercaseSearchDto, caseSearchDto, filtercaseSearchByIdDto, caseSearchPaymentHdrDto, getCasesHistoryDto, getSpContractCasesDto, getSpContractDto } from '../../../dtos/sponsorship/operations/caseSearch.dto';

@Injectable({
  providedIn: 'root'
})

export class caseSearchService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.caseSearch.Base}`;
  private readonly CaseHistoryBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.caseSearch.GetCaseHistoryDetailBase}`;
  private readonly CasePaymentBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.caseSearch.GetCasePaymentHdrDetailBase}`;
  private readonly ContractBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.caseSearch.GetContractDetailBase}`;
  constructor(private http: HttpClient) { }



  getAll(params: filtercaseSearchDto): Observable<PagedResult<caseSearchDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.caseSearch.GetAll}`;
    return this.http.post<PagedResult<caseSearchDto>>(apiUrl, params);

  }

  getDetailById(params: filtercaseSearchByIdDto): Observable<caseSearchDto> {
    if (!params.caseId || !params.entityId) {
      throw new Error('caseId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.caseSearch.GetById(params.caseId, params.entityId)}`;
    return this.http.get<caseSearchDto>(apiUrl);
  }

  getCasePaymentHdrDetailsById(params: filtercaseSearchByIdDto): Observable<caseSearchPaymentHdrDto[]> {
    if (!params.caseId || !params.entityId) {
      throw new Error('caseId and entityId must not be null');
    }
    const apiUrl = `${this.CasePaymentBASE_URL}${ApiEndpoints.caseSearch.GetCasePaymentHdrDetailsById(params.caseId, params.entityId)}`;
    return this.http.get<caseSearchPaymentHdrDto[]>(apiUrl);
  }

  getCaseHistoryDetailsById(params: filtercaseSearchByIdDto): Observable<getCasesHistoryDto[]> {
    if (!params.caseId || !params.entityId) {
      throw new Error('caseId and entityId must not be null');
    }
    const apiUrl = `${this.CaseHistoryBASE_URL}${ApiEndpoints.caseSearch.GetCaseHistoryDetailsById(params.caseId, params.entityId)}`;
    return this.http.get<getCasesHistoryDto[]>(apiUrl);
  }

  getContractDetailsById(params: filtercaseSearchByIdDto): Observable<getSpContractDto> {
    if (!params.contractId || !params.entityId) {
      throw new Error('contractId and entityId must not be null');
    }
    const apiUrl = `${this.ContractBASE_URL}${ApiEndpoints.caseSearch.GetContractDetailById(params.contractId, params.entityId)}`;
    return this.http.get<getSpContractDto>(apiUrl);
  }

  getContractCaseDetailsById(params: filtercaseSearchByIdDto): Observable<getSpContractCasesDto[]> {
    if (!params.contractId || !params.entityId) {
      throw new Error('contractId and entityId must not be null');
    }
    const apiUrl = `${this.ContractBASE_URL}${ApiEndpoints.caseSearch.GetContractCasesDetailById(params.contractId, params.entityId)}`;
    return this.http.get<getSpContractCasesDto[]>(apiUrl);
  }
}
