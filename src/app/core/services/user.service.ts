import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto, UpdateUserDto } from '../dtos/create-user.dto';
import { ApiEndpoints } from '../constants/api-endpoints';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly BASE_URL = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

  createUser(payload: CreateUserDto): Observable<any> {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.User.Base}`, payload);
  }

  getUsers(skip: number, take: number): Observable<any> {
    const params = new HttpParams().set('skip', skip).set('take', take);
    return this.http.get<any>(`${this.BASE_URL}${ApiEndpoints.User.Base}`, { params });
  }

  updateUser(payload: UpdateUserDto): Observable<any> {
    return this.http.put(`${this.BASE_URL}${ApiEndpoints.User.Base}`, payload);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${ApiEndpoints.User.GetById(id)}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${ApiEndpoints.User.Delete(id)}`);
  }

  getUsersForSelect2(payload: {
    searchValue: string | null,
    skip: number,
    take: number,
    orderByValue: string | null
  }): Observable<any> {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.User.GetUsersSelect2List}`, payload);
  }

}
