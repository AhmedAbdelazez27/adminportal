import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class gljeService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/GlJeHeader/GetAll`;

  constructor(private http: HttpClient) {}

GetGlJeHeader(params: any = {}): Observable<any[]> {
  return this.http.post<any[]>(`${this.BASE_URL}`, params);
}
getEntities(): Observable<any> {
    
  return this.http.get<any>(`${environment.apiBaseUrl}/Entity`);
}
    getJe_Soure(): Observable<any> {
      const request = {
      lookupType: 'JV_SOURCE',
      pageSize: 100 
    };
      return this.http.post<any[]>( `${environment.apiBaseUrl}/Lookup/JvSource`,request);
    }
     getJe_State(): Observable<any> {
      const request = {
      lookupType: 'JE_STATUS',
      pageSize: 100 
    };
      return this.http.post<any[]>( `${environment.apiBaseUrl}/Lookup/JeStatus`,request);
    }
    
     getJe_Curr(): Observable<any> {
      const request = {
      lookupType: 'JE_STATUS',
      pageSize: 100 
    };
      return this.http.post<any[]>( `${environment.apiBaseUrl}/Lookup/Currency`,request);
    }
  GetGlJe_tr(params: any): Observable<any> {      
    return this.http.get<any>(`${environment.apiBaseUrl}/GlJeHeader/GetGLLines/${params.receiptId}/${params.entityId}`);  
}
GetGeneralJournalHeaderDetails(params: any): Observable<any> {
  return this.http.get<any>(`${environment.apiBaseUrl}/GlJeHeader/GetGeneralJournalHeaderDetails/${params.receiptId}/${params.entityId}`);
}

}
