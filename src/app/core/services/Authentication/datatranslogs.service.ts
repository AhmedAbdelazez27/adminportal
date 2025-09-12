import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../constants/api-endpoints';
import {
  GetDataTransLogsDto,
  GetDataTransLogsParameters,
  GetDataTransLogsResponse,
  PagedResultDto,
} from '../../dtos/Authentication/DataTransLogs/datatranslogs.dto';

@Injectable({
  providedIn: 'root',
})
export class DataTransLogsService {
  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.DataTransLogs.Base}`;

  constructor(private http: HttpClient) {}

  // Get all data trans logs with pagination and filtering
  getAllDataTransLogs(
    parameters: GetDataTransLogsParameters
  ): Observable<GetDataTransLogsResponse> {
    return this.http.post<GetDataTransLogsResponse>(
      `${this.BASE_URL}${ApiEndpoints.DataTransLogs.GetAll}`,
      parameters
    );
  }
}
