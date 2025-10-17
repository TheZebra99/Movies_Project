import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        <!-- Logo/Title -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-bright-orange-600 mb-2">
            Join MovieDB
          </h1>
          <p class="text-gray-600">Create your account to start reviewing</p>
        </div>

        <!-- Register Form -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <!-- Email Field -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                required
                email
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500"
                placeholder="your@email.com"
                [disabled]="loading()">
            </div>

            <!-- Username Field -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                [(ngModel)]="formData.username"
                name="username"
                required
                pattern="^[a-zA-Z0-9_.-]{3,30}$"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500"
                placeholder="Choose a username"
                [disabled]="loading()">
              <p class="text-xs text-gray-500 mt-1">3-30 characters: letters, digits, _ . - only</p>
            </div>

            <!-- Display Name Field -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Display Name (optional)
              </label>
              <input
                type="text"
                [(ngModel)]="formData.display_name"
                name="display_name"
                maxlength="60"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500"
                placeholder="How should we call you?"
                [disabled]="loading()">
            </div>

            <!-- Password Field -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                [(ngModel)]="formData.password"
                name="password"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500"
                placeholder="Create a strong password"
                [disabled]="loading()">
              <p class="text-xs text-gray-500 mt-1">
                Must be 8+ characters with uppercase, lowercase, and a digit
              </p>
            </div>

            <!-- Confirm Password Field -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500"
                placeholder="Re-enter your password"
                [disabled]="loading()">
              @if (confirmPassword && formData.password !== confirmPassword) {
                <p class="text-xs text-red-600 mt-1">Passwords do not match</p>
              }
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
              [disabled]="!registerForm.valid || formData.password !== confirmPassword || loading()"
              class="w-full bg-bright-orange-500 text-white py-3 rounded-lg font-medium hover:bg-bright-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading()) {
                <span>Creating account...</span>
              } @else {
                <span>Create Account</span>
              }
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-6 text-center text-sm text-gray-600">
            Already have an account?
            <a routerLink="/login" class="text-bright-orange-600 hover:text-bright-orange-700 font-medium">
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  formData = {
    email: '',
    username: '',
    password: '',
    display_name: ''
  };

  confirmPassword = '';
  loading = signal(false);
  errorMessage = signal('');

  async onSubmit() {
    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const registerData = {
        email: this.formData.email,
        username: this.formData.username,
        password: this.formData.password,
        display_name: this.formData.display_name || undefined
      };

      await this.authService.register(registerData);
      // Success - redirect to home
      this.router.navigate(['/']);
    } catch (error: any) {
      // Handle error
      const message = error.error?.message || error.message || 'Registration failed. Please try again.';
      this.errorMessage.set(message);
      this.loading.set(false);
    }
  }
}