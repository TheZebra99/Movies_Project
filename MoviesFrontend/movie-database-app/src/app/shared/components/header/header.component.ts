import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-bright-orange-500 shadow-lg">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo, using an emoji for now -->
          <a routerLink="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div class="bg-white rounded-lg p-2">
              <span class="text-4xl">🎬</span>
            </div>
            <span class="text-2xl font-bold text-white">MovieDB</span>
          </a>

          <!-- Navigation -->
          <nav class="flex items-center space-x-6">
            <a routerLink="/about" 
               class="text-white hover:text-orange-100 font-medium transition-colors">
              About
            </a>
            <a routerLink="/browse" 
               class="text-white hover:text-orange-100 font-medium transition-colors">
              Browse Films
            </a>

            <!-- Auth Section -->
            @if (authService.isAuthenticated()) {
              <!-- User is logged in -->
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  @if (authService.currentUser$()?.profile_pic_url) {
                    <!-- User has profile picture -->
                    <img 
                      [src]="authService.currentUser$()?.profile_pic_url" 
                      [alt]="authService.currentUser$()?.username"
                      class="w-8 h-8 rounded-full border-2 border-white object-cover">
                  } @else {
                    <!-- No profile picture, show first letter of username -->
                    <div class="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center border-2 border-white">
                      <span class="text-orange-800 font-bold text-sm">
                        {{ authService.currentUser$()?.username?.charAt(0)?.toUpperCase() ?? 'U' }}
                      </span>
                    </div>
                  }
                  <span class="text-white font-medium">
                    {{ authService.currentUser$()?.username }}
                  </span>
                </div>
                <button 
                  (click)="authService.logout()"
                  class="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                  Log Out
                </button>
              </div>
            } @else {
              <!-- User is not logged in -->
              <a routerLink="/login" 
                 class="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                Sign In
              </a>
            }
          </nav>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);  // Get AuthService to check login status
}