import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-bright-orange-500 mt-auto">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between text-white">
          <!-- Copyright -->
          <div class="text-sm">
            © 2025 MovieDB. All rights reserved.
          </div>

          <a 
            href="https://github.com/TheZebra99" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center space-x-2 hover:text-orange-100 transition-colors">
            <span class="text-2xl">💻</span>
            <span class="font-medium">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}