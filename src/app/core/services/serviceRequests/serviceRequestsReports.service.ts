import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { PagedResult } from '../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { requestDetailsEntitiesRPTInputDto, totalRequestsEntitiesRPTInputDto } from '../../dtos/serviceRequests/serviceRequestsReportsInput.dto';
import { requestDetailsEntitiesRPTOutputDto, totalRequestsEntitiesRPTOutputDto } from '../../dtos/serviceRequests/serviceRequestsReportsOutput.dto';
@Injectable({
  providedIn: 'root'
})
export class ServiceRequestsReportsService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ServiceRequestsReports.Base}`;
  constructor(private http: HttpClient) { }

  getserviceRequestsDetailsRptData(params: requestDetailsEntitiesRPTInputDto): Observable<PagedResult<requestDetailsEntitiesRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ServiceRequestsReports.GetServiceRequestsDetailsRptEndPoint}`;
    return this.http.post<PagedResult<requestDetailsEntitiesRPTOutputDto[]>>(apiUrl, params);
  }

  gettotalServiceRequestsRptData(params: totalRequestsEntitiesRPTInputDto): Observable<PagedResult<totalRequestsEntitiesRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ServiceRequestsReports.GetTotalServiceRequestsRptEndPoint}`;
    return this.http.post<PagedResult<totalRequestsEntitiesRPTOutputDto[]>>(apiUrl, params);
  }
}
