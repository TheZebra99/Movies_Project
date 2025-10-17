import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'browse', // new page implemented
    loadComponent: () => import('./features/movies/pages/movie-list.component').then(m => m.MovieListComponent)
  },
  {
    path: 'movies/:id',  // Movie detail page with the movie :id
    loadComponent: () => import('./features/movies/pages/movie-detail.component').then(m => m.MovieDetailComponent)
  },
  {
    path: 'people/:id', // new personal pages for actors and directors
    loadComponent: () => import('./features/people/person-detail.component')
      .then(m => m.PersonDetailComponent)
  },
  
  {
    path: 'users/:id', // new endpoint to access other people's profiles
    loadComponent: () => import('./features/users/user-profile.component')
      .then(m => m.UserProfileComponent)
  },
  {
    path: 'login',  // new new page implemented
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',  // new new page implemented
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];