import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { PagedResult } from '../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ArMiscReceiptDetailsDto, ArMiscReceiptLinesDto } from '../../dtos/FinancialDtos/OperationDtos/ArMiscReceiptHeader.dto';
import { FiltermainApplyServiceDto, mainApplyServiceDto, FiltermainApplyServiceByIdDto, AppUserDto, WorkFlowCommentDto, UpdateStatusDto } from '../../dtos/mainApplyService/mainApplyService.dto';

@Injectable({
  providedIn: 'root'
})
export class MainApplyService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.MainApplyService.Base}`;
  private readonly UserBASE_URL = `${environment.apiBaseUrl}`;
  private readonly SaveCommentBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.MainApplyService.saveCommentBase}`;

  constructor(private http: HttpClient) { }

  getAll(params: FiltermainApplyServiceDto): Observable<PagedResult<mainApplyServiceDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.MainApplyService.GetAll}`;
    return this.http.post<PagedResult<mainApplyServiceDto>>(apiUrl, params);
  }

  getDetailById(params: FiltermainApplyServiceByIdDto): Observable<mainApplyServiceDto> {
    if (!params.id) {
      throw new Error('id must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.MainApplyService.GetById(params.id)}`;
    return this.http.get<mainApplyServiceDto>(apiUrl);
  }

  getuserDetailById(params: FiltermainApplyServiceByIdDto): Observable<AppUserDto> {
    if (!params.id) {
      throw new Error('id must not be null');
    }
    const apiUrl = `${this.UserBASE_URL}${ApiEndpoints.MainApplyService.GetUserById(params.id)}`;
    return this.http.get<AppUserDto>(apiUrl);
  }

  update(params: UpdateStatusDto): Observable<PagedResult<mainApplyServiceDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.MainApplyService.Update}`;
    return this.http.post<PagedResult<mainApplyServiceDto>>(apiUrl, params);
  }

  saveComment(params: WorkFlowCommentDto): Observable<PagedResult<WorkFlowCommentDto>> {
    const apiUrl = `${this.SaveCommentBASE_URL}${ApiEndpoints.MainApplyService.saveComment}`;
    return this.http.post<PagedResult<WorkFlowCommentDto>>(apiUrl, params);
  }
}
