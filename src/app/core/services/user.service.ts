import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto, UpdateUserDto } from '../dtos/create-user.dto';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly BASE_URL = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

  createUser(payload: CreateUserDto): Observable<any> {
    return this.http.post(`${this.BASE_URL}/User`, payload);
  }

  getUsers(skip: number, take: number): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('take', take);

    return this.http.get<any>(`${this.BASE_URL}/User`, { params });
  }

  updateUser(payload: UpdateUserDto): Observable<any> {
    return this.http.put(`${this.BASE_URL}/User`, payload);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/User/${id}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/User/${id}`);
  }
}
