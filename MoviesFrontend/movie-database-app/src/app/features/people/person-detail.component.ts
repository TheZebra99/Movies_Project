
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface Person {
  id: number;
  name: string;
  biography?: string;
  birth_date?: string;
  photo_url?: string;
  created_at: string;
}

interface MovieCredit {
  movie_id: number;
  movie_title: string;
  role: string;
  character_name?: string;
  release_date: string;
}

interface PersonWithMovies {
  person: Person;
  movies: MovieCredit[];
}

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      @if (loading()) {
        <div class="flex justify-center items-center h-96">
          <div class="text-2xl text-orange-600">Loading person details...</div>
        </div>
      } @else if (error()) {
        <div class="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 class="text-xl font-bold text-red-600 mb-2">Error Loading Person</h2>
          <p class="text-red-700">{{ error() }}</p>
          <button 
            (click)="router.navigate(['/browse'])"
            class="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Back to Browse
          </button>
        </div>
      } @else if (personData()) {
        <div class="max-w-6xl mx-auto">
          
          <!-- Person Header -->
          <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div class="flex flex-col md:flex-row gap-8">
              
              <!-- Photo -->
              <div class="flex-shrink-0">
                <img 
                  [src]="personData()!.person.photo_url || 'https://via.placeholder.com/300x400'"
                  [alt]="personData()!.person.name"
                  class="w-64 h-80 object-cover rounded-lg shadow-md">
              </div>

              <!-- Info -->
              <div class="flex-1">
                <h1 class="text-5xl font-bold text-gray-900 mb-4">
                  {{ personData()!.person.name }}
                </h1>

                @if (personData()!.person.birth_date) {
                  <div class="flex items-center gap-2 text-gray-600 mb-4">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Born: {{ formatDate(personData()!.person.birth_date!) }}</span>
                    <span class="text-gray-400">•</span>
                    <span>Age: {{ calculateAge(personData()!.person.birth_date!) }}</span>
                  </div>
                }

                <div class="flex items-center gap-4 mb-6">
                  <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {{ personData()!.movies.length }} Credits
                  </span>
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {{ getRoles().join(' • ') }}
                  </span>
                </div>

                @if (personData()!.person.biography) {
                  <div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-3">Biography</h2>
                    <p class="text-gray-700 leading-relaxed">
                      {{ personData()!.person.biography }}
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Filmography -->
          <div class="bg-white rounded-xl shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Filmography</h2>

            @if (personData()!.movies.length === 0) {
              <p class="text-gray-500 italic">No movies found for this person.</p>
            } @else {
              <!-- Group by role -->
              @for (roleGroup of groupMoviesByRole(); track roleGroup.role) {
                <div class="mb-8">
                  <h3 class="text-xl font-bold text-orange-600 mb-4">
                    {{ roleGroup.role }} ({{ roleGroup.movies.length }})
                  </h3>
                  
                  <div class="grid gap-4">
                    @for (movie of roleGroup.movies; track movie.movie_id) {
                      <a
                        [routerLink]="['/movies', movie.movie_id]"
                        class="flex items-center gap-4 p-4 rounded-lg hover:bg-orange-50 transition-colors group border border-gray-200">
                        
                        <div class="flex-1">
                          <h4 class="text-lg font-bold text-gray-900 group-hover:text-orange-600">
                            {{ movie.movie_title }}
                          </h4>
                          <div class="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>{{ formatYear(movie.release_date) }}</span>
                            @if (movie.character_name) {
                              <span class="text-gray-400">•</span>
                              <span class="italic">as {{ movie.character_name }}</span>
                            }
                          </div>
                        </div>

                        <svg class="w-6 h-6 text-gray-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PersonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private api = inject(ApiService);

  protected personData = signal<PersonWithMovies | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadPerson(id);
    });
  }

  private loadPerson(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.api.get<PersonWithMovies>(`/people/${id}/movies`).subscribe({
      next: (data) => {
        this.personData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load person details. Please try again later.');
        this.loading.set(false);
        console.error('Error loading person:', err);
      }
    });
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  protected formatYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  protected calculateAge(birthDateString: string): number {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  protected getRoles(): string[] {
    const movies = this.personData()?.movies || [];
    const roles = new Set(movies.map(m => m.role));
    return Array.from(roles);
  }

  protected groupMoviesByRole(): { role: string; movies: MovieCredit[] }[] {
    const movies = this.personData()?.movies || [];
    const grouped = new Map<string, MovieCredit[]>();

    movies.forEach(movie => {
      if (!grouped.has(movie.role)) {
        grouped.set(movie.role, []);
      }
      grouped.get(movie.role)!.push(movie);
    });

    // Sort movies within each role by release date (newest first)
    grouped.forEach((movieList) => {
      movieList.sort((a, b) => 
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      );
    });

    return Array.from(grouped.entries()).map(([role, movies]) => ({
      role,
      movies
    }));
  }
}