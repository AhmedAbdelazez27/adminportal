import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { beneficentsRptInputDto, caseSearchRptInputDto, benifcientTotalRptInputDto, caseAidEntitiesRptInputDto, caseSearchListRptInputDto } from '../../../dtos/sponsorship/reports/sponsorshipInput.dto';
import { beneficentsRptOutputDto, caseSearchRptOutputDto, benifcientTotalRptOutputDto, caseAidEntitiesRptOutputDto, caseSearchListRptOutputDto } from '../../../dtos/sponsorship/reports/sponsorshipOutput.dto';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Injectable({
  providedIn: 'root'
})
export class SponsorshipReportservice {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.SponsorshipReports.Base}`;

  constructor(private http: HttpClient) { }

  getbeneficentsRptData(params: beneficentsRptInputDto): Observable<PagedResult<beneficentsRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SponsorshipReports.GetBeneficentsRptEndPoint}`;
    return this.http.post<PagedResult<beneficentsRptOutputDto[]>>(apiUrl, params);
  }

  getcaseSearchRptData(params: caseSearchRptInputDto): Observable<PagedResult<caseSearchRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SponsorshipReports.GetCaseSearchRptEndPoint}`;
    return this.http.post<PagedResult<caseSearchRptOutputDto[]>>(apiUrl, params);
  }

  getbenifcientTotalRptData(params: benifcientTotalRptInputDto): Observable<PagedResult<benifcientTotalRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SponsorshipReports.GetBenifcientTotalRptEndPoint}`;
    return this.http.post<PagedResult<benifcientTotalRptOutputDto[]>>(apiUrl, params);
  }

  getcaseAidEntitiesRptData(params: caseAidEntitiesRptInputDto): Observable<PagedResult<caseAidEntitiesRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SponsorshipReports.GetCaseAidEntitiesRptEndPoint}`;
    return this.http.post<PagedResult<caseAidEntitiesRptOutputDto[]>>(apiUrl, params);
  }

  getcaseSearchListRptData(params: caseSearchListRptInputDto): Observable<PagedResult<caseSearchListRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.SponsorshipReports.GetCaseSearchListRptEndPoint}`;
    return this.http.post<PagedResult<caseSearchListRptOutputDto[]>>(apiUrl, params);
  }
}
