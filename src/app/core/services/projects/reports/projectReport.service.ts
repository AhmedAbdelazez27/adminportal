import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { projectListRptInputDto } from '../../../dtos/projects/reports/projectReportInput.dto';
import { projectListRptOutputDto } from '../../../dtos/projects/reports/projectReportOutput.dto';

@Injectable({
  providedIn: 'root'
})
export class ProjectReportservice {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ProjectReports.Base}`;

  constructor(private http: HttpClient) { }

  getprojectListRptData(params: projectListRptInputDto): Observable<PagedResult<projectListRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ProjectReports.GetProjectListRptEndPoint}`;
    return this.http.post<PagedResult<projectListRptOutputDto[]>>(apiUrl, params);
  }
}
