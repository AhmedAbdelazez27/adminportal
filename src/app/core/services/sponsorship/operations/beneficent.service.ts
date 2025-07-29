import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filterBeneficentDto, beneficentDto, filterBeneficentByIdDto } from '../../../dtos/sponsorship/operations/beneficent.dto';

@Injectable({
  providedIn: 'root'
})

export class beneficentService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.beneficent.Base}`;
  constructor(private http: HttpClient) { }



  getAll(params: filterBeneficentDto): Observable<PagedResult<beneficentDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.beneficent.GetAll}`;
    return this.http.post<PagedResult<beneficentDto>>(apiUrl, params);

  }

  getDetailById(params: filterBeneficentByIdDto): Observable<beneficentDto> {
    if (!params.beneficenT_ID || !params.entityId) {
      throw new Error('paymentId and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.beneficent.GetById(params.beneficenT_ID, params.entityId)}`;
    return this.http.get<beneficentDto>(apiUrl);
  }
}
