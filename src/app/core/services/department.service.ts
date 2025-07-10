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

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.Departments.Base}`;

    constructor(private http: HttpClient) { }

  
    getDepartments(skip: number, take: number): Observable<any> {

        return this.http.post(`${this.BASE_URL}${ApiEndpoints.Departments.Select2}`, { take,skip });
    }

}