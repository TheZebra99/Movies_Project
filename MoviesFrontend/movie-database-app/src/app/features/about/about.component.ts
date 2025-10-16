import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-12 px-8 max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-orange-600 mb-8 text-center">
        About MovieDB
      </h1>

      <div class="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <!-- Mission Section -->
        <section>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p class="text-gray-700 leading-relaxed">
            MovieDB is your ultimate destination for discovering, reviewing, and sharing your passion for cinema. 
            Built with modern technologies, we provide a seamless experience for movie enthusiasts to explore 
            an extensive database of films, read and write reviews, and connect with fellow cinephiles.
          </p>
        </section>

        <!-- Features Section -->
        <section>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Features</h2>
          <ul class="space-y-3 text-gray-700">
            <li class="flex items-start">
              <span class="text-2xl mr-3">✅</span>
              <span>Browse an extensive collection of movies with advanced search and filtering</span>
            </li>
            <li class="flex items-start">
              <span class="text-2xl mr-3">✅</span>
              <span>Read detailed information about cast, crew, and production</span>
            </li>
            <li class="flex items-start">
              <span class="text-2xl mr-3">✅</span>
              <span>Write and share your own movie reviews with the community</span>
            </li>
            <li class="flex items-start">
              <span class="text-2xl mr-3">✅</span>
              <span>Create and manage your personal watchlist</span>
            </li>
            <li class="flex items-start">
              <span class="text-2xl mr-3">✅</span>
              <span>Discover top-rated films and trending content</span>
            </li>
          </ul>
        </section>

        <!-- Technology Section -->
        <section>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Technology</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            MovieDB is built with cutting-edge technologies to ensure a fast, reliable, and enjoyable user experience:
          </p>
          <div class="grid grid-cols-2 gap-4">
            <!-- Frontend Tech -->
            <div class="bg-orange-50 rounded-lg p-4">
              <h3 class="font-bold text-orange-700 mb-2">Frontend</h3>
              <ul class="text-gray-700 text-sm space-y-1">
                <li>• Angular 18 (Zoneless)</li>
                <li>• TypeScript</li>
                <li>• TailwindCSS</li>
                <li>• Signals for State</li>
              </ul>
            </div>
            <!-- Backend Tech -->
            <div class="bg-orange-50 rounded-lg p-4">
              <h3 class="font-bold text-orange-700 mb-2">Backend</h3>
              <ul class="text-gray-700 text-sm space-y-1">
                <li>• .NET 8 Web API</li>
                <li>• PostgreSQL</li>
                <li>• Entity Framework Core</li>
                <li>• JWT Authentication</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Footer Message -->
        <section class="border-t pt-6">
          <p class="text-gray-600 text-center italic">
            Built with love for movie lovers everywhere!
          </p>
        </section>
      </div>
    </div>
  `
})
export class AboutComponent {}