import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface Review {
  id: number;
  user_id: number;
  username: string;
  user_display_name: string;
  user_profile_pic_url?: string;
  movie_id: number;
  movie_title: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at?: string;
}

interface PaginatedReviews {
  reviews: Review[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Component({
  selector: 'app-movie-reviews-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-gray-900">
          Reviews
          @if (reviewData()) {
            <span class="text-gray-500 text-2xl ml-2">({{ reviewData()!.totalCount }})</span>
          }
        </h2>
      </div>

      <!-- Review form -->
      @if (auth.isAuthenticated()) {
        <div class="rounded-xl border p-4 bg-white/70 mb-6">
          <div class="flex items-center gap-3">
            <label class="font-medium">Your rating</label>
            <input
              type="range" min="1" max="10" step="1" class="w-48"
              [value]="newRating()"
              (input)="onRatingInput($event)">
            <span class="tabular-nums w-6 text-center">{{ newRating() }}</span>
          </div>
            <textarea
              rows="3" class="w-full rounded-xl border p-3 mt-3"
              placeholder="Write your thoughts…"
              [value]="newText()"
              (input)="onTextInput($event)"></textarea>
          
          <div class="flex justify-end mt-3">
            <button class="rounded-xl px-4 py-2 bg-amber-500 text-white disabled:opacity-60"
                    [disabled]="submitting() || newText().trim().length === 0"
                    (click)="submitReview()">Post Review</button>
          </div>
        </div>
      } @else {
        <div class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-700">
          <a [routerLink]="['/login']" [queryParams]="{ returnUrl: '/movies/' + movieId }" class="font-medium underline">Sign in</a>
          to write a review.
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="text-lg text-orange-600">Loading reviews...</div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error() }}</p>
        </div>
      } @else if (reviewData() && reviewData()!.reviews.length === 0) {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p class="text-gray-500 text-lg">No reviews yet. Be the first to review this movie!</p>
        </div>
      } @else if (reviewData()) {
        <!-- Reviews List -->
        <div class="space-y-6">
          @for (review of reviewData()!.reviews; track review.id) {
            <div class="border-b border-gray-200 pb-6 last:border-b-0">
              <div class="flex gap-4">
                
                <!-- Profile Picture & Username -->
                <div class="flex-shrink-0 text-center">
                  <a [routerLink]="['/users', review.user_id]" class="block">
                    <img 
                      [src]="review.user_profile_pic_url || 'https://via.placeholder.com/60'"
                      [alt]="review.user_display_name"
                      class="w-16 h-16 rounded-full object-cover border-2 border-orange-400 hover:border-orange-600 transition-colors">
                  </a>
                  <a 
                    [routerLink]="['/users', review.user_id]"
                    class="text-sm font-medium text-orange-600 hover:text-orange-700 mt-2 block">
                    {{ review.user_display_name }}
                  </a>
                </div>

                <!-- Review Content -->
                <div class="flex-1 min-w-0">
                  
                  <!-- Rating & Date -->
                  <div class="flex items-center gap-4 mb-2">
                    <!-- Star Rating -->
                    <div class="flex items-center gap-1">
                      @for (star of getStarArray(review.rating); track $index) {
                        @if (star === 'full') {
                          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        } @else if (star === 'half') {
                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <defs>
                            <linearGradient [attr.id]="'half-' + $index">
                                <stop offset="50%" stop-color="currentColor"/>
                                <stop offset="50%" stop-color="#D1D5DB"/>
                            </linearGradient>
                            </defs>
                            <path [attr.fill]="'url(#half-' + $index + ')'" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        }@else {
                          <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        }
                      }
                      <span class="ml-2 text-lg font-bold text-gray-700">{{ review.rating }}/10</span>
                    </div>

                    <!-- Date -->
                    <span class="text-sm text-gray-500">
                      {{ getTimeAgo(review.created_at) }}
                      @if (review.updated_at) {
                        <span class="italic">(edited)</span>
                      }
                    </span>
                  </div>

                  <!-- Review Text -->
                  @if (review.review_text) {
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {{ review.review_text }}
                    </p>
                  } @else {
                    <p class="text-gray-400 italic">No written review</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination Controls -->
        @if (reviewData()!.totalPages > 1) {
          <div class="flex justify-center items-center gap-4 mt-8">
            
            <!-- Previous Button -->
            <button
              (click)="loadPage(currentPage() - 1)"
              [disabled]="!reviewData()!.hasPreviousPage"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-2">
              @for (pageNum of getPageNumbers(); track pageNum) {
                @if (pageNum === '...') {
                  <span class="px-3 py-2 text-gray-500">...</span>
                } @else {
                  <button
                    (click)="loadPage(+pageNum)"
                    [class.bg-orange-500]="currentPage() === +pageNum"
                    [class.text-white]="currentPage() === +pageNum"
                    [class.bg-gray-200]="currentPage() !== +pageNum"
                    [class.text-gray-700]="currentPage() !== +pageNum"
                    class="px-4 py-2 rounded-lg font-medium hover:bg-orange-600 hover:text-white transition-colors">
                    {{ pageNum }}
                  </button>
                }
              }
            </div>

            <!-- Next Button -->
            <button
              (click)="loadPage(currentPage() + 1)"
              [disabled]="!reviewData()!.hasNextPage"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>

          <!-- Page Info -->
          <div class="text-center text-sm text-gray-500 mt-4">
            Page {{ reviewData()!.page }} of {{ reviewData()!.totalPages }} 
            ({{ reviewData()!.totalCount }} total reviews)
          </div>
        }
      }
    </div>
  `
})
export class MovieReviewsSectionComponent implements OnInit {
  @Input() movieId!: number;
  
  private api = inject(ApiService);

  // new fields
  protected auth = inject(AuthService);
  private router = inject(Router);
  protected newRating = signal(8);
  protected newText = signal('');
  protected submitting = signal(false);

  protected reviewData = signal<PaginatedReviews | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected currentPage = signal(1);
  private pageSize = 10;

  ngOnInit() {
    this.loadPage(1);
  }

  protected loadPage(page: number) {
    this.loading.set(true);
    this.error.set(null);
    this.currentPage.set(page);

    const params = {
      page,
      pageSize: this.pageSize
    };

    this.api.get<PaginatedReviews>(`/reviews/movie/${this.movieId}/paginated`, params).subscribe({
      next: (data) => {
        this.reviewData.set(data);
        this.loading.set(false);
        
        // Scroll to top of reviews section
        document.querySelector('app-movie-reviews-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      },
      error: (err) => {
        this.error.set('Failed to load reviews. Please try again later.');
        this.loading.set(false);
        console.error('Error loading reviews:', err);
      }
    });
  }

  protected getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    const fullStars = Math.floor(rating / 2); // Convert 1-10 to 0-5 scale
    const hasHalfStar = rating % 2 === 1;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push('half');
    }
    
    // Fill remaining with empty stars
    while (stars.length < 5) {
      stars.push('empty');
    }
    
    return stars;
  }

  protected getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  }

  protected getPageNumbers(): (number | string)[] {
    const totalPages = this.reviewData()?.totalPages || 0;
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }

  // new method to leave a review
  protected submitReview() {
    if (!this.auth.isAuthenticated() || this.submitting()) return;
    const text = this.newText().trim();
    const rating = this.newRating();

    this.submitting.set(true);
    this.api.post<Review>('/reviews', { movie_id: this.movieId, rating, review_text: text || null }).subscribe({
      next: (r) => {
        // Prepend into the existing list and bump count
        const data = this.reviewData();
        if (data) {
          this.reviewData.set({
            ...data,
            reviews: [r, ...data.reviews],
            totalCount: data.totalCount + 1
          });
        } else {
          this.reviewData.set({
            reviews: [r], page: 1, pageSize: 10, totalCount: 1,
            totalPages: 1, hasPreviousPage: false, hasNextPage: false
          });
        }
        this.newText.set('');
        this.newRating.set(8);
      },
      error: (err) => {
        console.error('Failed to post review', err);
        alert('Failed to post review');
      },
      complete: () => this.submitting.set(false)
    });
  }

  // two new helper methods
  protected onRatingInput(e: Event) {
    const el = e.target as HTMLInputElement | null;
    if (!el) return;
    this.newRating.set(el.valueAsNumber);
  }

  protected onTextInput(e: Event) {
    const el = e.target as HTMLTextAreaElement | null;
    if (!el) return;
    this.newText.set(el.value);
  }
}