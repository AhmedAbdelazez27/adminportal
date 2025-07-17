import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})


export class vendorService {

  constructor(private http: HttpClient) {}
  private readonly BASE_URL = `${environment.apiBaseUrl}/ApVendor/GetAll`;

Getvendor(params: any = {}): Observable<any[]> {
  return this.http.post<any[]>(`${this.BASE_URL}`, params);
}
 

getVendor_ID(params: { entityId: string,skip: number,take: number }): Observable<any[]> {      

        return this.http.post<any[]>( `${environment.apiBaseUrl}/ApVendor/GetVendorSelect2List`,params);
  
}
GetVendorDataforscreen(params: any): Observable<any[]> {

  const url = `${environment.apiBaseUrl}/ApVendor/Get/${params.VendorId}/${params.entityId}`;
  return this.http.get<any[]>(url);
  
}

getEntities(): Observable<any> {
  return this.http.get<any>(`${environment.apiBaseUrl}/Entity`);
}

getApVendorStatus(): Observable<any> {
      const request = {
      lookupType: 'Vendor_STATUS',
      pageSize: 100 
    };
      return this.http.post<any[]>( `${environment.apiBaseUrl}/Lookup/ApVendorStatus`,request);
}       

}
