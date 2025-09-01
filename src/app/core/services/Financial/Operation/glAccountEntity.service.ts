import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { FilterGlAccountEntityDto, GlAccountEntityDto, FilterGlAccountEntityByCodeDto, CreateGlAccountEntityDto, FilterGlAccountEntityByEntityIdDto } from '../../../dtos/FinancialDtos/OperationDtos/glAccountEntity.dto';

@Injectable({
  providedIn: 'root'
})
export class GlAccountEntityService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.GlAccountEntity.Base}`;

  constructor(private http: HttpClient) { }

  getAll(params: FilterGlAccountEntityDto): Observable<PagedResult<GlAccountEntityDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccountEntity.GetAll}`;
    return this.http.post<PagedResult<GlAccountEntityDto>>(apiUrl, params);
  }

  getDetailById(params: FilterGlAccountEntityByCodeDto): Observable<GlAccountEntityDto> {
    if (!params.id) {
      throw new Error('id must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccountEntity.GetById(params.id)}`;

    return this.http.get<GlAccountEntityDto>(apiUrl);
  }

  getWithDetailsById(params: FilterGlAccountEntityByCodeDto): Observable<GlAccountEntityDto> {
    if (!params.id) {
      throw new Error('id must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccountEntity.GetWithDetailsById(params.id)}`;

    return this.http.get<GlAccountEntityDto>(apiUrl);
  }

  create(params: CreateGlAccountEntityDto[]): Observable<any> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccountEntity.Create}`;
    return this.http.post<any>(apiUrl, params);
  }

  update(params: CreateGlAccountEntityDto): Observable<GlAccountEntityDto> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccountEntity.Update}`;
    return this.http.post<GlAccountEntityDto>(apiUrl, params);
  }

 
 
 geGlAccountEntitysTree(params: FilterGlAccountEntityDto): Observable<any[]> {
   const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccountEntity.GetAll}`;
   return this.http.post<any[]>(apiUrl, params);

 }
}
