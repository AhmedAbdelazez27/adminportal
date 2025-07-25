import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
    providedIn: 'root'
})
export class EntityService {
    private readonly BASE_URL = `${environment.apiBaseUrl}`;

    constructor(private http: HttpClient) { }


    getEntities(skip: number, take: number): Observable<any> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('take', take.toString());
        return this.http.get(`${this.BASE_URL}${ApiEndpoints.Entity.Base}`, { params });
    }

    GetSelect2List(skip: number=0, take: number=2000): Observable<any> {
        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Entity.Base}${ApiEndpoints.Entity.GetSelect2List}`, { take,skip });
    }



}