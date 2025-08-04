import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { caseHelpRptInputDto, casesEntitiesRptInputDto, ordersListRptInputDto } from '../../../dtos/socialcases/reports/socialcasesReporstInput.dto';
import { caseHelpRptOutputDto, casesEntitiesRptOutputDto, ordersListRptOutputDto } from '../../../dtos/socialcases/reports/socialcasesReporstOutput.dto';

@Injectable({
  providedIn: 'root'
})
export class SocialCasesReportsService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.SocialCasesReports.Base}`;
  constructor(private http: HttpClient) { }

  getordersListRptData(params: ordersListRptInputDto): Observable<PagedResult<ordersListRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SocialCasesReports.GetOrdersListRptEndPoint}`;
    return this.http.post<PagedResult<ordersListRptOutputDto[]>>(apiUrl, params);
  }

  getcasesEntitiesRptData(params: casesEntitiesRptInputDto): Observable<PagedResult<casesEntitiesRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SocialCasesReports.GetCasesEntitiesRptEndPoint}`;
    return this.http.post<PagedResult<casesEntitiesRptOutputDto[]>>(apiUrl, params);
  }

  getcaseHelpRptData(params: caseHelpRptInputDto): Observable<PagedResult<caseHelpRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SocialCasesReports.GetCaseHelpRptEndPoint}`;
    return this.http.post<PagedResult<caseHelpRptOutputDto[]>>(apiUrl, params);
  }
}
