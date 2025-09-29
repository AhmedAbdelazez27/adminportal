import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FndLookUpValuesSelect2RequestDto, SelectdropdownResult, PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filterVendorHeaderDto, vendorHeaderData, filtervendorHeaderByIDDto, loadVendorNameDto, vendorHeaderDto } from '../../../dtos/FinancialDtos/OperationDtos/vendor.models';
import { ApiEndpoints } from '../../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})


export class vendorService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.ApVendor.Base}`;
  constructor(private http: HttpClient) { }

  getAll(params: filterVendorHeaderDto): Observable<PagedResult<vendorHeaderData>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApVendor.GetAll}`;
    return this.http.post<PagedResult<vendorHeaderData>>(apiUrl, params);
  }

  getDetailById(params: filtervendorHeaderByIDDto): Observable<vendorHeaderDto[]> {
    if (!params.vendorId || !params.entityId) {
      throw new Error('vendorId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.ApVendor.GetById}`;
    return this.http.post<vendorHeaderDto[]>(apiUrl, params);
  }
}







