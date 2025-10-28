import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { filterspContractsDto, spContractsDto, filterspContractsByIdDto, spContractsCasesDto } from '../../../dtos/sponsorship/operations/spContracts.dto';

@Injectable({
  providedIn: 'root'
})

export class spContractsService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.spContracts.Base}`;
  private readonly ContractsBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.spContracts.GetContractByIdBase}`;
  constructor(private http: HttpClient) { }



  getAll(params: filterspContractsDto): Observable<PagedResult<spContractsDto>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.spContracts.GetAll}`;
    return this.http.post<PagedResult<spContractsDto>>(apiUrl, params);

  }

  getDetailById(params: filterspContractsByIdDto): Observable<spContractsDto> {
    if (!params.contractId || !params.entityId) {
      throw new Error('paymentId and entityId must not be null');
    }
    const apiUrl = `${this.ContractsBASE_URL}${ApiEndpoints.spContracts.GetContractById}`;
    return this.http.post<spContractsDto>(apiUrl, params);
  }

  getContractCasesById(params: filterspContractsByIdDto): Observable<spContractsCasesDto[]> {
    if (!params.contractId || !params.entityId) {
      throw new Error('paymentId and entityId must not be null');
    }
    const apiUrl = `${this.ContractsBASE_URL}${ApiEndpoints.spContracts.GetContractCasesById}`;
    return this.http.post<spContractsCasesDto[]>(apiUrl, params);
  }
}
