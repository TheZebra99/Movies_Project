import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { AuthService } from '../../../core/services/auth.service';
import { MovieFilters } from '../../../shared/models/movie.model';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-8 px-8 max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-bright-orange-600 mb-8">Browse Films</h1>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <!-- Search Bar -->
        <div class="mb-4">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            placeholder="Search movies by title..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500">
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Genre Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <select
              [(ngModel)]="selectedGenre"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500">
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
              <option value="Horror">Horror</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Crime">Crime</option>
            </select>
          </div>

          <!-- Year Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input
              type="number"
              [(ngModel)]="selectedYear"
              (ngModelChange)="applyFilters()"
              placeholder="e.g. 2024"
              min="1900"
              max="2025"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500">
          </div>

          <!-- Sort By -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              [(ngModel)]="sortBy"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500">
              <option value="CreatedDate">Newest First</option>
              <option value="Rating">Rating</option>
              <option value="ReviewCount">Most Reviewed</option>
              <option value="ReleaseDate">Release Date</option>
              <option value="Title">Title (A-Z)</option>
            </select>
          </div>

          <!-- Sort Direction -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              [(ngModel)]="sortDirection"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-orange-500">
              <option value="Descending">Descending</option>
              <option value="Ascending">Ascending</option>
            </select>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <div class="mt-4">
          <button
            (click)="clearFilters()"
            class="px-4 py-2 text-bright-orange-600 hover:text-bright-orange-700 font-medium">
            Clear All Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (movieService.loading()) {
        <div class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-bright-orange-500"></div>
        </div>
      }

      <!-- Error State -->
      @else if (movieService.error()) {
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          {{ movieService.error() }}
        </div>
      }

      <!-- Movies List -->
      @else if (movieService.movies().length > 0) {
        <div class="space-y-4">
          @for (movie of movieService.movies(); track movie.id) {
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
              <div class="flex">
                <!-- Movie Poster (Clickable) -->
                <div 
                  class="w-40 flex-shrink-0 cursor-pointer"
                  (click)="navigateToMovie(movie.id)">
                  @if (movie.poster_url && !movie.poster_url.includes('example.com')) {
                    <img 
                      [src]="movie.poster_url" 
                      [alt]="movie.title"
                      class="w-full h-56 object-contain bg-gray-100">
                  } @else {
                    <div class="w-full h-56 bg-gray-200 flex flex-col items-center justify-center">
                      <span class="text-4xl block mb-1">🎬</span>
                      <span class="text-gray-500 text-xs px-2 text-center">No poster</span>
                    </div>
                  }
                </div>

                <!-- Movie Info (Clickable) -->
                <div 
                  class="flex-1 p-5 cursor-pointer"
                  (click)="navigateToMovie(movie.id)">
                  <h3 class="text-xl font-bold text-gray-800 mb-2 hover:text-bright-orange-600 transition-colors">
                    {{ movie.title }}
                  </h3>
                  
                  <!-- Rating -->
                  <div class="flex items-center space-x-3 mb-2">
                    @if (movie.average_rating) {
                      <div class="flex items-center">
                        <span class="text-xl mr-1">⭐</span>
                        <span class="text-base font-bold text-gray-700">
                          {{ movie.average_rating.toFixed(1) }}/10
                        </span>
                      </div>
                    } @else {
                      <span class="text-gray-500 text-sm">No rating yet</span>
                    }
                    <span class="text-gray-500 text-sm">
                      {{ movie.review_count }} {{ movie.review_count === 1 ? 'review' : 'reviews' }}
                    </span>
                  </div>

                  <!-- Movie Details -->
                  <div class="space-y-1 text-gray-600 text-sm mb-2">
                    <p><strong>Director:</strong> {{ movie.director }}</p>
                    <p><strong>Genre:</strong> {{ movie.genre }} • {{ movie.release_date | date:'yyyy' }} • {{ movie.runtime_minutes }} min</p>
                  </div>

                  <!-- Description -->
                  <p class="text-gray-700 text-sm line-clamp-2">{{ movie.description }}</p>
                </div>

                <!-- Add to Watchlist Button -->
                <div class="w-48 flex items-center justify-center p-4 border-l border-gray-200">
                  <button
                    (click)="addToWatchlist(movie.id, $event)"
                    class="px-6 py-3 bg-bright-orange-500 text-white rounded-lg font-medium hover:bg-bright-orange-600 transition-colors shadow-md hover:shadow-lg flex items-center space-x-2">
                    <span class="text-xl">📌</span>
                    <span>Add to Watchlist</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex justify-center items-center space-x-4">
          <button
            (click)="goToPage(currentPage() - 1)"
            [disabled]="currentPage() === 1"
            [class.opacity-50]="currentPage() === 1"
            [class.cursor-not-allowed]="currentPage() === 1"
            class="px-4 py-2 bg-bright-orange-500 text-white rounded-lg hover:bg-bright-orange-600 disabled:hover:bg-bright-orange-500 transition-colors">
            Previous
          </button>

          <span class="text-gray-700 font-medium">
            Page {{ currentPage() }} of {{ movieService.totalPages() }}
          </span>

          <button
            (click)="goToPage(currentPage() + 1)"
            [disabled]="currentPage() >= movieService.totalPages()"
            [class.opacity-50]="currentPage() >= movieService.totalPages()"
            [class.cursor-not-allowed]="currentPage() >= movieService.totalPages()"
            class="px-4 py-2 bg-bright-orange-500 text-white rounded-lg hover:bg-bright-orange-600 disabled:hover:bg-bright-orange-500 transition-colors">
            Next
          </button>
        </div>
      }

      <!-- Empty State -->
      @else {
        <div class="text-center py-20">
          <span class="text-6xl block mb-4">🎬</span>
          <h3 class="text-2xl font-bold text-gray-700 mb-2">No movies found</h3>
          <p class="text-gray-500">Try adjusting your filters</p>
        </div>
      }
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
export class MovieListComponent implements OnInit {
  movieService = inject(MovieService);
  authService = inject(AuthService);
  private router = inject(Router);

  // Filter state
  searchTerm = '';
  selectedGenre = '';
  selectedYear: number | null = null;
  sortBy = 'CreatedDate';
  sortDirection = 'Descending';
  
  currentPage = signal(1);
  pageSize = 10;

  private searchTimeout: any;

  ngOnInit() {
    this.loadMovies();
  }

  onSearchChange() {
    // Debounce search - wait 500ms after user stops typing
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadMovies();
    }, 500);
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadMovies();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedGenre = '';
    this.selectedYear = null;
    this.sortBy = 'CreatedDate';
    this.sortDirection = 'Descending';
    this.currentPage.set(1);
    this.loadMovies();
  }

  loadMovies() {
    const filters: MovieFilters = {
      search: this.searchTerm || undefined,
      genre: this.selectedGenre || undefined,
      year: this.selectedYear || undefined,
      sortBy: this.sortBy as any,
      sortDirection: this.sortDirection as any,
      page: this.currentPage(),
      pageSize: this.pageSize
    };

    // You'll need to update MovieService to handle pagination response
    this.movieService.loadMovies(filters);
  }
    
    //updated method to include pagination
    goToPage(page: number) {
    if (page >= 1 && page <= this.movieService.totalPages()) {
        this.currentPage.set(page);
        this.loadMovies();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    }

  navigateToMovie(id: number) {
    this.router.navigate(['/movies', id]);
  }

  addToWatchlist(movieId: number, event: Event) {
    event.stopPropagation(); // Prevent navigating to movie detail

    if (!this.authService.isAuthenticated()) {
      // Not logged in - redirect to login
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/browse' } 
      });
    } else {
      // TODO: Call watchlist service
      console.log('Add movie to watchlist:', movieId);
      alert('Watchlist feature coming soon!');
    }
  }
}