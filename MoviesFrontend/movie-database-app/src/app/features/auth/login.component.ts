import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        <!-- Logo/Title -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-bright-orange-600 mb-2">
            Welcome Back
          </h1>
          <p class="text-gray-600">Sign in to your MovieDB account</p>
        </div>

        <!-- Login Form -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <!-- Login Field (username or email) -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                [(ngModel)]="credentials.login"
                name="login"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500"
                placeholder="Enter your username or email"
                [disabled]="loading()">
            </div>

            <!-- Password Field -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                [(ngModel)]="credentials.password"
                name="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500"
                placeholder="Enter your password"
                [disabled]="loading()">
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {{ errorMessage() }}
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="!loginForm.valid || loading()"
              class="w-full bg-bright-orange-500 text-white py-3 rounded-lg font-medium hover:bg-bright-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading()) {
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
              }
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-6 text-center text-sm text-gray-600">
            Don't have an account?
            <a routerLink="/register" class="text-bright-orange-600 hover:text-bright-orange-700 font-medium">
              Create one here
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    login: '',
    password: ''
  };

  loading = signal(false);
  errorMessage = signal('');

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.credentials);
      // Success - redirect to home
      this.router.navigate(['/']);
    } catch (error: any) {
      // Handle error
      const message = error.error?.message || error.message || 'Login failed. Please try again.';
      this.errorMessage.set(message);
      this.loading.set(false);
    }
  }
}