import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Remove: provideZonelessChangeDetection()
    // Zone.js is enabled by default, so just don't disable it!
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};