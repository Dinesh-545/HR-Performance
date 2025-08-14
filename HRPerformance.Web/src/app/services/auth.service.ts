import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5055/api';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadStoredUser();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/Auth/login`, request)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.loadStoredUser();
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/Auth/register`, request)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.loadStoredUser();
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  private storeAuthData(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }

  private loadStoredUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      }
    }
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/Auth/profile`);
  }
} 