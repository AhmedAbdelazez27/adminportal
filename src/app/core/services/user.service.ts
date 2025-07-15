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

  getUsers(skip: number, take: number, searchValue: string): Observable<any> {
    // const params = new HttpParams().set('skip', skip).set('take', take).set('searchValue', searchValue);
    return this.http.post<any>(`${this.BASE_URL}${ApiEndpoints.User.Base}${ApiEndpoints.User.GetAll}`, { searchValue, take, skip });
  }

  updateUser(payload: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.User.Base}/Update`, payload);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${ApiEndpoints.User.GetById(id)}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.User.Delete(id)}`,{});
  }

  getUsersForSelect2(payload: {
    searchValue: string | null,
    skip: number,
    take: number,
    orderByValue: string | null
  }): Observable<any> {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.User.GetUsersSelect2List}`, payload);
  }

  assignDepartments(payload: { userId: string; departmentIds: number[] }) {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.UsersDepartments.Base}${ApiEndpoints.UsersDepartments.Assign}`, payload);
  }

  assignEntities(payload: { userId: string; entityIds: number[] }) {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.UsersEntities.Base}${ApiEndpoints.UsersEntities.AssignUserEntities}`, payload);
  }
  AssignRoleEntities(payload: { roleId: string; entityIds: number[] }) {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.UsersEntities.Base}${ApiEndpoints.UsersEntities.AssignRoleEntities}`, payload);
  }

  getUserDepartments(payload: { userId: string }) {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.UsersDepartments.Base}`, payload);
  }

   getUserIntities(payload: { userId?: any,roleId?: any }) {
    return this.http.post(`${this.BASE_URL}${ApiEndpoints.UsersEntities.Base}${ApiEndpoints.UsersEntities.GetUsersEntitiesSelect2List}`, payload);
  }


}
