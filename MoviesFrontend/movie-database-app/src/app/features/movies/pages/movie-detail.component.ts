import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../services/movie.service';
import { MoviePerson, PersonRole } from '../../../shared/models/movie.model';
import { MovieReviewsSectionComponent } from '../components/movie-reviews-section.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MovieReviewsSectionComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      @if (movieService.loading()) {
        <div class="flex justify-center items-center h-96">
          <div class="text-2xl text-orange-600">Loading movie details...</div>
        </div>
      } @else if (movieService.error()) {
        <div class="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 class="text-xl font-bold text-red-600 mb-2">Error Loading Movie</h2>
          <p class="text-red-700">{{ movieService.error() }}</p>
          <button 
            (click)="router.navigate(['/browse'])"
            class="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Back to Browse
          </button>
        </div>
      } @else if (movie()) {
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- LEFT SIDE: Main Content -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Movie Title -->
            <div>
              <h1 class="text-5xl font-bold text-gray-900 mb-2 flex items-center gap-3 flex-wrap">
                {{ movie()!.title }}

                <button
                  class="ml-1 px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow disabled:opacity-60"
                  [disabled]="addingWl() || inWatchlist()"
                  (click)="addToWatchlist($event)">
                  <ng-container *ngIf="inWatchlist(); else addTpl">✓ In Watchlist</ng-container>
                  <ng-template #addTpl>Add to Watchlist📌</ng-template>
                </button>
              </h1>
              <div class="flex items-center gap-4 text-gray-600">
                <span class="flex items-center gap-1">
                  <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ movie()!.average_rating?.toFixed(1) || 'N/A' }}/10
                </span>
                <span>{{ movie()!.review_count }} reviews</span>
                <span>{{ movie()!.runtime_minutes }} min</span>
              </div>
            </div>

            <!-- Description -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
              <p class="text-gray-700 leading-relaxed text-lg">
                {{ movie()!.description }}
              </p>
            </div>

            <!-- Media Carousel: Trailer + Screenshots -->
            @if (hasMedia()) {
              <div class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Media</h2>
                
                <div class="relative">
                  <!-- Carousel Container -->
                  <div class="overflow-hidden">
                    <div 
                      class="flex transition-transform duration-500 ease-in-out"
                      [style.transform]="'translateX(-' + (currentMediaIndex() * 100) + '%)'">
                      
                      <!-- YouTube Trailer -->
                      @if (movie()!.trailer_url) {
                        <div class="w-full flex-shrink-0">
                          <div class="aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              [src]="getYouTubeEmbedUrl(movie()!.trailer_url!)"
                              class="w-full h-full"
                              frameborder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowfullscreen>
                            </iframe>
                          </div>
                          <p class="text-center text-gray-600 mt-2">Official Trailer</p>
                        </div>
                      }

                      <!-- Screenshots -->
                      @for (screenshot of movie()!.screenshots; track screenshot) {
                        <div class="w-full flex-shrink-0">
                          <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                            <img 
                              [src]="screenshot"
                              [alt]="movie()!.title + ' screenshot'"
                              class="w-full h-full object-cover">
                          </div>
                          <p class="text-center text-gray-600 mt-2">Screenshot</p>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Carousel Navigation -->
                  @if (totalMediaItems() > 1) {
                    <div class="flex justify-center items-center gap-4 mt-4">
                      <button
                        (click)="previousMedia()"
                        class="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                        [disabled]="currentMediaIndex() === 0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <div class="flex gap-2">
                        @for (item of [].constructor(totalMediaItems()); track $index) {
                          <button
                            (click)="currentMediaIndex.set($index)"
                            [class.bg-orange-500]="currentMediaIndex() === $index"
                            [class.bg-gray-300]="currentMediaIndex() !== $index"
                            class="w-3 h-3 rounded-full transition-colors">
                          </button>
                        }
                      </div>

                      <button
                        (click)="nextMedia()"
                        class="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                        [disabled]="currentMediaIndex() === totalMediaItems() - 1">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Director Card -->
            @if (director()) {
              <div class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Director</h2>
                <a 
                  [routerLink]="['/people', director()!.person_id]"
                  class="flex items-center gap-4 hover:bg-orange-50 p-4 rounded-lg transition-colors group">
                  <img 
                    [src]="director()!.person_photo_url || 'https://via.placeholder.com/80'"
                    [alt]="director()!.person_name"
                    class="w-20 h-20 rounded-full object-cover border-2 border-orange-500">
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 group-hover:text-orange-600">
                      {{ director()!.person_name }}
                    </h3>
                    <p class="text-gray-600">Director</p>
                  </div>
                </a>
              </div>
            }

            <!-- Cast & Crew Carousel -->
            @if (cast().length > 0 || crew().length > 0) {
              <div class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Cast & Crew</h2>
                
                <div class="relative">
                  <div class="overflow-hidden">
                    <div 
                      class="flex gap-4 transition-transform duration-500 ease-in-out"
                      [style.transform]="'translateX(-' + (currentCastIndex() * 320) + 'px)'">
                      
                      @for (person of allPeople(); track person.id) {
                        <a
                          [routerLink]="['/people', person.person_id]"
                          class="flex-shrink-0 w-72 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 hover:shadow-lg transition-shadow group">
                          <div class="flex items-center gap-4">
                            <img 
                              [src]="person.person_photo_url || 'https://via.placeholder.com/60'"
                              [alt]="person.person_name"
                              class="w-16 h-16 rounded-full object-cover border-2 border-orange-400">
                            <div class="flex-1 min-w-0">
                              <h3 class="font-bold text-gray-900 group-hover:text-orange-600 truncate">
                                {{ person.person_name }}
                              </h3>
                              <p class="text-sm text-gray-600">{{ person.role }}</p>
                              @if (person.character_name) {
                                <p class="text-sm text-orange-600 italic truncate">
                                  as {{ person.character_name }}
                                </p>
                              }
                            </div>
                          </div>
                        </a>
                      }
                    </div>
                  </div>

                  <!-- Cast Carousel Navigation -->
                  @if (allPeople().length > 3) {
                    <div class="flex justify-center gap-4 mt-4">
                      <button
                        (click)="previousCast()"
                        class="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                        [disabled]="currentCastIndex() === 0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        (click)="nextCast()"
                        class="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                        [disabled]="currentCastIndex() >= (allPeople().length - 3)">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
            
            <!-- Reviews Section -->
            @if (movie()) {
              <app-movie-reviews-section [movieId]="movie()!.id" />
            }

          </div>

          <!-- RIGHT SIDE: Info Table -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <img 
                [src]="movie()!.poster_url"
                [alt]="movie()!.title + ' poster'"
                class="w-full rounded-lg mb-6 shadow-lg">
              
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Movie Info</h2>
              
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-semibold text-gray-600">Title</dt>
                  <dd class="text-gray-900">{{ movie()!.title }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-semibold text-gray-600">Release Date</dt>
                  <dd class="text-gray-900">{{ formatDate(movie()!.release_date) }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-semibold text-gray-600">Runtime</dt>
                  <dd class="text-gray-900">{{ movie()!.runtime_minutes }} minutes</dd>
                </div>

                <div>
                  <dt class="text-sm font-semibold text-gray-600">Genre</dt>
                  <dd class="text-gray-900">{{ movie()!.genre }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-semibold text-gray-600">Director</dt>
                  <dd>
                    @if (director()) {
                      <a 
                        [routerLink]="['/people', director()!.person_id]"
                        class="text-orange-600 hover:text-orange-700 font-medium">
                        {{ director()!.person_name }}
                      </a>
                    } @else {
                      <span class="text-gray-900">{{ movie()!.director }}</span>
                    }
                  </dd>
                </div>

                @if (movie()!.revenue) {
                  <div>
                    <dt class="text-sm font-semibold text-gray-600">Box Office</dt>
                    <dd class="text-gray-900">{{ formatRevenue(movie()!.revenue!) }}</dd>
                  </div>
                }

                @if (cast().length > 0) {
                  <div>
                    <dt class="text-sm font-semibold text-gray-600 mb-2">Cast</dt>
                    <dd class="space-y-1">
                      @for (actor of cast().slice(0, 5); track actor.id) {
                        <div>
                          <a 
                            [routerLink]="['/people', actor.person_id]"
                            class="text-orange-600 hover:text-orange-700">
                            {{ actor.person_name }}
                          </a>
                          @if (actor.character_name) {
                            <span class="text-gray-600 text-sm"> as {{ actor.character_name }}</span>
                          }
                        </div>
                      }
                      @if (cast().length > 5) {
                        <p class="text-sm text-gray-500 italic">
                          +{{ cast().length - 5 }} more
                        </p>
                      }
                    </dd>
                  </div>
                }
              </dl>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);

  //new
  protected api = inject(ApiService);
  protected movieId = signal<number>(0);
  protected inWatchlist = signal(false);
  protected addingWl = signal(false);

  private precheckWatchlist() {
    this.api.get<{ movie: { id: number } }[]>('/watchlist').subscribe({
      next: items => this.inWatchlist.set(
        items.some(w => w.movie?.id === this.movieId())
      ),
      error: () => this.inWatchlist.set(false)
    });
  }

  protected addToWatchlist(e?: Event) {
    e?.preventDefault();
    if (this.addingWl() || this.inWatchlist()) return;

    this.addingWl.set(true);
    this.api.post('/watchlist', { movie_id: this.movieId() }).subscribe({
      next: () => this.inWatchlist.set(true),
      error: () => alert('Failed to add to watchlist'),
      complete: () => this.addingWl.set(false)
    });
  }

  // Computed signals from the service
  protected movie = computed(() => this.movieService.currentMovie());

  // Local computed values
  protected director = computed(() => {
    const movie = this.movie();
    if (!movie?.crew) return null;
    return movie.crew.find(p => p.role === PersonRole.Director) || null;
  });

  protected cast = computed(() => {
    const movie = this.movie();
    return movie?.cast || [];
  });

  protected crew = computed(() => {
    const movie = this.movie();
    if (!movie?.crew) return [];
    return movie.crew.filter(p => p.role !== PersonRole.Director);
  });

  protected allPeople = computed(() => {
    return [...this.cast(), ...this.crew()];
  });

  protected hasMedia = computed(() => {
    const movie = this.movie();
    return !!(movie?.trailer_url || movie?.screenshots?.length);
  });

  protected totalMediaItems = computed(() => {
    const movie = this.movie();
    const trailerCount = movie?.trailer_url ? 1 : 0;
    const screenshotCount = movie?.screenshots?.length || 0;
    return trailerCount + screenshotCount;
  });

  // Carousel state
  protected currentMediaIndex = signal(0);
  protected currentCastIndex = signal(0);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.movieService.loadMovieById(id);
      this.movieId.set(id); // new
      this.precheckWatchlist();  // new
      // Reset carousel positions when loading new movie
      this.currentMediaIndex.set(0);
      this.currentCastIndex.set(0);
    });
  }

  protected getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const videoId = this.extractYouTubeVideoId(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  private extractYouTubeVideoId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  protected formatRevenue(revenue: number): string {
    if (revenue >= 1000000000) {
      return `$${(revenue / 1000000000).toFixed(2)}B`;
    } else if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(2)}M`;
    } else {
      return `$${revenue.toLocaleString()}`;
    }
  }

  // Media carousel controls
  protected nextMedia() {
    if (this.currentMediaIndex() < this.totalMediaItems() - 1) {
      this.currentMediaIndex.set(this.currentMediaIndex() + 1);
    }
  }

  protected previousMedia() {
    if (this.currentMediaIndex() > 0) {
      this.currentMediaIndex.set(this.currentMediaIndex() - 1);
    }
  }

  // Cast carousel controls
  protected nextCast() {
    const maxIndex = this.allPeople().length - 3;
    if (this.currentCastIndex() < maxIndex) {
      this.currentCastIndex.set(this.currentCastIndex() + 1);
    }
  }

  protected previousCast() {
    if (this.currentCastIndex() > 0) {
      this.currentCastIndex.set(this.currentCastIndex() - 1);
    }
  }
}