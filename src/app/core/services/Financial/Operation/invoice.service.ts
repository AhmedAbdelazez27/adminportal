import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { PagedResult } from '../../../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { FilterInvoiceByIdDto, Invoice, InvoiceFilter, InvoiceHeader, InvoiceTransaction } from '../../../dtos/FinancialDtos/OperationDtos/invoice.models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.InvoiceHd.Base}`;

  constructor(private http: HttpClient) {}

  getAll(params: InvoiceFilter): Observable<PagedResult<Invoice>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.InvoiceHd.GetAll}`;
    return this.http.post<PagedResult<Invoice>>(apiUrl, params);
  }

  getDetailById(params: FilterInvoiceByIdDto): Observable<InvoiceHeader> {
    if (!params.tr_Id || !params.entityId) {
      throw new Error('tr_Id and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.InvoiceHd.GetById}`;
    return this.http.post<InvoiceHeader>(apiUrl,params);
  }

  getTrDetailById(params: FilterInvoiceByIdDto): Observable<InvoiceTransaction[]> {
    if (!params.tr_Id || !params.entityId) {
      throw new Error('tr_Id and entityId must not be null');
    }
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.InvoiceHd.GetTrDetailsById}`;
    return this.http.post<InvoiceTransaction[]>(apiUrl, params);
  }
}

