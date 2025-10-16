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
    path: '**',
    redirectTo: ''
  }
];