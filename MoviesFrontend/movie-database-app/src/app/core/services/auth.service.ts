import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // signals = Angulars reactive state (like useState in React)
  // signal() creates a writable signal
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  // computed() automatically recalculates when dependencies change
  readonly currentUser$ = this.currentUser.asReadonly();  // Public read-only version
  readonly isAuthenticated = computed(() => !!this.token());  // true if token exists
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');  // true if user is admin

  // constructor
  constructor(
    private api: ApiService,    // Inject ApiService
    private router: Router      // Inject Router for navigation
  ) {
    // load saved auth data from localStorage when service is created
    this.loadFromStorage();
  }

  // load token and user from localStorage on app startup
  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');

    if (token && userJson) {
      this.token.set(token); // Update signal
      this.currentUser.set(JSON.parse(userJson)); // Update signal
    }
  }

  // login method - returns a Promise
  login(credentials: LoginRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      // call the API
      this.api.post<AuthResponse>('/auth/login', credentials).subscribe({
        next: (response) => {
          this.setAuthData(response);  // save token and user
          resolve();
        },
        error: (err) => {
          console.error('Login error:', err);
          reject(err);
        }
      });
    });
  }

  // register method
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

  // logout method
  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.router.navigate(['/']); // navigate to the home page
  }

  // get token (used by HTTP interceptor later)
  getToken(): string | null {
    return this.token();
  }

  // save auth data after login/register
  private setAuthData(response: AuthResponse): void {
    this.token.set(response.token);
    this.currentUser.set(response.user);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
  }
}