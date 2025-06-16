import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDto } from '../dtos/login.dto';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/Login`;

  constructor(private http: HttpClient) {}

  login(payload: LoginDto): Observable<any> {
    return this.http.post(this.BASE_URL, payload);
  }

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
}