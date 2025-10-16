import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Movie, MovieDetail, MovieFilters, PaginatedResponse } from '../../../shared/models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // Private state signals
  private _movies = signal<Movie[]>([]);
  private _topMovies = signal<Movie[]>([]);
  private _currentMovie = signal<MovieDetail | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  
  // Pagination metadata
  private _totalPages = signal(1);
  private _totalCount = signal(0);

  // Public methods that return values
  movies() { return this._movies(); }
  topMovies() { return this._topMovies(); }
  currentMovie() { return this._currentMovie(); }
  loading() { return this._loading(); }
  error() { return this._error(); }
  totalPages() { return this._totalPages(); }
  totalCount() { return this._totalCount(); }

  constructor(private api: ApiService) {}

  loadTopMovies(limit: number = 10): void {
    this._loading.set(true);
    this._error.set(null);

    const params = {
      sortBy: 'Rating',
      sortDirection: 'Descending',
      pageSize: limit,
      page: 1
    };

    this.api.get<PaginatedResponse<Movie>>('/movies', params).subscribe({
      next: (response) => {
        console.log('Setting topMovies to:', response.movies);
        this._topMovies.set(response.movies);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load top movies');
        this._loading.set(false);
        console.error('Error loading top movies:', err);
      }
    });
  }

  loadMovies(filters?: MovieFilters): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.get<PaginatedResponse<Movie>>('/movies', filters).subscribe({
      next: (response) => {
        this._movies.set(response.movies);
        this._totalPages.set(response.totalPages);  // ← Store total pages
        this._totalCount.set(response.totalCount);  // ← Store total count
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load movies');
        this._loading.set(false);
        console.error('Error loading movies:', err);
      }
    });
  }

  loadMovieById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.get<MovieDetail>(`/movies/${id}`).subscribe({
      next: (movie) => {
        this._currentMovie.set(movie);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load movie details');
        this._loading.set(false);
        console.error('Error loading movie:', err);
      }
    });
  }

  clearCurrentMovie(): void {
    this._currentMovie.set(null);
  }
}