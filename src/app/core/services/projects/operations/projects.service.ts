import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filterprojectsByIdDto, filterprojectsDto, projectImplementDto, projectsDto, recieptProjectsDetailsDto } from '../../../dtos/projects/operations/projects.dto';

@Injectable({
  providedIn: 'root'
})

export class projectsService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ScProject.Base}`;
  private readonly DetailsBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ScProject.GetDetailsByIdBase}`;
  private readonly RecieptProjectsDetailsBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ScProject.GetRecieptProjectsDetailsByIdBase}`;
  constructor(private http: HttpClient) { }



  getAll(params: filterprojectsDto): Observable<PagedResult<projectsDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ScProject.GetAll}`;
    return this.http.post<PagedResult<projectsDto>>(apiUrl, params);
  }

  getDetailById(params: filterprojectsByIdDto): Observable<projectsDto> {
    if (!params.projectId || !params.entityId) {
      throw new Error('projectId and entityId must not be null');
    }
    const apiUrl = `${this.DetailsBASE_URL}${ApiEndpoints.ScProject.GetDetailsById(params.projectId, params.entityId)}`;
    return this.http.get<projectsDto>(apiUrl);
  }

  getRecieptProjectsDetailsId(params: filterprojectsByIdDto): Observable<recieptProjectsDetailsDto[]> {
    if (!params.projectId || !params.entityId) {
      throw new Error('projectId and entityId must not be null');
    }
    const apiUrl = `${this.RecieptProjectsDetailsBASE_URL}${ApiEndpoints.ScProject.GetRecieptProjectsDetailsById(params.projectId, params.entityId)}`;
    return this.http.get<recieptProjectsDetailsDto[]>(apiUrl);
  }

  getProjectImplementDetailById(params: filterprojectsByIdDto): Observable<projectImplementDto[]> {
    if (!params.projectId || !params.entityId) {
      throw new Error('projectId and entityId must not be null');
    }
    const apiUrl = `${ApiEndpoints.ScProject.GetProjectImplement(params.projectId, params.entityId)}`;
    return this.http.get<projectImplementDto[]>(apiUrl);
  }
}
