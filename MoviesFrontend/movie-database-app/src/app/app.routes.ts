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