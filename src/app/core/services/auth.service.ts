import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDto } from '../dtos/login.dto';
import { environment } from '../../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';
import { ApiEndpoints } from '../constants/api-endpoints';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/Login`;

  constructor(private http: HttpClient, private router: Router) { }

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
    localStorage.removeItem('permissions');
    localStorage.removeItem('pages');
    this.router.navigate(['/login']);

  }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return token ? true : false;
  }
  decodeToken(): any {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  sendOtpToEmail(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ApiEndpoints.User.Base}${ApiEndpoints.User.ForgotPassword}`, payload);
  }

  verifyOtp(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ApiEndpoints.User.verifyOtp}`, payload);
  }

    otpSendViaEmail(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ApiEndpoints.User.OtpSendViaEmail}`, payload);
  }

    resetPassword(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ApiEndpoints.User.Base}${ApiEndpoints.User.ResetPassword}`, payload);
  }

}