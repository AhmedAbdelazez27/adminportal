import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) {}

  GetApInvoice(params: any = {}): Observable<any[]> {
  return this.http.post<any[]>( `${environment.apiBaseUrl}/VwApInvoiceHd/GetAll`, params );
  }

  GetApInvoice_tr(params: any): Observable<any[]> {
  return this.http.post<any[]>( `${environment.apiBaseUrl}/VwApInvoiceHd/GetInvoiceTr`, params );
}

GetInvoiceheaderDetails(params: any): Observable<any> {
  return this.http.post<any>(`${environment.apiBaseUrl}/VwApInvoiceHd/GetInvoiceheaderDetails`, params);
}

getVendors(request: any): Observable<any> {
  return this.http.post<any[]>( `${environment.apiBaseUrl}/ApVendor/GetVendorSelect2List`, request);
}
getEntities(): Observable<any> {
  return this.http.get<any>(`${environment.apiBaseUrl}/Entity`);
}

getInvoiceTypes(request: any): Observable<any> {
    return this.http.post<any[]>( `${environment.apiBaseUrl}/VwApInvoiceHd/GetInvoiceTypeSelect2List`, request );

}
}

