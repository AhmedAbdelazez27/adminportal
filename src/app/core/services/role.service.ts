import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UnassignRoleDto } from '../dtos/unassign-role.dto';
import { RoleSelect2RequestDto } from '../dtos/role-select2.dto';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { PagedDto } from '../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.Roles.Base}`;

    constructor(private http: HttpClient) { }

    createRole(payload: CreateRoleDto): Observable<any> {
        return this.http.post(this.BASE_URL, payload);
    }

    getRoles(skip: number, take: number, searchValue: string): Observable<any> {
        const params = new HttpParams()
            .set('skip', skip)
            .set('take', take)
            .set('searchValue', searchValue);

        return this.http.get(`${this.BASE_URL}`, { params });
  }

    getAllRoles(param: PagedDto): Observable<any> {
    const params = new HttpParams()
      .set('skip', param.skip)
      .set('take', param.take)
      .set('searchValue', param.searchValue);
    const apiUrl = this.http.get(`${this.BASE_URL}`, { params });
    return apiUrl;
  }

    updateRole(payload: any): Observable<any> {
        return this.http.post(`${this.BASE_URL}/Update`, { id: payload?.id, name: payload?.name, aspNetUsersRoleCount: 1 });
    }

    unassignRole(payload: UnassignRoleDto): Observable<any> {
        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Roles.Unassign}`, payload);
    }

    getRoleUsers(roleId: string): Observable<any> {
        return this.http.get(`${this.BASE_URL}${ApiEndpoints.Roles.GetRoleUsers(roleId)}`);
    }

    getRoleById(roleId: string): Observable<any> {
        return this.http.get(`${this.BASE_URL}${ApiEndpoints.Roles.GetById(roleId)}`);
    }

    deleteRole(roleId: string): Observable<any> {
        const url = `${this.BASE_URL}${ApiEndpoints.Roles.Delete(roleId)}`;
        return this.http.post(url, {});
    }

    getRolesSelect2List(payload: RoleSelect2RequestDto): Observable<any> {
        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Roles.GetRolesSelect2List}`, payload);
    }

    assignRole(payload: AssignRoleDto): Observable<any> {
        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Roles.Assign}`, payload);
    }
    unAssignRole(payload: AssignRoleDto): Observable<any> {
        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Roles.unAssign}`, payload);
    }

    getScreensList(payload: any): Observable<any> {

        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Roles.GetScreensList}`, payload);
    }

    assignScreens(payload: {
        roleId: string;
        claimType: string;
        claimValues: string[];
    }) {
        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Roles.AssignScreenPermission}`, payload);
    }

    getUsersRoleById(roleId: string): Observable<any> {
        return this.http.get(`${this.BASE_URL}${ApiEndpoints.Roles.GetUserOfRole(roleId)}`);
    }
}
