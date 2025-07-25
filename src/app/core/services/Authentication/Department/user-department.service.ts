import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import {
  UserDepartmentDto,
  UserDepartmentParameter,
  PagedResultDto,
} from '../../../dtos/Authentication/Department/user-department.dto';

@Injectable({
  providedIn: 'root',
})
export class UserDepartmentService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.UsersDepartments.Base}`;

  constructor(private http: HttpClient) {}

  // Get all user departments with filtering and pagination
  getAllUserDepartments(
    parameters: UserDepartmentParameter
  ): Observable<PagedResultDto<UserDepartmentDto>> {
    return this.http.post<PagedResultDto<UserDepartmentDto>>(
      this.BASE_URL,
      parameters
    );
  }

  // Get users by department ID
  getUsersByDepartment(
    departmentId: number
  ): Observable<PagedResultDto<UserDepartmentDto>> {
    const parameters: UserDepartmentParameter = {
      departmentId: departmentId,
      userId: null,
      searchTerm: null,
      searchValue: null,
      skip: 0,
      take: 100,
      orderByValue: null,
    };

    return this.getAllUserDepartments(parameters);
  }
}
