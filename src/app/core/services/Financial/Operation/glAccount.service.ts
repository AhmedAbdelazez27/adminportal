import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { FilterGlAccountDto, GlAccountDto, FilterGlAccountByCodeDto, CreateGlAccountDto } from '../../../dtos/FinancialDtos/OperationDtos/glAccount.dto';

@Injectable({
  providedIn: 'root'
})
export class GlAccountService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.GlAccount.Base}`;

  constructor(private http: HttpClient) { }

  getAll(params: FilterGlAccountDto): Observable<PagedResult<GlAccountDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccount.GetAll}`;
    return this.http.post<PagedResult<GlAccountDto>>(apiUrl, params);
  }

  getDetailById(params: FilterGlAccountByCodeDto): Observable<GlAccountDto> {
    if (!params.accountCode) {
      throw new Error('accountCode must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccount.GetById(params.accountCode)}`;

    return this.http.get<GlAccountDto>(apiUrl);
  }

  getWithDetailsById(params: FilterGlAccountByCodeDto): Observable<GlAccountDto> {
    if (!params.accountCode) {
      throw new Error('accountCode must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccount.GetWithDetailsById(params.accountCode)}`;

    return this.http.get<GlAccountDto>(apiUrl);
  }

  create(params: CreateGlAccountDto): Observable<GlAccountDto> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccount.Create}`;
    return this.http.post<GlAccountDto>(apiUrl, params);
  }

  update(params: CreateGlAccountDto): Observable<GlAccountDto> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccount.Update}`;
    return this.http.post<GlAccountDto>(apiUrl, params);
  }

geGlAccountsTree(params: FilterGlAccountDto): Observable<any[]> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.GlAccount.GetAll}`;
    return this.http.post<any[]>(apiUrl, params);
  }
}
