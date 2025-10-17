import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';  // ← Back to using ApiService
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);  // Use ApiService again
  private router = inject(Router);

  private baseUrl = 'http://localhost:5284';  // ← Base URL without /api

  // State
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  // Public computed signals
  readonly currentUser$ = computed(() => this.currentUser());
  readonly isAuthenticated = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');

    if (token && userJson) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(userJson));
    }
  }

  // updated login method
  login(credentials: LoginRequest): Promise<void> {
      return new Promise((resolve, reject) => {
        this.api.post<AuthResponse>('/auth/login', credentials).subscribe({
          next: (response) => {
            this.setAuthData(response);
            resolve();
          },
          error: (err) => {
            console.error('Login error:', err);
            reject(err);
          }
        });
      });
    }

  // updated register method
  register(data: RegisterRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.post<AuthResponse>('/auth/register', data).subscribe({
        next: (response) => {
          this.setAuthData(response);
          resolve();
        },
        error: (err) => {
          console.error('Register error:', err);
          reject(err);
        }
      });
    });
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.token();
  }

  private setAuthData(response: AuthResponse): void {
    this.token.set(response.token);
    this.currentUser.set(response.user);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
  }
}