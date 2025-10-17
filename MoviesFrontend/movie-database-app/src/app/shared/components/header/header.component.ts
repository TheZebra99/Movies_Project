
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div class="bg-white p-2 rounded-lg">
              <svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-white">MovieDB</h1>
          </a>

          <!-- Navigation -->
          <nav class="flex items-center gap-6">
            <a routerLink="/about" class="text-white hover:text-orange-100 font-medium transition-colors">
              About
            </a>
            <a routerLink="/browse" class="text-white hover:text-orange-100 font-medium transition-colors">
              Browse Films
            </a>

            @if (authService.isAuthenticated()) {
              <!-- Logged In User -->
              <div class="flex items-center gap-4">
                
                <!-- Profile Link -->
                <a 
                  [routerLink]="['/users', authService.currentUser$()?.id]"
                  class="flex items-center gap-3 px-4 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all group">
                  
                  <!-- Profile Picture -->
                  <img 
                    [src]="authService.currentUser$()?.profile_pic_url || 'https://via.placeholder.com/40'"
                    [alt]="authService.currentUser$()?.display_name"
                    class="w-10 h-10 rounded-full border-2 border-white object-cover">
                  
                  <!-- Username -->
                  <span class="text-white font-medium group-hover:text-orange-100">
                    {{ authService.currentUser$()?.display_name }}
                  </span>
                </a>

                <!-- Logout Button -->
                <button
                  (click)="authService.logout()"
                  class="px-6 py-2 bg-white text-orange-600 rounded-full font-medium hover:bg-orange-50 transition-colors">
                  Log Out
                </button>
              </div>
            } @else {
              <!-- Not Logged In -->
              <a 
                routerLink="/login"
                class="px-6 py-2 bg-white text-orange-600 rounded-full font-medium hover:bg-orange-50 transition-colors">
                Log In
              </a>
            }
          </nav>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  protected authService = inject(AuthService);
}