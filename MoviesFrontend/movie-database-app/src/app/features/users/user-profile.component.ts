import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  profile_pic_url?: string;
  creation_date: string;
  role: string;
  email?: string; // Only present if viewing own profile
}

interface WatchlistItem {
  movie: {
    id: number;
    title: string;
    poster_url?: string;
    release_date: string;
    genre?: string;
    average_rating?: number;
  };
  added_at: string;
}

interface Review {
  id: number;
  movie_id: number;
  movie_title: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      @if (loading()) {
        <div class="flex justify-center items-center h-96">
          <div class="text-2xl text-orange-600">Loading profile...</div>
        </div>
      } @else if (error()) {
        <div class="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 class="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p class="text-red-700">{{ error() }}</p>
        </div>
      } @else if (userProfile()) {
        <div class="max-w-7xl mx-auto">
          
          <!-- Profile Header -->
          <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div class="flex items-start gap-6">
              <img 
                [src]="userProfile()!.profile_pic_url || 'https://via.placeholder.com/150'"
                [alt]="userProfile()!.display_name"
                class="w-32 h-32 rounded-full object-cover border-4 border-orange-400">
              
              <div class="flex-1">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">
                  {{ userProfile()!.display_name }}
                </h1>
                <p class="text-xl text-gray-600 mb-4">&#64;{{ userProfile()!.username }}</p>
                
                @if (isOwnProfile()) {
                  <p class="text-gray-600 mb-4">
                    <span class="font-semibold">Email:</span> {{ userProfile()!.email }}
                  </p>
                }
                
                <div class="flex items-center gap-4">
                  <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {{ userProfile()!.role }}
                  </span>
                  <span class="text-gray-500 text-sm">
                    Joined {{ formatDate(userProfile()!.creation_date) }}
                  </span>
                </div>

                @if (isOwnProfile()) {
                    <button
                        (click)="showEditModal()"
                        class="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Edit Profile
                    </button>

                    <button
                    class="ml-2 px-4 py-2 rounded-lg border text-amber-600 border-amber-500 hover:bg-amber-50"
                    (click)="openPwdModal()">
                    Change Password
                    </button>
                }
              </div>
            </div>
          </div>

          <!-- Watchlist Section -->
          <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-3xl font-bold text-gray-900">
                Watchlist ({{ watchlist().length }})
              </h2>
              
              @if (isOwnProfile() && watchlist().length > 0) {
                <input
                  type="text"
                  [(ngModel)]="watchlistSearch"
                  (ngModelChange)="onWatchlistSearch()"
                  placeholder="Search watchlist..."
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              }
            </div>

            @if (watchlistLoading()) {
              <div class="flex justify-center py-12">
                <div class="text-lg text-orange-600">Loading watchlist...</div>
              </div>
            } @else if (watchlist().length === 0) {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p class="text-gray-500 text-lg">No movies in watchlist yet</p>
              </div>
            } @else {
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                @for (item of watchlist(); track item.movie.id) {
                  <div class="group relative">
                    <a [routerLink]="['/movies', item.movie.id]" class="block">
                      <img 
                        [src]="item.movie.poster_url || 'https://via.placeholder.com/200x300'"
                        [alt]="item.movie.title"
                        class="w-full rounded-lg shadow-md group-hover:shadow-xl transition-shadow">
                      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity rounded-lg flex items-center justify-center">
                        <div class="opacity-0 group-hover:opacity-100 text-center text-white p-4">
                          <p class="font-bold text-lg mb-1">{{ item.movie.title }}</p>
                          <p class="text-sm">{{ formatYear(item.movie.release_date) }}</p>
                        </div>
                      </div>
                    </a>
                    
                    @if (isOwnProfile()) {
                      <button
                        (click)="removeFromWatchlist(item.movie.id)"
                        class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Reviews Section -->
          <div class="bg-white rounded-xl shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">
              Reviews ({{ reviews().length }})
            </h2>

            @if (reviewsLoading()) {
              <div class="flex justify-center py-12">
                <div class="text-lg text-orange-600">Loading reviews...</div>
              </div>
            } @else if (reviews().length === 0) {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p class="text-gray-500 text-lg">No reviews yet</p>
              </div>
            } @else {
              <div class="space-y-6">
                @for (review of reviews(); track review.id) {
                  <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-4">
                      <a [routerLink]="['/movies', review.movie_id]" class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900 hover:text-orange-600">
                          {{ review.movie_title }}
                        </h3>
                      </a>
                      
                      @if (isOwnProfile()) {
                        <div class="flex gap-2">
                            <button class="px-3 py-1 rounded bg-blue-500 text-white"
                                        (click)="startEdit(review)">
                                Edit
                            </button>
                            <button
                                (click)="deleteReview(review.id)"
                                class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                      }
                    </div>

                    @if (editingId() === review.id) {
                    <!-- in edit mode -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">
                        <label class="font-medium">Your rating</label>
                        <input
                            type="range" min="1" max="10" step="1" class="w-48"
                            [value]="editRating()"
                            (input)="onEditRatingInput($event)">
                        <span class="tabular-nums w-6 text-center">{{ editRating() }}</span>
                        </div>

                        <textarea
                        rows="3"
                        class="w-full rounded-xl border p-3"
                        [value]="editText()"
                        (input)="onEditTextInput($event)"></textarea>

                        <div class="flex gap-2 justify-end">
                        <button class="px-4 py-2 rounded-xl bg-gray-200" (click)="cancelEdit()">Cancel</button>
                        <button
                            class="px-4 py-2 rounded-xl bg-amber-500 text-white disabled:opacity-60"
                            [disabled]="savingEdit() || editText().trim().length === 0"
                            (click)="saveEdit(review.id)">
                            Save
                        </button>
                        </div>
                    </div>
                    } @else {
                    <!-- in view mode (static) -->
                    <div class="flex items-center gap-2 mb-3">
                        @for (star of getStarArray(review.rating); track $index) {
                        <svg class="w-5 h-5" [class.text-yellow-400]="star" [class.text-gray-300]="!star"
                            fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        }
                        <span class="ml-2 font-bold text-gray-700">{{ review.rating }}/10</span>
                    </div>

                    @if (review.review_text) {
                        <p class="text-gray-700 leading-relaxed">{{ review.review_text }}</p>
                    }

                    <p class="text-sm text-gray-500 mt-3">
                        {{ formatDate(review.created_at) }}
                        @if (review.updated_at) { <span class="italic"> (edited)</span> }
                    </p>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Edit Profile Modal -->
    @if (editModalOpen()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeEditModal()">
        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                [(ngModel)]="editForm.display_name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                [(ngModel)]="editForm.username"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="editForm.email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
              <input
                type="text"
                [(ngModel)]="editForm.profile_pic_url"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
            </div>
          </div>

          @if (editError()) {
            <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {{ editError() }}
            </div>
          }

          <div class="flex gap-4 mt-6">
            <button
              (click)="saveProfile()"
              [disabled]="editSaving()"
              class="flex-1 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {{ editSaving() ? 'Saving...' : 'Save Changes' }}
            </button>
            <button
              (click)="closeEditModal()"
              class="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
    
    @if (pwdModalOpen()) {
    <!-- overlay -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="closePwdModal()">
        <!-- dialog -->
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
        <h2 class="mb-4 text-2xl font-bold text-gray-900">Change Password</h2>

        <div class="space-y-4">
            <label class="block">
            <span class="text-sm font-medium text-gray-700">Current password</span>
            <input type="password"
                    class="mt-1 w-full rounded-lg border p-2"
                    [value]="pwdCurrent()" (input)="onPwdCurrent($event)"
                    autocomplete="current-password">
            </label>

            <label class="block">
            <span class="text-sm font-medium text-gray-700">New password</span>
            <input type="password"
                    class="mt-1 w-full rounded-lg border p-2"
                    [value]="pwdNew()" (input)="onPwdNew($event)"
                    autocomplete="new-password">
            </label>

            <label class="block">
            <span class="text-sm font-medium text-gray-700">Confirm new password</span>
            <input type="password"
                    class="mt-1 w-full rounded-lg border p-2"
                    [value]="pwdConfirm()" (input)="onPwdConfirm($event)"
                    autocomplete="new-password">
            </label>

            @if (pwdError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {{ pwdError() }}
            </div>
            }
        </div>

        <div class="mt-6 flex justify-end gap-2">
            <button class="rounded-lg bg-gray-100 px-4 py-2"
                    [disabled]="pwdSaving()"
                    (click)="closePwdModal()">Cancel</button>

            <button class="rounded-lg bg-amber-500 px-4 py-2 text-white disabled:opacity-60"
                    [disabled]="pwdSaving()"
                    (click)="submitPwd()">
            {{ pwdSaving() ? 'Changing…' : 'Update Password' }}
            </button>
        </div>
        </div>
    </div>
    }
  `
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  protected authService = inject(AuthService);

  protected userProfile = signal<UserProfile | null>(null);
  protected watchlist = signal<WatchlistItem[]>([]);
  protected reviews = signal<Review[]>([]);
  
  protected loading = signal(true);
  protected watchlistLoading = signal(false);
  protected reviewsLoading = signal(false);
  protected error = signal<string | null>(null);

  protected watchlistSearch = '';
  
  // Edit profile modal dialog
  protected editModalOpen = signal(false);
  protected editSaving = signal(false);
  protected editError = signal<string | null>(null);
  protected editForm = {
    display_name: '',
    username: '',
    email: '',
    profile_pic_url: ''
  };

  // new section, editing state (for editing reviews)
    editingId = signal<number | null>(null);
    editRating = signal(8);
    editText = signal('');
    savingEdit = signal(false);

    // ----- Change Password modal state dialog -----
    pwdModalOpen = signal(false);
    pwdSaving = signal(false);
    pwdError = signal<string | null>(null);

    pwdCurrent = signal('');
    pwdNew = signal('');
    pwdConfirm = signal('');


    // open/close password change dialog
    openPwdModal() {
    this.pwdError.set(null);
    this.pwdCurrent.set('');
    this.pwdNew.set('');
    this.pwdConfirm.set('');
    this.pwdModalOpen.set(true);
    }

    closePwdModal() {
    if (this.pwdSaving()) return;
    this.pwdModalOpen.set(false);
    }

    // input handlers (avoid template casts in Angular)
    onPwdCurrent(e: Event) { const el = e.target as HTMLInputElement | null; if (el) this.pwdCurrent.set(el.value); }
    onPwdNew(e: Event)     { const el = e.target as HTMLInputElement | null; if (el) this.pwdNew.set(el.value); }
    onPwdConfirm(e: Event) { const el = e.target as HTMLInputElement | null; if (el) this.pwdConfirm.set(el.value); }

    // submit
    submitPwd() {
    this.pwdError.set(null);

    const current = this.pwdCurrent().trim();
    const next    = this.pwdNew().trim();
    const confirm = this.pwdConfirm().trim();

    if (!current || !next || !confirm) { this.pwdError.set('Please fill all fields.'); return; }
    if (next.length < 8)               { this.pwdError.set('New password must be at least 8 characters.'); return; }
    if (next !== confirm)              { this.pwdError.set('New password and confirmation do not match.'); return; }

    this.pwdSaving.set(true);

    // Your Swagger shows: POST /api/auth/change-password with { current_password, new_password }
    this.api.post('/auth/change-password', {
        current_password: current,
        new_password: next
    }).subscribe({
        next: () => {
        this.pwdSaving.set(false);
        this.pwdModalOpen.set(false);
        alert('Password changed successfully');
        // optional: force re-login
        // this.auth.logout(); this.router.navigate(['/login']);
        },
        error: (err) => {
        const msg = err?.error?.message ?? 'Could not change password';
        this.pwdError.set(msg);
        this.pwdSaving.set(false);
        }
    });
    }

    // A) enter/exit edit mode
    startEdit(r: { id: number; rating: number; review_text?: string }) {
    this.editingId.set(r.id);
    this.editRating.set(r.rating);
    this.editText.set(r.review_text ?? '');
    }

    cancelEdit() {
    this.editingId.set(null);
    this.editRating.set(8);
    this.editText.set('');
    }

    // (optional but cleaner) input handlers to avoid template casts
    onEditRatingInput(e: Event) {
    const el = e.target as HTMLInputElement | null;
    if (!el) return;
    this.editRating.set(el.valueAsNumber);
    }
    onEditTextInput(e: Event) {
    const el = e.target as HTMLTextAreaElement | null;
    if (!el) return;
    this.editText.set(el.value);
    }

    // save to backend, then update the item in the list locally
    saveEdit(reviewId: number) {
    if (this.savingEdit()) return;
    this.savingEdit.set(true);

    this.api.put(`/reviews/${reviewId}`, {
        rating: this.editRating(),
        review_text: this.editText().trim() || null
    }).subscribe({
        next: (updated: any) => {
        const list = this.reviews() ?? [];          // <-- if your signal is named differently, change this
        const idx = list.findIndex(x => x.id === reviewId);
        if (idx >= 0) {
            const copy = [...list];
            copy[idx] = {
            ...copy[idx],
            rating: updated.rating,
            review_text: updated.review_text,
            updated_at: updated.updated_at
            };
            this.reviews.set(copy);
        }
        this.cancelEdit();
        },
        error: (err) => {
        console.error('Failed to update review', err);
        alert('Could not update review');
        },
        complete: () => this.savingEdit.set(false)
    });
    }

  protected isOwnProfile = computed(() => {
    const current = this.authService.currentUser$();
    const profile = this.userProfile();
    return current && profile && current.id === profile.id;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = +params['id'];
      this.loadUserProfile(userId);
    });
  }

  private loadUserProfile(userId: number) {
    this.loading.set(true);
    this.error.set(null);

    const endpoint = this.isOwnProfileById(userId) ? '/auth/profile' : `/users/${userId}/public`;

    this.api.get<UserProfile>(endpoint).subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        this.loading.set(false);
        this.loadWatchlist(userId);
        this.loadReviews(userId);
      },
      error: (err) => {
        this.error.set('Failed to load user profile');
        this.loading.set(false);
        console.error('Error loading profile:', err);
      }
    });
  }

  private isOwnProfileById(userId: number): boolean {
    return this.authService.currentUser$()?.id === userId;
  }

  private loadWatchlist(userId: number) {
    this.watchlistLoading.set(true);
    
    // If own profile, use /api/watchlist. Otherwise, use public endpoint
    const endpoint = this.isOwnProfileById(userId) ? '/watchlist' : `/watchlist/user/${userId}`;

    this.api.get<WatchlistItem[]>(endpoint).subscribe({
      next: (data) => {
        this.watchlist.set(data);
        this.watchlistLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading watchlist:', err);
        this.watchlist.set([]);
        this.watchlistLoading.set(false);
      }
    });
  }

  private loadReviews(userId: number) {
    this.reviewsLoading.set(true);

    this.api.get<Review[]>(`/reviews/user/${userId}`).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.reviewsLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.reviews.set([]);
        this.reviewsLoading.set(false);
      }
    });
  }

  protected onWatchlistSearch() {
    if (!this.userProfile()) return;

    const params = this.watchlistSearch ? { search: this.watchlistSearch } : {};
    
    this.api.get<WatchlistItem[]>('/watchlist', params).subscribe({
      next: (data) => this.watchlist.set(data),
      error: (err) => console.error('Error searching watchlist:', err)
    });
  }

  protected removeFromWatchlist(movieId: number) {
    if (!confirm('Remove this movie from your watchlist?')) return;

    this.api.delete(`/watchlist/${movieId}`).subscribe({
      next: () => {
        this.watchlist.set(this.watchlist().filter(item => item.movie.id !== movieId));
      },
      error: (err) => {
        alert('Failed to remove movie from watchlist');
        console.error('Error:', err);
      }
    });
  }

  protected editReview(review: Review) {
    // TODO: Implement edit review modal
    alert('Edit review functionality - to be implemented');
  }

  protected deleteReview(reviewId: number) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    this.api.delete(`/reviews/${reviewId}`).subscribe({
      next: () => {
        this.reviews.set(this.reviews().filter(r => r.id !== reviewId));
      },
      error: (err) => {
        alert('Failed to delete review');
        console.error('Error:', err);
      }
    });
  }

  protected showEditModal() {
    const profile = this.userProfile();
    if (!profile) return;

    this.editForm = {
      display_name: profile.display_name,
      username: profile.username,
      email: profile.email || '',
      profile_pic_url: profile.profile_pic_url || ''
    };
    this.editModalOpen.set(true);
    this.editError.set(null);
  }

  protected closeEditModal() {
    this.editModalOpen.set(false);
    this.editError.set(null);
  }

  protected saveProfile() {
    this.editSaving.set(true);
    this.editError.set(null);

    this.api.put('/auth/profile', this.editForm).subscribe({
      next: (updatedUser: any) => {
        this.userProfile.set(updatedUser);
        this.closeEditModal();
        this.editSaving.set(false);
        // Update auth service with new user data
        this.authService.currentUser$();
      },
      error: (err) => {
        this.editError.set(err.error?.error || 'Failed to update profile');
        this.editSaving.set(false);
      }
    });
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  protected formatYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  protected getStarArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    const fullStars = Math.floor(rating / 2);
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars);
    }
    return stars;
  }
}