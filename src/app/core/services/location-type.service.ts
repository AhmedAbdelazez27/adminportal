import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../constants/api-endpoints';
import { Select2Result } from '../dtos/UserSetting/regions/region.dto';

@Injectable({
  providedIn: 'root',
})
export class LocationTypeService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.LocationType.Base}`;

  constructor(private http: HttpClient) {}

  // Get all location types with pagination and filtering
  getAllAsync(parameters: {
    skip: number;
    take: number;
    searchValue?: string;
  }): Observable<any> {
    const request = {
      skip: parameters.skip,
      take: parameters.take,
      searchValue: parameters.searchValue || '',
      lookupType: 'LocationTypeLkp',
    };
    return this.http.post<any>(this.BASE_URL, request);
  }

  // Get location types for Select2 dropdown
  getLocationTypesSelect2(
    skip: number = 0,
    take: number = 100,
    searchValue?: string
  ): Observable<Select2Result> {
    const request = {
      skip,
      take,
      searchValue: searchValue || '',
      lookupType: 'LocationTypeLkp',
    };
    return this.http.post<Select2Result>(this.BASE_URL, request);
  }
}
