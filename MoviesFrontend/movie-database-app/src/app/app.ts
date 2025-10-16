import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-beige-100">
      <!-- header at the top -->
      <app-header></app-header>

      <!-- main content area with side borders -->
      <div class="flex-1 flex">
        <!-- left Border (~1/6 of screen width) -->
        <div class="w-1/6 bg-bright-orange-500"></div>

        <!-- center content area -->
        <main class="flex-1 bg-beige-100">
          <router-outlet></router-outlet>  <!-- Pages load here! -->
        </main>

        <!-- right Border (~1/6 of screen width) -->
        <div class="w-1/6 bg-bright-orange-500"></div>
      </div>

      <!-- footer at the bottom -->
      <app-footer></app-footer>
    </div>
  `
})
export class AppComponent {}