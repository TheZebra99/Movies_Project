// This interface describes what a Movie object looks like
// our .NET API returns data in this shape
export interface Movie {
  id: number;
  title: string;
  description: string;
  release_date: string; // ISO date string
  director: string;
  genre: string;
  runtime_minutes: number;
  poster_url: string;
  average_rating?: number;
  review_count: number;
  revenue?: number;
  trailer_url?: string;
  screenshots?: string[];
}

// MovieDetail extends Movie, it has everything Movie has PLUS cast/crew
export interface MovieDetail extends Movie {
  cast?: MoviePerson[];
  crew?: MoviePerson[];
}

// describe a person in the cast or crew
export interface MoviePerson {
  id: number;
  person_id: number;
  person_name: string;
  person_photo_url?: string;
  role: PersonRole;
  character_name?: string; // Only for actors
}

// enum = a set of allowed string values
export enum PersonRole {
  Actor = 'Actor',
  Director = 'Director',
  Producer = 'Producer',
  Writer = 'Writer',
  Cinematographer = 'Cinematographer'
}

// When we search/filter movies, we send these parameters
export interface MovieFilters {
  search?: string;
  genre?: string;
  director?: string;
  year?: number;
  sortBy?: MovieSortBy;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
}

export enum MovieSortBy {
  CreatedDate = 'CreatedDate',
  Rating = 'Rating', // changed from AverageRating to "Rating"
  ReviewCount = 'ReviewCount',
  ReleaseDate = 'ReleaseDate',
  Title = 'Title'
}

export enum SortDirection {
  Descending = 'Descending',
  Ascending = 'Ascending'
}

// our .NET API returns paginated results in this format
export interface PaginatedResponse<T> {
  movies: T[];              // ← matches backend
  page: number;             // ← matches backend
  pageSize: number;         // ← matches backend (camelCase)
  totalCount: number;       // ← matches backend (camelCase)
  totalPages: number;       // ← matches backend (camelCase)
  hasPreviousPage: boolean; // ← matches backend (camelCase)
  hasNextPage: boolean;     // ← matches backend (camelCase)
}
