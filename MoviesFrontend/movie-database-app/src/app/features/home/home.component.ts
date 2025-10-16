import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MovieService } from '../movies/services/movie.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-12 px-8 max-w-6xl mx-auto">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-bright-orange-600 mb-4">
          Welcome to MovieDB
        </h1>
        <p class="text-xl text-gray-700">
          Discover, review, and share your favorite films with the world
        </p>
      </div>

      <!-- Giant Search Button -->
      <div class="flex justify-center mb-16">
        <button 
          (click)="navigateToSearch()"
          class="group relative bg-bright-orange-500 text-white px-12 py-6 rounded-2xl shadow-2xl hover:shadow-bright-orange-300 hover:scale-105 transition-all duration-300">
          <div class="flex items-center space-x-3">
            <span class="text-4xl">🔍</span>
            <span class="text-2xl font-bold">Search All Movies</span>
          </div>
        </button>
      </div>

      <!-- Top Movies Carousel -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-bright-orange-600 mb-6 text-center">
          Top Rated Movies
        </h2>

        @if (movieService.loading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-bright-orange-500"></div>
          </div>
        } @else if (movieService.error()) {
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
            {{ movieService.error() }}
          </div>
        } @else if (movieService.topMovies().length > 0) {
          <!-- Carousel Container -->
          <div class="relative flex items-stretch">
            <!-- Left Arrow Bar -->
            @if (movieService.topMovies().length > 1) {
              <button 
                (click)="previousSlide()"
                class="w-16 bg-gradient-to-r from-bright-orange-500 to-bright-orange-400 hover:from-bright-orange-600 hover:to-bright-orange-500 flex items-center justify-center transition-all shadow-lg rounded-l-xl">
                <span class="text-5xl text-white leading-none">‹</span>
              </button>
            }

            <!-- Carousel Content -->
            <div class="overflow-hidden flex-1">
              <div 
                class="flex transition-transform duration-500 ease-in-out"
                [style.transform]="'translateX(-' + (currentIndex() * 100) + '%)'">
                
                @for (movie of movieService.topMovies(); track movie.id) {
                  <div class="min-w-full px-2">
                    <div class="bg-white shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
                         (click)="navigateToMovie(movie.id)">
                      <div class="flex h-72">
                        <!-- Movie Poster -->
                        <div class="w-48 flex-shrink-0">
                          @if (movie.poster_url && !movie.poster_url.includes('example.com')) {
                            <img 
                              [src]="movie.poster_url" 
                              [alt]="movie.title"
                              class="w-full h-full object-contain bg-gray-100">
                          } @else {
                            <div class="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                              <span class="text-5xl block mb-2">🎬</span>
                              <span class="text-gray-500 text-xs px-2 text-center">No poster</span>
                            </div>
                          }
                        </div>

                        <!-- Movie Info -->
                        <div class="flex-1 p-6 overflow-hidden">
                          <h3 class="text-2xl font-bold text-gray-800 mb-2 truncate">{{ movie.title }}</h3>
                          
                          <!-- Rating -->
                          <div class="flex items-center space-x-3 mb-3">
                            @if (movie.average_rating) {
                              <div class="flex items-center">
                                <span class="text-2xl mr-1">⭐</span>
                                <span class="text-lg font-bold text-gray-700">
                                  {{ movie.average_rating.toFixed(1) }}/10
                                </span>
                              </div>
                            } @else {
                              <span class="text-gray-500">No rating yet</span>
                            }
                            <span class="text-gray-500 text-sm">{{ movie.review_count }} {{ movie.review_count === 1 ? 'review' : 'reviews' }}</span>
                          </div>

                          <!-- Movie Details -->
                          <div class="space-y-1 text-gray-600 mb-3 text-sm">
                            <p><strong>Director:</strong> {{ movie.director }}</p>
                            <p><strong>Genre:</strong> {{ movie.genre }}</p>
                            <p><strong>Release:</strong> {{ movie.release_date | date:'yyyy' }}</p>
                            <p><strong>Runtime:</strong> {{ movie.runtime_minutes }} min</p>
                          </div>

                          <!-- Description -->
                          <p class="text-gray-700 text-sm line-clamp-2">{{ movie.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Right Arrow Bar -->
            @if (movieService.topMovies().length > 1) {
              <button 
                (click)="nextSlide()"
                class="w-16 bg-gradient-to-l from-bright-orange-500 to-bright-orange-400 hover:from-bright-orange-600 hover:to-bright-orange-500 flex items-center justify-center transition-all shadow-lg rounded-r-xl">
                <span class="text-5xl text-white leading-none">›</span>
              </button>
            }
          </div>

          <!-- Carousel Dots -->
          <div class="flex justify-center mt-4 space-x-2">
            @for (movie of movieService.topMovies(); track movie.id; let i = $index) {
              <button 
                (click)="goToSlide(i)"
                [class.bg-bright-orange-600]="currentIndex() === i"
                [class.bg-bright-orange-300]="currentIndex() !== i"
                class="w-2.5 h-2.5 rounded-full transition-colors hover:bg-bright-orange-500">
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class HomeComponent implements OnInit {
  movieService = inject(MovieService);
  private router = inject(Router);

  currentIndex = signal(0);

  ngOnInit() {
    this.movieService.loadTopMovies(10);
  }

  nextSlide() {
    const totalMovies = this.movieService.topMovies().length;
    if (totalMovies > 0) {
      this.currentIndex.update(current => (current + 1) % totalMovies);
    }
  }

  previousSlide() {
    const totalMovies = this.movieService.topMovies().length;
    if (totalMovies > 0) {
      this.currentIndex.update(current => (current - 1 + totalMovies) % totalMovies);
    }
  }

  goToSlide(index: number) {
    this.currentIndex.set(index);
  }

  navigateToSearch() {
    this.router.navigate(['/browse']);
  }

  navigateToMovie(id: number) {
    this.router.navigate(['/movies', id]);
  }
}