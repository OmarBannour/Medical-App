import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-root',  // Ensure correct selector here
  standalone: true,
  imports: [CommonModule, RouterModule],  // Import necessary modules and NavbarComponent
  template: `

       <router-outlet></router-outlet> <!-- Include router outlet -->
  `,
  styles: [`
  .container {
  display: flex;
  justify-content: center;  /* Aligns horizontally in the center */
  align-items: center;      /* Aligns vertically in the center */
  min-height: 100vh;        /* Ensures it takes full viewport height */
  padding: 1rem;
  background-color: #f4f4f4;
}
  `]
})
export class AppComponent {}
