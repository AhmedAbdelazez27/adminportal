import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginDto } from '../dtos/login.dto';
import { environment } from '../../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';
import { ApiEndpoints } from '../constants/api-endpoints';
import { LoginUAEPassDto } from '../dtos/uaepass.dto';
import { ProfileDbService } from './profile-db.service';
export interface UserProfile {
  userId: string;
  userName: string;
  departmentId: string;
  pages: string[];
  permissions: string[];
  updatedAt?: number;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/Login`;
  private readonly UAEPassBASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.User.UAEPassBaseURL}`;

  constructor(private http: HttpClient, private router: Router, private profileDb: ProfileDbService) { }

  login(payload: LoginDto): Observable<any> {
    return this.http.post(this.BASE_URL, payload, {
      withCredentials: true
    });
  }

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }



  // داخل class AuthService { ... }

  // ========== Global in-memory state ==========
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public user$ = this.userSubject.asObservable();
  get snapshot(): UserProfile | null { return this.userSubject.value; }

  // لملء الحالة من IndexedDB عند الإقلاع (هتندهها لاحقًا في APP_INITIALIZER)
  async hydrateFromIndexedDb(): Promise<void> {
    const cached = await this.profileDb.getProfile();
    this.userSubject.next(cached);
  }

  // لتحديث الحالة يدويًا بعد ما تحفظ في IndexedDB
  setProfile(profile: UserProfile | null) {
    this.userSubject.next(profile);
  }

  get isAuthenticated(): boolean {
  return !!this.snapshot?.userId;
}


  // logout(): void {
  //   localStorage.removeItem('access_token');
  //   localStorage.removeItem('permissions');
  //   localStorage.removeItem('pages');
  //   const logoutUrl = 'https://stg-id.uaepass.ae/idshub/logout?redirect_uri=' + encodeURIComponent(window.location.origin + '/login');
  //   console.log("logoutURL", logoutUrl);
  //   window.location.href = logoutUrl;
  // }

  logout(): Observable<any> {
    return this.LogoutNew().pipe(
      tap(async () => {
        this.setProfile(null); 
        await this.profileDb.clearProfile();
      })
    );
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

  getUserId(): string | null {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      return storedUserId;
    }

    const decodedData = this.decodeToken();
    if (decodedData) {
      return this.extractUserIdFromToken(decodedData);
    }

    return null;
  }

  getCurrentUser(): { id: string; name?: string } | null {
    const userId = this.getUserId();
    if (!userId) {
      return null;
    }

    const decodedData = this.decodeToken();
    let name = '';

    if (decodedData) {
      const possibleNameClaims = [
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
        'name',
        'username',
        'user_name',
        'given_name',
        'family_name'
      ];

      for (const claim of possibleNameClaims) {
        if (decodedData[claim]) {
          name = decodedData[claim].toString();
          break;
        }
      }
    }

    return {
      id: userId,
      name: name || 'User'
    };
  }


  private extractUserIdFromToken(decodedData: any): string | null {
    const possibleUserIdClaims = [
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
      'nameidentifier',
      'sub',
      'user_id',
      'userId',
      'id',
      'uid',
      'userid'
    ];

    for (const claim of possibleUserIdClaims) {
      if (decodedData[claim]) {
        return decodedData[claim].toString();
      }
    }

    for (const [key, value] of Object.entries(decodedData)) {
      if (typeof value === 'string' && value.length > 0 && value.length < 50) {
        if (/^[a-zA-Z0-9_-]+$/.test(value)) {
          return value;
        }
      }
    }

    return null;
  }

  UAEPasslogin(params: LoginUAEPassDto): Observable<any> {
    const code = params.code ?? '';
    const state = params.state ?? '';
    const lang = params.lang ?? '';

    const apiUrl = `${this.UAEPassBASE_URL}${ApiEndpoints.User.GetUAEPAssInfo}`;
    return this.http.post<any>(apiUrl, params);
  }

  VerifyTwoFactor(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ApiEndpoints.User.VerifyTwoFactor}`, payload, {
      withCredentials: true
    })
  }

  ResendVerifyTwoFactorOtp(payload: any = {}): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ApiEndpoints.User.ResendVerifyTwoFactorOtp}`, payload, {
      withCredentials: true
    })
  }

  LogoutNew(payload: any = {}): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ApiEndpoints.User.Logout}`, payload, {
      withCredentials: true
    })
  }

  GetMyProfile(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/Authenticate`, {
      withCredentials: true
    });
  }
}
