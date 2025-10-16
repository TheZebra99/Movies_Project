// a review object
export interface Review {
  id: number;
  movie_id: number;
  user_id: number;
  rating: number; // from 1 to 10
  review_text: string;
  created_at: string;
  updated_at: string;

  // User info is included in the response
  username: string;
  display_name: string;
  profile_pic_url?: string;
}

// create a new review
export interface CreateReviewRequest {
  movie_id: number;
  rating: number;
  review_text: string;
}

// update an existing review
export interface UpdateReviewRequest {
  rating: number;
  review_text: string;
}

// rating statistics for a movie
export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: { [rating: number]: number }; // for example, {5: 10, 4: 5, ...}
}